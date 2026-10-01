// Configuração central. Header, Footer, SEO e a ordem das seções da home leem daqui.
import type { Alergeno, CategoriaId } from './cardapio';

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

// Endereço completo (rua, quadra, lote) NÃO entra no repositório: só o bairro; o resto é combinado no WhatsApp.
export const contato = {
  whatsapp: '5594981080336', // DDI + DDD, só dígitos
  whatsappExibicao: '(94) 98108-0336',
  instagram: 'jhessica.em.cozinha.saudavel', // sem @
  bairroRetirada: 'Cidade Jardim',
  cidade: 'Marabá',
  retirada: 'a combinar',
  // dias como em Date.getDay(): 0 = domingo … 6 = sábado
  atendimento: { dias: [1, 2, 3, 4, 5], texto: 'Segunda a sexta, das 8h às 18h', textoCurto: 'Seg a sex · 8h às 18h' },
};

// Links das redes; string vazia se o contato faltar (o rodapé mostra o ícone desabilitado).
export const redes = {
  whatsapp: contato.whatsapp && `https://wa.me/${contato.whatsapp.replace(/\D/g, '')}`,
  instagram: contato.instagram && `https://instagram.com/${contato.instagram.replace(/^@/, '')}`,
};

// Prazo especial (7 dias): Bento sempre; brigadeiros quando o pedido soma 15 unidades ou mais. O resto: 2 dias.
export const regrasPedido = {
  prazoMinimoDias: 2,
  prazoEspecialDias: 7,
  categoriasPrazoEspecial: ['bento'] as CategoriaId[],
  limiteBrigadeirosUnidades: 15,
  diasEntrega: [0], // TODO: confirmar se entrega continua só aos domingos (0 = domingo)
  entrega: { gratisNoBairro: 'Cidade Jardim', demaisBairros: 'taxa combinada pelo WhatsApp' },
};

export const conservacao = {
  porCategoria: {
    bolos: 'Conservar bem embalado. Pode congelar.',
    paes: 'Pode congelar para preservar melhor a textura.',
    brigadeiros: 'Manter refrigerados. Podem congelar.',
    fatias: 'Manter refrigerado e consumir de preferência em até 3 dias.',
    bento: 'Manter refrigerado e consumir de preferência em até 3 dias.',
  } satisfies Record<CategoriaId, string>,
  observacaoCongelados: 'Para descongelar, deixe na geladeira, dentro da embalagem.',
};

/** Rabisco do cartão em "O que entra" (nomes do mapa de Doodle.astro). */
export type RabiscoIngrediente = 'arroz' | 'aveia' | 'castanhas' | 'leite' | 'acucar' | 'girassol';

// O que a seção Ingredientes pode afirmar. null = não confirmado: a frase correspondente não promete nada.
export const compromisso = {
  cozinhaSemGluten: false as boolean | null,
  cozinhaSemLeite: false as boolean | null,
  semAcucarRefinado: true as boolean | null, // true = nenhum produto usa; false ou null = "evitamos"
  // TODO: revisar textos com a cliente
  ingredientesQueEntram: [
    { nome: 'Farinha de arroz', rabisco: 'arroz', porque: 'A base leve das massas, no lugar do trigo.' },
    { nome: 'Farinha de aveia', rabisco: 'aveia', porque: 'Textura macia e sabor de bolo caseiro.' },
    { nome: 'Amêndoas e castanha de caju', rabisco: 'castanhas', porque: 'Dão corpo, umidade e um sabor amanteigado, sem manteiga.' },
    { nome: 'Leites vegetais', rabisco: 'leite', porque: 'De amêndoas, de caju ou de coco, no lugar do leite em massas, cremes e recheios.' },
    { nome: 'Açúcar demerara', rabisco: 'acucar', porque: 'No lugar do refinado. Em algumas receitas de chocolate, mascavo.' },
    { nome: 'Óleo de girassol', rabisco: 'girassol', porque: 'Deixa a massa macia, no lugar da manteiga.' },
  ] as { nome: string; rabisco: RabiscoIngrediente; porque: string }[],
};

