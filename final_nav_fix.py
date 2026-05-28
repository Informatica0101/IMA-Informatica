with open('teacher-dashboard.html', 'r') as f:
    html = f.read()

# Requirement: Only 5 buttons: Entregas, Tareas y Exámenes, Proyectos PSeInt, Logros/Juegos, Noticias, Reportes
# Currently I might have an extra one.
# Desktop Nav
html = html.replace('nav-reports-old', 'nav-to-remove')
import re
html = re.sub(r'<button id="nav-to-remove".*?</button>', "", html)

with open('teacher-dashboard.html', 'w') as f:
    f.write(html)
