# Instagram Media Harvester

Extensão Firefox (MV3) que baixa vídeos/reels/stories do Instagram com um clique no botão da barra.

## Como funciona
1. `background.js` lê o media id da URL da aba (shortcode base64 → número, ou id direto em `/stories/`).
2. Injeta `fetchInfo` na aba (`activeTab` + `scripting`) e chama `/api/v1/media/{id}/info/` com a sessão logada do usuário.
3. Pega o `video_versions` de maior largura de cada item (carrossel incluso) e baixa via `downloads` em `Downloads/instagram/`.
4. Resultado/erro aparece no badge e no tooltip do botão.

## Comandos
- Teste: `node test.js`
- Rodar: `about:debugging#/runtime/this-firefox` → "Carregar extensão temporária" → `manifest.json`

## Regras
- Sem dependências, sem build step. Tudo em `background.js`.
- Sem `host_permissions`: o fetch roda na aba, e o `activeTab` cobre a injeção.
- O header `X-IG-App-ID` é o app id público do Instagram web; se a API quebrar, comece por ele.
