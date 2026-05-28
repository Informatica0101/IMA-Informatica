import re

with open('teacher-dashboard.html', 'r') as f:
    html = f.read()

# 1. Rename Dashboard to Entregas
html = html.replace('>Dashboard</button>', '>Entregas</button>')
html = html.replace('id="dashboard-level-title">Navegación Académica', 'id="dashboard-level-title">Gestión de Entregas')

# 2. Re-arrange navigation to: Grados -> Secciones -> Parcial -> Asignatura -> Lista de alumnos
# This is mainly in JS, but let's check IDs in HTML.

# 3. Rename section-operational-dashboard back or keep as the operational hub
# The requirement: "Dashboard" (now Entregas) is the quick hub.
# But then it says "Navegación obligatoria: Grados -> Sección -> Parcial -> Asignatura -> Lista de alumnos"
# which applies to Entregas.

# Let's rename the operational section ID to section-entregas
html = html.replace('id="section-operational-dashboard"', 'id="section-entregas"')
html = html.replace('Panel Operativo: Pendientes de Revisión', 'Entregas Recientes (Pendientes)')

with open('teacher-dashboard.html', 'w') as f:
    f.write(html)

with open('js/teacher.js', 'r') as f:
    js = f.read()

# Fix scope and rename variables
js = js.replace('sectionOperationalDashboard', 'sectionEntregas')

# Ensure Entregas is the first tab
js = js.replace(
    'const allSections = [sectionEntregas, sectionDashboard, sectionTareas, sectionProyectos, sectionLogros, sectionNews, sectionReportes];',
    'const allSections = [sectionEntregas, sectionDashboard, sectionTareas, sectionProyectos, sectionLogros, sectionNews, sectionReportes];' # already set
)

# Update navDashboard (now Entregas)
js = js.replace(
    '''    navDashboard.addEventListener('click', () => {
        navigateTo(sectionEntregas, navDashboard);
        fetchOperationalDashboard();
    });''',
    '''    navDashboard.addEventListener('click', () => {
        navigateTo(sectionEntregas, navDashboard);
        fetchEntregasRecientes();
    });'''
)
js = js.replace('function fetchOperationalDashboard', 'function fetchEntregasRecientes')

# Update navReportes to handle the hierarchical view
js = js.replace(
    '''    navReportes.addEventListener('click', () => {
        navigateTo(sectionDashboard, navReportes);
        navStack = [{ level: 'Grados', data: null }];
        renderCurrentLevel();
    });''',
    '''    navReportes.addEventListener('click', () => {
        navigateTo(sectionDashboard, navReportes);
        // Reset hierarchy to top when entering Reports
        navStack = [{ level: 'Grados', data: null }];
        renderCurrentLevel();
    });'''
)

with open('js/teacher.js', 'w') as f:
    f.write(js)

print("HTML/JS Structural Refactor Complete.")
