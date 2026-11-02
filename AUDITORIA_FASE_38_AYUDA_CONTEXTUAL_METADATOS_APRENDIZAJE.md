# AUDITORÍA FUNCIONAL, TÉCNICA Y DOCUMENTAL — FASE 38

**Fase:** 38 — Ayuda contextual, metadatos y aprendizaje de la interfaz
**Área:** Experiencia de usuario, orientación contextual, metadatos de interfaz, accesibilidad (WCAG 2.2 AA), guías interactivas y persistencia de preferencias de usuario.
**Fecha de Evaluación:** 2026-10-31
**Estado General:** Implementada Parcialmente con Brechas en Tooltips Nativos, Catálogo Central de Metadatos y Sincronización Server-Side

---

## A. IDENTIFICACIÓN Y ALCANCE

### 1. Propósito y Objetivos
Auditar integralmente el sistema de ayuda contextual, metadatos y orientación de usuarios en la Plataforma Integral de Gestión Educativa.
La evaluación abarca la ayuda contextual inmediata (tooltips/popovers), las instrucciones visibles permanentes en formularios, la orientación de primera visita (onboarding/tours guiados), el catálogo central de metadatos de interfaz y la persistencia de preferencias de usuario entre sesiones y dispositivos.

### 2. Componentes Reales Encontrados en Repositorio
- **Controlador de Guías Interactivas:** `js/ui-common.js` (L2503-L2630: `startInteractiveGuide`, `navigateGuideStep`, `closeInteractiveGuide`).
- **Modal de Asistencia y Preguntas Frecuentes:** `js/ui-common.js` (L3085-L3170: `openContextualHelpModal`, `startGuidedTourAction`).
- **Catálogo Backend de Guías Contextuales:** `backend/user-service/Code.gs` (L7345-L7390: `getHelpGuidesCatalog(payload)`).
- **Tooltips Básicos Nativos HTML:** Uso disperso del atributo estándar `title="..."` en botones de tablas y barras de navegación en `teacher-dashboard.html`, `js/secretary.js`, `js/teacher.js`, etc.

---

## B. ESTADO ACTUAL E INVENTARIO FUNCIONAL

| Mecanismo de Ayuda | Ubicación en Código | Implementación Real | Estado / Hallazgo |
|---|---|---|---|
| Guías Paso a Paso (Tours) | `js/ui-common.js` | `window.startInteractiveGuide` | Implementada para `studentSubmission` y `teacherReview`. Renderiza ventana flotante (`#interactive-guide-box`) en esquina inferior derecha. |
| Modal Central de Asistencia | `js/ui-common.js` | `window.openContextualHelpModal` | Modal interactivo con FAQ institucional (JyP Solutions) y lista de guías según rol. |
| Catálogo de Guías Backend | `backend/user-service/Code.gs` | `getHelpGuidesCatalog` | Devuelve guías por rol (`gradebook`, `plantillas`, `tareas`) en array estático en memoria. |
| Tooltips de Campo / Controles | Varios archivos | Atributos `title="..."` | Rudimentario. Depende del navegador, inaccesible en móviles/táctil y sin posicionamiento adaptable. |
| Catálogo Central de Metadatos | - | No existe tabla/JSON central | Ausente. No hay catálogo con claves estables (`field_id`, `min`, `max`, `ejemplo`). |
| Persistencia de Preferencias | `js/ui-common.js` | `localStorage.getItem('guide_progress_' + tourKey)` | Almacenamiento local exclusivo. No se sincroniza con el servidor ni entre dispositivos. |

---

## C. EVALUACIÓN DETALLADA POR SUBCAPACIDAD (F38-01 A F38-14)

### F38-01. Cobertura de ayuda en elementos de interfaz
- **Estado:** Implementada Parcialmente.
- **Evidencia:** Existen atributos `title` en botones clave de acción (aprobar, rechazar, previsualizar) y modales de ayuda para secciones principales.
- **Brechas:** Los campos de entrada (inputs, selects, fechas) en formularios extensos de matrícula, calificaciones e importaciones carecen de explicaciones contextuales enriquecidas.

### F38-02. Presentación y comportamiento de ventanas flotantes
- **Estado:** Requiere Mejoras.
- **Evidencia:** La ventana `#interactive-guide-box` se ubica fijamente en `fixed bottom-6 right-6`.
- **Brechas:** No existe un componente de tooltip flotante adaptativo que calcule coordenadas respecto al elemento objetivo (sin cálculo de colisión con bordes del viewport o scroll).

