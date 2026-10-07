// Fonte única dos produtos. A seção Cardápio da home, a página /pedido e o futuro carrinho leem daqui.
// Preços em reais (número); null = ainda sem preço: o produto aparece como "Em breve" e fica fora do "a partir de".
// `imagem` ainda é caminho reservado; as fotos por produto seguem a convenção de getImagensProduto (fim do arquivo).
import type { ImageMetadata } from 'astro';
import { url } from '../lib/url.ts';
import { compromisso } from './site.ts';

// 'aveia' = a farinha de aveia (bolo de chocolate, fatia Matilda, massa de chocolate do Bento). Ela é sempre declarada em
// "Contém". Se conta como glúten depende de `aveiaSemGluten` em site.ts: desligado, aparece como "Glúten (aveia comum)" e tira
// o "sem glúten" de quem a leva; ligado (declarada sem glúten pelo fabricante), aparece só como "Aveia".
// Os textos gerais do site saem de comAveia() (fim do arquivo): lista vazia = tudo em "sem glúten e sem leite".
export type Alergeno = 'gluten' | 'aveia' | 'leite' | 'ovo' | 'amendoim' | 'coco' | 'castanhas' | 'gergelim' | 'soja';

/** Muda o preço (peso, tamanho da caixa). `unidades` conta para o prazo especial dos brigadeiros. */
export interface Variante { id: string; rotulo: string; preco: number | null; unidades?: number }
/** Soma ao preço (cobertura). */
export interface Adicional { id: string; rotulo: string; preco: number }
/** Escolha que não muda o preço (massa, recheio, sabor). `contem` soma alérgenos aos do produto; `ingredientes` é o que o
 *  valor acrescenta à base ("Paçoca: amendoim"). artigo: para o aviso "Escolha a massa" / "Escolha o recheio". */
export interface Opcao { id: string; rotulo: string; artigo?: 'a' | 'o'; valores: { nome: string; contem?: Alergeno[]; ingredientes?: string[] }[] }

export type CategoriaId = 'bolos' | 'paes' | 'fatias' | 'brigadeiros' | 'bento';

/** tipo = ocasião, no sobretítulo da vitrine ("Café da tarde"). oculta = fica nos dados, mas fora do site inteiro. */
export interface Categoria { id: CategoriaId; nome: string; tipo: string; chamada: string; oculta?: boolean }

export interface Produto {
  id: string;
  categoria: CategoriaId;
  nome: string;
  descricao: string;
  imagem: string;
  alergenos: { contem: Alergeno[]; podeConter: Alergeno[] };
  permiteSemOvo: boolean;
  disponivel: boolean;
  maisPedido?: boolean;
  /** Caixa montada pelo cliente com sabores misturados (um contador por valor da opção "sabor"). */
  montarCaixa?: boolean;
  /** Só os nomes, como a cliente mandou (sem quantidade nem modo de preparo). Sem lista, o painel convida a perguntar no WhatsApp. */
  ingredientes?: string[];
  /** O que falta a cliente responder. Enquanto existir, a lista fica guardada aqui, mas o painel não a mostra. */
  ingredientesPendente?: string;
  /** Partes fixas da receita (cobertura dos bolos, massa e recheio das fatias, coberturas do Bento), cada uma com a sua lista. */
  partes?: { nome: string; ingredientes: string[] }[];
  variantes: Variante[];
  adicionais?: Adicional[];
  opcoes?: Opcao[];
}

/** Chamada do Bento na vitrine. A massa de chocolate leva farinha de aveia: com ela contando como glúten (interruptor
 *  `aveiaSemGluten` desligado), fica só "sem leite" (os testes não deixam a chamada prometer "sem glúten" aí). */
export const chamadaBento = (semGluten = compromisso.aveiaSemGluten) =>
  `O bolo de aniversário ${semGluten ? 'sem glúten e sem leite' : 'sem leite'}, para a festa inteira dividir.`;

