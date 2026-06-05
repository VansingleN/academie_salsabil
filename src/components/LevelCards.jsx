import './LevelCards.css'
import collegeImage from '../images/Salsabil_college.png'
import maternelleImage from '../images/Salsabil_maternelle.png'
import primaireImage from '../images/Salsabil_primaire.png'
import lyceeImage from '../images/Salsabil_lycee.png'

function LevelCards() {
  const levels = [
    { id: 1, name: 'Maternelle', icon: '🎨', image: maternelleImage },
    { id: 2, name: 'Primaire', icon: '📚', image: primaireImage },
    { id: 3, name: 'Collège', icon: '✏️', image: collegeImage },
    { id: 4, name: '2nde générale', icon: '🎓', image: lyceeImage }
  ]

  const handleCardClick = (level) => {
    console.log(`Niveau sélectionné: ${level}`)
  }

  return (
    <div className="level-cards">
      {levels.map((level) => (
        <button
          key={level.id}
          className="level-card level-card--image"
          onClick={() => handleCardClick(level.name)}
        >
          <img src={level.image} alt={level.name} className="card-image" />
        </button>
      ))}
    </div>
  )
}

export default LevelCards
