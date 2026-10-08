const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

// URL de post/reel/story -> media id numérico (ou null se não for mídia)
function mediaIdFromUrl(url) {
  const { pathname } = new URL(url);
  const story = pathname.match(/^\/stories\/[^/]+\/(\d+)/);
  if (story) return story[1];
  const post = pathname.match(/\/(?:p|reels?|tv)\/([\w-]+)/);
  if (!post) return null;
  // ponytail: shortcodes longos (contas privadas) usam só os 11 primeiros chars; revisar se a API der 404 nesses
  return [...post[1].slice(0, 11)].reduce((id, c) => id * 64n + BigInt(ALPHABET.indexOf(c)), 0n).toString();
}

// Resposta de /api/v1/media/{id}/info/ -> [{url, filename}] com a maior resolução de cada vídeo
function videosFrom(info) {
  const item = info?.items?.[0];
  if (!item) return [];
  return (item.carousel_media ?? [item])
    .map(m => m.video_versions?.reduce((a, b) => (b.width > a.width ? b : a)).url)
    .filter(Boolean)
    .map((url, i) => ({ url, filename: `instagram/${item.user.username}_${item.code ?? item.pk}_${i + 1}.mp4` }));
}

// Roda dentro da aba do Instagram: usa a sessão logada do usuário
async function fetchInfo(id) {
  // Firefox: content.fetch faz a requisição como a própria página (origem + cookies)
  const r = await (globalThis.content ?? globalThis).fetch(`${location.origin}/api/v1/media/${id}/info/`, {
    headers: { 'X-IG-App-ID': '936619743392459' },
    credentials: 'include',
  });
  if (!r.ok) throw new Error(`Instagram respondeu HTTP ${r.status}`);
  return r.json();
}

async function harvest(tab) {
  const id = mediaIdFromUrl(tab.url);
  if (!id || !/(^|\.)instagram\.com$/.test(new URL(tab.url).hostname)) throw new Error('Abra um post, reel ou story do Instagram');
  const [{ result, error }] = await browser.scripting.executeScript({ target: { tabId: tab.id }, func: fetchInfo, args: [id] });
  if (error) throw error;
  const videos = videosFrom(result);
  if (!videos.length) throw new Error('Nenhum vídeo nesta publicação');
  for (const v of videos) await browser.downloads.download(v);
  return videos.length;
}

if (typeof browser !== 'undefined') {
  browser.action.onClicked.addListener(async tab => {
    const badge = (text, title) => {
      browser.action.setBadgeText({ tabId: tab.id, text });
      browser.action.setTitle({ tabId: tab.id, title });
    };
    try {
      const n = await harvest(tab);
      badge(String(n), `${n} vídeo(s) baixado(s)`);
    } catch (e) {
      badge('!', String(e.message ?? e));
    }
  });
}

if (typeof module !== 'undefined') module.exports = { mediaIdFromUrl, videosFrom };
