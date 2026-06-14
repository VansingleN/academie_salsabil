import LevelTree from './LevelTree'
import './CurriculumExplorer.css'

function CurriculumExplorer() {
  return (
    <section
      className="curriculum-explorer"
      id="cursus"
      aria-labelledby="curriculum-explorer-title"
    >
      <div className="curriculum-explorer__container">
        <div className="curriculum-explorer__content">
          <span>Nos cursus scolaires</span>
          <h2 id="curriculum-explorer-title">
            Un parcours structuré pour chaque étape de la scolarité
          </h2>
          <p>
            De la maternelle au lycée, découvrez un cursus complet adapté au
            niveau de votre enfant et construit pour avancer avec continuité.
          </p>
          <small>Sélectionnez un niveau dans l’arbre pour découvrir son programme.</small>
        </div>

        <div className="curriculum-explorer__tree">
          <LevelTree />
        </div>
      </div>
    </section>
  )
}

export default CurriculumExplorer
