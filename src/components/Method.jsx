import './Method.css'

const steps = [
  {
    number: '01',
    title: 'Comprendre',
    text: "Nous échangeons avec la famille pour identifier le niveau, les besoins et les objectifs de l'élève."
  },
  {
    number: '02',
    title: 'Personnaliser',
    text: 'Nous construisons un accompagnement adapté à son rythme, à ses matières et à sa manière d’apprendre.'
  },
  {
    number: '03',
    title: 'Accompagner',
    text: 'Des séances régulières permettent de consolider les acquis, lever les blocages et retrouver confiance.'
  },
  {
    number: '04',
    title: 'Faire progresser',
    text: 'Nous suivons les avancées et ajustons le parcours pour installer des résultats solides dans la durée.'
  }
]

function Method() {
  return (
    <section className="method" id="method" aria-labelledby="method-title">
      <div className="method-container">
        <header className="method-heading">
          <div>
            <span className="method-kicker">Notre méthode</span>
            <h2 id="method-title">Un accompagnement pensé pour chaque élève</h2>
          </div>
          <p>
            À l'Académie Salsabil, nous avançons avec une méthode claire, attentive et
            progressive afin que chaque enfant retrouve des repères et développe son
            autonomie.
          </p>
        </header>

        <div className="method-steps">
          {steps.map((step) => (
            <article className="method-step" key={step.number}>
              <span className="method-number" aria-hidden="true">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>

        <div className="method-promise">
          <p>
            <strong>Notre engagement :</strong> proposer un cadre rassurant, exigeant et
            bienveillant, en lien étroit avec les familles.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Method
