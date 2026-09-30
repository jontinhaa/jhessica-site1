// Fonte única dos produtos. A seção Cardápio da home, a página /pedido e o futuro carrinho leem daqui.
// Preços em reais (número). Imagens ainda são caminhos reservados: os arquivos não existem.

export type Alergeno = 'ovo' | 'amendoim' | 'coco' | 'castanhas' | 'soja';

/** Muda o preço (peso, tamanho da caixa). */
export interface Variante { id: string; rotulo: string; preco: number }
/** Soma ao preço (cobertura). */
export interface Adicional { id: string; rotulo: string; preco: number }
/** Escolha que não muda o preço (massa, recheio, sabor). */
export interface Opcao { id: string; rotulo: string; valores: string[] }

export type CategoriaId = 'bolos' | 'paes' | 'fatias' | 'brigadeiros' | 'bento';

/** tipo = ocasião, no sobretítulo da vitrine ("Café da tarde"). */
export interface Categoria { id: CategoriaId; nome: string; tipo: string; chamada: string }

export interface Produto {
  id: string;
  categoria: CategoriaId;
  nome: string;
  descricao: string;
  imagem: string;
  alergenos: Alergeno[];
  disponivel: boolean;
  variantes: Variante[];
  adicionais?: Adicional[];
  opcoes?: Opcao[];
}

export const categorias: Categoria[] = [
  { id: 'bolos', nome: 'Bolos caseirinhos', tipo: 'Café da tarde', chamada: 'O bolo do café da tarde, em 500 g.' },
  { id: 'paes', nome: 'Pães artesanais', tipo: 'Pão de todo dia', chamada: 'Batata-doce e integral, de 600 a 800 g.' },
  { id: 'fatias', nome: 'Bolos em fatia', tipo: 'Sobremesa', chamada: 'Para provar sem encomendar um bolo inteiro.' },
  { id: 'brigadeiros', nome: 'Brigadeiros', tipo: 'Docinhos', chamada: 'Cacau, paçoca e beijinho, em caixas com 6.' },
  { id: 'bento', nome: 'Bento Cake', tipo: 'Aniversário', chamada: 'O bolo de aniversário sem glúten e sem leite, para a festa inteira dividir.' },
];

const img = (id: string) => `/images/cardapio/${id}.webp`; // TODO: fotos reais
const bolo500 = (preco: number): Variante[] => [{ id: '500g', rotulo: '500 g', preco }];
const cobertura: Adicional[] = [{ id: 'cobertura', rotulo: 'Cobertura', preco: 10 }];
const pesosPao: Variante[] = [
  { id: '600g', rotulo: '600 g', preco: 30 },
  { id: '700g', rotulo: '700 g', preco: 35 },
  { id: '800g', rotulo: '800 g', preco: 40 },
];
const fatia: Variante[] = [{ id: 'fatia', rotulo: 'Fatia', preco: 30 }];

