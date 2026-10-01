// npm test · lógica do pedido (src/lib/pedido), com node:test e a remoção de tipos do Node (≥ 23.6).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { produtos } from '../src/data/cardapio.ts';
import { juntar, chaveItem } from '../src/lib/pedido/itens.ts';
import { subtotal, precoItem } from '../src/lib/pedido/precos.ts';
import { prazoDoPedido, inicioDaContagem, datasValidas, diaCurto } from '../src/lib/pedido/prazos.ts';
import { montarMensagem, linkWhatsApp, numeroPedido, entregaGratis } from '../src/lib/pedido/mensagem.ts';

const item = (id, variante, extra = {}) => ({ id, variante, adicionais: [], opcoes: {}, semOvo: false, sabores: {}, quantidade: 1, ...extra });
const bolo = item('bolo-de-maca', '500g');
const pao = item('pao-de-batata-doce', '800g', { semOvo: true, quantidade: 2 });
const caixa6 = (sabores = { Cacau: 2, 'Paçoca': 2, Beijinho: 2 }, quantidade = 1) => item('caixa-de-brigadeiros', 'caixa-6', { sabores, quantidade });
const caixa12 = item('caixa-de-brigadeiros', 'caixa-12', { sabores: { Cacau: 12 } });
const bento = item('bento-cake', 'unico', { opcoes: { massa: 'Chocolate', recheio: 'Maracujá' } });
// datas de 2026 (a sexta é 02/10)
const qua10h = new Date(2026, 8, 30, 10), qui10h = new Date(2026, 9, 1, 10), sex10h = new Date(2026, 9, 2, 10), sex20h = new Date(2026, 9, 2, 20);
const primeira = (modalidade, itens, agora) => diaCurto(datasValidas(modalidade, itens, agora, { produtos })[0]);

test('pedido comum na quarta 10h: primeira retirada na sexta', () => assert.equal(primeira('retirada', [bolo], qua10h), 'sex 02/10'));
test('quinta 10h: sábado e domingo pulados, primeira retirada na segunda', () => assert.equal(primeira('retirada', [bolo], qui10h), 'seg 05/10'));
test('sexta 10h com entrega: domingo seguinte (2 dias)', () => assert.equal(primeira('entrega', [bolo], sex10h), 'dom 04/10'));
test('sexta 20h com entrega: depois do corte, domingo da semana seguinte', () => {
  assert.equal(diaCurto(inicioDaContagem(sex20h)), 'seg 05/10');
  assert.equal(primeira('entrega', [bolo], sex20h), 'dom 11/10');
});
test('fim de semana conta do próximo dia útil', () => assert.equal(diaCurto(inicioDaContagem(new Date(2026, 9, 3, 9))), 'seg 05/10'));
test('Bento: 7 dias', () => {
  assert.deepEqual(prazoDoPedido([bolo, bento], produtos), { dias: 7, motivo: 'bento' });
  assert.equal(primeira('retirada', [bento], qua10h), 'qua 07/10');
});
test('2 caixas de 6 brigadeiros (12 un.): 2 dias', () => assert.deepEqual(prazoDoPedido([caixa6(undefined, 2)], produtos), { dias: 2, motivo: null }));
test('caixa de 12 + caixa de 6 (18 un.): 7 dias', () => assert.deepEqual(prazoDoPedido([caixa12, caixa6()], produtos), { dias: 7, motivo: 'brigadeiros' }));
test('só dias permitidos: retirada seg–sex, entrega domingo', () => {
  assert.ok(datasValidas('retirada', [bolo], qua10h, { produtos, quantidade: 12 }).every((d) => d.getDay() >= 1 && d.getDay() <= 5));
  assert.ok(datasValidas('entrega', [bolo], qua10h, { produtos, quantidade: 12 }).every((d) => d.getDay() === 0));
});

