export function sanitizePlainText(input: string, maxLength: number): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/\0/g, '')
    .trim()
    .slice(0, maxLength);
}
