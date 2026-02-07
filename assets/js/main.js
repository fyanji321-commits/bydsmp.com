// Main JavaScript Entry Point
// Load config first, then modules
(function() {
    'use strict';
    
    // All modules are self-initializing, so we just need to ensure config is loaded first
    // Modules will initialize themselves when DOM is ready
    
    // Export config for potential global access
    if (typeof CONFIG !== 'undefined') {
        window.CONFIG = CONFIG;
    }
})();
