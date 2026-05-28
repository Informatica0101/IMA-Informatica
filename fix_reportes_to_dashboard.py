with open('js/teacher.js', 'r') as f:
    js = f.read()

# Requirement: Reportes shows the academic table (hierarchical view).
js = js.replace(
    '''    navReportes.addEventListener('click', () => {
        navigateTo(sectionDashboard, navReportes);
        // Reset hierarchy to top when entering Reports
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
# It seems correct but let me ensure navExcel is separate if needed.
# Requirement: "La sección “Reportes” y “Exportar Excel” deben ser una sola sección."
# So I'll keep the nav-excel button but maybe it should just be inside the Reports section?
# User says: "Debe existir un botón: “Exportar Excel” que genere exactamente la información visible actualmente en la tabla."

with open('js/teacher.js', 'w') as f:
    f.write(js)
