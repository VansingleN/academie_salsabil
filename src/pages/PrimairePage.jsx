import LevelPage from '../components/LevelPage'
import PrimaryCurriculum from '../components/PrimaryCurriculum'
import image from '../images/banner_levels.png'

const level = {
  slug: 'primaire',
  image,
  eyebrow: 'Du CP au CM2',
  title: 'Primaire',
  intro: "Des bases solides, une méthode claire et un accompagnement bienveillant pour progresser avec confiance dans les apprentissages fondamentaux.",
  programTitle: 'Maîtriser les fondamentaux et devenir autonome',
  programIntro: "Le primaire est le temps des grandes acquisitions. Nous aidons chaque élève à comprendre, pratiquer et consolider les notions essentielles.",
  pillars: [
    { title: 'Français', text: 'Lecture, compréhension, expression écrite, orthographe et enrichissement du vocabulaire.' },
    { title: 'Mathématiques', text: 'Numération, calcul, résolution de problèmes, géométrie et raisonnement logique.' },
    { title: 'Méthode', text: 'Organisation, mémorisation et habitudes de travail adaptées à son âge.' },
    { title: 'Confiance', text: 'Valoriser les progrès et permettre à l’élève d’oser essayer, se corriger et avancer.' }
  ],
  supportTitle: 'Des acquis solides pour la suite',
  supportText: "Le suivi permet de repérer rapidement les difficultés, de consolider les notions fragiles et de préparer sereinement l'entrée au collège."
}

function PrimairePage() {
  return (
    <LevelPage level={level}>
      <PrimaryCurriculum />
    </LevelPage>
  )
}

export default PrimairePage
