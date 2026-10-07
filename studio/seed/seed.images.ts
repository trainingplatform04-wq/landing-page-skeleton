/**
 * The demo pictures of the seed: generated SVG placeholders (no stock photos, no licences),
 * one per place an editor would put a photo. Same name → same file → Sanity keeps one asset.
 */
const IMAGES = {
  hero: { label: 'Hero', width: 1600, height: 900, hue: 150 },
  portrait: { label: 'Portrait', width: 800, height: 1000, hue: 200 },
  offerPersonal: { label: 'Personal Training', width: 1200, height: 800, hue: 20 },
  offerStrength: { label: 'Kraftgruppe · Strength group', width: 1200, height: 800, hue: 280 },
  offerOnline: { label: 'Online-Coaching', width: 1200, height: 800, hue: 230 },
  clientAnna: { label: 'A', width: 400, height: 400, hue: 330 },
  clientJonas: { label: 'J', width: 400, height: 400, hue: 40 },
  clientMira: { label: 'M', width: 400, height: 400, hue: 180 },
  training: { label: 'Training', width: 1200, height: 700, hue: 100 },
  share: { label: 'Demo Studio Berlin', width: 1200, height: 630, hue: 160 },
} as const

export type SeedImage = keyof typeof IMAGES

export const SEED_IMAGES = Object.keys(IMAGES) as SeedImage[]

/** The SVG file of a demo picture, labelled "DEMO" so nobody mistakes it for real content. */
export function seedImageFile(name: SeedImage) {
  const { label, width, height, hue } = IMAGES[name]
  const size = Math.round(Math.min(width, height) / 9)
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">`,
    `<stop offset="0" stop-color="hsl(${hue} 55% 42%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360} 60% 24%)"/>`,
    `</linearGradient></defs>`,
    `<rect width="100%" height="100%" fill="url(#g)"/>`,
    `<text x="50%" y="50%" fill="#fff" font-family="system-ui, sans-serif" font-size="${size}" font-weight="700" text-anchor="middle" dominant-baseline="middle">${label}</text>`,
    `<text x="50%" y="${height - size}" fill="#fff" fill-opacity="0.7" font-family="system-ui, sans-serif" font-size="${Math.round(size / 2.5)}" letter-spacing="4" text-anchor="middle">DEMO</text>`,
    `</svg>`,
  ].join('')
  return { filename: `seed-${name}.svg`, svg }
}
