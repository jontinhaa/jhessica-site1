// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { loadEnv } from 'vite';

// Fontes do design system (../design_system2.html), baixadas e servidas pelo próprio Astro.
const google = fontProviders.google();

// /design-system (referência com produtos, preços e avaliação fictícios) só existe em `astro dev`:
// a rota é injetada apenas nesse comando, então o build nem a conhece (sem página, sem sitemap).
/** @type {import('astro').AstroIntegration} */
const designSystemSoEmDev = {
  name: 'design-system-so-em-dev',
  hooks: {
    'astro:config:setup': ({ command, injectRoute }) => {
      if (command === 'dev') injectRoute({ pattern: '/design-system', entrypoint: new URL('./templates/design_system.astro', import.meta.url) });
    },
  },
};

// No dev, o endereço da foto (/_image?href=…/capa.jpg) não muda quando o arquivo é trocado, e o Astro manda guardar
// por um ano: o navegador seguia mostrando a foto antiga. Aqui o dev pede para não guardar. No build não precisa,
// porque os arquivos ganham hash no nome.
/** @type {import('astro').AstroIntegration} */
const fotosSemCacheNoDev = {
  name: 'fotos-sem-cache-no-dev',
  hooks: {
    'astro:server:setup': ({ server }) => {
      // tipos soltos de propósito: o projeto não depende dos tipos do Node (@types/node)
      server.middlewares.use((/** @type {any} */ req, /** @type {any} */ res, /** @type {() => void} */ next) => {
        if (req.url?.includes('/_image?')) {
          // o Astro pode mandar o cabeçalho por setHeader ou dentro do objeto do writeHead: troca nos dois caminhos
          const semCache = (/** @type {string} */ nome, /** @type {unknown} */ valor) => (nome.toLowerCase() === 'cache-control' ? 'no-store' : valor);
          const definir = res.setHeader.bind(res);
          res.setHeader = (/** @type {string} */ nome, /** @type {unknown} */ valor) => definir(nome, semCache(nome, valor));
          const escrever = res.writeHead.bind(res);
          res.writeHead = (/** @type {number} */ status, /** @type {any[]} */ ...resto) => {
            const cabecalhos = resto.find((a) => a && typeof a === 'object' && !Array.isArray(a));
            if (cabecalhos) for (const nome of Object.keys(cabecalhos)) cabecalhos[nome] = semCache(nome, cabecalhos[nome]);
            return escrever(status, ...resto);
          };
        }
        next();
      });
    },
  },
};

// site/base por variável de ambiente: padrão "/" (local e domínio futuro); o deploy de teste no GitHub Pages usa
// SITE_URL=https://jontinhaa.github.io e BASE_PATH=/jhessica-site1/ (.github/workflows/deploy.yml).
// lidas com o loadEnv do Vite (ambiente + .env), sem depender dos tipos do Node
const env = loadEnv('', '.', '');
export default defineConfig({
  site: env.SITE_URL || undefined,
  base: env.BASE_PATH || '/',
  integrations: [designSystemSoEmDev, fotosSemCacheNoDev],
  fonts: [
    {
      provider: google,
      name: 'Newsreader',
      cssVariable: '--font-serif',
      weights: ['300 600'],
      styles: ['normal', 'italic'],
      fallbacks: ['Georgia', 'serif'],
      options: { experimental: { variableAxis: { opsz: [['6', '72']] } } },
    },
    {
      provider: google,
      name: 'Hanken Grotesk',
      cssVariable: '--font-sans',
      weights: ['300 700'],
      styles: ['normal'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: google,
      name: 'Archivo',
      cssVariable: '--font-poster',
      weights: [800],
      styles: ['normal'],
      fallbacks: ['Arial Narrow', 'sans-serif'],
      options: { experimental: { variableAxis: { wdth: [['62', '100']] } } },
    },
    {
      provider: google,
      name: 'La Belle Aurore',
      cssVariable: '--font-hand',
      weights: [400],
      styles: ['normal'],
      fallbacks: ['cursive'],
    },
  ],
});