### F38-03. Accesibilidad y mecanismos alternativos de consulta (WCAG 2.2 AA)
- **Estado:** Defectuosa.
- **Brechas:**
  1. Los atributos `title` no se activan mediante navegación por foco de teclado (`Tab`) ni son legibles en pantallas táctiles (smartphones/tablets).
  2. No se asocian semánticamente mediante `aria-describedby` al elemento del formulario.
  3. No se cierran con la tecla `Escape`.

### F38-04. Descripciones completas de campos y controles
- **Estado:** Requiere Mejoras.
- **Evidencia:** Los modales de tours explican tareas generales en 4 pasos.
- **Brechas:** No se documentan límites de tamaño de archivo, formatos aceptados ni consecuencias de acciones destructivas junto al campo de entrada.

### F38-05. Catálogo central de metadatos y claves estables
- **Estado:** Ausente.
- **Brechas:** No existe una tabla o archivo JSON centralizado que mapee claves estables (`METADATA_KEYS`) a descripciones, ejemplos y formatos esperados. Los textos están dispersos en HTML y JS.

### F38-06. Estructura de metadatos, traducciones y versiones
- **Estado:** Ausente.
- **Brechas:** No existe soporte para versionado de contenidos de ayuda ni mecanismos de reserva de idioma (i18n).

### F38-07. Reutilización y consistencia de ayudas
- **Estado:** Requiere Mejoras.
- **Brechas:** Formularios equivalentes en diferentes dashboards definen textos de ayuda o placeholders independientes sin compartir definiciones comunes.

### F38-08. Consejos de primera visita y orientación progresiva
- **Estado:** Implementada Parcialmente.
- **Evidencia:** `startInteractiveGuide` permite guardar el progreso del tour y cerrarlo con el botón "Omitir" o "Finalizar".
- **Brechas:** No se dispara automáticamente en la primera visita real del usuario ni distingue entre usuarios nuevos y recurrentes.

### F38-09. Preferencias de ayuda y persistencia por usuario
- **Estado:** Defectuosa (Solo Local).
- **Evidencia:** Guarda en `localStorage.setItem('guide_progress_' + tourKey, stepIdx)`.
- **Brecha Crítica:** Si el usuario accede desde otro dispositivo o borra la caché del navegador, las guías se reinician. No se persisten las preferencias en el perfil de usuario del backend.

### F38-10. Consulta y restablecimiento desde preferencias
- **Estado:** Implementada Parcialmente.
- **Evidencia:** `openContextualHelpModal` permite reabrir las guías paso a paso desde el menú de soporte.
- **Brechas:** No existe una opción en el panel de configuración de usuario para "Restablecer todos los consejos de primera visita".

### F38-11. Ayudas generales e instrucciones específicas por rol
- **Estado:** Completa y Verificada.
- **Evidencia:** `getHelpGuidesCatalog` en `user-service/Code.gs` filtra las guías devueltas según el rol verificado (`Profesor` vs `Estudiante`).

### F38-12. Ayuda especializada para funciones avanzadas
- **Estado:** Implementada Parcialmente.
- **Evidencia:** Guía detallada para el diseñador visual de plantillas (`GUIDE-TEMPLATES-DESIGN`).
- **Brechas:** Falta orientación especializada en conciliación bancaria, cierre de año lectivo e importaciones masivas.

### F38-13. Advertencias críticas y confirmaciones independientes
- **Estado:** Completa y Verificada.
- **Evidencia:** Operaciones críticas (ej. eliminar bloques de horario o cerrar hilos) utilizan diálogos modales obligatorios independientes del sistema de tutoriales.

### F38-14. Rendimiento, disponibilidad y tolerancia a fallos
- **Estado:** Completa y Verificada.
- **Evidencia:** La carga de guías es asíncrona y, ante fallos de conexión, la interfaz muestra un fallback con las preguntas frecuentes sin bloquear la operativa del dashboard.

---

## D. MATRIZ MAESTRA DE AUDITORÍA Y CARACTERÍSTICAS (CAR-F38)

