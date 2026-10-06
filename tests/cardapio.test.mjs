// npm test · ingredientes, alérgenos e a promessa de glúten e leite (aveia comum), com node:test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { acrescimosVisiveis, categorias, comAveia, ingredientesVisiveis, podeConterSemRepetir, levaAveia, nomeNaFrase, produtos, todasCategorias, todosProdutos } from '../src/data/cardapio.ts';
import { descricaoSite, fraseTracos, promessaCurta, promessaFrase, promessaPorMassa, textoCozinha, tudoSemGlutenNemLeite } from '../src/data/promessa.ts';
import { perguntas } from '../src/data/perguntas.ts';

const naoConfirmada = { cozinhaSemGluten: false, cozinhaSemLeite: false };

test('ingredientes: cada lista bate com os alérgenos do produto (ou da opção que leva o ingrediente)', () => {
  // "leite de castanha" (e de coco, de amêndoas) é vegetal: conta como castanha/coco, não como leite
  const marcas = { aveia: /aveia/, castanhas: /castanha|amêndoa/, coco: /coco/, amendoim: /amendoim/, ovo: /\bovos?\b/, leite: /\bleite\b(?! de (castanha|coco|amêndoa))/, gergelim: /gergelim/, soja: /soja/ };
  for (const p of todosProdutos) {
    const daOpcao = (p.opcoes ?? []).flatMap((o) => o.valores.flatMap((v) => v.contem ?? []));
    // base e partes fixas (massa e recheio das fatias, coberturas do Bento) valem para o produto inteiro
    const fixos = [...(p.ingredientes ?? []), ...(p.partes ?? []).flatMap((x) => x.ingredientes)];
    for (const [alergeno, re] of Object.entries(marcas)) {
      if (fixos.some((i) => re.test(i))) {
        assert.ok(p.alergenos.contem.includes(alergeno) || daOpcao.includes(alergeno), `${p.id}: a lista tem ${alergeno}, o "contem" não`);
      }
      // o que um sabor acrescenta precisa estar no "contem" dele (ou no do produto)
      for (const v of (p.opcoes ?? []).flatMap((o) => o.valores)) {
        if (v.ingredientes?.some((i) => re.test(i))) {
          assert.ok(p.alergenos.contem.includes(alergeno) || v.contem?.includes(alergeno), `${p.id} · ${v.nome}: acrescenta ${alergeno}, o "contem" do sabor não`);
        }
      }
    }
  }
});

test('brigadeiros: base de inhame e açúcar mascavo; cada sabor mostra o que acrescenta', () => {
  const caixa = produtos.find((p) => p.id === 'caixa-de-brigadeiros');
  assert.deepEqual(ingredientesVisiveis(caixa), ['inhame', 'açúcar mascavo']);
  assert.deepEqual(acrescimosVisiveis(caixa), [
    { nome: 'Cacau', ingredientes: ['cacau'] },
    { nome: 'Paçoca', ingredientes: ['amendoim'] },
    { nome: 'Beijinho', ingredientes: ['coco'] },
  ]);
});

test('"Pode conter" não repete o que o produto já contém (aveia comum conta como glúten)', () => {
  for (const p of todosProdutos) {
    const contem = p.alergenos.contem.flatMap((a) => (a === 'aveia' ? ['aveia', 'gluten'] : [a]));
    assert.ok(podeConterSemRepetir(p).every((a) => !contem.includes(a)), p.id);
  }
  assert.deepEqual(podeConterSemRepetir(produtos.find((p) => p.id === 'bolo-de-chocolate')), ['soja', 'leite']);
  // no Bento a aveia vem só da massa de chocolate: com a de baunilha, glúten continua como traço possível
  assert.ok(podeConterSemRepetir(produtos.find((p) => p.id === 'bento-cake')).includes('gluten'));
  assert.deepEqual(podeConterSemRepetir(produtos.find((p) => p.id === 'bolo-de-laranja')), ['soja', 'gluten', 'leite']);
});

test('ingredientes: pendência guarda a lista, mas o painel não a mostra', () => {
  for (const p of todosProdutos.filter((x) => x.ingredientesPendente)) {
    assert.ok(p.ingredientes?.length, `${p.id}: pendência sem lista guardada`);
    assert.deepEqual(ingredientesVisiveis(p), []);
  }
  assert.ok(ingredientesVisiveis(produtos.find((p) => p.id === 'pao-de-batata-doce')).includes('creme de amêndoas dissolvido em água'));
  assert.ok(ingredientesVisiveis(produtos.find((p) => p.id === 'bolo-de-chocolate')).includes('farinha de aveia'));
  assert.ok(ingredientesVisiveis(produtos.find((p) => p.id === 'pao-de-cebola')).includes('cebolinha desidratada'));
  // respostas de 06/10: nenhum produto com ingrediente pendente; todos mostram a lista
  assert.deepEqual(todosProdutos.filter((p) => p.ingredientesPendente).map((p) => p.id), []);
  assert.deepEqual(todosProdutos.filter((p) => !ingredientesVisiveis(p).length && !acrescimosVisiveis(p).length).map((p) => p.id), []);
});

