import { defineField, defineType } from 'sanity'

interface CtaValue {
  label?: string
  link?: { kind?: string }
}

/** An optional button: leave it empty, or fill in both the label and the link. */
export const ctaSchema = defineType({
  name: 'cta',
  title: 'Button',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'string' }),
    defineField({ name: 'link', title: 'Link', type: 'link' }),
  ],
  validation: (rule) =>
    rule.custom((value) => {
      const cta = value as CtaValue | undefined
      if (!cta?.label && !cta?.link?.kind) return true
      if (!cta.label) return 'Add a label, or empty the button'
      if (!cta.link?.kind) return 'Choose where the button links to, or empty the button'
      return true
    }),
})
