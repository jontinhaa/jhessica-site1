// npm run fotos · confere as fotos esperadas em src/assets/images/ (convenção em docs/FOTOS.md).
// Lê os ids de cardapio.ts, os prints de depoimentos.ts e a quantidade de modelos do Bento em site.ts.
// Sai com código 1 se faltar foto obrigatória ou se ainda houver provisória (listada em FONTES-PROVISORIAS.md).
// Precisa de Node ≥ 23.6 (importa os .ts direto, sem compilar).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { categorias, produtos } from '../src/data/cardapio.ts';
import { depoimentosPublicos } from '../src/data/depoimentos.ts';
import { fotosBento } from '../src/data/site.ts';

const RAIZ = fileURLToPath(new URL('../src/assets/images/', import.meta.url));
const EXT = /\.(jpe?g|png|webp)$/i;
const MIN = 1600; // largura mínima recomendada das fotos
const MIN_PRINT = 720; // prints de conversa são menores

// [pasta, [nome, obrigatória, largura mínima]]
const grupos = [
  ...produtos.map((p) => [`produtos/${p.id}`, [['capa', true], ['corte', false], ['extra-1', false], ['extra-2', false], ['extra-3', false]]]),
  ['cardapio', categorias.map((c) => [c.id, true])],
  ['bento', [['destaque', true], ...Array.from({ length: fotosBento.modelos }, (_, i) => [`modelo-${i + 1}`, false])]],
  ['ingredientes', [['destaque', true]]],
  ['sobre', [['jhessica', true], ['jhessica-cozinha', false]]],
  ['depoimentos', depoimentosPublicos.filter((d) => d.print).map((d) => [d.print, true, MIN_PRINT])],
];

const largura = 46;
const linha = (s, caminho, nota) => console.log(`  ${s} ${caminho.padEnd(largura)} ${nota}`);
let obrig = 0, obrigOk = 0, opc = 0, opcOk = 0, faltando = 0, provisorias = 0, avisos = 0;

for (const [pasta, itens] of grupos) {
  if (!itens.length) continue;
  const dir = RAIZ + pasta;
  const arquivos = existsSync(dir) ? readdirSync(dir).filter((f) => EXT.test(f)) : [];
  const fontes = existsSync(`${dir}/FONTES-PROVISORIAS.md`) ? readFileSync(`${dir}/FONTES-PROVISORIAS.md`, 'utf8') : '';
  const provisoria = (f) => new RegExp(`^\\|\\s*${f.replace('.', '\\.')}\\s*\\|`, 'm').test(fontes);
  const usados = new Set();
  const opcFaltando = [];
  console.log(`\n${pasta}/`);

  for (const [nome, obrigatoria, min = MIN] of itens) {
    obrigatoria ? obrig++ : opc++;
    const achados = arquivos.filter((f) => f.replace(EXT, '').toLowerCase() === nome);
    achados.forEach((f) => usados.add(f));
    if (!achados.length) {
      if (obrigatoria) { faltando++; linha('✗', `${pasta}/${nome}`, '(faltando)'); }
      else opcFaltando.push(nome);
      continue;
    }
    const f = achados[0];
    const { width, height } = await sharp(`${dir}/${f}`).metadata();
    const prov = provisoria(f);
    if (prov) provisorias++; else obrigatoria ? obrigOk++ : opcOk++; // provisória não conta como "no lugar"
    const notas = [];
    if (prov) notas.push('provisória — ver FONTES-PROVISORIAS.md');
    if (width < min) notas.push(`só ${width}px de largura — mínimo recomendado ${min}px`);
    if (achados.length > 1) notas.push(`${achados.length} arquivos com esse nome (${achados.join(', ')}): deixe um só`);
    if (notas.length) avisos++;
    linha(notas.length ? '!' : '✓', `${pasta}/${f}`, `(${width}×${height}${notas.length ? ' · ' + notas.join(' · ') : ''})`);
  }
  if (opcFaltando.length) linha('·', `${pasta}/${opcFaltando.join(', ')}`, '(opcionais, faltando)');
  for (const f of arquivos.filter((f) => !usados.has(f))) { avisos++; linha('?', `${pasta}/${f}`, '(nome fora da convenção: não é usado)'); }
}

console.log(`\n${obrigOk} de ${obrig} fotos obrigatórias no lugar · ${opcOk} de ${opc} opcionais`);
if (faltando || provisorias) {
  console.log(`Ainda não dá para publicar: ${faltando} obrigatória(s) faltando, ${provisorias} provisória(s) para trocar.`);
  process.exitCode = 1;
} else console.log(avisos ? `Pronto para publicar (${avisos} aviso(s) acima).` : 'Pronto para publicar.');
