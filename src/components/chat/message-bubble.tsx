"use client";

interface MessageBubbleProps {
  role: string;
  text: string;
}

const MARKDOWN_RE = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;

/** Render basic markdown: **bold**, *italic*, `code`, and line breaks */
function renderMarkdown(text: string) {
  const parts: React.ReactNode[] = [];
  const regex = new RegExp(MARKDOWN_RE.source, MARKDOWN_RE.flags);
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Push text before this match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(
        <strong key={match.index} className="font-semibold">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      // *italic*
      parts.push(<em key={match.index}>{match[3]}</em>);
    } else if (match[4]) {
      // `code`
      parts.push(
        <code
          key={match.index}
          className="rounded bg-ink/[0.06] px-1 py-0.5 font-mono text-xs"
        >
          {match[4]}
        </code>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export function MessageBubble({ role, text }: MessageBubbleProps) {
  if (!text.trim()) return null;

  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-sage px-4 py-2.5">
          <p className="font-body text-sm leading-relaxed text-cream">
            {text}
          </p>
        </div>
      </div>
    );
  }

  // Split by newlines for paragraphs, render markdown within each
  const lines = text.split("\n").filter((l) => l.trim());

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] space-y-1.5">
        {lines.map((line, i) => (
          <p key={i} className="font-body text-sm leading-relaxed text-ink">
            {renderMarkdown(line)}
          </p>
        ))}
      </div>
    </div>
  );
}
