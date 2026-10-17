/** The words of the demo content (pages, offers, testimonials, questions) in every language. */
import type { LocaleCode } from '../../constants/i18n.constants'

export const OFFERS = [
  {
    key: 'personal',
    image: 'offerPersonal',
    price: 89,
    de: {
      title: 'Personal Training',
      slug: 'personal-training',
      summary:
        '60 Minuten Eins-zu-eins-Training, abgestimmt auf Ihre Ziele, Ihren Körper und Ihren Kalender.',
      body: 'Wir starten mit einer Bewegungsanalyse und bauen daraus Ihren Plan. Jede Einheit ist vorbereitet, jede Übung erklärt.',
      points: [
        'Bewegungsanalyse in der ersten Stunde',
        'Trainingsplan für zu Hause',
        'Termine morgens, mittags und abends',
      ],
    },
    en: {
      title: 'Personal coaching',
      slug: 'personal-coaching',
      summary:
        '60 minutes of one-to-one training, matched to your goals, your body and your calendar.',
      body: 'We start with a movement assessment and build your plan from it. Every session is prepared, every exercise explained.',
      points: [
        'Movement assessment in the first session',
        'Training plan for home',
        'Sessions in the morning, at lunch and in the evening',
      ],
    },
  },
  {
    key: 'strength',
    image: 'offerStrength',
    price: 25,
    de: {
      title: 'Kraftgruppe',
      slug: 'kraftgruppe',
      summary:
        'Kleingruppe mit höchstens sechs Personen: Grundübungen sauber lernen und gemeinsam stärker werden.',
      body: 'Zweimal pro Woche trainieren wir Kniebeuge, Kreuzheben, Drücken und Ziehen, mit Technik vor Gewicht.',
      points: [
        'Maximal sechs Teilnehmende',
        'Dienstag und Donnerstag, 18:30',
        'Für Einsteiger und Fortgeschrittene',
      ],
    },
    en: {
      title: 'Strength group',
      slug: 'strength-group',
      summary:
        'A small group of six people at most: learn the main lifts properly and get stronger together.',
      body: 'Twice a week we train squats, deadlifts, presses and pulls, with technique before load.',
      points: [
        'Six participants at most',
        'Tuesday and Thursday, 6:30 pm',
        'For beginners and advanced lifters',
      ],
    },
  },
  {
    key: 'online',
    image: 'offerOnline',
    price: 149,
    de: {
      title: 'Online-Coaching',
      slug: 'online-coaching',
      summary:
        'Ihr Trainingsplan per App, wöchentliches Feedback per Video und Antworten innerhalb von 24 Stunden.',
      body: 'Für alle, die selbstständig trainieren und trotzdem jemanden an ihrer Seite wollen.',
      points: [
        'Plan in der App, jede Woche angepasst',
        'Video-Feedback zu Ihrer Technik',
        'Monatlich kündbar',
      ],
    },
    en: {
      title: 'Online coaching',
      slug: 'online-coaching',
      summary: 'Your training plan in an app, weekly video feedback and answers within 24 hours.',
      body: 'For people who train on their own and still want someone at their side.',
      points: [
        'Plan in the app, adjusted every week',
        'Video feedback on your technique',
        'Cancel monthly',
      ],
    },
  },
] as const

export const TESTIMONIALS = [
  {
    key: 'anna',
    image: 'clientAnna',
    author: 'Anna M. (Demo)',
    de: 'Nach drei Monaten trainiere ich endlich ohne Rückenschmerzen. Jede Einheit war perfekt vorbereitet.',
    en: 'After three months I finally train without back pain. Every session was perfectly prepared.',
  },
  {
    key: 'jonas',
    image: 'clientJonas',
    author: 'Jonas K. (Demo)',
    de: 'Die Kraftgruppe ist der Termin, den ich nie ausfallen lasse. Ich hebe heute doppelt so viel wie am Anfang.',
    en: 'The strength group is the one appointment I never skip. Today I lift twice as much as when I started.',
  },
  {
    key: 'mira',
    image: 'clientMira',
    author: 'Mira S. (Demo)',
    de: 'Online-Coaching neben Job und Kindern: endlich ein Plan, der in meinen Alltag passt.',
    en: 'Online coaching next to my job and kids: finally a plan that fits my everyday life.',
  },
] as const

