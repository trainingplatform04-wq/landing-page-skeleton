import { defineField, defineType } from 'sanity'

/** Per-document SEO overrides. Empty fields fall back to the content (title, summary). */
export const seoSchema = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: 'title', title: 'Meta title', type: 'string' }),
    defineField({
      name: 'description',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      description: 'Shown in search results.',
      validation: (rule) =>
        rule.max(160).warning('Search engines cut it after about 160 characters.'),
    }),
    defineField({ name: 'image', title: 'Share image', type: 'image' }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
