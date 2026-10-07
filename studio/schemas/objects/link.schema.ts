import { defineField, defineType } from 'sanity'

import { ROUTE_PATHS } from '../../../constants/routes.constants'
import { sameLanguageFilter } from '../fields'

/** Pages a link may target: every route without a slug (offers are references). */
const ROUTE_OPTIONS = Object.keys(ROUTE_PATHS).filter((route) => !route.endsWith('-slug'))

const EXTERNAL_HREF = /^(https:\/\/|mailto:|tel:)/

/**
 * A link target the editor picks, never a free internal path: a page of the site, an
 * offer in the same language, or an external https/mailto/tel address.
 */
export const linkSchema = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'kind',
      title: 'Links to',
      type: 'string',
      options: {
        layout: 'radio',
        direction: 'horizontal',
        list: [
          { value: 'route', title: 'A page' },
          { value: 'reference', title: 'An offer' },
          { value: 'external', title: 'An external address' },
        ],
      },
    }),
    defineField({
      name: 'route',
      title: 'Page',
      type: 'string',
      options: { list: ROUTE_OPTIONS },
      hidden: ({ parent }) => parent?.kind !== 'route',
      validation: (rule) =>
        rule.custom((route, { parent }) =>
          (parent as { kind?: string })?.kind !== 'route' || route ? true : 'Pick a page',
        ),
    }),
    defineField({
      name: 'reference',
      title: 'Offer',
      type: 'reference',
      to: [{ type: 'offer' }],
      weak: true,
      options: { filter: sameLanguageFilter },
      hidden: ({ parent }) => parent?.kind !== 'reference',
      validation: (rule) =>
        rule.custom((reference, { parent }) =>
          (parent as { kind?: string })?.kind !== 'reference' || reference ? true : 'Pick an offer',
        ),
    }),
    defineField({
      name: 'href',
      title: 'Address',
      type: 'string',
      description: 'https://…, mailto:… or tel:…',
      hidden: ({ parent }) => parent?.kind !== 'external',
      validation: (rule) =>
        rule.custom((href, { parent }) => {
          if ((parent as { kind?: string })?.kind !== 'external') return true
          if (href && EXTERNAL_HREF.test(href)) return true
          return 'Use an https://, mailto: or tel: address'
        }),
    }),
  ],
})
