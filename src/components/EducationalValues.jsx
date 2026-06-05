import './EducationalValues.css'

const values = [
  {
    number: '01',
    title: 'Bienveillance',
    text: 'Créer un cadre rassurant où chaque enfant peut apprendre sereinement et se sentir pleinement considéré.'
  },
  {
    number: '02',
    title: 'Exigence',
    text: 'Donner des repères solides, encourager l’effort et accompagner chaque élève vers le meilleur de ses capacités.'
  },
  {
    number: '03',
    title: 'Confiance',
    text: 'Valoriser les progrès, lever les blocages et permettre à l’élève de retrouver le plaisir d’apprendre.'
  },
  {
    number: '04',
    title: 'Autonomie',
    text: 'Transmettre des méthodes de travail durables afin que l’enfant puisse progressivement avancer par lui-même.'
  },
  {
    number: '05',
    title: 'Transmission',
    text: 'Proposer un enseignement clair, structuré et enraciné dans des valeurs musulmanes authentiques.'
  },
  {
    number: '06',
    title: 'Lien familial',
    text: 'Travailler en étroite relation avec les parents pour construire un accompagnement cohérent et attentif.'
  }
]

function EducationalValues() {
  return (
    <section className="educational-values" aria-labelledby="educational-values-title">
      <div className="educational-values-container">
        <header className="educational-values-intro">
          <span>Notre vision</span>
          <h2 id="educational-values-title">Nos valeurs éducatives</h2>
          <p>
            Nous souhaitons offrir aux familles bien plus qu'un simple soutien scolaire :
            un cadre où le savoir, la confiance et l'épanouissement avancent ensemble.
          </p>
          <blockquote>
            Aider chaque enfant à grandir avec des bases solides, un esprit curieux et
            des repères qui ont du sens.
          </blockquote>
        </header>

        <div className="educational-values-list">
          {values.map((value) => (
            <article className="educational-value" key={value.number}>
              <span aria-hidden="true">{value.number}</span>
              <div>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default EducationalValues
