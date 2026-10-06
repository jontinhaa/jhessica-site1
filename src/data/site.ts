// Configuração central. Header, Footer, SEO e a ordem das seções da home leem daqui.
// Só tipos do cardápio aqui: scripts do navegador (sacola, prazos, mensagem) importam este arquivo, e o cardápio não pode ir junto.
// O que depende do cardápio (a promessa de glúten e leite, a frase da cozinha, a descrição do site) fica em promessa.ts.
import type { Alergeno, CategoriaId } from './cardapio';
import { url } from '../lib/url.ts';

export const marca = {
  nome: 'Jhessica em Cozinha Saudável',
  nomeCurto: 'Jhessica',
  ligacao: 'em',
  assinatura: 'Cozinha Saudável',
} as const;

export const seo = {
  titulo: `${marca.nome} · Confeitaria artesanal em Marabá`,
  // a descrição (meta e prévia de link) sai do cardápio: descricaoSite em promessa.ts
  idioma: 'pt-BR',
  // barra do navegador no celular (<meta name="theme-color">): meta tag não lê variável CSS, então os valores
  // repetem o --bg de src/styles/tokens.css (modo dia e modo noite). Mudou o token, mude aqui.
  corTema: { dia: '#F6EFE4', noite: '#140D0A' },
} as const;

// Endereço completo (rua, quadra, lote) NÃO entra no repositório: só o bairro; o resto é combinado no WhatsApp.
// Horário de atendimento em HH:MM: os textos ("das 8h às 18h") e o JSON-LD da home saem daqui.
const horario = { abre: '08:00', fecha: '18:00' };
const hora = (hhmm: string) => `${Number(hhmm.slice(0, 2))}h${hhmm.endsWith(':00') ? '' : hhmm.slice(3)}`;

export const contato = {
  whatsapp: '5594981080336', // DDI + DDD, só dígitos
  whatsappExibicao: '(94) 98108-0336',
  instagram: 'jhessica.em.cozinha.saudavel', // sem @
  bairroRetirada: 'Cidade Jardim',
  cidade: 'Marabá',
  estado: 'PA',
  retirada: { dias: [1, 2, 3, 4, 5], texto: 'Retirada de segunda a sexta, com horário combinado' },
  // dias como em Date.getDay(): 0 = domingo … 6 = sábado
  atendimento: {
    dias: [1, 2, 3, 4, 5],
    horario,
    texto: `Segunda a sexta, das ${hora(horario.abre)} às ${hora(horario.fecha)}`,
    textoCurto: `Seg a sex · ${hora(horario.abre)} às ${hora(horario.fecha)}`,
  },
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
  // pedido depois de horaCorte ou no fim de semana: o prazo conta do próximo dia útil (seg–sex)
  contarDoProximoDiaUtil: true, // TODO: confirmar com a cliente
  horaCorte: 18,
  diasEntrega: [0], // só aos domingos (0 = domingo)
  entrega: { gratisNoBairro: 'Cidade Jardim', demaisBairros: 'taxa combinada pelo WhatsApp' },
};

// Entrega: o texto público só cita o dia depois de confirmado.
export const entregaConfirmada = { diasEntrega: [0], confirmado: true }; // confirmado com a cliente: só aos domingos

/** "domingos", a partir de regrasPedido.diasEntrega (para "entregamos aos domingos"). */
const diasExtenso = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
export const diasDeEntrega = () => new Intl.ListFormat('pt-BR').format(regrasPedido.diasEntrega.map((d) => `${diasExtenso[d]}s`));

/** "seg a sex", a partir de contato.atendimento.dias. */
// ponytail: supõe dias seguidos (1–5); se a cliente atender em dias salteados, listar os nomes
const nomesDias = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
export const faixaAtendimento = () => {
  const d = contato.atendimento.dias;
  return `${nomesDias[d[0]]} a ${nomesDias[d[d.length - 1]]}`;
};

