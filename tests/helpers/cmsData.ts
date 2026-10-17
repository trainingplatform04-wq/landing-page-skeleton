/**
 * CMS data shaped like the answer of the real queries, for composable specs. groqd checks
 * every answer, so a field the query asks for must be present (`null` when empty).
 */

export const link = (route: string) => ({
  kind: 'route',
  route,
  href: null,
  offerSlug: null,
  offerLanguage: null,
})

export const cta = (label: string, route: string) => ({ label, link: link(route) })

/** A picture as `imageFragment` answers it: no crop, no focal point. */
export const image = (url: string, alt: string) => ({
  alt,
  url,
  dimensions: null,
  crop: null,
  hotspot: null,
})

/** A 1000×500 picture the editor cropped to its middle square: `toImage` cuts `?rect=250,0,500,500`. */
export const croppedImage = (url: string, alt: string) => ({
  ...image(url, alt),
  dimensions: { width: 1000, height: 500 },
  crop: { top: 0, bottom: 0, left: 0.25, right: 0.25 },
})

export const closing = (
  title: string | null,
  text: string | null,
  button: ReturnType<typeof cta> | null,
) => ({ title, text, cta: button })

export const noSeo = { title: null, description: null, noIndex: null, image: null }

export const offerCard = (id: string, title: string, slug: string) => ({
  id,
  title,
  summary: `${title} summary`,
  slug,
  image: null,
  price: null,
})

export const business = {
  name: 'Landing Page',
  email: 'hi@example.com',
  phone: null,
  address: null,
  socials: null,
}

export const text = (value: string) => [
  {
    _type: 'block',
    _key: 'b1',
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: 's1', text: value, marks: [] }],
  },
]