test('mesma escolha soma quantidade; escolha diferente vira outro item', () => {
  let itens = juntar([], bolo);
  itens = juntar(itens, { ...bolo, quantidade: 2 });
  assert.equal(itens.length, 1);
  assert.equal(itens[0].quantidade, 3);
  itens = juntar(itens, { ...bolo, adicionais: ['cobertura'] });
  assert.equal(itens.length, 2);
  assert.equal(chaveItem(caixa6({ Cacau: 2, Beijinho: 2, 'Paçoca': 2 })), chaveItem(caixa6()), 'ordem dos sabores não importa');
});

test('preço recalculado quando o cardápio muda', () => {
  const itens = [{ ...bolo, adicionais: ['cobertura'] }, pao];
  assert.equal(subtotal(itens, produtos), 50 + 80);
  const novo = produtos.map((p) => (p.id === 'bolo-de-maca' ? { ...p, variantes: [{ ...p.variantes[0], preco: 45 }] } : p));
  assert.equal(precoItem(itens[0], novo), 55);
  assert.equal(subtotal(itens, novo), 55 + 80);
});

// cardápio do exemplo: o adicional do bolo de maçã com o rótulo "Cobertura de geleia"
const cardapioExemplo = produtos.map((p) => (p.id === 'bolo-de-maca' ? { ...p, adicionais: [{ id: 'cobertura', rotulo: 'Cobertura de geleia', preco: 10 }] } : p));
const itensExemplo = [{ ...bolo, adicionais: ['cobertura'] }, caixa6(), pao];
const pedidoBase = { numero: '0310-7KM', itens: itensExemplo, data: new Date(2025, 9, 3), nome: 'Marina' };

test('mensagem da retirada idêntica ao formato combinado', () => {
  assert.equal(montarMensagem({ ...pedidoBase, modalidade: 'retirada' }, cardapioExemplo), [
    'Olá, Jhessica! Quero fazer um pedido pelo site.',
    '',
    'Pedido nº 0310-7KM',
    '',
    '• 1x Bolo de maçã (500 g) com cobertura de geleia — R$ 50,00',
    '• 1x Caixa de brigadeiros (6 un.): 2 cacau, 2 paçoca, 2 beijinho — R$ 30,00',
    '• 2x Pão de batata-doce (800 g), sem ovos — R$ 80,00',
    '',
    'Subtotal: R$ 160,00',
    'Retirada: sexta, 03/10 — horário a combinar',
    'Nome: Marina',
    '',
    'Pode confirmar a disponibilidade?',
  ].join('\n'));
});

test('mensagem da entrega: bairro grátis, endereço e observações', () => {
  const msg = montarMensagem({ ...pedidoBase, modalidade: 'entrega', data: new Date(2025, 9, 5), bairro: ' cidade  JARDIM ', endereco: 'Rua X, 10', observacoes: 'Sem granulado' }, cardapioExemplo);
  assert.match(msg, /\nSubtotal: R\$ 160,00\nEntrega: domingo, 05\/10 — Cidade Jardim \(entrega grátis\)\nEndereço: Rua X, 10\nNome: Marina\nObservações: Sem granulado\n\nPode confirmar/);
  assert.match(montarMensagem({ ...pedidoBase, modalidade: 'entrega', bairro: 'Nova Marabá', endereco: 'Rua Y' }, cardapioExemplo), /— Nova Marabá \(taxa a combinar\)/);
  assert.ok(entregaGratis('Cidade Jardim') && entregaGratis('cidade jardím') && !entregaGratis('Jardim'));
});

test('número do pedido e link do WhatsApp', () => {
  assert.equal(numeroPedido(new Date(2025, 9, 3), () => 0), '0310-222');
  assert.match(numeroPedido(new Date()), /^\d{4}-[2-9A-HJ-NP-Z]{3}$/);
  assert.equal(linkWhatsApp('Olá, Jhessica!\nPedido'), 'https://wa.me/5594981080336?text=Ol%C3%A1%2C%20Jhessica!%0APedido');
});
