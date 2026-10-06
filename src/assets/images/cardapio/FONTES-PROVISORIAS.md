# Fotos da vitrine do Cardápio · definitivas

Nenhuma foto provisória nesta pasta. Para marcar uma foto como provisória de novo, acrescente uma tabela
`| Arquivo | Origem | Autor | Licença |` com uma linha por arquivo: o `npm run fotos` cobra cada linha.
Se um arquivo faltar, o bloco mostra o placeholder do design system e o build não quebra; os `alt` ficam em
`src/components/sections/Cardapio.astro`.

`bolos.jpg` (cópia da capa do bolo de maracujá) e `paes.jpeg` (pão com sementes de abóbora) já eram definitivas.

Fotos mantidas como definitivas por decisão do Jhonatan (2026-10-06):

- `fatias.webp`: mantida como definitiva por decisão do Jhonatan. Gerada para o design system
  (`../assets/images/produto-torta-limao.webp`), IA (Gemini), direção de arte de `.briefing/design-system-2.md`.
- `brigadeiros.jpg`: mantida como definitiva por decisão do Jhonatan. Chegou no commit 29b19f6; foto de estúdio com cara de gerada (IA).
- `bento.jpg`: mantida como definitiva por decisão do Jhonatan. Chegou no commit 29b19f6 (a mesma de `produtos/bento-cake/capa.jpg`).

Observações registradas antes da decisão:
- A categoria Fatias está oculta (`oculta: true` em `src/data/cardapio.ts`): `fatias.webp` não aparece no site até ela voltar.
- `bento.jpg` mostra um bolo redondo de chocolate com morangos e uvas numa embalagem transparente, não um bento cake.
