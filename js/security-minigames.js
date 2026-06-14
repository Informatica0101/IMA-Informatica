/**
 * QuizPro Anti-Debugging Security Perimeter
 * To be loaded EXCLUSIVELY in interactive minigame contexts.
 */
(function() {
    var blockEvents = function(e) {
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();
        return false;
    };

    // 1. Bloqueo de Menú Contextual
    document.addEventListener('contextmenu', blockEvents, false);

    // 2. Bloqueo de Teclas de Inspección y Atajos de Sistema
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.keyCode === 123) return blockEvents(e);

        // Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J, Ctrl+U
        if (e.ctrlKey && (e.shiftKey || e.keyCode === 85)) {
            if (e.shiftKey && (e.keyCode === 73 || e.keyCode === 67 || e.keyCode === 74)) return blockEvents(e);
            if (e.keyCode === 85) return blockEvents(e);
        }

        // Mac Equivalents (Cmd+Option+I, etc.)
        if (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 67 || e.keyCode === 74 || e.keyCode === 85)) {
            return blockEvents(e);
        }
    }, false);

    // 3. Restricción de Selección de Texto
    var style = document.createElement('style');
    style.innerHTML = 'html, body { -webkit-user-select: none !important; -moz-user-select: none !important; -ms-user-select: none !important; user-select: none !important; } .quill-content, .allow-select { user-select: text !important; -webkit-user-select: text !important; }';
    document.head.appendChild(style);

    document.addEventListener('selectstart', function(e) {
        if (!e.target.closest('.quill-content, .allow-select, input, textarea')) return blockEvents(e);
    }, false);

    console.log("[QuizPro-Security] Perímetro de seguridad activado para entorno interactivo.");
})();
