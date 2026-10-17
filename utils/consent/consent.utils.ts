import type { ConsentCategory } from '~/constants/consent.constants'
import type { Translation } from 'vanilla-cookieconsent'

/**
 * The "Settings" window's texts in one language, from the i18n keys `consent.*`. `t` translates
 * in that language; `links` are its privacy and imprint pages.
 */
export function consentTranslation(
  t: (key: string) => string,
  categories: ConsentCategory[],
  links: { privacy: string; imprint: string },
): Translation {
  const withStatistics = categories.includes('statistics')
  return {
    consentModal: {
      title: t('consent.title'),
      description: t(withStatistics ? 'consent.description' : 'consent.descriptionNoStatistics'),
      acceptAllBtn: t('consent.acceptAll'),
      acceptNecessaryBtn: t('consent.rejectAll'),
      showPreferencesBtn: t('consent.settings'),
      footer: `<a href="${links.privacy}">${t('footer.privacy')}</a><a href="${links.imprint}">${t('footer.imprint')}</a>`,
    },
    preferencesModal: {
      title: t('consent.settingsTitle'),
      acceptAllBtn: t('consent.acceptAll'),
      acceptNecessaryBtn: t('consent.rejectAll'),
      savePreferencesBtn: t('consent.save'),
      closeIconLabel: t('consent.close'),
      sections: [
        { description: t('consent.settingsIntro') },
        ...categories.map((category) => ({
          title: t(`consent.categories.${category}.title`),
          description: t(`consent.categories.${category}.description`),
          linkedCategory: category,
        })),
      ],
    },
  }
}

/**
 * The tiny script in the head that keeps a click on the consent window made before the app's
 * JavaScript runs: the answers wait in `window[queue]` for plugins/consent.client.ts.
 */
export function consentQueueScript(queue: string): string {
  return `window.${queue} = [];
document.addEventListener('click', function (event) {
  var button = event.target && event.target.closest && event.target.closest('[data-consent]');
  if (!button || !window.${queue}) return;
  event.preventDefault();
  window.${queue}.push(button.getAttribute('data-consent'));
}, true);`
}
