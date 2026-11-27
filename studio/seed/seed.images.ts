/**
 * The demo pictures of the seed: real photos chosen by context, one per place an editor would
 * put a photo. Nothing is stored in the repository: the seed downloads each photo from its URL
 * and uploads it to the Sanity dataset, where editors see and replace it. Same file → Sanity
 * keeps one asset, so re-runs reuse it.
 *
 * All from Unsplash, under the Unsplash License (free for commercial use, no attribution
 * required): https://unsplash.com/license. Each URL fixes the photo and its crop.
 */
const unsplash = (photo: string, width: number, height: number) =>
  `https://images.unsplash.com/${photo}?w=${width}&h=${height}&fit=crop&crop=faces,entropy&q=72&fm=jpg`

const IMAGES = {
  // unsplash.com/photos/two-person-inside-gym-exercising-buWcS7G1_28
  hero: unsplash('photo-1534258936925-c58bed479fcb', 1600, 900),
  // unsplash.com/photos/smiling-woman-in-front-of-window-YMYFCxWgHMw
  portrait: unsplash('photo-1536914356815-690cf1fa40e2', 800, 1000),
  // 21:9: the About page shows it full width.
  about: unsplash('photo-1571019614242-c5c5dee9f50b', 1680, 720),
  // unsplash.com/photos/woman-in-white-crew-neck-shirt-smiling-IF9TK5Uy-KI
  clientAnna: unsplash('photo-1580489944761-15a19d654956', 400, 400),
  // unsplash.com/photos/man-wearing-white-crew-neck-shirt-outdoor-selective-focus-photography-TMt3JGoVlng
  clientJonas: unsplash('photo-1564564244660-5d73c057f2d2', 400, 400),
  clientMira: unsplash('photo-1494790108377-be9c29b29330', 400, 400),
  // unsplash.com/photos/man-holding-black-barbell-hOuJYX2K5DA
  share: unsplash('photo-1517838277536-f5f99be501cd', 1200, 630),
} as const

export type SeedImage = keyof typeof IMAGES

export const SEED_IMAGES = Object.keys(IMAGES) as SeedImage[]

/** Where the seed downloads a demo picture from before uploading it to Sanity. */
export const seedImageUrl = (name: SeedImage) => IMAGES[name]
