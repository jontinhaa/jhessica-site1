// Depoimentos de clientes. A home só mostra os autorizados (autorizado === true).
// print = nome do arquivo (sem extensão) em src/assets/images/depoimentos/ (ver docs/FOTOS.md).

export interface Depoimento { nome: string; contexto?: string; texto?: string; print?: string; autorizado: boolean }

export const depoimentos: Depoimento[] = [
  { nome: 'Karen', autorizado: true, print: 'karen-1' }, // TODO: texto transcrito do print
];

export const depoimentosPublicos = depoimentos.filter((d) => d.autorizado === true);
