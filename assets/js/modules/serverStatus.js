// Server Status Module
// 使用 mcsrvstat.us API 取得 Minecraft 伺服器即時線上人數
// 每 60 秒自動輪詢，支援離線狀態顯示
(function () {
    'use strict';

    const API_BASE   = 'https://api.mcsrvstat.us/3/';
    const POLL_MS    = 60_000;
    const TIMEOUT_MS = 8_000;

    let pollTimer  = null;
    let lastOnline = null;

    // ── DOM helpers ────────────────────────────────────────
    function getEl(id) { return document.getElementById(id); }

    // ── State: loading ─────────────────────────────────────
    function setLoading() {
        const dot    = getEl('server-status-dot');
        const count  = getEl('server-online-count');
        const max    = getEl('server-max-count');
        const label  = getEl('server-status-label');
        const widget = getEl('server-status-widget');

        if (dot)    dot.className = 'status-dot status-dot--loading';
        if (count)  count.textContent = '—';
        if (max)    max.textContent = '';
        if (label)  label.textContent = '查詢中…';
        if (widget) widget.classList.remove('is-offline');
    }

    // ── State: online ──────────────────────────────────────
    function setOnline(online, maxPlayers) {
        const dot    = getEl('server-status-dot');
        const count  = getEl('server-online-count');
        const max    = getEl('server-max-count');
        const label  = getEl('server-status-label');
        const widget = getEl('server-status-widget');

        if (dot)    dot.className = 'status-dot status-dot--online';
        if (widget) {
            widget.classList.remove('is-offline');
            widget.setAttribute('aria-label', `伺服器線上，目前 ${online} 人`);
        }

        if (count && lastOnline !== online) {
            count.classList.remove('count-flip');
            void count.offsetWidth; // reflow 觸發動畫
            count.classList.add('count-flip');
            count.textContent = online;
        }

        if (max)   max.textContent = maxPlayers > 0 ? `/ ${maxPlayers}` : '人在線';
        if (label) label.textContent = '伺服器線上';

        lastOnline = online;
    }

    // ── State: offline ─────────────────────────────────────
    function setOffline() {
        const dot    = getEl('server-status-dot');
        const count  = getEl('server-online-count');
        const max    = getEl('server-max-count');
        const label  = getEl('server-status-label');
        const widget = getEl('server-status-widget');

        if (dot)    dot.className = 'status-dot status-dot--offline';
        if (count)  count.textContent = '—';
        if (max)    max.textContent = '';
        if (label)  label.textContent = '伺服器離線';
        if (widget) {
            widget.classList.add('is-offline');
            widget.setAttribute('aria-label', '伺服器目前離線');
        }

        lastOnline = null;
    }

    // ── State: error ───────────────────────────────────────
    function setError() {
        const dot   = getEl('server-status-dot');
        const label = getEl('server-status-label');

        if (dot)   dot.className = 'status-dot status-dot--offline';
        if (label) label.textContent = '無法取得狀態';
    }

    // ── Fetch ──────────────────────────────────────────────
    async function fetchStatus() {
        const ip = (typeof CONFIG !== 'undefined' && CONFIG.serverIP)
            ? CONFIG.serverIP
            : 'bydsmp.com';

        const controller = new AbortController();
        const timeoutId  = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const res = await fetch(`${API_BASE}${encodeURIComponent(ip)}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!res.ok) { setError(); return; }

            const data = await res.json();

            if (!data.online) { setOffline(); return; }

            const online  = data.players?.online ?? 0;
            const rawMax  = data.players?.max    ?? 0;
            // 過濾「假最大值」（如 114514、999999 等慣例裝飾數字）
            const maxPlayers = rawMax > 0 && rawMax <= 500 ? rawMax : 0;
            setOnline(online, maxPlayers);

        } catch (err) {
            clearTimeout(timeoutId);
            setError();
        }
    }

    // ── Polling ────────────────────────────────────────────
    function startPolling() {
        fetchStatus();
        pollTimer = setInterval(fetchStatus, POLL_MS);
    }

    function stopPolling() {
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    }

    // 視窗隱藏時暫停，恢復時立即刷新
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) { stopPolling(); } else { startPolling(); }
    });

    // ── Init ───────────────────────────────────────────────
    function init() {
        if (!getEl('server-status-widget')) return;
        setLoading();
        startPolling();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
