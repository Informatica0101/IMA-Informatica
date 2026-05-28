with open('teacher-dashboard.html', 'r') as f:
    html = f.read()

# Merge section-reportes content into section-academic-reports
import re
section_excel = re.search(r'<section id="section-reportes".*?</section>', html, re.DOTALL).group(0)
html = html.replace(section_excel, "")

# Append excel tools at the end of section-academic-reports
# First find where section-academic-reports ends
html = html.replace('</section>\n\n            <section id="section-tareas"', section_excel + '\n            </section>\n\n            <section id="section-tareas"')
# Wait, I just need to add the button and filters to the hierarchical view?
# "La sección “Reportes” y “Exportar Excel” deben ser una sola sección."

with open('teacher-dashboard.html', 'w') as f:
    f.write(html)
