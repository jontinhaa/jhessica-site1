// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// Fontes do design system (../design_system2.html), baixadas e servidas pelo próprio Astro.
const google = fontProviders.google();

// /design-system (referência com produtos, preços e avaliação fictícios) só existe em `astro dev`:
// a rota é injetada apenas nesse comando, então o build nem a conhece (sem página, sem sitemap).
const designSystemSoEmDev = {
  name: 'design-system-so-em-dev',
  hooks: {
    'astro:config:setup': ({ command, injectRoute }) => {
      if (command === 'dev') injectRoute({ pattern: '/design-system', entrypoint: new URL('./templates/design_system.astro', import.meta.url) });
    },
  },
};

export default defineConfig({
  integrations: [designSystemSoEmDev],
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
