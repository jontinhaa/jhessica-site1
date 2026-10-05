# Onde colocar as fotos do site

Todas as fotos ficam em `src/assets/images/`, cada uma na sua pasta e com um nome fixo.
O site encontra a foto pelo nome: não precisa mexer em código.

- Formato: **.jpg, .jpeg, .png ou .webp**. Não precisa converter nem diminuir: o site otimiza sozinho.
- Tamanho: de preferência **1600 px de largura ou mais** (prints de conversa podem ser menores).
- Nome: **exatamente** como na tabela, em minúsculas, sem acento e sem espaço (`capa.jpg`, não `Capa Bolo.jpg`).
- Uma foto por nome: se houver `capa.jpg` e `capa.png` na mesma pasta, apague uma.
- Enquanto a foto não existir, o site mostra um quadro de espera no lugar. Nada quebra.

## As pastas

| Pasta | Arquivos | Obrigatória? |
| --- | --- | --- |
| `produtos/{produto}/` | `capa` (a foto principal do produto) | sim |
| | `corte` (o bolo ou pão cortado, mostrando o miolo) | não |
| | `extra-1`, `extra-2`, `extra-3` (outros ângulos, detalhes) | não |
| `cardapio/` | `bolos`, `paes`, `fatias`, `brigadeiros`, `bento` (as capas dos blocos da vitrine na home) | sim |
| `bento/` | `destaque` (a foto grande da seção Bento Cake) | sim |
| | `modelo-1`, `modelo-2`, `modelo-3` (bentos já feitos, como inspiração) | não |
| `ingredientes/` | `destaque` (a foto da seção Ingredientes; não pode mostrar manteiga, leite nem trigo) | sim |
| `sobre/` | `jhessica` (retrato da Jhessica) | sim |
| | `jhessica-cozinha` (ela trabalhando) | não |
| `depoimentos/` | o print original da conversa, com o nome indicado em `src/data/depoimentos.ts` (ex.: `karen-1`). **O site não o usa:** rode `npm run prints` para gerar `depoimentos/balao/<nome em minúsculas>.webp`, só com o balão da mensagem (sem foto de perfil, nome nem telefone do contato), e confira o resultado | sim, a cópia em `balao/`, se o depoimento estiver autorizado |

A quantidade de modelos do Bento muda em `src/data/site.ts` (`fotosBento.modelos`).

### As pastas de produto

Uma pasta por produto, com o mesmo código usado em `src/data/cardapio.ts`:

`bolo-de-maca` · `bolo-de-laranja` · `bolo-de-chocolate` · `bolo-de-cenoura` · `bolo-de-maracuja` ·
`pao-de-batata-doce` · `pao-de-graos` · `pao-de-cebola` · `fatia-limao-frutas-vermelhas` · `fatia-chocolate-matilda` ·
`fatia-maracuja` · `caixa-de-brigadeiros` · `bento-cake`

Exemplo: a foto principal do bolo de chocolate vai em `src/assets/images/produtos/bolo-de-chocolate/capa.jpg`.
Produto novo no cardápio? Crie a pasta com o código dele; o verificador já passa a cobrar a capa.

## Fotos provisórias

Algumas pastas têm um `FONTES-PROVISORIAS.md`: são fotos de banco ou geradas, usadas só enquanto as reais não chegam.
Para trocar, salve a foto real com o mesmo nome, apague a provisória e tire a linha dela do `FONTES-PROVISORIAS.md`
(quando não sobrar nenhuma, apague o arquivo).

## Conferir

```
npm run fotos
```

Mostra, pasta por pasta, o que está no lugar e o que falta:

- `✓` foto no lugar
- `✗` obrigatória faltando
- `!` está lá, mas precisa de atenção (provisória, pequena demais ou repetida)
- `·` opcionais que faltam (não impedem a publicação)
- `?` arquivo com nome fora da convenção (o site não usa)

Antes de publicar: nenhuma obrigatória pode faltar e nenhuma provisória pode continuar.
