// Modo diagnóstico TEMPORÁRIO das folhas (sacola e Detalhes): só liga com ?debug=1 na URL. Sem isso, nada aparece e
// nenhum ouvinte é registrado (as funções exportadas viram nada). Serve para descobrir, no aparelho, quem fecha a folha:
// um painel fixo lista cada evento com o tempo em ms desde o último toque. Tirar quando o bug do iPhone estiver resolvido.

export const diagnostico = (() => {
  try { return new URLSearchParams(location.search).get('debug') === '1'; } catch { return false; }
})();

let t0 = performance.now(); // começo do último toque
let lista: HTMLOListElement | null = null;
const linhas: string[] = [];

const ms = () => `+${Math.round(performance.now() - t0)}ms`.padStart(8);

/** "button.btn[data-sacola-abrir]", "dialog#sacola", "html" */
function descrever(el: EventTarget | null): string {
  if (!(el instanceof Element)) return el === window ? 'window' : el === document ? 'document' : String(el);
  const id = el.id ? `#${el.id}` : '';
  const classes = typeof el.className === 'string' && el.className ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
  const dados = [...el.attributes].filter((a) => a.name.startsWith('data-') && !a.name.startsWith('data-astro')).slice(0, 2).map((a) => `[${a.name}]`).join('');
  return `${el.tagName.toLowerCase()}${id}${classes}${dados}`;
}

/** De onde veio a chamada (primeira linha útil da pilha), para achar o close() que não passou motivo. */
function origem(): string {
  const pilha = (new Error().stack ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
  const util = pilha.find((l) => !/diagnostico|^Error/.test(l));
  return util ? util.replace(/^at\s+/, '').slice(0, 90) : '?';
}

export function registrar(tipo: string, detalhe = '') {
  if (!diagnostico) return;
  const linha = `${ms()} ${tipo}${detalhe ? ' · ' + detalhe : ''}`;
  linhas.push(linha);
  if (lista) {
    const li = document.createElement('li');
    li.textContent = linha;
    lista.append(li);
    lista.scrollTop = lista.scrollHeight;
  }
}

function montarPainel() {
  const caixa = document.createElement('div');
  caixa.id = 'diagnostico';
  caixa.setAttribute('aria-hidden', 'true');
  caixa.style.cssText = 'position:fixed;left:6px;right:6px;top:calc(6px + env(safe-area-inset-top));z-index:2147483647;max-height:42vh;display:flex;flex-direction:column;'
    + 'font:10px/1.35 ui-monospace,Menlo,monospace;color:#F5EADB;background:rgba(20,13,10,.92);border:1px solid #D9A45B;border-radius:8px;padding:6px;';
  const topo = document.createElement('div');
  topo.style.cssText = 'display:flex;gap:6px;align-items:center;margin-bottom:4px;';
  const ua = document.createElement('div');
  ua.style.cssText = 'flex:1;color:#D9A45B;word-break:break-all;';
  ua.textContent = navigator.userAgent;
  const botao = (rotulo: string, acao: () => void) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = rotulo;
    b.style.cssText = 'font:inherit;color:#140D0A;background:#D9A45B;border:0;border-radius:4px;padding:4px 6px;';
    b.addEventListener('click', (e) => { e.stopPropagation(); acao(); });
    return b;
  };
  lista = document.createElement('ol');
  lista.style.cssText = 'margin:0;padding:0 0 0 2px;list-style:none;overflow:auto;-webkit-overflow-scrolling:touch;';
  const copiar = botao('copiar', () => {
    const texto = [navigator.userAgent, ...linhas].join('\n');
    navigator.clipboard?.writeText(texto).then(() => registrar('diagnóstico', 'log copiado'), () => registrar('diagnóstico', 'não deu para copiar'));
  });
  const limpar = botao('limpar', () => { linhas.length = 0; lista!.replaceChildren(); t0 = performance.now(); });
  const recolher = botao('–', () => { lista!.hidden = !lista!.hidden; ua.hidden = lista!.hidden; });
  topo.append(ua, copiar, limpar, recolher);
  caixa.append(topo, lista);
  document.body.append(caixa);
  linhas.forEach((l) => { const li = document.createElement('li'); li.textContent = l; lista!.append(li); });
}

