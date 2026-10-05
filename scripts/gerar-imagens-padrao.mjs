// npm run imagens · gera as duas imagens fixas do site a partir dos arquivos de origem:
//  - src/assets/images/og-padrao.jpg (1200×630, prévia de link): recorte do poster da hero com a forma da frente no
//    centro, para o quadrado do meio (que o WhatsApp às vezes usa) ainda mostrar o bolo inteiro de chocolate;
//  - public/apple-touch-icon.png (180×180): o favicon sobre o fundo do modo dia (o iOS não aceita transparência).
// As cores saem de src/styles/tokens.css (bloco do modo dia). Rode de novo quando o poster ou o favicon mudarem.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));

// --- prévia de link ---
// No poster (1920×1080) a forma da frente ocupa x ≈ 720–1900 e y ≈ 300–1040: o recorte 1440×756 começa em x = 480 e
// deixa o centro dela perto do centro da imagem; y = 290 mantém a forma inteira na altura.
const RECORTE = { left: 480, top: 290, width: 1440, height: 756 };
const og = await sharp(raiz('public/videos/hero-poster.webp'))
  .extract(RECORTE)
  .resize(1200, 630)
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(raiz('src/assets/images/og-padrao.jpg'));
console.log(`og-padrao.jpg  ${og.width}×${og.height}  ${Math.round(og.size / 1024)} KB`);
if (og.size > 300 * 1024) { console.error('A prévia passou de 300 KB: o WhatsApp pode ignorá-la. Baixe a qualidade.'); process.exitCode = 1; }

// --- ícone da tela inicial (iOS) ---
const tokens = readFileSync(raiz('src/styles/tokens.css'), 'utf8');
const dia = tokens.slice(tokens.indexOf("[data-theme='light']"));
const cor = (nome) => dia.match(new RegExp(`--${nome}:\\s*(#[0-9A-Fa-f]{6})`))?.[1];
const fundo = cor('bg');
if (!fundo) throw new Error('Não achei --bg do modo dia em tokens.css');
// o favicon troca de cor com o tema do sistema; no ícone fica só a cor do dia (sem o @media)
const svg = readFileSync(raiz('public/favicon.svg'), 'utf8').replace(/@media[^{]*\{[^{}]*\{[^}]*\}[^{}]*\{[^}]*\}\s*\}/, '');
const marca = await sharp(Buffer.from(svg), { density: 600 }).resize(148, 148).png().toBuffer();
const icone = await sharp({ create: { width: 180, height: 180, channels: 4, background: fundo } })
  .composite([{ input: marca, gravity: 'center' }])
  .png()
  .toFile(raiz('public/apple-touch-icon.png'));
console.log(`apple-touch-icon.png  ${icone.width}×${icone.height}  ${Math.round(icone.size / 1024)} KB`);
