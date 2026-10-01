// Preços SEMPRE recalculados a partir do cardápio recebido (nunca do que ficou salvo no navegador).
import type { Produto } from '../../data/cardapio.ts';
import { acharProduto, type ItemPedido } from './itens.ts';

/** Preço de uma unidade com os adicionais; null se o item não existe mais no cardápio. */
export function precoUnitario(i: ItemPedido, produtos: Produto[]): number | null {
  const p = acharProduto(produtos, i.id);
  const v = p?.variantes.find((x) => x.id === i.variante);
  if (!p || !v || v.preco === null) return null;
  return v.preco + i.adicionais.reduce((s, a) => s + (p.adicionais?.find((x) => x.id === a)?.preco ?? 0), 0);
}

export const precoItem = (i: ItemPedido, produtos: Produto[]) => (precoUnitario(i, produtos) ?? 0) * i.quantidade;
export const subtotal = (itens: ItemPedido[], produtos: Produto[]) => itens.reduce((s, i) => s + precoItem(i, produtos), 0);

/** "R$ 160,00" (sempre com centavos; espaço comum no lugar do não separável do Intl, para a mensagem). */
export const formatarReais = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v).replace(/\s/g, ' ');
