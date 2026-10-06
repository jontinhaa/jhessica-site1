// npm test · ingredientes, alérgenos e a promessa de glúten e leite (aveia comum), com node:test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { acrescimosVisiveis, categorias, comAveia, ingredientesVisiveis, levaAveia, nomeNaFrase, produtos, todasCategorias, todosProdutos } from '../src/data/cardapio.ts';
import { descricaoSite, fraseTracos, promessaCurta, promessaFrase, textoCozinha, tudoSemGlutenNemLeite } from '../src/data/promessa.ts';
import { perguntas } from '../src/data/perguntas.ts';

const naoConfirmada = { cozinhaSemGluten: false, cozinhaSemLeite: false };

test('ingredientes: cada lista bate com os alérgenos do produto (ou da opção que leva o ingrediente)', () => {
  const marcas = { aveia: /aveia/, castanhas: /castanha|amêndoa/, coco: /coco/, amendoim: /amendoim/, ovo: /\bovos?\b/, leite: /\bleite\b/, soja: /soja/ };
  for (const p of todosProdutos.filter((x) => x.ingredientes?.length)) {
    const daOpcao = (p.opcoes ?? []).flatMap((o) => o.valores.flatMap((v) => v.contem ?? []));
    for (const [alergeno, re] of Object.entries(marcas)) {
      if (p.ingredientes.some((i) => re.test(i))) {
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

test('ingredientes: pendência guarda a lista, mas o painel não a mostra', () => {
  for (const p of todosProdutos.filter((x) => x.ingredientesPendente)) {
    assert.ok(p.ingredientes?.length, `${p.id}: pendência sem lista guardada`);
    assert.deepEqual(ingredientesVisiveis(p), []);
  }
  assert.deepEqual(ingredientesVisiveis(produtos.find((p) => p.id === 'pao-de-batata-doce')), []);
  assert.ok(ingredientesVisiveis(produtos.find((p) => p.id === 'bolo-de-chocolate')).includes('farinha de aveia'));
  for (const id of ['pao-de-cebola', 'bento-cake']) assert.deepEqual(ingredientesVisiveis(produtos.find((p) => p.id === id)), []);
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
  // BentoCake decide pelo levaAveia do próprio produto
  const permitidos = new Set(['BentoCake.astro']);
  const arquivos = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? arquivos(join(dir, d.name)) : d.name.endsWith('.astro') ? [join(dir, d.name)] : []));
  for (const f of [...arquivos('src/components'), ...arquivos('src/pages'), ...arquivos('src/layouts')]) {
    if (permitidos.has(f.split(/[\\/]/).pop())) continue;
    assert.ok(!/sem glúten/i.test(readFileSync(f, 'utf8')), `${f} escreve "sem glúten" à mão`);
  }
});
