// Caminho interno respeitando o `base` do Astro (GitHub Pages em subpasta). url('/pedido') → '/jhessica-site1/pedido'.
// `?.`: os testes importam os dados direto no Node, sem Vite (lá não existe import.meta.env).
export const url = (caminho = '/') => (import.meta.env?.BASE_URL ?? '/').replace(/\/$/, '') + caminho;
