import { describe, expect, it } from 'vitest'

import type { DocumentActionComponent, Template } from 'sanity'

import {
  filterSingletonActions,
  filterTemplates,
  isCreatableFromMenu,
  isSingletonType,
} from './singleton.utils'

const template = (schemaType: string): Template => ({
  id: schemaType,
  title: schemaType === 'offer' ? 'Offer' : schemaType,
  schemaType,
  value: {},
})

const action = (name: string) =>
  Object.assign(() => null, { action: name }) as DocumentActionComponent

describe('filterTemplates', () => {
  const templates = filterTemplates(
    ['offer', 'homePage', 'businessProfile', 'translation.metadata', 'faqItem'].map(template),
  )
  const ids = templates.map(({ id }) => id)

  it('replaces the defaults of translated types with one template per language', () => {
    expect(ids).not.toContain('offer')
    expect(templates.find(({ id }) => id === 'offer-en')).toMatchObject({
      title: 'Offer (English)',
      schemaType: 'offer',
      value: { language: 'en' },
    })
  })

  it('keeps no way to create a translation link by hand', () => {
    expect(ids).not.toContain('translation.metadata')
  })

  it('keeps the default template of the language-neutral business profile', () => {
    expect(ids).toContain('businessProfile')
  })
})

describe('isCreatableFromMenu', () => {
  it('hides singletons, which the desk opens by their fixed id', () => {
    expect(isCreatableFromMenu('homePage-de')).toBe(false)
    expect(isCreatableFromMenu('businessProfile')).toBe(false)
    expect(isCreatableFromMenu('offer-de')).toBe(true)
  })
})

describe('singleton actions', () => {
  it('only allow publishing, unpublishing, discarding and restoring', () => {
    const actions = [
      'publish',
      'delete',
      'duplicate',
      'unpublish',
      'discardChanges',
      'restore',
    ].map(action)

    expect(filterSingletonActions(actions).map(({ action: name }) => name)).toEqual([
      'publish',
      'unpublish',
      'discardChanges',
      'restore',
    ])
  })

  it('apply to pages, site settings and the business profile only', () => {
    expect(isSingletonType('faqPage')).toBe(true)
    expect(isSingletonType('businessProfile')).toBe(true)
    expect(isSingletonType('offer')).toBe(false)
  })
})
