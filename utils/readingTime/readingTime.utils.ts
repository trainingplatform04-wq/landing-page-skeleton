/** Words a reader reads per minute, the usual estimate for web articles. */
const WORDS_PER_MINUTE = 200

/** A block of an article body, reduced to its text: a paragraph's spans or a block's `text`. */
export interface TextBlock {
  text?: string | null
  children?: Array<{ text?: string | null }> | null
}

const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length

/** Minutes to read an article: its words ÷ 200, rounded up, at least 1. */
export function readingMinutes(blocks: TextBlock[]): number {
  const words = blocks.reduce((total, block) => {
    const spans = (block.children ?? []).map((child) => child.text ?? '')
    return total + countWords([block.text ?? '', ...spans].join(' '))
  }, 0)
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
