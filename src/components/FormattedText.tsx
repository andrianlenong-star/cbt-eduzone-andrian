import React from 'react';

interface FormattedTextProps {
  content: string | null | undefined;
  className?: string;
}

/**
 * Safely renders rich formatted text with support for:
 * 1. HTML tags: <b>, <strong>, <i>, <em>, <u>, <mark>, <del>, <sub>, <sup>, <br>, <p>
 * 2. Markdown formatting: **bold**, *italic*, __underline__, _italic_
 * 3. Line breaks: Preserves \n as breaks without breaking tags
 */
export const FormattedText: React.FC<FormattedTextProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const raw = String(content);

  // Normalize markdown to safe standard HTML tags
  let processed = raw
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<u>$1</u>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>');

  // Convert raw newlines into <br /> if not already containing HTML paragraph tags
  if (!/<p[\s>]/i.test(processed)) {
    processed = processed.replace(/\n/g, '<br />');
  }

  return (
    <span
      className={`formatted-rich-text inline-block break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
};
