
export interface Estado {
  codigo: string
  nome: string
  cidades: string[]
}

export const estadosCidades: Estado[] = [
  {
    codigo: 'AC',
    nome: 'Acre',
    cidades: [
      'Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó',
      'Brasileia', 'Plácido de Castro', 'Xapuri', 'Epitaciolândia', 'Acrelândia',
      'Bujari', 'Capixaba', 'Assis Brasil', 'Rodrigues Alves', 'Mâncio Lima',
      'Senador Guiomard', 'Porto Walter', 'Jordão', 'Marechal Thaumaturgo',
      'Santa Rosa do Purus', 'Manoel Urbano', 'Porto Acre'
    ]
  },
  {
    codigo: 'AL',
    nome: 'Alagoas',
    cidades: [
      'Maceió', 'Arapiraca', 'Rio Largo', 'Palmeira dos Índios', 'União dos Palmares',
      'Penedo', 'Coruripe', 'São Miguel dos Campos', 'Santana do Ipanema', 'Delmiro Gouveia',
      'Marechal Deodoro', 'Campo Alegre', 'Murici', 'Pilar', 'São Sebastião',
      'Viçosa', 'Girau do Ponciano', 'Água Branca', 'Quebrangulo', 'Matriz de Camaragibe',
      'Porto Calvo', 'Cajueiro', 'Atalaia', 'Messias', 'Satuba'
    ]
  },
  {
    codigo: 'AP',
    nome: 'Amapá',
    cidades: [
      'Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Mazagão',
      'Porto Grande', 'Tartarugalzinho', 'Vitória do Jari', 'Calçoene', 'Amapá',
      'Ferreira Gomes', 'Pracuúba', 'Pedra Branca do Amapari', 'Serra do Navio',
      'Cutias', 'Itaubal'
    ]
  },
  {
    codigo: 'AM',
    nome: 'Amazonas',
    cidades: [
      'Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari', 'Tefé',
      'Tabatinga', 'Maués', 'São Gabriel da Cachoeira', 'Humaitá', 'Lábrea',
      'Barcelos', 'Presidente Figueiredo', 'Carauari', 'Eirunepé', 'Manicoré',
      'Iranduba', 'Novo Airão', 'Rio Preto da Eva', 'Autazes', 'Borba',
      'Nova Olinda do Norte', 'Urucará', 'São Paulo de Olivença', 'Fonte Boa',
      'Tonantins', 'Jutaí', 'Benjamin Constant', 'Atalaia do Norte', 'Santo Antônio do Içá'
    ]
  },
  {
    codigo: 'BA',
    nome: 'Bahia',
    cidades: [
      'Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro',
      'Itabuna', 'Lauro de Freitas', 'Ilhéus', 'Jequié', 'Teixeira de Freitas',
      'Alagoinhas', 'Porto Seguro', 'Simões Filho', 'Paulo Afonso', 'Eunápolis',
      'Santo Antônio de Jesus', 'Valença', 'Candeias', 'Guanambi', 'Jacobina',
      'Serrinha', 'Senhor do Bonfim', 'Dias d\'Ávila', 'Luis Eduardo Magalhães',
      'Itapetinga', 'Irecê', 'Campo Formoso', 'Casa Nova', 'Brumado', 'Bom Jesus da Lapa'
    ]
  },
  {
    codigo: 'CE',
    nome: 'Ceará',
    cidades: [
      'Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral',
      'Crato', 'Itapipoca', 'Maranguape', 'Iguatu', 'Quixadá', 'Canindé',
      'Aquiraz', 'Pacatuba', 'Crateús', 'Russas', 'Aracati', 'Cascavel',
      'Pacajus', 'Icó', 'Horizonte', 'Camocim', 'Morada Nova', 'Acaraú',
      'Viçosa do Ceará', 'Barbalha', 'Limoeiro do Norte', 'Tauá', 'Trairi',
      'Granja', 'Boa Viagem'
    ]
  },
  {
    codigo: 'DF',
    nome: 'Distrito Federal',
    cidades: [
      'Brasília', 'Ceilândia', 'Taguatinga', 'Planaltina', 'Gama',
      'Águas Claras', 'Guará', 'Sobradinho', 'Samambaia', 'Santa Maria',
      'São Sebastião', 'Recanto das Emas', 'Riacho Fundo', 'Núcleo Bandeirante',
      'Brazlândia', 'Cruzeiro', 'Candangolândia', 'Lago Sul', 'Lago Norte',
      'Sudoeste/Octogonal', 'Varjão', 'Park Way', 'SCIA', 'Sobradinho II',
      'Jardim Botânico', 'Itapoã', 'SIA', 'Vicente Pires', 'Fercal'
    ]
  },
  {
    codigo: 'ES',
    nome: 'Espírito Santo',
    cidades: [
      'Vitória', 'Vila Velha', 'Cariacica', 'Serra', 'Cachoeiro de Itapemirim',
      'Linhares', 'São Mateus', 'Colatina', 'Guarapari', 'Aracruz',
      'Viana', 'Nova Venécia', 'Barra de São Francisco', 'Santa Teresa',
      'Itapemirim', 'Afonso Cláudio', 'Alegre', 'Baixo Guandu', 'Conceição da Barra',
      'Domingos Martins', 'Ecoporanga', 'Fundão', 'Governador Lindenberg',
      'Guaçuí', 'Ibiraçu', 'Iúna', 'Jaguaré', 'João Neiva', 'Marataízes', 'Mimoso do Sul'
    ]
  },
  {
    codigo: 'GO',
    nome: 'Goiás',
    cidades: [
      'Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia',
      'Águas Lindas de Goiás', 'Valparaíso de Goiás', 'Trindade', 'Formosa',
      'Novo Gama', 'Itumbiara', 'Senador Canedo', 'Catalão', 'Jataí',
      'Planaltina', 'Caldas Novas', 'Santo Antônio do Descoberto', 'Goianésia',
      'Cidade Ocidental', 'Mineiros', 'Cristalina', 'Inhumas', 'Ipatinga',
      'Uruaçu', 'Jaraguá', 'Jussara', 'Alexânia', 'Abadiânia', 'Acreúna', 'Adelândia'
    ]
  },
  {
    codigo: 'MA',
    nome: 'Maranhão',
    cidades: [
      'São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias',
      'Codó', 'Paço do Lumiar', 'Açailândia', 'Bacabal', 'Balsas',
      'Barra do Corda', 'Chapadinha', 'Santa Inês', 'Pinheiro', 'Pedreiras',
      'Presidente Dutra', 'Tutóia', 'Coroatá', 'Grajaú', 'Itapecuru Mirim',
      'Viana', 'Rosário', 'São João Batista', 'Alcântara', 'Raposa',
      'São Bento', 'Lago da Pedra', 'Zé Doca', 'Carolina', 'Estreito'
    ]
  },
  {
    codigo: 'MT',
    nome: 'Mato Grosso',
    cidades: [
      'Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra',
      'Cáceres', 'Sorriso', 'Lucas do Rio Verde', 'Barra do Garças', 'Primavera do Leste',
      'Alta Floresta', 'Pontes e Lacerda', 'Diamantino', 'Juína', 'Nova Mutum',
      'Colíder', 'Mirassol d\'Oeste', 'Guarantã do Norte', 'Peixoto de Azevedo',
      'Campo Verde', 'Água Boa', 'Comodoro', 'Juara', 'São José do Rio Claro',
      'Confresa', 'Chapada dos Guimarães', 'Nova Olímpia', 'Matupá', 'Canarana', 'Araputanga'
    ]
  },
  {
    codigo: 'MS',
    nome: 'Mato Grosso do Sul',
    cidades: [
      'Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã',
      'Naviraí', 'Nova Andradina', 'Sidrolândia', 'Maracaju', 'São Gabriel do Oeste',
      'Coxim', 'Aquidauana', 'Paranaíba', 'Amambai', 'Ribas do Rio Pardo',
      'Chapadão do Sul', 'Jardim', 'Bonito', 'Anastácio', 'Ivinhema',
      'Cassilândia', 'Bataguassu', 'Miranda', 'Rio Brilhante', 'Caarapó',
      'Mundo Novo', 'Aparecida do Taboado', 'Costa Rica', 'Bela Vista', 'Terenos'
    ]
  },
  {
    codigo: 'MG',
    nome: 'Minas Gerais',
    cidades: [
      'Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim',
      'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares',
      'Ipatinga', 'Santa Luzia', 'Sete Lagoas', 'Divinópolis', 'Ibirité',
      'Poços de Caldas', 'Patos de Minas', 'Pouso Alegre', 'Teófilo Otoni',
      'Barbacena', 'Sabará', 'Varginha', 'Conselheiro Lafaiete', 'Vespasiano',
      'Itabira', 'Araguari', 'Passos', 'Ubá', 'Coronel Fabriciano', 'Muriaé', 'Ituiutaba'
    ]
  },
  {
    codigo: 'PA',
    nome: 'Pará',
    cidades: [
      'Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas', 'Castanhal',
      'Abaetetuba', 'Cametá', 'Marituba', 'Tucuruí', 'Altamira', 'Barcarena',
      'Benevides', 'Paragominas', 'Bragança', 'Capanema', 'Redenção',
      'Itaituba', 'Oriximiná', 'Tailândia', 'Xinguara', 'São Félix do Xingu',
      'Breves', 'Monte Alegre', 'Conceição do Araguaia', 'Tomé-Açu', 'Vigia',
      'Salinópolis', 'Dom Eliseu', 'Moju'
    ]
  },
  {
    codigo: 'PB',
    nome: 'Paraíba',
    cidades: [
      'João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux',
      'Sousa', 'Cajazeiras', 'Cabedelo', 'Guarabira', 'Mamanguape',
      'Sapé', 'Desterro', 'São Bento', 'Monteiro', 'Picuí',
      'Itabaiana', 'Conde', 'Princesa Isabel', 'Esperança', 'João Pessoa',
      'Areia', 'Bananeiras', 'Solânea', 'Alagoa Grande', 'Pombal',
      'Conceição', 'Catolé do Rocha', 'Alagoinha', 'Lucena', 'Piancó'
    ]
  },
  {
    codigo: 'PR',
    nome: 'Paraná',
    cidades: [
      'Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel',
      'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava',
      'Paranaguá', 'Araucária', 'Toledo', 'Apucarana', 'Pinhais',
      'Campo Largo', 'Arapongas', 'Almirante Tamandaré', 'Umuarama',
      'Piraquara', 'Cambé', 'Campo Mourão', 'Fazenda Rio Grande',
      'Sarandi', 'Fazenda Rio Grande', 'Cianorte', 'Telêmaco Borba',
      'Castro', 'Guaratuba', 'Irati', 'União da Vitória'
    ]
  },
  {
    codigo: 'PE',
    nome: 'Pernambuco',
    cidades: [
      'Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Bandeira', 'Caruaru',
      'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe',
      'Garanhuns', 'Vitória de Santo Antão', 'Igarassu', 'São Lourenço da Mata',
      'Santa Cruz do Capibaribe', 'Abreu e Lima', 'Ipojuca', 'Serra Talhada',
      'Araripina', 'Gravatá', 'Carpina', 'Goiana', 'Belo Jardim',
      'Arcoverde', 'Ouricuri', 'Escada', 'Pesqueira', 'Surubim',
      'Palmares', 'Bezerros', 'Salgueiro'
    ]
  },
  {
    codigo: 'PI',
    nome: 'Piauí',
    cidades: [
      'Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano',
      'Campo Maior', 'Barras', 'União', 'Altos', 'Pedro II',
      'Valença do Piauí', 'Esperantina', 'São Raimundo Nonato', 'Oeiras',
      'Luzilândia', 'Jaicós', 'Simplício Mendes', 'Corrente', 'Bom Jesus',
      'Uruçuí', 'José de Freitas', 'Cocal', 'Água Branca', 'Regeneração',
      'Miguel Alves', 'São João do Piauí', 'Paulistana', 'Fronteiras',
      'Gilbués', 'Amarante'
    ]
  },
  {
    codigo: 'RJ',
    nome: 'Rio de Janeiro',
    cidades: [
      'Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu',
      'Niterói', 'Belford Roxo', 'São João de Meriti', 'Campos dos Goytacazes',
      'Petrópolis', 'Volta Redonda', 'Magé', 'Macaé', 'Itaboraí',
      'Cabo Frio', 'Angra dos Reis', 'Nova Friburgo', 'Barra Mansa',
      'Teresópolis', 'Mesquita', 'Nilópolis', 'Maricá', 'Queimados',
      'Rio das Ostras', 'Resende', 'Araruama', 'Tanguá', 'Saquarema',
      'Paracambi', 'Itaguaí', 'Seropédica'
    ]
  },
  {
    codigo: 'RN',
    nome: 'Rio Grande do Norte',
    cidades: [
      'Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba',
      'Ceará-Mirim', 'Caicó', 'Assu', 'Currais Novos', 'João Câmara',
      'Nova Cruz', 'Apodi', 'Santa Cruz', 'Pau dos Ferros', 'São José de Mipibu',
      'Extremoz', 'Touros', 'Canguaretama', 'Nísia Floresta', 'São Paulo do Potengi',
      'Goianinha', 'Acari', 'Lajes', 'Areia Branca', 'Baraúna',
      'Martins', 'Ipanguaçu', 'Alexandria', 'Macau', 'Patu'
    ]
  },
  {
    codigo: 'RS',
    nome: 'Rio Grande do Sul',
    cidades: [
      'Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria',
      'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande',
      'Alvorada', 'Passo Fundo', 'Sapucaia do Sul', 'Uruguaiana', 'Santa Cruz do Sul',
      'Cachoeirinha', 'Bagé', 'Bento Gonçalves', 'Erechim', 'Guaíba',
      'Cachoeira do Sul', 'Santana do Livramento', 'Ijuí', 'Sapiranga',
      'Santo Ângelo', 'Alegrete', 'Lajeado', 'Marau', 'Santa Rosa', 'Cruz Alta'
    ]
  },
  {
    codigo: 'RO',
    nome: 'Rondônia',
    cidades: [
      'Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal',
      'Rolim de Moura', 'Guajará-Mirim', 'Jaru', 'Ouro Preto do Oeste',
      'Machadinho d\'Oeste', 'Presidente Médici', 'Espigão d\'Oeste',
      'Colorado do Oeste', 'Cerejeiras', 'Pimenta Bueno', 'Buritis',
      'Candeias do Jamari', 'Alto Alegre dos Parecis', 'Alvorada d\'Oeste',
      'Costa Marques', 'Nova Brasilândia d\'Oeste', 'Theobroma', 'Ministro Andreazza',
      'Teixeirópolis', 'Urupá', 'Nova Mamoré', 'Monte Negro', 'Primavera de Rondônia',
      'Campo Novo de Rondônia', 'São Miguel do Guaporé'
    ]
  },
  {
    codigo: 'RR',
    nome: 'Roraima',
    cidades: [
      'Boa Vista', 'Rorainópolis', 'Caracaraí', 'Alto Alegre', 'Mucajaí',
      'São João da Baliza', 'São Luiz', 'Caroebe', 'Iracema', 'Amajari',
      'Normandia', 'Pacaraima', 'Uiramutã', 'Cantá', 'Bonfim'
    ]
  },
  {
    codigo: 'SC',
    nome: 'Santa Catarina',
    cidades: [
      'Joinville', 'Florianópolis', 'Blumenau', 'São José', 'Criciúma',
      'Chapecó', 'Itajaí', 'Lages', 'Jaraguá do Sul', 'Palhoça',
      'Balneário Camboriú', 'Brusque', 'Tubarão', 'São Bento do Sul',
      'Caçador', 'Camboriú', 'Navegantes', 'Concórdia', 'Rio do Sul',
      'Araranguá', 'Gaspar', 'Biguaçu', 'Indaial', 'Itapema',
      'Mafra', 'Canoinhas', 'Içara', 'Videira', 'Timbó', 'Laguna'
    ]
  },
  {
    codigo: 'SP',
    nome: 'São Paulo',
    cidades: [
      'São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André',
      'Osasco', 'Ribeirão Preto', 'Sorocaba', 'Mauá', 'São José dos Campos',
      'Mogi das Cruzes', 'Diadema', 'Jundiaí', 'Carapicuíba', 'Piracicaba',
      'Bauru', 'São Vicente', 'Itaquaquecetuba', 'Franca', 'Guarujá',
      'Taubaté', 'Praia Grande', 'Limeira', 'Suzano', 'Taboão da Serra',
      'Sumaré', 'Barueri', 'Embu das Artes', 'São Carlos', 'Marília'
    ]
  },
  {
    codigo: 'SE',
    nome: 'Sergipe',
    cidades: [
      'Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão',
      'Estância', 'Tobias Barreto', 'Simão Dias', 'Propriá', 'Barra dos Coqueiros',
      'Ribeirópolis', 'Aquidabã', 'Laranjeiras', 'Umbaúba', 'Poço Verde',
      'Carmópolis', 'Maruim', 'Rosário do Catete', 'Capela', 'Santo Amaro das Brotas',
      'Canindé de São Francisco', 'Divina Pastora', 'Riachuelo', 'Arauá',
      'Frei Paulo', 'Gararu', 'Itabaianinha', 'Japaratuba', 'Neópolis', 'Porto da Folha'
    ]
  },
  {
    codigo: 'TO',
    nome: 'Tocantins',
    cidades: [
      'Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins',
      'Colinas do Tocantins', 'Guaraí', 'Tocantinópolis', 'Miracema do Tocantins',
      'Dianópolis', 'Araguatins', 'Taguatinga', 'Augustinópolis', 'Xambioá',
      'Miranorte', 'Arraias', 'Pedro Afonso', 'Ananás', 'Goiatins',
      'Formoso do Araguaia', 'Wanderlândia', 'Babaçulândia', 'Alvorada',
      'Filadélfia', 'Axixá do Tocantins', 'Couto Magalhães', 'Lagoa da Confusão',
      'Natividade', 'Peixe', 'Presidente Kennedy'
    ]
  }
]

export const buscarCidadesPorEstado = (codigoEstado: string): string[] => {
  const estado = estadosCidades.find(e => e.codigo === codigoEstado)
  return estado ? estado.cidades : []
}

export const filtrarCidadesPorIniciais = (cidades: string[], iniciais: string): string[] => {
  if (!iniciais.trim()) return cidades
  
  const iniciaisLower = iniciais.toLowerCase()
  return cidades.filter(cidade => 
    cidade.toLowerCase().includes(iniciaisLower)
  ).sort()
}

export const formatarNomeEstado = (codigo: string): string => {
  const estado = estadosCidades.find(e => e.codigo === codigo)
  return estado ? `${estado.nome} (${estado.codigo})` : codigo
}