// Lista completa. O site lê `categorias` e `produtos` (logo depois dos produtos), que já vêm sem as categorias ocultas.
export const todasCategorias: Categoria[] = [
  { id: 'bolos', nome: 'Bolos caseirinhos', tipo: 'Café da tarde', chamada: 'O bolo do café da tarde, em 500 g.' },
  { id: 'paes', nome: 'Pães artesanais', tipo: 'Pão de todo dia', chamada: 'Batata-doce e grãos, de 600 a 800 g.' },
  // pronta para lançar: apague `oculta` quando as fotos das fatias chegarem (vitrine, /pedido e textos voltam sozinhos)
  { id: 'fatias', nome: 'Bolos em fatia', tipo: 'Sobremesa', chamada: 'Para provar sem encomendar um bolo inteiro.', oculta: true },
  { id: 'brigadeiros', nome: 'Brigadeiros', tipo: 'Docinhos', chamada: 'Cacau, paçoca e beijinho, em caixas com 6 ou 12.' },
  { id: 'bento', nome: 'Bento Cake', tipo: 'Aniversário', chamada: chamadaBento() },
];

const img = (id: string) => url(`/images/cardapio/${id}.webp`); // TODO: fotos reais
const bolo500 = (preco: number | null): Variante[] => [{ id: '500g', rotulo: '500 g', preco }];
const pesosPao: Variante[] = [
  { id: '600g', rotulo: '600 g', preco: 30 },
  { id: '700g', rotulo: '700 g', preco: 35 },
  { id: '800g', rotulo: '800 g', preco: 40 },
];
const fatia: Variante[] = [{ id: 'fatia', rotulo: 'Fatia', preco: 30 }];

// Padrão dos produtos (respostas da cliente); os brigadeiros sobrescrevem os alérgenos.
// Versão sem ovos só no bolo de chocolate e nos três pães; "Mais pedido" só no bolo de chocolate e no pão de batata-doce.
// Os dois saem só destes campos (permiteSemOvo, maisPedido), nunca do nome ou da categoria; os testes travam as listas.
const base = {
  alergenos: { contem: ['ovo', 'castanhas'], podeConter: ['soja', 'gluten', 'leite'] } as Produto['alergenos'],
  permiteSemOvo: false, // onde é true, a versão sem ovos sai pelo mesmo preço e pelo mesmo prazo
  disponivel: true,
};

