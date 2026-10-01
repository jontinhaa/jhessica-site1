// Tilt 3D com reflexo (.glare), do design system: inclina até `max` graus seguindo o cursor, com lerp .12 por quadro.
// `move` desloca a foto (--px/--py) no sentido contrário. Chame só com mouse e sem movimento reduzido.
export function tilt(el: HTMLElement, { max = 7, move = 0 } = {}) {
  const s = { rx: 0, ry: 0, px: 0, py: 0, gx: 50, gy: 50, go: 0 }, t = { ...s }, keys = Object.keys(s) as (keyof typeof s)[];
  let raf = 0;
  const loop = () => {
    let busy = false;
    keys.forEach((k) => { s[k] += (t[k] - s[k]) * .12; if (Math.abs(t[k] - s[k]) > .02) busy = true; });
    el.style.setProperty('--rx', `${s.rx.toFixed(2)}deg`);
    el.style.setProperty('--ry', `${s.ry.toFixed(2)}deg`);
    if (move) { el.style.setProperty('--px', `${s.px.toFixed(2)}px`); el.style.setProperty('--py', `${s.py.toFixed(2)}px`); }
    el.style.setProperty('--gx', `${s.gx.toFixed(1)}%`);
    el.style.setProperty('--gy', `${s.gy.toFixed(1)}%`);
    el.style.setProperty('--go', s.go.toFixed(3));
    raf = busy ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => { raf ||= requestAnimationFrame(loop); };
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width * 2 - 1, ny = (e.clientY - r.top) / r.height * 2 - 1;
    Object.assign(t, { rx: -ny * max, ry: nx * max, px: -nx * move, py: -ny * move, gx: (nx + 1) * 50, gy: (ny + 1) * 50, go: 1 });
    kick();
  });
  el.addEventListener('pointerleave', () => { Object.assign(t, { rx: 0, ry: 0, px: 0, py: 0, go: 0 }); kick(); });
}

/** Tilt só faz sentido com mouse e sem movimento reduzido. */
export const podeInclinar = () => matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