export const FAQ = [
  {
    key: 'trial',
    de: ['Gibt es ein Probetraining?', 'Ja. Die erste Einheit ist kostenlos und unverbindlich.'],
    en: ['Is there a trial session?', 'Yes. The first session is free and without obligation.'],
  },
  {
    key: 'beginner',
    de: [
      'Ich habe noch nie trainiert. Ist das ein Problem?',
      'Nein. Wir beginnen dort, wo Sie stehen, und steigern uns Schritt für Schritt.',
    ],
    en: [
      'I have never trained before. Is that a problem?',
      'No. We start where you are and progress step by step.',
    ],
  },
  {
    key: 'cancel',
    de: [
      'Wie kurzfristig kann ich absagen?',
      'Bis 24 Stunden vorher kostenlos. Danach berechnen wir die Einheit.',
    ],
    en: [
      'How late can I cancel?',
      'Free of charge up to 24 hours before. After that the session is charged.',
    ],
  },
  {
    key: 'bring',
    de: [
      'Was muss ich mitbringen?',
      'Sportkleidung, saubere Hallenschuhe und eine Wasserflasche. Handtücher liegen bereit.',
    ],
    en: [
      'What do I need to bring?',
      'Sportswear, clean indoor shoes and a water bottle. Towels are provided.',
    ],
  },
] as const

