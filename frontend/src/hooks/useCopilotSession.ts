import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ApiService } from '../services/ApiService';
import type {
  TranscriptChunk,
  SuggestionBatch,
  Suggestion,
  ChatMessage,
  ChatHistoryItem,
  Settings,
} from '../types';

/**
 * useCopilotSession — the central ephemeral state manager for one TwinMind session.
 * All state resets on page reload as required. No persistence.
 */
export function useCopilotSession(settings: Settings) {
  const [transcript, setTranscript] = useState<TranscriptChunk[]>([]);
  const [suggestionBatches, setSuggestionBatches] = useState<SuggestionBatch[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);

  // ─── Transcript ───────────────────────────────────────────────────────────

  const addTranscriptChunk = useCallback((chunk: TranscriptChunk) => {
    setTranscript((prev) => [...prev, chunk]);
  }, []);

  // ─── Suggestions ──────────────────────────────────────────────────────────

  const buildTranscriptContext = useCallback(
    (numChunks: number): string => {
      const chunks = transcript.slice(-numChunks);
      return chunks.map((c) => c.text).join('\n');
    },
    [transcript]
  );

  const fetchSuggestions = useCallback(async () => {
    if (!settings.apiKey) { setError('API key missing. Open Settings to add it.'); return; }
    if (transcript.length === 0) { setError('No transcript yet. Start the mic first.'); return; }

    setIsFetchingSuggestions(true);
    setError(null);

    try {
      const context = buildTranscriptContext(settings.suggestionsContextChunks);
      const raw: Suggestion[] = await ApiService.getSuggestions(
        settings.apiKey,
        context,
        settings.suggestionsPrompt
      );

      const batch: SuggestionBatch = {
        id: uuidv4(),
        timestamp: new Date(),
        suggestions: raw.map((s) => ({ ...s, id: uuidv4(), timestamp: new Date() })),
      };

      setSuggestionBatches((prev) => [batch, ...prev]); // newest on top
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
    } finally {
      setIsFetchingSuggestions(false);
    }
  }, [settings, transcript, buildTranscriptContext]);

  // ─── Chat ─────────────────────────────────────────────────────────────────

  const sendChatMessage = useCallback(
    async (userText: string, suggestion?: Suggestion) => {
      if (!settings.apiKey) { setError('API key missing.'); return; }

      const label = suggestion?.category;

      // Add user message immediately
      const userMsg: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: userText,
        label,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, userMsg]);

      // Create the streaming assistant placeholder
      // If triggered by a suggestion click, immediately seed the prefix so it shows instantly
      const assistantId = uuidv4();
      streamingMessageIdRef.current = assistantId;
      const detailedPrefix = suggestion
        ? `Detailed answer to: "${suggestion.preview}"\n\n`
        : '';
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: detailedPrefix,
        suggestionPreview: suggestion?.preview,
        isStreaming: true,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
      setIsChatLoading(true);
      setError(null);

      // Build chat history for backend (exclude the streaming placeholder)
      const history: ChatHistoryItem[] = chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const customPrompt = suggestion ? settings.onClickPrompt : settings.chatPrompt;
      const transcriptContext = buildTranscriptContext(settings.chatContextChunks);

      await ApiService.streamChat(
        settings.apiKey,
        {
          transcriptContext,
          chatHistory: history,
          suggestionContext: suggestion ? `${suggestion.preview}: ${suggestion.action}` : undefined,
          customPrompt,
        },
        // onChunk
        (text) => {
          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + text } : m
            )
          );
        },
        // onDone
        () => {
          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, isStreaming: false } : m
            )
          );
          setIsChatLoading(false);
          streamingMessageIdRef.current = null;
        },
        // onError
        (err) => {
          setError(err.message);
          setChatMessages((prev) => prev.filter((m) => m.id !== assistantId));
          setIsChatLoading(false);
        }
      );
    },
    [settings, chatMessages, buildTranscriptContext]
  );

  return {
    transcript,
    suggestionBatches,
    chatMessages,
    isFetchingSuggestions,
    isChatLoading,
    error,
    setError,
    addTranscriptChunk,
    fetchSuggestions,
    sendChatMessage,
  };
}
