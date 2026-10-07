# Lançamento no Cloudflare Pages

Passo a passo para colocar o site no ar em **https://jhessicaemcozinhasaudavel.com**. Hoje existe só o deploy de teste no
GitHub Pages (https://jontinhaa.github.io/jhessica-site1/, fora do Google).

- **Domínio:** `jhessicaemcozinhasaudavel.com` (.com), comprado no **Cloudflare Registrar**. Não passa pelo registro.br:
  o DNS já nasce no Cloudflare, então não há troca de servidores DNS.
- **Código:** o repositório público **`jontinhaa/jhessica-site1`**, o mesmo que o `npm run publicar:teste` atualiza. Ele tem
  só a pasta do site (sem o vídeo master e sem o e-mail pessoal no histórico), com o site na raiz.

## 1. Criar o projeto no Cloudflare Pages

1. Entre em https://dash.cloudflare.com, na mesma conta onde o domínio foi comprado (o plano gratuito permite uso comercial).
2. **Workers e Pages → Criar → Pages → Conectar ao Git** e escolha o repositório **`jontinhaa/jhessica-site1`**.
3. Configuração de build:

| Campo | Valor |
| --- | --- |
| Branch de produção | `main` |
| Predefinição de framework | Astro |
| Comando de build | `npm run build` |
| Pasta de saída | `dist` |
| Diretório raiz | `/` (a raiz do repositório; vazio dá no mesmo) |

4. **Variáveis de ambiente** (Configurações → Variáveis e segredos, ambiente **Produção**):

| Variável | Valor |
| --- | --- |
| `SITE_URL` | `https://jhessicaemcozinhasaudavel.com` |
| `BASE_PATH` | `/` |
| `NODE_VERSION` | `22` |

   **Não** crie `PUBLIC_NOINDEX` em produção. Com ela, o site inteiro sai do Google: as páginas recebem `noindex`, o
   sitemap sai vazio e o robots.txt deixa de apontar para ele.

5. Salve e faça o primeiro deploy. O Cloudflare dá um endereço `*.pages.dev` para conferir antes do domínio.

> O build usa só o que está no `jhessica-site1`: nenhum arquivo de fora da pasta do site (vídeo master, briefing,
> design system de referência) entra nele. As fontes são baixadas do Google Fonts durante o build.
> Depois do lançamento, cada `npm run publicar:teste` atualiza **também a produção**, porque é o mesmo repositório.
> O GitHub Pages de teste continua recebendo o mesmo push.

## 2. Ligar o domínio

O domínio já está na conta do Cloudflare, com o DNS ativo. Não precisa mexer em servidores DNS.

1. No projeto do Pages: **Domínios personalizados → Configurar domínio** → `jhessicaemcozinhasaudavel.com` → confirmar.
2. Repita com `www.jhessicaemcozinhasaudavel.com`.
   O Cloudflare cria os registros DNS e o certificado HTTPS sozinho; pode levar alguns minutos até aparecer **Ativo**.
3. Mande o `www` para o endereço sem `www` (um endereço só para o Google): **domínio → Regras → Regras de
   redirecionamento → Criar regra → modelo "Redirecionar de WWW para raiz"** → código 301 → salvar.
   As páginas já apontam o endereço sem `www` como o oficial (`canonical`), então a regra só evita endereço duplicado.

## 2.1 Segurança do domínio e das contas

Os cabeçalhos de segurança já saem do site (`public/_headers`: nosniff, referrer, anti-iframe, permissões e CSP de
`frame-ancestors`/`object-src`/`base-uri`/`form-action`; cache longo só em `/_astro/*`). No painel e nas contas:

1. **Always Use HTTPS:** Cloudflare → o domínio → **SSL/TLS → Edge Certificates → Always Use HTTPS → ligar**.
2. **HSTS:** na mesma tela, **HTTP Strict Transport Security (HSTS) → Enable**: max-age de 6 meses, **Include subdomains**
   ligado e **No-Sniff** ligado. Só ative depois de conferir que o site abre por HTTPS com e sem `www`
   (depois de ativado, o navegador recusa HTTP por esse tempo).
3. **Verificação em duas etapas** nas contas **Cloudflare**, **GitHub** e **Google** (as que mexem no site, no domínio e
   no Search Console). Guarde os códigos de recuperação fora do computador.
4. **Renovação automática do domínio:** Cloudflare → **Registro de domínio → Gerenciar domínios** → o domínio →
   **Auto-renew ligado**, com cartão válido na conta.

## 3. Web Analytics (sem código)

No projeto do Pages: **Métricas → Web Analytics → Ativar**. O Cloudflare injeta o script no deploy, sem mexer no código.
Ele não usa cookies nem guarda dado pessoal, por isso não precisa de aviso de cookies.

## 4. Google Search Console

1. Em https://search.google.com/search-console → **Adicionar propriedade → Domínio** → `jhessicaemcozinhasaudavel.com`.
2. O Google mostra um registro **TXT**. No Cloudflare: **DNS → Registros → Adicionar** → tipo `TXT`, nome `@`,
   conteúdo colado do Google → salve.
3. Volte ao Search Console e clique em **Verificar**. Se não verificar na hora, espere alguns minutos e tente de novo.
4. **Sitemaps** → envie `https://jhessicaemcozinhasaudavel.com/sitemap.xml`. O sitemap tem só a home e o /pedido.

## 5. Lista final antes de publicar

Rode na pasta `jhess-site/`:

- [ ] `npm run fotos`: nenhuma obrigatória faltando e **nenhuma provisória** (todas as `FONTES-PROVISORIAS.md` resolvidas).
- [ ] `npm test`: tudo passando.
- [ ] `npm run build`: build sem erro.
- [ ] `npm audit`: nenhuma vulnerabilidade alta ou crítica.
- [ ] **dist limpo:** sem arquivo `.map`, sem rota `design-system` e sem `console.log` (conferido em 07/10); `dist/_headers` existe.
- [ ] **Segurança (seção 2.1):** Always Use HTTPS e HSTS ligados, verificação em duas etapas (Cloudflare, GitHub, Google) e
      renovação automática do domínio.
- [ ] Depois do deploy: os cabeçalhos aparecem (`curl -I https://jhessicaemcozinhasaudavel.com` mostra
      `x-content-type-options`, `x-frame-options`, `content-security-policy`) e home, /pedido e um /p/{produto} abrem sem erro
      no console do navegador.
- [ ] **Número do WhatsApp real** em `src/data/site.ts` (`contato.whatsapp` e `whatsappExibicao`): mande uma mensagem de
      teste pelo botão do site e confira que chega no celular da cliente.
- [ ] **/design-system fora do build:** a pasta `dist/` não pode ter `design-system` (a rota só existe no `npm run dev`).
- [ ] **Revisão das promessas** com a cliente: preços e prazos (`cardapio.ts`, `regrasPedido`), "sem glúten e sem leite na
      receita", traços da cozinha, versões sem ovo, nada de "seguro para celíacos", Nossa história e depoimentos autorizados.
- [ ] **Aveia** (bolo de chocolate, fatia Matilda e massa de chocolate do Bento): a farinha é declarada "não contém glúten"
      pelo fabricante na embalagem, sem selo (cliente, 07/10), e o interruptor `aveiaSemGluten` em `src/data/site.ts` está
      ligado: o site diz "sem glúten e sem leite", mostra "Aveia" em "Contém" e o FAQ avisa que alguns celíacos não toleram
      aveia. Se a cliente trocar por uma aveia sem essa declaração, mude para `false`: volta "Glúten (aveia comum)", a etiqueta
      "Leva aveia", o aviso para celíacos e "sem leite e sem trigo" nos textos gerais.
- [ ] **Perguntas para a cliente:** no Bento, quem escolhe a cobertura (chocolate ou branca), o cliente no pedido ou ela vem
      com o modelo? Hoje só aparece nos ingredientes. Com o gergelim na cozinha, os outros produtos podem ter traços dele?
      Hoje o site não avisa (mesmo critério do amendoim e do coco dos brigadeiros).
- [ ] Variáveis de produção conferidas: `SITE_URL=https://jhessicaemcozinhasaudavel.com`, `BASE_PATH=/`, `NODE_VERSION=22`,
      **sem** `PUBLIC_NOINDEX`.
- [ ] Depois do deploy: `https://jhessicaemcozinhasaudavel.com/robots.txt` mostra `Allow: /` e a linha `Sitemap:`;
      `https://www.jhessicaemcozinhasaudavel.com` cai no endereço sem `www`; e a prévia do link aparece no WhatsApp
      (home e um `/p/{produto}`).
