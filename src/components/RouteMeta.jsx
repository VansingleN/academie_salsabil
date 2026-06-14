import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { faqQuestions, homeFaqQuestions } from '../data/faqQuestions'

const SITE_URL = 'https://academie-salsabil.netlify.app'
const SOCIAL_IMAGE_URL = `${SITE_URL}/og-academie-salsabil.jpg`
const ORGANIZATION_ID = `${SITE_URL}/#organization`

const defaultMeta = {
  title: 'Académie Salsabil | Accompagnement scolaire en ligne',
  description:
    'Des accompagnements scolaires en ligne, structurés et bienveillants, de la maternelle au lycée.'
}

const routeMeta = {
  '/': defaultMeta,
  '/contact': {
    title: 'Contact | Académie Salsabil',
    description:
      'Échangez avec l’équipe de l’Académie Salsabil au sujet de nos cursus, accompagnements scolaires et services en ligne.'
  },
  '/a-propos': {
    title: 'Notre méthode et nos valeurs | Académie Salsabil',
    description:
      'Découvrez la méthode pédagogique, la vision éducative et les valeurs qui guident l’accompagnement proposé par l’Académie Salsabil.'
  },
  '/soutien-scolaire': {
    title: 'Soutien scolaire en ligne | Académie Salsabil',
    description:
      'Découvrez nos accompagnements de soutien scolaire en ligne, ponctuels ou réguliers, du primaire au lycée et dans les principales matières.'
  },
  '/demande-soutien': {
    title: 'Demande de soutien scolaire | Académie Salsabil',
    description:
      'Précisez votre besoin de soutien scolaire ou demandez conseil à l’équipe de l’Académie Salsabil.',
    noindex: true
  },
  '/admin/demandes-soutien': {
    title: 'Administration des demandes | Académie Salsabil',
    description: 'Espace privé de gestion des demandes de soutien scolaire.',
    noindex: true
  },
  '/maternelle': {
    title: 'Cursus maternelle en ligne | Académie Salsabil',
    description:
      'Un parcours maternelle doux et progressif pour développer le langage, les premiers nombres, la curiosité et l’autonomie.'
  },
  '/primaire': {
    title: 'Cursus primaire en ligne | Académie Salsabil',
    description:
      'Un accompagnement du CP au CM2 pour consolider le français, les mathématiques, la méthode et la confiance.'
  },
  '/college': {
    title: 'Cursus collège en ligne | Académie Salsabil',
    description:
      'Un parcours de la 6e à la 3e pour consolider les acquis, développer une méthode efficace et préparer le brevet.'
  },
  '/lycee': {
    title: 'Cursus lycée en ligne | Académie Salsabil',
    description:
      'Un accompagnement de la seconde à la terminale pour approfondir les connaissances, gagner en autonomie et préparer les examens.'
  },
  '/instruction-en-famille': {
    title: 'Accompagnement IEF | Académie Salsabil',
    description:
      'Un accompagnement méthodique pour préparer le dossier IEF et construire une organisation pédagogique adaptée à votre famille.'
  },
  '/summer-camp': {
    title: 'Summer Camp éducatif en ligne | Académie Salsabil',
    description:
      'Des ateliers académiques ou religieux en ligne pour les enfants et adolescents pendant les périodes du Summer Camp Salsabil.'
  },
  '/conditions-generales-de-vente': {
    title: 'Conditions générales de vente | Académie Salsabil',
    description:
      'Consultez les conditions générales applicables aux accompagnements et ateliers proposés par l’Académie Salsabil.'
  },
  '/politique-de-confidentialite': {
    title: 'Politique de confidentialité | Académie Salsabil',
    description:
      'Consultez les règles de collecte, d’utilisation et de conservation des données personnelles par l’Académie Salsabil.'
  },
  '/mentions-legales': {
    title: 'Mentions légales | Académie Salsabil',
    description:
      'Consultez les informations relatives à l’édition et à l’hébergement du site de l’Académie Salsabil.'
  },
  '/panier': {
    title: 'Votre panier | Académie Salsabil',
    description: 'Finalisez votre projet d’inscription auprès de l’Académie Salsabil.',
    noindex: true
  },
  '/paiement/succes': {
    title: 'Confirmation de paiement | Académie Salsabil',
    description: 'Consultez la confirmation de votre paiement.',
    noindex: true
  },
  '/paiement/annule': {
    title: 'Paiement annulé | Académie Salsabil',
    description: 'Votre paiement a été annulé.',
    noindex: true
  }
}

const courseSchemas = {
  '/maternelle': {
    name: 'Cursus maternelle en ligne',
    educationalLevel: 'Maternelle'
  },
  '/primaire': {
    name: 'Cursus primaire en ligne',
    educationalLevel: 'Du CP au CM2'
  },
  '/college': {
    name: 'Cursus collège en ligne',
    educationalLevel: 'De la 6e à la 3e'
  },
  '/lycee': {
    name: 'Cursus lycée en ligne',
    educationalLevel: 'De la seconde à la terminale'
  }
}

