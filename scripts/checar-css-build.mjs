// Roda no fim do `npm run build` (e por ele no deploy): confere no CSS minificado as animações presas à rolagem.
// O minificador já corrompeu dois atalhos: `animation-range: contain 0% cover 100%` virou `contain cover 0%` (o efeito
// acabava antes de começar e os cards da hero ficavam apagados) e `animation` + `animation-timeline` virou um atalho que
// o Chrome rejeita. Por isso o código usa longhands (ver CLAUDE.md) e este script falha se algo assim voltar.
import { readdirSync, readFileSync } from 'node:fs';

// regras com animation-range-* no código: Hero 4, Como pedir 3, Bento 1, global.css 3 ([data-clip]), Sobre 2.
// Criou ou removeu uma? Atualize este número.
const ESPERADAS = 13;

const dir = new URL('../dist/_astro/', import.meta.url);
const css = readdirSync(dir).filter((f) => f.endsWith('.css')).map((f) => readFileSync(new URL(f, dir), 'utf8')).join('\n');
const regras = [...css.matchAll(/([^{}]+)\{([^{}]*(?:animation-(?:range|timeline)|animation:[^;{}]*(?:view|scroll)\()[^{}]*)\}/g)]
  .map(([, seletor, corpo]) => ({ seletor: seletor.trim(), corpo }));
const valor = (corpo, prop) => corpo.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:([^;]*)`))?.[1].trim();

const erros = [];
let comIntervalo = 0;
console.log('animações presas à rolagem no CSS do build:');
for (const { seletor, corpo } of regras) {
  const fim = valor(corpo, 'animation-range-end') ?? valor(corpo, 'animation-range');
  const props = ['animation-timeline', 'animation-range', 'animation-range-start', 'animation-range-end']
    .map((p) => [p, valor(corpo, p)]).filter(([, v]) => v !== undefined);
  if (props.some(([p]) => p.startsWith('animation-range'))) comIntervalo++;
  console.log(`  ${seletor}\n    ${props.map(([p, v]) => `${p}: ${v}`).join('; ')}`);
  if (fim?.split(',').some((v) => /(cover|exit) 0%$/.test(v.trim()))) erros.push(`${seletor}: o intervalo termina em "${fim}" (fim zerado)`);
  // atalho `animation` com linha do tempo dentro (view(), scroll() ou --nome fora de var()): o Chrome descarta
  const atalho = valor(corpo, 'animation')?.replace(/var\([^)]*\)/g, '');
  if (atalho && /view\(|scroll\(|(^|[\s,])--[\w-]+/.test(atalho)) erros.push(`${seletor}: atalho "animation: ${valor(corpo, 'animation')}" com linha do tempo`);
}
if (comIntervalo !== ESPERADAS) erros.push(`${comIntervalo} regras com animation-range-* no build; esperadas ${ESPERADAS}`);

if (erros.length) {
  console.error(`\n✗ CSS do build com animação presa à rolagem corrompida:\n  ${erros.join('\n  ')}`);
  process.exit(1);
}
console.log(`\n✓ ${comIntervalo} regras com intervalo, nenhum fim zerado, nenhum atalho com linha do tempo`);
