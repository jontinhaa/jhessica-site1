// Promessa de glúten e leite, tirada do cardápio. Enquanto algum produto (ou opção, como a massa do Bento) levar aveia comum,
// nada no site diz "sem glúten" sem a exceção. Sem aveia no cardápio, tudo volta sozinho a "sem glúten e sem leite".
// Fica fora de site.ts de propósito: scripts do navegador importam site.ts, e o cardápio não pode ir junto.
import { comAveia } from './cardapio.ts';
import { compromisso } from './site.ts';

const lista = (itens: string[]) => new Intl.ListFormat('pt-BR', { style: 'long', type: 'conjunction' }).format(itens);
const aveia = comAveia();

/** Onde cabe uma frase (FAQ, rodapé, cozinha, leads): "sem leite e sem glúten, exceto bolo de chocolate (aveia comum)". */
export const promessaFrase = (nomes = aveia) =>
  nomes.length ? `sem leite e sem glúten, exceto ${lista(nomes)} (aveia comum)` : 'sem glúten e sem leite';

/** Onde só cabe uma etiqueta (faixa e selos da hero, metas, prévia de link): ["sem leite", "sem trigo"]. */
export const promessaCurta = (nomes = aveia): [string, string] => (nomes.length ? ['sem leite', 'sem trigo'] : ['sem glúten', 'sem leite']);

/** Descrição do site (meta da home, prévia de link e frase de abertura da hero). */
export const descricaoSite = (nomes = aveia) => `Bolos, pães e doces ${promessaCurta(nomes).join(' e ')}, feitos à mão em Marabá.`;

type Cozinha = Pick<typeof compromisso, 'cozinhaSemGluten' | 'cozinhaSemLeite'>;

/** Frase sobre a cozinha; null (não mostra nada) enquanto glúten ou leite não estiver confirmado.
 *  Com aveia comum no cardápio, a cozinha manipula glúten mesmo que `cozinhaSemGluten` diga o contrário. */
export function textoCozinha({ cozinhaSemGluten, cozinhaSemLeite: leite }: Cozinha = compromisso, nomes = aveia): string | null {
  if (cozinhaSemGluten === null || leite === null) return null;
  const gluten = cozinhaSemGluten && !nomes.length;
  if (gluten && leite) return 'Na nossa cozinha não entram glúten nem leite, em receita nenhuma.';
  const manipula = !gluten && !leite ? 'esses ingredientes' : !gluten ? 'glúten' : 'leite';
  const receitas = nomes.length ? `são ${promessaFrase(nomes)}` : 'não levam glúten nem leite';
  return `Nossas receitas ${receitas}, mas são feitas numa cozinha que também manipula ${manipula}. Por isso, podem conter traços. Se você tem doença celíaca ou alergia grave, fale com a gente antes de pedir.`;
}

/** "Sim." na pergunta "É tudo sem glúten e sem leite?" só com a cozinha livre dos dois e nenhuma aveia no cardápio. */
export const tudoSemGlutenNemLeite = (c: Cozinha = compromisso, nomes = aveia) =>
  c.cozinhaSemGluten === true && c.cozinhaSemLeite === true && !nomes.length;

/** Frase curta de traços do rodapé. Só aparece enquanto a cozinha está confirmada como NÃO livre de glúten e de leite;
 *  se virar livre (true) ou ficar sem confirmação (null), não afirma nada. */
export const fraseTracos = (c: Cozinha = compromisso, nomes = aveia) =>
  c.cozinhaSemGluten === false && c.cozinhaSemLeite === false
    ? `Receitas ${promessaFrase(nomes)}. Produzidas em cozinha que não é livre de traços. Em caso de doença celíaca ou alergia grave, fale com a gente antes de pedir.`
    : null;
