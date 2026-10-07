// npm test · ingredientes, alérgenos e a promessa de glúten e leite (aveia comum), com node:test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { acrescimosVisiveis, categorias, chamadaBento, comAveia, ingredientesVisiveis, podeConterSemRepetir, levaAveia, nomeNaFrase, ondeTemAveia, opcoesComAveia, produtos, todasCategorias, todosProdutos } from '../src/data/cardapio.ts';
import { descricaoSite, fraseAveiaDeclarada, fraseTracos, leadCardapio, promessaCurta, promessaFrase, promessaPorMassa, textoCozinha, tudoSemGlutenNemLeite } from '../src/data/promessa.ts';
import { compromisso, porqueAveia, rotulosDosAlergenos } from '../src/data/site.ts';
import { perguntas } from '../src/data/perguntas.ts';

const naoConfirmada = { cozinhaSemGluten: false, cozinhaSemLeite: false };
// os dois estados do interruptor aveiaSemGluten (site.ts); o padrão das funções é o valor do site
const LIGADO = true, DESLIGADO = false;

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

test('"Pode conter" não repete o que o produto já contém (aveia comum conta como glúten só com o interruptor desligado)', () => {
  for (const p of todosProdutos) {
    const contem = p.alergenos.contem.flatMap((a) => (a === 'aveia' ? ['aveia', 'gluten'] : [a]));
    assert.ok(podeConterSemRepetir(p, DESLIGADO).every((a) => !contem.includes(a)), p.id);
    assert.ok(podeConterSemRepetir(p, LIGADO).every((a) => !p.alergenos.contem.includes(a)), p.id);
  }
  const chocolate = produtos.find((p) => p.id === 'bolo-de-chocolate');
  assert.deepEqual(podeConterSemRepetir(chocolate, DESLIGADO), ['soja', 'leite']);
  // aveia declarada sem glúten: o traço de glúten da cozinha volta a aparecer no bolo de chocolate
  assert.deepEqual(podeConterSemRepetir(chocolate, LIGADO), ['soja', 'gluten', 'leite']);
  // no Bento a aveia vem só da massa de chocolate: com a de baunilha, glúten continua como traço possível
  assert.ok(podeConterSemRepetir(produtos.find((p) => p.id === 'bento-cake'), DESLIGADO).includes('gluten'));
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
  assert.equal(promessaPorMassa(bento, DESLIGADO), 'sem leite e sem glúten na massa de baunilha (a de chocolate leva aveia comum)');
  assert.equal(promessaPorMassa(bento, LIGADO), 'sem glúten e sem leite');
  // sem aveia em massa nenhuma, volta a "sem glúten e sem leite"
  const semAveia = { ...bento, opcoes: bento.opcoes.map((o) => ({ ...o, valores: o.valores.map(({ contem, ...v }) => v) })) };
  assert.equal(promessaPorMassa(semAveia, DESLIGADO), 'sem glúten e sem leite');
});

test('fatias: massa de baunilha, menos a Matilda (massa do bolo de chocolate, aveia comum)', () => {
  const fatias = todosProdutos.filter((p) => p.categoria === 'fatias');
  const bolo = todosProdutos.find((p) => p.id === 'bolo-de-chocolate');
  const baunilha = produtos.find((p) => p.id === 'bento-cake').opcoes[0].valores[0].ingredientes;
  for (const f of fatias) {
    const massa = acrescimosVisiveis(f).find((l) => l.nome === 'Massa')?.ingredientes;
    assert.deepEqual(massa, f.id === 'fatia-chocolate-matilda' ? bolo.ingredientes : baunilha, f.id);
    assert.equal(!!levaAveia(f, DESLIGADO), f.id === 'fatia-chocolate-matilda', f.id);
    assert.equal(f.alergenos.contem.includes('aveia'), f.id === 'fatia-chocolate-matilda', f.id);
  }
});

test('pão de grãos: sem castanha na receita, castanhas só como traço', () => {
  const p = produtos.find((x) => x.id === 'pao-de-graos');
  assert.ok(!p.alergenos.contem.includes('castanhas'));
  assert.ok(p.alergenos.podeConter.includes('castanhas'));
});

