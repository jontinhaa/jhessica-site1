# Lançamento no Cloudflare Pages

Passo a passo para colocar o site no ar com domínio próprio. Hoje existe só o deploy de teste no GitHub Pages
(https://jontinhaa.github.io/jhessica-site1/, fora do Google).

> **Pendente:** a cliente ainda vai escolher o domínio. Onde aparece `<domínio>` (por exemplo `jhessicaemcozinha.com.br`),
> troque pelo escolhido.

## 1. Criar o projeto no Cloudflare Pages

1. Crie a conta em https://dash.cloudflare.com (o plano gratuito permite uso comercial).
2. **Workers e Pages → Criar → Pages → Conectar ao Git** e escolha o repositório **`jontinhaa/jhessica-site1`**.
   É o que o `npm run publicar:teste` atualiza: só a pasta do site, sem o vídeo master e sem o e-mail pessoal no histórico.
   O site fica na raiz desse repositório.
3. Configuração de build:

| Campo | Valor |
| --- | --- |
| Branch de produção | `main` |
| Predefinição de framework | Astro |
| Comando de build | `npm run build` |
| Pasta de saída | `dist` |
| Diretório raiz | (vazio) |

4. **Variáveis de ambiente** (Configurações → Variáveis e segredos, ambiente **Produção**):

| Variável | Valor |
| --- | --- |
| `NODE_VERSION` | `22` |
| `SITE_URL` | `https://<domínio>` |
| `BASE_PATH` | `/` |

   **Não** crie `PUBLIC_NOINDEX` em produção. Com ela, o site inteiro sai do Google: as páginas recebem `noindex`, o
   sitemap sai vazio e o robots.txt deixa de apontar para ele.

5. Salve e faça o primeiro deploy. O Cloudflare dá um endereço `*.pages.dev` para conferir antes do domínio.

> Depois do lançamento, cada `npm run publicar:teste` atualiza **também a produção**, porque é o mesmo repositório.
> O GitHub Pages de teste continua recebendo o mesmo push.

## 2. Apontar o domínio do registro.br para o Cloudflare

1. No Cloudflare: **Adicionar site** → digite `<domínio>` → plano **Free**. Ele mostra **dois servidores DNS**
   (algo como `xxx.ns.cloudflare.com`).
2. No https://registro.br: entre na conta → clique no domínio → **DNS → Alterar servidores DNS** → cole os dois
   servidores do Cloudflare → salve.
3. Espere o Cloudflare marcar o domínio como **Ativo**. Costuma levar menos de uma hora, mas pode chegar a 24 h.
4. No projeto do Pages: **Domínios personalizados → Configurar** → adicione `<domínio>` e também `www.<domínio>`.
   O Cloudflare cria os registros DNS e o certificado HTTPS sozinho.

## 3. Web Analytics (sem código)

No projeto do Pages: **Métricas → Web Analytics → Ativar**. O Cloudflare injeta o script no deploy, sem mexer no código.
Ele não usa cookies nem guarda dado pessoal, por isso não precisa de aviso de cookies.

## 4. Google Search Console

1. Em https://search.google.com/search-console → **Adicionar propriedade → Domínio** → `<domínio>`.
2. O Google mostra um registro **TXT**. No Cloudflare: **DNS → Registros → Adicionar** → tipo `TXT`, nome `@`,
   conteúdo colado do Google → salve.
3. Volte ao Search Console e clique em **Verificar**. Se não verificar na hora, espere alguns minutos e tente de novo.
4. **Sitemaps** → envie `https://<domínio>/sitemap.xml`. O sitemap tem só a home e o /pedido.

## 5. Lista final antes de publicar

Rode na pasta `jhess-site/`:

- [ ] `npm run fotos`: nenhuma obrigatória faltando e **nenhuma provisória** (todas as `FONTES-PROVISORIAS.md` resolvidas).
- [ ] `npm test`: tudo passando.
- [ ] `npm run build`: build sem erro.
- [ ] `npm audit`: nenhuma vulnerabilidade alta ou crítica.
- [ ] **Número do WhatsApp real** em `src/data/site.ts` (`contato.whatsapp` e `whatsappExibicao`): mande uma mensagem de
      teste pelo botão do site e confira que chega no celular da cliente.
- [ ] **/design-system fora do build:** a pasta `dist/` não pode ter `design-system` (a rota só existe no `npm run dev`).
- [ ] **Revisão das promessas** com a cliente: preços e prazos (`cardapio.ts`, `regrasPedido`), "sem glúten e sem leite na
      receita", traços da cozinha, versões sem ovo, nada de "seguro para celíacos", Nossa história e depoimentos autorizados.
- [ ] **Aveia comum** (bolo de chocolate, fatia Matilda e a massa de chocolate do Bento, confirmada em 06/10): o site mostra
      "sem leite e sem glúten, exceto …" e "sem leite · sem trigo". Se a cliente trocar a farinha de aveia, tire `'aveia'` de
      `cardapio.ts` e confira que tudo voltou a "sem glúten e sem leite" (a chamada curta do Bento em `cardapio.ts` é texto fixo e
      muda à mão; a frase da seção Bento na home volta sozinha).
- [ ] **Frases de descrição** dos produtos (`descricao` em `cardapio.ts`) aprovadas pela cliente. Os ingredientes foram todos
      confirmados em 06/10.
- [ ] **Perguntas para a cliente:** no Bento, quem escolhe a cobertura (chocolate ou branca), o cliente no pedido ou ela vem
      com o modelo? Hoje só aparece nos ingredientes. Com o gergelim na cozinha, os outros produtos podem ter traços dele?
      Hoje o site não avisa (mesmo critério do amendoim e do coco dos brigadeiros).
- [ ] Variáveis de produção conferidas: `SITE_URL=https://<domínio>`, `BASE_PATH=/`, **sem** `PUBLIC_NOINDEX`.
- [ ] Depois do deploy: `https://<domínio>/robots.txt` mostra `Allow: /` e a linha `Sitemap:`, e a prévia do link
      aparece no WhatsApp (home e um `/p/{produto}`).
