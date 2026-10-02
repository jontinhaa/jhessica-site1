// npm run publicar:teste — publica SÓ a pasta jhess-site no remote "github" (deploy de teste no GitHub Pages).
// 1. subtree split da main → branch publico; 2. limpa o histórico dela: tira o master do vídeo (66 MB) e troca o
// e-mail pessoal pelo noreply do GitHub; 3. push publico → github/main.
// A limpeza é determinística (mesma árvore, datas e autores → mesmos hashes), então cada push é fast-forward.
// A main local não é tocada.
import { execFileSync } from 'node:child_process';

const git = (...args) => execFileSync('git', args, { cwd: raiz, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], env: { ...process.env, FILTER_BRANCH_SQUELCH_WARNING: '1' } }).trim();
const raiz = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();

const antigo = 'jhonatanmatos070@gmail.com';
const novo = '123261702+jontinhaa@users.noreply.github.com';

const split = git('subtree', 'split', '--prefix=jhess-site', 'main');
git('branch', '-f', 'publico', split);
git(
  'filter-branch', '-f', '--prune-empty',
  '--index-filter', 'git rm --cached --ignore-unmatch -q public/videos/final_4k60.mp4',
  '--env-filter', `
    [ "$GIT_AUTHOR_EMAIL" = "${antigo}" ] && export GIT_AUTHOR_EMAIL="${novo}"
    [ "$GIT_COMMITTER_EMAIL" = "${antigo}" ] && export GIT_COMMITTER_EMAIL="${novo}"
    true`,
  'publico',
);
git('update-ref', '-d', 'refs/original/refs/heads/publico');

// conferência antes de enviar: nada do e-mail antigo nem do vídeo pode sobrar
const autores = git('log', '--format=%ae%n%ce', 'publico');
const video = git('log', '--format=%h', 'publico', '--', 'public/videos/final_4k60.mp4');
if (autores.includes(antigo) || video) throw new Error('limpeza da branch publico falhou; nada foi enviado');

execFileSync('git', ['push', 'github', 'publico:main'], { cwd: raiz, stdio: 'inherit' });
