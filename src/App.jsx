import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Method from './components/Method'
import OnlineCourses from './components/OnlineCourses'
import SchoolSupport from './components/SchoolSupport'
import EducationalValues from './components/EducationalValues'
import FAQ from './components/FAQ'
import Contact from './components/Contact'
import Footer from './components/Footer'
import MaternellePage from './pages/MaternellePage'
import PrimairePage from './pages/PrimairePage'
import CollegePage from './pages/CollegePage'
import LyceePage from './pages/LyceePage'
import IefPage from './pages/IefPage'
import CartPage from './pages/CartPage'
import './App.css'

function ScrollToLocation() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
      })
      return
    }

    window.scrollTo({ top: 0 })
  }, [pathname, hash])

  return null
}

// La page d'accueil reste composée de sections, contrairement aux pages routées
// (cursus, contact et panier) qui sont déclarées séparément dans App.
function HomePage() {
  return (
    <main className="home-page">
      <Hero />
      <Method />
      <OnlineCourses />
      <SchoolSupport />
      <EducationalValues />
      <FAQ />
    </main>
  )
}

function App() {
  return (
    <>
      <ScrollToLocation />
      <Navbar />
      <div className="site-oilpaint-background">
        {/* HashRouter permet de conserver l'historique navigateur sur un hébergement statique. */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/maternelle" element={<MaternellePage />} />
          <Route path="/primaire" element={<PrimairePage />} />
          <Route path="/college" element={<CollegePage />} />
          <Route path="/lycee" element={<LyceePage />} />
          <Route path="/instruction-en-famille" element={<IefPage />} />
          {/* Le panier possède sa propre URL afin de pouvoir y revenir avec précédent/suivant. */}
          <Route path="/panier" element={<CartPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </>
  )
}

export default App
