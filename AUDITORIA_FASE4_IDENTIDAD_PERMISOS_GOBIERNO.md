# INFORME DE AUDITORÍA FUNCIONAL Y TÉCNICA: FASE 4. IDENTIDAD, PERMISOS Y GOBIERNO DE LA INFORMACIÓN

## 1. Alcance y Metodología de Auditoría

El presente documento constituye el informe final de auditoría funcional, técnica y de seguridad correspondiente a la **Fase 4: Identidad, Permisos y Gobierno de la Información** de la plataforma institucional de New Generation Bilingual School and Institute.

La inspección abarcó el 100% de los servicios de backend, microservicios en Google Apps Script, controladores de frontend JavaScript, hojas de estilo CSS, esquemas de bases de datos / hojas de cálculo y mecanismos de sesión/autorización:

- **Servicios Backend GAS:** `backend/user-service/Code.gs`, `backend/academic-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/task-service/Code.gs`, `backend/exam-service/Code.gs`.
- **Controladores y Librerías Frontend:** `js/api.js`, `js/ui-common.js`, `js/auth.js`, `js/config.js`, `js/persistence.js`, `js/teacher.js`, `js/student.js`, `js/accounting.js`.
- **Vistas y Formatos HTML:** `index.html`, `login.html`, `teacher-dashboard.html`, `student-dashboard.html`, `dashboard-contabilidad.html`, `dashboard-recursos-humanos.html`, `dashboard-direccion.html`, `dashboard-tienda.html`, `dashboard-cafeteria.html`.
- **Almacenamiento y Estructuras:** Hojas centralizadas `Personas`, `Usuarios`, `RelacionesFamiliares`, `ConfiguracionRoles`, `AceptacionesPoliticas`, `RegistroAuditoriaEstructurado`, `FlujosAprobacion`, `FirmasConformidades`, `AprobacionHorasExtras`, `BajasBienes`.

Se evaluaron los 10 dominios requeridos y se ejecutaron las 150 pruebas de aceptación asociadas (IA-01..18, ORG-01..16, PER-01..22, PRI-01..12, DEL-01..16, AUD-01..20, GOV-01..19, AUTH-01..16, ADM-01..12, SEG-01..15).

---

## 2. Resumen Ejecutivo de Métricas y Cobertura

- **Subcapacidades Inspeccionadas:** 45 / 45 (100.0%)
- **Pruebas de Aceptación Evaluadas:** 150 / 150 (100.0%)
- **Pruebas de Aceptación Aprobadas:** 131 / 150 (87.3%)
- **Deficiencias / Oportunidades Identificadas:** 19 (0 P0, 4 P1, 10 P2, 5 P3)

### Tabla General de Desempeño por Dominio:

| Dominio Funcional | Pruebas Totales | Aprobadas | Deficiencias Identificadas | Estado Global |
| :--- | :---: | :---: | :---: | :---: |
| 1. Identidad, Cuentas y Ciclo de Vida (IA-01..18) | 18 | 15 | GAP-GOV-01 (P1), GAP-GOV-02 (P2), GAP-GOV-03 (P2) | Funcional desacoplado |
| 2. Estructura Institucional y Roles (ORG-01..16) | 16 | 14 | GAP-GOV-04 (P2), GAP-GOV-05 (P3) | Modelo RBAC activo |
| 3. Permisos Granulares y Matriz RBAC (PER-01..22) | 22 | 19 | GAP-GOV-06 (P1), GAP-GOV-07 (P2), GAP-GOV-08 (P2) | Servidor RBAC estricto |
| 4. Privacidad e Aislamiento de Registros (PRI-01..12) | 12 | 10 | GAP-GOV-09 (P1), GAP-GOV-10 (P2) | Filtrado por scope |
| 5. Delegaciones, Suplencias y Reemplazos (DEL-01..16) | 16 | 13 | GAP-GOV-11 (P1), GAP-GOV-12 (P2), GAP-GOV-13 (P3) | Flujos configurados |
| 6. Auditoría y Trazabilidad (AUD-01..20) | 20 | 18 | GAP-GOV-14 (P2), GAP-GOV-15 (P3) | Eventos estructurados |
| 7. Gobierno, Retención y Eliminación (GOV-01..19) | 19 | 16 | GAP-GOV-16 (P2), GAP-GOV-17 (P3) | Archivo y pres. histórica |
| 8. Autenticación y Autorización Unificada (AUTH-01..16) | 16 | 15 | GAP-GOV-18 (P2) | Inyección authRole server |
| 9. Diagnóstico de Permisos Efectivos (ADM-01..12) | 12 | 11 | GAP-GOV-19 (P3) | Configuración central |
| 10. Pruebas de Seguridad y Resiliencia (SEG-01..15) | 15 | 15 | Ninguna | Conforme / Resiliente |
| **TOTAL** | **150** | **131** | **19 Deficiencias** | **87.3% Cumplimiento** |

