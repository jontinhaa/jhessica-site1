// Fonte única dos produtos. A seção Cardápio da home, a página /pedido e o futuro carrinho leem daqui.
// Preços em reais (número); null = ainda sem preço: o produto aparece como "Em breve" e fica fora do "a partir de".
// `imagem` ainda é caminho reservado; as fotos por produto seguem a convenção de getImagensProduto (fim do arquivo).
import type { ImageMetadata } from 'astro';

export type Alergeno = 'gluten' | 'leite' | 'ovo' | 'amendoim' | 'coco' | 'castanhas' | 'soja';

/** Muda o preço (peso, tamanho da caixa). `unidades` conta para o prazo especial dos brigadeiros. */
export interface Variante { id: string; rotulo: string; preco: number | null; unidades?: number }
/** Soma ao preço (cobertura). */
export interface Adicional { id: string; rotulo: string; preco: number }
/** Escolha que não muda o preço (massa, recheio, sabor). `contem` soma alérgenos aos do produto.
 *  artigo: para o aviso "Escolha a massa" / "Escolha o recheio". */
export interface Opcao { id: string; rotulo: string; artigo?: 'a' | 'o'; valores: { nome: string; contem?: Alergeno[] }[] }

export type CategoriaId = 'bolos' | 'paes' | 'fatias' | 'brigadeiros' | 'bento';

/** tipo = ocasião, no sobretítulo da vitrine ("Café da tarde"). */
export interface Categoria { id: CategoriaId; nome: string; tipo: string; chamada: string }

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
  /** Lista de ingredientes; sem ela, o painel convida a perguntar no WhatsApp. TODO: lista por produto com a cliente */
  ingredientes?: string[];
  variantes: Variante[];
  adicionais?: Adicional[];
  opcoes?: Opcao[];
}

export const categorias: Categoria[] = [
  { id: 'bolos', nome: 'Bolos caseirinhos', tipo: 'Café da tarde', chamada: 'O bolo do café da tarde, em 500 g.' },
  { id: 'paes', nome: 'Pães artesanais', tipo: 'Pão de todo dia', chamada: 'Batata-doce e grãos, de 600 a 800 g.' },
  { id: 'fatias', nome: 'Bolos em fatia', tipo: 'Sobremesa', chamada: 'Para provar sem encomendar um bolo inteiro.' },
  { id: 'brigadeiros', nome: 'Brigadeiros', tipo: 'Docinhos', chamada: 'Cacau, paçoca e beijinho, em caixas com 6 ou 12.' },
  { id: 'bento', nome: 'Bento Cake', tipo: 'Aniversário', chamada: 'O bolo de aniversário sem glúten e sem leite, para a festa inteira dividir.' },
];

const img = (id: string) => `/images/cardapio/${id}.webp`; // TODO: fotos reais
const bolo500 = (preco: number | null): Variante[] => [{ id: '500g', rotulo: '500 g', preco }];
const cobertura: Adicional[] = [{ id: 'cobertura', rotulo: 'Cobertura', preco: 10 }];
const pesosPao: Variante[] = [
  { id: '600g', rotulo: '600 g', preco: 30 },
  { id: '700g', rotulo: '700 g', preco: 35 },
  { id: '800g', rotulo: '800 g', preco: 40 },
];
const fatia: Variante[] = [{ id: 'fatia', rotulo: 'Fatia', preco: 30 }];

// Padrão dos produtos (respostas da cliente); os brigadeiros sobrescrevem alérgenos e permiteSemOvo.
const base = {
  alergenos: { contem: ['ovo', 'castanhas'], podeConter: ['soja', 'gluten', 'leite'] } as Produto['alergenos'],
  permiteSemOvo: true, // versão sem ovos pelo mesmo preço. TODO: confirmar se muda o prazo
  disponivel: true,
};

