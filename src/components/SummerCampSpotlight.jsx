import { Link } from 'react-router-dom'
import summerCampFrontpage from '../images/summer_camp_frontpage.webp'
import {
  cancelSummerCampPreload,
  preloadSummerCampAssets,
  scheduleSummerCampPreload
} from '../utils/preloadSummerCampAssets'
import './SummerCampSpotlight.css'

function SummerCampSpotlight() {
  return (
    <section className="summer-camp-spotlight" aria-labelledby="summer-camp-spotlight-title">
      <div className="summer-camp-spotlight__content">
        <span>Programme saisonnier</span>
        <h2 id="summer-camp-spotlight-title">Summer Camp Salsabil</h2>
        <p>
          Une semaine en petits groupes pour consolider les acquis, explorer de
          nouvelles activités et préparer la suite avec confiance.
        </p>
        <Link
          to="/summer-camp"
          onMouseEnter={scheduleSummerCampPreload}
          onMouseLeave={cancelSummerCampPreload}
          onFocus={preloadSummerCampAssets}
          onPointerDown={preloadSummerCampAssets}
        >
          <span>Découvrir le Summer Camp</span>
          <i aria-hidden="true"></i>
        </Link>
      </div>
      <div className="summer-camp-spotlight__motif" aria-hidden="true">
        <img src={summerCampFrontpage} alt="" />
      </div>
    </section>
  )
}

export default SummerCampSpotlight
