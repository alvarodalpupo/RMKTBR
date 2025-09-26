
import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { MessageCircleDashed as MessageCircle, Instagram, Mail, Phone, Send, MapPin, CheckCircle, Clock, Shield, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useContactMessagesStore } from '../stores/contactMessagesStore';

interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const Contato = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactForm>();
  const { addMessage } = useContactMessagesStore();

  const onSubmit = async (data: ContactForm) => {
    try {
      // Adicionar mensagem ao store
      addMessage({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message
      });

      // Simular envio de email (aqui seria integração real)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Mensagem enviada com sucesso! Nossa equipe retornará em até 24 horas.');
      reset();
    } catch (error) {
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    }
  };

  const contactInfo = [
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    info: '(11) 99999-9999',
    link: 'https://wa.me/5511999999999',
    color: 'text-green-400',
    description: 'Resposta imediata'
  },
  {
    icon: Instagram,
    title: 'Instagram',
    info: '@racemarketbr',
    link: 'https://instagram.com/racemarketbr',
    color: 'text-pink-400',
    description: 'Novidades e conteúdo'
  },
  {
    icon: Mail,
    title: 'E-mail',
    info: 'contato@racemarketbr.com.br',
    link: 'mailto:contato@racemarketbr.com.br',
    color: 'text-blue-400',
    description: 'Suporte técnico'
  },
  {
    icon: MapPin,
    title: 'Localização',
    info: 'São Paulo, SP',
    link: 'https://maps.google.com/?q=São+Paulo,+SP',
    color: 'text-red-400',
    description: 'Sede da empresa'
  }];


  const trustElements = [
  {
    icon: Shield,
    title: 'Dados Protegidos',
    description: 'Suas informações são criptografadas e seguras'
  },
  {
    icon: Clock,
    title: 'Resposta Rápida',
    description: 'Retornamos em até 24 horas úteis'
  },
  {
    icon: Zap,
    title: 'Suporte Especializado',
    description: 'Equipe experiente em carros esportivos'
  }];


  return (
    <div className="pt-20 min-h-screen bg-primary-black">
      {/* Header */}
      <section className="bg-primary-gray py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}>

            <h1 className="font-bebas text-5xl md:text-6xl text-white mb-4">
              ENTRE EM <span className="text-primary-red">CONTATO</span>
            </h1>
            <p className="font-montserrat text-gray-400 text-lg max-w-2xl mx-auto">
              Tire suas dúvidas, envie sugestões ou solicite informações sobre nossos serviços
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8">

            <div>
              <h2 className="font-bebas text-3xl text-white mb-6">
                FALE CONOSCO
              </h2>
              <p className="text-gray-400 font-montserrat leading-relaxed mb-8">
                Estamos aqui para ajudar você a encontrar o carro dos seus sonhos ou vender o seu veículo. 
                Nossa equipe está sempre disponível para esclarecer dúvidas e oferecer o melhor atendimento.
              </p>
            </div>

            {/* Trust Elements */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              {trustElements.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center space-x-3 p-3 bg-primary-gray/50 rounded-lg border border-gray-800">

                    <IconComponent className="w-5 h-5 text-primary-red" />
                    <div>
                      <h4 className="font-montserrat font-600 text-white text-sm">
                        {item.title}
                      </h4>
                      <p className="text-gray-400 text-xs">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>);

              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactInfo.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <motion.a
                    key={item.title}
                    href={item.link}
                    target={item.link.startsWith('http') ? '_blank' : '_self'}
                    rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="bg-primary-gray border border-gray-800 rounded-xl p-6 hover:border-primary-red transition-all duration-300 transform hover:scale-105 group">

                    <IconComponent className={`w-8 h-8 ${item.color} mb-4 group-hover:scale-110 transition-transform`} />
                    <h3 className="font-montserrat font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 font-montserrat mb-1">
                      {item.info}
                    </p>
                    <p className="text-gray-500 font-montserrat text-sm">
                      {item.description}
                    </p>
                  </motion.a>);

              })}
            </div>

            {/* Business Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-primary-gray border border-gray-800 rounded-xl p-6">

              <h3 className="font-montserrat font-bold text-white mb-4">
                Horário de Atendimento
              </h3>
              <div className="space-y-2 text-gray-400 font-montserrat">
                <div className="flex justify-between">
                  <span>Segunda a Sexta:</span>
                  <span>9h às 18h</span>
                </div>
                <div className="flex justify-between">
                  <span>Sábado:</span>
                  <span>9h às 14h</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingo:</span>
                  <span>Fechado</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-primary-gray border border-gray-800 rounded-xl p-8">

            <h2 className="font-bebas text-3xl text-white mb-6">
              ENVIE UMA MENSAGEM
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-montserrat font-600 mb-2">
                    Nome *
                  </label>
                  <input
                    {...register('name', { required: 'Nome é obrigatório' })}
                    type="text"
                    className="w-full bg-primary-black border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-red focus:outline-none transition-colors"
                    placeholder="Seu nome completo" />

                  {errors.name &&
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                  }
                </div>

                <div>
                  <label className="block text-white font-montserrat font-600 mb-2">
                    E-mail *
                  </label>
                  <input
                    {...register('email', {
                      required: 'E-mail é obrigatório',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'E-mail inválido'
                      }
                    })}
                    type="email"
                    className="w-full bg-primary-black border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-red focus:outline-none transition-colors"
                    placeholder="seu@email.com" />

                  {errors.email &&
                  <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                  }
                </div>
              </div>

              <div>
                <label className="block text-white font-montserrat font-600 mb-2">
                  Telefone (opcional)
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full bg-primary-black border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-red focus:outline-none transition-colors"
                  placeholder="(11) 99999-9999" />

              </div>

              <div>
                <label className="block text-white font-montserrat font-600 mb-2">
                  Assunto *
                </label>
                <select
                  {...register('subject', { required: 'Assunto é obrigatório' })}
                  className="w-full bg-primary-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-primary-red focus:outline-none transition-colors">

                  <option value="">Selecione um assunto</option>
                  <option value="duvida">Dúvida geral</option>
                  <option value="anuncio">Problema com anúncio</option>
                  <option value="venda">Ajuda para vender</option>
                  <option value="compra">Ajuda para comprar</option>
                  <option value="parceria">Parceria</option>
                  <option value="outro">Outro</option>
                </select>
                {errors.subject &&
                <p className="text-red-400 text-sm mt-1">{errors.subject.message}</p>
                }
              </div>

              <div>
                <label className="block text-white font-montserrat font-600 mb-2">
                  Mensagem *
                </label>
                <textarea
                  {...register('message', {
                    required: 'Mensagem é obrigatória',
                    minLength: {
                      value: 10,
                      message: 'Mensagem deve ter pelo menos 10 caracteres'
                    }
                  })}
                  rows={5}
                  className="w-full bg-primary-black border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-red focus:outline-none transition-colors resize-none"
                  placeholder="Digite sua mensagem detalhadamente..." />

                {errors.message &&
                <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>
                }
              </div>

              {/* Expected Response Time */}
              <div className="bg-blue-400/10 border border-blue-400/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-montserrat font-600 text-sm">
                    Tempo de Resposta
                  </span>
                </div>
                <p className="text-gray-300 text-sm font-montserrat">
                  Nossa equipe responderá sua mensagem em até 24 horas úteis. 
                  Para urgências, utilize nosso WhatsApp.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-red hover:bg-turbo-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-montserrat font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">

                {isSubmitting ?
                <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Enviando...</span>
                  </> :

                <>
                    <Send className="w-5 h-5" />
                    <span>Enviar Mensagem</span>
                  </>
                }
              </button>
            </form>
          </motion.div>
        </div>

        {/* Instagram Feed Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-16">

          <div className="text-center mb-12">
            <h2 className="font-bebas text-4xl text-white mb-4">
              SIGA NO <span className="text-primary-red">INSTAGRAM</span>
            </h2>
            <p className="text-gray-400 font-montserrat">
              Acompanhe os lançamentos e novidades do mundo automotivo
            </p>
          </div>

          <div className="bg-primary-gray border border-gray-800 rounded-xl p-8 text-center">
            <Instagram className="w-16 h-16 text-pink-400 mx-auto mb-4" />
            <h3 className="font-montserrat font-bold text-white text-xl mb-4">
              @racemarketbr
            </h3>
            <p className="text-gray-400 font-montserrat mb-6">
              Fotos exclusivas, bastidores e muito conteúdo automotivo
            </p>
            <a
              href="https://instagram.com/racemarketbr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-montserrat font-bold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">

              Seguir no Instagram
            </a>
          </div>
        </motion.section>

        {/* Success Stats */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-16">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            








            
            








            
            








          </div>
        </motion.section>
      </div>
    </div>);

};

export default Contato;