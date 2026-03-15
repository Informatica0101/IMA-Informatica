import os
import re

files_2026 = [
    "III_BTP_A/alineacion_formato_texto.html",
    "III_BTP_A/fuentes_color_fondo.html",
    "III_BTP_A/hipervinculos_imagenes.html",
    "III_BTP_A/introduccion_diseno_web.html",
    "III_BTP_A/listas_comentarios_html.html",
    "III_BTP_A/terminologia_basica_html_css.html",
    "II_BTP_A/Programacion/analisis_diseno_algoritmos.html",
    "II_BTP_A/Programacion/clasificacion_etapas_algoritmos.html",
    "II_BTP_A/Programacion/estrategias_solucion_problemas.html",
    "II_BTP_A/Programacion/introduccion_programacion.html",
    "II_BTP_A/Programacion/programacion_representacion.html",
    "II_BTP_A/Programacion/pseudocodigo_ordenacion.html"
]

good_css = """
        /* Typography Scaling (AUMENTADO 50%) */
        .slide h2 { font-size: clamp(2.5rem, 10vw, 4rem) !important; line-height: 1.3 !important; margin-bottom: 1.5rem !important; }
        .slide h3 { font-size: clamp(2rem, 8vw, 3.1rem) !important; line-height: 1.3 !important; margin-bottom: 1.2rem !important; }
        .slide p, .slide li { font-size: clamp(1.4rem, 5vw, 2.2rem) !important; line-height: 1.6 !important; margin-bottom: 1.2rem !important; }
        .slide img { max-height: 50vh; object-fit: contain; margin: 1rem auto; }

        /* Box Typography Scaling (AUMENTADO 50% y Forzado) */
        .concept-box, .step-box, .code-box, .quiz-option-button, .example-container, .feature-card,
        .concept-box *, .step-box *, .code-box *, .quiz-option-button *, .example-container *, .feature-card * {
            font-size: clamp(1.2rem, 4.5vw, 1.8rem) !important;
            line-height: 1.5 !important;
        }

        /* Fullscreen UI Hiding Logic */
        body.is-fullscreen header,
        body.is-fullscreen footer,
        body.is-fullscreen [id*="header"],
        body.is-fullscreen [id*="footer"],
        body.is-fullscreen .logo-fixed,
        body.is-fullscreen .xp-taskbar,
        body.is-fullscreen .nav-buttons,
        body.is-fullscreen .mobile-nav-buttons {
            display: none !important;
        }
        body.is-fullscreen main { padding: 0 !important; margin: 0 !important; }
        body.is-fullscreen #presentation-container {
            height: 100vh !important;
            width: 100vw !important;
            max-width: 100vw !important;
            margin: 0 !important;
            border-radius: 0 !important;
        }

        @media (max-width: 768px) {
            .nav-button { padding: 0.5rem 1rem; font-size: 0.9rem; }
            .slide h2 { font-size: 2.2rem !important; }
            .slide p, .slide li { font-size: 1.3rem !important; }
        }
"""

good_js = """
    function handleFullscreenChange() {
        const isFS = !!(document.fullscreenElement ||
                      document.webkitFullscreenElement ||
                      document.mozFullScreenElement ||
                      document.msFullscreenElement ||
                      (window.innerHeight >= screen.height - 10));

        if (isFS) {
            document.body.classList.add('is-fullscreen');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.classList.remove('is-fullscreen');
            document.body.style.overflow = '';
        }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    window.addEventListener('resize', handleFullscreenChange);

    // Navigation Improvements (Keyboards & Touch)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') typeof showSlide === 'function' ? showSlide(currentSlideIndex + 1) : null;
        if (e.key === 'ArrowLeft') typeof showSlide === 'function' ? showSlide(currentSlideIndex - 1) : null;
    });

    (function() {
        const container = document.getElementById('presentation-container');
        if (!container) return;
        let tsX = 0;
        container.addEventListener('touchstart', e => { tsX = e.changedTouches[0].screenX; }, {passive: true});
        container.addEventListener('touchend', e => {
            let teX = e.changedTouches[0].screenX;
            if (tsX - teX > 50) typeof showSlide === 'function' ? showSlide(currentSlideIndex + 1) : null;
            if (teX - tsX > 50) typeof showSlide === 'function' ? showSlide(currentSlideIndex - 1) : null;
        }, {passive: true});
    })();

    // Initial check
    handleFullscreenChange();
"""

def apply(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Clean Tailwind
    content = re.sub(r'<script src="https://cdn\.tailwindcss\.com">.*?</script>',
                     '<script src="https://cdn.tailwindcss.com"></script>',
                     content, flags=re.DOTALL)

    # 2. Extract original style rules by removing the existing @media block and adding ours
    # Find style block
    style_match = re.search(r'<style>(.*?)</style>', content, flags=re.DOTALL)
    if style_match:
        inner_style = style_match.group(1)
        # Remove original mobile media query to prevent double definition or stray braces
        inner_style = re.sub(r'@media \(max-width: 768px\) \{.*?\}', '', inner_style, flags=re.DOTALL)
        # Append our good CSS
        new_style = inner_style.rstrip() + "\n" + good_css
        content = content[:style_match.start()] + "<style>" + new_style + "\n    </style>" + content[style_match.end():]

    # 3. Handle Script
    # Remove original handleFullscreenChange and its listeners
    # They usually start with function handleFullscreenChange and end with MSFullscreenChange listener
    js_junk_pattern = r'function handleFullscreenChange.*?MSFullscreenChange\', handleFullscreenChange\);'
    content = re.sub(js_junk_pattern, '', content, flags=re.DOTALL)

    # Remove swipe/touch logic if it exists (we'll replace with our improved one)
    content = re.sub(r'\(function\(\) \{.*?\}\)\(\);', '', content, flags=re.DOTALL)

    # Inject our good JS before </body>
    # Actually, inject into the LAST script tag.
    script_matches = list(re.finditer(r'</script>', content))
    if script_matches:
        last_pos = script_matches[-1].start()
        content = content[:last_pos] + "\n" + good_js + "\n" + content[last_pos:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Applied: {filepath}")

for f in files_2026:
    apply(f)
