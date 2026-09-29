// Dados da marca e da navegação. Header, Footer e SEO leem daqui.
export const site = {
  name: 'Jhessica',
  tagline: 'confeitaria artesanal',
  title: 'Jhessica · Confeitaria Artesanal',
  description: 'Bolos e doces artesanais feitos à mão, sob encomenda.',
  lang: 'pt-BR',
  // Mesma ordem das seções em src/pages/index.astro
  nav: [
    { label: 'Sobre', href: '#sobre' },
    { label: 'Cardápio', href: '#cardapio' },
    { label: 'Processo', href: '#processo' },
    { label: 'Depoimentos', href: '#depoimentos' },
    { label: 'Contato', href: '#contato' },
  ],
  cta: { label: 'Encomendar', href: '#encomendar' },
  // Preencher com os dados reais antes de publicar
  contact: {
    whatsapp: '',
    instagram: '',
    email: '',
    address: 'Ateliê · retirada com hora marcada',
  },
} as const;
