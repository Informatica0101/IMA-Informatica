# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: verify_dashboards.spec.js >> Teacher Dashboard Admin Section and Cascading Selectors
- Location: verify_dashboards.spec.js:3:1

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: "Hardware"
Received array: ["Introducción a la Informática", "Software y Sistemas Operativos", "Partes de la Computadora", "Periféricos de Entrada y Salida", "Seguridad Informática", "Procesadores de Texto", "Formato de texto y tablas", "Insertar/Formato de página", "Hojas de Cálculo"]
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "Escudo institucional del Área de Informática ISEMED ISEMED Área de Informática" [ref=e5] [cursor=pointer]:
        - /url: index.html
        - img "Escudo institucional del Área de Informática ISEMED" [ref=e6]
        - generic [ref=e7]:
          - heading "ISEMED" [level=1] [ref=e8]
          - paragraph [ref=e9]: Área de Informática
      - navigation [ref=e10]:
        - link "Inicio" [ref=e11] [cursor=pointer]:
          - /url: index.html
        - link "Portal" [ref=e12] [cursor=pointer]:
          - /url: teacher-dashboard.html
        - button "Cursos " [ref=e14] [cursor=pointer]:
          - text: Cursos
          - generic [ref=e15]: 
        - button "Contenido " [ref=e17] [cursor=pointer]:
          - text: Contenido
          - generic [ref=e18]: 
        - link "Actividades" [ref=e19] [cursor=pointer]:
          - /url: "#"
        - link "Pseudocódigo" [ref=e20] [cursor=pointer]:
          - /url: pseudocode.html
        - button "Mi perfil" [ref=e21] [cursor=pointer]
      - img "Bandera Nacional de Honduras" [ref=e23]
  - main [ref=e24]:
    - generic [ref=e25]:
      - generic [ref=e26]:
        - generic [ref=e27]:
          - heading "Panel de Gestión" [level=1] [ref=e28]
          - paragraph [ref=e29]: Bienvenido, Profesor
        - generic [ref=e30]:
          - generic [ref=e32]: ISE
          - generic [ref=e33]: Área de Informática
      - navigation [ref=e34]:
        - button "Entregas" [ref=e35] [cursor=pointer]
        - button "Reportes" [ref=e36] [cursor=pointer]
        - button "Actividades" [ref=e37] [cursor=pointer]
        - button "Proyectos" [ref=e38] [cursor=pointer]
        - button "Logros" [ref=e39] [cursor=pointer]
        - button "Noticias" [ref=e40] [cursor=pointer]
        - button "Administración" [active] [ref=e41] [cursor=pointer]
      - text: "Escribe la descripción de la tarea... Visit URL: EditRemove Escribe las instrucciones del examen... Visit URL: EditRemove"
      - generic [ref=e42]:
        - generic [ref=e44]:
          - heading "Administración del Sistema" [level=2] [ref=e45]
          - paragraph [ref=e46]: Cierre de Ciclo Escolar
        - generic [ref=e47]:
          - generic [ref=e48]:
            - generic [ref=e49]:
              - generic [ref=e51]: 
              - heading "Finalizar Año Escolar" [level=3] [ref=e52]
            - paragraph [ref=e53]:
              - text: Esta acción archivará todas las actividades del año actual, eliminará tareas, exámenes y entregas activas, y reiniciará los contadores para el nuevo ciclo escolar.
              - strong [ref=e54]: Esta acción no se puede deshacer.
            - generic [ref=e55]:
              - generic [ref=e56]: Formato de Respaldo Histórico
              - generic [ref=e57]:
                - combobox [ref=e58]:
                  - option "Formato Comprimido (.ZIP)" [selected]
                  - option "Formato Comprimido (.RAR)"
                  - option "Formato Comprimido (.7Z)"
                - button "Ejecutar Cierre" [ref=e59] [cursor=pointer]
          - generic [ref=e60]:
            - generic [ref=e61]:
              - generic [ref=e63]: 
              - heading "Gestión Académica" [level=3] [ref=e64]
            - generic [ref=e65]:
              - generic [ref=e66]:
                - generic [ref=e67]:
                  - generic [ref=e68]: Parcial Activo
                  - combobox [ref=e69]:
                    - option "Primer Parcial" [selected]
                    - option "Segundo Parcial"
                    - option "Tercer Parcial"
                    - option "Cuarto Parcial"
                - generic [ref=e70]:
                  - generic [ref=e71]: Grado Vigente
                  - combobox [ref=e72]:
                    - option "Décimo" [selected]
                    - option "Undécimo"
                    - option "Duodécimo"
                - generic [ref=e73]:
                  - generic [ref=e74]: Sección Vigente
                  - combobox [ref=e75]:
                    - option "A" [selected]
                    - option "B"
                    - option "C"
                - generic [ref=e76]:
                  - generic [ref=e77]: Asignatura Vigente
                  - combobox [ref=e78]:
                    - option "Informática I" [selected]
                - generic [ref=e79]:
                  - generic [ref=e80]: Tema Vigente
                  - combobox [ref=e81]:
                    - option "Introducción a la Informática" [selected]
                    - option "Software y Sistemas Operativos"
                    - option "Partes de la Computadora"
                    - option "Periféricos de Entrada y Salida"
                    - option "Seguridad Informática"
                    - option "Procesadores de Texto"
                    - option "Formato de texto y tablas"
                    - option "Insertar/Formato de página"
                    - option "Hojas de Cálculo"
              - button "Guardar Configuración" [ref=e82] [cursor=pointer]
          - generic [ref=e83]:
            - generic [ref=e84]:
              - generic [ref=e86]: 
              - heading "Banco de Preguntas" [level=3] [ref=e87]
            - paragraph [ref=e88]: Centraliza y administra todas las preguntas y actividades educativas desde Google Sheets.
            - button " Sincronizar / Migrar Banco" [ref=e90] [cursor=pointer]:
              - generic [ref=e91]: 
              - text: Sincronizar / Migrar Banco
          - generic [ref=e92]:
            - generic [ref=e93]:
              - generic [ref=e95]: 
              - heading "Promoción Estudiantil" [level=3] [ref=e96]
            - paragraph [ref=e97]: Al finalizar el año, las cuentas de los alumnos permanecen activas. Los estudiantes podrán actualizar su grado y sección la próxima vez que inicien sesión o intenten registrarse nuevamente con el mismo correo.
            - list [ref=e98]:
              - listitem [ref=e99]:
                - generic [ref=e100]: 
                - text: Los alumnos conservan sus credenciales.
              - listitem [ref=e101]:
                - generic [ref=e102]: 
                - text: Se detectarán cuentas existentes automáticamente.
              - listitem [ref=e103]:
                - generic [ref=e104]: 
                - text: Historial archivado disponible para el docente.
  - text: " Contenido de la noticia... Visit URL: EditRemove       "
  - contentinfo [ref=e105]:
    - generic [ref=e106]:
      - paragraph [ref=e107]:
        - text: © 2026 Área de Informática
        - strong [ref=e108]: ISEMED
        - text: .
      - paragraph [ref=e109]:
        - link "Privacidad" [ref=e110] [cursor=pointer]:
          - /url: "#"
        - text: "-"
        - link "Términos y Condiciones" [ref=e111] [cursor=pointer]:
          - /url: "#"
        - text: "-"
        - link "Contáctanos" [ref=e112] [cursor=pointer]:
          - /url: "#"
  - generic:
    - generic:
      - generic:
        - generic:
          - img
      - heading "Instalar en iOS" [level=3]
      - paragraph: "Para instalar esta aplicación en tu iPhone o iPad:"
      - generic:
        - generic:
          - generic: "1"
          - generic: "Busca en el menú de compartir la opción:"
        - generic:
          - generic: "2"
          - generic: "\"Añadir a la pantalla de inicio\""
      - button "Entendido"
  - text: "Visit URL: EditRemove"
