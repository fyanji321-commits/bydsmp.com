// Sponsor Leaderboard Module
// Fetches docs/sponsors.json and renders three stat cards:
//   1. 近期贊助   – latest 3 entries by date (desc)
//   2. 最高單筆   – single entry with highest amount
//   3. 最高贊助總額 – player whose cumulative total is highest
(function () {
    'use strict';

    var JSON_PATH = 'docs/sponsors.json';

    // ── helpers ──────────────────────────────────────────────

    function avatarURL(id, size) {
        return 'https://minotar.net/avatar/' + encodeURIComponent(id) + '/' + (size || 48);
    }

    function formatAmount(amount) {
        return amount.toLocaleString() + ' TWD';
    }

    // Build a single player card element
    function buildPlayerCard(sponsor, extra) {
        var article = document.createElement('article');
        article.className = 'sponsor-player-card';

        var img = document.createElement('img');
        img.src = avatarURL(sponsor.id, 48);
        img.alt = sponsor.name + ' 的頭像';
        img.width = 48;
        img.height = 48;
        img.loading = 'lazy';
        img.onerror = function () {
            this.src = 'https://minotar.net/avatar/MHF_Steve/48';
        };

        var info = document.createElement('div');
        info.className = 'sponsor-player-info';

        var nameEl = document.createElement('span');
        nameEl.className = 'sponsor-player-name';
        nameEl.textContent = sponsor.name;

        var amountEl = document.createElement('span');
        amountEl.className = 'sponsor-player-amount';
        amountEl.textContent = formatAmount(extra !== undefined ? extra : sponsor.amount);

        info.appendChild(nameEl);
        info.appendChild(amountEl);
        article.appendChild(img);
        article.appendChild(info);
        return article;
    }

    // Build a leaderboard card element
    function buildCard(opts) {
        // opts: { id, icon, heading, players }
        // players: array of { sponsor, displayAmount }
        var card = document.createElement('div');
        card.className = 'leaderboard-card';
        card.id = opts.id;

        var header = document.createElement('div');
        header.className = 'leaderboard-card__header';

        var icon = document.createElement('i');
        icon.className = opts.icon;
        icon.setAttribute('aria-hidden', 'true');

        var heading = document.createElement('h3');
        heading.className = 'leaderboard-card__heading';
        heading.textContent = opts.heading;

        header.appendChild(icon);
        header.appendChild(heading);
        card.appendChild(header);

        var list = document.createElement('div');
        list.className = 'leaderboard-card__list';

        opts.players.forEach(function (item) {
            list.appendChild(buildPlayerCard(item.sponsor, item.displayAmount));
        });

        card.appendChild(list);
        return card;
    }

    // ── stats computation ─────────────────────────────────────

    function computeStats(sponsors) {
        // 1. 近期贊助：依 date 降序，取前 3
        var recent = sponsors
            .slice()
            .sort(function (a, b) {
                return b.date.localeCompare(a.date);
            })
            .slice(0, 3);

        // 2. 最高單筆
        var topSingle = sponsors.reduce(function (best, s) {
            return s.amount > best.amount ? s : best;
        });

        // 3. 最高贊助總額（同 id 累計）
        var totals = {};
        sponsors.forEach(function (s) {
            totals[s.id] = (totals[s.id] || { sponsor: s, total: 0 });
            totals[s.id].total += s.amount;
        });
        var topTotal = Object.values(totals).reduce(function (best, item) {
            return item.total > best.total ? item : best;
        });

        return { recent: recent, topSingle: topSingle, topTotal: topTotal };
    }

    // ── render ────────────────────────────────────────────────

    function render(sponsors) {
        var grid = document.getElementById('leaderboard-grid');
        if (!grid) return;

        var stats = computeStats(sponsors);

        // Card 1: 近期贊助
        grid.appendChild(buildCard({
            id: 'lb-recent',
            icon: 'fas fa-clock',
            heading: '近期贊助',
            players: stats.recent.map(function (s) {
                return { sponsor: s, displayAmount: s.amount };
            })
        }));

        // Card 2: 最高單筆
        grid.appendChild(buildCard({
            id: 'lb-top-single',
            icon: 'fas fa-coins',
            heading: '最高單筆贊助',
            players: [{ sponsor: stats.topSingle, displayAmount: stats.topSingle.amount }]
        }));

        // Card 3: 最高贊助總額
        grid.appendChild(buildCard({
            id: 'lb-top-total',
            icon: 'fas fa-trophy',
            heading: '最高贊助總額',
            players: [{ sponsor: stats.topTotal.sponsor, displayAmount: stats.topTotal.total }]
        }));
    }

    // ── init ──────────────────────────────────────────────────

    function init() {
        var section = document.getElementById('sponsor-leaderboard');
        if (!section) return;

        fetch(JSON_PATH)
            .then(function (res) {
                if (!res.ok) throw new Error('Failed to load sponsors.json');
                return res.json();
            })
            .then(function (data) {
                if (!Array.isArray(data.sponsors) || data.sponsors.length === 0) return;
                render(data.sponsors);
                section.classList.add('is-loaded');
            })
            .catch(function (err) {
                console.warn('[sponsorLeaderboard]', err);
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
