// Vercel Function: Duel 排行榜轉送
// 瀏覽器只打同網域的 /api/leaderboard，這裡在伺服端帶密鑰轉送到 Bydsmp-Leaderboard 插件的唯讀 API
// （http://主機:埠 — HTTPS 頁面直連會被 mixed content 擋，也會暴露主機位址與密鑰）。
// 上游契約：E:/plugins/Bydsmp docs/superpowers/specs/2026-10-08-leaderboard-web-api-design.md

export const UPSTREAM_TIMEOUT_MS = 5000;

const VIEWS = { meta: '/api/meta', board: '/api/board', find: '/api/find' };
const VIEW_PARAMS = { meta: [], board: ['ladder', 'sort'], find: ['ladder', 'sort', 'name'] };
const PARAM_PATTERNS = {
    ladder: /^[A-Za-z0-9#_.-]{1,64}$/,
    sort: /^[A-Za-z0-9#_.-]{1,64}$/,
    name: /^[A-Za-z0-9_]{1,16}$/,
};
// 只有「壞參數」類 4xx 原樣轉給瀏覽器；401／429 是我方設定或主機端的問題，對訪客一律視為上游失敗。
const PASS_THROUGH_STATUSES = new Set([400, 404]);

const CACHE_OK = 'public, s-maxage=60, stale-while-revalidate=600';
const CACHE_CLIENT_ERROR = 'public, s-maxage=60';
const CACHE_NONE = 'no-store';

function json(status, body, cacheControl) {
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': cacheControl,
        },
    });
}

const fail = (status, message) => json(status, { error: message }, CACHE_NONE);

/** 驗證查詢參數並組出上游路徑；不合法回 { error }。 */
export function buildUpstreamPath(searchParams) {
    const view = searchParams.get('view');
    if (!Object.hasOwn(VIEWS, view)) return { error: 'view 必須是 meta、board 或 find' };

    const query = new URLSearchParams();
    for (const key of VIEW_PARAMS[view]) {
        const value = searchParams.get(key);
        if (value === null || value === '') {
            if (key === 'name') return { error: '缺少 name' };
            continue;
        }
        if (!PARAM_PATTERNS[key].test(value)) return { error: key + ' 格式不符' };
        query.set(key, value);
    }
    const qs = query.toString();
    return { path: VIEWS[view] + (qs ? '?' + qs : '') };
}

async function fetchUpstream(url, token) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
    try {
        return await fetch(url, {
            headers: { 'X-Bydsmp-Token': token, Accept: 'application/json' },
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timer);
    }
}

async function handle(request) {
    if (request.method !== 'GET') return fail(405, '只接受 GET');

    const origin = (process.env.LEADERBOARD_ORIGIN || '').replace(/\/+$/, '');
    const token = process.env.LEADERBOARD_TOKEN || '';
    if (!origin || !token) {
        console.error('[leaderboard] LEADERBOARD_ORIGIN / LEADERBOARD_TOKEN 未設定');
        return fail(500, '排行榜尚未設定');
    }

    const target = buildUpstreamPath(new URL(request.url).searchParams);
    if (target.error) return fail(400, target.error);

    let upstream;
    try {
        upstream = await fetchUpstream(origin + target.path, token);
    } catch (err) {
        // 記錄完整原因供 Vercel log 查；回給瀏覽器的訊息不帶上游位址。
        console.error('[leaderboard] 上游連線失敗:', err && err.name, err && err.message);
        return fail(502, '排行榜暫時無法取得');
    }

    if (upstream.ok) return json(upstream.status, await upstream.text(), CACHE_OK);
    if (PASS_THROUGH_STATUSES.has(upstream.status)) {
        return json(upstream.status, await upstream.text(), CACHE_CLIENT_ERROR);
    }
    console.error('[leaderboard] 上游回應', upstream.status, target.path);
    return fail(502, '排行榜暫時無法取得');
}

export default { fetch: handle };