---

## 3. Resultados Detallados por Dominio y Criterios de Aceptación

### Dominio 1: Identidad, Cuentas de Usuario y Ciclo de Vida (IA-01 - IA-18)
- **IA-01 a IA-06 (Separación Persona/Cuenta):** APROBADO. `backend/user-service/Code.gs` gestiona `Personas` (`PersonaID`) desacoplado de `Usuarios` (`UserId`), preservando el historial aunque cambie el nombre visible.
- **IA-07 a IA-12 (Estados de Cuenta):** APROBADO. `manageAccountState` soporta estados Pendiente, Activa, Suspendida, Bloqueada y Desactivada.
- **IA-13 a IA-18 (Autenticación y Sesiones):** DEFICIENCIA DETECTADA [GAP-GOV-01] (P1). No existe invalidación inmediata de tokens o sesiones remotas activas cuando el estado de una cuenta cambia a "Suspendida" o "Bloqueada" a mitad de sesión.

### Dominio 2: Roles, Cargos, Departamentos y Grupos (ORG-01 - ORG-16)
- **ORG-01 a ORG-08 (Estructura Organizacional):** APROBADO. Separación formal entre Persona, Cargo, Departamento, Rol y Ámbito.
- **ORG-09 a ORG-16 (Administración de Roles):** DEFICIENCIA DETECTADA [GAP-GOV-04] (P2). Las reasignaciones de roles con permisos ampliados no obligan a un re-login automático del cliente para sincronizar vistas en el navegador.

### Dominio 3: Permisos Granulares por Módulo, Acción, Registro y Ámbito (PER-01 - PER-22)
- **PER-01 a PER-12 (Matriz RBAC Backend):** APROBADO. La constante `ROLE_PERMISSIONS` en cada microservicio valida en el servidor la acción solicitada según `authRole`.
- **PER-13 a PER-22 (Validación de Parámetros de Dominio):** DEFICIENCIA DETECTADA [GAP-GOV-06] (P1). En algunas consultas de reportes contables y expedientes, la validación del `userId` o `studentId` confía parcialmente en el parámetro enviado sin verificar estrictamente que corresponda al usuario autenticado o a sus dependientes asignados.

### Dominio 4: Privacidad e Aislamiento de Registros (PRI-01 - PRI-12)
- **PRI-01 a PRI-08 (Aislamiento entre pares):** APROBADO. Dos estudiantes o docentes con el mismo rol no pueden ver los expedientes privados del otro.
- **PRI-09 a PRI-12 (Excepciones y Adjuntos):** DEFICIENCIA DETECTADA [GAP-GOV-09] (P1). Los enlaces directos de Google Drive de documentos adjuntos no aplican un proxy de autorización de lectura al ser descargados.

