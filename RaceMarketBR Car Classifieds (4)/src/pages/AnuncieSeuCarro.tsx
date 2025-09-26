
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {Upload, X, Car, MapPin, DollarSign, FileText, Phone, Camera, Plus, Zap, Settings, AlertTriangle, RefreshCw, Shield, Lock, UserPlus} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useListingsStore } from '../stores/listingsStore';
import { estadosCidades, buscarCidadesPorEstado, formatarNomeEstado } from '../data/estados-cidades';
import { formatarPreco, extrairValorNumerico, formatarTelefone, validarPreco, validarTelefone } from '../utils/formatters';
import CidadeSelector from '../components/CidadeSelector';
import TrustBadge from '../components/TrustBadge';
import SecurityTooltip from '../components/SecurityTooltip';
import SocialProofCounter from '../components/SocialProofCounter';
import toast from 'react-hot-toast';

const AnuncieSeuCarro = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createListing, isLoading } = useListingsStore();

  const [formData, setFormData] = useState({
    titulo: '',
    categoria: 'turbo' as 'turbo' | 'aspirado' | 'original' | 'pista',
    ano: new Date().getFullYear(),
    preco: '',
    cidade: '',
    uf: '',
    descricao: '',
    telefone: '',
    email: '', // Novo campo para visitantes não logados
    nome_anunciante: '', // Novo campo para visitantes não logados
    images: [] as string[],
    power_whp: '',
    torque_kgfm: '',
    tracao: '' as 'dianteira' | 'traseira' | 'integral' | '',
    aceita_troca: false
  });

  const [dragOver, setDragOver] = useState(false);
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState<string[]>([]);

  // Atualizar cidades quando estado mudar
  useEffect(() => {
    if (formData.uf) {
      const cidades = buscarCidadesPorEstado(formData.uf);
      setCidadesDisponiveis(cidades);

      // Reset cidade se não estiver na lista do novo estado
      if (formData.cidade && !cidades.includes(formData.cidade)) {
        setFormData((prev) => ({ ...prev, cidade: '' }));
      }
    } else {
      setCidadesDisponiveis([]);
      setFormData((prev) => ({ ...prev, cidade: '' }));
    }
  }, [formData.uf, formData.cidade]);

  const categorias = [
    { id: 'turbo', label: 'Turbo', color: 'turbo-primary' },
    { id: 'aspirado', label: 'Aspirado', color: 'aspirado-primary' },
    { id: 'original', label: 'Original', color: 'original-primary' },
    { id: 'pista', label: 'Pista', color: 'pista-primary' }
  ];

  const tiposTracao = [
    {
      id: 'dianteira',
      label: 'Tração Dianteira',
      sigla: 'FWD',
      description: 'Força aplicada nas rodas dianteiras',
      color: 'blue'
    },
    {
      id: 'traseira',
      label: 'Tração Traseira',
      sigla: 'RWD',
      description: 'Força aplicada nas rodas traseiras',
      color: 'red'
    },
    {
      id: 'integral',
      label: 'Tração Integral',
      sigla: 'AWD',
      description: 'Força em todas as rodas',
      color: 'green'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const novoEstado = e.target.value;
    setFormData((prev) => ({
      ...prev,
      uf: novoEstado,
      cidade: '' // Reset cidade quando estado muda
    }));
  };

  const handleCidadeChange = (cidade: string) => {
    setFormData((prev) => ({ ...prev, cidade }));
  };

  const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorDigitado = e.target.value;
    const precoFormatado = formatarPreco(valorDigitado);
    setFormData((prev) => ({ ...prev, preco: precoFormatado }));
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorDigitado = e.target.value;
    const telefoneFormatado = formatarTelefone(valorDigitado);
    setFormData((prev) => ({ ...prev, telefone: telefoneFormatado }));
  };

  const handleCategoryChange = (categoria: 'turbo' | 'aspirado' | 'original' | 'pista') => {
    setFormData((prev) => ({ ...prev, categoria }));
  };

  const handleTracaoChange = (tracao: 'dianteira' | 'traseira' | 'integral') => {
    setFormData((prev) => ({ ...prev, tracao }));
  };

  const handleAceitaTrocaChange = (aceita: boolean) => {
    setFormData((prev) => ({ ...prev, aceita_troca: aceita }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, imageUrl].slice(0, 6) // Máximo 6 imagens
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, imageUrl].slice(0, 6)
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (formData.images.length === 0) {
      toast.error('Adicione pelo menos uma imagem');
      return;
    }

    if (!formData.tracao) {
      toast.error('Selecione o tipo de tração do veículo');
      return;
    }

    if (!formData.telefone.trim()) {
      toast.error('WhatsApp é obrigatório');
      return;
    }

    if (!validarTelefone(formData.telefone)) {
      toast.error('Número de WhatsApp inválido');
      return;
    }

    if (!formData.uf) {
      toast.error('Selecione um estado');
      return;
    }

    if (!formData.cidade) {
      toast.error('Selecione uma cidade');
      return;
    }

    if (!validarPreco(formData.preco)) {
      toast.error('Preço inválido');
      return;
    }

    // Validações específicas para visitantes não logados
    if (!user) {
      if (!formData.nome_anunciante.trim()) {
        toast.error('Nome do anunciante é obrigatório');
        return;
      }

      if (!formData.email.trim()) {
        toast.error('E-mail é obrigatório');
        return;
      }

      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('E-mail inválido');
        return;
      }
    }

    // Para demonstração, vamos usar URLs de exemplo do Pexels se não houver imagens
    const finalImages = formData.images.length > 0 ?
      formData.images :
      ['https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg'];

    const listingData = {
      ...formData,
      user_id: user?.id || 'guest', // Para usuários não logados, usar 'guest'
      destaque: false,
      images: finalImages,
      power_whp: formData.power_whp ? parseFloat(formData.power_whp) : undefined,
      torque_kgfm: formData.torque_kgfm ? parseFloat(formData.torque_kgfm) : undefined,
      tracao: formData.tracao as 'dianteira' | 'traseira' | 'integral',
      telefone: formData.telefone.trim(),
      preco: formData.preco, // Mantém formatado para exibição
      // Campos específicos para visitantes não logados
      nome_anunciante: user ? undefined : formData.nome_anunciante.trim(),
      email: user ? undefined : formData.email.trim(),
      status: 'pendente' // Todos os anúncios começam como pendentes
    };

    const success = await createListing(listingData);

    if (success) {
      toast.success('Anúncio enviado para revisão! Você será notificado por e-mail quando for aprovado.');
      
      // Se o usuário não estiver logado, mostrar mensagem específica
      if (!user) {
        toast.success('📧 Verifique seu e-mail para acompanhar o status do anúncio', {
          duration: 5000
        });
      }

      // Limpar formulário após sucesso
      setFormData({
        titulo: '',
        categoria: 'turbo',
        ano: new Date().getFullYear(),
        preco: '',
        cidade: '',
        uf: '',
        descricao: '',
        telefone: '',
        email: '',
        nome_anunciante: '',
        images: [],
        power_whp: '',
        torque_kgfm: '',
        tracao: '',
        aceita_troca: false
      });

      // Redirecionar baseado no status do usuário
      if (user) {
        navigate('/painel');
      } else {
        // Para visitantes, redirecionar para a página inicial
        navigate('/');
      }
    } else {
      toast.error('Erro ao criar anúncio. Tente novamente.');
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-primary-black">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header com Elementos de Confiança */}
          <div className="text-center mb-8">
            {/* Aviso para Visitantes Não Logados */}
            {!user && (
              <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <UserPlus className="w-6 h-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-blue-400 font-montserrat font-600 mb-1">
                      🚀 Anuncie Gratuitamente - Sem Cadastro Necessário!
                    </h3>
                    <p className="text-gray-300 font-montserrat text-sm">
                      Você pode criar seu anúncio imediatamente. Após a aprovação, enviaremos uma confirmação por e-mail.
                      <br />
                      <strong>Dica:</strong> <a href="/cadastro" className="text-blue-400 underline">Crie uma conta</a> para gerenciar seus anúncios facilmente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Título Principal com Ícone de Segurança */}
            <div className="flex items-center justify-center space-x-4 mb-4">
              <SecurityTooltip position="bottom">
                <Shield className="w-8 h-8 text-green-500" />
              </SecurityTooltip>

              <h1 className="font-bebas text-4xl md:text-5xl text-white">
                ANUNCIE SEU CARRO
              </h1>

              <SecurityTooltip position="bottom">
                <Lock className="w-8 h-8 text-green-500" />
              </SecurityTooltip>
            </div>

            <p className="text-gray-400 font-montserrat text-lg mb-6">
              {user ? 
                'Preencha os dados do seu veículo e envie para aprovação' :
                'Preencha os dados do seu veículo - É rápido e gratuito!'
              }
            </p>

            {/* Social Proof Counters */}
            <SocialProofCounter />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Dados do Anunciante - APENAS para visitantes não logados */}
            {!user && (
              <div className="bg-gradient-to-br from-blue-900/20 via-primary-gray to-blue-800/10 border-2 border-blue-500/30 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                
                <div className="relative z-10">
                  <h2 className="font-bebas text-2xl text-white mb-6 flex items-center">
                    <UserPlus className="w-6 h-6 mr-3 text-blue-500" />
                    SEUS DADOS
                    <div className="ml-4 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-montserrat font-700">
                        OBRIGATÓRIO
                      </span>
                    </div>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-montserrat font-600 mb-2">
                        Seu Nome *
                      </label>
                      <input
                        type="text"
                        name="nome_anunciante"
                        value={formData.nome_anunciante}
                        onChange={handleInputChange}
                        placeholder="Ex: João Silva"
                        className="w-full p-3 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white font-montserrat font-600 mb-2">
                        Seu E-mail *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="seu@email.com"
                        className="w-full p-3 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat focus:border-blue-500 focus:outline-none"
                        required
                      />
                      <p className="text-gray-500 text-xs mt-1 font-montserrat">
                        Usaremos para notificar sobre o status do anúncio
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Informações Básicas */}
            <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
              <h2 className="font-bebas text-2xl text-white mb-6 flex items-center">
                <Car className="w-6 h-6 mr-3 text-primary-red" />
                INFORMAÇÕES DO VEÍCULO
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-montserrat font-600 mb-2">
                    Título do Anúncio *
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    placeholder="Ex: Honda Civic Type R 2019"
                    className="w-full p-3 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat focus:border-primary-red focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-montserrat font-600 mb-2">
                    Ano *
                  </label>
                  <input
                    type="number"
                    name="ano"
                    value={formData.ano}
                    onChange={handleInputChange}
                    min="1950"
                    max={new Date().getFullYear() + 1}
                    className="w-full p-3 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat focus:border-primary-red focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Categoria */}
              <div className="mt-6">
                <label className="block text-white font-montserrat font-600 mb-4">
                  Categoria *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categorias.map((categoria) => (
                    <button
                      key={categoria.id}
                      type="button"
                      onClick={() => handleCategoryChange(categoria.id as any)}
                      className={`p-4 rounded-lg border-2 transition-all font-montserrat font-600 ${
                        formData.categoria === categoria.id
                          ? `border-${categoria.color} bg-${categoria.color}/10 text-${categoria.color}`
                          : 'border-gray-800 bg-primary-black text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {categoria.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Aceita Troca - SEÇÃO DESTACADA */}
            <div className="bg-gradient-to-br from-green-900/20 via-primary-gray to-green-800/10 border-2 border-green-500/30 rounded-xl p-6 relative overflow-hidden">
              {/* Efeito de brilho */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
              
              <div className="relative z-10">
                <h2 className="font-bebas text-2xl text-white mb-6 flex items-center">
                  <RefreshCw className="w-6 h-6 mr-3 text-green-500" />
                  ACEITA TROCA?
                  <div className="ml-4 flex items-center space-x-2">
                    <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-montserrat font-700">
                      NOVO
                    </span>
                  </div>
                </h2>

                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div>
                      <h3 className="text-green-400 font-montserrat font-600 mb-1 flex items-center">
                        🔄 Aumente suas Chances de Venda
                      </h3>
                      <p className="text-gray-300 font-montserrat text-sm">
                        Anúncios que aceitam troca recebem <strong>40% mais contatos</strong>. 
                        Muitos compradores têm veículos para trocar e preferem essa modalidade.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleAceitaTrocaChange(true)}
                    className={`group relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      formData.aceita_troca
                        ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/25'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">✅</div>
                      <div className={`font-montserrat font-600 text-lg mb-2 ${
                        formData.aceita_troca ? 'text-white' : 'text-gray-300'
                      }`}>
                        Sim, aceito troca
                      </div>
                      <div className={`text-sm font-montserrat ${
                        formData.aceita_troca ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Aberto a negociações de troca
                      </div>
                    </div>

                    {formData.aceita_troca && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAceitaTrocaChange(false)}
                    className={`group relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      !formData.aceita_troca
                        ? 'border-red-500 bg-red-500/20 shadow-lg shadow-red-500/25'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">💰</div>
                      <div className={`font-montserrat font-600 text-lg mb-2 ${
                        !formData.aceita_troca ? 'text-white' : 'text-gray-300'
                      }`}>
                        Não, apenas venda
                      </div>
                      <div className={`text-sm font-montserrat ${
                        !formData.aceita_troca ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Somente negociação em dinheiro
                      </div>
                    </div>

                    {!formData.aceita_troca && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Dados de Performance */}
            <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
              <h2 className="font-bebas text-2xl text-white mb-6 flex items-center">
                <Zap className="w-6 h-6 mr-3 text-yellow-500" />
                DADOS DE PERFORMANCE
                <span className="ml-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs px-2 py-1 rounded-full font-montserrat font-600">
                  OPCIONAL
                </span>
              </h2>

              <div className="bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border border-yellow-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <div>
                    <h3 className="text-yellow-400 font-montserrat font-600 mb-1">
                      📊 Dados de Performance Aumentam Visualizações
                    </h3>
                    <p className="text-gray-300 font-montserrat text-sm">
                      Anúncios com dados de potência e torque recebem até <strong>3x mais visualizações</strong>. 
                      Compradores procuram essas informações para comparar veículos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-montserrat font-600 mb-2">
                    Potência (WHP)
                  </label>
                  <input
                    type="number"
                    name="power_whp"
                    value={formData.power_whp}
                    onChange={handleInputChange}
                    placeholder="Ex: 320"
                    min="50"
                    max="2000"
                    className="w-full p-3 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat focus:border-yellow-500 focus:outline-none"
                  />
                  <p className="text-gray-500 text-xs mt-1 font-montserrat">
                    Potência nas rodas (Wheel Horsepower)
                  </p>
                </div>

                <div>
                  <label className="block text-white font-montserrat font-600 mb-2">
                    Torque (kgf.m)
                  </label>
                  <input
                    type="number"
                    name="torque_kgfm"
                    value={formData.torque_kgfm}
                    onChange={handleInputChange}
                    placeholder="Ex: 42.5"
                    min="10"
                    max="200"
                    step="0.1"
                    className="w-full p-3 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat focus:border-yellow-500 focus:outline-none"
                  />
                  <p className="text-gray-500 text-xs mt-1 font-montserrat">
                    Torque em quilograma-força por metro
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-blue-400 font-montserrat text-sm flex items-center">
                  💡 <span className="ml-2"><strong>Dica:</strong> Dados de dinamômetro são mais precisos. Se não souber os valores exatos, deixe em branco.</span>
                </p>
              </div>
            </div>

            {/* Tipo de Tração */}
            <div className="bg-gradient-to-br from-primary-gray via-primary-gray to-gray-900 border-2 border-primary-red/30 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-red to-transparent"></div>
              
              <div className="relative z-10">
                <h2 className="font-bebas text-2xl text-white mb-6 flex items-center">
                  <Settings className="w-6 h-6 mr-3 text-primary-red" />
                  TIPO DE TRAÇÃO
                  <div className="ml-4 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                    <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-montserrat font-700 animate-pulse">
                      OBRIGATÓRIO
                    </span>
                  </div>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tiposTracao.map((tipo) => (
                    <button
                      key={tipo.id}
                      type="button"
                      onClick={() => handleTracaoChange(tipo.id as any)}
                      className={`group relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        formData.tracao === tipo.id
                          ? `border-${tipo.color}-500 bg-${tipo.color}-500/20 shadow-lg shadow-${tipo.color}-500/25`
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`text-xs font-montserrat font-700 mb-2 ${
                          formData.tracao === tipo.id ? `text-${tipo.color}-400` : 'text-gray-400'
                        }`}>
                          {tipo.sigla}
                        </div>
                        <div className={`font-montserrat font-600 text-sm mb-2 ${
                          formData.tracao === tipo.id ? 'text-white' : 'text-gray-300'
                        }`}>
                          {tipo.label}
                        </div>
                        <div className={`text-xs font-montserrat ${
                          formData.tracao === tipo.id ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {tipo.description}
                        </div>
                      </div>

                      {formData.tracao === tipo.id && (
                        <div className={`absolute top-2 right-2 w-3 h-3 bg-${tipo.color}-500 rounded-full animate-pulse`}></div>
                      )}
                    </button>
                  ))}
                </div>

                {!formData.tracao && (
                  <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-yellow-400 font-montserrat text-sm flex items-center">
                      ⚠️ <span className="ml-2">Selecione o tipo de tração para continuar</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Localização e Preço - ATUALIZADO */}
            <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
              <h2 className="font-bebas text-2xl text-white mb-6 flex items-center">
                <MapPin className="w-6 h-6 mr-3 text-primary-red" />
                LOCALIZAÇÃO E PREÇO
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Estado */}
                <div>
                  <label className="block text-white font-montserrat font-600 mb-2">
                    Estado *
                  </label>
                  <select
                    name="uf"
                    value={formData.uf}
                    onChange={handleEstadoChange}
                    className="w-full p-3 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat focus:border-primary-red focus:outline-none"
                    required
                  >
                    <option value="">Selecione o Estado</option>
                    {estadosCidades.map((estado) => (
                      <option key={estado.codigo} value={estado.codigo}>
                        {formatarNomeEstado(estado.codigo)}
                      </option>
                    ))}
                  </select>
                  {formData.uf && (
                    <p className="text-green-400 text-xs mt-1 font-montserrat">
                      ✓ {cidadesDisponiveis.length} cidades disponíveis
                    </p>
                  )}
                </div>

                {/* Cidade - Componente personalizado */}
                <div>
                  <CidadeSelector
                    cidades={cidadesDisponiveis}
                    cidadeSelecionada={formData.cidade}
                    onCidadeChange={handleCidadeChange}
                    estadoSelecionado={formData.uf}
                    disabled={!formData.uf}
                  />
                </div>

                {/* Preço com formatação automática */}
                <div>
                  <label className="block text-white font-montserrat font-600 mb-2">
                    Preço *
                  </label>
                  <input
                    type="text"
                    name="preco"
                    value={formData.preco}
                    onChange={handlePrecoChange}
                    placeholder="Digite o valor"
                    className="w-full p-3 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat focus:border-primary-red focus:outline-none"
                    required
                  />
                  <p className="text-gray-500 text-xs mt-1 font-montserrat">
                    {formData.preco
                      ? `Valor: ${formData.preco}`
                      : 'Digite apenas números (ex: 285000)'
                    }
                  </p>
                  {formData.preco && !validarPreco(formData.preco) && (
                    <p className="text-red-400 text-xs mt-1 font-montserrat">
                      ⚠️ Preço deve estar entre R$ 1,00 e R$ 10.000.000,00
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contato - WhatsApp OBRIGATÓRIO com formatação */}
            <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
              <h2 className="font-bebas text-2xl text-white mb-6 flex items-center">
                <Phone className="w-6 h-6 mr-3 text-primary-red" />
                CONTATO
                <div className="ml-4 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-montserrat font-700">
                    OBRIGATÓRIO
                  </span>
                </div>
              </h2>

              <div className="bg-gradient-to-r from-red-500/10 to-green-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <div>
                    <h3 className="text-red-400 font-montserrat font-600 mb-1">
                      📱 WhatsApp é Obrigatório
                    </h3>
                    <p className="text-gray-300 font-montserrat text-sm">
                      O WhatsApp é a principal forma de contato entre compradores e vendedores. 
                      <strong> É obrigatório para publicar seu anúncio.</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white font-montserrat font-600 mb-2">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleTelefoneChange}
                  placeholder="Digite o número"
                  className="w-full p-3 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat focus:border-primary-red focus:outline-none"
                  required
                />
                <p className="text-gray-500 text-xs mt-1 font-montserrat">
                  {formData.telefone
                    ? `Formatado: ${formData.telefone}`
                    : 'Digite apenas números com DDD (ex: 11999999999)'
                  }
                </p>
                {formData.telefone && !validarTelefone(formData.telefone) && (
                  <p className="text-red-400 text-xs mt-1 font-montserrat">
                    ⚠️ Número inválido. Use formato: (11) 99999-9999
                  </p>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
              <h2 className="font-bebas text-2xl text-white mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-primary-red" />
                DESCRIÇÃO
              </h2>

              <div>
                <label className="block text-white font-montserrat font-600 mb-2">
                  Descrição do Veículo *
                </label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  placeholder="Descreva as características, modificações, estado de conservação..."
                  rows={6}
                  className="w-full p-3 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat focus:border-primary-red focus:outline-none resize-none"
                  required
                />
              </div>
            </div>

            {/* Upload de Imagens */}
            <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
              <h2 className="font-bebas text-2xl text-white mb-6 flex items-center">
                <Camera className="w-6 h-6 mr-3 text-primary-red" />
                FOTOS DO VEÍCULO
              </h2>

              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragOver
                    ? 'border-primary-red bg-primary-red/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 font-montserrat mb-4">
                  Arraste as imagens aqui ou clique para selecionar
                </p>
                <label className="bg-primary-red hover:bg-turbo-dark text-white font-montserrat font-600 px-6 py-3 rounded-lg cursor-pointer transition-colors inline-flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Selecionar Fotos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-gray-500 text-sm mt-2">
                  Máximo 6 imagens - JPG, PNG ou WebP
                </p>
              </div>

              {/* Preview das Imagens */}
              {formData.images.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-white font-montserrat font-600 mb-4">
                    Imagens Selecionadas ({formData.images.length}/6)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botão de Envio com Badge de Confiança */}
            <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
              {/* Badge de Proteção Final */}
              <div className="flex justify-center mb-6">
                <TrustBadge variant="protected" size="lg" />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <h3 className="text-blue-400 font-montserrat font-600 mb-1">
                      Processo de Aprovação
                    </h3>
                    <p className="text-gray-300 font-montserrat text-sm">
                      Seu anúncio será enviado para análise da nossa equipe. 
                      {user ? 
                        ' Você receberá uma notificação quando for aprovado ou se precisar de alguma correção.' :
                        ' Você receberá um e-mail quando for aprovado ou se precisar de alguma correção.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-red hover:bg-turbo-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bebas text-xl py-4 rounded-lg transition-colors flex items-center justify-center space-x-3"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>ENVIANDO...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6" />
                    <span>ENVIAR PARA APROVAÇÃO</span>
                  </>
                )}
              </button>

              {/* Mensagem de incentivo para visitantes */}
              {!user && (
                <div className="mt-4 text-center">
                  <p className="text-gray-400 font-montserrat text-sm">
                    💡 <a href="/cadastro" className="text-blue-400 underline">Crie uma conta</a> para gerenciar seus anúncios e receber mais recursos!
                  </p>
                </div>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AnuncieSeuCarro;