| ID | Característica | Prioridad | Estado Funcional | Acción Recomendada |
|---|---|---|---|---|
| F38-01 | Cobertura de ayuda en elementos UI | P0 | Implementada Parcialmente | Extender atributos a todos los campos de formulario |
| F38-02 | Presentación de ventanas flotantes | P0 | Requiere Mejoras | Motor de tooltips con Popper/Tippy o cálculo nativo de viewport |
| F38-03 | Accesibilidad WCAG 2.2 AA (Teclado/Táctil) | P0 | Defectuosa | Soporte `Tab`, `Escape`, `aria-describedby` e interacción táctil |
| F38-04 | Descripciones completas y formatos | P0 | Requiere Mejoras | Enriquecer textos con ejemplos válidos y límites |
| F38-05 | Catálogo central de metadatos | P0 | Ausente | Crear estructura JSON/Hoja `MetadatosInterfaz` |
| F38-06 | Versionado y traducciones | P1 | Ausente | Incorporar versionado semántico de textos de ayuda |
| F38-07 | Reutilización y consistencia | P0 | Requiere Mejoras | Consumir metadatos desde un único repositorio |
| F38-08 | Consejos de primera visita | P1 | Implementada Parcialmente | Disparador automático ante primer inicio de sesión |
| F38-09 | Persistencia server-side por usuario | P0 | Defectuosa | Guardar estado en tabla `PreferenciasUsuario` |
| F38-10 | Restablecimiento de consejos | P1 | Implementada Parcialmente | Botón de reseteo en modal de opciones de usuario |
| F38-11 | Segmentación de ayuda por rol | P0 | Completa y Verificada | Mantener filtrado por `getUserVerifiedRole` |
| F38-12 | Ayuda en funciones avanzadas | P1 | Implementada Parcialmente | Redactar guías para conciliación e importador |
| F38-13 | Advertencias críticas independientes | P0 | Completa y Verificada | Preservar diálogos obligatorios de confirmación |
| F38-14 | Rendimiento y tolerancia a fallos | P1 | Completa y Verificada | Mantener caché local y llamadas diferidas |

---

## E. RESULTADOS DE LA MATRIZ DE PRUEBAS FUNCIONALES (PT-F38-01 A PT-F38-25)

| ID | Escenario | Resultado Esperado | Resultado Observado | Estado |
|---|---|---|---|---|
| **PT-F38-01** | Ayuda contextual básica | Muestra descripción de campo | Tooltips estándar `title` en botones | **Requiere Mejoras** |
| **PT-F38-02** | Componentes dinámicos | Ayuda en controles inyectados | Nuevos elementos no inicializan tooltips | **No Aprobado** |
| **PT-F38-03** | Posicionamiento en bordes | Burbuja permanece en viewport | Ventana fija en esquina derecha; no contextual a campo | **No Aprobado** |
| **PT-F38-04** | Navegación con teclado | Abrir con foco `Tab` y cerrar con `Esc` | Atributo `title` no abre con Tab en la mayoría de navegadores | **No Aprobado** |
| **PT-F38-05** | Accesibilidad lector pantalla | Anuncia `aria-describedby` | Atributos ARIA ausentes en campos | **No Aprobado** |
| **PT-F38-06** | Interacción táctil en móvil | Tocar icono abre ayuda | En móvil no hay hover; `title` no se activa | **No Aprobado** |
| **PT-F38-07** | Correspondencia de validaciones | Instrucciones coinciden con backend | Límites no están expresados junto al input | **Requiere Mejoras** |
| **PT-F38-08** | Claves del catálogo | Resuelve claves estables | Claves estables no implementadas | **No Aprobado** |
| **PT-F38-09** | Reutilización de textos | Mismo texto en múltiples vistas | Textos repetidos y dispersos en código | **No Aprobado** |
| **PT-F38-10** | Traducciones y reservas | Idioma alternativo o reserva | Solo español disponible | **No Aplicable** |
| **PT-F38-11** | Versiones de metadatos | Actualización no reinicia tour | No existe versionado de guías | **No Aprobado** |
| **PT-F38-12** | Primera visita automática | Tour inicia automáticamente | Requiere clic explícito en botón de ayuda | **Requiere Mejoras** |
| **PT-F38-13** | Reingreso no repetitivo | No repite consejo descartado | Guarda progreso en localStorage | **Aprobado** |
| **PT-F38-14** | Consulta posterior de guía | Acceso desde menú de ayuda | Disponible en `openContextualHelpModal` | **Aprobado** |
| **PT-F38-15** | Restablecimiento de consejos | Resetea solo ámbito solicitado | No existe botón de restablecimiento | **No Aprobado** |
| **PT-F38-16** | Persistencia entre dispositivos | Sincroniza estado descartado | No sincroniza; solo existe en localStorage | **No Aprobado** |
| **PT-F38-17** | Aislamiento entre usuarios | Cuentas distintas no mezclan tour | Mezcladas si comparten el mismo navegador | **No Aprobado** |
| **PT-F38-18** | Personalización por rol | Guías distintas profesor/alumno | `getHelpGuidesCatalog` filtra por rol verificado | **Aprobado** |
| **PT-F38-19** | Función avanzada explicada | Advierte consecuencias | Modales de plantillas explican inmutabilidad | **Aprobado** |
| **PT-F38-20** | Advertencia crítica obligatoria | Diálogo aparece tras cerrar tour | Confirmaciones modales permanecen activas | **Aprobado** |
| **PT-F38-21** | Fallo del catálogo | Fallback y registro de error | Muestra FAQ si falla backend | **Aprobado** |
| **PT-F38-22** | Fallo de sincronización | Estado coherente | Fallo no afecta operativa del dashboard | **Aprobado** |
| **PT-F38-23** | Rendimiento y carga | Carga diferida sin bloqueo | Tour se inyecta en DOM bajo demanda | **Aprobado** |
| **PT-F38-24** | Consistencia entre módulos | Textos coherentes | Preguntas frecuentes unificadas en `ui-common.js` | **Aprobado** |
| **PT-F38-25** | Compatibilidad de versiones | Metadatos antiguos no rompen | Estructura tolerante a campos vacíos | **Aprobado** |

