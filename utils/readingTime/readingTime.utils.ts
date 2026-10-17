/** Words a reader reads per minute, the usual estimate for web articles. */
const WORDS_PER_MINUTE = 200

/** Minutes to read a text of `words` words, rounded up, at least 1. */
export function readingMinutes(words: number | null | undefined): number {
  return Math.max(1, Math.ceil((words ?? 0) / WORDS_PER_MINUTE))
}
