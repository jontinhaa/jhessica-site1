// Sacola: itens + nome, salvos no navegador ("jhessica:sacola:v1"). Endereço, observações e telefone NUNCA são salvos.
// Preços e nomes vêm sempre do cardápio passado em iniciarSacola() (JSON embutido no /pedido); o preço salvo
// (precoVisto) só serve para perceber que o cardápio mudou. Cada mudança dispara "sacola:mudou".
import type { Produto } from '../data/cardapio';
import { acharProduto, chaveItem, itemValido, juntar, totalUnidades, type ItemPedido } from '../lib/pedido/itens';
import { precoUnitario, subtotal } from '../lib/pedido/precos';

const CHAVE = 'jhessica:sacola:v1';
type Salvo = ItemPedido & { precoVisto?: number };

let produtos: Produto[] = [];
let itens: Salvo[] = [];
let nome = '';

function ler(): { itens: Salvo[]; nome: string } {
  try {
    const d = JSON.parse(localStorage.getItem(CHAVE) ?? 'null');
    return { itens: Array.isArray(d?.itens) ? d.itens : [], nome: typeof d?.nome === 'string' ? d.nome : '' };
  } catch {
    return { itens: [], nome: '' };
  }
}
function gravar() {
  try { localStorage.setItem(CHAVE, JSON.stringify({ itens, nome })); } catch { /* sem armazenamento: a sacola vale só nesta página */ }
}
function avisar() {
  gravar();
  dispatchEvent(new CustomEvent('sacola:mudou', { detail: { total: totalItens() } }));
}

/** Total de unidades salvo, sem precisar do cardápio (header em qualquer página). */
export const totalSalvo = () => totalUnidades(ler().itens);

/** Carrega a sacola salva com o cardápio de hoje: tira o que não existe mais e confere os preços. */
export function iniciarSacola(cardapio: Produto[]) {
  produtos = cardapio;
  const salvo = ler();
  nome = salvo.nome;
  const validos = salvo.itens.filter((i) => itemValido(i, produtos));
  let mudou = validos.length !== salvo.itens.length;
  itens = validos.map((i) => {
    const preco = precoUnitario(i, produtos)!;
    if (i.precoVisto !== undefined && i.precoVisto !== preco) mudou = true;
    return { ...i, precoVisto: preco };
  });
  avisar();
  if (mudou) aviso('Atualizamos sua sacola com o cardápio de hoje');
}

export const listar = (): ItemPedido[] => itens;
export const cardapio = () => produtos;
export const totalItens = () => totalUnidades(itens);
export const valorTotal = () => subtotal(itens, produtos);
export const lerNome = () => nome;
export function guardarNome(n: string) { nome = n; gravar(); }

export function adicionar(item: ItemPedido) {
  if (!itemValido(item, produtos)) return;
  itens = juntar(itens, { ...item, precoVisto: precoUnitario(item, produtos)! } as Salvo);
  avisar();
  aviso(`${acharProduto(produtos, item.id)!.nome} na sacola`);
}

export function alterarQuantidade(chave: string, quantidade: number) {
  itens = itens.map((i) => (chaveItem(i) === chave ? { ...i, quantidade: Math.max(1, Math.min(20, quantidade)) } : i));
  avisar();
}

/** Remove e oferece "Desfazer" por 5s (o item volta para o mesmo lugar). */
export function remover(chave: string) {
  const pos = itens.findIndex((i) => chaveItem(i) === chave);
  if (pos < 0) return;
  const tirado = itens[pos];
  itens = itens.filter((_, j) => j !== pos);
  avisar();
  aviso('Removido', { rotulo: 'Desfazer', acao: () => { itens = [...itens.slice(0, pos), tirado, ...itens.slice(pos)]; avisar(); } }, 5000);
}

export function limpar() { itens = []; avisar(); }

// ---------- .toast: usa o que estiver dentro do <dialog> aberto (fora dele, o modal deixaria o botão inerte) ----------
let tempo = 0;
export function aviso(texto: string, botao?: { rotulo: string; acao: () => void }, ms = 2500) {
  const t = document.querySelector<HTMLElement>('dialog[open] .toast') ?? document.getElementById('toast');
  if (!t) return;
  document.querySelectorAll('.toast.show').forEach((o) => o !== t && o.classList.remove('show'));
  t.querySelector('[data-toast-texto]')!.textContent = texto;
  const b = t.querySelector<HTMLButtonElement>('[data-toast-acao]');
  if (b) {
    b.hidden = !botao;
    b.textContent = botao?.rotulo ?? '';
    b.onclick = botao ? () => { botao.acao(); t.classList.remove('show'); } : null;
  }
  t.classList.toggle('com-acao', !!botao);
  t.classList.add('show');
  clearTimeout(tempo);
  tempo = window.setTimeout(() => t.classList.remove('show'), ms);
}
