/**
 * The magazine's demo content: the page, its categories, authors and articles in every language.
 * Every article uses every block of the article page (takeaways, questions, coach tip, pull
 * quote, video, figure), so each one shows the whole design.
 */
import type { LocaleCode } from '../../constants/i18n.constants'
import type { SeedImage } from './seed.images'

/** One part of an article body: a paragraph, a heading, a list or a magazine block. */
export type BodyPart =
  | { p: string }
  | { h2: string }
  | { ul: string[] }
  | { ol: string[] }
  | { tip: string }
  | { quote: string; attribution: string }
  | { video: string; title: string }
  | { figure: SeedImage; alt: string; caption: string }

/** What a translated article says: its texts, plus the optional takeaways and questions. */
export interface PostCopy {
  title: string
  slug: string
  excerpt: string
  imageAlt: string
  body: BodyPart[]
  keyTakeaways?: string[]
  faq?: Array<{ question: string; answer: string }>
}

export const MAGAZINE_PAGE = {
  de: {
    label: 'Magazin',
    title: 'Wissen, das dich weiterbringt.',
    intro: 'Training, Ernährung und Mindset: Artikel von unseren Coaches, fürs echte Leben.',
    closingTitle: 'Bereit für den ersten Schritt?',
    closingText: 'Probier es aus: Das erste Training mit einem Coach ist kostenlos.',
    cta: 'Kostenloses Probetraining',
    seoDescription: 'Artikel zu Training, Ernährung und Mindset von unseren Coaches.',
  },
  en: {
    label: 'Magazine',
    title: 'Know-how that moves you forward.',
    intro: 'Training, nutrition and mindset: articles from our coaches, for real life.',
    closingTitle: 'Ready for the first step?',
    closingText: 'Try it: your first session with a coach is free.',
    cta: 'Request a free trial',
    seoDescription: 'Articles on training, nutrition and mindset from our coaches.',
  },
} as const satisfies Record<LocaleCode, unknown>

export const CATEGORIES = [
  {
    key: 'training',
    order: 1,
    de: { title: 'Training', slug: 'training' },
    en: { title: 'Training', slug: 'training' },
  },
  {
    key: 'nutrition',
    order: 2,
    de: { title: 'Ernährung', slug: 'nutrition' },
    en: { title: 'Nutrition', slug: 'nutrition' },
  },
  {
    key: 'mindset',
    order: 3,
    de: { title: 'Mindset', slug: 'mindset' },
    en: { title: 'Mindset', slug: 'mindset' },
  },
] as const

export const AUTHORS = [
  {
    key: 'lena',
    name: 'Lena Hoffmann',
    image: 'authorLena',
    de: {
      role: 'Head Coach, Kraft & Technik',
      bio: 'Lena coacht seit zwölf Jahren in Berlin und bringt Menschen jeden Alters sicher unter die Hantel.',
    },
    en: {
      role: 'Head coach, strength & technique',
      bio: 'Lena has coached in Berlin for twelve years and gets people of every age safely under the bar.',
    },
  },
  {
    key: 'jonas',
    name: 'Jonas Weber',
    image: 'authorJonas',
    de: {
      role: 'Ernährungscoach',
      bio: 'Jonas ist Ökotrophologe und glaubt an Essen, das schmeckt und in einen vollen Kalender passt.',
    },
    en: {
      role: 'Nutrition coach',
      bio: 'Jonas is a nutrition scientist who believes in food that tastes good and fits a busy calendar.',
    },
  },
  {
    key: 'mira',
    name: 'Mira Schulz',
    image: 'authorMira',
    de: {
      role: 'Coach für Mindset & Gewohnheiten',
      bio: 'Mira verbindet Training mit Verhaltenspsychologie, damit gute Vorsätze zu Gewohnheiten werden.',
    },
    en: {
      role: 'Mindset & habits coach',
      bio: 'Mira combines training with behavioural psychology so good intentions become habits.',
    },
  },
] as const

export const POSTS: Array<
  {
    key: string
    category: (typeof CATEGORIES)[number]['key']
    author: (typeof AUTHORS)[number]['key']
    publishedAt: string
    image: SeedImage
  } & Record<LocaleCode, PostCopy>
