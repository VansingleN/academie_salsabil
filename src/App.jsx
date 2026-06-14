import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import CurriculumExplorer from './components/CurriculumExplorer'
import OnlineCourses from './components/OnlineCourses'
import SchoolSupport from './components/SchoolSupport'
import SummerCampSpotlight from './components/SummerCampSpotlight'
import FAQ from './components/FAQ'
import FinalCta from './components/FinalCta'
import Footer from './components/Footer'
import CartAddedToast from './components/CartAddedToast'
import RouteMeta from './components/RouteMeta'
import { homeFaqQuestions } from './data/faqQuestions'
import './App.css'

const Contact = lazy(() => import('./components/Contact'))
const MaternellePage = lazy(() => import('./pages/MaternellePage'))
const PrimairePage = lazy(() => import('./pages/PrimairePage'))
const CollegePage = lazy(() => import('./pages/CollegePage'))
const LyceePage = lazy(() => import('./pages/LyceePage'))
const IefPage = lazy(() => import('./pages/IefPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const PaymentStatusPage = lazy(() => import('./pages/PaymentStatusPage'))
const SummerCampPage = lazy(() => import('./pages/SummerCampPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const SupportPage = lazy(() => import('./pages/SupportPage'))
const SupportRequestPage = lazy(() => import('./pages/SupportRequestPage'))
const SupportRequestsAdminPage = lazy(() => import('./pages/SupportRequestsAdminPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const LegalNoticePage = lazy(() => import('./pages/LegalNoticePage'))

function ScrollToLocation() {
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Les anciens favoris en /#/route restent valides après le passage à BrowserRouter.
    if (hash.startsWith('#/')) {
      navigate(hash.slice(1), { replace: true })
      return
    }

    if (hash) {
      requestAnimationFrame(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
      })
      return
    }

    window.scrollTo({ top: 0 })
  }, [pathname, hash, navigate])

  return null
}

// La page d'accueil reste composée de sections, contrairement aux pages routées
// (cursus, contact et panier) qui sont déclarées séparément dans App.
function HomePage() {
  return (
    <main className="home-page">
      <Hero />
      <OnlineCourses />
      <SummerCampSpotlight />
      <CurriculumExplorer />
      <SchoolSupport compact />
      <FAQ
        questions={homeFaqQuestions}
        compact
        completeFaqLink
        title="L’essentiel avant de commencer"
        introduction="Quelques réponses simples pour vous aider à comprendre notre fonctionnement et choisir sereinement."
      />
      <FinalCta />
    </main>
  )
}

function App() {
  return (
    <>
      <ScrollToLocation />
      <RouteMeta />
      <Navbar />
      <div className="site-oilpaint-background">
        {/* Netlify renvoie index.html sur les routes directes utilisées par BrowserRouter. */}
        <Suspense
          fallback={
            <main className="route-loading" aria-live="polite">
              <span>Chargement de la page…</span>
            </main>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/a-propos" element={<AboutPage />} />
            <Route path="/soutien-scolaire" element={<SupportPage />} />
            <Route path="/demande-soutien" element={<SupportRequestPage />} />
            <Route path="/admin/demandes-soutien" element={<SupportRequestsAdminPage />} />
            <Route path="/maternelle" element={<MaternellePage />} />
            <Route path="/primaire" element={<PrimairePage />} />
            <Route path="/college" element={<CollegePage />} />
            <Route path="/lycee" element={<LyceePage />} />
            <Route path="/instruction-en-famille" element={<IefPage />} />
            <Route path="/summer-camp" element={<SummerCampPage />} />
            <Route path="/conditions-generales-de-vente" element={<TermsPage />} />
            <Route path="/politique-de-confidentialite" element={<PrivacyPage />} />
            <Route path="/mentions-legales" element={<LegalNoticePage />} />
            {/* Le panier possède sa propre URL afin de pouvoir y revenir avec précédent/suivant. */}
            <Route path="/panier" element={<CartPage />} />
            <Route path="/paiement/succes" element={<PaymentStatusPage status="success" />} />
            <Route path="/paiement/annule" element={<PaymentStatusPage status="cancelled" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
      <CartAddedToast />
      <Footer />
    </>
  )
}

export default App
