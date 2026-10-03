// Mensagem do pedido para o WhatsApp da Jhessica, o link wa.me e o número do pedido.
import type { Produto } from '../../data/cardapio.ts';
import { contato, regrasPedido } from '../../data/site.ts';
import { partesItem, type ItemPedido } from './itens.ts';
import { formatarReais, precoItem, subtotal } from './precos.ts';
import { diaLongo, type Modalidade } from './prazos.ts';

export interface Pedido {
  numero: string;
  itens: ItemPedido[];
  modalidade: Modalidade;
  data: Date;
  nome: string;
  bairro?: string;
  endereco?: string;
  observacoes?: string;
}

/** Sem acento, minúsculas e espaços simples: "Cidade  Jardim " → "cidade jardim". */
export const normalizar = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim().replace(/\s+/g, ' ');
export const entregaGratis = (bairro: string) => normalizar(bairro) === normalizar(regrasPedido.entrega.gratisNoBairro);

/** "0310-7KM": dia e mês + 3 caracteres sem os ambíguos (0/O, 1/I). */
const SEM_AMBIGUOS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export function numeroPedido(agora: Date, aleatorio = Math.random) {
  const sufixo = Array.from({ length: 3 }, () => SEM_AMBIGUOS[Math.floor(aleatorio() * SEM_AMBIGUOS.length)]).join('');
  return `${String(agora.getDate()).padStart(2, '0')}${String(agora.getMonth() + 1).padStart(2, '0')}-${sufixo}`;
}

/** "• 2x Pão de batata-doce (800 g), sem ovos — R$ 80,00" */
export function linhaItem(i: ItemPedido, produtos: Produto[]) {
  const p = partesItem(i, produtos);
  let s = `• ${i.quantidade}x ${p.nome}`;
  if (p.variante) s += ` (${p.variante})`;
  if (p.adicionais.length) s += ` com ${p.adicionais.join(' e ')}`;
  if (p.sabores.length) s += `: ${p.sabores.join(', ')}`;
  if (p.opcoes.length) s += `, ${p.opcoes.join(', ')}`;
  if (p.versao) s += `, ${p.versao}`;
  return `${s} — ${formatarReais(precoItem(i, produtos))}`;
}

export function montarMensagem(pedido: Pedido, produtos: Produto[]) {
  const linhas = [
    'Olá, Jhessica! Quero fazer um pedido pelo site.',
    '',
    `Pedido nº ${pedido.numero}`,
    '',
    ...pedido.itens.map((i) => linhaItem(i, produtos)),
    '',
    `Subtotal: ${formatarReais(subtotal(pedido.itens, produtos))}`,
  ];
  const quando = diaLongo(pedido.data);
  if (pedido.modalidade === 'retirada') {
    linhas.push(`Retirada: ${quando} — horário a combinar`);
  } else {
    // o bairro da entrega grátis vai com o nome oficial, do jeito que a Jhessica escreve ("cidade jardim" → "Cidade Jardim")
    const digitado = (pedido.bairro ?? '').trim(), gratis = entregaGratis(digitado);
    linhas.push(`Entrega: ${quando} — ${gratis ? regrasPedido.entrega.gratisNoBairro : digitado} (${gratis ? 'entrega grátis' : 'taxa a combinar'})`);
    linhas.push(`Endereço: ${(pedido.endereco ?? '').trim()}`);
  }
  linhas.push(`Nome: ${pedido.nome.trim()}`);
  if (pedido.observacoes?.trim()) linhas.push(`Observações: ${pedido.observacoes.trim()}`);
  linhas.push('', 'Pode confirmar a disponibilidade?');
  return linhas.join('\n');
}

export const linkWhatsApp = (texto: string, numero = contato.whatsapp) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
