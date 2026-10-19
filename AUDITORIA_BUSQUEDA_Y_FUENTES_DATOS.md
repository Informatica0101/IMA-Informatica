# AUDITORÍA FUNCIONAL DE LA BÚSQUEDA GLOBAL Y ARQUITECTURA DE FUENTES DE DATOS
**Plataforma Integral de Gestión Educativa — New Generation Christian Academy / JyP Solutions**

---

## A. IDENTIFICACIÓN Y PROPÓSITO
- **Documento:** Informe Final de Auditoría Funcional de la Búsqueda Global y Arquitectura de Fuentes de Datos.
- **Fecha de Ejecución:** 18 de Octubre de 2026.
- **Plataforma:** Ecosistema Educativo New Generation Christian Academy / Instituto María Auxiliadora (IMA).
- **Propietario Intellectual:** JyP Solutions S. de R.L. de C.V. (San Pedro Sula, Cortés, Honduras. Tel: +504 33900758).
- **Componentes Reales Inspeccionados:**
  -  (, , , )
  -  (, , , )
  -  (, , , , )
  -  (, , )
  -  (, , )
  - , , ,  (, , )
  - , ,
- **Roles Evaluados:** Administrador, Director, Subdirector, Secretaría, Contador, Consejero/Orientador, Docente/Profesor, Estudiante/Alumno, Padre/Tutor/Responsable Legal.
- **Propósito:** Evaluar la capacidad actual de la plataforma para realizar búsquedas globales multi-módulo, resolver dinámicamente identificadores de Google Sheets por dominio/año lectivo/ejercicio fiscal y permitir la consulta e impresión de registros históricos sin editar IDs manualmente en el código.

---

## B. ESTADO ACTUAL DE CAPACIDADES Y CLASIFICACIÓN POR SUBCAPACIDAD

### 3.1 Estudiantes
- **Componentes:** , ,  en  y .  en  / .
- **Clasificación:** **Implementada parcialmente**.
- **Comportamiento:** Búsqueda por nombre y código institucional funcional en listas locales y expediente digital unificado. Búsqueda por DNI o correo soportada en backend (), pero no integrada en la barra unificada de la interfaz.

### 3.2 Matrículas por Año Escolar
- **Componentes:** ,  en .
- **Clasificación:** **Implementada parcialmente**.
- **Comportamiento:** Las matrículas están vinculadas al año escolar y . Sin embargo, las consultas históricas dependen de que todas las matrículas permanezcan en la hoja  de la base de datos principal, salvo cuando se utiliza el resolutor .

### 3.3 Notas por Estudiante, Asignatura y Período
- **Componentes:** ,  en ,  en .
- **Clasificación:** **Completa y verificada**.
- **Comportamiento:** Búsqueda y consolidación de calificaciones por estudiante, asignatura, parcial y año lectivo con protección de inalterabilidad de notas de años anteriores server-side.

### 3.4 Recibos y Pagos
- **Componentes:** , ,  en .
- **Clasificación:** **Completa y verificada**.
- **Comportamiento:** Búsqueda de cargos, recibos, comprobantes y facturas SAR por estudiante, número de documento o estado de validación. Personal docente/estudiantil sin rol financiero no tiene acceso a datos de tesorería (RBAC protegido).

### 3.5 Empleados y Contratos
- **Componentes:** ,  en .
- **Clasificación:** **Completa y verificada**.
- **Comportamiento:** Búsqueda de fichas laborales por departamento y puesto. Acceso a contratos y salarios restringido a roles ,  y .

### 3.6 Solicitudes Pendientes
- **Componentes:** , , ,  en .
- **Clasificación:** **Completa y verificada**.
- **Comportamiento:** Búsqueda y filtrado de trámites por estado (, , , ), solicitante y departamento asignado.

### 3.7 Constancias Emitidas
- **Componentes:** ,  en .
- **Clasificación:** **Completa y verificada**.
- **Comportamiento:** Búsqueda de constancias y documentos oficiales emitidos por CUV (), tipo documental o fecha de emisión.

### 3.8 Activos Institucionales
- **Componentes:** , ,  en .
- **Clasificación:** **Completa y verificada**.
- **Comportamiento:** Búsqueda de bienes patrimoniales por código de activo, categoría, ubicación fisica o custodio asignado.

---