> = [
  {
    key: 'strength-after-40',
    category: 'training',
    author: 'lena',
    publishedAt: '2026-09-28T08:00:00+02:00',
    image: 'postStrength',
    de: {
      title: 'Krafttraining ab 40: So startest du sicher',
      slug: 'krafttraining-ab-40',
      excerpt:
        'Muskeln reagieren in jedem Alter auf Training. So legst du in vier Wochen ein sicheres Fundament.',
      imageAlt: 'Eine Person hebt eine Langhantel im Studio',
      keyTakeaways: [
        'Muskeln reagieren in jedem Alter auf Training.',
        'Starte mit zwei Ganzkörper-Einheiten pro Woche.',
        'Lerne die Technik, bevor du das Gewicht steigerst.',
        'Steigere in kleinen Schritten von ein bis zwei Kilo.',
      ],
      faq: [
        {
          question: 'Ist Krafttraining ab 40 gefährlich?',
          answer:
            'Nein. Mit sauberer Technik und langsamer Steigerung ist es eine der sichersten Trainingsformen.',
        },
        {
          question: 'Wie oft sollte ich trainieren?',
          answer:
            'Zwei Ganzkörper-Einheiten pro Woche reichen für den Anfang. Nach vier Wochen kannst du eine dritte ergänzen.',
        },
        {
          question: 'Brauche ich ein Fitnessstudio?',
          answer:
            'Für den Start nicht. Viele Grundübungen gehen mit Kurzhanteln oder dem eigenen Körpergewicht.',
        },
        {
          question: 'Was, wenn mir etwas wehtut?',
          answer: 'Hör auf und frag einen Coach. Schmerz ist kein Zeichen von Fortschritt.',
        },
      ],
      body: [
        {
          p: 'Mit 40 ist es nicht zu spät für Krafttraining. Es ist genau der richtige Zeitpunkt. Muskeln, Knochen und Gelenke reagieren in jedem Alter auf Training, wenn du klug startest.',
        },
        { h2: 'Warum Kraft ab 40 zählt' },
        {
          p: 'Ohne Training verlieren wir ab etwa 30 mit jedem Jahrzehnt Muskelmasse. Krafttraining bremst diesen Verlust, stärkt die Knochen und macht den Alltag leichter: Treppen, Einkäufe, Kinder hochheben.',
        },
        {
          quote: 'Der beste Zeitpunkt für den Start war vor zehn Jahren. Der zweitbeste ist heute.',
          attribution: 'Lena Hoffmann',
        },
        { h2: 'Die ersten vier Wochen' },
        {
          p: 'Starte mit zwei Ganzkörper-Einheiten pro Woche. Wähle fünf Grundübungen und lerne die Technik, bevor du das Gewicht steigerst:',
        },
        {
          ul: [
            'Kniebeuge an der Box',
            'Hüftheben',
            'Rudern am Kabel',
            'Liegestütz an der Bank',
            "Farmer's Walk",
          ],
        },
        {
          tip: 'Hör auf, bevor die Technik bricht. Zwei Wiederholungen Reserve sind am Anfang genau richtig.',
        },
        {
          figure: 'offerStrength',
          alt: 'Drei Personen heben Langhanteln im Studio',
          caption: 'Technik zuerst, dann das Gewicht.',
        },
        { h2: 'So steigerst du dich' },
        {
          p: 'Erhöhe das Gewicht erst, wenn du alle Sätze sauber schaffst. Kleine Schritte von ein bis zwei Kilo reichen. Notiere jede Einheit: Fortschritt, den du schwarz auf weiß siehst, motiviert.',
        },
        { video: 'M7lc1UVf-VE', title: 'Die Kniebeuge an der Box, Schritt für Schritt' },
        { h2: 'Wann du einen Coach fragen solltest' },
        {
          p: 'Bei Schmerzen, nach alten Verletzungen oder wenn du nach vier Wochen nicht weiterkommst. Ein Probetraining zeigt dir in einer Stunde, wo du stehst und was als Nächstes kommt.',
        },
      ],
    },
    en: {
      title: 'Strength training after 40: how to start safely',
      slug: 'strength-training-after-40',
      excerpt:
        'Muscles respond to training at any age. Here is how to build a safe foundation in four weeks.',
      imageAlt: 'A person lifting a barbell in the gym',
      keyTakeaways: [
        'Muscles respond to training at any age.',
        'Start with two full-body sessions a week.',
        'Learn the technique before you add weight.',
        'Progress in small steps of one to two kilos.',
      ],
      faq: [
        {
          question: 'Is strength training after 40 dangerous?',
          answer:
            'No. With clean technique and slow progress, it is one of the safest ways to train.',
        },
        {
          question: 'How often should I train?',
          answer:
            'Two full-body sessions a week are enough to start. After four weeks you can add a third.',
        },
        {
          question: 'Do I need a gym?',
          answer: 'Not to start. Many basic exercises work with dumbbells or your own body weight.',
        },
        {
          question: 'What if something hurts?',
          answer: 'Stop and ask a coach. Pain is not a sign of progress.',
        },
      ],
      body: [
        {
          p: "At 40, it isn't too late to start strength training. It's exactly the right time. Muscles, bones and joints respond to training at any age, as long as you start smart.",
        },
        { h2: 'Why strength matters after 40' },
        {
          p: 'Without training, we lose muscle mass every decade from around 30. Strength training slows that loss, strengthens your bones and makes everyday life easier: stairs, shopping, lifting your kids.',
        },
        {
          quote: 'The best time to start was ten years ago. The second best is today.',
          attribution: 'Lena Hoffmann',
        },
        { h2: 'The first four weeks' },
        {
          p: 'Start with two full-body sessions a week. Pick five basic exercises and learn the technique before you add weight:',
        },
        { ul: ['Box squat', 'Hip thrust', 'Cable row', 'Incline push-up', "Farmer's walk"] },
        {
          tip: 'Stop before your technique breaks down. Keeping two reps in reserve is just right at the start.',
        },
        {
          figure: 'offerStrength',
          alt: 'Three people lifting barbells in the gym',
          caption: 'Technique first, then the weight.',
        },
        { h2: 'How to progress' },
        {
          p: 'Only add weight once you complete every set cleanly. Small steps of one to two kilos are enough. Log every session: progress you can see in black and white keeps you going.',
        },
        { video: 'M7lc1UVf-VE', title: 'The box squat, step by step' },
        { h2: 'When to ask a coach' },
        {
          p: "If something hurts, after an old injury, or if you're stuck after four weeks. A free trial session shows you in one hour where you stand and what comes next.",
        },
      ],
    },
  },
  {
    key: 'protein',
    category: 'nutrition',
    author: 'jonas',
    publishedAt: '2026-09-21T08:00:00+02:00',
    image: 'postProtein',
    de: {
      title: 'Protein ohne Pulver: 5 einfache Mahlzeiten',
      slug: 'protein-ohne-pulver',
      excerpt:
        'Genug Eiweiß geht auch ohne Shakes. Fünf Mahlzeiten, die in 15 Minuten fertig sind.',
      imageAlt: 'Eine Schüssel mit Lachs, Eiern und Gemüse',
      body: [
        {
          p: 'Für genug Eiweiß brauchst du keine Shakes. Du brauchst ein paar Lieblingsgerichte, die schnell gehen, schmecken und sich leicht wiederholen lassen.',
        },
        { h2: 'Wie viel Protein du brauchst' },
        {
          p: 'Die meisten aktiven Erwachsenen kommen mit 1,6 Gramm Protein pro Kilo Körpergewicht am Tag gut aus. Bei 70 Kilo sind das rund 110 Gramm, verteilt auf drei oder vier Mahlzeiten.',
        },
        { quote: 'Protein ist eine Gewohnheit, kein Supplement.', attribution: 'Jonas Weber' },
        { h2: 'Fünf Mahlzeiten in 15 Minuten' },
        {
          ul: [
            'Griechischer Joghurt mit Haferflocken, Beeren und Walnüssen (ca. 30 g)',
            'Rührei mit Spinat und Vollkorntoast (ca. 28 g)',
            'Linsensalat mit Feta und Kirschtomaten (ca. 26 g)',
            'Lachs mit Reis und Erbsen (ca. 38 g)',
            'Vollkorn-Wrap mit Hähnchen, Hüttenkäse und Paprika (ca. 40 g)',
          ],
        },
        {
          tip: 'Koch abends die doppelte Portion. Dann ist das Mittagessen für morgen schon fertig.',
        },
        { video: 'M7lc1UVf-VE', title: 'Drei Eiweiß-Mittagessen in 15 Minuten' },
        { h2: 'Deine Einkaufsliste' },
        {
          figure: 'postProteinBasics',
          alt: 'Schalen mit frischen Zutaten auf einer Küchenarbeitsplatte: Gemüse, Bohnen, Käse und Hähnchen',
          caption: 'Sechs Basics, unzählige Mahlzeiten.',
        },
        {
          p: 'Halte Eier, griechischen Joghurt, Hüttenkäse, Linsen aus der Dose, TK-Lachs und Hähnchenbrust im Haus. Mit diesen sechs Basics bist du nie mehr als 15 Minuten von einer eiweißreichen Mahlzeit entfernt.',
        },
      ],
      keyTakeaways: [
        'Die meisten aktiven Erwachsenen brauchen etwa 1,6 g Protein pro Kilo Körpergewicht am Tag.',
        'Verteil es auf drei oder vier Mahlzeiten mit je 25 bis 40 g.',
        'Fünf alltägliche Mahlzeiten bringen dich in 15 Minuten ans Ziel, ganz ohne Shakes.',
        'Sechs Basics im Kühlschrank machen es jeden Tag leicht.',
      ],
      faq: [
        {
          question: 'Ist Proteinpulver schlecht für mich?',
          answer:
            'Nein. Pulver ist ein praktisches Lebensmittel, kein Muss. Wenn deine Mahlzeiten dir schon genug Eiweiß liefern, brauchst du es nicht.',
        },
        {
          question: 'Bekomme ich als Vegetarier genug Protein?',
          answer:
            'Ja. Kombinier über den Tag Milchprodukte, Eier, Linsen, Bohnen, Tofu und Vollkorn. Zwei der fünf Mahlzeiten oben sind vegetarisch.',
        },
        {
          question: 'Sollte ich vor oder nach dem Training Protein essen?',
          answer:
            'Am wichtigsten ist die Menge pro Tag. Eine eiweißreiche Mahlzeit ein paar Stunden nach dem Training ist eine gute Gewohnheit.',
        },
        {
          question: 'Woran merke ich, ob ich genug esse?',
          answer:
            'Schreib einen normalen Tag mit einer App oder einem Ernährungstagebuch mit. Liegst du deutlich unter 1,6 g pro Kilo, ergänze eine der fünf Mahlzeiten.',
        },
      ],
    },
    en: {
      title: 'Protein without powder: 5 simple meals',
      slug: 'protein-without-powder',
      excerpt: 'Enough protein without shakes. Five meals ready in 15 minutes.',
      imageAlt: 'A bowl with salmon, eggs and vegetables',
      body: [
        {
          p: "You don't need shakes to eat enough protein. You need a few go-to meals that are quick, tasty and easy to repeat.",
        },
        { h2: 'How much protein you need' },
        {
          p: "Most active adults do well with 1.6 grams of protein per kilo of body weight a day. For someone who weighs 70 kilos, that's about 110 grams, spread over three or four meals.",
        },
        { quote: 'Protein is a habit, not a supplement.', attribution: 'Jonas Weber' },
        { h2: 'Five meals in 15 minutes' },
        {
          ul: [
            'Greek yoghurt with oats, berries and walnuts (about 30 g)',
            'Scrambled eggs with spinach and wholegrain toast (about 28 g)',
            'Lentil salad with feta and cherry tomatoes (about 26 g)',
            'Salmon with rice and peas (about 38 g)',
            'Wholegrain wrap with chicken, cottage cheese and peppers (about 40 g)',
          ],
        },
        { tip: "Cook a double portion in the evening. Tomorrow's lunch is then already done." },
        { video: 'M7lc1UVf-VE', title: 'Three protein lunches in 15 minutes' },
        { h2: 'Your shopping list' },
        {
          figure: 'postProteinBasics',
          alt: 'Bowls of fresh ingredients on a kitchen counter: vegetables, beans, cheese and chicken',
          caption: 'Six basics, endless meals.',
        },
        {
          p: 'Keep eggs, Greek yoghurt, cottage cheese, canned lentils, frozen salmon and chicken breast at home. With these six basics, a protein-rich meal is never more than 15 minutes away.',
        },
      ],
      keyTakeaways: [
        'Most active adults need about 1.6 g of protein per kilo of body weight a day.',
        'Spread it over three or four meals of 25 to 40 g each.',
        'Five everyday meals get you there in 15 minutes, without shakes.',
        'Six basics in your fridge make it easy every day.',
      ],
      faq: [
        {
          question: 'Is protein powder bad for me?',
          answer:
            "No. Powder is a convenient food, not a must. If your meals already give you enough protein, you don't need it.",
        },
        {
          question: 'Can I get enough protein as a vegetarian?',
          answer:
            'Yes. Combine dairy, eggs, lentils, beans, tofu and wholegrains over the day. Two of the five meals above are vegetarian.',
        },
        {
          question: 'Should I eat protein before or after training?',
          answer:
            'Your daily total matters most. A protein-rich meal within a few hours after training is a good habit.',
        },
        {
          question: 'How do I know if I eat enough?',
          answer:
            'Track one normal day with an app or a food diary. If you are well below 1.6 g per kilo, add one of the five meals.',
        },
      ],
    },
  },
  {
    key: 'motivation',
    category: 'mindset',
    author: 'mira',
    publishedAt: '2026-09-14T08:00:00+02:00',
    image: 'postMotivation',
    de: {
      title: 'Dranbleiben, wenn die Motivation fehlt',
      slug: 'dranbleiben-ohne-motivation',
      excerpt:
        'Motivation kommt und geht. Gewohnheiten bleiben. Drei Strategien für die schwachen Wochen.',
      imageAlt: 'Eine Frau macht sich bereit fürs Training',
      keyTakeaways: [
        'Motivation kommt und geht, Gewohnheiten bleiben.',
        'Feste Termine schlagen gute Vorsätze.',
        'Kleine Einheiten zählen mehr als perfekte Pläne.',
        'Eine verpasste Woche ist kein Neustart.',
      ],
      faq: [
        {
          question: 'Was, wenn ich gar keine Lust habe?',
          answer:
            'Fang mit fünf Minuten an. Meist machst du dann weiter, und wenn nicht, hast du trotzdem trainiert.',
        },
        {
          question: 'Hilft ein Trainingspartner?',
          answer: 'Ja. Eine feste Verabredung macht das Absagen schwerer.',
        },
        {
          question: 'Wie lange dauert es, bis Training zur Gewohnheit wird?',
          answer:
            'Meist einige Wochen. Wichtiger als die Dauer ist, dass du regelmäßig zur gleichen Zeit trainierst.',
        },
        {
          question: 'Soll ich mich belohnen?',
          answer:
            'Ja, mit etwas Kleinem direkt nach der Einheit. Das verknüpft Training mit einem guten Gefühl.',
        },
      ],
      body: [
        {
          p: 'Motivation ist ein guter Anlasser, aber ein schwacher Motor. Wer Fortschritte macht, ist nicht motivierter. Er hat Gewohnheiten, die ihn durch die schwachen Wochen tragen.',
        },
        { h2: 'Warum Motivation nicht reicht' },
        {
          p: 'Motivation hängt von Laune, Schlaf und Stress ab. Wenn du nur trainierst, wenn du Lust hast, trainierst du selten. Eine Gewohnheit läuft über einen Auslöser und eine Routine, nicht über ein Gefühl.',
        },
        {
          quote: 'Warte nicht, bis du dich bereit fühlst. Fang an, das Gefühl kommt nach.',
          attribution: 'Mira Schulz',
        },
        { h2: 'Drei Strategien' },
        {
          figure: 'training',
          alt: 'Menschen springen im Training auf Boxen',
          caption: 'Gemeinsam fällt der Anfang leichter.',
        },
        {
          ol: [
            'Leg die Zeit fest: gleiche Tage, gleiche Uhrzeit, im Kalender wie ein Termin.',
            'Mach es klein: An schlechten Tagen reichen zehn Minuten. Zehn Minuten zählen.',
            'Trainiere mit anderen: Partner oder Gruppe erwarten dich, und das ändert alles.',
          ],
        },
        { tip: 'Leg deine Sportsachen am Abend bereit. Eine Entscheidung weniger am Morgen.' },
        { video: 'M7lc1UVf-VE', title: 'Zwei Minuten, die deinen Tag starten' },
        { h2: 'Wenn du eine Woche verpasst' },
        {
          p: 'Eine verpasste Woche ändert nichts. Ein verpasster Neustart schon. Hol nichts nach: Mach einfach die nächste geplante Einheit.',
        },
      ],
    },
    en: {
      title: 'Keep going when motivation fades',
      slug: 'keep-going-without-motivation',
      excerpt: 'Motivation comes and goes. Habits stay. Three strategies for the weak weeks.',
      imageAlt: 'A woman getting ready for a workout',
      keyTakeaways: [
        'Motivation comes and goes, habits stay.',
        'Fixed appointments beat good intentions.',
        'Small sessions count more than perfect plans.',
        'A missed week is not a restart.',
      ],
      faq: [
        {
          question: "What if I just don't feel like it?",
          answer:
            "Start with five minutes. You usually keep going, and if you don't, you still trained.",
        },
        {
          question: 'Does a training partner help?',
          answer: 'Yes. A fixed appointment makes cancelling harder.',
        },
        {
          question: 'How long until training becomes a habit?',
          answer:
            'Usually a few weeks. Training at the same time every week matters more than how long it takes.',
        },
        {
          question: 'Should I reward myself?',
          answer:
            'Yes, with something small right after the session. It links training with a good feeling.',
        },
      ],
      body: [
        {
          p: "Motivation is a great starter but a poor engine. The people who make progress aren't more motivated. They have built habits that carry them through the weak weeks.",
        },
        { h2: "Why motivation isn't enough" },
        {
          p: "Motivation depends on mood, sleep and stress. If you only train when you feel like it, you won't train often. A habit runs on a cue and a routine, not on a feeling.",
        },
        {
          quote: "Don't wait to feel ready. Start, and the feeling follows.",
          attribution: 'Mira Schulz',
        },
        { h2: 'Three strategies' },
        {
          figure: 'training',
          alt: 'People doing box jumps in a workout',
          caption: 'Starting is easier together.',
        },
        {
          ol: [
            'Fix the time: same days, same hour, in your calendar like a meeting.',
            'Make it small: on bad days, do ten minutes. Ten minutes still count.',
            'Train with someone: a partner or a group expects you, and that changes everything.',
          ],
        },
        {
          tip: 'Lay out your training clothes the evening before. One decision less in the morning.',
        },
        { video: 'M7lc1UVf-VE', title: 'Two minutes that start your day' },
        { h2: 'When you miss a week' },
        {
          p: "Missing one week changes nothing. Missing the restart does. Don't make up for lost sessions: just do the next planned one.",
        },
      ],
    },
  },
  {
    key: 'mobility',
    category: 'training',
    author: 'lena',
    publishedAt: '2026-09-07T08:00:00+02:00',
    image: 'postMobility',
    de: {
      title: 'Mobility in 10 Minuten am Morgen',
      slug: 'mobility-am-morgen',
      excerpt: 'Steif nach dem Aufstehen? Diese Routine macht Hüfte, Rücken und Schultern wach.',
      imageAlt: 'Frauen dehnen sich auf Yogamatten in einem hellen Studio',
      keyTakeaways: [
        'Zehn Minuten am Morgen reichen.',
        'Hüfte, Rücken und Schultern zuerst.',
        'Langsame Bewegungen, ruhiger Atem.',
        'Jeden Tag ein bisschen schlägt einmal pro Woche viel.',
      ],
      faq: [
        {
          question: 'Brauche ich dafür Ausrüstung?',
          answer: 'Nein. Eine Matte oder ein Teppich reicht.',
        },
        {
          question: 'Ersetzt Mobility das Aufwärmen?',
          answer: 'Nicht ganz. Vor schwerem Training kommt ein kurzes, gezieltes Aufwärmen dazu.',
        },
        {
          question: 'Was, wenn eine Übung zieht?',
          answer: 'Ein leichtes Ziehen ist normal. Stechender Schmerz heißt: aufhören.',
        },
        {
          question: 'Wann sehe ich Ergebnisse?',
          answer: 'Die meisten fühlen sich nach zwei Wochen täglicher Routine beweglicher.',
        },
      ],
      body: [
        {
          p: 'Steif nach dem Aufstehen? Zehn Minuten reichen, um Hüfte, Rücken und Schultern aufzuwecken, ohne Geräte und ohne Aufwärmen.',
        },
        { h2: 'Warum morgens' },
        {
          p: 'Nach einer Nacht im Liegen brauchen deine Gelenke Bewegung, um sich wieder frei anzufühlen. Eine kurze Routine weckt auch den Kopf, ohne den Stress eines Workouts.',
        },
        {
          quote: 'Zehn Minuten am Morgen sparen dir eine Stunde Verspannung am Abend.',
          attribution: 'Lena Hoffmann',
        },
        { h2: 'Die Routine' },
        {
          figure: 'offerOnline',
          alt: 'Eine Frau dehnt sich auf einer Yogamatte',
          caption: 'Langsam bewegen, ruhig atmen.',
        },
        { p: 'Eine Minute pro Übung, ruhig, mit Atmung durch die Nase:' },
        {
          ol: [
            'Katze-Kuh im Vierfüßlerstand',
            "World's Greatest Stretch, beide Seiten",
            'Hüftkreisen im Stand',
            'Rotationen der Brustwirbelsäule, beide Seiten',
            'Tiefe Hocke halten, am Türrahmen festhalten',
            'Armkreisen und Schulterrollen',
          ],
        },
        { tip: 'Mach die Routine direkt nach dem Aufstehen, bevor du aufs Handy schaust.' },
        { video: 'M7lc1UVf-VE', title: 'Die 10-Minuten-Routine zum Mitmachen' },
        { h2: 'Wann du mehr brauchst' },
        {
          p: 'Bleibt eine Stelle länger als zwei Wochen steif oder schmerzt, lass sie prüfen. Ein Coach findet die Ursache in einer Bewegungsanalyse.',
        },
      ],
    },
    en: {
      title: '10-minute morning mobility',
      slug: 'morning-mobility',
      excerpt: 'Stiff after waking up? This routine wakes up your hips, back and shoulders.',
      imageAlt: 'Women stretching on yoga mats in a bright studio',
      keyTakeaways: [
        'Ten minutes in the morning are enough.',
        'Hips, back and shoulders first.',
        'Slow movements, calm breathing.',
        'A little every day beats a lot once a week.',
      ],
      faq: [
        { question: 'Do I need any equipment?', answer: 'No. A mat or a rug is enough.' },
        {
          question: 'Does mobility replace a warm-up?',
          answer: 'Not quite. Before heavy training, add a short, targeted warm-up.',
        },
        {
          question: 'What if an exercise pulls?',
          answer: 'A light pull is normal. A sharp pain means stop.',
        },
        {
          question: 'When will I see results?',
          answer: 'Most people feel more mobile after two weeks of the daily routine.',
        },
      ],
      body: [
        {
          p: 'Stiff after waking up? Ten minutes are enough to wake up your hips, back and shoulders, with no equipment and no warm-up.',
        },
        { h2: 'Why in the morning' },
        {
          p: 'After a night of lying still, your joints need movement to feel free again. A short routine also wakes up your mind, without the stress of a workout.',
        },
        {
          quote: 'Ten minutes in the morning save you an hour of stiffness in the evening.',
          attribution: 'Lena Hoffmann',
        },
        { h2: 'The routine' },
        {
          figure: 'offerOnline',
          alt: 'A woman stretching on a yoga mat',
          caption: 'Move slowly, breathe calmly.',
        },
        { p: 'One minute per exercise, calmly, breathing through your nose:' },
        {
          ol: [
            'Cat-cow on all fours',
            "World's greatest stretch, both sides",
            'Standing hip circles',
            'Upper-back rotations, both sides',
            'Deep squat hold, holding a door frame',
            'Arm circles and shoulder rolls',
          ],
        },
        { tip: 'Do the routine right after getting up, before you check your phone.' },
        { video: 'M7lc1UVf-VE', title: 'The 10-minute routine to follow along' },
        { h2: 'When you need more' },
        {
          p: 'If one area stays stiff or painful for more than two weeks, have it checked. A coach finds the cause in a movement assessment.',
        },
      ],
    },
  },
  {
    key: 'eating',
    category: 'nutrition',
    author: 'jonas',
    publishedAt: '2026-08-31T08:00:00+02:00',
    image: 'postEating',
    de: {
      title: 'Was du vor und nach dem Training essen solltest',
      slug: 'essen-vor-und-nach-dem-training',
      excerpt: 'Timing ist weniger wichtig als gedacht, aber nicht egal. Was wirklich zählt.',
      imageAlt: 'Ein Teller mit Eiern, Avocado und Gemüse',
      keyTakeaways: [
        'Vor dem Training: leicht und kohlenhydratreich.',
        'Nach dem Training: Eiweiß und Kohlenhydrate.',
        'Das Timing zählt weniger als die Woche.',
        'Trinken nicht vergessen.',
      ],
      faq: [
        {
          question: 'Darf ich nüchtern trainieren?',
          answer: 'Für leichtes Training ja. Vor intensiven Einheiten hilft ein kleiner Snack.',
        },
        {
          question: 'Gibt es ein anaboles Fenster?',
          answer: 'Es ist größer als gedacht. Eine Mahlzeit innerhalb einiger Stunden reicht.',
        },
        {
          question: 'Brauche ich Sportgetränke?',
          answer: 'Bei unter einer Stunde Training reicht Wasser.',
        },
        {
          question: 'Was esse ich am Abend nach dem Training?',
          answer: 'Eine normale Mahlzeit mit Eiweiß, Gemüse und Kohlenhydraten.',
        },
      ],
      body: [
        {
          p: 'Timing ist weniger wichtig als gedacht, aber nicht egal. Das zählt rund um deine Einheiten wirklich.',
        },
        { h2: 'Vor dem Training' },
        {
          p: 'Iss zwei bis drei Stunden vorher eine normale Mahlzeit oder 30 bis 60 Minuten vorher einen kleinen Snack: eine Banane, ein Brot mit Honig oder einen Joghurt. Viel Fett und Ballaststoffe direkt vor dem Training lieber meiden.',
        },
        {
          quote: 'Was du über die Woche isst, zählt mehr als die Stunde ums Training.',
          attribution: 'Jonas Weber',
        },
        { h2: 'Nach dem Training' },
        {
          p: 'Iss innerhalb weniger Stunden eine Mahlzeit mit Eiweiß und Kohlenhydraten: Reis mit Hähnchen und Gemüse, ein Omelett mit Kartoffeln oder Joghurt mit Obst und Haferflocken.',
        },
        {
          tip: 'Trink vor und nach jeder Einheit ein großes Glas Wasser. Viele verwechseln Durst mit Müdigkeit.',
        },
        { video: 'M7lc1UVf-VE', title: 'Drei schnelle Snacks nach dem Training' },
        {
          figure: 'postProteinBasics',
          alt: 'Schalen mit frischen Zutaten auf einer Küchenarbeitsplatte',
          caption: 'Einfache Zutaten, schnell kombiniert.',
        },
        { h2: 'Mythen' },
        {
          p: 'Das 30-Minuten-„anabole Fenster“ ist für die meisten ein Mythos. Entscheidend ist, was du über den ganzen Tag isst.',
        },
      ],
    },
    en: {
      title: 'What to eat before and after training',
      slug: 'eating-before-and-after-training',
      excerpt: 'Timing matters less than you think, but it still matters. What really counts.',
      imageAlt: 'A plate with eggs, avocado and vegetables',
      keyTakeaways: [
        'Before training: light and rich in carbohydrates.',
        'After training: protein and carbohydrates.',
        'Timing matters less than the week.',
        "Don't forget to drink.",
      ],
      faq: [
        {
          question: 'Can I train on an empty stomach?',
          answer: 'For light training, yes. Before intense sessions a small snack helps.',
        },
        {
          question: 'Is there an anabolic window?',
          answer: 'It is wider than people think. A meal within a few hours is enough.',
        },
        {
          question: 'Do I need sports drinks?',
          answer: 'For less than an hour of training, water is enough.',
        },
        {
          question: 'What do I eat in the evening after training?',
          answer: 'A normal meal with protein, vegetables and carbohydrates.',
        },
      ],
      body: [
        {
          p: 'Timing matters less than you think, but it still matters. Here is what really counts around your sessions.',
        },
        { h2: 'Before training' },
        {
          p: 'Eat a normal meal two to three hours before, or a small snack 30 to 60 minutes before: a banana, bread with honey, or a yoghurt. Avoid a lot of fat and fibre right before training.',
        },
        {
          quote: 'What you eat over the week matters more than the hour around training.',
          attribution: 'Jonas Weber',
        },
        { h2: 'After training' },
        {
          p: 'Within a few hours, eat a meal with protein and carbohydrates: rice with chicken and vegetables, an omelette with potatoes, or yoghurt with fruit and oats.',
        },
        {
          tip: 'Drink a large glass of water before and after every session. Many people mistake thirst for tiredness.',
        },
        { video: 'M7lc1UVf-VE', title: 'Three quick snacks after training' },
        {
          figure: 'postProteinBasics',
          alt: 'Bowls of fresh ingredients on a kitchen counter',
          caption: 'Simple ingredients, quickly combined.',
        },
        { h2: 'Myths' },
        {
          p: 'The 30-minute "anabolic window" is a myth for most people. What counts is what you eat across the whole day.',
        },
      ],
    },
  },
  {
    key: 'sleep',
    category: 'mindset',
    author: 'mira',
    publishedAt: '2026-08-24T08:00:00+02:00',
    image: 'postSleep',
    de: {
      title: 'Schlaf: das unterschätzte Trainingstool',
      slug: 'schlaf-als-trainingstool',
      excerpt:
        'Fortschritt passiert in der Erholung. Warum guter Schlaf mehr bringt als ein Extra-Training.',
      imageAlt: 'Eine Frau schläft ruhig auf einem Kissen',
      keyTakeaways: [
        'Muskeln wachsen in der Erholung.',
        'Sieben bis neun Stunden sind das Ziel.',
        'Feste Schlafenszeiten helfen mehr als Ausschlafen.',
        'Spätes, hartes Training kann den Schlaf stören.',
      ],
      faq: [
        {
          question: 'Wie viel Schlaf brauche ich?',
          answer: 'Die meisten Erwachsenen sieben bis neun Stunden pro Nacht.',
        },
        {
          question: 'Hilft ein Mittagsschlaf?',
          answer: 'Ja, wenn er kurz ist: zwanzig Minuten reichen.',
        },
        {
          question: 'Darf ich abends trainieren?',
          answer: 'Ja. Lass zwischen harter Einheit und Schlafengehen zwei bis drei Stunden.',
        },
        {
          question: 'Was tun, wenn ich nicht einschlafen kann?',
          answer: 'Steh nach zwanzig Minuten auf und mach etwas Ruhiges, ohne Bildschirm.',
        },
      ],
      body: [
        {
          p: 'Deine Muskeln wachsen nicht beim Training. Sie wachsen in der Erholung, und die findet größtenteils nachts statt.',
        },
        { h2: 'Was im Schlaf passiert' },
        {
          figure: 'offerOnline',
          alt: 'Eine Frau entspannt auf einer Yogamatte',
          caption: 'Erholung ist Teil des Trainings.',
        },
        {
          p: 'Im Tiefschlaf schüttet dein Körper Wachstumshormon aus, repariert Muskelgewebe und speichert, was du geübt hast, Bewegungsmuster inklusive.',
        },
        {
          quote: 'Eine Stunde mehr Schlaf bringt oft mehr als eine Einheit mehr.',
          attribution: 'Mira Schulz',
        },
        { h2: 'Fünf Regeln für besseren Schlaf' },
        {
          ul: [
            'Gleiche Schlafens- und Aufstehzeit, auch am Wochenende',
            '30 Minuten vor dem Schlafen keine Bildschirme',
            'Ein kühles, dunkles Schlafzimmer (16 bis 19 °C)',
            'Kein Koffein nach 14 Uhr',
            'Harte Einheiten vor 20 Uhr',
          ],
        },
        { tip: 'Stell dir einen Wecker fürs Schlafengehen, nicht nur fürs Aufstehen.' },
        { video: 'M7lc1UVf-VE', title: 'Eine Abendroutine für besseren Schlaf' },
        { h2: 'Schlaf und Training planen' },
        {
          p: 'Trainiere nach einer kurzen Nacht leichter und konzentrier dich auf die Technik. Fortschritt kommt von dem, wovon du dich erholen kannst, nicht von dem, was du aushältst.',
        },
      ],
    },
    en: {
      title: 'Sleep: the underrated training tool',
      slug: 'sleep-as-a-training-tool',
      excerpt: 'Progress happens during recovery. Why good sleep beats an extra session.',
      imageAlt: 'A woman sleeping peacefully on a pillow',
      keyTakeaways: [
        'Muscles grow during recovery.',
        'Seven to nine hours is the goal.',
        'Regular bedtimes help more than sleeping in.',
        'Late, hard training can disturb sleep.',
      ],
      faq: [
        {
          question: 'How much sleep do I need?',
          answer: 'Most adults need seven to nine hours a night.',
        },
        { question: 'Does a nap help?', answer: 'Yes, if it is short: twenty minutes are enough.' },
        {
          question: 'Can I train in the evening?',
          answer: 'Yes. Leave two to three hours between a hard session and going to bed.',
        },
        {
          question: "What if I can't fall asleep?",
          answer: 'Get up after twenty minutes and do something calm, without a screen.',
        },
      ],
      body: [
        {
          p: "Your muscles don't grow during training. They grow while you recover, and most of that recovery happens at night.",
        },
        { h2: 'What happens while you sleep' },
        {
          figure: 'offerOnline',
          alt: 'A woman relaxing on a yoga mat',
          caption: 'Recovery is part of training.',
        },
        {
          p: 'In deep sleep your body releases growth hormone, repairs muscle tissue and stores what you practised, movement patterns included.',
        },
        {
          quote: 'An extra hour of sleep often does more than an extra session.',
          attribution: 'Mira Schulz',
        },
        { h2: 'Five rules for better sleep' },
        {
          ul: [
            'The same bedtime and wake-up time, weekends included',
            'No screens for 30 minutes before bed',
            'A cool, dark bedroom (16 to 19 °C)',
            'No caffeine after 2 pm',
            'Hard sessions before 8 pm',
          ],
        },
        { tip: 'Set an alarm for going to bed, not just for getting up.' },
        { video: 'M7lc1UVf-VE', title: 'An evening routine for better sleep' },
        { h2: 'Planning sleep and training' },
        {
          p: 'After a short night, train lighter and focus on technique. Progress comes from what you can recover from, not from what you can endure.',
        },
      ],
    },
  },
]
