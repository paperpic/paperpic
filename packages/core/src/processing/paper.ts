/**
 * The paper that Straighten gives its result the proportions of. `'auto'` takes them from the `aspectRatio` option, or
 * else estimates them. `'a4'` also suits A3 and A5, which share its proportions, and `'card'` is an ID or a bank card.
 *
 * @see https://paperpic.dev/reference/types#papersize
 */
export type PaperSize = 'auto' | 'a4' | 'letter' | 'card'

/** Every paper size of Straighten, in the order its panel offers them. */
export const PAPER_SIZES: readonly PaperSize[] = [
  'auto',
  'a4',
  'letter',
  'card',
]

/** The long side of each paper divided by its short side. */
const LONG_OVER_SHORT: Record<Exclude<PaperSize, 'auto'>, number> = {
  a4: 297 / 210,
  letter: 11 / 8.5,
  card: 85.6 / 53.98,
}

/**
 * The proportions of a paper, as width divided by height. It lies as the estimate says: in landscape when the estimate
 * is wider than tall, and in portrait otherwise.
 */
export function paperAspectRatio(size: Exclude<PaperSize, 'auto'>, estimate: number): number {
  return estimate > 1
    ? LONG_OVER_SHORT[size]
    : 1 / LONG_OVER_SHORT[size]
}
