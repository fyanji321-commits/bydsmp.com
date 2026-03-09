// Sponsor Leaderboard Module
// Fetches docs/sponsors.json and renders:
//   Three stat cards (top player each):
//     1. 近期贊助   – latest entry by date
//     2. 最高單筆   – single entry with highest amount
//     3. 最高贊助總額 – player whose cumulative total is highest
//   A standalone "all records" section below the leaderboard (collapsed by default)
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

    // Build a leaderboard card element (top player only, no dropdown)
    // opts: { id, icon, heading, topPlayer, showDate }
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

        var mainList = document.createElement('div');
        mainList.className = 'leaderboard-card__list';
        mainList.appendChild(buildPlayerCard({
            sponsor: opts.topPlayer.sponsor,
            displayAmount: opts.topPlayer.displayAmount,
            showDate: opts.showDate
        }));
        card.appendChild(mainList);

        return card;
    }

    // Build the standalone "all records" section inserted after the leaderboard section
    function buildAllRecordsSection(sponsors) {
        // All records sorted by date desc
        var allByDate = sponsors.slice().sort(function (a, b) {
            return b.date.localeCompare(a.date);
        });

        var section = document.createElement('section');
        section.className = 'sponsor-all-records';
        section.setAttribute('aria-label', '所有贊助紀錄');

        var details = document.createElement('details');
        details.className = 'sponsor-all-records__details';

        var summary = document.createElement('summary');
        summary.className = 'sponsor-all-records__summary';

        var summaryInner = document.createElement('span');
        summaryInner.className = 'sponsor-all-records__summary-text';
        summaryInner.textContent = '所有贊助紀錄（共 ' + allByDate.length + ' 筆）';
        summary.appendChild(summaryInner);

        details.appendChild(summary);

        var list = document.createElement('div');
        list.className = 'sponsor-all-records__list';
        list.setAttribute('role', 'list');

        allByDate.forEach(function (s) {
            var row = document.createElement('div');
            row.className = 'sponsor-record-row';
            row.setAttribute('role', 'listitem');

            var img = document.createElement('img');
            img.src = avatarURL(s.id, 36);
            img.alt = s.name + ' 的頭像';
            img.width = 36;
            img.height = 36;
            img.loading = 'lazy';
            img.className = 'sponsor-record-row__avatar';
            img.onerror = function () {
                this.src = 'https://minotar.net/avatar/MHF_Steve/36';
            };

            var name = document.createElement('span');
            name.className = 'sponsor-record-row__name';
            name.textContent = s.name;

            var amount = document.createElement('span');
            amount.className = 'sponsor-record-row__amount';
            amount.textContent = formatAmount(s.amount);

            var date = document.createElement('span');
            date.className = 'sponsor-record-row__date';
            date.textContent = formatDate(s.date);

            row.appendChild(img);
            row.appendChild(name);
            row.appendChild(amount);
            row.appendChild(date);
            list.appendChild(row);
        });

        details.appendChild(list);
        section.appendChild(details);
        return section;
    }

    // ── stats computation ─────────────────────────────────────

    function computeStats(sponsors) {
        var recentAll = sponsors
            .slice()
            .sort(function (a, b) {
                return b.date.localeCompare(a.date);
            });

        var topSingleAll = sponsors
            .slice()
            .sort(function (a, b) {
                return b.amount - a.amount;
            });

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
            topPlayer: { sponsor: stats.recentAll[0], displayAmount: stats.recentAll[0].amount }
        }));

        // Card 2: 最高單筆
        grid.appendChild(buildCard({
            id: 'lb-top-single',
            icon: 'fas fa-coins',
            heading: '最高單筆贊助',
            showDate: false,
            topPlayer: { sponsor: stats.topSingleAll[0], displayAmount: stats.topSingleAll[0].amount }
        }));

        // Card 3: 最高贊助總額
        grid.appendChild(buildCard({
            id: 'lb-top-total',
            icon: 'fas fa-trophy',
            heading: '最高贊助總額',
            showDate: false,
            topPlayer: { sponsor: stats.topTotalAll[0].sponsor, displayAmount: stats.topTotalAll[0].total }
        }));

        // Standalone all-records section inserted after the leaderboard section
        var leaderboardSection = document.getElementById('sponsor-leaderboard');
        if (leaderboardSection && leaderboardSection.parentNode) {
            leaderboardSection.parentNode.insertBefore(
                buildAllRecordsSection(sponsors),
                leaderboardSection.nextSibling
            );
        }
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