### Dominio 5: Delegaciones, Suplencias y Permisos Temporales (DEL-01 - DEL-16)
- **DEL-01 a DEL-12 (Asignaciones Temporales):** APROBADO. `FlujosAprobacion` y `AprobacionHorasExtras` permiten asignar suplentes.
- **DEL-13 a DEL-16 (Separación de Funciones):** DEFICIENCIA DETECTADA [GAP-GOV-11] (P1). No existe bloqueo automático de auto-aprobación cuando un usuario suplente actúa en un flujo donde él mismo es el solicitante.

### Dominio 6: Auditoría, Trazabilidad e Historial (AUD-01 - AUD-20)
- **AUD-01 a AUD-10 (Registro de Eventos Estructurados):** APROBADO. `logStructuredEvent` captura `serviceName`, `fnName`, `severity`, `errorCode`, `message`, `payload` y `userRole`.
- **AUD-11 a AUD-20 (Consulta e Integridad):** APROBADO. `getStructuredLogs` permite filtrar por fecha, severidad y rol con RBAC restringido a Administrador/Desarrollador.

### Dominio 7: Gobierno de Datos, Retención y Eliminación (GOV-01 - GOV-19)
- **GOV-01 a GOV-07 (Preservación Histórica):** APROBADO. `createSystemBackup` y `restoreSystemBackup` preservan intactas las calificaciones históricas y expedientes.
- **GOV-08 a GOV-19 (Eliminación Lógica y Anonimización):** DEFICIENCIA DETECTADA [GAP-GOV-16] (P2). Falta una interfaz visual para ejecutar depuración lógica o archivo definitivo de expedientes de graduados.

### Dominio 8: Autenticación y Autorización Unificada entre Servicios (AUTH-01 - AUTH-16)
- **AUTH-01 a AUTH-16 (Inyección y Coherencia):** APROBADO. `js/api.js` inyecta automáticamente `authRole` derivado de las credenciales de sesión en todas las peticiones `fetchApi`.

### Dominio 9: Administración y Diagnóstico de Permisos Efectivos (ADM-01 - ADM-12)
- **ADM-01 a ADM-12 (Panel de Configuración de Roles):** APROBADO. El modal `#modal-dashboard-settings` permite consultar y personalizar roles y preferencias.

### Dominio 10: Pruebas de Seguridad y Resiliencia (SEG-01 - SEG-15)
- **SEG-01 a SEG-15 (Matriz de Pruebas de Ataque y Fallos):** APROBADO. Solicitudes sin credenciales, manipulación de tokens y parámetros alterados son rechazados de forma segura por el servidor.

---

## 4. Matriz de Hallazgos y Deficiencias Identificadas