test('bolos: cobertura como linha própria; o de maçã não tem cobertura nem coco', () => {
  const cob = (id) => acrescimosVisiveis(produtos.find((p) => p.id === id)).find((l) => l.nome.startsWith('Cobertura'))?.ingredientes;
  const nomeCob = (id) => acrescimosVisiveis(produtos.find((p) => p.id === id)).find((l) => l.nome.startsWith('Cobertura'))?.nome;
  // inclusa no chocolate e na cenoura; adicional pago (opcional) na laranja e no maracujá
  assert.deepEqual(['bolo-de-chocolate', 'bolo-de-cenoura', 'bolo-de-laranja', 'bolo-de-maracuja'].map(nomeCob), ['Cobertura', 'Cobertura', 'Cobertura (opcional)', 'Cobertura (opcional)']);
  assert.deepEqual(cob('bolo-de-chocolate'), ['creme de amêndoas', 'açúcar demerara', 'cacau']);
  assert.deepEqual(cob('bolo-de-cenoura'), ['creme de amêndoas', 'açúcar demerara', 'cacau']);
  assert.deepEqual(cob('bolo-de-laranja'), ['creme de amêndoas', 'açúcar demerara', 'raspas de laranja']);
  assert.deepEqual(cob('bolo-de-maracuja'), ['creme de amêndoas', 'açúcar demerara', 'polpa de maracujá']);
  const maca = produtos.find((p) => p.id === 'bolo-de-maca');
  assert.equal(cob('bolo-de-maca'), undefined);
  assert.equal(maca.adicionais, undefined);
  assert.ok(!/cobertura/i.test(maca.descricao));
  assert.deepEqual(maca.alergenos.contem, ['ovo', 'castanhas']);
});

test('coco só no brigadeiro de beijinho; nenhum leite de coco no site', () => {
  const comCoco = todosProdutos.flatMap((p) => [
    ...(p.alergenos.contem.includes('coco') ? [p.id] : []),
    ...(p.opcoes ?? []).flatMap((o) => o.valores.filter((v) => v.contem?.includes('coco')).map((v) => `${p.id}:${v.nome}`)),
  ]);
  assert.deepEqual(comCoco, ['caixa-de-brigadeiros:Beijinho']);
  const textos = [readFileSync('src/data/site.ts', 'utf8'), readFileSync('src/components/ui/CenaIngrediente.astro', 'utf8')];
  assert.ok(textos.every((t) => !/leite de coco|coqueiro|do coco/i.test(t)));
});

test('pão de grãos leva gergelim', () => {
  const p = produtos.find((x) => x.id === 'pao-de-graos');
  assert.ok(p.alergenos.contem.includes('gergelim'));
  assert.ok(p.ingredientes.includes('gergelim'));
});

test('ingredientes: nenhum adoçante (a cliente não usa xilitol nem outro)', () => {
  const todas = todosProdutos.flatMap((p) => [
    ...(p.ingredientes ?? []), ...(p.partes ?? []).flatMap((x) => x.ingredientes),
    ...(p.opcoes ?? []).flatMap((o) => o.valores.flatMap((v) => v.ingredientes ?? [])),
  ]);
  assert.ok(todas.length > 0);
  assert.ok(!todas.some((i) => /xilitol|eritritol|stévia|sucralose|adoçante/i.test(i)));
});

test('Bento: uma linha por massa, recheio e cobertura; a massa de chocolate é a do bolo (aveia comum)', () => {
  const bento = produtos.find((p) => p.id === 'bento-cake');
  const linhas = acrescimosVisiveis(bento);
  assert.deepEqual(linhas.map((l) => l.nome), [
    'Massa de baunilha', 'Massa de chocolate',
    'Recheio de maracujá', 'Recheio de creme branco com morangos', 'Recheio de chocolate', 'Recheio de limão siciliano com frutas vermelhas',
    'Cobertura de chocolate', 'Cobertura branca (merengue suíço)',
  ]);
  const bolo = todosProdutos.find((p) => p.id === 'bolo-de-chocolate');
  assert.deepEqual(linhas.find((l) => l.nome === 'Massa de chocolate').ingredientes, bolo.ingredientes);
  assert.ok(!linhas.find((l) => l.nome === 'Massa de baunilha').ingredientes.some((i) => /aveia/.test(i)));
  assert.deepEqual(bento.alergenos.contem, ['ovo', 'castanhas']);
  assert.equal(promessaPorMassa(bento), 'sem leite e sem glúten na massa de baunilha (a de chocolate leva aveia comum)');
  // sem aveia em massa nenhuma, volta a "sem glúten e sem leite"
  const semAveia = { ...bento, opcoes: bento.opcoes.map((o) => ({ ...o, valores: o.valores.map(({ contem, ...v }) => v) })) };
  assert.equal(promessaPorMassa(semAveia), 'sem glúten e sem leite');
});

