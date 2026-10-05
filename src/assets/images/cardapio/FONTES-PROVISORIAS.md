# Fotos da vitrine do Cardápio · PROVISÓRIAS

**PROVISÓRIAS — substituir pelas fotos reais da Jhessica antes de publicar.**

Para trocar, salve a foto real com o mesmo nome (`bolos`, `paes`, `fatias`, `brigadeiros`, `bento`; .jpg, .png ou .webp)
e apague a provisória. Se o arquivo faltar, o bloco mostra o placeholder do design system e o build não quebra.
Depois, ajuste o `alt` de cada bloco em `src/components/sections/Cardapio.astro`.

`bolos.jpg` (cópia da capa do bolo de maracujá) e `paes.jpeg` (pão com sementes de abóbora) não estão na lista: já valem.

| Arquivo | Origem | Autor | Licença |
| --- | --- | --- | --- |
| fatias.webp | Gerada para o design system: `../assets/images/produto-torta-limao.webp` | IA (Gemini), direção de arte de `.briefing/design-system-2.md` | própria |
| brigadeiros.jpg | Chegou no commit 29b19f6; foto de estúdio com cara de gerada (IA) | a confirmar | a confirmar |
| bento.jpg | Chegou no commit 29b19f6 (a mesma de `produtos/bento-cake/capa.jpg`) | a confirmar | a confirmar |

Observações:
- A categoria Fatias está oculta (`oculta: true` em `src/data/cardapio.ts`): `fatias.webp` não aparece no site até ela voltar.
- `bento.jpg` mostra um bolo redondo de chocolate com morangos e uvas numa embalagem transparente, não um bento cake.
