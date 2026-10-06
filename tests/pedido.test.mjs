// npm test · lógica do pedido (src/lib/pedido), com node:test e a remoção de tipos do Node (≥ 23.6).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { levaAveia, produtos } from '../src/data/cardapio.ts';
import { juntar, chaveItem } from '../src/lib/pedido/itens.ts';
import { subtotal, precoItem } from '../src/lib/pedido/precos.ts';
import { prazoDoPedido, inicioDaContagem, datasValidas, diaCurto } from '../src/lib/pedido/prazos.ts';
import { urlAbsoluta } from '../src/lib/absoluta.ts';
import { linkProduto, textoCompartilhar } from '../src/lib/pedido/compartilhar.ts';
import { perguntas, perguntasPendentes, respostaPrazos, respostaEntrega, respostaAlergenos } from '../src/data/perguntas.ts';
import { regrasPedido, diasDeEntrega } from '../src/data/site.ts';
import { fraseTracos } from '../src/data/promessa.ts';
import { montarMensagem, linhaItem, linkWhatsApp, numeroPedido, entregaGratis } from '../src/lib/pedido/mensagem.ts';

const item = (id, variante, extra = {}) => ({ id, variante, adicionais: [], opcoes: {}, semOvo: false, sabores: {}, quantidade: 1, ...extra });
const bolo = item('bolo-de-laranja', '500g'); // cobertura opcional (+R$ 10)
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
  const novo = produtos.map((p) => (p.id === 'bolo-de-laranja' ? { ...p, variantes: [{ ...p.variantes[0], preco: 45 }] } : p));
  assert.equal(precoItem(itens[0], novo), 55);
  assert.equal(subtotal(itens, novo), 55 + 80);
});

// exemplo da mensagem: bolo de maracujá com a cobertura de geleia (adicional de verdade do cardápio)
const cardapioExemplo = produtos;
const itensExemplo = [item('bolo-de-maracuja', '500g', { adicionais: ['cobertura-geleia'] }), caixa6(), pao];
const pedidoBase = { numero: '0310-7KM', itens: itensExemplo, data: new Date(2025, 9, 3), nome: 'Marina' };

