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
  data/site.ts           marca, seo, contato/redes, regrasPedido, entregaConfirmada, passosPedido, conservacao, compromisso (+ textoAcucar),
                         rotulosAlergenos,
                         secoes (ordem da home) e menu. Só IMPORTA TIPOS do cardápio: scripts do navegador leem este arquivo
  data/promessa.ts       promessa de glúten e leite tirada do cardápio (comAveia): promessaFrase ("sem leite e sem glúten, exceto …"),
                         promessaCurta ("sem leite · sem trigo"), descricaoSite, textoCozinha, fraseTracos. Sem aveia, volta a
                         "sem glúten e sem leite". Nenhum .astro escreve "sem glúten" à mão (tests/cardapio.test.mjs trava)
  data/cardapio.ts       categorias e produtos (variantes, opções com alérgenos, contem/podeConter), precoMinimo, emBreve,
                         formatarPreco, getImagensProduto (produtos/{id}/capa|corte|extra-N). `todasCategorias`/`todosProdutos`
                         são os dados completos; `categorias`/`produtos` (o que o site lê) já vêm sem as categorias `oculta: true`.
                         Fatias está OCULTA até as fotos chegarem: apague `oculta` e vitrine, /pedido, textos e fotos voltam sozinhos
  assets/images/cardapio/  fotos da vitrine ({categoria}.jpg|webp) + FONTES-PROVISORIAS.md
  assets/images/ingredientes/  destaque.jpg + FONTES-PROVISORIAS.md
  assets/images/produtos/{id}/, bento/, sobre/, depoimentos/  fotos por convenção de nome (docs/FOTOS.md)
  data/depoimentos.ts    falas dos clientes (só `autorizado: true` vai ao ar) + recorte do balão de cada print
  scripts/recortar-prints.mjs  npm run prints: recorta SÓ o balão de cada print em depoimentos/balao/ (o original, com foto e nome
                         do contato, nunca é importado pelo site)
  data/perguntas.ts      perguntas frequentes; respostas montadas dos dados (regrasPedido, compromisso, conservacao, cardápio);
                         `pendente` oculta a pergunta
  scripts/checar-fotos.mjs  npm run fotos: confere as fotos esperadas
  scripts/gerar-imagens-padrao.mjs  npm run imagens: refaz og-padrao.jpg (prévia de link) e public/apple-touch-icon.png
  components/pedido/     ProdutoCard (card .produto) e ProdutoPainel (<dialog> "Detalhes", um por produto, abre com
                         [data-abrir="{id}"] ou ?produto={id}; o voltar do navegador fecha)
  pages/p/[id].astro     uma página por produto (/p/{id}) só para a prévia do link (og:*), que redireciona ao /pedido?produto={id}
  scripts/compartilhar.ts  botão "Compartilhar" do card e do painel: folha nativa, senão copia (toast) e, se falhar, mostra o link num campo
  lib/pedido/compartilhar.ts  linkProduto, textoCompartilhar, dadosCompartilhar (puros, testados)
  lib/absoluta.ts        urlAbsoluta (og:image precisa de endereço absoluto; Astro.site vem de SITE_URL)
  lib/seo.ts             JSON-LD da home (Bakery) a partir de site.ts e do cardápio; sem avaliação/nota (tests/seo.test.mjs)
  pages/sitemap.xml.ts, pages/robots.txt.ts  endpoints estáticos: sitemap só com home e /pedido; com PUBLIC_NOINDEX, sitemap vazio e robots sem sitemap (o noindex das páginas é que segura)
  components/pedido/Sacola.astro  sacola em <dialog class="folha"> (comanda → como receber → enviado), barra do celular
  lib/pedido/            lógica pura e testada: itens (chave), precos (sempre do cardápio), prazos (datas), mensagem (WhatsApp)
  scripts/sacola.ts      estado da sacola no localStorage "jhessica:sacola:v1" (só itens e nome; endereço nunca)
  scripts/folha.ts       tocar fora / arrastar a alça para fechar os <dialog class="folha">  ·  scripts/tilt.ts  tilt 3D
  tests/                 npm test (node:test, importa os .ts direto; Node ≥ 23.6)
  layouts/BaseLayout     <head>, fontes, tema sem piscar, fundo, Header, Footer e o script do [data-rv]
  components/layout/     Header (nav de vidro + gaveta com foco preso), Footer, Carregando (tela "o forno preaquecendo" do DS:
                         só na home, uma vez por sessão via <html data-forno> + html.carregando; pausa a entrada da hero)
  components/ui/         Button, Icon, Logo, ThemeSwitch, Doodle, Carimbo (texto girando; Bento e Contato), SectionHeading,
                         CenaIngrediente (verso de "O que entra"),
                         PedidoFlutuante (pílula "Fazer pedido" até 1180px; esconda-a com data-esconde-pilula)
  components/sections/   Hero + uma seção por item de `secoes` (Sobre: retrato `sobre/jhessica.png` que "sai da forma", máscara de duas camadas com um --blob só; texto em `historia`)
  components/sections/Contato.astro  última dobra (DS .cta-sec): título com letras 3D e círculo à mão em "você", rastro de doces no mouse
                         (leque de fotos no toque), botão magnético, comanda e carimbo. Fotos do cardápio.
  components/sections/FaixaVideo.astro  faixa só de vídeo (o da hero) antes do Contato, com a largura e as bordas do .ticker da hero e o DOBRO da altura dele
                         (altura = 2 × --faixa-h, valor em global.css que também é a altura do .ticker); toca só na tela; o botão de pausar da hero também a pausa
  pages/index.astro      Hero + seções percorrendo `secoes`
  pages/pedido.astro     cardápio completo (âncoras #bolos #paes #brigadeiros #bento; #fatias enquanto a categoria não for oculta)
  pages/404.astro
```

### Convenções

- Cores só por token (`var(--accent)`, `var(--ink)`…). Tema é escopo: `data-theme="dark"` num bloco força a noite nele.
- Estilo de componente fica no `<style>` do próprio componente; `global.css` só guarda o que é compartilhado.
- Fontes pela API de fontes do Astro (`astro.config.mjs`), variáveis `--font-serif/-sans/-poster/-hand`.
  Serif é a Newsreader: a Cormorant solta o circunflexo (ê, â, ô), não voltar para ela.
- Ícones: `<Icon name="solar:…" />` (Solar Linear) ou `simple-icons:…` para redes. SVG gerado no build.
- Rabiscos: `<Doodle name="batedor" />`, no máximo um por dobra de tela (exceções: os cartões de "O que entra" e o Contato, que tem a seta e o carimbo com o batedor, por pedido do cliente).
- Keyframes têm nome GLOBAL no Astro: prefixe os de componente (as cenas usam `c-`) para não colidir com `boil`, `spin`…
- Conteúdo repetido (produtos, depoimentos) vem de dados, não escrito à mão no markup.
- Seção nova da home: item em `secoes` (site.ts) + componente em `pages/index.astro`. Número do sobretítulo = posição.
  Links internos sempre `/#id` (funcionam fora da home). Produto e preço só em `data/cardapio.ts`.
- Toda animação precisa respeitar `prefers-reduced-motion`.
- Promessa ao cliente (sem glúten, sem leite, sem açúcar…) só aparece se o dado estiver confirmado em `compromisso`;
  null = não afirmar. Glúten e leite saem de `data/promessa.ts`: produto ou opção com `'aveia'` (aveia comum) mostra
  "Glúten (aveia comum)", a etiqueta "Leva aveia" e o aviso "não indicado para celíacos", e entra no "exceto …" dos textos gerais.
- Ingredientes: só os nomes que a cliente mandou (nunca receita, quantidade ou print). `ingredientesPendente` guarda a lista
  sem mostrar; `coberturaPendente` mostra "Ingredientes da massa". Os testes conferem a lista contra os alérgenos.
- Parallax de foto: `data-par` em `img.par` dentro de `.media` (CSS preso à rolagem, desligado com movimento reduzido).
- Cena fixada (Como pedir): CSS nativo, sem GSAP/Lenis: `position: sticky` + `animation-timeline` (view-timeline no
  contêiner alto). Sem suporte ou com movimento reduzido, vira grade estática.
- Intervalos de scroll-driven animation sempre com animation-range-start/-end separados (o minificador corrompe o
  shorthand com 'cover 100%'). E nada de atalho `animation:` junto com `animation-timeline`: use longhands
  (animation-name, -duration, -timing-function, -fill-mode, -timeline). `npm run build` roda
  `scripts/checar-css-build.mjs`, que falha se o CSS do build vier corrompido (criou/removeu regra com intervalo:
  atualize ESPERADAS lá).
- `[hidden]` sempre esconde (`display: none !important` no reset): não precisa de regra por componente.
- Elementos criados por script não recebem o escopo do Astro: estilize-os com `:global(...)` preso a um pai do componente.
- Pedido: preço SEMPRE recalculado de cardapio.ts (lib/pedido/precos); mudou regra de prazo ou mensagem, rode `npm test`.
- Recorte que abre (Padrão E): `data-clip` na figura; a foto sai de inset(42%) até a borda enquanto sobe. Combina com
  `data-par` na mesma foto. CSS preso à rolagem; com movimento reduzido a foto já aparece aberta.
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

- **Antes de publicar, rode `npm run fotos`: nenhuma obrigatória pode faltar e nenhuma provisória pode continuar.**
  Convenção de pastas e nomes em `docs/FOTOS.md`.
- **Depoimentos:** só entram falas confirmadas e `autorizado: true`. Print = só o balão (`npm run prints`).
- **Nossa história (`historia` em `site.ts`):** o texto vem do briefing (`.briefing/Briefing_Jhessica_em_Cozinha_Saudavel.docx`, seção 2) e está em primeira pessoa; revisar o texto com a cliente. A data da loja ("desde setembro de 2025") é fixa, sem calcular anos.
- **Aveia comum:** a cliente pode trocar a farinha de aveia do bolo de chocolate (aí sai `'aveia'` do bolo e da fatia Matilda).
  **Bento:** a massa de chocolate conta como aveia até ela responder; a chamada da categoria em `cardapio.ts` é texto fixo e
  volta a "sem glúten e sem leite" à mão. Lista completa de ingredientes pendentes em `docs/LANCAMENTO.md`.
- Ainda a confirmar com a cliente (TODO nos dados): **ingredientes pendentes e frase de descrição de cada produto** (as descrições novas esperam a aprovação dela), textos de "O que entra" e o texto do depoimento da Karen.
  O numeral "0 conservantes" é fixo no componente e também precisa de confirmação.
- **Domínio de produção ainda não escolhido** (a cliente vai decidir): `<domínio>` em `docs/LANCAMENTO.md` e o `SITE_URL` do Cloudflare Pages dependem dele.
- **Prévia de link padrão `src/assets/images/og-padrao.jpg`** (1200×630, gerada por `npm run imagens` a partir do poster da hero, com a forma no centro para o recorte quadrado do WhatsApp): vale na home, no /pedido, na 404 e nos /p/{id} de produto sem `capa`.
- Endereço completo de retirada NUNCA entra no repositório: só o bairro (contato.bairroRetirada).
- **Fotos:** todas as atuais ficaram como definitivas por decisão do Jhonatan (2026-10-06), registrado nos `FONTES-PROVISORIAS.md`
  de cada pasta. Para marcar uma foto como provisória de novo, ponha uma linha `| arquivo | … |` na tabela desse arquivo.
- **Pão de grãos:** a capa é um pão liso, sem grãos; `produtos/pao-de-batata-doce/pao2.jpeg` (girassol e chia) parece ser o
  de grãos. Confirmar com a cliente qual foto é de qual pão.
- Página /design-system não pode ir para produção (já garantido: a rota só existe no dev).
- **No lançamento, remover PUBLIC_NOINDEX.** Hoje o deploy de teste (`.github/workflows/deploy.yml`, GitHub Pages em
  https://jontinhaa.github.io/jhessica-site1/) usa `PUBLIC_NOINDEX=true` e `BASE_PATH=/jhessica-site1/`.
  Links internos sempre por `url()` (`src/lib/url.ts`), nunca `href="/..."` fixo. Publicar: `npm run publicar:teste`
  (subtree split de jhess-site/ + limpeza do histórico + push no remote `github`; nunca no `origin`).
4. Definir o destino do formulário de encomenda (contato já preenchido em `src/data/site.ts`).

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
