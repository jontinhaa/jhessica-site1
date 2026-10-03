// Itens da sacola: o que o cliente escolheu, guardado só por ids (preço e nomes sempre vêm do cardápio).
// Funções puras, sem DOM: rodam no navegador e nos testes (node --test).
import type { Produto } from '../../data/cardapio.ts';

export interface ItemPedido {
  /** id do produto em cardapio.ts */
  id: string;
  /** id da variante (peso, tamanho da caixa) */
  variante: string;
  /** ids dos adicionais marcados */
  adicionais: string[];
  /** id da opção → valor escolhido (ex.: { massa: 'Chocolate', recheio: 'Maracujá' }) */
  opcoes: Record<string, string>;
  semOvo: boolean;
  /** caixa de brigadeiros: sabor → unidades */
  sabores: Record<string, number>;
  quantidade: number;
}

/** Mesma chave = mesmo item (a quantidade soma): produto, variante, adicionais, opções, sem ovos e a caixa. */
export const chaveItem = (i: ItemPedido) => JSON.stringify([
  i.id, i.variante, [...i.adicionais].sort(), Object.entries(i.opcoes).sort(), i.semOvo,
  Object.entries(i.sabores).filter(([, n]) => n > 0).sort(),
]);

/** Acrescenta `novo` à lista: soma a quantidade se já existir item com a mesma chave. Não altera a lista recebida. */
export function juntar(itens: ItemPedido[], novo: ItemPedido): ItemPedido[] {
  const k = chaveItem(novo);
  const i = itens.findIndex((x) => chaveItem(x) === k);
  if (i < 0) return [...itens, novo];
  return itens.map((x, j) => (j === i ? { ...x, quantidade: x.quantidade + novo.quantidade } : x));
}

export const totalUnidades = (itens: ItemPedido[]) => itens.reduce((n, i) => n + i.quantidade, 0);
export const acharProduto = (produtos: Produto[], id: string) => produtos.find((p) => p.id === id);

/** O item ainda pode ser pedido com o cardápio de hoje? (produto disponível, variante com preço, escolhas válidas) */
export function itemValido(i: ItemPedido, produtos: Produto[]): boolean {
  const p = acharProduto(produtos, i.id);
  if (!p || !p.disponivel || !(i.quantidade >= 1)) return false;
  const v = p.variantes.find((x) => x.id === i.variante);
  if (!v || v.preco === null) return false;
  if (!i.adicionais.every((a) => p.adicionais?.some((x) => x.id === a))) return false;
  if (i.semOvo && !p.permiteSemOvo) return false;
  const caixa = p.montarCaixa ? p.opcoes?.find((o) => o.id === 'sabor') : undefined;
  for (const o of p.opcoes ?? []) {
    if (o === caixa) continue;
    if (!o.valores.some((x) => x.nome === i.opcoes[o.id])) return false;
  }
  if (caixa) {
    const soma = Object.values(i.sabores).reduce((n, x) => n + x, 0);
    if (soma !== v.unidades || !Object.keys(i.sabores).every((s) => caixa.valores.some((x) => x.nome === s))) return false;
  }
  return true;
}

const minuscula = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** Partes legíveis do item, para a sacola e a mensagem. Supõe item válido. */
export function partesItem(i: ItemPedido, produtos: Produto[]) {
  const p = acharProduto(produtos, i.id)!;
  const v = p.variantes.find((x) => x.id === i.variante)!;
  return {
    nome: p.nome,
    // caixa: "6 un."; peso: "500 g"; variante única com o nome do produto (Bento Cake): nada
    variante: v.unidades ? `${v.unidades} un.` : v.rotulo !== p.nome ? v.rotulo : '',
    adicionais: i.adicionais.map((a) => minuscula(p.adicionais!.find((x) => x.id === a)!.rotulo)),
    opcoes: (p.opcoes ?? []).filter((o) => i.opcoes[o.id]).map((o) => `${o.rotulo.toLowerCase()} ${minuscula(i.opcoes[o.id])}`),
    sabores: Object.entries(i.sabores).filter(([, n]) => n > 0).map(([s, n]) => `${n} ${s.toLowerCase()}`),
    // só nos produtos que têm as duas versões: a mensagem e a sacola dizem qual foi escolhida
    versao: p.permiteSemOvo ? (i.semOvo ? 'sem ovos' : 'com ovos') : '',
  };
}