export interface PassoPedido { n: string; verbo: string; titulo: string; texto: string; icone: `solar:${string}` }

export const passosPedido: PassoPedido[] = [
  { n: 'um', verbo: 'escolher', titulo: 'Monte seu pedido no cardápio.', texto: 'Escolha os produtos, o peso e a quantidade. O total aparece na hora.', icone: 'solar:bag-4-linear' },
  { n: 'dois', verbo: 'enviar', titulo: 'Mande pelo WhatsApp.', texto: 'O pedido chega organizado no WhatsApp da Jhessica, com tudo o que você escolheu.', icone: 'solar:chat-round-line-linear' },
  { n: 'três', verbo: 'confirmar', titulo: 'Ela confirma e manda o Pix.', texto: 'Ela confere a disponibilidade e a data, combina a entrega e envia a chave para o pagamento.', icone: 'solar:check-circle-linear' },
  {
    n: 'quatro', verbo: 'receber', titulo: 'Retire ou receba.', icone: 'solar:delivery-linear',
    texto: `Retirada de segunda a sexta no ${contato.bairroRetirada}, com horário combinado. `
      + (entregaConfirmada.confirmado ? 'Entregas aos domingos: peça até sexta. Grátis no bairro' : 'Entrega grátis no bairro')
      + '; para outros bairros, a taxa é combinada pelo WhatsApp.',
  },
];

// Fotos da seção Bento: destaque + modelo-1…modelo-N em src/assets/images/bento/ (npm run fotos confere).
export const fotosBento = { modelos: 3 };

/** Prazo de encomenda de um item: o especial (7 dias) para as categorias da lista e para brigadeiros a partir do
 *  limite de unidades; o mínimo (2 dias) nos demais. O painel do /pedido refaz a conta dos brigadeiros ao vivo. */
export const prazoDias = (categoria: CategoriaId, unidades = 0) =>
  regrasPedido.categoriasPrazoEspecial.includes(categoria) || (categoria === 'brigadeiros' && unidades >= regrasPedido.limiteBrigadeirosUnidades)
    ? regrasPedido.prazoEspecialDias
    : regrasPedido.prazoMinimoDias;

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

/** Ingrediente de "O que entra": nome do rabisco (Doodle.astro) e da cena do verso (CenaIngrediente.astro). */
export type IngredienteId = 'arroz' | 'aveia' | 'castanhas' | 'leite' | 'acucar' | 'girassol';

// O que a seção Ingredientes pode afirmar. null = não confirmado: a frase correspondente não promete nada.
export const compromisso = {
  cozinhaSemGluten: false as boolean | null,
  cozinhaSemLeite: false as boolean | null,
  semAcucarRefinado: true as boolean | null, // true = nenhum produto usa; false ou null = "evitamos"
  // TODO: revisar textos com a cliente
  ingredientesQueEntram: [
    { nome: 'Farinha de arroz', rabisco: 'arroz', cena: 'arroz', legenda: 'colhido grão por grão', porque: 'A base leve das massas, no lugar do trigo.' },
    { nome: 'Farinha de aveia', rabisco: 'aveia', cena: 'aveia', legenda: 'do campo pro moinho', porque: 'Textura macia e sabor de bolo caseiro. É aveia comum, não certificada.' },
    { nome: 'Amêndoas e castanha de caju', rabisco: 'castanhas', cena: 'castanhas', legenda: 'caju no pé, castanha na cesta', porque: 'Dão corpo, umidade e um sabor amanteigado, sem manteiga.' },
    { nome: 'Leites vegetais', rabisco: 'leite', cena: 'leite', legenda: 'do coco pro copo', porque: 'De amêndoas, de caju ou de coco, no lugar do leite em massas, cremes e recheios.' },
    { nome: 'Açúcar demerara', rabisco: 'acucar', cena: 'acucar', legenda: 'da cana pro açúcar', porque: 'No lugar do refinado. Em algumas receitas de chocolate, mascavo.' },
    { nome: 'Óleo de girassol', rabisco: 'girassol', cena: 'girassol', legenda: 'o girassol segue o sol', porque: 'Deixa a massa macia, no lugar da manteiga.' },
  ] as { nome: string; rabisco: IngredienteId; cena: IngredienteId; legenda: string; porque: string }[],
};

