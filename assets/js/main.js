// Main JavaScript Entry Point
// Injects CONFIG values into shared DOM placeholders (footer, nav Discord link).
// All feature modules are self-initializing; this file handles cross-page data binding.
(function() {
    'use strict';

    function injectConfigValues() {
        // Footer: Server IP
        const ipEl = document.getElementById('footer-server-ip');
        if (ipEl) ipEl.textContent = CONFIG.serverIP;

        // Footer: Email
        const emailEl = document.getElementById('footer-email');
        if (emailEl) {
            emailEl.textContent = CONFIG.email;
            emailEl.href = 'mailto:' + CONFIG.email;
        }

        // Navigation: Discord button
        const discordBtn = document.getElementById('nav-discord-btn');
        if (discordBtn) discordBtn.href = CONFIG.discordLink;

        // Sponsor page: CTA link
        const sponsorCta = document.getElementById('sponsor-cta-link');
        if (sponsorCta) sponsorCta.href = CONFIG.discordLink;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectConfigValues);
    } else {
        injectConfigValues();
    }
})();
