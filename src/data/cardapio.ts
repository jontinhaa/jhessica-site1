// Fonte única dos produtos. A seção Cardápio da home, a página /pedido e o futuro carrinho leem daqui.
// Preços em reais (número); null = ainda sem preço: o produto aparece como "Em breve" e fica fora do "a partir de".
// `imagem` ainda é caminho reservado; as fotos por produto seguem a convenção de getImagensProduto (fim do arquivo).
import type { ImageMetadata } from 'astro';
import { url } from '../lib/url.ts';

// 'aveia' = aveia comum, não certificada: aparece como "Glúten (aveia comum)" e tira o "sem glúten" de quem a leva.
// Os textos gerais do site saem de comAveia() (fim do arquivo): sem nenhum produto com aveia, voltam a "sem glúten e sem leite".
export type Alergeno = 'gluten' | 'aveia' | 'leite' | 'ovo' | 'amendoim' | 'coco' | 'castanhas' | 'soja';

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
  /** A lista é só da massa: o painel avisa que a cobertura ainda não está nela. Tire quando a cobertura entrar na lista. */
  coberturaPendente?: boolean;
  variantes: Variante[];
  adicionais?: Adicional[];
  opcoes?: Opcao[];
}

// Lista completa. O site lê `categorias` e `produtos` (logo depois dos produtos), que já vêm sem as categorias ocultas.
export const todasCategorias: Categoria[] = [
  { id: 'bolos', nome: 'Bolos caseirinhos', tipo: 'Café da tarde', chamada: 'O bolo do café da tarde, em 500 g.' },
  { id: 'paes', nome: 'Pães artesanais', tipo: 'Pão de todo dia', chamada: 'Batata-doce e grãos, de 600 a 800 g.' },
  // pronta para lançar: apague `oculta` quando as fotos das fatias chegarem (vitrine, /pedido e textos voltam sozinhos)
  { id: 'fatias', nome: 'Bolos em fatia', tipo: 'Sobremesa', chamada: 'Para provar sem encomendar um bolo inteiro.', oculta: true },
  { id: 'brigadeiros', nome: 'Brigadeiros', tipo: 'Docinhos', chamada: 'Cacau, paçoca e beijinho, em caixas com 6 ou 12.' },
  // PENDÊNCIA: se a massa de chocolate do Bento não levar aveia, volta "O bolo de aniversário sem glúten e sem leite, …"
  // (os testes não deixam uma chamada prometer "sem glúten" quando algum produto da categoria leva aveia)
  { id: 'bento', nome: 'Bento Cake', tipo: 'Aniversário', chamada: 'O bolo de aniversário sem leite, para a festa inteira dividir.' },
];

const img = (id: string) => url(`/images/cardapio/${id}.webp`); // TODO: fotos reais
const bolo500 = (preco: number | null): Variante[] => [{ id: '500g', rotulo: '500 g', preco }];
const cobertura: Adicional[] = [{ id: 'cobertura', rotulo: 'Cobertura', preco: 10 }];
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
// bolos: a cobertura (opcional ou inclusa) ainda não tem ingredientes confirmados
const bolo = { ...base, coberturaPendente: true };

