// Depoimentos de clientes. A home só mostra os autorizados (autorizado === true).
// Adicionar um depoimento = uma linha aqui + o print original em src/assets/images/depoimentos/ + `npm run prints`.
// print = nome do arquivo (sem extensão); `npm run prints` recorta só o balão da mensagem (recorte, em frações da
// imagem: [esquerda, topo, largura, altura]) e grava a cópia em depoimentos/balao/. O site usa SÓ a cópia: o print original
// (foto de perfil e nome do contato) nunca vai para o site. Texto fiel ao original; só digitação óbvia foi corrigida.
// ATENÇÃO: o print original e a cópia não podem mostrar telefone, foto de perfil nem nome do contato.

export interface Depoimento {
  nome: string;
  contexto?: string; // só o que a própria fala diz (ex.: o produto)
  texto: string;
  print?: string;
  recorte?: [number, number, number, number];
  autorizado: boolean;
}

export const depoimentos: Depoimento[] = [
  { nome: 'Karen', texto: 'Delicioso demais.', print: 'karen-1', recorte: [0.03, 0.425, 0.63, 0.56], autorizado: true },
  {
    nome: 'Sandra', contexto: 'pão', print: 'Sandra-2', recorte: [0.035, 0.485, 0.75, 0.5], autorizado: true,
    texto: 'Oi Jhessica, passando apenas para agradecer o delicioso pão de ontem a noite. Já me arrisquei comprando em lugares diferentes no passado, por isso, hoje posso afirmar, que o seu pãozinho sem glúten é o meu favorito, e da minha família também.',
  },
  {
    nome: 'Sueide', contexto: 'bolo de chocolate', print: 'Sueide-3', recorte: [0.03, 0.365, 0.69, 0.53], autorizado: true,
    texto: 'Jhes.. Que bolo de chocolate maravilhoso! Tô chocada que ele é saudável e gostoso de verdade. Aqui em casa já virou nosso favorito! Super fofinho e molhadinho. E, claro que, não sobra nada. Obrigada, por adoçar o nosso café da manhã de sábado.',
  },
];

export const depoimentosPublicos = depoimentos.filter((d) => d.autorizado === true);
