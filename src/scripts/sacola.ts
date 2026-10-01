// Sacola PROVISÓRIA (etapa 11a): guarda os itens só em memória, avisa com o evento "sacola:mudou" e mostra o .toast.
// A sacola real (persistência, revisão e envio pelo WhatsApp) é a etapa 11b.

export interface ItemSacola {
  id: string;
  nome: string;
  variante: string;
  adicionais: string[];
  opcoes: Record<string, string>;
  sabores: Record<string, number>;
  semOvo: boolean;
  quantidade: number;
  /** preço de uma unidade, já com adicionais */
  preco: number;
}

const itens: ItemSacola[] = [];
export const totalItens = () => itens.reduce((n, i) => n + i.quantidade, 0);

let tempo = 0;
export function adicionar(item: ItemSacola) {
  itens.push(item);
  dispatchEvent(new CustomEvent('sacola:mudou', { detail: { total: totalItens() } }));
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.querySelector('[data-toast-texto]')!.textContent = `${item.nome} na sacola`;
  toast.classList.add('show');
  clearTimeout(tempo);
  tempo = window.setTimeout(() => toast.classList.remove('show'), 2500);
}
