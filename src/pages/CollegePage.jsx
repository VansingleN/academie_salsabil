import LevelPage from '../components/LevelPage'
import CollegeCurriculum from '../components/CollegeCurriculum'
import image from '../images/banner_levels.webp'

const level = {
  slug: 'college',
  image,
  eyebrow: 'De la 6e à la 3e',
  title: 'Collège',
  intro: "Un accompagnement structuré pour consolider les acquis, développer une méthode de travail efficace et traverser les années collège avec sérénité.",
  programTitle: 'Comprendre, s’organiser et gagner en assurance',
  programIntro: "À chaque étape du collège, nous aidons l'élève à suivre le rythme, approfondir les notions et devenir progressivement acteur de sa réussite.",
  pillars: [
    { title: 'Consolidation', text: 'Reprendre les notions essentielles et combler les lacunes avant qu’elles ne s’installent.' },
    { title: 'Organisation', text: 'Planifier son travail, anticiper les évaluations et gérer ses devoirs avec méthode.' },
    { title: 'Approfondissement', text: 'Développer le raisonnement, l’expression et la maîtrise des matières principales.' },
    { title: 'Préparation', text: 'Se préparer aux attentes du brevet et construire des bases solides pour le lycée.' }
  ],
  supportTitle: 'Un cadre stable pendant une période décisive',
  supportText: "Nous maintenons un dialogue régulier avec les familles afin d'ajuster l'accompagnement et de soutenir la motivation de l'élève."
}

function CollegePage() {
  return (
    <LevelPage level={level}>
      <CollegeCurriculum />
    </LevelPage>
  )
}

export default CollegePage
