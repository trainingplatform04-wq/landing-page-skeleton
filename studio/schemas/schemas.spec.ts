import { describe, expect, it } from 'vitest'

import { PAGE_TYPES } from '../../constants/routes.constants'
import { TRANSLATED_TYPES } from '../utils/singleton/singleton.utils'
import { COLLECTION_SCHEMAS, PAGE_SCHEMAS } from './index'

describe('schema lists', () => {
  it('has one page schema per page of the site', () => {
    expect(PAGE_SCHEMAS.map(({ name }) => name).sort()).toEqual(Object.values(PAGE_TYPES).sort())
  })

  it('translates every collection editors create per language', () => {
    expect(COLLECTION_SCHEMAS.map(({ name }) => name).sort()).toEqual([...TRANSLATED_TYPES].sort())
  })
})
