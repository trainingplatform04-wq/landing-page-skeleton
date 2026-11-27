import { defineField, defineType } from 'sanity'

import { ROUTE_PATHS } from '../../../constants/routes.constants'

/** Pages a link may target, shown by their German address. */
const ROUTE_OPTIONS = Object.entries(ROUTE_PATHS).map(([route, paths]) => ({
  value: route,
  title: route === 'index' ? 'Home (/)' : paths.de,
}))

const EXTERNAL_HREF = /^(https:\/\/|mailto:|tel:)/

/**
 * A link target the editor picks, never a free internal path: a page of the site or an
 * external https/mailto/tel address.
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
      name: 'href',
      title: 'Web, email or phone link',
      type: 'string',
      description: 'Starts with https://, mailto: or tel:',
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
