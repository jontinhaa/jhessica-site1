// Configuração central. Header, Footer, SEO e a ordem das seções da home leem daqui.

export const marca = {
  nome: 'Jhessica em Cozinha Saudável',
  nomeCurto: 'Jhessica',
  assinatura: 'Confeitaria artesanal',
} as const;

export const seo = {
  titulo: `${marca.nome} · Confeitaria artesanal em Marabá`,
  descricao: 'Bolos, pães e doces sem glúten e sem leite, feitos à mão em Marabá.',
  idioma: 'pt-BR',
} as const;

export const contato = {
  whatsapp: '', // TODO: confirmar com a cliente (número com DDI e DDD, só dígitos: 5594…)
  instagram: '', // TODO: confirmar com a cliente (usuário, sem @)
  enderecoRetirada: '', // TODO: confirmar com a cliente
  horarios: '', // TODO: confirmar com a cliente
};

// Links das redes; string vazia enquanto o contato não for confirmado (o rodapé mostra o ícone desabilitado).
export const redes = {
  whatsapp: contato.whatsapp && `https://wa.me/${contato.whatsapp.replace(/\D/g, '')}`,
  instagram: contato.instagram && `https://instagram.com/${contato.instagram.replace(/^@/, '')}`,
};

// Dias da semana como em Date.getDay(): 0 = domingo … 6 = sábado.
export const regrasPedido = {
  prazoMinimoDias: 2,
  prazoGrandeVolumeDias: 7,
  diasEntrega: [0],
  diasFechado: [6],
  cidadeEntrega: 'Marabá',
  taxaEntrega: null as number | null, // TODO: confirmar com a cliente
  limiteGrandeVolume: null as number | null, // TODO: confirmar com a cliente (a partir de quantos itens vale o prazo de 7 dias)
};

export interface Secao {
  id: string;
  rotulo: string;
  titulo: string;
  tituloDestaque: string;
  noMenu: boolean;
  rotuloMenu?: string;
}

// Ordem da home. O número do sobretítulo é a posição (índice + 1); o id vira âncora e item de menu.
export const secoes: Secao[] = [
  { id: 'cardapio', rotulo: 'Cardápio', titulo: 'Do café da manhã', tituloDestaque: 'à sobremesa.', noMenu: true },
  { id: 'bento-cake', rotulo: 'Bento Cake', titulo: 'Conta pra gente', tituloDestaque: 'a festa.', noMenu: false },
  { id: 'ingredientes', rotulo: 'Ingredientes', titulo: 'O que entra', tituloDestaque: 'e o que fica de fora.', noMenu: false },
  { id: 'como-pedir', rotulo: 'Como pedir', titulo: 'Do forno à mesa,', tituloDestaque: 'em quatro tempos.', noMenu: true },
  { id: 'sobre', rotulo: 'Nossa história', titulo: 'Uma cozinha', tituloDestaque: 'que nasceu em casa.', noMenu: true, rotuloMenu: 'Sobre' },
  { id: 'depoimentos', rotulo: 'Depoimentos', titulo: 'Sobrou', tituloDestaque: 'só a forminha.', noMenu: true },
  { id: 'perguntas', rotulo: 'Perguntas', titulo: 'Antes de', tituloDestaque: 'você perguntar.', noMenu: false },
  { id: 'contato', rotulo: 'Contato', titulo: 'Tem um sabor', tituloDestaque: 'esperando por você.', noMenu: true },
];

// Menu do Header e do rodapé: href absoluto (/#id) para funcionar também fora da home.
export const menu = secoes.filter((s) => s.noMenu).map((s) => ({ href: `/#${s.id}`, rotulo: s.rotuloMenu ?? s.rotulo }));

export const pedido = { href: '/pedido', rotulo: 'Encomendar' } as const;