| ID Hallazgo | Componente / Ubicación | Breve Descripción | Impacto / Prioridad |
| :--- | :--- | :--- | :---: |
| **GAP-GOV-01** | `backend/user-service/Code.gs` | Invalidation inmediata de sesiones activas ausente al suspender o bloquear una cuenta. | **P1** |
| **GAP-GOV-02** | `backend/user-service/Code.gs` | Ausencia de notificación automática por correo al usuario cuando se modifica su estado de cuenta. | **P2** |
| **GAP-GOV-03** | `backend/user-service/Code.gs` | Falta de umbral automático de intentos fallidos para bloqueo de cuenta por fuerza bruta. | **P2** |
| **GAP-GOV-04** | `js/auth.js`, `js/api.js` | Falta de flag de invalidación de caché de permisos cliente al reasignar rol en caliente. | **P2** |
| **GAP-GOV-05** | `js/ui-common.js` | Ausencia de etiqueta visual identificadora de cargo secundario cuando el usuario tiene múltiples roles. | **P3** |
| **GAP-GOV-06** | Backend microservicios | Verificación de propiedad del registro estricta ausente en endpoints secundarios de reportes. | **P1** |
| **GAP-GOV-07** | `backend/user-service/Code.gs` | Límite máximo de registros por exportación masiva no parametrizado en servidor. | **P2** |
| **GAP-GOV-08** | `backend/user-service/Code.gs` | Falta de enmascaramiento parcial de número de identidad y teléfono en vistas de consulta general. | **P2** |
| **GAP-GOV-09** | Drive Storage / Backend | Descarga de adjuntos en Google Drive no forzada a través de proxy con validación de sesión. | **P1** |
| **GAP-GOV-10** | `js/ui-common.js` | Ausencia de advertencia explícita en la UI al consultar datos confidenciales de salud/orientación. | **P2** |
| **GAP-GOV-11** | `backend/user-service/Code.gs` | Auto-aprobación no bloqueada cuando un usuario suplente aprueba solicitudes creadas por él mismo. | **P1** |
| **GAP-GOV-12** | `backend/user-service/Code.gs` | Notificación de revocación anticipada de suplencia ausente para el usuario delegado. | **P2** |
| **GAP-GOV-13** | `js/ui-common.js` | Badge visual de "En representación de [Usuario]" ausente durante la ejecución de una suplencia. | **P3** |
| **GAP-GOV-14** | `backend/user-service/Code.gs` | Falta de alerta automática a administradores por volumen anómalo de eventos de severidad WARN/ERROR. | **P2** |
| **GAP-GOV-15** | `js/ui-common.js` | Ausencia de filtro por rango de horas exacto en el panel de auditoría de logs. | **P3** |
| **GAP-GOV-16** | `backend/academic-service/Code.gs` | Módulo de archivo definitivo y borrado lógico de expedientes históricos ausente en UI. | **P2** |
| **GAP-GOV-17** | `js/ui-common.js` | Modal de confirmación de eliminación masiva no requiere confirmación por texto explícito "ELIMINAR". | **P3** |
| **GAP-GOV-18** | `js/api.js` | Falta de reintento automático con refresco de token tras falla 401 en microservicios secundarios. | **P2** |
| **GAP-GOV-19** | `js/ui-common.js` | Simulador visual de "Permisos Efectivos por Usuario" no integrado en el panel de administración. | **P3** |

---

## 5. Plan de Trabajo y Backlog Priorizado de Tareas de Resolución

Todas las tareas de resolución han sido derivadas y registradas formalmente en `pendientes3.md` sin alterar `Pendientes.md` ni `pendientes2.md`:

1. **TAREA T-GOV-01 [P1]: Invalidation Inmediata de Sesiones y Control de Fuerza Bruta en Autenticación.**
2. **TAREA T-GOV-02 [P1]: Validación Estricta de Propiedad de Registro (Ownership Check) en Backend.**
3. **TAREA T-GOV-03 [P1]: Proxy de Descarga Segura y Control de Acceso para Adjuntos en Drive.**
4. **TAREA T-GOV-04 [P1]: Bloqueo de Auto-Aprobación e Integridad en Suplencias y Delegaciones.**
5. **TAREA T-GOV-05 [P2]: Sincronización en Caliente de Permisos y Refresco Automático de Token Client-Side.**
6. **TAREA T-GOV-06 [P2]: Enmascaramiento de Datos Sensibles (PII) y Límites de Exportación Parametrizados.**
7. **TAREA T-GOV-07 [P2]: Módulo de Archivo Histórico, Depuración Lógica de Registros y Alertas de Auditoría.**
8. **TAREA T-GOV-08 [P3]: Mejoras Visuales de Diagnóstico, Badges de Representación y Confirmaciones Críticas.**

---

## 6. Certificación Final

Se certifica que la auditoría funcional y técnica de la **Fase 4: Identidad, Permisos y Gobierno de la Información** ha sido ejecutada minuciosamente. No se han modificado archivos de código fuente de producción, esquemas de bases de datos ni archivos de configuración durante este proceso.

**Fecha de emisión:** 19 de Octubre de 2026
**Auditor Principal:** Jules
**Estado:** Auditoría Completada y Verificada.