function getStructuredData(pathname, meta, canonicalUrl) {
  const organization = {
    '@type': 'EducationalOrganization',
    '@id': ORGANIZATION_ID,
    name: 'Académie Salsabil',
    url: SITE_URL,
    email: 'contact@academiesalsabil.fr',
    image: SOCIAL_IMAGE_URL,
    sameAs: [
      'https://instagram.com/academiesalsabil',
      'https://t.me/academiesalsabil'
    ]
  }
  const graph = [organization]
  const course = courseSchemas[pathname]

  if (course) {
    graph.push({
      '@type': 'Course',
      name: course.name,
      description: meta.description,
      url: canonicalUrl,
      educationalLevel: course.educationalLevel,
      courseMode: 'online',
      inLanguage: 'fr',
      provider: { '@id': ORGANIZATION_ID }
    })
  }

  if (pathname === '/') {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: homeFaqQuestions.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    })
  }

  if (pathname === '/contact') {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqQuestions.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    })
  }

  if (pathname === '/instruction-en-famille') {
    graph.push({
      '@type': 'Service',
      name: 'Accompagnement en instruction en famille',
      description: meta.description,
      url: canonicalUrl,
      provider: { '@id': ORGANIZATION_ID },
      areaServed: 'FR',
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceUrl: canonicalUrl
      }
    })
  }

  if (pathname === '/soutien-scolaire') {
    graph.push({
      '@type': 'Service',
      name: 'Soutien scolaire en ligne',
      description: meta.description,
      url: canonicalUrl,
      provider: { '@id': ORGANIZATION_ID },
      areaServed: 'FR',
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceUrl: canonicalUrl
      }
    })
  }

  if (pathname === '/a-propos') {
    graph.push({
      '@type': 'AboutPage',
      name: meta.title,
      description: meta.description,
      url: canonicalUrl,
      mainEntity: { '@id': ORGANIZATION_ID }
    })
  }

  if (pathname === '/summer-camp') {
    const periods = [
      ['2026-07-06', '2026-07-16'],
      ['2026-07-20', '2026-07-30'],
      ['2026-08-03', '2026-08-13'],
      ['2026-08-17', '2026-08-27']
    ]

    periods.forEach(([startDate, endDate], index) => {
      graph.push({
        '@type': 'Event',
        name: `Summer Camp Salsabil - session ${index + 1}`,
        description: meta.description,
        startDate,
        endDate,
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'VirtualLocation',
          url: canonicalUrl
        },
        organizer: { '@id': ORGANIZATION_ID },
        url: canonicalUrl,
        image: SOCIAL_IMAGE_URL
      })
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  }
}

function upsertMeta(name, content, attribute = 'name') {
  let element = document.head.querySelector(`meta[${attribute}="${name}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function upsertCanonical(href) {
  let element = document.head.querySelector('link[rel="canonical"]')

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
}

function upsertStructuredData(data) {
  let element = document.head.querySelector('#route-structured-data')

  if (!element) {
    element = document.createElement('script')
    element.id = 'route-structured-data'
    element.type = 'application/ld+json'
    document.head.appendChild(element)
  }

  element.textContent = JSON.stringify(data)
}

function RouteMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = routeMeta[pathname] || defaultMeta
    const canonicalUrl = `${SITE_URL}${pathname === '/' ? '' : pathname}`

    document.title = meta.title
    upsertMeta('description', meta.description)
    upsertMeta('robots', meta.noindex ? 'noindex, nofollow' : 'index, follow')
    upsertMeta('og:title', meta.title, 'property')
    upsertMeta('og:description', meta.description, 'property')
    upsertMeta('og:type', 'website', 'property')
    upsertMeta('og:url', canonicalUrl, 'property')
    upsertMeta('og:locale', 'fr_FR', 'property')
    upsertMeta('og:site_name', 'Académie Salsabil', 'property')
    upsertMeta('og:image', SOCIAL_IMAGE_URL, 'property')
    upsertMeta('og:image:width', '1200', 'property')
    upsertMeta('og:image:height', '630', 'property')
    upsertMeta(
      'og:image:alt',
      'Académie Salsabil, accompagnement scolaire en ligne',
      'property'
    )
    upsertMeta('twitter:card', 'summary_large_image')
    upsertMeta('twitter:title', meta.title)
    upsertMeta('twitter:description', meta.description)
    upsertMeta('twitter:image', SOCIAL_IMAGE_URL)
    upsertCanonical(canonicalUrl)
    upsertStructuredData(getStructuredData(pathname, meta, canonicalUrl))
  }, [pathname])

  return null
}

export default RouteMeta
