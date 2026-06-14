import LevelPage from '../components/LevelPage'
import HighSchoolCurriculum from '../components/HighSchoolCurriculum'
import image from '../images/banner_levels.webp'

const level = {
  slug: 'lycee',
  image,
  eyebrow: 'De la seconde à la terminale',
  title: 'Lycée',
  intro: "Un parcours exigeant et personnalisé pour approfondir les connaissances, renforcer l'autonomie et préparer les choix d'orientation.",
  programTitle: 'Réussir son parcours et préparer l’avenir',
  programIntro: "Au lycée, l'élève apprend à travailler avec davantage d'autonomie. Nous l'accompagnons dans ses matières, sa méthode et ses objectifs.",
  pillars: [
    { title: 'Maîtrise', text: 'Approfondir les notions, améliorer la précision et répondre aux attentes du lycée.' },
    { title: 'Autonomie', text: 'Construire un planning réaliste et développer des stratégies de révision efficaces.' },
    { title: 'Examens', text: 'Préparer les évaluations, les épreuves anticipées et le baccalauréat avec méthode.' },
    { title: 'Orientation', text: 'Clarifier ses objectifs et avancer sereinement vers les études et projets futurs.' }
  ],
  supportTitle: 'Un accompagnement tourné vers la réussite',
  supportText: "Le suivi s'adapte aux spécialités, aux échéances et au projet de chaque lycéen pour lui permettre de progresser avec constance."
}

function LyceePage() {
  return (
    <LevelPage level={level}>
      <HighSchoolCurriculum />
    </LevelPage>
  )
}

export default LyceePage
