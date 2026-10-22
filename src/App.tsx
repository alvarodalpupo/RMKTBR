import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'

// Páginas carregadas sob demanda: o visitante baixa só o que vai usar.
// O Admin sozinho tem ~2.500 linhas e nunca é aberto por quem só olha anúncios.
const Anuncios = lazy(() => import('./pages/Anuncios'))
const AnuncioDetalhes = lazy(() => import('./pages/AnuncioDetalhes'))
const AnuncieSeuCarro = lazy(() => import('./pages/AnuncieSeuCarro'))
const Contato = lazy(() => import('./pages/Contato'))
const Login = lazy(() => import('./pages/Login'))
const NovaSenha = lazy(() => import('./pages/NovaSenha'))
const Painel = lazy(() => import('./pages/Painel'))
const Admin = lazy(() => import('./pages/Admin'))
const Vendidos = lazy(() => import('./pages/Vendidos'))
const TermosUso = lazy(() => import('./pages/TermosUso'))
const PoliticaPrivacidade = lazy(() => import('./pages/PoliticaPrivacidade'))

const PageLoader = () => (
  <div className="pt-20 min-h-screen flex items-center justify-center" role="status" aria-label="Carregando">
    <div className="w-10 h-10 border-4 border-primary-red border-t-transparent rounded-full animate-spin" />
  </div>
)

const NotFound = () => (
  <div className="pt-20 min-h-screen flex items-center justify-center text-center px-4">
    <div>
      <h1 className="font-bebas text-5xl text-white mb-4">PÁGINA NÃO ENCONTRADA</h1>
      <Link to="/" className="text-red-text hover:text-turbo-secondary font-montserrat font-600">
        ← Voltar para o início
      </Link>
    </div>
  </div>
)

/** Volta ao topo ao trocar de página (o React Router não faz isso sozinho). */
const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <ScrollToTop />
      <div className="min-h-screen bg-primary-black text-white">
        <Header />
        <main>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/anuncios" element={<Anuncios />} />
              <Route path="/anuncio/:id" element={<AnuncioDetalhes />} />
              <Route path="/anuncie-seu-carro" element={<AnuncieSeuCarro />} />
              <Route path="/vendidos" element={<Vendidos />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Login mode="cadastro" />} />
              <Route path="/nova-senha" element={<NovaSenha />} />
              <Route path="/termos" element={<TermosUso />} />
              <Route path="/privacidade" element={<PoliticaPrivacidade />} />
              <Route
                path="/painel"
                element={
                  <ProtectedRoute>
                    <Painel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#FFFFFF',
              border: '1px solid #E53E3E',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App
