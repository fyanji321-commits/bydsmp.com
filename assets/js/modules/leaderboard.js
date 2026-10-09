// Duel 排行榜頁 (leaderboard.html)
// 資料來自同網域的 /api/leaderboard（Vercel Function 轉送 Bydsmp-Leaderboard 插件的唯讀 API）。
// 名次、排序規則都由插件決定，這裡只照 rank 畫；模式清單與可用排序從 meta 取，不寫死。
// 玩家名字一律以 textContent 寫入 DOM。
(function () {
    'use strict';

    const API = '/api/leaderboard';
    const DEFAULT_SORT = 'rating';
    const SKELETON_ROWS = 8;
    const AVATAR_SIZE = 32;
    const NAME_PATTERN = /^[A-Za-z0-9_]{1,16}$/;
    const MSG_ERROR = '排行榜暫時無法取得';
    const MSG_EMPTY = '目前沒有排行資料';

    /** 排序 id → 中文標籤與主數值格式 */
    const SORTS = {
        'rating':      { label: '積分',     value: (r) => String(r.rating) },
        'wins':        { label: '勝場',     value: (r) => String(r.wins) },
        'win-rate':    { label: '勝率',     value: (r) => Number(r.winRate).toFixed(1) + '%' },
        'best-streak': { label: '最佳連勝', value: (r) => (r.bestStreak == null ? '—' : String(r.bestStreak)) },
    };

    let els = null;
    let state = { meta: null, ladder: null, sort: DEFAULT_SORT, rows: [], seq: 0 };

    // ── 資料 ────────────────────────────────────────────────

    function request(params) {
        const query = new URLSearchParams(params).toString();
        return fetch(API + '?' + query, { headers: { Accept: 'application/json' } }).then((res) => {
            if (!res.ok) throw new Error('leaderboard API ' + res.status);
            return res.json();
        });
    }

    const findLadder = (id) => (state.meta ? state.meta.ladders.find((l) => l.id === id) : undefined);
    const ladderHasSort = (ladder, sort) => ladder.sorts.some((s) => s.id === sort);

    /** 決定天梯與排序：不認得的天梯退回第一個，天梯沒有的排序退回積分。 */
    function resolveSelection(ladderId, sortId) {
        const ladder = findLadder(ladderId) || state.meta.ladders[0];
        const sort = ladderHasSort(ladder, sortId) ? sortId : DEFAULT_SORT;
        return { ladder: ladder.id, sort };
    }

    function writeUrl() {
        const params = new URLSearchParams({ ladder: state.ladder, sort: state.sort });
        try {
            window.history.replaceState(null, '', window.location.pathname + '?' + params);
        } catch (err) {
            console.warn('[leaderboard] 無法更新網址:', err);
        }
    }

    // ── 通用 DOM ────────────────────────────────────────────

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function showState(message, retryable) {
        els.state.hidden = false;
        els.stateText.textContent = message;
        els.retry.hidden = !retryable;
    }

    function hideState() {
        els.state.hidden = true;
    }

    function clearSearch() {
        els.searchResult.hidden = true;
        els.searchResult.textContent = '';
        els.pinned.hidden = true;
        els.pinned.replaceChildren();
        els.list.querySelectorAll('.is-highlighted').forEach((n) => n.classList.remove('is-highlighted'));
    }

    // ── 控制列 ──────────────────────────────────────────────

    function renderLadders() {
        const tabs = state.meta.ladders.map((ladder) => {
            const btn = el('button', 'duel-tabs__btn', ladder.name);
            btn.type = 'button';
            btn.setAttribute('role', 'tab');
            btn.setAttribute('aria-selected', String(ladder.id === state.ladder));
            btn.addEventListener('click', () => select(ladder.id, state.sort));
            return btn;
        });
        els.ladders.replaceChildren(...tabs);
    }

    function renderSorts() {
        const buttons = findLadder(state.ladder).sorts.map(({ id }) => {
            const btn = el('button', 'duel-sorts__btn', SORTS[id] ? SORTS[id].label : id);
            btn.type = 'button';
            btn.setAttribute('aria-pressed', String(id === state.sort));
            btn.addEventListener('click', () => select(state.ladder, id));
            return btn;
        });
        els.sorts.replaceChildren(...buttons);
    }

    // ── 列表 ────────────────────────────────────────────────

    function formatAge(generatedAt) {
        const seconds = Math.max(0, Math.floor((Date.now() - generatedAt) / 1000));
        if (seconds < 60) return seconds + ' 秒前';
        if (seconds < 3600) return Math.floor(seconds / 60) + ' 分鐘前';
        return Math.floor(seconds / 3600) + ' 小時前';
    }

    function renderInfo(board) {
        const parts = ['資料更新於 ' + formatAge(board.generatedAt), '共 ' + board.total + ' 名'];
        if (state.sort === 'win-rate') parts.push('勝率排序需至少 ' + state.meta.minMatches + ' 場排隊局');
        els.info.textContent = parts.join(' · ');
    }

    function avatar(name) {
        const img = el('img', 'duel-row__avatar');
        img.src = 'https://minotar.net/avatar/' + encodeURIComponent(name) + '/' + AVATAR_SIZE;
        img.alt = '';
        img.width = AVATAR_SIZE;
        img.height = AVATAR_SIZE;
        img.loading = 'lazy';
        img.addEventListener('error', function onError() {
            img.removeEventListener('error', onError);
            img.src = 'https://minotar.net/avatar/MHF_Steve/' + AVATAR_SIZE;
        });
        return img;
    }

    function buildRow(row) {
        const sort = SORTS[state.sort] || SORTS[DEFAULT_SORT];
        const li = el('li', 'duel-row' + (row.rank <= 3 ? ' duel-row--top-' + row.rank : ''));
        li.dataset.name = row.name.toLowerCase();

        const player = el('span', 'duel-row__player');
        player.append(avatar(row.name), el('span', 'duel-row__name', row.name));

        const stat = el('span', 'duel-row__stat');
        stat.append(
            el('span', 'duel-row__value', sort.value(row)),
            el('span', 'duel-row__record', '勝 ' + row.wins + '／敗 ' + row.losses)
        );

        li.append(el('span', 'duel-row__rank', String(row.rank)), player, stat);
        return li;
    }

    function renderSkeleton() {
        const rows = Array.from({ length: SKELETON_ROWS }, () => {
            const li = el('li', 'duel-row duel-row--skeleton');
            li.setAttribute('aria-hidden', 'true');
            return li;
        });
        els.list.replaceChildren(...rows);
        els.list.setAttribute('aria-busy', 'true');
    }

    function renderBoard(board) {
        state = { ...state, rows: board.rows };
        els.list.setAttribute('aria-busy', 'false');
        els.list.replaceChildren(...board.rows.map(buildRow));
        renderInfo(board);
        if (board.rows.length === 0) showState(MSG_EMPTY, false);
    }

    // ── 流程 ────────────────────────────────────────────────

    function loadBoard() {
        const seq = state.seq + 1;
        state = { ...state, seq };
        hideState();
        clearSearch();
        renderSkeleton();
        return request({ view: 'board', ladder: state.ladder, sort: state.sort })
            .then((board) => {
                if (seq === state.seq) renderBoard(board);
            })
            .catch((err) => {
                if (seq !== state.seq) return;
                console.warn('[leaderboard] 載入排行失敗:', err);
                els.list.replaceChildren();
                els.list.setAttribute('aria-busy', 'false');
                els.info.textContent = '';
                showState(MSG_ERROR, true);
            });
    }

    function select(ladderId, sortId) {
        state = { ...state, ...resolveSelection(ladderId, sortId) };
        renderLadders();
        renderSorts();
        writeUrl();
        return loadBoard();
    }

    function loadMeta() {
        hideState();
        renderSkeleton();
        return request({ view: 'meta' })
            .then((meta) => {
                state = { ...state, meta };
                if (!Array.isArray(meta.ladders) || meta.ladders.length === 0) {
                    els.list.replaceChildren();
                    showState(MSG_EMPTY, false);
                    return undefined;
                }
                const params = new URLSearchParams(window.location.search);
                return select(params.get('ladder'), params.get('sort') || DEFAULT_SORT);
            })
            .catch((err) => {
                console.warn('[leaderboard] 載入模式清單失敗:', err);
                els.list.replaceChildren();
                showState(MSG_ERROR, true);
            });
    }

    // ── 搜尋 ────────────────────────────────────────────────

    function showSearchMessage(message) {
        els.searchResult.textContent = message;
        els.searchResult.hidden = false;
    }

    function revealRow(found) {
        const key = found.name.toLowerCase();
        const target = Array.from(els.list.children).find((li) => li.dataset.name === key);
        if (target) {
            target.classList.add('is-highlighted');
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        els.pinned.replaceChildren(buildRow(found));
        els.pinned.hidden = false;
    }

    function onSearch(event) {
        event.preventDefault();
        if (!state.meta || !state.ladder) return;
        clearSearch();

        const name = els.searchInput.value.trim();
        if (!NAME_PATTERN.test(name)) {
            showSearchMessage('玩家 ID 只能包含英數字與底線（1–16 字）');
            return;
        }

        const seq = state.seq;
        request({ view: 'find', ladder: state.ladder, sort: state.sort, name })
            .then((result) => {
                if (seq !== state.seq) return;
                if (!result.row) {
                    showSearchMessage('這個排行裡找不到 ' + name);
                    return;
                }
                revealRow(result.row);
            })
            .catch((err) => {
                if (seq !== state.seq) return;
                console.warn('[leaderboard] 搜尋失敗:', err);
                showSearchMessage('搜尋暫時無法使用，請稍後再試');
            });
    }

    // ── 初始化 ──────────────────────────────────────────────

    function onRetry() {
        if (state.meta && state.ladder) loadBoard();
        else loadMeta();
    }

    function init() {
        const root = document.getElementById('duel-board');
        if (!root) return;

        els = {
            ladders: document.getElementById('duel-ladders'),
            sorts: document.getElementById('duel-sorts'),
            search: document.getElementById('duel-search'),
            searchInput: document.getElementById('duel-search-input'),
            searchResult: document.getElementById('duel-search-result'),
            info: document.getElementById('duel-info'),
            list: document.getElementById('duel-list'),
            pinned: document.getElementById('duel-pinned'),
            state: document.getElementById('duel-state'),
            stateText: document.getElementById('duel-state-text'),
            retry: document.getElementById('duel-retry'),
        };

        els.search.addEventListener('submit', onSearch);
        els.retry.addEventListener('click', onRetry);
        loadMeta();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
