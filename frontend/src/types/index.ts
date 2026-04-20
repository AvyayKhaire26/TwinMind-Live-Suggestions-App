// ─── Core Domain Types ───────────────────────────────────────────────────────

export type SuggestionCategory =
  | 'QUESTION TO ASK'
  | 'TALKING POINT'
  | 'ANSWER'
  | 'FACT CHECK'
  | 'CLARIFICATION'
  | 'ACTION ITEM';

export interface Suggestion {
  id: string;
  preview: string;
  action: string;
  category: SuggestionCategory;
  timestamp: Date;
}

export interface SuggestionBatch {
  id: string;
  suggestions: Suggestion[];
  timestamp: Date;
}

export interface TranscriptChunk {
  id: string;
  text: string;
  timestamp: Date;
}

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  label?: string;              // category label shown on user message e.g. "TALKING POINT"
  suggestionPreview?: string;  // the clicked suggestion text, used for "Detailed answer to:" prefix
  isStreaming?: boolean;
  timestamp: Date;
}

// ─── API / Settings Types ─────────────────────────────────────────────────────

export interface Settings {
  apiKey: string;
  // Prompts (editable in settings panel)
  suggestionsPrompt: string;
  chatPrompt: string;
  onClickPrompt: string;
  // Context window sizes (in transcript chunks)
  suggestionsContextChunks: number;
  chatContextChunks: number;
}

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Export Types ─────────────────────────────────────────────────────────────

export interface SessionExport {
  exportedAt: string;
  transcript: Array<{ timestamp: string; text: string }>;
  suggestionBatches: Array<{
    batchTimestamp: string;
    suggestions: Array<{ category: string; preview: string; action: string; timestamp: string }>;
  }>;
  chat: Array<{ role: string; content: string; label?: string; timestamp: string }>;
}
