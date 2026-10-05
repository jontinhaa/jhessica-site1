// Link e texto do "Compartilhar" de um produto. Lógica pura (sem DOM nem Astro), testada em tests/.
// O link só leva o id do produto: nenhum dado de quem compartilha.
import { formatarPreco, precosDe, type Produto } from '../../data/cardapio.ts';

/** Endereço absoluto da página de prévia /p/{id}/. `site` (SITE_URL) e `base` aceitam barra final ou não. */
export function linkProduto(id: string, site: URL | string, base = '/'): string {
  const raiz = String(site).replace(/\/+$/, '');
  const pasta = base.replace(/^\/+|\/+$/g, '');
  return `${raiz}/${pasta ? `${pasta}/` : ''}p/${id}/`;
}

/** "a partir de R$ 40,00" quando há mais de um preço; "R$ 40,00" quando só um; null em "em breve". */
export function textoPreco(produto: Produto): string | null {
  const precos = precosDe(produto);
  if (!precos.length) return null;
  return `${new Set(precos).size > 1 ? 'a partir de ' : ''}${formatarPreco(Math.min(...precos))}`;
}

/** Só afirma o que o cardápio confirma: a receita não leva glúten nem leite (a cozinha pode manipular, e isso não é dito aqui). */
export const receitaSemGlutenNemLeite = (produto: Produto) =>
  !produto.alergenos.contem.some((a) => a === 'gluten' || a === 'leite');

/** Título e texto do compartilhamento (navigator.share) e da descrição da prévia (og:description). */
export function textoCompartilhar(produto: Produto): { titulo: string; texto: string } {
  const preco = textoPreco(produto);
  const partes = [produto.nome, preco, receitaSemGlutenNemLeite(produto) ? 'sem glúten e sem leite na receita' : null];
  return { titulo: produto.nome, texto: `${partes.filter(Boolean).join(' · ')}. Peça pelo WhatsApp.` };
}

/** Tudo que o botão "Compartilhar" precisa, pronto no build (o navegador não importa o cardápio). */
export function dadosCompartilhar(produto: Produto, site: URL | string, base = '/') {
  return { link: linkProduto(produto.id, site, base), ...textoCompartilhar(produto) };
}
