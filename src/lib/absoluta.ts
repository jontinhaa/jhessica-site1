// Endereço absoluto para as tags Open Graph (o WhatsApp não aceita og:image relativo).
// `caminho` já vem com o `base` aplicado (url() ou o src do astro:assets); `site` é Astro.site (SITE_URL no deploy).
// Sem `site` (dev local) devolve o caminho como veio.
export const urlAbsoluta = (caminho: string, site?: URL | string) => (site ? new URL(caminho, site).href : caminho);
