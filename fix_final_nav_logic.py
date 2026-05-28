with open('js/teacher.js', 'r') as f:
    js = f.read()

# Simplified nav listeners
nav_logic = '''
    navDashboard.addEventListener('click', () => {
        navigateTo(sectionEntregas, navDashboard);
        fetchEntregasRecientes();
    });
    navTareas.addEventListener('click', () => {
        navigateTo(sectionTareas, navTareas);
        tareasListView.classList.remove('hidden');
        tareasCreateView.classList.add('hidden');
        fetchManagementData();
    });
    navProyectos.addEventListener('click', () => {
        navigateTo(sectionProyectos, navProyectos);
        fetchProjects();
    });
    navLogros.addEventListener('click', () => {
        navigateTo(sectionLogros, navLogros);
        fetchLogros();
    });
    navNews.addEventListener('click', () => {
        navigateTo(sectionNews, navNews);
        fetchNewsManagement();
    });
    navReportes.addEventListener('click', () => {
        navigateTo(sectionAcademicReports, navReportes);
        navStack = [{ level: 'Grados', data: null }];
        renderCurrentLevel();
    });
'''

# Use regex to replace the entire nav listeners block
import re
js = re.sub(r"navDashboard\.addEventListener\('click',.*?\);\s+navReportes\.addEventListener\('click',.*?\);", nav_logic, js, flags=re.DOTALL)

with open('js/teacher.js', 'w') as f:
    f.write(js)

print("Final Nav Logic Applied.")