/** Linha do açúcar: "nada de" só quando confirmado; nos outros casos, "evitamos". */
export const textoAcucar = (semAcucarRefinado = compromisso.semAcucarRefinado) =>
  semAcucarRefinado === true ? 'E nada de açúcar refinado.' : 'E evitamos açúcar refinado e o excesso de industrializados.';

export const rotulosAlergenos: Record<Alergeno, string> = {
  gluten: 'Glúten',
  aveia: 'Glúten (aveia comum)',
  leite: 'Leite',
  ovo: 'Ovo',
  amendoim: 'Amendoim',
  coco: 'Coco',
  castanhas: 'Castanhas',
  soja: 'Soja',
};

/** Seção "Nossa história" (Sobre.astro). Texto a partir do briefing da cliente (seção 2, "História da marca").
 *  Números do .meta não ficam aqui: a seção os calcula do cardápio e de `regrasPedido`. `desde` é data fixa (nada de "há X anos").
 *  TODO: revisar o texto em primeira pessoa com a cliente. */
export const historia = {
  desde: { ano: '2025', texto: 'desde setembro' },
  paragrafos: [
    'Depois que meu segundo filho nasceu, eu precisava de um jeito de trabalhar que coubesse na vida da nossa casa: gerar renda sem me afastar da família. Foi na minha cozinha que tudo começou.',
    'A Jhessica em Cozinha Saudável nasceu desse movimento. Aqui tudo é feito à mão, em pequena escala e por encomenda, pensado para quem tem alguma restrição alimentar e para quem só quer comer melhor.',
    'Restrição não precisa ser sinônimo de abrir mão do sabor. Cada receita é pensada para ser bonita, macia e do jeito que bolo de casa tem que ser.',
  ],
  assinatura: 'Jhessica',
  fotoAlt: 'Jhessica, a confeiteira, sorrindo de braços cruzados, de blusa preta e calça branca',
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
  { id: 'bento-cake', rotulo: 'Bento Cake', titulo: 'Pra cantar parabéns', tituloDestaque: 'sem abrir mão do sabor.', noMenu: false },
  { id: 'ingredientes', rotulo: 'Ingredientes', titulo: 'O que entra', tituloDestaque: `e${nbsp}o${nbsp}que fica de fora.`, noMenu: false },
  { id: 'como-pedir', rotulo: 'Como pedir', titulo: 'Do forno à mesa,', tituloDestaque: 'em quatro tempos.', noMenu: true },
  { id: 'sobre', rotulo: 'Nossa história', titulo: 'Uma cozinha', tituloDestaque: 'que nasceu em casa.', noMenu: true, rotuloMenu: 'Sobre' },
  { id: 'depoimentos', rotulo: 'Depoimentos', titulo: 'Sobrou', tituloDestaque: 'só a forminha.', noMenu: true },
  { id: 'perguntas', rotulo: 'Perguntas', titulo: 'Antes de', tituloDestaque: 'você perguntar.', noMenu: false },
  { id: 'contato', rotulo: 'Contato', titulo: 'Tem um sabor', tituloDestaque: 'esperando por você.', noMenu: true },
];

// Menu do Header e do rodapé: href absoluto (url('/#id')) para funcionar também fora da home.
export const menu = secoes.filter((s) => s.noMenu).map((s) => ({ href: url(`/#${s.id}`), rotulo: s.rotuloMenu ?? s.rotulo }));

export const pedido = { href: url('/pedido'), rotulo: 'Encomendar' } as const;