test('aveia: bolo de chocolate, fatia Matilda e a massa de chocolate do Bento (sempre no "Contém")', () => {
  const chocolate = todosProdutos.find((p) => p.id === 'bolo-de-chocolate');
  const matilda = todosProdutos.find((p) => p.id === 'fatia-chocolate-matilda');
  const bento = todosProdutos.find((p) => p.id === 'bento-cake');
  // a aveia continua declarada como alérgeno nos dois estados
  assert.ok(chocolate.alergenos.contem.includes('aveia') && matilda.alergenos.contem.includes('aveia'));
  assert.ok(bento.opcoes[0].valores.find((v) => v.nome === 'Chocolate').contem.includes('aveia'));
  assert.deepEqual(ondeTemAveia(), ['o bolo de chocolate', 'a massa de chocolate do Bento Cake']);
  // com as fatias de volta (cardápio completo), a Matilda entra com o artigo certo
  assert.deepEqual(ondeTemAveia(todosProdutos), ['o bolo de chocolate', 'a fatia Chocolate Matilda', 'a massa de chocolate do Bento Cake']);
  assert.match(fraseAveiaDeclarada(todosProdutos, LIGADO), /^O bolo de chocolate, a fatia Chocolate Matilda e a massa de chocolate do Bento Cake levam farinha de aveia/);
  // desligado: aveia comum, conta como glúten (etiqueta, aviso e exceções)
  assert.equal(levaAveia(chocolate, DESLIGADO), true);
  assert.equal(levaAveia(matilda, DESLIGADO), true);
  assert.equal(levaAveia(bento, DESLIGADO), 'opcao');
  assert.deepEqual(comAveia(produtos, DESLIGADO), ['bolo de chocolate', 'Bento Cake com massa de chocolate']);
  assert.equal(rotulosDosAlergenos(DESLIGADO).aveia, 'Glúten (aveia comum)');
  // ligado: declarada sem glúten pelo fabricante; some etiqueta, aviso para celíacos e exceções
  for (const p of [chocolate, matilda, bento]) assert.equal(levaAveia(p, LIGADO), false, p.id);
  assert.deepEqual(comAveia(produtos, LIGADO), []);
  assert.deepEqual(opcoesComAveia(bento, LIGADO), []);
  assert.equal(rotulosDosAlergenos(LIGADO).aveia, 'Aveia');
  assert.equal(nomeNaFrase('Chocolate Matilda'), 'Chocolate Matilda');
});

test('interruptor aveiaSemGluten: ligado no site (declaração do fabricante na embalagem, sem selo)', () => {
  assert.equal(compromisso.aveiaSemGluten, true);
  assert.equal(levaAveia(produtos.find((p) => p.id === 'bolo-de-chocolate')), false, 'o padrão segue o interruptor');
  assert.match(porqueAveia(LIGADO), /Declarada sem glúten pelo fabricante, sem selo de certificação\.$/);
  assert.match(porqueAveia(DESLIGADO), /É aveia comum, não certificada\.$/);
  assert.equal(compromisso.ingredientesQueEntram.find((i) => i.rabisco === 'aveia').porque, porqueAveia());
});