// Ingredientes: só os NOMES que a cliente mandou. Receita, quantidade e print nunca entram no repositório.
// TODO: descrições finais com a cliente; as de agora só repetem o que já foi combinado.
export const todosProdutos: Produto[] = [
  // "coco" fica até a cliente confirmar o leite de coco (ela disse que leva; o print não mostra)
  {
    ...bolo, id: 'bolo-de-maca', categoria: 'bolos', nome: 'Bolo de maçã', descricao: 'Bolo caseiro de 500 g. Cobertura opcional.', imagem: img('bolo-de-maca'),
    variantes: bolo500(40), adicionais: cobertura, alergenos: { ...base.alergenos, contem: ['ovo', 'castanhas', 'coco'] },
    ingredientes: ['maçã com casca', 'ovo', 'óleo de girassol', 'melado de cana ou rapadura', 'açúcar mascavo', 'canela', 'farinha de arroz integral', 'farinha de castanha de caju', 'polvilho doce', 'sal', 'fermento em pó'],
  },
  {
    ...bolo, id: 'bolo-de-laranja', categoria: 'bolos', nome: 'Bolo de laranja', descricao: 'Bolo caseiro de 500 g. Cobertura opcional.', imagem: img('bolo-de-laranja'),
    variantes: bolo500(40), adicionais: cobertura,
    ingredientes: ['ovo', 'açúcar demerara', 'óleo de girassol', 'suco e raspas de laranja-pera', 'farinha de amêndoas', 'farinha de arroz integral', 'polvilho doce', 'amido de milho', 'sal', 'fermento em pó'],
  },
  // aveia comum, não certificada. PENDÊNCIA: se a cliente trocar a farinha de aveia, tire 'aveia' daqui e da fatia Matilda
  {
    ...bolo, permiteSemOvo: true, id: 'bolo-de-chocolate', categoria: 'bolos', nome: 'Bolo de chocolate', descricao: 'Bolo caseiro de 500 g, com cobertura.', imagem: img('bolo-de-chocolate'),
    variantes: bolo500(45), maisPedido: true, alergenos: { ...base.alergenos, contem: ['ovo', 'castanhas', 'aveia'] },
    ingredientes: ['ovos', 'óleo de girassol', 'açúcar mascavo', 'açúcar demerara', 'farinha de aveia', 'farinha de castanha de caju', 'polvilho doce', 'cacau em pó', 'extrato de baunilha', 'fermento em pó', 'bicarbonato'],
  },
  // TODO: confirmar que é só demerara (a fonte cita "ou cristal", que derrubaria o "nada de açúcar refinado")
  {
    ...bolo, id: 'bolo-de-cenoura', categoria: 'bolos', nome: 'Bolo de cenoura', descricao: 'Bolo caseiro de 500 g, com cobertura.', imagem: img('bolo-de-cenoura'),
    variantes: bolo500(45),
    ingredientes: ['ovo', 'açúcar demerara', 'óleo de girassol', 'cenoura', 'laranja', 'farinha de amêndoas', 'farinha de arroz integral', 'amido de milho', 'sal', 'fermento em pó'],
  },
  {
    ...bolo, id: 'bolo-de-maracuja', categoria: 'bolos', nome: 'Bolo de maracujá', descricao: 'Bolo caseiro de 500 g. Cobertura de geleia opcional.', imagem: img('bolo-de-maracuja'),
    variantes: bolo500(40), adicionais: [{ id: 'cobertura-geleia', rotulo: 'Cobertura de geleia', preco: 10 }],
    ingredientes: ['ovo', 'óleo de girassol', 'açúcar demerara', 'polpa de maracujá', 'farinha de amêndoas', 'farinha de arroz', 'amido de milho', 'polvilho doce', 'sal', 'fermento em pó'],
  },

  // "castanhas" fica até a cliente dizer o líquido (água ou qual leite vegetal)
  {
    ...base, permiteSemOvo: true, id: 'pao-de-batata-doce', categoria: 'paes', nome: 'Pão de batata-doce', descricao: 'Pão artesanal de 600 a 800 g.', imagem: img('pao-de-batata-doce'), variantes: pesosPao, maisPedido: true,
    ingredientes: ['farinha de arroz', 'polvilho doce', 'amido de milho', 'batata-doce', 'ovo', 'óleo de girassol', 'fermento biológico', 'fermento em pó', 'goma xantana', 'sal'],
    ingredientesPendente: 'o tipo de açúcar e o líquido (água ou qual leite vegetal)',
  },
  // sem castanha nem amêndoa na receita: "castanhas" é traço da cozinha. TODO: gergelim (se confirmar, vira alérgeno novo)
  {
    ...base, permiteSemOvo: true, id: 'pao-de-graos', categoria: 'paes', nome: 'Pão artesanal de grãos', descricao: 'Pão artesanal de 600 a 800 g.', imagem: img('pao-de-graos'), variantes: pesosPao,
    alergenos: { contem: ['ovo'], podeConter: ['castanhas', 'soja', 'gluten', 'leite'] },
    ingredientes: ['farinha de arroz', 'polvilho doce', 'fécula de batata', 'açúcar demerara', 'linhaça dourada', 'chia', 'semente de girassol', 'goma xantana', 'sal', 'fermento biológico', 'ovos', 'óleo de girassol', 'água'],
  },
  // PENDÊNCIA: ingredientes do pão de cebola
  { ...base, permiteSemOvo: true, id: 'pao-de-cebola', categoria: 'paes', nome: 'Pão de cebola', descricao: 'Pão artesanal de 600 a 800 g.', imagem: img('pao-de-cebola'), variantes: pesosPao },

  // fatias: por enquanto a lista é só do recheio; a massa é PENDÊNCIA (por isso nenhuma lista aparece)
  {
    ...base, id: 'fatia-limao-frutas-vermelhas', categoria: 'fatias', nome: 'Limão siciliano com frutas vermelhas', descricao: 'Bolo em fatia.', imagem: img('fatia-limao-frutas-vermelhas'), variantes: fatia,
    ingredientes: ['inhame', 'limão', 'amido', 'ovos', 'açúcar demerara', 'geleia artesanal de frutas vermelhas'], ingredientesPendente: 'a massa',
  },
  {
    ...base, id: 'fatia-chocolate-matilda', categoria: 'fatias', nome: 'Chocolate Matilda', descricao: 'Bolo em fatia.', imagem: img('fatia-chocolate-matilda'), variantes: fatia,
    alergenos: { ...base.alergenos, contem: ['ovo', 'castanhas', 'aveia'] },
    ingredientes: ['cacau', 'inhame', 'creme de amêndoas', 'açúcar mascavo'], ingredientesPendente: 'a massa',
  },
  {
    ...base, id: 'fatia-maracuja', categoria: 'fatias', nome: 'Maracujá', descricao: 'Bolo em fatia.', imagem: img('fatia-maracuja'), variantes: fatia,
    ingredientes: ['maracujá', 'açúcar demerara', 'inhame', 'creme de amêndoas'], ingredientesPendente: 'a massa',
  },

  {
    ...base, id: 'caixa-de-brigadeiros', categoria: 'brigadeiros', nome: 'Caixa de brigadeiros', descricao: 'Caixa com 6 ou 12 brigadeiros, com sabores misturados.', imagem: img('caixa-de-brigadeiros'), montarCaixa: true,
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

  // PENDÊNCIA: ingredientes do Bento (massas e recheios)
  {
    ...base, id: 'bento-cake', categoria: 'bento', nome: 'Bento Cake', descricao: 'Bolo de aniversário, com massa e recheio à escolha.', imagem: img('bento-cake'),
    variantes: [{ id: 'unico', rotulo: 'Bento Cake', preco: 150 }],
    opcoes: [
      // PENDÊNCIA: até a cliente dizer se a massa de chocolate leva a farinha de aveia do bolo, conta como se levasse
      { id: 'massa', rotulo: 'Massa', artigo: 'a', valores: [{ nome: 'Baunilha' }, { nome: 'Chocolate', contem: ['aveia'] }] },
      { id: 'recheio', rotulo: 'Recheio', artigo: 'o', valores: [{ nome: 'Maracujá' }, { nome: 'Creme branco com morangos' }, { nome: 'Chocolate' }, { nome: 'Limão siciliano com frutas vermelhas' }] },
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

/** O que cada valor de opção acrescenta à base ("Paçoca: amendoim"); vazia quando a lista do produto não aparece. */
export const acrescimosVisiveis = (p: Produto) => (ingredientesVisiveis(p).length
  ? (p.opcoes ?? []).flatMap((o) => o.valores.flatMap((v) => (v.ingredientes?.length ? [{ nome: v.nome, ingredientes: v.ingredientes }] : [])))
  : []);

/** "Pode conter" sem repetir o que o produto inteiro já contém (aveia comum conta como glúten). O que vem só de uma
 *  opção (massa de chocolate do Bento) continua como traço possível, porque as outras opções não o levam. */
export const podeConterSemRepetir = (p: Produto) => {
  const contem = new Set<Alergeno>(p.alergenos.contem.flatMap((a) => (a === 'aveia' ? ['aveia', 'gluten'] : [a])));
  return p.alergenos.podeConter.filter((a) => !contem.has(a));
};

/** Nome no meio de uma frase: "bolo de chocolate", mas "Bento Cake" e "Chocolate Matilda" (nome próprio) ficam como estão. */
export const nomeNaFrase = (nome: string) => (/\s\p{Lu}/u.test(nome) ? nome : nome.charAt(0).toLowerCase() + nome.slice(1));

/** Onde a opção entra na frase: "paçoca" (produto com uma opção só) ou "massa de chocolate" (o Bento tem massa e recheio). */
export const ondeNaOpcao = (p: Produto, o: Opcao, valor: string) =>
  `${(p.opcoes?.length ?? 0) > 1 ? `${o.rotulo.toLowerCase()} de ` : ''}${valor.toLowerCase()}`;

/** As opções de um produto que levam aveia comum (ex.: a massa de chocolate do Bento). */
export const opcoesComAveia = (p: Produto) =>
  (p.opcoes ?? []).flatMap((o) => o.valores.filter((v) => v.contem?.includes('aveia')).map((v) => ({ opcao: o, valor: v.nome })));

/** Leva aveia comum no produto inteiro (true), só em alguma opção ('opcao') ou não leva (false). */
export const levaAveia = (p: Produto): boolean | 'opcao' =>
  p.alergenos.contem.includes('aveia') ? true : opcoesComAveia(p).length ? 'opcao' : false;

/** O que leva aveia comum, como entra numa frase ("bolo de chocolate", "Bento Cake com massa de chocolate").
 *  Daqui saem o "sem glúten, exceto …" e as etiquetas curtas do site; lista vazia = tudo volta a "sem glúten e sem leite". */
export const comAveia = (lista: Produto[] = produtos) =>
  lista.flatMap((p) => (levaAveia(p) === true
    ? [nomeNaFrase(p.nome)]
    : opcoesComAveia(p).map(({ opcao, valor }) => `${nomeNaFrase(p.nome)} com ${ondeNaOpcao(p, opcao, valor)}`)));

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
