
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {User, Mail, Lock, Eye, EyeOff, UserPlus, Shield, CheckCircle, X, AlertCircle} from 'lucide-react'
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
  
  const { register, loginWithGoogle, loginWithFacebook } = useAuthStore()
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
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    return { minLength, hasUpper, hasLower, hasNumber, hasSpecial }
  }

  const isPasswordValid = (password: string) => {
    const validation = validatePassword(password)
    return Object.values(validation).every(Boolean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Por favor, preencha todos os campos')
      return
    }

    if (!acceptTerms || !acceptLGPD) {
      toast.error('Você deve aceitar os termos de uso e política de privacidade')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (!isPasswordValid(formData.password)) {
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
    } catch (error: any) {
      let errorMessage = 'Erro ao criar conta'
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este e-mail já está em uso'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'O formato do e-mail é inválido'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres'
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Operação não permitida no provedor de autenticação'
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    try {
      const success = await loginWithGoogle()
      if (success) {
        toast.success('Cadastro com Google realizado com sucesso!')
        navigate('/painel')
      } else {
        toast.error('Erro ao cadastrar com Google')
      }
    } catch (error) {
      toast.error('Não foi possível cadastrar com o Google')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFacebookSignup = async () => {
    setIsLoading(true)
    try {
      const success = await loginWithFacebook()
      if (success) {
        toast.success('Cadastro com Facebook realizado com sucesso!')
        navigate('/painel')
      } else {
        toast.error('Erro ao cadastrar com Facebook')
      }
    } catch (error) {
      toast.error('Não foi possível cadastrar com o Facebook')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordValidation = validatePassword(formData.password)

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center space-x-2 text-xs ${met ? 'text-green-400' : 'text-red-400'}`}>
      {met ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
      <span>{text}</span>
    </div>
  )

  const getPasswordStrength = () => {
    const validation = validatePassword(formData.password)
    const score = Object.values(validation).filter(Boolean).length
    
    if (score === 0) return { text: '', color: '' }
    if (score <= 2) return { text: 'Fraca', color: 'text-red-400' }
    if (score <= 4) return { text: 'Média', color: 'text-yellow-400' }
    return { text: 'Forte', color: 'text-green-400' }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <div className="pt-20 min-h-screen bg-primary-black">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-primary-gray border border-gray-800 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-bebas text-4xl text-white mb-2">
                CADASTRO
              </h1>
              <p className="text-gray-400 font-montserrat">
                Crie sua conta no RaceMarketBR
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
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

              {/* Email */}
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

              {/* Password */}
              <div>
                <label className="block text-white font-montserrat font-600 mb-2">
                  Senha
                  {formData.password && passwordStrength.text && (
                    <span className={`ml-2 text-xs ${passwordStrength.color}`}>
                      ({passwordStrength.text})
                    </span>
                  )}
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
                
                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-3 space-y-1 p-3 bg-primary-black rounded-lg border border-gray-800">
                    <p className="text-xs text-gray-400 font-600 mb-2">Requisitos da senha:</p>
                    <PasswordRequirement met={passwordValidation.minLength} text="Mínimo 8 caracteres" />
                    <PasswordRequirement met={passwordValidation.hasUpper} text="Uma letra maiúscula" />
                    <PasswordRequirement met={passwordValidation.hasLower} text="Uma letra minúscula" />
                    <PasswordRequirement met={passwordValidation.hasNumber} text="Um número" />
                    <PasswordRequirement met={passwordValidation.hasSpecial} text="Um caractere especial" />
                  </div>
                )}
              </div>

              {/* Confirm Password */}
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
                  <p className="mt-1 text-xs text-red-400 flex items-center space-x-1">
                    <X className="w-3 h-3" />
                    <span>As senhas não coincidem</span>
                  </p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
                  <p className="mt-1 text-xs text-green-400 flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>As senhas coincidem</span>
                  </p>
                )}
              </div>

              {/* Terms and Privacy */}
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
                    <Link to="/termos" className="text-primary-red hover:text-turbo-secondary underline">
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
                    <Link to="/privacidade" className="text-primary-red hover:text-turbo-secondary underline">
                      política de privacidade
                    </Link>{' '}
                    (LGPD)
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !acceptTerms || !acceptLGPD || !isPasswordValid(formData.password)}
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

            {/* Divider */}
            <div className="flex items-center my-6">
              <hr className="flex-grow border-t border-gray-600" />
              <span className="mx-4 text-gray-400 text-sm font-montserrat">ou</span>
              <hr className="flex-grow border-t border-gray-600" />
            </div>

            {/* Social Signup Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoogleSignup}
                disabled={isLoading}
                className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-montserrat py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Cadastrar com Google</span>
              </button>

              <button
                onClick={handleFacebookSignup}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-montserrat py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Cadastrar com Facebook</span>
              </button>
            </div>

            {/* Login Link */}
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

            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center space-x-2 text-gray-400 text-sm">
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
