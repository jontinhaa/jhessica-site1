// /sitemap.xml · só as páginas que devem aparecer no Google: a home e o /pedido.
// Ficam fora: /p/{id} (prévias de link, com noindex), a 404 e o /design-system (que nem existe no build).
// Com PUBLIC_NOINDEX=true (deploy de teste) sai vazio: nada do teste deve ir para o Google.
// URLs absolutas a partir de SITE_URL (Astro.site) e do `base`. Sem SITE_URL (build local), usa localhost só para não
// quebrar o build; em produção SITE_URL é obrigatório (docs/LANCAMENTO.md).
import type { APIRoute } from 'astro';
import { url } from '../lib/url';

const paginas = import.meta.env.PUBLIC_NOINDEX === 'true' ? [] : ['/', '/pedido/'];

export const GET: APIRoute = ({ site }) => {
  const base = site ?? 'http://localhost:4321';
  const itens = paginas.map((p) => `  <url><loc>${new URL(url(p), base).href}</loc></url>\n`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${itens}</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