test('fatias: massa de baunilha, menos a Matilda (massa do bolo de chocolate, aveia comum)', () => {
  const fatias = todosProdutos.filter((p) => p.categoria === 'fatias');
  const bolo = todosProdutos.find((p) => p.id === 'bolo-de-chocolate');
  const baunilha = produtos.find((p) => p.id === 'bento-cake').opcoes[0].valores[0].ingredientes;
  for (const f of fatias) {
    const massa = acrescimosVisiveis(f).find((l) => l.nome === 'Massa')?.ingredientes;
    assert.deepEqual(massa, f.id === 'fatia-chocolate-matilda' ? bolo.ingredientes : baunilha, f.id);
    assert.equal(!!levaAveia(f), f.id === 'fatia-chocolate-matilda', f.id);
  }
});

test('pão de grãos: sem castanha na receita, castanhas só como traço', () => {
  const p = produtos.find((x) => x.id === 'pao-de-graos');
  assert.ok(!p.alergenos.contem.includes('castanhas'));
  assert.ok(p.alergenos.podeConter.includes('castanhas'));
});

test('aveia: bolo de chocolate, fatia Matilda e a massa de chocolate do Bento', () => {
  assert.equal(levaAveia(todosProdutos.find((p) => p.id === 'bolo-de-chocolate')), true);
  assert.equal(levaAveia(todosProdutos.find((p) => p.id === 'fatia-chocolate-matilda')), true);
  assert.equal(levaAveia(todosProdutos.find((p) => p.id === 'bento-cake')), 'opcao');
  assert.deepEqual(comAveia(), ['bolo de chocolate', 'Bento Cake com massa de chocolate']);
  assert.equal(nomeNaFrase('Chocolate Matilda'), 'Chocolate Matilda');
});

test('promessa: com aveia, "sem glúten, exceto …"; sem aveia, tudo volta a "sem glúten e sem leite"', () => {
  assert.equal(promessaFrase([]), 'sem glúten e sem leite');
  assert.deepEqual(promessaCurta([]), ['sem glúten', 'sem leite']);
  assert.equal(descricaoSite([]), 'Bolos, pães e doces sem glúten e sem leite, feitos à mão em Marabá.');
  assert.match(fraseTracos(naoConfirmada, []), /^Receitas sem glúten e sem leite\. /);
  assert.match(textoCozinha(naoConfirmada, []), /^Nossas receitas não levam glúten nem leite, mas/);
  assert.ok(tudoSemGlutenNemLeite({ cozinhaSemGluten: true, cozinhaSemLeite: true }, []));

  assert.equal(promessaFrase(), 'sem leite e sem glúten, exceto bolo de chocolate e Bento Cake com massa de chocolate (aveia comum)');
  assert.deepEqual(promessaCurta(), ['sem leite', 'sem trigo']);
  assert.equal(descricaoSite(), 'Bolos, pães e doces sem leite e sem trigo, feitos à mão em Marabá.');
  assert.match(fraseTracos(naoConfirmada), /exceto bolo de chocolate/);
  assert.match(textoCozinha(naoConfirmada), /exceto bolo de chocolate.*celíaca/);
  // cozinha "confirmada sem glúten" não vale com aveia comum no cardápio: nada de "Sim." nem "não entram glúten"
  assert.equal(tudoSemGlutenNemLeite({ cozinhaSemGluten: true, cozinhaSemLeite: true }), false);
  assert.match(textoCozinha({ cozinhaSemGluten: true, cozinhaSemLeite: true }), /manipula glúten/);
  assert.ok(!/^Sim\./.test(perguntas.find((p) => p.id === 'sem-gluten-leite').resposta[0]));
});

test('categorias: a chamada não promete "sem glúten" quando algum produto dela leva aveia', () => {
  for (const c of todasCategorias) {
    if (todosProdutos.some((p) => p.categoria === c.id && levaAveia(p))) assert.ok(!/sem glúten/i.test(c.chamada), c.id);
  }
  assert.ok(categorias.length > 0);
});

test('componentes e páginas não escrevem "sem glúten" à mão: a promessa sai de src/data/promessa.ts', () => {
  const arquivos = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? arquivos(join(dir, d.name)) : d.name.endsWith('.astro') ? [join(dir, d.name)] : []));
  for (const f of [...arquivos('src/components'), ...arquivos('src/pages'), ...arquivos('src/layouts')]) {
    assert.ok(!/sem glúten/i.test(readFileSync(f, 'utf8')), `${f} escreve "sem glúten" à mão`);
  }
});
