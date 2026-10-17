/**
 * Minimal inline formatter for AI text: **bold** only.
 * Tolerates a half-typed "**" while text is streaming in.
 */
export function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <strong key={i++} className="font-semibold text-fg">
        {m[1]}
      </strong>,
    );
    last = m.index + m[0].length;
  }
  const rest = text.slice(last);
  const open = rest.indexOf("**");
  if (open >= 0) {
    parts.push(rest.slice(0, open));
    parts.push(
      <strong key={i++} className="font-semibold text-fg">
        {rest.slice(open + 2)}
      </strong>,
    );
  } else {
    parts.push(rest);
  }
  return <>{parts}</>;
}
