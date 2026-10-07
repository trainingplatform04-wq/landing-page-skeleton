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
