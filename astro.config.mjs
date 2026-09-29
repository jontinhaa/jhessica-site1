// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// Fontes do design system (../design_system2.html), baixadas e servidas pelo próprio Astro.
const google = fontProviders.google();

export default defineConfig({
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