type Cozinha = Pick<typeof compromisso, 'cozinhaSemGluten' | 'cozinhaSemLeite'>;

/** Linha do açúcar: "nada de" só quando confirmado; nos outros casos, "evitamos". */
export const textoAcucar = (semAcucarRefinado = compromisso.semAcucarRefinado) =>
  semAcucarRefinado === true ? 'E nada de açúcar refinado.' : 'E evitamos açúcar refinado e o excesso de industrializados.';

/** Frase sobre a cozinha; null (não mostra nada) enquanto glúten ou leite não estiver confirmado. */
export function textoCozinha({ cozinhaSemGluten: gluten, cozinhaSemLeite: leite }: Cozinha = compromisso): string | null {
  if (gluten === null || leite === null) return null;
  if (gluten && leite) return 'Na nossa cozinha não entram glúten nem leite, em receita nenhuma.';
  const manipula = !gluten && !leite ? 'esses ingredientes' : !gluten ? 'glúten' : 'leite';
  return `Nossas receitas não levam glúten nem leite, mas são feitas numa cozinha que também manipula ${manipula}. Por isso, podem conter traços. Se você tem doença celíaca ou alergia grave, fale com a gente antes de pedir.`;
}

export const rotulosAlergenos: Record<Alergeno, string> = {
  gluten: 'Glúten',
  leite: 'Leite',
  ovo: 'Ovo',
  amendoim: 'Amendoim',
  coco: 'Coco',
  castanhas: 'Castanhas',
  soja: 'Soja',
};

export interface Secao {
  id: string;
  rotulo: string;
  titulo: string;
  tituloDestaque: string;
  noMenu: boolean;
  rotuloMenu?: string;
}

/** Espaço não separável, para palavra curta não ficar sozinha no fim da linha (“à sobremesa”). */
const nbsp = String.fromCharCode(160);

// Ordem da home. O número do sobretítulo é a posição (índice + 1); o id vira âncora e item de menu.
export const secoes: Secao[] = [
  { id: 'cardapio', rotulo: 'Cardápio', titulo: 'Do café da manhã', tituloDestaque: `à${nbsp}sobremesa.`, noMenu: true },
  { id: 'bento-cake', rotulo: 'Bento Cake', titulo: 'Conta pra gente', tituloDestaque: 'a festa.', noMenu: false },
  { id: 'ingredientes', rotulo: 'Ingredientes', titulo: 'O que entra', tituloDestaque: `e${nbsp}o${nbsp}que fica de fora.`, noMenu: false },
  { id: 'como-pedir', rotulo: 'Como pedir', titulo: 'Do forno à mesa,', tituloDestaque: 'em quatro tempos.', noMenu: true },
  { id: 'sobre', rotulo: 'Nossa história', titulo: 'Uma cozinha', tituloDestaque: 'que nasceu em casa.', noMenu: true, rotuloMenu: 'Sobre' },
  { id: 'depoimentos', rotulo: 'Depoimentos', titulo: 'Sobrou', tituloDestaque: 'só a forminha.', noMenu: true },
  { id: 'perguntas', rotulo: 'Perguntas', titulo: 'Antes de', tituloDestaque: 'você perguntar.', noMenu: false },
  { id: 'contato', rotulo: 'Contato', titulo: 'Tem um sabor', tituloDestaque: 'esperando por você.', noMenu: true },
];

// Menu do Header e do rodapé: href absoluto (/#id) para funcionar também fora da home.
export const menu = secoes.filter((s) => s.noMenu).map((s) => ({ href: `/#${s.id}`, rotulo: s.rotuloMenu ?? s.rotulo }));

export const pedido = { href: '/pedido', rotulo: 'Encomendar' } as const;
