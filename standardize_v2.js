const fs = require('fs');
const path = require('path');

const headerTemplate = (prefix) => `
    <!-- ENCABEZADO INSTITUCIONAL -->
    <header id="page-header" class="w-full bg-white p-3 shadow-md flex flex-col sm:flex-row justify-center sm:justify-between items-center z-50 text-center sm:text-left transition-all duration-300">
        <div class="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3">
            <img src="${prefix}imagenes/logo.png" id="header-logo" alt="Logo" class="w-16 sm:w-20 h-auto">
            <div class="leading-none">
                <h1 class="text-sm sm:text-base font-black text-gray-900 uppercase tracking-tighter">ISEMED</h1>
                <p class="text-[8px] sm:text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Área de Informática</p>
            </div>
        </div>
        <nav class="mt-3 sm:mt-0">
            <ul class="flex space-x-4">
                <li><a href="${prefix}index.html" id="nav-home-link" class="text-gray-600 hover:text-blue-500 font-bold uppercase text-[10px] tracking-widest transition-colors">Inicio</a></li>
            </ul>
        </nav>
    </header>
`;

const footerTemplate = (prefix) => `
    <!-- PIE DE PÁGINA INSTITUCIONAL -->
    <footer id="page-footer" class="w-full bg-gray-800 text-white text-center text-[10px] p-4 transition-all duration-300">
        <div class="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <img src="${prefix}imagenes/bandera-de-honduras.png" id="footer-flag" alt="HN" class="w-10 h-auto">
            <p class="uppercase tracking-widest font-medium">© 2026 Instituto María Auxiliadora • Sistema ISEMED</p>
        </div>
    </footer>
`;

const navScript = `
    <!-- LOGICA DE NAVEGACIÓN ESTÁNDAR (Fase 6) -->
    <script>
        (function() {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight' || e.key === ' ') {
                   if (typeof showSlide === 'function') showSlide(currentSlideIndex + 1);
                   else if (typeof nextSlide === 'function') nextSlide();
                }
                if (e.key === 'ArrowLeft') {
                   if (typeof showSlide === 'function') showSlide(currentSlideIndex - 1);
                   else if (typeof prevSlide === 'function') prevSlide();
                }
            });

            const container = document.getElementById('presentation-container') || document.body;
            let tsX = 0;
            container.addEventListener('touchstart', e => { tsX = e.changedTouches[0].screenX; }, {passive: true});
            container.addEventListener('touchend', e => {
                let teX = e.changedTouches[0].screenX;
                if (tsX - teX > 50) {
                    if (typeof showSlide === 'function') showSlide(currentSlideIndex + 1);
                    else if (typeof nextSlide === 'function') nextSlide();
                }
                if (teX - tsX > 50) {
                    if (typeof showSlide === 'function') showSlide(currentSlideIndex - 1);
                    else if (typeof prevSlide === 'function') prevSlide();
                }
            }, {passive: true});

            // Double tap for fullscreen
            let lastTap = 0;
            container.addEventListener('touchstart', (e) => {
                const now = Date.now();
                if (now - lastTap < 300) {
                    if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen().catch(err => console.error(err));
                    } else {
                        document.exitFullscreen();
                    }
                }
                lastTap = now;
            }, {passive: true});

            function handleFS() {
                const isFS = document.fullscreenElement;
                const h = document.getElementById('page-header');
                const f = document.getElementById('page-footer');
                if (h) h.style.display = isFS ? 'none' : 'flex';
                if (f) f.style.display = isFS ? 'none' : 'block';
            }
            document.addEventListener('fullscreenchange', handleFS);
            document.addEventListener('webkitfullscreenchange', handleFS);
            document.addEventListener('mozfullscreenchange', handleFS);
            document.addEventListener('MSFullscreenChange', handleFS);
        })();
    </script>
`;

function standardize(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    const relative = path.relative(path.dirname(filePath), '.');
    const prefix = relative ? relative + '/' : '';

    content = content.replace(/<!-- ENCABEZADO INSTITUCIONAL -->[\s\S]*?<\/header>/i, '');
    content = content.replace(/<!-- PIE DE PÁGINA INSTITUCIONAL -->[\s\S]*?<\/footer>/i, '');
    content = content.replace(/<!-- LOGICA DE NAVEGACIÓN ESTÁNDAR \(Fase 6\) -->[\s\S]*?<\/script>/i, '');

    content = content.replace(/<header[^>]*>[\s\S]*?<\/header>/i, '');
    content = content.replace(/<footer[^>]*>[\s\S]*?<\/footer>/i, '');

    content = content.replace(/(<body[^>]*>)/i, '$1\n' + headerTemplate(prefix));
    content = content.replace(/(<\/body>)/i, '\n' + footerTemplate(prefix) + '\n' + navScript + '\n$1');

    fs.writeFileSync(filePath, content);
    console.log(`Standardized: ${filePath} (prefix: ${prefix})`);
}

const files = process.argv.slice(2);
files.forEach(f => {
    if (f.endsWith('.html')) standardize(f);
});
