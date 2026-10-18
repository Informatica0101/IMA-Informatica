# TAREAS ADICIONALES PENDIENTES DE AUDITORÍA TRANSVERSAL
**Plataforma Integral de Gestión Educativa — New Generation Christian Academy**

---

### [REQ-OMNI-001] Barra de Búsqueda Omnibox Unificada Global (Ctrl + K / Cmd + K)
- **Origen del Hallazgo:** AUDITORIA_INFRAESTRUCTURA_TRANSVERSAL.md (Auditoría Funcional de Infraestructura Transversal)
- **Severidad/Clasificación:** Medio
- **Archivos Involucrados:** `js/ui-common.js`, `teacher-dashboard.html`, `student-dashboard.html`, `backend/user-service/Code.gs`
- **Dependencias Expuestas:** `getInstitutionalReportCatalog`, `findDuplicateStudents`, `searchGlobalOmnibox`, `getUserVerifiedRole`
- **Descripción del Alcance:**
  1. Crear la función `searchGlobalOmnibox` en `backend/user-service/Code.gs` para consultar simultáneamente estudiantes, empleados, trámites, comunicaciones y documentos respetando los permisos RBAC del usuario autenticado.
  2. Implementar el modal de búsqueda universal omnibox `#modal-global-omnibox` en `js/ui-common.js` con atajo de teclado (`Ctrl + K` / `Cmd + K`) e icono accesible en los encabezados de los dashboards.
  3. Desplegar los resultados categorizados con accesibilidad por teclado y redirección directa a la ficha/módulo correspondiente.
- **Criterios de Aceptación:**
  - Búsqueda global unificada funcional desde cualquier vista.
  - Permisos RBAC aplicados server-side en `searchGlobalOmnibox`.
  - Atajo de teclado `Ctrl + K` operativo.
- **Estado:** [ ] Pendiente
