import LevelPage from '../components/LevelPage'
import image from '../images/banner_maternelle.png'

const level = {
  slug: 'maternelle',
  image,
  eyebrow: 'De 3 à 6 ans',
  title: 'Maternelle',
  intro: "Un environnement doux et stimulant pour éveiller la curiosité, développer le langage et donner à chaque enfant le plaisir d'apprendre.",
  programTitle: 'Grandir, explorer et construire ses premiers repères',
  programIntro: "Notre parcours maternelle respecte le rythme de l'enfant et l'accompagne dans ses premières découvertes à travers des activités progressives et rassurantes.",
  pillars: [
    { title: 'Langage', text: "Enrichir le vocabulaire, s'exprimer avec confiance et entrer progressivement dans l'écrit." },
    { title: 'Premiers nombres', text: 'Manipuler, comparer, compter et comprendre les premières notions mathématiques.' },
    { title: 'Découverte', text: 'Observer le monde, développer sa curiosité et apprendre à poser des questions.' },
    { title: 'Autonomie', text: 'Prendre de bonnes habitudes et gagner en assurance dans les activités quotidiennes.' }
  ],
  supportTitle: 'Un rythme respectueux de chaque enfant',
  supportText: "Les familles bénéficient d'un accompagnement clair et régulier pour suivre les progrès, les besoins et l'épanouissement de leur enfant."
}

function MaternellePage() {
  return <LevelPage level={level} />
}

export default MaternellePage
