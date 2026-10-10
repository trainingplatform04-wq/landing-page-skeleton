/**
 * The demo pictures of the seed: real photos chosen by context, one per place an editor would
 * put a photo. Nothing is stored in the repository: the seed downloads each photo from its URL
 * and uploads it to the Sanity dataset, where editors see and replace it. Same file → Sanity
 * keeps one asset, so re-runs reuse it. When a page gets its approved Lovable design, its photos
 * replace these (docs/design/DESIGN_WORKFLOW.md §10).
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
  // unsplash.com/photos/woman-kneeling-beside-man-R0y_bEUjiOM
  offerPersonal: unsplash('photo-1571019614242-c5c5dee9f50b', 1200, 800),
  // unsplash.com/photos/three-person-lifting-barbels-Lx_GDv7VA9M
  offerStrength: unsplash('photo-1554284126-aa88f22d8b74', 1200, 800),
  // unsplash.com/photos/woman-in-black-t-shirt-and-black-pants-lying-on-black-yoga-mat-qa1wvrlWCio
  offerOnline: unsplash('photo-1586439496903-c96e9f18f212', 1200, 800),
  // unsplash.com/photos/woman-in-white-crew-neck-shirt-smiling-IF9TK5Uy-KI
  clientAnna: unsplash('photo-1580489944761-15a19d654956', 400, 400),
  // unsplash.com/photos/man-wearing-white-crew-neck-shirt-outdoor-selective-focus-photography-TMt3JGoVlng
  clientJonas: unsplash('photo-1564564244660-5d73c057f2d2', 400, 400),
  clientMira: unsplash('photo-1494790108377-be9c29b29330', 400, 400),
  // unsplash.com/photos/people-performing-box-jumps-workout-wy_L8W0zcpI
  training: unsplash('photo-1536922246289-88c42f957773', 1200, 700),
  // unsplash.com/photos/man-holding-black-barbell-hOuJYX2K5DA
  share: unsplash('photo-1517838277536-f5f99be501cd', 1200, 630),
  // Magazine (docs/design/changes/0001-magazine): covers 16:10 and author portraits, chosen to
  // match the prototype's picture descriptions.
  postStrength: unsplash('photo-1517836357463-d25dfeac3438', 1600, 1000),
  postProtein: unsplash('photo-1546069901-ba9599a7e63c', 1600, 1000),
  postMotivation: unsplash('photo-1594381898411-846e7d193883', 1600, 1000),
  postMobility: unsplash('photo-1518611012118-696072aa579a', 1600, 1000),
  postEating: unsplash('photo-1490645935967-10de6ba17061', 1600, 1000),
  postSleep: unsplash('photo-1520206183501-b80df61043c2', 1600, 1000),
  authorLena: unsplash('photo-1438761681033-6461ffad8d80', 400, 400),
  authorJonas: unsplash('photo-1500648767791-00dcc994a43e', 400, 400),
  authorMira: unsplash('photo-1544005313-94ddf0286df2', 400, 400),
} as const

export type SeedImage = keyof typeof IMAGES

export const SEED_IMAGES = Object.keys(IMAGES) as SeedImage[]

/** Where the seed downloads a demo picture from before uploading it to Sanity. */
export const seedImageUrl = (name: SeedImage) => IMAGES[name]
