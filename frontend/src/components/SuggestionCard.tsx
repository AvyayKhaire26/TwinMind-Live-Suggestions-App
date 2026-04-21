import { CategoryBadge } from './CategoryBadge';
import type { Suggestion } from '../types';

interface Props {
  suggestion: Suggestion;
  onClick: (suggestion: Suggestion) => void;
}

export function SuggestionCard({ suggestion, onClick }: Props) {
  return (
    <button
      className="suggestion-card"
      onClick={() => onClick(suggestion)}
      title="Click for a detailed answer"
    >
      <CategoryBadge category={suggestion.category} />
      <p className="suggestion-preview">{suggestion.preview}</p>
    </button>
  );
}
