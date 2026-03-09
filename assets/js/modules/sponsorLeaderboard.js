// Sponsor Leaderboard Module
// Fetches docs/sponsors.json and renders three stat cards:
//   1. 近期贊助   – latest entry by date, dropdown lists all by date desc
//   2. 最高單筆   – single entry with highest amount, dropdown lists all by amount desc
//   3. 最高贊助總額 – player whose cumulative total is highest, dropdown lists all totals desc
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

    function formatDate(dateStr) {
        return dateStr ? dateStr.replace(/-/g, '/') : '';
    }

    // Build a single player card element
    function buildPlayerCard(cardOpts) {
        var sponsor = cardOpts.sponsor;
        var displayAmount = cardOpts.displayAmount;
        var showDate = cardOpts.showDate;

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
        amountEl.textContent = formatAmount(displayAmount !== undefined ? displayAmount : sponsor.amount);

        info.appendChild(nameEl);
        info.appendChild(amountEl);

        if (showDate && sponsor.date) {
            var dateEl = document.createElement('span');
            dateEl.className = 'sponsor-player-date';
            dateEl.textContent = formatDate(sponsor.date);
            info.appendChild(dateEl);
        }

        article.appendChild(img);
        article.appendChild(info);
        return article;
    }

    // Build a leaderboard card element
    // opts: { id, icon, heading, topPlayer, allPlayers, showDate, totalCount }
    // topPlayer: { sponsor, displayAmount } — shown as main card
    // allPlayers: array of { sponsor, displayAmount } — shown in dropdown
    function buildCard(opts) {
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

        // Main display: single top player
        var mainList = document.createElement('div');
        mainList.className = 'leaderboard-card__list';
        mainList.appendChild(buildPlayerCard({
            sponsor: opts.topPlayer.sponsor,
            displayAmount: opts.topPlayer.displayAmount,
            showDate: opts.showDate
        }));
        card.appendChild(mainList);

        // Dropdown: all records
        if (opts.allPlayers && opts.allPlayers.length > 0) {
            var details = document.createElement('details');
            details.className = 'lb-dropdown';

            var summary = document.createElement('summary');
            summary.textContent = '查看所有 ' + opts.totalCount + ' 筆紀錄';
            details.appendChild(summary);

            var dropList = document.createElement('div');
            dropList.className = 'leaderboard-card__list';
            opts.allPlayers.forEach(function (item) {
                dropList.appendChild(buildPlayerCard({
                    sponsor: item.sponsor,
                    displayAmount: item.displayAmount,
                    showDate: opts.showDate
                }));
            });
            details.appendChild(dropList);
            card.appendChild(details);
        }

        return card;
    }

    // ── stats computation ─────────────────────────────────────

    function computeStats(sponsors) {
        // 1. 近期贊助：依 date 降序
        var recentAll = sponsors
            .slice()
            .sort(function (a, b) {
                return b.date.localeCompare(a.date);
            });

        // 2. 最高單筆：依 amount 降序
        var topSingleAll = sponsors
            .slice()
            .sort(function (a, b) {
                return b.amount - a.amount;
            });

        // 3. 最高贊助總額（同 id 累計），依總額降序
        var totals = {};
        sponsors.forEach(function (s) {
            if (!totals[s.id]) {
                totals[s.id] = { sponsor: s, total: 0 };
            }
            totals[s.id].total += s.amount;
        });
        var topTotalAll = Object.values(totals).sort(function (a, b) {
            return b.total - a.total;
        });

        return {
            recentAll: recentAll,
            topSingleAll: topSingleAll,
            topTotalAll: topTotalAll
        };
    }

    // ── render ────────────────────────────────────────────────

    function render(sponsors) {
        var grid = document.getElementById('leaderboard-grid');
        if (!grid) return;

        var stats = computeStats(sponsors);

        // Card 1: 近期贊助（含日期）
        grid.appendChild(buildCard({
            id: 'lb-recent',
            icon: 'fas fa-clock',
            heading: '近期贊助',
            showDate: true,
            topPlayer: { sponsor: stats.recentAll[0], displayAmount: stats.recentAll[0].amount },
            allPlayers: stats.recentAll.map(function (s) {
                return { sponsor: s, displayAmount: s.amount };
            }),
            totalCount: stats.recentAll.length
        }));

        // Card 2: 最高單筆
        grid.appendChild(buildCard({
            id: 'lb-top-single',
            icon: 'fas fa-coins',
            heading: '最高單筆贊助',
            showDate: false,
            topPlayer: { sponsor: stats.topSingleAll[0], displayAmount: stats.topSingleAll[0].amount },
            allPlayers: stats.topSingleAll.map(function (s) {
                return { sponsor: s, displayAmount: s.amount };
            }),
            totalCount: stats.topSingleAll.length
        }));

        // Card 3: 最高贊助總額
        grid.appendChild(buildCard({
            id: 'lb-top-total',
            icon: 'fas fa-trophy',
            heading: '最高贊助總額',
            showDate: false,
            topPlayer: { sponsor: stats.topTotalAll[0].sponsor, displayAmount: stats.topTotalAll[0].total },
            allPlayers: stats.topTotalAll.map(function (item) {
                return { sponsor: item.sponsor, displayAmount: item.total };
            }),
            totalCount: stats.topTotalAll.length
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