// Ingredientes: só os NOMES que a cliente mandou. Receita, quantidade e print nunca entram no repositório.
// Massas e recheios que se repetem (bolo de chocolate, fatias e Bento) ficam aqui uma vez só.
const massaChocolate = ['ovos', 'óleo de girassol', 'açúcar mascavo', 'açúcar demerara', 'farinha de aveia', 'farinha de castanha de caju', 'polvilho doce', 'cacau em pó', 'extrato de baunilha', 'fermento em pó', 'bicarbonato'];
const massaBaunilha = ['ovos', 'farinha de arroz', 'amido de milho', 'polvilho doce', 'açúcar demerara', 'óleo de girassol', 'creme de amêndoas dissolvido em água'];
const recheios = {
  limao: ['inhame', 'limão', 'amido', 'ovos', 'açúcar demerara', 'geleia artesanal de frutas vermelhas'],
  maracuja: ['maracujá', 'açúcar demerara', 'inhame', 'creme de amêndoas'],
  chocolate: ['cacau', 'inhame', 'creme de amêndoas', 'açúcar mascavo'],
  // os ovos entram no creme conforme o preparo
  cremeBranco: ['creme de confeiteiro (amido, leite de castanha, extrato de baunilha, açúcar demerara e ovos)', 'morangos'],
};
// cobertura dos bolos: creme de amêndoas e açúcar demerara, mais o sabor (cacau, raspas de laranja, polpa de maracujá);
// opcional = adicional pago (laranja e maracujá): o painel diz "Cobertura (opcional)"
const coberturaCom = (sabor: string, opcional = false) => [{ nome: opcional ? 'Cobertura (opcional)' : 'Cobertura', ingredientes: ['creme de amêndoas', 'açúcar demerara', sabor] }];
// Descrições aprovadas pela cliente em 06/10 (as das fatias e do Bento continuam as de antes).
export const todosProdutos: Produto[] = [
  // sem cobertura e sem leite de coco (o líquido é água)
  {
    ...base, id: 'bolo-de-maca', categoria: 'bolos', nome: 'Bolo de maçã', descricao: 'Maçã com casca, canela e açúcar mascavo: cheirinho de bolo de vó.', imagem: img('bolo-de-maca'),
    variantes: bolo500(40),
    ingredientes: ['maçã com casca', 'ovo', 'óleo de girassol', 'melado de cana ou rapadura', 'açúcar mascavo', 'canela', 'farinha de arroz integral', 'farinha de castanha de caju', 'polvilho doce', 'água', 'sal', 'fermento em pó'],
  },
  {
    ...base, id: 'bolo-de-laranja', categoria: 'bolos', nome: 'Bolo de laranja', descricao: 'Feito com suco e raspas de laranja-pera, macio e perfumado.', imagem: img('bolo-de-laranja'),
    variantes: bolo500(40), adicionais: [{ id: 'cobertura', rotulo: 'Cobertura', preco: 10 }],
    ingredientes: ['ovo', 'açúcar demerara', 'óleo de girassol', 'suco e raspas de laranja-pera', 'farinha de amêndoas', 'farinha de arroz integral', 'polvilho doce', 'amido de milho', 'sal', 'fermento em pó'],
    partes: coberturaCom('raspas de laranja', true),
  },
  // farinha de aveia (conta como glúten ou não pelo interruptor aveiaSemGluten, em site.ts). Se a cliente trocar a farinha, tire 'aveia' daqui, da fatia Matilda e da massa
  // de chocolate do Bento
  {
    ...base, permiteSemOvo: true, id: 'bolo-de-chocolate', categoria: 'bolos', nome: 'Bolo de chocolate', descricao: 'Cacau, açúcar mascavo e baunilha. O mais pedido da casa.', imagem: img('bolo-de-chocolate'),
    variantes: bolo500(45), maisPedido: true, alergenos: { ...base.alergenos, contem: ['ovo', 'castanhas', 'aveia'] },
    ingredientes: massaChocolate, partes: coberturaCom('cacau'),
  },
  // açúcar só demerara (confirmado): vale o "nada de açúcar refinado"
  {
    ...base, id: 'bolo-de-cenoura', categoria: 'bolos', nome: 'Bolo de cenoura', descricao: 'Cenoura com um toque de laranja, do jeitinho que a gente gosta.', imagem: img('bolo-de-cenoura'),
    variantes: bolo500(45),
    ingredientes: ['ovo', 'açúcar demerara', 'óleo de girassol', 'cenoura', 'laranja', 'farinha de amêndoas', 'farinha de arroz integral', 'amido de milho', 'sal', 'fermento em pó'],
    partes: coberturaCom('cacau'),
  },
  {
    ...base, id: 'bolo-de-maracuja', categoria: 'bolos', nome: 'Bolo de maracujá', descricao: 'Com polpa de maracujá de verdade, azedinho na medida.', imagem: img('bolo-de-maracuja'),
    variantes: bolo500(40), adicionais: [{ id: 'cobertura-geleia', rotulo: 'Cobertura de geleia', preco: 10 }],
    ingredientes: ['ovo', 'óleo de girassol', 'açúcar demerara', 'polpa de maracujá', 'farinha de amêndoas', 'farinha de arroz', 'amido de milho', 'polvilho doce', 'sal', 'fermento em pó'],
    partes: coberturaCom('polpa de maracujá', true),
  },

  // "castanhas" = o creme de amêndoas
  {
    ...base, permiteSemOvo: true, id: 'pao-de-batata-doce', categoria: 'paes', nome: 'Pão de batata-doce', descricao: 'Feito com batata-doce de verdade. O pão mais pedido.', imagem: img('pao-de-batata-doce'), variantes: pesosPao, maisPedido: true,
    ingredientes: ['farinha de arroz', 'polvilho doce', 'amido de milho', 'batata-doce', 'açúcar demerara', 'ovo', 'óleo de girassol', 'creme de amêndoas dissolvido em água', 'fermento biológico', 'fermento em pó', 'goma xantana', 'sal'],
  },
  // sem castanha nem amêndoa na receita: "castanhas" é traço da cozinha. Leva gergelim.
  {
    ...base, permiteSemOvo: true, id: 'pao-de-graos', categoria: 'paes', nome: 'Pão artesanal de grãos', descricao: 'Linhaça, chia e semente de girassol em cada fatia.', imagem: img('pao-de-graos'), variantes: pesosPao,
    alergenos: { contem: ['ovo', 'gergelim'], podeConter: ['castanhas', 'soja', 'gluten', 'leite'] },
    ingredientes: ['farinha de arroz', 'polvilho doce', 'fécula de batata', 'açúcar demerara', 'linhaça dourada', 'chia', 'semente de girassol', 'gergelim', 'goma xantana', 'sal', 'fermento biológico', 'ovos', 'óleo de girassol', 'água'],
  },
  // "castanhas" = o creme de amêndoas
  {
    ...base, permiteSemOvo: true, id: 'pao-de-cebola', categoria: 'paes', nome: 'Pão de cebola', descricao: 'Salpicado de cebolinha, perfeito pro café da tarde.', imagem: img('pao-de-cebola'), variantes: pesosPao,
    ingredientes: ['farinha de arroz', 'polvilho doce', 'amido de milho', 'açúcar demerara', 'fermento biológico seco', 'fermento químico', 'goma xantana', 'cebolinha desidratada', 'ovos', 'óleo de girassol', 'creme de amêndoas dissolvido em água'],
  },

  // fatias: massa de baunilha (a mesma do Bento), menos a Matilda, que usa a massa do bolo de chocolate (com farinha de aveia)
  {
    ...base, id: 'fatia-limao-frutas-vermelhas', categoria: 'fatias', nome: 'Limão siciliano com frutas vermelhas', descricao: 'Bolo em fatia.', imagem: img('fatia-limao-frutas-vermelhas'), variantes: fatia,
    partes: [{ nome: 'Massa', ingredientes: massaBaunilha }, { nome: 'Recheio', ingredientes: recheios.limao }],
  },
  {
    ...base, id: 'fatia-chocolate-matilda', categoria: 'fatias', nome: 'Chocolate Matilda', descricao: 'Bolo em fatia.', imagem: img('fatia-chocolate-matilda'), variantes: fatia,
    alergenos: { ...base.alergenos, contem: ['ovo', 'castanhas', 'aveia'] },
    partes: [{ nome: 'Massa', ingredientes: massaChocolate }, { nome: 'Recheio', ingredientes: recheios.chocolate }],
  },
  {
    ...base, id: 'fatia-maracuja', categoria: 'fatias', nome: 'Maracujá', descricao: 'Bolo em fatia.', imagem: img('fatia-maracuja'), variantes: fatia,
    partes: [{ nome: 'Massa', ingredientes: massaBaunilha }, { nome: 'Recheio', ingredientes: recheios.maracuja }],
  },

  {
    ...base, id: 'caixa-de-brigadeiros', categoria: 'brigadeiros', nome: 'Caixa de brigadeiros', descricao: 'Base de inhame, em três sabores: cacau, paçoca e beijinho.', imagem: img('caixa-de-brigadeiros'), montarCaixa: true,
    // brigadeiro não leva ovo (selo "sem ovo"); a base é de inhame, sem castanha nem amêndoa ("castanhas" em podeConter é traço da cozinha)
    alergenos: { contem: [], podeConter: ['castanhas', 'soja', 'gluten', 'leite'] },
    // a base é a mesma em todos; cada sabor acrescenta o seu (o painel mostra "Base: …" e "Cacau: cacau · Paçoca: amendoim …")
    ingredientes: ['inhame', 'açúcar mascavo'],
    variantes: [
      { id: 'caixa-6', rotulo: 'Caixa com 6', preco: 30, unidades: 6 },
      { id: 'caixa-12', rotulo: 'Caixa com 12', preco: 55, unidades: 12 },
    ],
    opcoes: [{ id: 'sabor', rotulo: 'Sabor', artigo: 'o', valores: [
      { nome: 'Cacau', ingredientes: ['cacau'] },
      { nome: 'Paçoca', contem: ['amendoim'], ingredientes: ['amendoim'] },
      { nome: 'Beijinho', contem: ['coco'], ingredientes: ['coco'] },
    ] }],
  },

  // Bento: sem base comum; o painel mostra uma linha por massa, recheio e cobertura. A cobertura não é escolha do cliente
  // no pedido (só aparece nos ingredientes) até a cliente dizer quem escolhe.
  {
    ...base, id: 'bento-cake', categoria: 'bento', nome: 'Bento Cake', descricao: 'Bolo de aniversário, com massa e recheio à escolha.', imagem: img('bento-cake'),
    variantes: [{ id: 'unico', rotulo: 'Bento Cake', preco: 150 }],
    opcoes: [
      // a massa de chocolate é a do bolo de chocolate: leva farinha de aveia (confirmado pela cliente)
      { id: 'massa', rotulo: 'Massa', artigo: 'a', valores: [
        { nome: 'Baunilha', ingredientes: massaBaunilha },
        { nome: 'Chocolate', contem: ['aveia'], ingredientes: massaChocolate },
      ] },
      { id: 'recheio', rotulo: 'Recheio', artigo: 'o', valores: [
        { nome: 'Maracujá', ingredientes: recheios.maracuja },
        { nome: 'Creme branco com morangos', ingredientes: recheios.cremeBranco },
        { nome: 'Chocolate', ingredientes: recheios.chocolate },
        { nome: 'Limão siciliano com frutas vermelhas', ingredientes: recheios.limao },
      ] },
    ],
    partes: [
      { nome: 'Cobertura de chocolate', ingredientes: ['inhame', 'amido', 'ovos', 'cacau', 'creme de amêndoas'] },
      { nome: 'Cobertura branca (merengue suíço)', ingredientes: ['claras de ovos', 'açúcar demerara'] },
    ],
  },
];

