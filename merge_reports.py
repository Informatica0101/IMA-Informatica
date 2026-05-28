with open('teacher-dashboard.html', 'r') as f:
    content = f.read()

# Requirement: Reports and Excel Export are one section.
# I'll add the hierarchical table into section-reportes too?
# Or just rename nav and sections.
# Better: nav-reportes shows section-dashboard (renamed to section-academic-reports).

content = content.replace('id="section-dashboard"', 'id="section-academic-reports"')
content = content.replace('nav-reportes', 'nav-reports-old')
content = content.replace('nav-excel', 'nav-reportes')

with open('teacher-dashboard.html', 'w') as f:
    f.write(content)

with open('js/teacher.js', 'r') as f:
    js = f.read()

js = js.replace('sectionDashboard', 'sectionAcademicReports')
js = js.replace('navReportes', 'navReportsOld')
js = js.replace('navExcel', 'navReportes')

with open('js/teacher.js', 'w') as f:
    f.write(js)
