
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {User, Mail, Lock, Eye, EyeOff, UserPlus, Shield} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

const Cadastro = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptLGPD, setAcceptLGPD] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    
    return { minLength, hasUpper, hasLower, hasNumber }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!acceptTerms || !acceptLGPD) {
      toast.error('Você deve aceitar os termos de uso e política de privacidade')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    const passwordValidation = validatePassword(formData.password)
    if (!Object.values(passwordValidation).every(Boolean)) {
      toast.error('A senha não atende aos critérios de segurança')
      return
    }

    setIsLoading(true)

    try {
      const success = await register(formData.nome, formData.email, formData.password)
      if (success) {
        toast.success('Conta criada com sucesso!')
        navigate('/painel')
      } else {
        toast.error('Erro ao criar conta')
      }
    } catch (error) {
      toast.error('Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordValidation = validatePassword(formData.password)

  return (
    <div className="pt-20 min-h-screen bg-primary-black">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-primary-gray border border-gray-800 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="font-bebas text-4xl text-white mb-2">
                CADASTRO
              </h1>
              <p className="text-gray-400 font-montserrat">
                Crie sua conta no RaceMarketBR
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white font-montserrat font-600 mb-2">
                  Nome completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-primary-black border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:border-primary-red focus:outline-none transition-colors"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-montserrat font-600 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-primary-black border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:border-primary-red focus:outline-none transition-colors"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-montserrat font-600 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 bg-primary-black border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:border-primary-red focus:outline-none transition-colors"
                    placeholder="Sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className={`text-xs ${passwordValidation.minLength ? 'text-green-400' : 'text-red-400'}`}>
                      ✓ Mínimo 8 caracteres
                    </div>
                    <div className={`text-xs ${passwordValidation.hasUpper ? 'text-green-400' : 'text-red-400'}`}>
                      ✓ Uma letra maiúscula
                    </div>
                    <div className={`text-xs ${passwordValidation.hasLower ? 'text-green-400' : 'text-red-400'}`}>
                      ✓ Uma letra minúscula
                    </div>
                    <div className={`text-xs ${passwordValidation.hasNumber ? 'text-green-400' : 'text-red-400'}`}>
                      ✓ Um número
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white font-montserrat font-600 mb-2">
                  Confirmar senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 bg-primary-black border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:border-primary-red focus:outline-none transition-colors"
                    placeholder="Confirme sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-400">As senhas não coincidem</p>
                )}
              </div>

              <div className="space-y-3">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary-red bg-primary-black border-gray-800 rounded focus:ring-primary-red focus:ring-2"
                  />
                  <span className="text-gray-400 font-montserrat text-sm">
                    Aceito os{' '}
                    <Link to="/termos" className="text-primary-red hover:text-turbo-secondary">
                      termos de uso
                    </Link>
                  </span>
                </label>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={acceptLGPD}
                    onChange={(e) => setAcceptLGPD(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary-red bg-primary-black border-gray-800 rounded focus:ring-primary-red focus:ring-2"
                  />
                  <span className="text-gray-400 font-montserrat text-sm">
                    Aceito a{' '}
                    <Link to="/privacidade" className="text-primary-red hover:text-turbo-secondary">
                      política de privacidade
                    </Link>{' '}
                    (LGPD)
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || !acceptTerms || !acceptLGPD}
                className="w-full bg-primary-red hover:bg-turbo-dark text-white font-montserrat font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Criar conta</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400 font-montserrat">
                Já tem uma conta?{' '}
                <Link
                  to="/login"
                  className="text-primary-red hover:text-turbo-secondary font-600 transition-colors"
                >
                  Entrar
                </Link>
              </p>
            </div>

            <div className="mt-6 flex items-center space-x-2 text-gray-400 text-sm">
              <Shield className="w-4 h-4" />
              <span className="font-montserrat">
                Seus dados estão protegidos e seguros
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Cadastro