test('mensagem da retirada idêntica ao formato combinado', () => {
  assert.equal(montarMensagem({ ...pedidoBase, modalidade: 'retirada' }, cardapioExemplo), [
    'Olá, Jhessica! Quero fazer um pedido pelo site.',
    '',
    'Pedido nº 0310-7KM',
    '',
    '• 1x Bolo de maracujá (500 g) com cobertura de geleia — R$ 50,00',
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

// etiquetas e opções decididas só pelos campos de cada produto em cardapio.ts: a lista exata, para nada entrar por engano
const comCampo = (campo) => produtos.filter((p) => p[campo] === true).map((p) => p.id).sort();
test('"Mais pedido" só no bolo de chocolate e no pão de batata-doce', () => {
  assert.deepEqual(comCampo('maisPedido'), ['bolo-de-chocolate', 'pao-de-batata-doce']);
});
test('"Quero sem ovos" só no bolo de chocolate e nos três pães', () => {
  assert.deepEqual(comCampo('permiteSemOvo'), ['bolo-de-chocolate', 'pao-de-batata-doce', 'pao-de-cebola', 'pao-de-graos']);
});

test('versão sem ovos: mesmo preço e mesmo prazo, itens separados e a mensagem diz qual versão', () => {
  const com = item('bolo-de-chocolate', '500g'), sem = { ...com, semOvo: true };
  assert.equal(precoItem(com, produtos), precoItem(sem, produtos));
  assert.deepEqual(prazoDoPedido([com], produtos), prazoDoPedido([sem], produtos));
  assert.notEqual(chaveItem(com), chaveItem(sem));
  assert.equal(linhaItem(com, produtos), '• 1x Bolo de chocolate (500 g), com ovos — R$ 45,00');
  assert.equal(linhaItem(sem, produtos), '• 1x Bolo de chocolate (500 g), sem ovos — R$ 45,00');
  assert.ok(!/ovos/.test(linhaItem(bolo, produtos)), 'produto sem a opção não cita ovos');
});

test('páginas /p/{id}: um id único e seguro para URL por produto disponível', () => {
  const ids = produtos.filter((p) => p.disponivel).map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every((id) => /^[a-z0-9-]+$/.test(id)));
});

test('urlAbsoluta: junta com o site; sem site, devolve o caminho', () => {
  assert.equal(urlAbsoluta('/jhessica-site1/_astro/a.jpg', new URL('https://jontinhaa.github.io')), 'https://jontinhaa.github.io/jhessica-site1/_astro/a.jpg');
  assert.equal(urlAbsoluta('/_astro/a.jpg'), '/_astro/a.jpg');
});

test('linkProduto: site e base com ou sem barra final dão o mesmo link', () => {
  const esperado = 'https://jontinhaa.github.io/jhessica-site1/p/bolo-de-maca/';
  assert.equal(linkProduto('bolo-de-maca', 'https://jontinhaa.github.io', '/jhessica-site1'), esperado);
  assert.equal(linkProduto('bolo-de-maca', 'https://jontinhaa.github.io/', '/jhessica-site1/'), esperado);
  assert.equal(linkProduto('bolo-de-maca', new URL('https://jontinhaa.github.io'), 'jhessica-site1'), esperado);
});

test('linkProduto: sem base (domínio próprio)', () => {
  assert.equal(linkProduto('bento-cake', 'https://exemplo.com.br/', ''), 'https://exemplo.com.br/p/bento-cake/');
  assert.equal(linkProduto('bento-cake', 'https://exemplo.com.br', '/'), 'https://exemplo.com.br/p/bento-cake/');
});

test('textoCompartilhar: nome, preço "a partir de" e a receita só quando o cardápio confirma', () => {
  for (const p of produtos.filter((x) => x.disponivel)) {
    const { titulo, texto } = textoCompartilhar(p);
    assert.equal(titulo, p.nome);
    assert.ok(texto.startsWith(p.nome));
    assert.equal(/sem glúten e sem leite/.test(texto), !p.alergenos.contem.some((a) => a === 'gluten' || a === 'aveia' || a === 'leite') && !levaAveia(p));
    if (levaAveia(p)) assert.ok(!/sem glúten/.test(texto), `${p.id} leva aveia e não pode dizer "sem glúten"`);
    assert.ok(!/seguro para celíac/i.test(texto));
  }
  assert.match(textoCompartilhar(produtos.find((p) => p.id === 'bolo-de-chocolate')).texto, /sem leite na receita · leva aveia comum, não indicado para celíacos/);
  assert.match(textoCompartilhar(produtos.find((p) => p.id === 'bento-cake')).texto, /sem leite na receita · com massa de chocolate, leva aveia comum, não indicado para celíacos/);
  const caixa = produtos.find((p) => p.id === 'caixa-de-brigadeiros');
  assert.match(textoCompartilhar(caixa).texto, /a partir de R\$/);
});

test('perguntas: as respostas saem dos dados e a pergunta com pendência fica oculta', () => {
  const todas = perguntas.map((p) => p.resposta.join(' ')).join(' ');
  assert.ok(perguntas.every((p) => !p.pendente && p.resposta.length > 0));
  assert.equal(perguntasPendentes.length, 0);
  assert.match(perguntas.find((p) => p.id === 'bento-nome-idade').resposta.join(' '), /sem escrita/);
  assert.match(perguntas.find((p) => p.id === 'sem-ovos').resposta.join(' '), new RegExp(`mesmo prazo.*${regrasPedido.prazoMinimoDias} dias`));
  assert.match(perguntas.find((p) => p.id === 'alergenos').resposta.join(' '), /base de inhame e não leva castanha nem amêndoa/);
  assert.match(respostaPrazos().join(' '), new RegExp(`${regrasPedido.prazoMinimoDias} dias`));
  assert.match(respostaPrazos().join(' '), new RegExp(`${regrasPedido.limiteBrigadeirosUnidades} unidades pedem ${regrasPedido.prazoEspecialDias} dias`));
  assert.match(respostaEntrega().join(' '), /domingos/);
  assert.match(respostaEntrega().join(' '), new RegExp(regrasPedido.entrega.gratisNoBairro));
  assert.match(todas, /celíaca/, 'a resposta de glúten e leite traz o aviso de traços');
  assert.ok(!/seguro para celíac/i.test(todas));
});

test('perguntas: alérgenos pelos dados do cardápio (coco no beijinho, amendoim na paçoca, brigadeiro sem ovo)', () => {
  const r = respostaAlergenos().join(' ');
  assert.match(r, /Brigadeiros não levam ovo/);
  assert.match(r, /amendoim \(brigadeiro de paçoca\)/);
  // nenhum produto leva leite de coco: o coco fica só no beijinho; o gergelim, só no pão de grãos
  assert.match(r, /coco \(brigadeiro de beijinho\)/);
  assert.match(r, /gergelim \(pão artesanal de grãos\)/i);
  assert.match(r, /traços de glúten, leite e soja/);
  assert.match(r, /Bolo de chocolate e Bento Cake com massa de chocolate levam glúten \(aveia comum\): não indicados para celíacos/);
  assert.match(r, /Pães artesanais levam ovo\./, 'o pão de grãos não leva castanhas: elas saem do comum dos pães');
});

test('rodapé: a frase de traços só aparece com a cozinha confirmada como não livre; entrega por extenso dos dados', () => {
  assert.match(fraseTracos({ cozinhaSemGluten: false, cozinhaSemLeite: false }), /não é livre de traços.*celíaca/);
  assert.equal(fraseTracos({ cozinhaSemGluten: true, cozinhaSemLeite: false }), null);
  assert.equal(fraseTracos({ cozinhaSemGluten: null, cozinhaSemLeite: null }), null);
  assert.equal(diasDeEntrega(), 'domingos');
});
