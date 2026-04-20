import { CategoryBadge } from './CategoryBadge';
import type { Suggestion } from '../types';

const BORDER_COLORS: Record<string, string> = {
  'QUESTION TO ASK': 'var(--accent-blue)',
  'TALKING POINT': 'var(--accent-purple)',
  'ANSWER': 'var(--accent-green)',
  'FACT CHECK': 'var(--accent-yellow)',
  'CLARIFICATION': 'var(--accent-teal)',
  'ACTION ITEM': '#ff6b6b',
};

interface Props {
  suggestion: Suggestion;
  onClick: (suggestion: Suggestion) => void;
}

export function SuggestionCard({ suggestion, onClick }: Props) {
  return (
    <button
      className="suggestion-card"
      style={{ borderColor: BORDER_COLORS[suggestion.category] || 'var(--border)' }}
      onClick={() => onClick(suggestion)}
      title="Click for a detailed answer"
    >
      <CategoryBadge category={suggestion.category} />
      <p className="suggestion-preview">{suggestion.preview}</p>
    </button>
  );
}
