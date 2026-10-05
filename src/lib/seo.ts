// Dados estruturados da home (JSON-LD, schema.org/Bakery), montados de src/data/site.ts e do cardápio.
// Endereço só com cidade, estado e país: rua e número nunca entram no repositório (AGENTS.md).
// Sem aggregateRating, review ou nota: os depoimentos do site não são avaliações verificáveis e ficam fora daqui.
import { formatarPreco, precosDe, produtos } from '../data/cardapio.ts';
import { contato, marca, redes } from '../data/site.ts';
import { urlAbsoluta } from './absoluta.ts';
import { url } from './url.ts';

const diasSchema = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** "+55 94 98108-0336", a partir de contato.whatsapp (DDI + DDD + número, só dígitos). */
export function telefoneInternacional(digitos = contato.whatsapp) {
  const d = digitos.replace(/\D/g, '');
  return `+${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4, -4)}-${d.slice(-4)}`;
}

/** "R$ 30 – R$ 150": do menor ao maior preço entre os produtos disponíveis; undefined se nenhum tiver preço. */
export function faixaDePrecos(lista = produtos) {
  const precos = lista.filter((p) => p.disponivel).flatMap(precosDe);
  if (!precos.length) return undefined;
  return `${formatarPreco(Math.min(...precos))} – ${formatarPreco(Math.max(...precos))}`;
}

/** `site` é Astro.site (SITE_URL); `imagem` já vem com o caminho do build (src do getImage). */
export function dadosEstruturados({ site, imagem }: { site?: URL | string; imagem: string }) {
  const faixa = faixaDePrecos();
  return {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    name: marca.nome,
    url: urlAbsoluta(url('/'), site),
    image: urlAbsoluta(imagem, site),
    telephone: telefoneInternacional(),
    ...(redes.instagram && { sameAs: [redes.instagram] }),
    address: { '@type': 'PostalAddress', addressLocality: contato.cidade, addressRegion: contato.estado, addressCountry: 'BR' },
    areaServed: { '@type': 'City', name: contato.cidade },
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: contato.atendimento.dias.map((d) => diasSchema[d]),
      opens: contato.atendimento.horario.abre,
      closes: contato.atendimento.horario.fecha,
    }],
    hasMenu: urlAbsoluta(url('/pedido/'), site),
    ...(faixa && { priceRange: faixa }),
  };
}
