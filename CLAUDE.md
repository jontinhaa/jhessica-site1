## Projeto · Jhessica Confeitaria Artesanal

Site one-page em Astro 7 (estático), português do Brasil, modo dia e noite.

**Referência visual de tudo:** `templates/design_system.astro`, visível em `/design-system` com o dev rodando
(convertido de `../design_system2.html`). Tokens, tipografia, componentes, layout e movimento do site saem de lá.
A hero segue a seção "0 · HERO" dele. As fotos previstas e a direção de arte estão em
`../.briefing/design-system-2.md`; o template as procura em `public/images/ds2/`.
A rota `src/pages/design-system.astro` é só para desenvolvimento: remover antes de publicar.

### Estrutura

```
templates/
  design_system.astro    design system vivo (página de referência, CSS global e scripts inline de propósito)
src/
  styles/tokens.css      cores dia/noite e tokens fixos (copiados do design system, não inventar valores)
  styles/global.css      reset, fundo com grão, tipografia (.h1…, .lead, .eyebrow, .hand…), superfícies (.panel, .glass…)
  data/site.ts           marca, navegação, CTA e contato: Header/Footer/SEO leem daqui
  layouts/BaseLayout     <head>, fontes, tema sem piscar, fundo, Header e Footer
  components/layout/     Header (nav de vidro + gaveta), Footer
  components/ui/         Button, Icon, Logo, ThemeSwitch, Doodle, SectionHead
  components/sections/   uma seção por arquivo, na ordem de pages/index.astro (hoje são esqueletos)
  pages/index.astro      ordem das seções
  pages/design-system.astro  rota de referência (só desenvolvimento)
```

### Convenções

- Cores só por token (`var(--accent)`, `var(--ink)`…). Tema é escopo: `data-theme="dark"` num bloco força a noite nele.
- Estilo de componente fica no `<style>` do próprio componente; `global.css` só guarda o que é compartilhado.
- Fontes pela API de fontes do Astro (`astro.config.mjs`), variáveis `--font-serif/-sans/-poster/-hand`.
  Serif é a Newsreader: a Cormorant solta o circunflexo (ê, â, ô), não voltar para ela.
- Ícones: `<Icon name="solar:…" />` (Solar Linear) ou `simple-icons:…` para redes. SVG gerado no build.
- Rabiscos: `<Doodle name="batedor" />`, no máximo um por dobra de tela.
- Conteúdo repetido (produtos, depoimentos) vem de dados, não escrito à mão no markup.
- Toda animação precisa respeitar `prefers-reduced-motion`.
- Rodar `npm run check` e `npm run build` antes de dar uma tarefa por concluída.

### Próximos passos (quando formos desenvolver)

1. Hero completa (foto dia/noite, véus, cards de vidro, açúcar em canvas, letras 3D).
2. Instalar `gsap` e `lenis` só quando a primeira seção com parallax/cena fixada for construída.
3. Fotos: gerar pelo briefing, salvar em `src/assets/images/` e usar `<Image />` do `astro:assets`.
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
