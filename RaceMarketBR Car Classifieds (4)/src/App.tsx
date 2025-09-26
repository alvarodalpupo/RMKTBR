
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Anuncios from './pages/Anuncios'
import AnuncioDetalhes from './pages/AnuncioDetalhes'
import AnuncieSeuCarro from './pages/AnuncieSeuCarro'
import Contato from './pages/Contato'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Painel from './pages/Painel'
import Admin from './pages/Admin'
import Vendidos from './pages/Vendidos'
import TermosUso from './pages/TermosUso'
import PoliticaPrivacidade from './pages/PoliticaPrivacidade'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-primary-black text-white">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/anuncios" element={<Anuncios />} />
            <Route path="/anuncio/:id" element={<AnuncioDetalhes />} />
            <Route path="/anuncie-seu-carro" element={<AnuncieSeuCarro />} />
            <Route path="/vendidos" element={<Vendidos />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
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
          </Routes>
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
