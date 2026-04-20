import { RefreshCw, Loader } from 'lucide-react';
import { SuggestionCard } from './SuggestionCard';
import type { SuggestionBatch, Suggestion } from '../types';
import { formatTime } from '../utils/export';

interface Props {
  batches: SuggestionBatch[];
  isLoading: boolean;
  secondsLeft: number;
  isRecording: boolean;
  onRefresh: () => void;
  onSuggestionClick: (suggestion: Suggestion) => void;
}

export function SuggestionsColumn({
  batches,
  isLoading,
  secondsLeft,
  isRecording,
  onRefresh,
  onSuggestionClick,
}: Props) {
  return (
    <section className="column" id="suggestions-column">
      <div className="column-header">
        <h2 className="column-title">2. LIVE SUGGESTIONS</h2>
        <span className="batch-count">{batches.length} BATCH{batches.length !== 1 ? 'ES' : ''}</span>
      </div>

      <div className="suggestions-toolbar">
        <button
          id="reload-suggestions-btn"
          className="reload-btn"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? <Loader size={14} className="spin" /> : <RefreshCw size={14} />}
          <span>{isLoading ? 'Loading…' : 'Reload suggestions'}</span>
        </button>
        {isRecording && (
          <span className="auto-refresh-timer">auto-refresh in {secondsLeft}s</span>
        )}
      </div>

      <div className="suggestions-scroll">
        {batches.length === 0 ? (
          <div className="suggestions-empty-state">
            <p className="info-box">
              On reload (or auto every ~30s), generate <strong>3 fresh suggestions</strong> from
              recent transcript context. New batch appears at the top; older batches push down. Each
              is a tappable card: a{' '}
              <span className="highlight-blue">question to ask</span>,{' '}
              <span className="highlight-purple">a talking point</span>,{' '}
              <span className="highlight-green">an answer</span>, or a{' '}
              <span className="highlight-yellow">fact-check</span>. The preview alone should already
              be useful.
            </p>
            <p className="empty-hint">Suggestions appear here once recording starts.</p>
          </div>
        ) : (
          batches.map((batch, batchIdx) => (
            <div key={batch.id} className={`batch-group ${batchIdx > 0 ? 'batch-group--old' : ''}`}>
              {batch.suggestions.map((s) => (
                <SuggestionCard key={s.id} suggestion={s} onClick={onSuggestionClick} />
              ))}
              <div className="batch-separator">
                — BATCH {batches.length - batchIdx} · {formatTime(batch.timestamp)} —
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
