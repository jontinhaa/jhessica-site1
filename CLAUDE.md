## Projeto · Jhessica Confeitaria Artesanal

Site one-page em Astro 7 (estático), português do Brasil, modo dia e noite.

**Referência visual de tudo:** `templates/design_system.astro`, visível em `/design-system` com o dev rodando
(convertido de `../design_system2.html`). Tokens, tipografia, componentes, layout e movimento do site saem de lá.
A hero segue a seção "0 · HERO" dele, com vídeo no lugar da foto dia/noite. As fotos previstas e a direção de arte estão em
`../.briefing/design-system-2.md`; o template as procura em `public/images/ds2/`.
**Página /design-system é só de desenvolvimento; nunca publicar.** Ela tem produtos, preços e avaliação fictícios.
A rota é injetada em `astro.config.mjs` apenas quando o comando é `dev` (não existe arquivo em `src/pages/`),
então `npm run build` não a gera. Não linkar para ela em nenhuma página.

### Estrutura

```
templates/
  design_system.astro    design system vivo em /design-system, só no dev (CSS global e scripts inline de propósito)
src/
  styles/tokens.css      cores dia/noite e tokens fixos (copiados do design system, não inventar valores)
  styles/global.css      reset, fundo com grão, tipografia (.h1…, .lead, .eyebrow, .hand…), superfícies (.panel, .glass…),
                         .tag, .link-r, placeholder .ph e o revelar [data-rv]
  data/site.ts           marca, seo, contato/redes, regrasPedido, secoes (ordem da home) e menu
  data/cardapio.ts       categorias (nome, tipo, chamada) e produtos (variantes, adicionais, opções), precoMinimo, formatarPreco
  assets/images/cardapio/  fotos da vitrine ({categoria}.jpg|webp) + FONTES-PROVISORIAS.md
  layouts/BaseLayout     <head>, fontes, tema sem piscar, fundo, Header, Footer e o script do [data-rv]
  components/layout/     Header (nav de vidro + gaveta com foco preso), Footer
  components/ui/         Button, Icon, Logo, ThemeSwitch, Doodle, SectionHeading
  components/sections/   Hero + uma seção por item de `secoes` (hoje esqueletos com título e âncora)
  pages/index.astro      Hero + seções percorrendo `secoes`
  pages/pedido.astro     cardápio completo (placeholder; âncoras #bolos #paes #fatias #brigadeiros #bento)
  pages/404.astro
```

### Convenções

- Cores só por token (`var(--accent)`, `var(--ink)`…). Tema é escopo: `data-theme="dark"` num bloco força a noite nele.
- Estilo de componente fica no `<style>` do próprio componente; `global.css` só guarda o que é compartilhado.
- Fontes pela API de fontes do Astro (`astro.config.mjs`), variáveis `--font-serif/-sans/-poster/-hand`.
  Serif é a Newsreader: a Cormorant solta o circunflexo (ê, â, ô), não voltar para ela.
- Ícones: `<Icon name="solar:…" />` (Solar Linear) ou `simple-icons:…` para redes. SVG gerado no build.
- Rabiscos: `<Doodle name="batedor" />`, no máximo um por dobra de tela.
- Conteúdo repetido (produtos, depoimentos) vem de dados, não escrito à mão no markup.
- Seção nova da home: item em `secoes` (site.ts) + componente em `pages/index.astro`. Número do sobretítulo = posição.
  Links internos sempre `/#id` (funcionam fora da home). Produto e preço só em `data/cardapio.ts`.
- Toda animação precisa respeitar `prefers-reduced-motion`.
- Entrada de bloco: `data-rv` (sobe 44px e aparece em 1.2s, cascata de 80ms; só fade com movimento reduzido). É CSS +
  IntersectionObserver no BaseLayout, sem GSAP. `data-seat` do DS ainda não foi portado.
- Foto de produto: `<Image />` de `astro:assets` a partir de `src/assets/images/…`; se o arquivo faltar, o bloco usa
  `.ph.ph-empty` com `data-ph` (nome esperado) e o build não quebra.
- Rodar `npm run check` e `npm run build` antes de dar uma tarefa por concluída.
- Vídeo da hero: `public/videos/hero-1080.mp4` (≥768px), `hero-retrato.mp4` (9:16) e `hero-poster.webp`, gerados de
  `../assets/videos/final_4k60.mp4` (master, fora do git e do build) com ffmpeg: `-vf "fps=30,scale=1920:1080"` e `-vf "fps=30,crop=1216:2160:1946:0,scale=720:1280"`,
  ambos `-an -c:v libx264 -preset slower -tune film -x264-params aq-mode=3 -crf 29 -pix_fmt yuv420p -movflags +faststart`.
  Sobre vídeo, vidro com texto usa `--glass-strong` (o `--glass` de 4% só aguenta foto escura e parada).

### Próximos passos (quando formos desenvolver)

1. ~~Hero completa~~ feita (vídeo, véus, cards de vidro, açúcar em canvas, letras 3D, faixa corrente). Parallax e
   entrada dela são CSS nativo (scroll-driven animations), sem GSAP.
2. Instalar `gsap` e `lenis` só quando a primeira cena fixada (ritual horizontal, camadas) for construída.
3. Fotos: gerar pelo briefing, salvar em `src/assets/images/` e usar `<Image />` do `astro:assets`.

### Pendências de lançamento (não publicar sem resolver)

- **Fotos da vitrine do Cardápio são PROVISÓRIAS** (3 geradas para o DS + 2 do Unsplash, ver
  `src/assets/images/cardapio/FONTES-PROVISORIAS.md`): substituir pelas fotos reais da Jhessica e ajustar os `alt`.
- Página /design-system não pode ir para produção (já garantido: a rota só existe no dev).
4. Preencher `contact` em `src/data/site.ts` e definir o destino do formulário de encomenda.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
