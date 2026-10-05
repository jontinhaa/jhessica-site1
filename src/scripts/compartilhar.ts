// "Compartilhar" (card e painel Detalhes): folha nativa do celular (navigator.share); sem ela, copia o link da página /p/{id}.
// O link só leva o id do produto, nenhum dado de quem compartilha. Link, título e texto vêm prontos no build (lib/pedido/compartilhar).
import { aviso } from './sacola';

export interface DadosCompartilhar { link: string; titulo: string; texto: string }
export type Resultado = 'compartilhado' | 'copiado' | 'cancelado' | 'falhou';

function copiar(texto: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(texto);
  // navegador sem a API (ou página sem HTTPS): campo temporário + execCommand
  return new Promise<void>((ok, erro) => {
    const campo = Object.assign(document.createElement('textarea'), { value: texto });
    campo.setAttribute('readonly', '');
    campo.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.append(campo);
    campo.select();
    const feito = document.execCommand('copy');
    campo.remove();
    feito ? ok() : erro(new Error('copy'));
  });
}

export async function compartilhar({ link, titulo, texto }: DadosCompartilhar): Promise<Resultado> {
  if (navigator.share) {
    try {
      await navigator.share({ title: titulo, text: texto, url: link });
      return 'compartilhado';
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return 'cancelado'; // fechou a folha: não é erro
      // outro erro: tenta copiar
    }
  }
  try {
    await copiar(link);
    return 'copiado';
  } catch {
    return 'falhou';
  }
}

const dadosDe = (b: HTMLElement): DadosCompartilhar => ({ link: b.dataset.link!, titulo: b.dataset.titulo!, texto: b.dataset.texto! });

/** Liga os `botoes` (card ou painel; cada botão em um só lugar, senão o clique dispara duas vezes). `falhou` recebe o link para mostrar à mão. */
export function ligarCompartilhar(botoes: Iterable<HTMLElement>, falhou: (link: string, botao: HTMLElement) => void) {
  [...botoes].forEach((b) =>
    b.addEventListener('click', async () => {
      const d = dadosDe(b);
      const r = await compartilhar(d);
      if (r === 'copiado') aviso('Link copiado');
      else if (r === 'falhou') falhou(d.link, b);
    }),
  );
}
