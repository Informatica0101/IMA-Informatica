with open('js/teacher.js', 'r') as f:
    content = f.read()

# Fix the final initialization
content = content.replace(
    '    fetchTeacherActivity();',
    '    navigateTo(sectionEntregas, navDashboard); fetchEntregasRecientes(); fetchTeacherActivity();'
)

with open('js/teacher.js', 'w') as f:
    f.write(content)
