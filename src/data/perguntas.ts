// Perguntas frequentes (seção Perguntas). Cada resposta é MONTADA dos dados (regrasPedido, compromisso, conservacao, contato,
// passosPedido e o cardápio), não é texto solto: mudou um prazo, uma entrega ou um alérgeno, a resposta muda junto.
// Pergunta com `pendente` fica oculta (ou vai sem a parte pendente) até a cliente responder; tire o campo quando entrar o dado.
import { categorias, comAveia, produtos, type Alergeno, type CategoriaId } from './cardapio.ts';
import { compromisso, conservacao, contato, diasDeEntrega, entregaConfirmada, passosPedido, regrasPedido, rotulosAlergenos } from './site.ts';
import { textoCozinha, tudoSemGlutenNemLeite } from './promessa.ts';

export interface Pergunta {
  id: string;
  pergunta: string;
  /** Um parágrafo por item. */
  resposta: string[];
  /** Enquanto existir, a pergunta não aparece. Diz o que falta a cliente responder. */
  pendente?: string;
}

const lista = (itens: string[]) => new Intl.ListFormat('pt-BR', { style: 'long', type: 'conjunction' }).format(itens);
const minusculo = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
// a aveia comum tem frase própria ("…leva glúten (aveia comum): não indicado para celíacos"), fora da conta por categoria
const ordemAlergenos: Alergeno[] = (Object.keys(rotulosAlergenos) as Alergeno[]).filter((a) => a !== 'aveia');
const rotulo = (a: Alergeno) => rotulosAlergenos[a].toLowerCase();
const nomeCategoria = (id: CategoriaId) => categorias.find((c) => c.id === id)!.nome;

const doCardapio = produtos.filter((p) => p.disponivel);
const porCategoria = categorias
  .map((c) => ({ categoria: c, itens: doCardapio.filter((p) => p.categoria === c.id) }))
  .filter((g) => g.itens.length);

/** Resposta 3: alérgenos, por categoria, a partir de `contem` / `podeConter` e das opções que trazem alérgeno (sabores). */
export function respostaAlergenos(): string[] {
  const comuns = (g: (typeof porCategoria)[number]) => ordemAlergenos.filter((a) => g.itens.every((p) => p.alergenos.contem.includes(a)));

  // categorias com o mesmo conjunto de alérgenos viram uma frase só
  const grupos = new Map<string, string[]>();
  for (const g of porCategoria) {
    const chave = comuns(g).join(',');
    grupos.set(chave, [...(grupos.get(chave) ?? []), g.categoria.nome]);
  }
  const frases: string[] = [];
  for (const [chave, nomes] of grupos) {
    if (!chave) continue;
    frases.push(`${lista(nomes)} levam ${lista(chave.split(',').map((a) => rotulo(a as Alergeno)))}.`);
  }
  const semOvo = porCategoria.filter((g) => !comuns(g).includes('ovo')).map((g) => g.categoria.nome);
  if (semOvo.length) frases.push(`${lista(semOvo)} não levam ovo.`);

  // o que algum produto ou sabor leva além do comum da categoria (ex.: coco no bolo de maçã, amendoim na paçoca)
  const extras = new Map<Alergeno, string[]>();
  const somar = (a: Alergeno, onde: string) => extras.set(a, [...(extras.get(a) ?? []), onde]);
  for (const g of porCategoria) {
    const base = comuns(g);
    for (const p of g.itens) {
      p.alergenos.contem.filter((a) => a !== 'aveia' && !base.includes(a)).forEach((a) => somar(a, minusculo(p.nome)));
      for (const o of p.opcoes ?? []) for (const v of o.valores) (v.contem ?? []).filter((a) => a !== 'aveia').forEach((a) => somar(a, `${minusculo(g.categoria.nome.replace(/s$/, ''))} de ${minusculo(v.nome)}`));
    }
  }
  const extra = ordemAlergenos.filter((a) => extras.has(a)).map((a) => `${rotulo(a)} (${lista(extras.get(a)!)})`);
  if (extra.length) frases.push(`Também levam: ${lista(extra)}.`);
  const aveia = comAveia(doCardapio);
  if (aveia.length) {
    const mais = aveia.length > 1;
    const nomes = lista(aveia);
    frases.push(`${nomes.charAt(0).toUpperCase()}${nomes.slice(1)} ${mais ? 'levam' : 'leva'} ${rotulo('aveia')}: não ${mais ? 'indicados' : 'indicado'} para celíacos.`);
  }

  // traços: o que todos podem conter e o que só algumas categorias podem
  const todos = ordemAlergenos.filter((a) => doCardapio.every((p) => p.alergenos.podeConter.includes(a)));
  frases.push(`Todos podem conter traços de ${lista(todos.map(rotulo))}.`);
  for (const g of porCategoria) {
    const mais = ordemAlergenos.filter((a) => !todos.includes(a) && g.itens.some((p) => p.alergenos.podeConter.includes(a)));
    if (mais.length) frases.push(`${g.categoria.nome} também podem conter traços de ${lista(mais.map(rotulo))}.`);
  }
  return [frases.join(' ')];
}

