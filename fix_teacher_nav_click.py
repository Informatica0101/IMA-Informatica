with open('js/teacher.js', 'r') as f:
    content = f.read()

content = content.replace(
    '''    navDashboard.addEventListener('click', () => {
        navigateTo(sectionDashboard, navDashboard);
        navStack = [{ level: 'Grados', data: null }];
        fetchTeacherActivity();
    });''',
    '''    navDashboard.addEventListener('click', () => {
        navigateTo(sectionEntregas, navDashboard);
        fetchEntregasRecientes();
    });'''
)

with open('js/teacher.js', 'w') as f:
    f.write(content)
