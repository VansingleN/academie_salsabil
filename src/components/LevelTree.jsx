import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import levelBannerImage from '../images/banner_levels.webp'
import levelsTreeImage from '../images/levels_tree_transparent.webp'
import './LevelTree.css'

let levelBannerPreload

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
  useEffect(() => {
    if (levelBannerPreload) {
      return
    }

    levelBannerPreload = new Image()
    levelBannerPreload.fetchPriority = 'high'
    levelBannerPreload.src = levelBannerImage
    levelBannerPreload.decode?.().catch(() => {})
  }, [])

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
          <span
            className={`level-tree-leaf-backdrop level-tree-leaf--${level.position}`}
            aria-hidden="true"
            key={`backdrop-${level.name}`}
          />
        ))}

        {levels.map((level) => (
          <Link
            className={`level-tree-leaf level-tree-leaf--${level.position}`}
            key={level.name}
            to={level.path}
            aria-label={`Découvrir le niveau ${level.name}`}
          >
            <span className="level-tree-sr-only">
              {level.number} - {level.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default LevelTree
