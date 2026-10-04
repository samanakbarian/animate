// Fristående dev- och exportsida för filmen (packages/film/index.html).
//   ?q=low|medium|high   kvalitet      ?t=104   starttid      ?dev   t/fps + tangenter
//   ?render=1&w=1920&h=1080              exportläge för tools/render
import { mountPlayer, mountRenderTarget, type Quality } from './player';

const params = new URLSearchParams(location.search);
const root = document.getElementById('app')!;
const q = params.get('q') as Quality | null;

if (params.has('render')) {
  void mountRenderTarget(root, { w: Number(params.get('w') ?? 1920), h: Number(params.get('h') ?? 1080), quality: q ?? 'high' });
} else {
  mountPlayer(root, { quality: q ?? 'auto', startAt: Number(params.get('t') ?? 0) || 0, dev: params.has('dev'), preload: true });
}
