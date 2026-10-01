// Comportamento comum dos <dialog class="folha"> (painel de Detalhes e sacola): tocar fora fecha e,
// no celular, arrastar a .alca para baixo fecha (limiar 120px; menos que isso, a folha volta).
export const celular = matchMedia('(max-width: 859px)');

export function prepararFolha(d: HTMLDialogElement) {
  d.addEventListener('click', (e) => { if (e.target === d) d.close(); }); // o ::backdrop

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