/** Resposta 5: prazos, direto de regrasPedido. */
export function respostaPrazos(): string[] {
  const r = regrasPedido;
  const especiais = r.categoriasPrazoEspecial.map(nomeCategoria);
  const dias = (n: number) => `${n} dias`;
  const prazos = [`O prazo mínimo é de ${dias(r.prazoMinimoDias)}.`];
  prazos.push(`${lista(especiais)} e brigadeiros a partir de ${r.limiteBrigadeirosUnidades} unidades pedem ${dias(r.prazoEspecialDias)}.`);
  if (r.contarDoProximoDiaUtil) {
    prazos.push(`Pedido feito depois das ${r.horaCorte}h ou no fim de semana conta a partir do próximo dia útil.`);
  }
  return [prazos.join(' ')];
}

/** Resposta 7: entrega e retirada. O dia da entrega só aparece depois de confirmado (entregaConfirmada). */
export function respostaEntrega(): string[] {
  const entrega = entregaConfirmada.confirmado
    ? `Entregamos aos ${diasDeEntrega()}: grátis no bairro ${regrasPedido.entrega.gratisNoBairro} e, nos demais, com ${regrasPedido.entrega.demaisBairros}.`
    : `A entrega é grátis no bairro ${regrasPedido.entrega.gratisNoBairro}; nos demais, a ${regrasPedido.entrega.demaisBairros}.`;
  return [`${entrega} ${contato.retirada.texto.replace(/^Retirada /, `Retirada no ${contato.bairroRetirada}, `)}.`];
}

const acucar = compromisso.ingredientesQueEntram.find((i) => i.rabisco === 'acucar');
const cozinha = textoCozinha();

const todas: Pergunta[] = [
  {
    id: 'sem-gluten-leite',
    pergunta: 'É tudo sem glúten e sem leite?',
    // textoCozinha() é null enquanto glúten/leite da cozinha não estiver confirmado: então não afirmamos nada.
    // "Sim." só com a cozinha confirmada sem glúten e sem leite e nenhuma aveia no cardápio; senão, a frase já diz o que vale.
    resposta: [cozinha
      ? (tudoSemGlutenNemLeite() ? `Sim. ${cozinha}` : cozinha)
      : 'Fale com a gente pelo WhatsApp antes de pedir: a composição é informada produto a produto.'],
  },
  {
    id: 'acucar',
    pergunta: 'Leva açúcar?',
    resposta: [
      (compromisso.semAcucarRefinado === true ? 'Nenhum produto leva açúcar refinado.' : 'Evitamos açúcar refinado e o excesso de industrializados.')
        + (acucar ? ` Usamos ${minusculo(acucar.nome)}. ${acucar.porque.split('. ').slice(1).join('. ')}`.trimEnd() : ''),
    ],
  },
  {
    id: 'alergenos',
    pergunta: 'Quais alérgenos os produtos têm?',
    resposta: [
      ...respostaAlergenos(),
      'O brigadeiro tem base de inhame e não leva castanha nem amêndoa; o de paçoca leva amendoim e o beijinho leva coco. Como tudo é feito na mesma cozinha, pode conter traços.',
    ],
  },
  {
    id: 'sem-ovos',
    pergunta: 'Tem versão sem ovos?',
    resposta: [
      `Sim, no ${lista(doCardapio.filter((p) => p.permiteSemOvo).map((p) => minusculo(p.nome)))}. É a mesma receita, sem ovos, pelo mesmo preço e com o mesmo prazo das versões com ovo (${regrasPedido.prazoMinimoDias} dias). Escolha "Quero sem ovos" ao montar o pedido.`,
    ],
  },
  { id: 'prazo', pergunta: 'Com quanto tempo preciso pedir?', resposta: respostaPrazos() },
  {
    id: 'pedido-pagamento',
    pergunta: 'Como faço o pedido e pago?',
    resposta: [
      `${passosPedido[0].texto} ${passosPedido[1].texto} Se preferir, é só chamar direto no WhatsApp.`,
      `${passosPedido[2].texto} O pagamento é por Pix, combinado no WhatsApp.`,
    ],
  },
  { id: 'entrega', pergunta: 'Vocês entregam?', resposta: respostaEntrega() },
  {
    id: 'conservacao',
    pergunta: 'Como conservo?',
    resposta: [
      ...porCategoria.map((g) => `${g.categoria.nome}: ${minusculo(conservacao.porCategoria[g.categoria.id])}`),
      conservacao.observacaoCongelados,
    ],
  },
  {
    id: 'bento-nome-idade',
    pergunta: 'O Bento pode ter nome ou idade escritos?',
    resposta: ['Não. O Bento sai com a decoração dos modelos da casa, sem escrita.'],
  },
];

export const perguntas = todas.filter((p) => !p.pendente);
export const perguntasPendentes = todas.filter((p) => p.pendente);
