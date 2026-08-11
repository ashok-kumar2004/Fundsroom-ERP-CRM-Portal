import React from 'react';

interface HighlightTextProps {
  text: string | null | undefined;
  highlight: string;
  className?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({ text, highlight, className = '' }) => {
  if (!text) return <span className={className}>—</span>;
  if (!highlight || !highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const query = highlight.trim();
  // Escape regex special characters
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');

  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="search-highlight">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};