/** Categorias e produtos que aparecem no site (sem as categorias ocultas). */
export const categorias = todasCategorias.filter((c) => !c.oculta);
export const produtos = todosProdutos.filter((p) => categorias.some((c) => c.id === p.categoria));

export const getProdutosPorCategoria = (categoriaId: CategoriaId) => produtos.filter((p) => p.categoria === categoriaId);

/** Preços definidos das variantes (sem os null de "Em breve"). */
export const precosDe = (p: Produto) => p.variantes.flatMap((v) => (v.preco === null ? [] : [v.preco]));

/** Sem nenhum preço definido: aparece como "Em breve", sem botão de adicionar. */
export const emBreve = (p: Produto) => precosDe(p).length === 0;

/** Menor preço entre os produtos disponíveis da categoria ("a partir de"); null se não houver nenhum. */
export function precoMinimo(categoriaId: CategoriaId): number | null {
  const precos = getProdutosPorCategoria(categoriaId).filter((p) => p.disponivel).flatMap(precosDe);
  return precos.length ? Math.min(...precos) : null;
}

/** Lista de ingredientes que o painel pode mostrar: vazia enquanto não houver lista ou houver pendência. */
export const ingredientesVisiveis = (p: Produto) => (p.ingredientesPendente ? [] : (p.ingredientes ?? []));

const maiuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Linhas além da base: o que cada valor de opção acrescenta ("Paçoca: amendoim", "Massa de baunilha: …") e as partes
 *  fixas ("Massa: …", "Cobertura branca: …"). Vazia enquanto houver pendência. */
export const acrescimosVisiveis = (p: Produto) => (p.ingredientesPendente
  ? []
  : [
    ...(p.opcoes ?? []).flatMap((o) => o.valores.flatMap((v) => (v.ingredientes?.length ? [{ nome: maiuscula(ondeNaOpcao(p, o, v.nome)), ingredientes: v.ingredientes }] : []))),
    ...(p.partes ?? []).filter((x) => x.ingredientes.length),
  ]);

/** A aveia conta como glúten? Só com o interruptor `aveiaSemGluten` (site.ts) desligado. */
export const aveiaContaComoGluten = (semGluten = compromisso.aveiaSemGluten) => !semGluten;

/** "Pode conter" sem repetir o que o produto inteiro já contém (aveia comum conta como glúten). O que vem só de uma
 *  opção (massa de chocolate do Bento) continua como traço possível, porque as outras opções não o levam. */
export const podeConterSemRepetir = (p: Produto, semGluten = compromisso.aveiaSemGluten) => {
  const contem = new Set<Alergeno>(p.alergenos.contem.flatMap((a) => (a === 'aveia' && aveiaContaComoGluten(semGluten) ? ['aveia', 'gluten'] : [a])));
  return p.alergenos.podeConter.filter((a) => !contem.has(a));
};

/** Nome no meio de uma frase: "bolo de chocolate", mas "Bento Cake" e "Chocolate Matilda" (nome próprio) ficam como estão. */
export const nomeNaFrase = (nome: string) => (/\s\p{Lu}/u.test(nome) ? nome : nome.charAt(0).toLowerCase() + nome.slice(1));

/** Onde a opção entra na frase: "paçoca" (produto com uma opção só) ou "massa de chocolate" (o Bento tem massa e recheio). */
export const ondeNaOpcao = (p: Produto, o: Opcao, valor: string) =>
  `${(p.opcoes?.length ?? 0) > 1 ? `${o.rotulo.toLowerCase()} de ` : ''}${valor.toLowerCase()}`;