// TODO: confirmar alérgenos com a cliente em todos os produtos (paçoca → amendoim? beijinho → coco?).
// TODO: descrições finais com a cliente; as de agora só repetem o que já foi combinado.
export const produtos: Produto[] = [
  { id: 'bolo-de-maca', categoria: 'bolos', nome: 'Bolo de maçã', descricao: 'Bolo caseiro de 500 g. Cobertura opcional.', imagem: img('bolo-de-maca'), alergenos: [], disponivel: true, variantes: bolo500(40), adicionais: cobertura },
  { id: 'bolo-de-laranja', categoria: 'bolos', nome: 'Bolo de laranja', descricao: 'Bolo caseiro de 500 g. Cobertura opcional.', imagem: img('bolo-de-laranja'), alergenos: [], disponivel: true, variantes: bolo500(40), adicionais: cobertura },
  { id: 'bolo-de-chocolate', categoria: 'bolos', nome: 'Bolo de chocolate', descricao: 'Bolo caseiro de 500 g, com cobertura.', imagem: img('bolo-de-chocolate'), alergenos: [], disponivel: true, variantes: bolo500(45) },
  { id: 'bolo-de-cenoura', categoria: 'bolos', nome: 'Bolo de cenoura', descricao: 'Bolo caseiro de 500 g, com cobertura.', imagem: img('bolo-de-cenoura'), alergenos: [], disponivel: true, variantes: bolo500(45) },

  { id: 'pao-de-batata-doce', categoria: 'paes', nome: 'Pão de batata-doce', descricao: 'Pão artesanal de 600 a 800 g.', imagem: img('pao-de-batata-doce'), alergenos: [], disponivel: true, variantes: pesosPao },
  // TODO: nome definitivo com a cliente
  { id: 'pao-integral', categoria: 'paes', nome: 'Pão integral sem glúten', descricao: 'Pão artesanal de 600 a 800 g.', imagem: img('pao-integral'), alergenos: [], disponivel: true, variantes: pesosPao },

  { id: 'fatia-limao-frutas-vermelhas', categoria: 'fatias', nome: 'Limão siciliano com frutas vermelhas', descricao: 'Bolo em fatia.', imagem: img('fatia-limao-frutas-vermelhas'), alergenos: [], disponivel: true, variantes: fatia },
  { id: 'fatia-chocolate-matilda', categoria: 'fatias', nome: 'Chocolate Matilda', descricao: 'Bolo em fatia.', imagem: img('fatia-chocolate-matilda'), alergenos: [], disponivel: true, variantes: fatia },
  { id: 'fatia-maracuja', categoria: 'fatias', nome: 'Maracujá', descricao: 'Bolo em fatia.', imagem: img('fatia-maracuja'), alergenos: [], disponivel: true, variantes: fatia },

  // TODO: caixa com 12 quando a cliente definir o preço
  {
    id: 'caixa-de-brigadeiros', categoria: 'brigadeiros', nome: 'Caixa de brigadeiros', descricao: 'Caixa com 6 brigadeiros.', imagem: img('caixa-de-brigadeiros'), alergenos: [], disponivel: true,
    variantes: [{ id: 'caixa-6', rotulo: 'Caixa com 6', preco: 30 }],
    opcoes: [{ id: 'sabor', rotulo: 'Sabor', valores: ['Cacau', 'Paçoca', 'Beijinho'] }],
  },

  {
    id: 'bento-cake', categoria: 'bento', nome: 'Bento Cake', descricao: 'Bolo de aniversário pequeno, com massa e recheio à escolha.', imagem: img('bento-cake'), alergenos: [], disponivel: true,
    variantes: [{ id: 'unico', rotulo: 'Bento Cake', preco: 150 }],
    opcoes: [
      { id: 'massa', rotulo: 'Massa', valores: ['Baunilha', 'Chocolate'] },
      // TODO: nome definitivo de "Creme de baunilha com morangos" com a cliente (não usar "Ninho")
      { id: 'recheio', rotulo: 'Recheio', valores: ['Maracujá', 'Creme de baunilha com morangos', 'Chocolate', 'Limão siciliano com frutas vermelhas'] },
    ],
  },
];

export const getProdutosPorCategoria = (categoriaId: CategoriaId) => produtos.filter((p) => p.categoria === categoriaId);

/** Menor preço entre os produtos disponíveis da categoria ("a partir de"); null se não houver nenhum. */
export function precoMinimo(categoriaId: CategoriaId): number | null {
  const precos = getProdutosPorCategoria(categoriaId).filter((p) => p.disponivel).flatMap((p) => p.variantes.map((v) => v.preco));
  return precos.length ? Math.min(...precos) : null;
}

/** "R$ 30" quando inteiro, "R$ 32,50" quando não. */
export const formatarPreco = (valor: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: Number.isInteger(valor) ? 0 : 2 }).format(valor);