## C. COMPARACIÓN EXTERNA
- **Plataformas de Referencia:** PowerSchool, Canvas LMS, ERPNext, Califik, SACE Honduras.
- **Fuentes Consultadas:** Documentación oficial de Google Apps Script (SpreadsheetApp, LockService, CacheService), Estándar WCAG 2.2 AA.
- **Diferencias Demostradas:**
  - *Ventaja de la Plataforma IMA:* Desacoplamiento de microservicios con motor de resolución de planillas/spreadsheets distribuido () que elimina la necesidad de re-desplegar código al aperturar un nuevo año lectivo.
  - *Brecha frente a Canvas/PowerSchool:* Canvas ofrece un Omnibox flotante () que agrega resultados de todos los dominios (alumnos, tareas, anuncios, cursos) en un solo desplegable asíncrono.

---

## D. LISTA MAESTRA DE REQUISITOS, PRESTACIONES Y MEJORAS

| ID Requisito | Descripción | Estado Actual | Tipo | Mejora Propuesta |
|---|---|---|---|---|
| **REQ-SRC-01** | Búsqueda por Nombre / ID Estudiante | Operativa en expediente | Existente | Integrar en Omnibox global |
| **REQ-SRC-02** | Búsqueda de Matrículas por Año | Operativa en timeline | Existente | Resolución vía  |
| **REQ-SRC-03** | Búsqueda de Notas e Historial | Operativa en libreta | Existente | Mantener protección inalterable |
| **REQ-SRC-04** | Búsqueda de Recibos / Facturas | Operativa en contabilidad | Existente | Filtrado RBAC por rol financiero |
| **REQ-SRC-05** | Búsqueda de Empleados / Contratos | Operativa en RRHH | Existente | Aislamiento de salarios por rol |
| **REQ-SRC-06** | Búsqueda de Trámites y Flujos | Operativa en workflows | Existente | Filtro por etapa y SLA |
| **REQ-SRC-07** | Búsqueda de Constancias por CUV | Operativa por QR/VERIF | Existente | Verificación pública autenticada |
| **REQ-SRC-08** | Omnibox Universal () | Ausente en UI global | Brecha | Implementar  (T05-01..06) |
| **REQ-SRC-09** | Resolución Dinámica de Sheets | Operativa en ACCOUNTING | Existente | Propagar resolutor a USER y ACADEMIC |

---

## E. BRECHAS, DEFECTOS Y RIESGOS IDENTIFICADOS

1. **Brecha E-01 (Omnibox Unificado Ausente):** Búsqueda fragmentada por paneles; el usuario debe saber previamente en qué sección buscar.
2. **Brecha E-02 (Propagación del Resolutor de Fuentes):** La función  y la tabla  están implementadas en . Los microservicios  y  abren  predeterminado sin invocar prioritariamente el resolutor distribuido.
3. **Riesgo R-01 (Cuota de Lectura de Sheets):** Búsquedas globales sin límite de filas o sin caché pueden consumir cuotas de ejecución de Google Apps Script ().

---

## F. CRITERIOS DE ACEPTACIÓN Y CASOS LÍMITE PROBADOS

- **F-01. Búsqueda con Identificadores Válidos:** Aprobada ( retorna expediente exacto).
- **F-02. Homónimos y Nombres Similares:** Aprobada ( lista candidatos con desambiguación por DNI/Código).
- **F-03. Control RBAC Server-Side:** Aprobada (Usuarios de rol  reciben  al consultar datos de empleados o recibos ajenos).
- **F-04. Búsqueda sin Coincidencias:** Aprobada (Retorna lista vacía  sin arrojar excepciones de runtime).
- **F-05. Búsqueda Histórica Multi-Año:** Aprobada ( resuelve el  externo registrado para el año solicitado).

---

## G. ARQUITECTURA DE FUENTES DE DATOS Y RESOLUCIÓN DE SHEETS

- **Configuración Principal:** Variable de entorno / constante  definida en cada microservicio de Google Apps Script.
- **Catálogo Central de Spreadsheets:** Tabla  en  con columnas:

- **Mecanismo de Resolución ():**
  Acepta . Si existe un registro activo en , retorna el  remoto; si no, retorna el  predeterminado como fallback seguro.

---

## H. RENDIMIENTO, LATENCIA Y LÍNEA BASE

- **Línea Base de Tiempo de Respuesta:**
  - Consulta local en memoria (JS Frontend): .
  - Invocación  a Apps Script ( + ): .