/** As opções que levam aveia, contando como glúten ou não (ex.: a massa de chocolate do Bento). */
const opcoesComAveiaSempre = (p: Produto) =>
  (p.opcoes ?? []).flatMap((o) => o.valores.filter((v) => v.contem?.includes('aveia')).map((v) => ({ opcao: o, valor: v.nome })));

/** As opções de um produto que levam aveia comum, a que conta como glúten. Vazio com o interruptor ligado. */
export const opcoesComAveia = (p: Produto, semGluten = compromisso.aveiaSemGluten) =>
  (aveiaContaComoGluten(semGluten) ? opcoesComAveiaSempre(p) : []);

/** Leva aveia comum (a que conta como glúten) no produto inteiro (true), só em alguma opção ('opcao') ou não leva (false).
 *  Com o interruptor ligado, sempre false: some a etiqueta "Leva aveia" e o aviso para celíacos. */
export const levaAveia = (p: Produto, semGluten = compromisso.aveiaSemGluten): boolean | 'opcao' =>
  !aveiaContaComoGluten(semGluten) ? false : p.alergenos.contem.includes('aveia') ? true : opcoesComAveia(p, semGluten).length ? 'opcao' : false;

/** O que leva aveia comum, como entra numa frase ("bolo de chocolate", "Bento Cake com massa de chocolate").
 *  Daqui saem o "sem glúten, exceto …" e as etiquetas curtas do site; lista vazia = tudo volta a "sem glúten e sem leite". */
export const comAveia = (lista: Produto[] = produtos, semGluten = compromisso.aveiaSemGluten) =>
  lista.flatMap((p) => (levaAveia(p, semGluten) === true
    ? [nomeNaFrase(p.nome)]
    : opcoesComAveia(p, semGluten).map(({ opcao, valor }) => `${nomeNaFrase(p.nome)} com ${ondeNaOpcao(p, opcao, valor)}`)));

/** Onde a farinha de aveia entra, com artigo, conte ou não como glúten: "o bolo de chocolate", "a fatia Chocolate Matilda",
 *  "a massa de chocolate do Bento Cake" (linha do FAQ com o interruptor ligado). Fatia leva "a fatia"; o resto (bolo, pão,
 *  Bento), "o". */
export const ondeTemAveia = (lista: Produto[] = produtos) =>
  lista.flatMap((p) => (p.alergenos.contem.includes('aveia')
    ? [p.categoria === 'fatias' ? `a fatia ${p.nome}` : `o ${nomeNaFrase(p.nome)}`]
    : opcoesComAveiaSempre(p).map(({ opcao, valor }) => `${opcao.artigo ?? 'a'} ${ondeNaOpcao(p, opcao, valor)} do ${p.nome}`)));

/** "R$ 30" quando inteiro, "R$ 32,50" quando não. */
export const formatarPreco = (valor: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: Number.isInteger(valor) ? 0 : 2 }).format(valor);

// Fotos por produto: src/assets/images/produtos/{id}/capa.*, corte.*, extra-1.*, extra-2.*… (ver docs/FOTOS.md)
/** Fotos de um produto pela convenção de pastas; o que faltar fica undefined (extras: lista vazia). */
export function getImagensProduto(id: string) {
  // o glob fica dentro da função para este arquivo poder ser importado fora do Vite (scripts/checar-fotos.mjs)
  const fotosProdutos = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/produtos/*/*.{jpg,jpeg,png,webp}', { eager: true });
  const r: { capa?: ImageMetadata; corte?: ImageMetadata; extras: ImageMetadata[] } = { extras: [] };
  const extras: [number, ImageMetadata][] = [];
  for (const [caminho, mod] of Object.entries(fotosProdutos)) {
    const [, pasta, nome] = caminho.match(/produtos\/([^/]+)\/([^/]+)\.\w+$/) ?? [];
    if (pasta !== id) continue;
    if (nome === 'capa' || nome === 'corte') r[nome] = mod.default;
    const n = nome.match(/^extra-(\d+)$/)?.[1];
    if (n) extras.push([Number(n), mod.default]);
  }
  r.extras = extras.sort((a, b) => a[0] - b[0]).map(([, img]) => img);
  return r;
}