test('abertura do cardápio (home e /pedido): sem lista de exceções; "sem glúten" só com a aveia declarada', () => {
  const fim = ', feitas em pequenas fornadas. Os ingredientes de cada produto estão no cardápio.';
  assert.equal(leadCardapio(comAveia(produtos, DESLIGADO)), `Receitas sem leite e sem trigo${fim}`);
  assert.equal(leadCardapio(comAveia(produtos, LIGADO)), `Receitas sem glúten e sem leite${fim}`);
  assert.ok(!/exceto/i.test(leadCardapio(comAveia(produtos, DESLIGADO))));
  for (const f of ['src/components/sections/Cardapio.astro', 'src/pages/pedido.astro']) {
    const fonte = readFileSync(f, 'utf8');
    assert.match(fonte, /\{leadCardapio\(\)\}/, f);
    assert.ok(!/promessaFrase\(/.test(fonte), `${f} voltou a usar a frase com exceções`);
  }
  // os avisos de aveia por produto seguem o interruptor (levaAveia): etiqueta no card e aviso no painel
  assert.match(readFileSync('src/components/pedido/ProdutoCard.astro', 'utf8'), /aveia && <span class="tag tag--alerta">/);
  assert.match(readFileSync('src/components/pedido/ProdutoPainel.astro', 'utf8'), /aveia comum: não indicado para celíacos/);
});

test('promessa: interruptor desligado, "sem glúten, exceto …"; ligado ou sem aveia, tudo volta a "sem glúten e sem leite"', () => {
  for (const nomes of [[], comAveia(produtos, LIGADO)]) {
    assert.equal(promessaFrase(nomes), 'sem glúten e sem leite');
    assert.deepEqual(promessaCurta(nomes), ['sem glúten', 'sem leite']);
    assert.equal(descricaoSite(nomes), 'Bolos, pães e doces sem glúten e sem leite, feitos à mão em Marabá.');
    assert.match(fraseTracos(naoConfirmada, nomes), /^Receitas sem glúten e sem leite\. Produzidas em cozinha que não é livre de traços\./);
    assert.match(textoCozinha(naoConfirmada, nomes), /^Nossas receitas não levam glúten nem leite, mas são feitas numa cozinha que também manipula esses ingredientes\. Por isso, podem conter traços\./);
    assert.equal(textoCozinha(naoConfirmada, nomes, { semExcecoes: true }), textoCozinha(naoConfirmada, nomes));
  }
  assert.ok(tudoSemGlutenNemLeite({ cozinhaSemGluten: true, cozinhaSemLeite: true }, []));

  const off = comAveia(produtos, DESLIGADO);
  assert.equal(promessaFrase(off), 'sem leite e sem glúten, exceto bolo de chocolate e Bento Cake com massa de chocolate (aveia comum)');
  assert.deepEqual(promessaCurta(off), ['sem leite', 'sem trigo']);
  assert.equal(descricaoSite(off), 'Bolos, pães e doces sem leite e sem trigo, feitos à mão em Marabá.');
  assert.equal(fraseTracos(naoConfirmada, off).split('. ')[0], 'Receitas sem leite e sem trigo', 'rodapé sem a lista de exceções (pedido da cliente em 07/10)');
  assert.equal(textoCozinha(naoConfirmada, off, { semExcecoes: true }).split(', mas')[0] + ', mas', 'Nossas receitas são sem leite e sem trigo, mas');
  assert.match(textoCozinha(naoConfirmada, off, { semExcecoes: true }), /manipula glúten e leite\. Por isso, podem conter traços/);
  assert.match(textoCozinha(naoConfirmada, off), /exceto bolo de chocolate.*celíaca/);
  // cozinha "confirmada sem glúten" não vale com aveia comum no cardápio: nada de "Sim." nem "não entram glúten"
  assert.equal(tudoSemGlutenNemLeite({ cozinhaSemGluten: true, cozinhaSemLeite: true }, off), false);
  assert.match(textoCozinha({ cozinhaSemGluten: true, cozinhaSemLeite: true }, off), /manipula glúten/);
});

test('FAQ "É tudo sem glúten…": traços da cozinha iguais; com o interruptor ligado, a linha da aveia declarada', () => {
  const r = perguntas.find((p) => p.id === 'sem-gluten-leite').resposta;
  assert.ok(!/^Sim\./.test(r[0]), 'a cozinha manipula glúten e leite: nada de "Sim."');
  assert.match(r[0], /podem conter traços\. Se você tem doença celíaca ou alergia grave, fale com a gente antes de pedir\.$/);
  const linha = 'O bolo de chocolate e a massa de chocolate do Bento Cake levam farinha de aveia declarada sem glúten pelo fabricante. Alguns celíacos também não toleram a aveia; na dúvida, fale com a gente antes de pedir.';
  assert.equal(fraseAveiaDeclarada(produtos, LIGADO), linha);
  assert.equal(r[1], linha);
  assert.equal(fraseAveiaDeclarada(produtos, DESLIGADO), null);
  assert.ok(!/seguro para celíac/i.test(r.join(' ')));
});

test('categorias: a chamada não promete "sem glúten" quando algum produto dela leva aveia comum', () => {
  // estado desligado: a aveia conta como glúten; a chamada do Bento sai de chamadaBento(false)
  const chamada = (c, semGluten) => (c.id === 'bento' ? chamadaBento(semGluten) : c.chamada);
  for (const c of todasCategorias) {
    if (todosProdutos.some((p) => p.categoria === c.id && levaAveia(p, DESLIGADO))) assert.ok(!/sem glúten/i.test(chamada(c, DESLIGADO)), c.id);
  }
  assert.equal(chamadaBento(DESLIGADO), 'O bolo de aniversário sem leite, para a festa inteira dividir.');
  // ligado: a chamada do Bento volta a "sem glúten e sem leite" (e é a que o site usa hoje)
  assert.equal(chamadaBento(LIGADO), 'O bolo de aniversário sem glúten e sem leite, para a festa inteira dividir.');
  assert.equal(todasCategorias.find((c) => c.id === 'bento').chamada, chamadaBento());
  assert.ok(categorias.length > 0);
});

test('componentes e páginas não escrevem "sem glúten" à mão: a promessa sai de src/data/promessa.ts', () => {
  const arquivos = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? arquivos(join(dir, d.name)) : d.name.endsWith('.astro') ? [join(dir, d.name)] : []));
  for (const f of [...arquivos('src/components'), ...arquivos('src/pages'), ...arquivos('src/layouts')]) {
    assert.ok(!/sem glúten/i.test(readFileSync(f, 'utf8')), `${f} escreve "sem glúten" à mão`);
  }
});
