
import { motion } from 'framer-motion'
import {ArrowLeft, Scale, Shield, AlertTriangle} from 'lucide-react'
import { Link } from 'react-router-dom'

const TermosUso = () => {
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
            className="inline-flex items-center space-x-2 text-red-text hover:text-turbo-secondary mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-montserrat">Voltar ao cadastro</span>
          </Link>

          <div className="bg-primary-gray border border-gray-800 rounded-2xl p-8">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4">
                <Scale className="w-16 h-16 text-red-text" />
              </div>
              <h1 className="font-bebas text-5xl text-white mb-4">
                TERMOS DE USO
              </h1>
              <p className="text-gray-400 font-montserrat text-lg">
                RaceMarketBR - Plataforma de Divulgação Automotiva
              </p>
              <p className="text-gray-500 font-montserrat text-sm mt-2">
                Última atualização: Janeiro de 2025
              </p>
            </div>

            <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 mb-8">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-red-400 font-montserrat font-bold mb-2">
                    IMPORTANTE - NATUREZA DA PLATAFORMA
                  </h3>
                  <p className="text-gray-300 font-montserrat">
                    O RaceMarketBR é uma plataforma de <strong>divulgação e intermediação</strong> de veículos automotivos. 
                    NÃO somos vendedores diretos de veículos. Nossa função é conectar vendedores e compradores, 
                    facilitando a comunicação e divulgação de anúncios.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8 text-gray-300 font-montserrat">
              <section>
                <h2 className="text-2xl font-bebas text-white mb-4">1. DEFINIÇÕES E NATUREZA DO SERVIÇO</h2>
                <div className="space-y-4">
                  <p>
                    <strong>1.1.</strong> O RaceMarketBR é uma plataforma digital que oferece serviços de divulgação 
                    e intermediação para a comercialização de veículos automotivos, especializando-se em carros turbo, 
                    aspirados, originais e de pista.
                  </p>
                  <p>
                    <strong>1.2.</strong> A plataforma atua exclusivamente como intermediária, conectando vendedores 
                    e compradores interessados em veículos automotivos, não realizando vendas diretas.
                  </p>
                  <p>
                    <strong>1.3.</strong> Todos os veículos anunciados pertencem a terceiros (vendedores), sendo o 
                    RaceMarketBR apenas o meio de divulgação e comunicação.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bebas text-white mb-4">2. ACEITAÇÃO DOS TERMOS</h2>
                <div className="space-y-4">
                  <p>
                    <strong>2.1.</strong> Ao acessar e utilizar a plataforma RaceMarketBR, você concorda integralmente 
                    com estes Termos de Uso.
                  </p>
                  <p>
                    <strong>2.2.</strong> Caso não concorde com qualquer disposição destes termos, você deve 
                    interromper imediatamente o uso da plataforma.
                  </p>
                  <p>
                    <strong>2.3.</strong> Estes termos podem ser atualizados periodicamente, sendo sua responsabilidade 
                    verificar as alterações.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bebas text-white mb-4">3. SERVIÇOS OFERECIDOS</h2>
                <div className="space-y-4">
                  <p>
                    <strong>3.1.</strong> Divulgação de anúncios de veículos automotivos;
                  </p>
                  <p>
                    <strong>3.2.</strong> Facilitação do contato entre vendedores e compradores;
                  </p>
                  <p>
                    <strong>3.3.</strong> Ferramentas de busca e filtros para localização de veículos;
                  </p>
                  <p>
                    <strong>3.4.</strong> Sistema de destaque para anúncios (serviços premium);
                  </p>
                  <p>
                    <strong>3.5.</strong> Suporte técnico para utilização da plataforma.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bebas text-white mb-4">4. RESPONSABILIDADES DO USUÁRIO</h2>
                <div className="space-y-4">
                  <p>
                    <strong>4.1.</strong> Fornecer informações verdadeiras e atualizadas no cadastro;
                  </p>
                  <p>
                    <strong>4.2.</strong> Manter a confidencialidade de suas credenciais de acesso;
                  </p>
                  <p>
                    <strong>4.3.</strong> Utilizar a plataforma de forma ética e legal;
                  </p>
                  <p>
                    <strong>4.4.</strong> Não publicar conteúdo falso, enganoso ou ofensivo;
                  </p>
                  <p>
                    <strong>4.5.</strong> Respeitar os direitos de propriedade intelectual;
                  </p>
                  <p>
                    <strong>4.6.</strong> Verificar pessoalmente as condições dos veículos antes da compra.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bebas text-white mb-4">5. LIMITAÇÕES DE RESPONSABILIDADE</h2>
                <div className="space-y-4">
                  <p>
                    <strong>5.1.</strong> O RaceMarketBR não se responsabiliza pela veracidade das informações 
                    fornecidas pelos vendedores nos anúncios;
                  </p>
                  <p>
                    <strong>5.2.</strong> Não garantimos a qualidade, condição ou legalidade dos veículos anunciados;
                  </p>
                  <p>
                    <strong>5.3.</strong> Não nos responsabilizamos por transações realizadas entre usuários;
                  </p>
                  <p>
                    <strong>5.4.</strong> Não oferecemos garantias sobre os veículos comercializados através da plataforma;
                  </p>
                  <p>
                    <strong>5.5.</strong> A verificação da documentação e condições do veículo é responsabilidade 
                    exclusiva do comprador.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bebas text-white mb-4">6. CONTEÚDO E PROPRIEDADE INTELECTUAL</h2>
                <div className="space-y-4">
                  <p>
                    <strong>6.1.</strong> O usuário mantém os direitos sobre o conteúdo que publica na plataforma;
                  </p>
                  <p>
                    <strong>6.2.</strong> Ao publicar conteúdo, o usuário concede ao RaceMarketBR licença para 
                    exibir e divulgar esse conteúdo na plataforma;
                  </p>
                  <p>
                    <strong>6.3.</strong> É proibido utilizar conteúdo protegido por direitos autorais sem autorização;
                  </p>
                  <p>
                    <strong>6.4.</strong> O RaceMarketBR pode remover conteúdo que viole estes termos.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bebas text-white mb-4">7. PAGAMENTOS E TAXAS</h2>
                <div className="space-y-4">
                  <p>
                    <strong>7.1.</strong> A plataforma pode cobrar taxas por serviços premium (anúncios em destaque);
                  </p>
                  <p>
                    <strong>7.2.</strong> As taxas serão claramente informadas antes da contratação do serviço;
                  </p>
                  <p>
                    <strong>7.3.</strong> Não cobramos comissão sobre as vendas realizadas entre usuários;
                  </p>
                  <p>
                    <strong>7.4.</strong> Pagamentos de serviços premium são processados por terceiros seguros.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bebas text-white mb-4">8. SUSPENSÃO E CANCELAMENTO</h2>
                <div className="space-y-4">
                  <p>
                    <strong>8.1.</strong> Podemos suspender ou cancelar contas que violem estes termos;
                  </p>
                  <p>
                    <strong>8.2.</strong> O usuário pode cancelar sua conta a qualquer momento;
                  </p>
                  <p>
                    <strong>8.3.</strong> Em caso de cancelamento, os anúncios serão removidos da plataforma;
                  </p>
                  <p>
                    <strong>8.4.</strong> Dados pessoais serão tratados conforme nossa Política de Privacidade.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bebas text-white mb-4">9. DISPOSIÇÕES GERAIS</h2>
                <div className="space-y-4">
                  <p>
                    <strong>9.1.</strong> Estes termos são regidos pela legislação brasileira;
                  </p>
                  <p>
                    <strong>9.2.</strong> Disputas serão resolvidas no foro da comarca onde está situada a sede da empresa;
                  </p>
                  <p>
                    <strong>9.3.</strong> Se alguma disposição for considerada inválida, as demais permanecerão em vigor;
                  </p>
                  <p>
                    <strong>9.4.</strong> O não exercício de direitos não implica em renúncia aos mesmos.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bebas text-white mb-4">10. CONTATO</h2>
                <div className="space-y-4">
                  <p>
                    <strong>10.1.</strong> Para dúvidas sobre estes termos, entre em contato através da página 
                    de contato da plataforma ou pelo e-mail suporte@racemarketbr.com.br
                  </p>
                </div>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-800 text-center">
              <div className="flex justify-center mb-4">
                <Shield className="w-8 h-8 text-red-text" />
              </div>
              <p className="text-gray-400 font-montserrat">
                RaceMarketBR - Conectando apaixonados por automóveis
              </p>
              <p className="text-gray-500 font-montserrat text-sm mt-2">
                Plataforma de intermediação automotiva
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default TermosUso