let iniciado = false;
/** Liga o painel e os ouvintes globais (toques, cliques, histórico, tamanho da tela). Sem ?debug=1, não faz nada. */
export function iniciarDiagnostico() {
  if (!diagnostico || iniciado) return;
  iniciado = true;
  const dentroDoPainel = (e: Event) => e.target instanceof Element && !!e.target.closest('#diagnostico');

  // toques e cliques (fase de captura: vêm antes de qualquer código do site)
  const toque = (e: Event) => {
    if (dentroDoPainel(e)) return;
    if (e.type === 'touchstart' || (e.type === 'pointerdown' && !linhas.at(-1)?.includes('touchstart'))) t0 = performance.now();
    const ponto = 'changedTouches' in e ? (e as TouchEvent).changedTouches[0] : (e as MouseEvent);
    const xy = ponto ? ` (${Math.round(ponto.clientX)},${Math.round(ponto.clientY)})` : '';
    registrar(e.type, `${descrever(e.target)}${xy}${e.type === 'click' ? ` detail=${(e as MouseEvent).detail} trusted=${e.isTrusted}` : ''}`);
  };
  ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'click'].forEach((t) => document.addEventListener(t, toque, { capture: true, passive: true }));

  // histórico
  addEventListener('popstate', (e) => registrar('popstate', `state=${JSON.stringify(e.state)} search="${location.search}"`), true);
  for (const nome of ['pushState', 'replaceState'] as const) {
    const orig = history[nome].bind(history);
    history[nome] = (estado: unknown, titulo: string, u?: string | URL | null) => {
      registrar(`history.${nome}`, `state=${JSON.stringify(estado)} url=${u ? new URL(String(u), location.href).search || '(sem query)' : '-'}`);
      return orig(estado, titulo, u);
    };
  }
  const back = history.back.bind(history);
  history.back = () => { registrar('history.back', `de ${origem()}`); back(); };

  // tamanho da tela, teclado, barra do navegador, aba em segundo plano
  const tamanho = () => `${innerWidth}x${innerHeight} scrollY=${Math.round(scrollY)}`;
  addEventListener('resize', () => registrar('resize', tamanho()));
  const vv = window.visualViewport;
  if (vv) {
    vv.addEventListener('resize', () => registrar('visualViewport resize', `${Math.round(vv.width)}x${Math.round(vv.height)} top=${Math.round(vv.offsetTop)}`));
    vv.addEventListener('scroll', () => registrar('visualViewport scroll', `top=${Math.round(vv.offsetTop)}`));
  }
  document.addEventListener('visibilitychange', () => registrar('visibilitychange', document.visibilityState));
  addEventListener('pagehide', () => registrar('pagehide'));
  addEventListener('pageshow', (e) => registrar('pageshow', `persisted=${(e as PageTransitionEvent).persisted}`));
  addEventListener('blur', () => registrar('window blur'));
  addEventListener('focus', () => registrar('window focus'));

  const montar = () => { montarPainel(); registrar('diagnóstico ligado', `${tamanho()} search="${location.search}"`); };
  if (document.body) montar(); else addEventListener('DOMContentLoaded', montar);
}

/** Observa um <dialog class="folha">: cada showModal/close (com a origem da chamada), os eventos close/cancel/toggle e,
 *  depois de abrir, onde a folha está na tela (para ver se ela abriu fora da vista). */
export function vigiarFolha(d: HTMLDialogElement, nome: string, motivoDoFechamento: () => string | undefined) {
  if (!diagnostico) return;
  const abrirOrig = d.showModal.bind(d);
  d.showModal = () => {
    registrar(`${nome} showModal`, `de ${origem()}`);
    abrirOrig();
    for (const t of [50, 200, 500, 1000]) {
      setTimeout(() => {
        const r = d.getBoundingClientRect(), cs = getComputedStyle(d);
        registrar(`${nome} +${t}ms`, `open=${d.open} topo=${Math.round(r.top)} alt=${Math.round(r.height)} translate=${cs.translate} opacity=${cs.opacity} display=${cs.display}`);
      }, t);
    }
  };
  const fecharOrig = d.close.bind(d);
  d.close = (v?: string) => { registrar(`${nome} close()`, `motivo=${motivoDoFechamento() ?? '?'} de ${origem()}`); fecharOrig(v); };
  d.addEventListener('cancel', () => registrar(`${nome} cancel`, 'Escape/pedido de fechar do navegador'));
  d.addEventListener('close', () => registrar(`${nome} FECHOU`, `motivo=${motivoDoFechamento() ?? 'sem motivo do código: fechado pelo navegador ou por outro script'}`));
  d.addEventListener('toggle', (e) => registrar(`${nome} toggle`, `${(e as Event & { oldState?: string }).oldState ?? '?'} → ${(e as Event & { newState?: string }).newState ?? '?'}`));
}