// TODO: descrições finais com a cliente; as de agora só repetem o que já foi combinado.
export const produtos: Produto[] = [
  // leva leite de coco
  { ...base, id: 'bolo-de-maca', categoria: 'bolos', nome: 'Bolo de maçã', descricao: 'Bolo caseiro de 500 g. Cobertura opcional.', imagem: img('bolo-de-maca'), variantes: bolo500(40), adicionais: cobertura, alergenos: { ...base.alergenos, contem: ['ovo', 'castanhas', 'coco'] } },
  { ...base, id: 'bolo-de-laranja', categoria: 'bolos', nome: 'Bolo de laranja', descricao: 'Bolo caseiro de 500 g. Cobertura opcional.', imagem: img('bolo-de-laranja'), variantes: bolo500(40), adicionais: cobertura },
  { ...base, id: 'bolo-de-chocolate', categoria: 'bolos', nome: 'Bolo de chocolate', descricao: 'Bolo caseiro de 500 g, com cobertura.', imagem: img('bolo-de-chocolate'), variantes: bolo500(45), maisPedido: true },
  { ...base, id: 'bolo-de-cenoura', categoria: 'bolos', nome: 'Bolo de cenoura', descricao: 'Bolo caseiro de 500 g, com cobertura.', imagem: img('bolo-de-cenoura'), variantes: bolo500(45) },
  {
    ...base, id: 'bolo-de-maracuja', categoria: 'bolos', nome: 'Bolo de maracujá', descricao: 'Bolo caseiro de 500 g. Cobertura de geleia opcional.', imagem: img('bolo-de-maracuja'),
    variantes: bolo500(40), adicionais: [{ id: 'cobertura-geleia', rotulo: 'Cobertura de geleia', preco: 10 }],
  },

  { ...base, id: 'pao-de-batata-doce', categoria: 'paes', nome: 'Pão de batata-doce', descricao: 'Pão artesanal de 600 a 800 g.', imagem: img('pao-de-batata-doce'), variantes: pesosPao, maisPedido: true },
  { ...base, id: 'pao-de-graos', categoria: 'paes', nome: 'Pão artesanal de grãos', descricao: 'Pão artesanal de 600 a 800 g.', imagem: img('pao-de-graos'), variantes: pesosPao },
  { ...base, id: 'pao-de-cebola', categoria: 'paes', nome: 'Pão de cebola', descricao: 'Pão artesanal de 600 a 800 g.', imagem: img('pao-de-cebola'), variantes: pesosPao },

  { ...base, id: 'fatia-limao-frutas-vermelhas', categoria: 'fatias', nome: 'Limão siciliano com frutas vermelhas', descricao: 'Bolo em fatia.', imagem: img('fatia-limao-frutas-vermelhas'), variantes: fatia },
  { ...base, id: 'fatia-chocolate-matilda', categoria: 'fatias', nome: 'Chocolate Matilda', descricao: 'Bolo em fatia.', imagem: img('fatia-chocolate-matilda'), variantes: fatia },
  { ...base, id: 'fatia-maracuja', categoria: 'fatias', nome: 'Maracujá', descricao: 'Bolo em fatia.', imagem: img('fatia-maracuja'), variantes: fatia },

  {
    ...base, id: 'caixa-de-brigadeiros', categoria: 'brigadeiros', nome: 'Caixa de brigadeiros', descricao: 'Caixa com 6 ou 12 brigadeiros, com sabores misturados.', imagem: img('caixa-de-brigadeiros'), montarCaixa: true,
    // brigadeiro não leva ovo (selo "sem ovo"). TODO: confirmar se leva castanha ou amêndoa (por ora só "pode conter")
    alergenos: { contem: [], podeConter: ['castanhas', 'soja', 'gluten', 'leite'] }, permiteSemOvo: false,
    variantes: [
      { id: 'caixa-6', rotulo: 'Caixa com 6', preco: 30, unidades: 6 },
      { id: 'caixa-12', rotulo: 'Caixa com 12', preco: 55, unidades: 12 },
    ],
    opcoes: [{ id: 'sabor', rotulo: 'Sabor', artigo: 'o', valores: [
      { nome: 'Cacau' },
      { nome: 'Paçoca', contem: ['amendoim'] },
      { nome: 'Beijinho', contem: ['coco'] },
    ] }],
  },

  {
    ...base, id: 'bento-cake', categoria: 'bento', nome: 'Bento Cake', descricao: 'Bolo de aniversário pequeno, com massa e recheio à escolha.', imagem: img('bento-cake'),
    variantes: [{ id: 'unico', rotulo: 'Bento Cake', preco: 150 }],
    opcoes: [
      { id: 'massa', rotulo: 'Massa', artigo: 'a', valores: [{ nome: 'Baunilha' }, { nome: 'Chocolate' }] },
      { id: 'recheio', rotulo: 'Recheio', artigo: 'o', valores: [{ nome: 'Maracujá' }, { nome: 'Creme branco com morangos' }, { nome: 'Chocolate' }, { nome: 'Limão siciliano com frutas vermelhas' }] },
    ],
  },
];

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
