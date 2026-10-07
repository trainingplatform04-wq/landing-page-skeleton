import {
  documentInternationalization,
  useDeleteTranslationAction,
} from '@sanity/document-internationalization'
import { defineConfig, type DocumentActionComponent } from 'sanity'
import { structureTool } from 'sanity/structure'

import { LOCALES } from '../constants/i18n.constants'
import { SANITY_API_VERSION } from '../constants/sanity.constants'
import { structure } from './sanity.structure'
import { schemaTypes } from './schemas/index'
import {
  filterSingletonActions,
  filterTemplates,
  isCreatableFromMenu,
  isSingletonType,
  TRANSLATED_TYPES,
} from './utils/singleton/singleton.utils'

/** The plugin's delete action (also unlinks the translation), typed for this Sanity version. */
const deleteTranslation: DocumentActionComponent = (props) => useDeleteTranslationAction(props)

function documentActions(actions: DocumentActionComponent[], schemaType: string) {
  if (isSingletonType(schemaType)) return filterSingletonActions(actions)
  if (!TRANSLATED_TYPES.includes(schemaType)) return actions

  // Translated documents: deleting one also unlinks it from its translations.
  return [...actions.filter(({ action }) => action !== 'delete'), deleteTranslation]
}

// Values are validated at build/dev time in sanity.cli.ts.
export default defineConfig({
  name: 'default',
  title: 'Landing Page',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? '',
  dataset: process.env.SANITY_STUDIO_DATASET ?? '',

  plugins: [
    structureTool({ structure }),
    // "Translations" menu in the document header: links the language versions of a
    // document for hreflang and the language switcher. Weak links let each version be
    // deleted or unpublished on its own; queries skip missing versions.
    documentInternationalization({
      supportedLanguages: LOCALES.map(({ code, name }) => ({ id: code, title: name })),
      schemaTypes: [...TRANSLATED_TYPES],
      languageField: 'language',
      weakReferences: true,
      addTemplates: false,
      bulkPublish: false,
      apiVersion: SANITY_API_VERSION,
    }),
  ],

  schema: {
    types: schemaTypes,
    templates: filterTemplates,
  },

  document: {
    actions: (actions, { schemaType }) => documentActions(actions, schemaType),
    // Singletons are opened from the desk by their fixed id, never created from a menu.
    newDocumentOptions: (options, { creationContext }) =>
      creationContext.type === 'structure'
        ? options
        : options.filter(({ templateId }) => isCreatableFromMenu(templateId)),
  },
})
