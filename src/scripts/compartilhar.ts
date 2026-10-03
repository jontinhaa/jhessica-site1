// "Compartilhar" do card: menu nativo do celular (navigator.share); sem ele, copia o link da página /p/{id}.
// O link só leva o id do produto, nenhum dado de quem compartilha.
import { url } from '../lib/url';
import { aviso } from './sacola';

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

export async function compartilhar(id: string, nome: string) {
  const link = new URL(url(`/p/${id}/`), location.origin).href;
  if (navigator.share) {
    try {
      await navigator.share({ title: nome, text: `${nome}, da Jhessica Confeitaria Artesanal`, url: link });
    } catch (e) {
      if ((e as DOMException).name !== 'AbortError') aviso('Não deu para compartilhar agora. Tente de novo.');
    }
    return;
  }
  try {
    await copiar(link);
    aviso('Link copiado. É só colar na conversa.');
  } catch {
    aviso('Não deu para copiar o link. Tente de novo.');
  }
}
