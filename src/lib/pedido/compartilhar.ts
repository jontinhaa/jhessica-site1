// Link e texto do "Compartilhar" de um produto. Lógica pura (sem DOM nem Astro), testada em tests/.
// O link só leva o id do produto: nenhum dado de quem compartilha.
import { aveiaContaComoGluten, formatarPreco, levaAveia, ondeNaOpcao, opcoesComAveia, precosDe, type Produto } from '../../data/cardapio.ts';
import { compromisso } from '../../data/site.ts';

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

/** Só afirma o que o cardápio confirma: a receita não leva glúten nem leite (a cozinha pode manipular, e isso não é dito aqui).
 *  Aveia comum, no produto ou em alguma opção (massa do Bento), tira o "sem glúten"; declarada sem glúten (interruptor
 *  `aveiaSemGluten` ligado), não tira. */
export const receitaSemGlutenNemLeite = (produto: Produto, semGluten = compromisso.aveiaSemGluten) =>
  !produto.alergenos.contem.some((a) => a === 'gluten' || (a === 'aveia' && aveiaContaComoGluten(semGluten)) || a === 'leite')
  && !levaAveia(produto, semGluten);

/** Título e texto do compartilhamento (navigator.share) e da descrição da prévia (og:description). */
export function textoCompartilhar(produto: Produto, semGluten = compromisso.aveiaSemGluten): { titulo: string; texto: string } {
  const preco = textoPreco(produto);
  const aveia = levaAveia(produto, semGluten);
  const semLeite = !produto.alergenos.contem.includes('leite');
  const receita = receitaSemGlutenNemLeite(produto, semGluten) ? 'sem glúten e sem leite na receita' : aveia && semLeite ? 'sem leite na receita' : null;
  // aveia só numa opção (massa de chocolate do Bento): o aviso diz qual, no mesmo jeito do painel
  const ondes = opcoesComAveia(produto, semGluten).map(({ opcao, valor }) => ondeNaOpcao(produto, opcao, valor));
  const aviso = aveia === true ? 'leva aveia comum' : aveia ? `com ${new Intl.ListFormat('pt-BR').format(ondes)}, leva aveia comum` : null;
  const partes = [produto.nome, preco, receita, aviso && `${aviso}, não indicado para celíacos`];
  return { titulo: produto.nome, texto: `${partes.filter(Boolean).join(' · ')}. Peça pelo WhatsApp.` };
}

/** Tudo que o botão "Compartilhar" precisa, pronto no build (o navegador não importa o cardápio). */
export function dadosCompartilhar(produto: Produto, site: URL | string, base = '/') {
  return { link: linkProduto(produto.id, site, base), ...textoCompartilhar(produto) };
}
