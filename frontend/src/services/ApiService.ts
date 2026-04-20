import { BACKEND_URL } from '../constants';
import type { ChatHistoryItem, Suggestion } from '../types';

// ─── API Service ──────────────────────────────────────────────────────────────
// Single Responsibility: All HTTP communication with the backend lives here.
// Stateless — receives apiKey on every call (no hardcoded keys).

export class ApiService {
  private static buildHeaders(apiKey: string): HeadersInit {
    return {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /** Sends an audio blob to Whisper via the backend and returns transcript text */
  static async transcribeAudio(apiKey: string, blob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', blob, 'chunk.webm');

    const response = await fetch(`${BACKEND_URL}/api/v1/transcribe`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Transcription failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.transcript ?? '';
  }

  /** Fetches 3 fresh suggestions from GPT-OSS-120b */
  static async getSuggestions(
    apiKey: string,
    transcript: string,
    customPrompt?: string
  ): Promise<Suggestion[]> {
    const response = await fetch(`${BACKEND_URL}/api/v1/suggestions`, {
      method: 'POST',
      headers: this.buildHeaders(apiKey),
      body: JSON.stringify({ transcript, customPrompt }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Suggestions failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.suggestions ?? [];
  }

  /**
   * Streams a chat response via SSE.
   * @param onChunk — called for each text token received
   * @param onDone  — called when stream ends
   */
  static async streamChat(
    apiKey: string,
    params: {
      transcriptContext: string;
      chatHistory: ChatHistoryItem[];
      suggestionContext?: string;
      customPrompt?: string;
    },
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (err: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/chat`, {
        method: 'POST',
        headers: this.buildHeaders(apiKey),
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Chat failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();

      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const lines = decoder.decode(value, { stream: true }).split('\n');
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') { onDone(); return; }
            try {
              const parsed = JSON.parse(payload);
              if (parsed.text) onChunk(parsed.text);
            } catch {
              // skip malformed lines
            }
          }
        }
        onDone();
      };

      await pump();
    } catch (err) {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }
}
