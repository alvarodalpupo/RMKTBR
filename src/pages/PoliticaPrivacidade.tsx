
import { motion } from 'framer-motion'
import {ArrowLeft, Shield, Lock, Eye, Database, UserCheck} from 'lucide-react'
import { Link } from 'react-router-dom'

const PoliticaPrivacidade = () => {
  return (
    <div className="pt-20 min-h-screen bg-primary-black">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <Link 
            to="/cadastro" 
            className="inline-flex items-center space-x-2 text-primary-red hover:text-turbo-secondary mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-montserrat">Voltar ao cadastro</span>
          </Link>

          <div className="bg-primary-gray border border-gray-800 rounded-2xl p-8">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4">
                <Shield className="w-16 h-16 text-primary-red" />
              </div>
              <h1 className="font-bebas text-5xl text-white mb-4">
                POLÍTICA DE PRIVACIDADE
              </h1>
              <p className="text-gray-400 font-montserrat text-lg">
                RaceMarketBR - Proteção de Dados e Privacidade
              </p>
              <p className="text-gray-500 font-montserrat text-sm mt-2">
                Última atualização: Janeiro de 2025 | Conforme LGPD (Lei 13.709/2018)
              </p>
            </div>

            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6 mb-8">
              <div className="flex items-start space-x-3">
                <Lock className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-blue-400 font-montserrat font-bold mb-2">
                    COMPROMISSO COM SUA PRIVACIDADE
                  </h3>
                  <p className="text-gray-300 font-montserrat">
                    O RaceMarketBR está comprometido com a proteção de seus dados pessoais. 
                    Esta política explica como coletamos, usamos e protegemos suas informações 
                    em nossa plataforma de intermediação automotiva.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8 text-gray-300 font-montserrat">
              <section>
                <h2 className="text-2xl font-bebas text-white mb-4 flex items-center space-x-2">
                  <Database className="w-6 h-6 text-primary-red" />
                  <span>1. INFORMAÇÕES QUE COLETAMOS</span>
                </h2>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">1.1. Dados Fornecidos por Você:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Nome completo e informações de contato</li>
                    <li>Endereço de e-mail e telefone</li>
                    <li>Localização (cidade/estado)</li>
                    <li>Informações sobre veículos anunciados</li>
                    <li>Fotos e descrições dos veículos</li>
                    <li>Preferências de comunicação</li>
                  </ul>
                  
                  <h3 className="text-xl font-bold text-white mt-6">1.2. Dados Coletados Automaticamente:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Informações de navegação e uso da plataforma</li>
                    <li>Endereço IP e dados de localização aproximada</li>
                    <li>Tipo de dispositivo e navegador utilizado</li>
                    <li>Cookies e tecnologias similares</li>
                    <li>Logs de acesso e atividade na plataforma</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bebas text-white mb-4 flex items-center space-x-2">
                  <Eye className="w-6 h-6 text-primary-red" />
                  <span>2. COMO UTILIZAMOS SEUS DADOS</span>
                </h2>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">2.1. Finalidades do Tratamento:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Intermediação:</strong> Facilitar o contato entre vendedores e compradores</li>
                    <li><strong>Divulgação:</strong> Exibir anúncios de veículos na plataforma</li>
                    <li><strong>Comunicação:</strong> Enviar notificações sobre a plataforma e anúncios</li>
                    <li><strong>Suporte:</strong> Prestar atendimento ao cliente</li>
                    <li><strong>Melhorias:</strong> Aprimorar nossos serviços e experiência do usuário</li>
                    <li><strong>Segurança:</strong> Prevenir fraudes e proteger a plataforma</li>
                    <li><strong>Cumprimento legal:</strong> Atender obrigações legais e regulamentares</li>
                  </ul>
                  
                  <h3 className="text-xl font-bold text-white mt-6">2.2. Base Legal (LGPD):</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Consentimento do titular dos dados</li>
                    <li>Execução de contrato</li>
                    <li>Legítimo interesse</li>
                    <li>Cumprimento de obrigação legal</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bebas text-white mb-4">3. COMPARTILHAMENTO DE DADOS</h2>
                <div className="space-y-4">
                  <p>
                    <strong>3.1.</strong> Seus dados pessoais podem ser compartilhados nas seguintes situações:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Com outros usuários interessados em seus anúncios (apenas informações de contato necessárias)</li>
                    <li>Com prestadores de serviços que nos auxiliam na operação da plataforma</li>
                    <li>Para cumprimento de obrigações legais ou ordem judicial</li>
                    <li>Em caso de transferência de controle societário (com prévia notificação)</li>
                  </ul>
                  
                  <p className="mt-4">
                    <strong>3.2.</strong> <span className="text-red-400">NUNCA vendemos seus dados pessoais</span> para terceiros para fins comerciais.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bebas text-white mb-4">4. PROTEÇÃO E SEGURANÇA</h2>
                <div className="space-y-4">
                  <p>
                    <strong>4.1.</strong> Implementamos medidas técnicas e organizacionais para proteger seus dados:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Criptografia de dados em trânsito e em repouso</li>
                    <li>Controles de acesso e autenticação</li>
                    <li>Monitoramento de segurança 24/7</li>
                    <li>Backups seguros e regulares</li>
                    <li>Treinamento de equipe em proteção de dados</li>
                  </ul>
                  
                  <p className="mt-4">
                    <strong>4.2.</strong> Em caso de incidente de segurança que possa afetar seus dados, 
                    notificaremos conforme exigido pela LGPD.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bebas text-white mb-4 flex items-center space-x-2">
                  <UserCheck className="w-6 h-6 text-primary-red" />
                  <span>5. SEUS DIREITOS (LGPD)</span>
                </h2>
                <div className="space-y-4">
                  <p>
                    <strong>5.1.</strong> Você possui os seguintes direitos sobre seus dados pessoais:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Acesso:</strong> Consultar quais dados possuímos sobre você</li>
                    <li><strong>Correção:</strong> Solicitar correção de dados incorretos ou incompletos</li>
                    <li><strong>Exclusão:</strong> Solicitar a eliminação de dados desnecessários</li>
                    <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                    <li><strong>Oposição:</strong> Opor-se ao tratamento de dados</li>
                    <li><strong>Revogação:</strong> Revogar consentimento a qualquer momento</li>
                    <li><strong>Informação:</strong> Obter informações sobre uso e compartilhamento</li>
                  </ul>
                  
                  <p className="mt-4">
                    <strong>5.2.</strong> Para exercer seus direitos, entre em contato através do e-mail: 
                    <span className="text-primary-red"> privacidade@racemarketbr.com.br</span>
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bebas text-white mb-4">6. RETENÇÃO DE DADOS</h2>
                <div className="space-y-4">
                  <p>
                    <strong>6.1.</strong> Mantemos seus dados pelo tempo necessário para:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Cumprir as finalidades para as quais foram coletados</li>
                    <li>Atender obrigações legais e regulamentares</li>
                    <li>Resolver disputas e fazer cumprir nossos acordos</li>
                  </ul>
                  
                  <p className="mt-4">
                    <strong>6.2.</strong> Após o período de retenção, os dados serão eliminados de forma segura.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bebas text-white mb-4">7. COOKIES E TECNOLOGIAS</h2>
                <div className="space-y-4">
                  <p>
                    <strong>7.1.</strong> Utilizamos cookies para:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Manter você logado na plataforma</li>
                    <li>Lembrar suas preferências</li>
                    <li>Analisar o uso da plataforma</li>
                    <li>Personalizar sua experiência</li>
                  </ul>
                  
                  <p className="mt-4">
                    <strong>7.2.</strong> Você pode gerenciar cookies através das configurações do seu navegador.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bebas text-white mb-4">8. MENORES DE IDADE</h2>
                <div className="space-y-4">
                  <p>
                    <strong>8.1.</strong> Nossa plataforma não é direcionada a menores de 18 anos.
                  </p>
                  <p>
                    <strong>8.2.</strong> Não coletamos intencionalmente dados de menores de idade.
                  </p>
                  <p>
                    <strong>8.3.</strong> Se identificarmos dados de menores, procederemos com a exclusão imediata.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bebas text-white mb-4">9. TRANSFERÊNCIA INTERNACIONAL</h2>
                <div className="space-y-4">
                  <p>
                    <strong>9.1.</strong> Seus dados são processados principalmente no Brasil.
                  </p>
                  <p>
                    <strong>9.2.</strong> Caso seja necessária transferência internacional, garantiremos 
                    proteção adequada conforme a LGPD.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bebas text-white mb-4">10. ALTERAÇÕES NA POLÍTICA</h2>
                <div className="space-y-4">
                  <p>
                    <strong>10.1.</strong> Esta política pode ser atualizada periodicamente.
                  </p>
                  <p>
                    <strong>10.2.</strong> Alterações significativas serão comunicadas por e-mail ou 
                    através da plataforma.
                  </p>
                  <p>
                    <strong>10.3.</strong> Recomendamos verificar regularmente esta página.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bebas text-white mb-4">11. CONTATO E DPO</h2>
                <div className="space-y-4">
                  <p>
                    <strong>11.1.</strong> Para questões sobre privacidade e proteção de dados:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>E-mail:</strong> privacidade@racemarketbr.com.br</li>
                    <li><strong>Encarregado de Dados (DPO):</strong> dpo@racemarketbr.com.br</li>
                    <li><strong>Formulário de contato:</strong> Disponível na página de contato</li>
                  </ul>
                  
                  <p className="mt-4">
                    <strong>11.2.</strong> Respondemos solicitações em até 15 dias úteis.
                  </p>
                </div>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-800">
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-green-400 font-montserrat font-bold mb-2">
                      COMPROMISSO DE TRANSPARÊNCIA
                    </h3>
                    <p className="text-gray-300 font-montserrat">
                      O RaceMarketBR está comprometido com a transparência no tratamento de dados. 
                      Trabalhamos continuamente para manter seus dados seguros e sua privacidade protegida, 
                      sempre em conformidade com a Lei Geral de Proteção de Dados (LGPD).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="flex justify-center mb-4">
                <Lock className="w-8 h-8 text-primary-red" />
              </div>
              <p className="text-gray-400 font-montserrat">
                RaceMarketBR - Seus dados protegidos, sua privacidade respeitada
              </p>
              <p className="text-gray-500 font-montserrat text-sm mt-2">
                Plataforma em conformidade com a LGPD
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PoliticaPrivacidade
