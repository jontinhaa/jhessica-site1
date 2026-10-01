// Prazos e datas possíveis do pedido. Datas no fuso local do navegador; contagem em dias corridos.
import type { Produto } from '../../data/cardapio.ts';
import { contato, regrasPedido } from '../../data/site.ts';
import { acharProduto, type ItemPedido } from './itens.ts';

type Regras = typeof regrasPedido;
export type Modalidade = 'retirada' | 'entrega';

/** Prazo do pedido inteiro: o especial se houver item de categoria especial (Bento) ou se os brigadeiros somarem
 *  o limite de unidades (caixa de 6 = 6, de 12 = 12); senão o mínimo. `motivo` explica o prazo especial. */
export function prazoDoPedido(itens: ItemPedido[], produtos: Produto[], regras: Regras = regrasPedido) {
  let especial = false, brigadeiros = 0;
  for (const i of itens) {
    const p = acharProduto(produtos, i.id);
    if (!p) continue;
    if (regras.categoriasPrazoEspecial.includes(p.categoria)) especial = true;
    if (p.categoria === 'brigadeiros') brigadeiros += (p.variantes.find((v) => v.id === i.variante)?.unidades ?? 0) * i.quantidade;
  }
  if (especial) return { dias: regras.prazoEspecialDias, motivo: 'bento' as const };
  if (brigadeiros >= regras.limiteBrigadeirosUnidades) return { dias: regras.prazoEspecialDias, motivo: 'brigadeiros' as const };
  return { dias: regras.prazoMinimoDias, motivo: null };
}

const meiaNoite = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const somarDias = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const fimDeSemana = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

/** Dia em que a contagem do prazo começa: hoje; ou o próximo dia útil se for depois do corte ou fim de semana. */
export function inicioDaContagem(agora: Date, regras: Regras = regrasPedido): Date {
  const hoje = meiaNoite(agora);
  if (!regras.contarDoProximoDiaUtil || (agora.getHours() < regras.horaCorte && !fimDeSemana(agora))) return hoje;
  let d = somarDias(hoje, 1);
  while (fimDeSemana(d)) d = somarDias(d, 1);
  return d;
}

/** A contagem começou depois de hoje? (para explicar a regra na tela) */
export const contagemAdiada = (agora: Date, regras: Regras = regrasPedido) => inicioDaContagem(agora, regras) > meiaNoite(agora);

/** As próximas `quantidade` datas possíveis: retirada só nos dias de retirada, entrega só nos dias de entrega,
 *  sempre a partir de início da contagem + prazo. */
export function datasValidas(
  modalidade: Modalidade, itens: ItemPedido[], agora: Date,
  { produtos, quantidade = 6, regras = regrasPedido, diasRetirada = contato.retirada.dias }:
  { produtos: Produto[]; quantidade?: number; regras?: Regras; diasRetirada?: number[] },
): Date[] {
  const dias = modalidade === 'entrega' ? regras.diasEntrega : diasRetirada;
  const datas: Date[] = [];
  let d = somarDias(inicioDaContagem(agora, regras), prazoDoPedido(itens, produtos, regras).dias);
  for (let guarda = 0; datas.length < quantidade && guarda < 400; guarda++, d = somarDias(d, 1)) {
    if (dias.includes(d.getDay())) datas.push(d);
  }
  return datas;
}

const curtos = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const longos = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const ddmm = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
/** "sex 03/10" */
export const diaCurto = (d: Date) => `${curtos[d.getDay()]} ${ddmm(d)}`;
/** "sexta, 03/10" */
export const diaLongo = (d: Date) => `${longos[d.getDay()]}, ${ddmm(d)}`;
/** "2025-10-03" (valor de formulário, sem fuso) */
export const isoDia = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const deIsoDia = (s: string) => { const [a, m, d] = s.split('-').map(Number); return new Date(a, m - 1, d); };