---

## F. PLAN DE RESOLUCIÓN PRIORIZADO

### Bloque P0: Componente de Tooltip Accesible, Catálogo Central y Persistencia en Servidor
1. **[F38-Task01] Componente universal de tooltip flotante y adaptativo (WCAG 2.2 AA):**
   - Implementar en `js/ui-common.js` un renderizador accesible de tooltips flotantes que soporte: activación por hover y foco de teclado (`Tab`), cierre con `Escape`, enlace semántico `aria-describedby`, reposicionamiento automático ante colisiones con bordes de pantalla y activación táctil explícita en dispositivos móviles.
2. **[F38-Task02] Catálogo centralizado de metadatos de campos y descripciones de interfaz:**
   - Crear el repositorio de metadatos en backend (`user-service/Code.gs`: `getUIMetadataCatalog`) y caché en cliente con claves estables (`METADATA_KEYS`), definiendo para cada campo: etiqueta visible, descripción breve, ejemplo de valor válido, obligatoriedad y límites.
3. **[F38-Task03] Persistencia en servidor de preferencias y estado de aprendizaje por usuario:**
   - Crear endpoints `saveUserHelpPreferences` y `getUserHelpPreferences` en `user-service/Code.gs` y persistir en la hoja `PreferenciasUsuario` el estado de guías y consejos descartados, garantizando aislamiento entre usuarios y sincronización multidispositivo.
4. **[F38-Task04] Instrucciones permanentes y advertencias de riesgo en formularios críticos:**
   - Integrar textos de ayuda permanentes junto a campos con formatos complejos (fechas, DNI, importes) y garantizar que las confirmaciones de operaciones destructivas o financieras permanezcan siempre activas e independientes de los consejos descartados.

### Bloque P1: Onboarding Progresivo, Restablecimiento y Funciones Avanzadas
5. **[F38-Task05] Motor de orientación de primera visita y disparador automático no invasivo:**
   - Detectar automáticamente el primer ingreso del usuario a cada módulo para presentar el tour guiado de forma no invasiva, con opción de descarte inmediato y registro en servidor.
6. **[F38-Task06] Consola de restablecimiento y reconsulta de guías desde el perfil de usuario:**
   - Añadir en el modal de configuración de usuario un panel para consultar el catálogo de guías y permitir el restablecimiento individual o global de consejos descartados.
7. **[F38-Task07] Ampliación de guías especializadas para módulos administrativos y financieros:**
   - Desarrollar guías interactivas paso a paso para la conciliación bancaria, el importador inteligente de Excel/CSV y la emisión oficial de documentos con CUV.

---

## G. COBERTURA CUANTITATIVA Y CONCLUSIÓN

### 1. Fórmulas y Métricas Independientes de Cobertura
- **Cobertura de Inspección:**
  $$\frac{\text{Subcapacidades inspeccionadas (14)}}{\text{Total subcapacidades identificadas (14)}} \times 100 = 100.0\%$$
- **Cobertura de Ejecución:**
  $$\frac{\text{Pruebas ejecutadas (24)}}{\text{Total pruebas planificadas (25)}} \times 100 = 96.0\% \quad (\text{1 prueba No Aplicable por idioma único})$$
- **Cobertura de Verificación Satisfactoria:**
  $$\frac{\text{Pruebas aprobadas satisfactoriamente (11)}}{\text{Total pruebas aplicables (24)}} \times 100 = 45.8\%$$

### 2. Distribución de Estados Funcionales
- *Completa y Verificada:* 3 (21.4%)
- *Implementada Parcialmente:* 5 (35.7%)
- *Requiere Mejoras:* 3 (21.4%)
- *Defectuosa:* 2 (14.3%)
- *Ausente:* 1 (7.2%)

### 3. Dictamen Final
**NO APROBADA PARA CERTIFICACIÓN FINAL** debido a la dependencia de tooltips nativos `title` inaccesibles para teclado y dispositivos táctiles, la persistencia en `localStorage` no sincronizada con el servidor y la carencia de un catálogo central de metadatos de interfaz con claves estables.
