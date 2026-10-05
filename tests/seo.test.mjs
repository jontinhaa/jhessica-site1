// npm test · dados estruturados da home (src/lib/seo.ts): o que o Google vê sobre a confeitaria.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { produtos, precosDe, formatarPreco } from '../src/data/cardapio.ts';
import { contato } from '../src/data/site.ts';
import { dadosEstruturados, faixaDePrecos, telefoneInternacional } from '../src/lib/seo.ts';

const ld = dadosEstruturados({ site: 'https://exemplo.com.br', imagem: '/_astro/og-padrao.jpg' });

test('JSON-LD: Bakery com URLs absolutas e cardápio no /pedido', () => {
  assert.equal(ld['@type'], 'Bakery');
  assert.equal(ld.url, 'https://exemplo.com.br/');
  assert.equal(ld.image, 'https://exemplo.com.br/_astro/og-padrao.jpg');
  assert.equal(ld.hasMenu, 'https://exemplo.com.br/pedido/');
  assert.deepEqual(ld.sameAs, [`https://instagram.com/${contato.instagram}`]);
});

test('JSON-LD: nenhuma avaliação, nota ou depoimento', () => {
  const texto = JSON.stringify(ld);
  for (const campo of ['aggregateRating', 'review', 'ratingValue', 'reviewCount']) assert.ok(!texto.includes(campo), campo);
});

test('JSON-LD: endereço só com cidade, estado e país (sem rua nem número)', () => {
  assert.deepEqual(Object.keys(ld.address).sort(), ['@type', 'addressCountry', 'addressLocality', 'addressRegion']);
  assert.deepEqual(ld.address, { '@type': 'PostalAddress', addressLocality: 'Marabá', addressRegion: 'PA', addressCountry: 'BR' });
  assert.equal(ld.areaServed.name, 'Marabá');
});

test('JSON-LD: atendimento de segunda a sexta, 08:00–18:00, e telefone internacional', () => {
  const [h] = ld.openingHoursSpecification;
  assert.deepEqual(h.dayOfWeek, ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  assert.equal(h.opens, '08:00');
  assert.equal(h.closes, '18:00');
  assert.equal(telefoneInternacional('5594981080336'), '+55 94 98108-0336');
  assert.equal(ld.telephone, telefoneInternacional(contato.whatsapp));
});

test('JSON-LD: priceRange do menor ao maior preço do cardápio disponível', () => {
  const precos = produtos.filter((p) => p.disponivel).flatMap(precosDe);
  assert.equal(faixaDePrecos(), `${formatarPreco(Math.min(...precos))} – ${formatarPreco(Math.max(...precos))}`);
  assert.equal(ld.priceRange, faixaDePrecos());
  // cardápio todo esgotado ou sem preço: sem priceRange (nada de "R$ Infinity")
  assert.equal(faixaDePrecos([]), undefined);
  assert.equal(faixaDePrecos(produtos.map((p) => ({ ...p, disponivel: false }))), undefined);
});
