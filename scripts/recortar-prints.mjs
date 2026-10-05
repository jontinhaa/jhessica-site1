// npm run prints · recorta só o balão de cada print de depoimento (src/data/depoimentos.ts) e grava a cópia em
// src/assets/images/depoimentos/balao/<print>.webp. O original não é alterado nem importado pelo site: a foto de perfil
// e o nome do contato, que aparecem no topo dos prints, não chegam ao site publicado.
// Só os depoimentos autorizados ganham cópia (o que não está autorizado não vai nem para a pasta do site); cópias antigas
// de quem deixou de ser autorizado são apagadas.
// Precisa de Node ≥ 23.6 (importa o .ts direto). Rode de novo quando trocar um recorte, um print ou uma autorização.
import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { depoimentosPublicos } from '../src/data/depoimentos.ts';

const PASTA = fileURLToPath(new URL('../src/assets/images/depoimentos/', import.meta.url));
const SAIDA = `${PASTA}balao/`;
mkdirSync(SAIDA, { recursive: true });

const esperadas = new Set(depoimentosPublicos.filter((x) => x.print).map((x) => `${x.print.toLowerCase()}.webp`));
for (const f of readdirSync(SAIDA)) if (!esperadas.has(f)) { rmSync(`${SAIDA}${f}`); console.log(`- balao/${f} removido (depoimento não autorizado)`); }

let erros = 0;
for (const d of depoimentosPublicos.filter((x) => x.print)) {
  const arquivo = readdirSync(PASTA).find((f) => f.replace(/\.\w+$/, '') === d.print && /\.(jpe?g|png|webp)$/i.test(f));
  if (!arquivo || !d.recorte) {
    console.error(`✗ ${d.print}: ${!arquivo ? 'print não encontrado' : 'sem recorte em depoimentos.ts'}`);
    erros++;
    continue;
  }
  const { width, height } = await sharp(PASTA + arquivo).metadata();
  const [x, y, w, h] = d.recorte;
  const area = { left: Math.round(x * width), top: Math.round(y * height), width: Math.round(w * width), height: Math.round(h * height) };
  const destino = `${SAIDA}${d.print.toLowerCase()}.webp`;
  await sharp(PASTA + arquivo).extract(area).webp({ quality: 88 }).toFile(destino);
  console.log(`✓ ${arquivo} → balao/${d.print.toLowerCase()}.webp (${area.width}×${area.height})`);
}
process.exit(erros ? 1 : 0);