export const COPY = {
  de: {
    footerNote: 'Demo-Inhalte für Staging. Personal Training in Berlin-Mitte.',
    seoSuffix: 'Demo Studio Berlin',
    home: {
      title: 'Startseite',
      heroTitle: 'Klüger trainieren, nicht härter',
      heroText:
        'Personal Training und Kleingruppen in Berlin-Mitte: mit Plan, mit Technik und mit Spaß.',
      heroCta: 'Angebote ansehen',
      heroAlt: 'Trainerin zeigt einer Kundin eine Kniebeuge',
      aboutTitle: 'Über mich',
      portraitAlt: 'Porträt der Trainerin',
      about:
        'Seit 2010 helfe ich Menschen, stärker und schmerzfrei zu werden. Mein Lieblingsangebot zum Einstieg:',
      aboutLink: 'Personal Training',
      highlights: [
        'Zertifizierte Trainerin (Demo)',
        'Über 500 betreute Kundinnen und Kunden',
        'Spezialisiert auf Rücken und Haltung',
      ],
      closingTitle: 'Bereit für die erste Einheit?',
      closingText:
        'Schreiben Sie mir, und wir finden einen Termin für Ihr kostenloses Probetraining.',
      closingCta: 'Kontakt aufnehmen',
      seoDescription: 'Demo: Personal Training, Kraftgruppe und Online-Coaching in Berlin-Mitte.',
    },
    about: {
      label: 'Über mich',
      title: 'Hallo, ich bin Ihre Trainerin',
      description:
        'Seit 2010 helfe ich Menschen, stärker zu werden und sich schmerzfrei zu bewegen. In meinem Studio in Berlin-Mitte dreht sich jede Einheit um Sie: Ihr Ziel, Ihr Tempo, Ihr Rücken. Keine großen Geräte, kein Druck, sondern Training, das zu Ihrem Alltag passt.',
      imageAlt: 'Trainerin im Gespräch mit einer Kundin nach dem Training',
      closingTitle: 'Bereit für die erste Einheit?',
      closingText:
        'Schreiben Sie mir, und wir finden einen Termin für Ihr kostenloses Probetraining.',
      cta: 'Probetraining anfragen',
      seoDescription:
        'Lernen Sie Ihre Trainerin kennen: Seit 2010 hilft sie Menschen in Berlin-Mitte, stärker zu werden und sich schmerzfrei zu bewegen.',
    },
    offers: {
      title: 'Angebote',
      intro: 'Drei Wege zu Ihrem Ziel. Alle beginnen mit einem kostenlosen Probetraining.',
      cta: 'Frage per E-Mail stellen',
      offerCta: 'Probetraining anfragen',
      pointsTitle: 'Das ist enthalten',
      imageAlt: 'Trainingssituation im Studio',
      price: 'Preis pro Einheit beziehungsweise Monat, inklusive Mehrwertsteuer.',
    },
    faq: {
      title: 'Häufige Fragen',
      intro: 'Alles, was Sie vor dem ersten Training wissen möchten.',
    },
    contact: {
      title: 'Kontakt',
      intro: 'Erzählen Sie mir kurz von Ihrem Ziel. Ich antworte innerhalb eines Werktags.',
      success: 'Danke für Ihre Nachricht! Ich melde mich innerhalb eines Werktags.',
    },
    imprint: {
      title: 'Impressum',
      heading: 'Angaben gemäß § 5 DDG',
      body: 'Demo Studio Berlin, Musterstraße 1, 10115 Berlin. Beispieltext: vor dem Livegang durch das echte Impressum ersetzen.',
      contact: 'E-Mail: demo@example.com, Telefon: +49 30 0000000',
    },
    privacy: {
      title: 'Datenschutzerklärung',
      description:
        'Welche Daten diese Website verarbeitet, wozu, auf welcher Rechtsgrundlage und welche Rechte Sie haben.',
      intro:
        'Beispieltext nach üblicher deutscher Praxis: vor dem Livegang an die echten Dienste anpassen und rechtlich prüfen lassen (Anwalt oder eRecht24).',
      sections: [
        {
          heading: 'Verantwortliche Stelle',
          text: [
            'Demo Studio Berlin, Musterstraße 1, 10115 Berlin, Deutschland. E-Mail: demo@example.com, Telefon: +49 30 0000000.',
          ],
        },
        {
          heading: 'Hosting',
          text: [
            'Diese Website und ihre Bilder werden von Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA, ausgeliefert. Bei jedem Aufruf verarbeitet Vercel technisch notwendige Daten: IP-Adresse, Datum und Uhrzeit, aufgerufene Adresse, Referrer und Browser. Vercel speichert diese Protokolle, um die Website sicher auszuliefern und Fehler zu finden, und löscht sie nach der Frist seines Tarifs (höchstens 30 Tage; je Kunde zu bestätigen). Ein Datenschutzbeauftragter ist nicht benannt (je Kunde zu prüfen).',
            'Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (unser Interesse an einer sicheren, schnellen Website). Mit Vercel besteht ein Vertrag zur Auftragsverarbeitung. Vercel ist unter dem EU-US Data Privacy Framework zertifiziert; die Übermittlung in die USA stützt sich auf den Angemessenheitsbeschluss der EU-Kommission (Art. 45 DSGVO).',
          ],
        },
        {
          heading: 'Content-Management (Sanity)',
          text: [
            'Die Inhalte dieser Website pflegen wir mit Sanity (Sanity AS, Norwegen, mit Sanity Inc., USA). Wenn Sie innerhalb der Website eine weitere Seite öffnen, lädt Ihr Browser deren Inhalte von den Servern von Sanity; dabei werden Ihre IP-Adresse und Browserdaten übertragen. Bilder liefert unser Hosting aus.',
            'Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (unser Interesse an einer schnellen, pflegbaren Website). Mit Sanity besteht ein Vertrag zur Auftragsverarbeitung; eine Übermittlung in die USA erfolgt auf Grundlage des EU-US Data Privacy Framework oder von Standardvertragsklauseln.',
          ],
        },
        {
          heading: 'Kontaktformular',
          text: [
            'Wenn Sie das Kontaktformular senden, übermittelt Ihr Browser Name, E-Mail-Adresse und Nachricht sowie technisch bedingt Ihre IP-Adresse und den Zeitpunkt an unseren Formulardienst mit Sitz in der EU, der uns die Nachricht per E-Mail zustellt. Vor dem Livegang hier den Dienst mit Namen und Anschrift nennen.',
            'Wir nutzen die Angaben nur, um Ihre Anfrage zu beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, wenn Ihre Anfrage einen Vertrag betrifft, sonst Art. 6 Abs. 1 lit. f DSGVO (unser Interesse, Anfragen zu beantworten). Mit dem Formulardienst besteht ein Vertrag zur Auftragsverarbeitung. Wir löschen die Daten, wenn Ihre Anfrage erledigt ist, außer gesetzliche Aufbewahrungspflichten stehen dem entgegen. Sie können uns auch direkt per E-Mail schreiben.',
          ],
        },
        {
          heading: 'Einwilligung und Cookies',
          text: [
            'Beim ersten Besuch fragt ein Fenster, was Sie erlauben: „Alle akzeptieren“, „Alle ablehnen“ oder eine Auswahl unter „Einstellungen“. Bis Sie entscheiden, lädt die Website nur, was für ihren Betrieb nötig ist: keine Statistik, keine externen Medien.',
            'Ihre Wahl speichern wir 6 Monate im Cookie cc_cookie, damit wir Sie nicht bei jedem Besuch erneut fragen; danach, oder wenn sich die eingesetzten Dienste ändern, fragen wir erneut. Rechtsgrundlage dafür sind § 25 Abs. 2 Nr. 2 TDDDG und Art. 6 Abs. 1 lit. c DSGVO (Nachweis der Einwilligung).',
            'Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft ändern oder widerrufen: über „Cookie-Einstellungen“ unten auf jeder Seite. Beim Widerruf werden Statistik und Videos sofort beendet (die Seite lädt neu) und die Statistik-Cookies gelöscht. Cookies, die YouTube auf youtube.com setzt, können wir nicht löschen: Sie entfernen sie in Ihrem Browser. Die Tabelle unter diesem Text nennt jedes Cookie mit Anbieter, Zweck und Dauer.',
          ],
        },
        {
          heading: 'Statistik (Google Tag Manager und Google Analytics 4)',
          text: [
            'Nur wenn Sie der Kategorie „Statistik“ zustimmen, laden wir Google Tag Manager und darüber Google Analytics 4. Anbieter ist Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. So sehen wir, wie die Website genutzt wird, und können sie verbessern: aufgerufene Seiten, Klicks auf Schaltflächen, gesendete Formulare (ohne deren Inhalt), gelesene Artikel und geladene Videos.',
            'Google Analytics setzt die Cookies _ga und _ga_<Kennung> mit einer zufälligen Kennung und verarbeitet Angaben zu Gerät, Browser, ungefährem Standort und Herkunft des Besuchs. Google Analytics 4 speichert keine IP-Adressen; sie dienen nur kurz der groben Standortbestimmung. Google Signals, Werbefunktionen und die Datenfreigabe an Google sind ausgeschaltet. Die Daten werden nach 14 Monaten gelöscht, die Cookies laufen nach 2 Jahren ab.',
            'Rechtsgrundlage ist Ihre Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG. Google kann Daten an Google LLC in den USA übermitteln; Google ist unter dem EU-US Data Privacy Framework zertifiziert (Art. 45 DSGVO). Mit Google besteht ein Vertrag zur Auftragsverarbeitung.',
          ],
        },
        {
          heading: 'Externe Medien (YouTube)',
          text: [
            'Videos in Artikeln binden wir über youtube-nocookie.com ein, einen Dienst von Google Ireland Limited, die dafür eigenständig verantwortlich ist (Rolle je Kunde rechtlich zu prüfen). Vor Ihrem Klick auf „Video laden“ oder Ihrer Zustimmung zur Kategorie „Externe Medien“ wird nichts von YouTube geladen. Danach erhält YouTube Ihre IP-Adresse, Browserdaten und die aufgerufene Seite und kann Cookies und Einträge im Speicher Ihres Browsers setzen, zum Beispiel VISITOR_INFO1_LIVE (6 Monate) und YSC (Sitzung).',
            'Rechtsgrundlage ist Ihre Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG. Google kann Daten an Google LLC in den USA übermitteln, auf Grundlage des EU-US Data Privacy Framework. Links zu unseren Profilen in sozialen Netzwerken sind einfache Links: Erst Ihr Klick öffnet die jeweilige Seite.',
          ],
        },
        {
          heading: 'Ihre Rechte',
          text: ['Sie haben uns gegenüber das Recht auf:'],
          list: [
            'Auskunft über Ihre Daten (Art. 15 DSGVO)',
            'Berichtigung (Art. 16 DSGVO) und Löschung (Art. 17 DSGVO)',
            'Einschränkung der Verarbeitung (Art. 18 DSGVO)',
            'Datenübertragbarkeit (Art. 20 DSGVO)',
            'Widerspruch gegen Verarbeitungen nach Art. 6 Abs. 1 lit. f DSGVO (Art. 21 DSGVO)',
            'Widerruf einer Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)',
          ],
        },
        {
          heading: 'Beschwerde bei der Aufsichtsbehörde',
          text: [
            'Sie können sich bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO). Für uns zuständig ist die Berliner Beauftragte für Datenschutz und Informationsfreiheit, Alt-Moabit 59–61, 10555 Berlin.',
          ],
        },
      ],
      linkText: 'Fragen zum Datenschutz? Schreiben Sie uns.',
      link: 'Zum Kontakt',
    },
    testimonialAlt: 'Foto der Kundin oder des Kunden',
  },
  en: {
    footerNote: 'Demo content for staging. Personal training in Berlin-Mitte.',
    seoSuffix: 'Demo Studio Berlin',
    home: {
      title: 'Home',
      heroTitle: 'Train smarter, not harder',
      heroText:
        'Personal training and small groups in Berlin-Mitte: with a plan, with technique and with fun.',
      heroCta: 'See the offers',
      heroAlt: 'Coach showing a client a squat',
      aboutTitle: 'About me',
      portraitAlt: 'Portrait of the coach',
      about:
        'Since 2010 I have been helping people get stronger and pain-free. My favourite way to start:',
      aboutLink: 'Personal coaching',
      highlights: [
        'Certified coach (demo)',
        'More than 500 clients coached',
        'Specialised in back and posture',
      ],
      closingTitle: 'Ready for your first session?',
      closingText: 'Write to me and we will find a date for your free trial session.',
      closingCta: 'Get in touch',
      seoDescription:
        'Demo: personal coaching, strength group and online coaching in Berlin-Mitte.',
    },
    about: {
      label: 'About me',
      title: "Hi, I'm your coach",
      description:
        'Since 2010 I have helped people get stronger and move without pain. In my studio in Berlin-Mitte every session is built around you: your goal, your pace, your back. No big machines, no pressure, just training that fits your life.',
      imageAlt: 'Coach talking to a client after a training session',
      closingTitle: 'Ready for your first session?',
      closingText: 'Write to me and we will find a date for your free trial session.',
      cta: 'Request a free trial',
      seoDescription:
        'Meet your coach: since 2010 helping people get stronger and move without pain, from a studio in Berlin-Mitte.',
    },
    offers: {
      title: 'Offers',
      intro: 'Three ways to your goal. All of them start with a free trial session.',
      cta: 'Ask by email',
      offerCta: 'Request a trial session',
      pointsTitle: 'What is included',
      imageAlt: 'Training in the studio',
      price: 'Price per session or month, VAT included.',
    },
    faq: { title: 'FAQ', intro: 'Everything you want to know before your first session.' },
    contact: {
      title: 'Contact',
      intro: 'Tell me briefly about your goal. I answer within one working day.',
      success: 'Thank you for your message! I will get back to you within one working day.',
    },
    imprint: {
      title: 'Imprint',
      heading: 'Information according to § 5 DDG',
      body: 'Demo Studio Berlin, Musterstraße 1, 10115 Berlin. Sample text: replace it with the real imprint before going live.',
      contact: 'Email: demo@example.com, phone: +49 30 0000000',
    },
    privacy: {
      title: 'Privacy policy',
      description:
        'Which data this website processes, why, on which legal basis, and which rights you have.',
      intro:
        'Sample text following common German practice: adapt it to the real services and have it checked (lawyer or eRecht24) before going live.',
      sections: [
        {
          heading: 'Controller',
          text: [
            'Demo Studio Berlin, Musterstraße 1, 10115 Berlin, Germany. Email: demo@example.com, phone: +49 30 0000000.',
          ],
        },
        {
          heading: 'Hosting',
          text: [
            'This website and its images are delivered by Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA. On every request Vercel processes technically necessary data: IP address, date and time, the requested address, referrer and browser. Vercel keeps these logs to deliver the website securely and to find errors, and deletes them after its plan’s retention period (at most 30 days; to be confirmed per client). No data protection officer is appointed (to be checked per client).',
            'The legal basis is Art. 6(1)(f) GDPR (our interest in a secure, fast website). We have a data processing agreement with Vercel. Vercel is certified under the EU–US Data Privacy Framework; the transfer to the USA relies on the European Commission’s adequacy decision (Art. 45 GDPR).',
          ],
        },
        {
          heading: 'Content management (Sanity)',
          text: [
            'We manage this website’s content with Sanity (Sanity AS, Norway, with Sanity Inc., USA). When you open another page within the website, your browser loads its content from Sanity’s servers, which transmits your IP address and browser data. Images are delivered by our hosting.',
            'The legal basis is Art. 6(1)(f) GDPR (our interest in a fast, maintainable website). We have a data processing agreement with Sanity; any transfer to the USA relies on the EU–US Data Privacy Framework or standard contractual clauses.',
          ],
        },
        {
          heading: 'Contact form',
          text: [
            'When you send the contact form, your browser transmits your name, email address and message, and for technical reasons your IP address and the time, to our form service based in the EU, which emails the message to us. Before going live, name the service here with its address.',
            'We use the data only to answer your request. The legal basis is Art. 6(1)(b) GDPR when your request concerns a contract, otherwise Art. 6(1)(f) GDPR (our interest in answering requests). We have a data processing agreement with the form service. We delete the data once your request is settled, unless statutory retention periods apply. You can also write to us directly by email.',
          ],
        },
        {
          heading: 'Consent and cookies',
          text: [
            'On your first visit a window asks what you allow: “Accept all”, “Reject all” or a choice under “Settings”. Until you decide, the website loads only what it needs to work: no statistics, no external media.',
            'We store your choice for 6 months in the cookie cc_cookie, so we do not ask on every visit; after that, or when the services we use change, we ask again. The legal basis is § 25(2) no. 2 TDDDG and Art. 6(1)(c) GDPR (proof of consent).',
            'You can change or withdraw your consent at any time, with effect for the future: through “Cookie settings” at the bottom of every page. When you withdraw, statistics and videos stop at once (the page reloads) and the statistics cookies are deleted. Cookies that YouTube sets on youtube.com cannot be deleted by us: you remove them in your browser. The table below this text lists every cookie with its provider, purpose and duration.',
          ],
        },
        {
          heading: 'Statistics (Google Tag Manager and Google Analytics 4)',
          text: [
            'Only if you allow the “Statistics” category do we load Google Tag Manager and, through it, Google Analytics 4. The provider is Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland. This shows us how the website is used so we can improve it: pages viewed, clicks on buttons, forms sent (without their content), articles read and videos loaded.',
            'Google Analytics sets the cookies _ga and _ga_<id> with a random identifier and processes information about your device, browser, approximate location and where the visit came from. Google Analytics 4 does not store IP addresses; they are used only briefly to derive an approximate location. Google Signals, advertising features and data sharing with Google are switched off. The data is deleted after 14 months; the cookies expire after 2 years.',
            'The legal basis is your consent under Art. 6(1)(a) GDPR and § 25(1) TDDDG. Google may transfer data to Google LLC in the USA; Google is certified under the EU–US Data Privacy Framework (Art. 45 GDPR). We have a data processing agreement with Google.',
          ],
        },
        {
          heading: 'External media (YouTube)',
          text: [
            'Videos in articles are embedded through youtube-nocookie.com, a service of Google Ireland Limited, which is responsible for it in its own right (its role to be checked legally per client). Nothing is loaded from YouTube before you click “Load video” or allow the “External media” category. After that, YouTube receives your IP address, browser data and the page you are on, and may set cookies and entries in your browser’s storage, for example VISITOR_INFO1_LIVE (6 months) and YSC (session).',
            'The legal basis is your consent under Art. 6(1)(a) GDPR and § 25(1) TDDDG. Google may transfer data to Google LLC in the USA, relying on the EU–US Data Privacy Framework. Links to our social media profiles are plain links: only your click opens the page.',
          ],
        },
        {
          heading: 'Your rights',
          text: ['You have the right to:'],
          list: [
            'access your data (Art. 15 GDPR)',
            'rectification (Art. 16 GDPR) and erasure (Art. 17 GDPR)',
            'restriction of processing (Art. 18 GDPR)',
            'data portability (Art. 20 GDPR)',
            'object to processing based on Art. 6(1)(f) GDPR (Art. 21 GDPR)',
            'withdraw a consent with effect for the future (Art. 7(3) GDPR)',
          ],
        },
        {
          heading: 'Complaints to a supervisory authority',
          text: [
            'You can lodge a complaint with a data protection supervisory authority (Art. 77 GDPR). Ours is the Berlin Commissioner for Data Protection and Freedom of Information, Alt-Moabit 59–61, 10555 Berlin, Germany.',
          ],
        },
      ],
      linkText: 'Questions about privacy? Write to us.',
      link: 'Go to contact',
    },
    testimonialAlt: 'Photo of the client',
  },
} as const satisfies Record<LocaleCode, unknown>
