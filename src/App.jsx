import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Method from './components/Method'
import OnlineCourses from './components/OnlineCourses'
import EducationalValues from './components/EducationalValues'
import FAQ from './components/FAQ'
import Contact from './components/Contact'
import Footer from './components/Footer'
import MaternellePage from './pages/MaternellePage'
import PrimairePage from './pages/PrimairePage'
import CollegePage from './pages/CollegePage'
import LyceePage from './pages/LyceePage'
import IefPage from './pages/IefPage'
import ProgrammesPage from './pages/ProgrammesPage'
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

function HomePage() {
  return (
    <>
      <Hero />
      <Method />
      <OnlineCourses />
      <EducationalValues />
      <FAQ />
    </>
  )
}

function App() {
  return (
    <>
      <ScrollToLocation />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/maternelle" element={<MaternellePage />} />
        <Route path="/primaire" element={<PrimairePage />} />
        <Route path="/college" element={<CollegePage />} />
        <Route path="/lycee" element={<LyceePage />} />
        <Route path="/instruction-en-famille" element={<IefPage />} />
        <Route path="/programmes" element={<ProgrammesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
