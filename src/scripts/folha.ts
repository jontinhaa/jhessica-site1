// Comportamento comum dos <dialog class="folha"> (painel de Detalhes e sacola): abrir, tocar fora fecha e,
// no celular, arrastar a .alca para baixo fecha (limiar 120px; menos que isso, a folha volta).
// iPhone: o Chrome do iOS (WebKit) pode disparar um popstate logo depois do pushState de quem abriu, e um toque pode
// chegar duas vezes. Por isso nada fecha a folha no mesmo toque que a abriu (recemAberta), e a abertura nunca depende
// de CSS novo: sem @starting-style ou allow-discrete, a folha só aparece sem animação.
export const celular = matchMedia('(max-width: 859px)');

/** Janela do "mesmo toque": nesse intervalo depois de abrir, nem o histórico nem o toque no fundo fecham a folha. */
const MESMO_TOQUE_MS = 500;
const abertaEm = new WeakMap<HTMLDialogElement, number>();

/** Abre a folha e marca a hora. Sem showModal (iOS anterior ao 15.4), prepararFolha já deixou um substituto. */
export function abrirFolha(d: HTMLDialogElement) {
  if (d.open) return;
  abertaEm.set(d, performance.now());
  try {
    d.showModal();
  } catch {
    d.setAttribute('open', ''); // showModal recusou (ex.: elemento fora do documento): abre sem o modo modal, mas abre
  }
}

/** true no mesmo toque que abriu a folha: o popstate e o toque no fundo esperam esse intervalo passar. */
export const recemAberta = (d: HTMLDialogElement) => performance.now() - (abertaEm.get(d) ?? -Infinity) < MESMO_TOQUE_MS;

export function prepararFolha(d: HTMLDialogElement) {
  // navegador sem <dialog> modal (iOS anterior ao 15.4): abre e fecha pelo atributo, com o fundo escuro do CSS .sem-modal
  if (typeof d.showModal !== 'function') {
    d.classList.add('sem-modal');
    Object.defineProperty(d, 'open', { get: () => d.hasAttribute('open') });
    d.showModal = () => d.setAttribute('open', '');
    d.close = () => {
      if (!d.hasAttribute('open')) return;
      d.removeAttribute('open');
      d.dispatchEvent(new Event('close'));
    };
  }

  d.addEventListener('click', (e) => { if (e.target === d && !recemAberta(d)) d.close(); }); // o ::backdrop

  const alca = d.querySelector<HTMLElement>('.alca');
  if (!alca) return;
  let y0 = 0, dy = 0, arrastando = false;
  alca.addEventListener('pointerdown', (e) => {
    if (!celular.matches) return;
    arrastando = true; y0 = e.clientY; dy = 0;
    alca.setPointerCapture(e.pointerId);
    d.style.transition = 'none';
  });
  alca.addEventListener('pointermove', (e) => {
    if (!arrastando) return;
    dy = Math.max(0, e.clientY - y0);
    d.style.translate = `0 ${dy}px`;
  });
  const soltar = () => {
    if (!arrastando) return;
    arrastando = false;
    d.style.transition = '';
    d.style.translate = ''; // a transição leva de onde parou até aberto (volta) ou fechado (some)
    if (dy > 120) d.close();
  };
  alca.addEventListener('pointerup', soltar);
  alca.addEventListener('pointercancel', soltar);
}
