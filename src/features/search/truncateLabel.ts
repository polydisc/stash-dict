export function truncateLabel(text: string, max = 6): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
