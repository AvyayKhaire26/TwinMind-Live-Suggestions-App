import type { SuggestionCategory } from '../types';

interface Props {
  category: SuggestionCategory;
}

const CATEGORY_STYLES: Record<SuggestionCategory, { label: string; className: string }> = {
  'QUESTION TO ASK': { label: 'QUESTION TO ASK', className: 'badge badge-question' },
  'TALKING POINT':   { label: 'TALKING POINT',   className: 'badge badge-talking' },
  'ANSWER':          { label: 'ANSWER',           className: 'badge badge-answer' },
  'FACT CHECK':      { label: 'FACT CHECK',       className: 'badge badge-fact' },
  'CLARIFICATION':   { label: 'CLARIFICATION',    className: 'badge badge-clarif' },
  'ACTION ITEM':     { label: 'ACTION ITEM',      className: 'badge badge-action' },
};

export function CategoryBadge({ category }: Props) {
  const style = CATEGORY_STYLES[category] ?? { label: category, className: 'badge badge-action' };
  return <span className={style.className}>{style.label}</span>;
}
