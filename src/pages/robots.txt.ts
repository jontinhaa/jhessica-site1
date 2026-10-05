// /robots.txt · em produção libera o rastreio e aponta para o sitemap. Com PUBLIC_NOINDEX=true (deploy de teste) libera
// também, mas sem sitemap: um "Disallow: /" impediria o Google de abrir as páginas e ler o <meta name="robots"
// content="noindex"> do BaseLayout, e uma URL linkada em outro lugar poderia entrar no índice só com o endereço.
// É o noindex das páginas que mantém o teste fora do Google. (O Google só lê robots.txt na raiz do domínio; no GitHub
// Pages de teste, em subpasta, este arquivo nem vale.)
import type { APIRoute } from 'astro';
import { url } from '../lib/url';

export const GET: APIRoute = ({ site }) => {
  const texto = import.meta.env.PUBLIC_NOINDEX === 'true'
    ? 'User-agent: *\nAllow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${new URL(url('/sitemap.xml'), site ?? 'http://localhost:4321').href}\n`;
  return new Response(texto, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
