import { useNavigate } from 'react-router-dom'
import levelsTreeImage from '../images/levels_tree_transparent.png'
import './LevelTree.css'

const levels = [
  {
    number: '01',
    name: 'Maternelle',
    path: '/maternelle',
    position: 'lower-right'
  },
  {
    number: '02',
    name: 'Primaire',
    path: '/primaire',
    position: 'right'
  },
  {
    number: '03',
    name: 'Collège',
    path: '/college',
    position: 'left'
  },
  {
    number: '04',
    name: 'Lycée',
    path: '/lycee',
    position: 'top'
  }
]

function LevelTree() {
  const navigate = useNavigate()

  return (
    <div className="level-tree">
      <div className="level-tree-illustration">
        <div className="level-tree-art">
          <img
            src={levelsTreeImage}
            alt="Arbre éducatif présentant les niveaux maternelle, primaire, collège et lycée"
          />
        </div>

        {levels.map((level) => (
          <button
            className={`level-tree-leaf level-tree-leaf--${level.position}`}
            type="button"
            key={level.name}
            aria-label={`Découvrir le niveau ${level.name}`}
            onClick={() => navigate(level.path)}
          >
            <span className="level-tree-sr-only">
              {level.number} - {level.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default LevelTree
