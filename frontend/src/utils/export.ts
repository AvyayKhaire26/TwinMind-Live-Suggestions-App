import type { SessionExport, TranscriptChunk, SuggestionBatch, ChatMessage } from '../types';

/** Exports the full session as a downloadable JSON file */
export function exportSession(
  transcript: TranscriptChunk[],
  suggestionBatches: SuggestionBatch[],
  chatMessages: ChatMessage[]
): void {
  const payload: SessionExport = {
    exportedAt: new Date().toISOString(),
    transcript: transcript.map((c) => ({
      timestamp: c.timestamp.toISOString(),
      text: c.text,
    })),
    suggestionBatches: suggestionBatches.map((b) => ({
      batchTimestamp: b.timestamp.toISOString(),
      suggestions: b.suggestions.map((s) => ({
        category: s.category,
        preview: s.preview,
        action: s.action,
        timestamp: s.timestamp.toISOString(),
      })),
    })),
    chat: chatMessages
      .filter((m) => !m.isStreaming)
      .map((m) => ({
        role: m.role,
        content: m.content,
        label: m.label,
        timestamp: m.timestamp.toISOString(),
      })),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `twinmind-session-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Formats a Date to "HH:MM:SS AM/PM" for the transcript display */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