```

# Test source

```ts
  1   | const { test, expect } = require('@playwright/test');
  2   |
  3   | test('Teacher Dashboard Admin Section and Cascading Selectors', async ({ page }) => {
  4   |     // Mock user login
  5   |     await page.addInitScript(() => {
  6   |         const user = { userId: 'teacher123', nombre: 'Profesor Test', rol: 'Profesor' };
  7   |         localStorage.setItem('currentUser', JSON.stringify(user));
  8   |
  9   |         // Mock presentation data for cascading selectors
  10  |         window.presentationData = [
  11  |             {
  12  |                 grade: 'Décimo',
  13  |                 sections: ['A', 'B'],
  14  |                 subjects: [
  15  |                     {
  16  |                         name: 'Informática I',
  17  |                         sections: ['A', 'B'],
  18  |                         partial: 'Segundo Parcial',
  19  |                         topics: [{ title: 'Hardware' }, { title: 'Software' }]
  20  |                     }
  21  |                 ]
  22  |             }
  23  |         ];
  24  |     });
  25  |
  26  |     await page.goto('http://localhost:8080/teacher-dashboard.html');
  27  |
  28  |     // Navigate to Admin Section
  29  |     await page.click('#nav-admin');
  30  |
  31  |     // Check if Admin form elements exist
  32  |     await expect(page.locator('#admin-parcial-actual')).toBeVisible();
  33  |     await expect(page.locator('#admin-grado-actual')).toBeVisible();
  34  |     await expect(page.locator('#admin-seccion-actual')).toBeVisible();
  35  |     await expect(page.locator('#admin-asignatura-vigente')).toBeVisible();
  36  |     await expect(page.locator('#admin-tema-vigente')).toBeVisible();
  37  |
  38  |     // Verify cascading logic (mocked data will populate)
  39  |     await page.selectOption('#admin-grado-actual', 'Décimo');
  40  |     await page.selectOption('#admin-seccion-actual', 'A');
  41  |
  42  |     // Asignatura and Tema should be populated
  43  |     const asigOptions = await page.locator('#admin-asignatura-vigente option').allTextContents();
  44  |     expect(asigOptions).toContain('Informática I');
  45  |
  46  |     const temaOptions = await page.locator('#admin-tema-vigente option').allTextContents();
> 47  |     expect(temaOptions).toContain('Hardware');
      |                         ^ Error: expect(received).toContain(expected) // indexOf
  48  | });
  49  |
  50  | test('Student Dashboard Sidebar and Subject Selection', async ({ page }) => {
  51  |     // Mock user login
  52  |     await page.addInitScript(() => {
  53  |         const user = { userId: 'student123', nombre: 'Estudiante Test', rol: 'Estudiante', grado: 'Décimo', seccion: 'A' };
  54  |         localStorage.setItem('currentUser', JSON.stringify(user));
  55  |
  56  |         // GLOBAL_SCOPE mock
  57  |         window.GLOBAL_SCOPE = {
  58  |             ParcialActual: "Segundo Parcial",
  59  |             GradoActual: "Décimo",
  60  |             SeccionActual: "A",
  61  |             AsignaturaActual: "Informática I",
  62  |             TemaActual: "Hardware"
  63  |         };
  64  |
  65  |         // Mock API responses
  66  |         window.fetch = async (url, options) => {
  67  |             const body = JSON.parse(options.body);
  68  |             if (body.action === 'getStudentTasks') {
  69  |                 return {
  70  |                     ok: true,
  71  |                     headers: { get: () => 'application/json' },
  72  |                     text: async () => JSON.stringify({
  73  |                         status: 'success',
  74  |                         data: [
  75  |                             { tareaId: 't1', titulo: 'Tarea 1', asignatura: 'Informática I', parcial: 'Segundo Parcial' },
  76  |                             { tareaId: 't2', titulo: 'Tarea 2', asignatura: 'Diseño Web', parcial: 'Primer Parcial' }
  77  |                         ]
  78  |                     })
  79  |                 };
  80  |             }
  81  |             if (body.action === 'getAcademicConfig') {
  82  |                 return {
  83  |                     ok: true,
  84  |                     headers: { get: () => 'application/json' },
  85  |                     text: async () => JSON.stringify({ status: 'success', data: window.GLOBAL_SCOPE })
  86  |                 };
  87  |             }
  88  |             return { ok: true, headers: { get: () => 'application/json' }, text: async () => JSON.stringify({ status: 'success', data: [] }) };
  89  |         };
  90  |     });
  91  |
  92  |     await page.goto('http://localhost:8080/student-dashboard.html');
  93  |
  94  |     // Sidebar should be visible
  95  |     await expect(page.locator('#student-sidebar')).toBeVisible();
  96  |
  97  |     // Subject "Informática I" should be in the sidebar (filtered by active parcial)
  98  |     const sidebarItems = await page.locator('#subject-sidebar-nav .subject-nav-item').allTextContents();
  99  |     expect(sidebarItems.some(item => item.includes('Informática I'))).toBeTruthy();
  100 |     expect(sidebarItems.some(item => item.includes('Diseño Web'))).toBeFalsy(); // Different parcial
  101 |
  102 |     // Check for "Tarea 1"
  103 |     await expect(page.locator('text=Tarea 1')).toBeVisible();
  104 | });
  105 |
```