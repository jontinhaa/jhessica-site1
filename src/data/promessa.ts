// Promessa de glúten e leite, tirada do cardápio. Enquanto algum produto (ou opção, como a massa do Bento) levar aveia comum,
// nada no site diz "sem glúten" sem a exceção. Sem aveia contando como glúten (nenhuma no cardápio, ou o interruptor
// `aveiaSemGluten` de site.ts ligado), tudo volta sozinho a "sem glúten e sem leite".
// Fica fora de site.ts de propósito: scripts do navegador importam site.ts, e o cardápio não pode ir junto.
import { comAveia, levaAveia, ondeTemAveia, opcoesComAveia, produtos, type Produto } from './cardapio.ts';
import { compromisso } from './site.ts';

const lista = (itens: string[]) => new Intl.ListFormat('pt-BR', { style: 'long', type: 'conjunction' }).format(itens);
const aveia = comAveia();

/** Onde cabe uma frase (FAQ): "sem leite e sem glúten, exceto bolo de chocolate (aveia comum)" enquanto a aveia contar
 *  como glúten (interruptor `aveiaSemGluten` desligado); sem aveia comum, "sem glúten e sem leite". */
export const promessaFrase = (nomes = aveia) =>
  nomes.length ? `sem leite e sem glúten, exceto ${lista(nomes)} (aveia comum)` : 'sem glúten e sem leite';

/** Onde só cabe uma etiqueta (faixa e selos da hero, metas, prévia de link): ["sem leite", "sem trigo"]. */
export const promessaCurta = (nomes = aveia): [string, string] => (nomes.length ? ['sem leite', 'sem trigo'] : ['sem glúten', 'sem leite']);

/** Abertura do cardápio (home e /pedido), sem lista de exceções (pedido da cliente em 07/10): com aveia comum,
 *  "sem leite e sem trigo"; com a aveia declarada sem glúten (interruptor ligado), "sem glúten e sem leite".
 *  Os avisos de aveia ficam nos produtos (etiqueta, "Detalhes", prévia /p/) e no FAQ. */
export const leadCardapio = (nomes = aveia) =>
  `Receitas ${promessaCurta(nomes).join(' e ')}, feitas em pequenas fornadas. Os ingredientes de cada produto estão no cardápio.`;

/** Linha do FAQ "É tudo sem glúten…" com o interruptor ligado: onde entra a farinha de aveia declarada sem glúten.
 *  null com o interruptor desligado (a frase da cozinha já traz as exceções) ou sem aveia no cardápio. */
export function fraseAveiaDeclarada(cardapio: Produto[] = produtos, semGluten = compromisso.aveiaSemGluten): string | null {
  const onde = ondeTemAveia(cardapio);
  if (!semGluten || !onde.length) return null;
  const nomes = lista(onde);
  return `${nomes.charAt(0).toUpperCase()}${nomes.slice(1)} ${onde.length > 1 ? 'levam' : 'leva'} farinha de aveia declarada sem glúten pelo fabricante. Alguns celíacos também não toleram a aveia; na dúvida, fale com a gente antes de pedir.`;
}

/** Descrição do site (meta da home, prévia de link e frase de abertura da hero). */
export const descricaoSite = (nomes = aveia) => `Bolos, pães e doces ${promessaCurta(nomes).join(' e ')}, feitos à mão em Marabá.`;

/** Receita de um produto com massa à escolha (seção Bento da home). Sem aveia: "sem glúten e sem leite". Aveia só em
 *  parte das massas: "sem leite e sem glúten na massa de baunilha (a de chocolate leva aveia comum)". Senão: "sem leite". */
export function promessaPorMassa(p: Produto, semGluten = compromisso.aveiaSemGluten): string {
  const aveia = levaAveia(p, semGluten);
  if (!aveia) return 'sem glúten e sem leite';
  const massas = p.opcoes?.find((o) => o.id === 'massa')?.valores ?? [];
  const nomes = (comAveia: boolean) => lista(massas.filter((v) => !!v.contem?.includes('aveia') === comAveia).map((v) => v.nome.toLowerCase()));
  const soNaMassa = aveia === 'opcao' && opcoesComAveia(p, semGluten).every(({ opcao }) => opcao.id === 'massa');
  return soNaMassa && nomes(false) ? `sem leite e sem glúten na massa de ${nomes(false)} (a de ${nomes(true)} leva aveia comum)` : 'sem leite';
}

type Cozinha = Pick<typeof compromisso, 'cozinhaSemGluten' | 'cozinhaSemLeite'>;

/** Frase sobre a cozinha; null (não mostra nada) enquanto glúten ou leite não estiver confirmado.
 *  Com aveia comum no cardápio, a cozinha manipula glúten mesmo que `cozinhaSemGluten` diga o contrário.
 *  `semExcecoes` (seção Ingredientes da home, pedido da cliente em 07/10): "sem leite e sem trigo" no lugar da lista de
 *  exceções; o FAQ continua com a lista. */
export function textoCozinha({ cozinhaSemGluten, cozinhaSemLeite: leite }: Cozinha = compromisso, nomes = aveia, { semExcecoes = false } = {}): string | null {
  if (cozinhaSemGluten === null || leite === null) return null;
  const gluten = cozinhaSemGluten && !nomes.length;
  if (gluten && leite) return 'Na nossa cozinha não entram glúten nem leite, em receita nenhuma.';
  const manipula = !gluten && !leite ? (semExcecoes && nomes.length ? 'glúten e leite' : 'esses ingredientes') : !gluten ? 'glúten' : 'leite';
  const receitas = !nomes.length ? 'não levam glúten nem leite' : semExcecoes ? `são ${promessaCurta(nomes).join(' e ')}` : `são ${promessaFrase(nomes)}`;
  return `Nossas receitas ${receitas}, mas são feitas numa cozinha que também manipula ${manipula}. Por isso, podem conter traços. Se você tem doença celíaca ou alergia grave, fale com a gente antes de pedir.`;
}

/** "Sim." na pergunta "É tudo sem glúten e sem leite?" só com a cozinha livre dos dois e nenhuma aveia no cardápio. */
export const tudoSemGlutenNemLeite = (c: Cozinha = compromisso, nomes = aveia) =>
  c.cozinhaSemGluten === true && c.cozinhaSemLeite === true && !nomes.length;

/** Frase curta de traços do rodapé. Só aparece enquanto a cozinha está confirmada como NÃO livre de glúten e de leite;
 *  se virar livre (true) ou ficar sem confirmação (null), não afirma nada. Sem lista de exceções (pedido da cliente em
 *  07/10): com aveia, "sem leite e sem trigo"; sem aveia, "sem glúten e sem leite". */
export const fraseTracos = (c: Cozinha = compromisso, nomes = aveia) =>
  c.cozinhaSemGluten === false && c.cozinhaSemLeite === false
    ? `Receitas ${promessaCurta(nomes).join(' e ')}. Produzidas em cozinha que não é livre de traços. Em caso de doença celíaca ou alergia grave, fale com a gente antes de pedir.`
    : null;
