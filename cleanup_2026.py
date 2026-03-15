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

def clean_file(filepath):
    if not os.path.exists(filepath):
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Clean up CSS: Consolidate blocks and remove duplicates
    # We want to keep the AUMENTADO 50% block but remove the old duplicated ones below it
    css_pattern = r'/\* Escalado de fuente base \(AUMENTADO 50%\) y mejora de interlineado \*/\n\s*\.slide h2 \{.*?\n\s*\.slide h3 \{.*?\n\s*\.slide p, \.slide li \{.*?\n\s*\.slide img \{.*?\n\n\s*\.slide h3 \{.*?\n\s*\.slide p, \.slide li \{.*?\n\s*\.slide img \{.*?\}'

    replacement_css = """/* Escalado de fuente base (AUMENTADO 50%) y mejora de interlineado */
        .slide h2 { font-size: clamp(2.2rem, 9vw, 3.5rem) !important; line-height: 1.4 !important; margin-bottom: 1.5rem !important; }
        .slide h3 { font-size: clamp(1.7rem, 7vw, 2.6rem) !important; line-height: 1.4 !important; margin-bottom: 1.2rem !important; }
        .slide p, .slide li { font-size: clamp(1.2rem, 4.5vw, 1.8rem) !important; line-height: 1.6 !important; margin-bottom: 1.2rem !important; }
        .slide img { max-height: 55vh; object-fit: contain; margin: 1rem auto; }"""

    content = re.sub(css_pattern, replacement_css, content, flags=re.DOTALL)

    # 2. Refine responsive media query to avoid jumpy fonts
    media_pattern = r'@media \(max-width: 768px\) \{ \.slide h2, \.slide h3 \{ font-size: 2rem !important; line-height: 1.3 !important; \} \.slide p, \.slide li \{ font-size: 1.3rem !important; line-height: 1.5 !important; \} \.nav-button \{ padding: 0.4rem 0.8rem; font-size: 0.8rem; \} \}'
    # Adjusting to a more fluid override or removing it if clamp handles it well.
    # Let's keep the nav-button fix but soften the font overrides.
    replacement_media = '@media (max-width: 768px) { .nav-button { padding: 0.4rem 0.8rem; font-size: 0.8rem; } }'
    content = re.sub(media_pattern, replacement_media, content)

    # 3. Clean up JS: Remove triple listeners
    # Locate the duplicated blocks
    js_listeners_block = r"""    document\.addEventListener\('fullscreenchange', handleFullscreenChange\);
    document\.addEventListener\('webkitfullscreenchange', handleFullscreenChange\);
    document\.addEventListener\('mozfullscreenchange', handleFullscreenChange\);
    document\.addEventListener\('MSFullscreenChange', handleFullscreenChange\);
    window\.addEventListener\('resize', handleFullscreenChange\);

    document\.addEventListener\('webkitfullscreenchange', handleFullscreenChange\);
    document\.addEventListener\('mozfullscreenchange', handleFullscreenChange\);
    document\.addEventListener\('MSFullscreenChange', handleFullscreenChange\);
    window\.addEventListener\('resize', handleFullscreenChange\);

    document\.addEventListener\('webkitfullscreenchange', handleFullscreenChange\);
    document\.addEventListener\('mozfullscreenchange', handleFullscreenChange\);
    document\.addEventListener\('MSFullscreenChange', handleFullscreenChange\);
    window\.addEventListener\('resize', handleFullscreenChange\);"""

    clean_js_listeners = """    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    window.addEventListener('resize', handleFullscreenChange);"""

    content = re.sub(js_listeners_block, clean_js_listeners, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Cleaned: {filepath}")

for f in files_2026:
    clean_file(f)