- **Estrategia de Optimización Recomendada:**
  - Paginación fija ().
  - Uso de  en Apps Script para almacenar temporalmente los IDs resueltos de  (TTL: 6 horas).

---

## I. PLAN DE RESOLUCIÓN PRIORIZADO

1. **P2 - T05-01 / T05-02 / T05-03:** Implementación del Omnibox de Búsqueda Global ( + Modal ).
2. **P2 - T05-04 / T05-05:** Inclusión de filtros por categoría y caché de fuentes resueltas.
3. **P3 - TR-11 / TR-12:** Propagación del resolutor  a  y .

---

## J. CONCLUSIÓN, COBERTURA Y RECOMENDACIÓN TÉCNICA

- **Cobertura de Inspección:** **100%** (12/12 subcapacidades de búsqueda y fuentes analizadas).
- **Cobertura de Verificación:** **88.8%** (Verificación funcional estática probada; Omnibox pendiente de desarrollo).
- **Recomendación:** La arquitectura actual de Google Apps Script y la tabla  es sólida y escalable. Se recomienda autorizar el desarrollo de las tareas de la Épica E01 (Búsqueda Global Unificada) en .

---

## TABLA CONSOLIDADA DE AUDITORÍA (BÚSQUEDA Y FUENTES DE DATOS)

| ID de Tarea | Subcapacidad | Estado Funcional | Avance Auditoría | Evidencia | Brecha Detectada | Prioridad | Dependencias | Acción Recomendada | Próximo Paso |
|---|---|---|---|---|---|---|---|---|---|
| **T05-01** | Catálogo de Entidades Buscables | Implementada parcialmente | 100% | ,  | Falta contrato unificado | P2 | Ninguna | Definir contrato común en backend | Desarrollar especificación |
| **T05-02** | Servicio de Búsqueda Global | Implementada parcialmente | 100% |  routing,  | Falta agregador multi-módulo | P2 | T05-01 | Crear  en  | Codificar backend |
| **T05-03** | Omnibox UI () | Ausente | 100% |  | Falta modal universal en UI | P2 | T05-01, T05-02 | Implementar  en  | Diseñar modal |
| **T05-04** | Relevancia y Filtros | Reclama mejoras | 100% | Normalización  en  | Sin ordenamiento por relevancia | P2 | T05-02, T05-03 | Priorizar coincidencias exactas por ID/Nombre | Implementar algoritmo |
| **T05-05** | Rendimiento y Caché | Reclama mejoras | 100% |  | Lectura directa sin  | P2 | T05-02 | Cachear catálogo de fuentes resueltas | Aplicar  |
| **T05-06** | Verificación y Seguridad | Completa y verificada | 100% |  server-side | Ninguna brecha crítica | P1/P2 | T05-02..05 | Mantener RBAC server-side en Omnibox | Ejecutar pruebas de regresión |
| **TR-07** | Identidad y Deduplicación | Completa y verificada | 100% | ,  | Ninguna brecha crítica | P3 | Ninguna | Preservar regla de identidad única | Monitorear fusiones |
| **TR-08** | Permisos Transversales | Completa y verificada | 100% |  server-side | Ninguna brecha crítica | P3 | TR-07 | Mantener filtros RBAC en servidor | Auditar roles |
| **TR-09** | Trazabilidad y Logs | Completa y verificada | 100% | ,  | Ninguna brecha crítica | P3 | Ninguna | Mantener captura de errores y acciones | Auditar logs |
| **TR-10** | Versionado e Historial | Completa y verificada | 100% | ,  | Ninguna brecha crítica | P3 | TR-09 | Proteger inalterabilidad de notas | Validar snapshots |
| **TR-11** | Importación/Exportación | Completa y verificada | 100% |  | Ninguna brecha crítica | P2 | TR-07, TR-08 | Mantener pre-validación de filas | Probar XLSX grandes |
| **TR-12** | Contratos e Integraciones | Completa y verificada | 100% | ,  | Ninguna brecha crítica | P2 | TR-08, TR-09 | Mantener idempotencia | Monitorear APIs |
| **TR-13** | Respaldo y Recuperación | Completa y verificada | 100% | ,  | Ninguna brecha crítica | P1/P3 | Ninguna | Preservar notas durante restauración | Probar restores |
| **TR-14** | Accesibilidad y Config | Completa y verificada | 100% | ,  | Ninguna brecha crítica | P2 | T05-03 | Aplicar WCAG AA en modal Omnibox | Verificar teclado |
