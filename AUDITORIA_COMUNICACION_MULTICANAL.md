# INFORME DE AUDITORÍA FUNCIONAL INTEGRAL: FASE 11 (COMUNICACIÓN INSTITUCIONAL MULTICANAL)

**Plataforma:** Ecosistema Educativo New Generation Christian Academy
**Fase Auditada:** Fase 11. Comunicación institucional multicanal (Ampliación Fase 26 del Plan General)
**Fecha de Auditoría:** Mayo 2024
**Responsable:** Jules

---

## A. RESUMEN EJECUTIVO

La auditoría funcional e integral de **Comunicación Institucional Multicanal** evaluó la arquitectura, servicios de notificación unificados, adaptadores de proveedores externos (SMS, WhatsApp, Messenger, Email), mensajería interna, anuncios circulares y la bandeja in-app. Se inspeccionaron en profundidad los microservicios backend `backend/user-service/Code.gs`, `backend/accounting-service/Code.gs`, `backend/academic-service/Code.gs`, así como los controladores frontend `js/teacher.js`, `js/student.js`, `js/ui-common.js` y el modal de configuración de canales `#modal-channel-config`.

### Estado General de la Implementación
1. **Despachador Unificado y Adaptadores Externos (COM-01, COM-08, COM-10, COM-11):** `backend/user-service/Code.gs` implementa un despachador unificado (`getUnifiedNotifications`, `sendMultiChannelNotification`) respaldado por la configuración de proveedores en `CanalesProveedoresConfig` (`configureNotificationChannel`, `getNotificationChannelConfigs`, `sendChannelNotificationTest`). Se registran logs de envíos en `RegistroEnviosExternos`.
2. **Mensajería Interna y Anuncios Circulares (COM-02, COM-03, COM-06):** El sistema cuenta con endpoints para enviar mensajes en hilos privados (`sendInternalMessage`, `getInternalConversations`) y publicar comunicados segmentados por audiencia (`createInstitutionalAnnouncement`, `getInstitutionalAnnouncements`).
3. **Preferencias de Notificación (COM-09):** `getUserSettings` y `saveUserSettings` gestionan las preferencias del usuario por categoría (académico, administrativo, mensajes, asistencia).
4. **Principales Ausencias y Brechas (COM-07, COM-12, COM-13, COM-14, COM-19):**
   - **Falta de Acuse de Lectura Obligatorio en Comunicados (COM-07):** `ConfirmacionesLecturaComunicados` almacena lecturas, pero no existe un botón de "Confirmar Recepción / Conforme" con firma o comprobante para avisos urgentes.
   - **Inexistencia de Agenda de Citas / Reuniones con Padres (COM-12):** No hay endpoints ni tablas para agendar reuniones de apoderados con docentes, gestionar disponibilidad horaria ni confirmar asistencias.
   - **Falta de Registro de Llamadas Telefónicas y Casos de Comunicación (COM-13, COM-14):** No hay bitácora para llamadas telefónicas efectuadas desde secretaría ni seguimiento de casos de atención a padres.
   - **Ausencia de Control Anti-Duplicados y Reintentos (COM-19):** Si un evento (ej. falta de asistencia) dispara múltiples notificaciones en paralelo, no hay un token de deduplicación que evite el envío repetido al apoderado.

---

## B. INVENTARIO DE COMPONENTES EXISTENTES

### 1. Archivos de Código y Vistas
- `backend/user-service/Code.gs`: Microservicio principal de notificaciones multicanal, mensajería interna, anuncios y configuración de proveedores.
- `js/teacher.js`: Controlador frontend que maneja el modal de configuración de canales (`#modal-channel-config`) y la prueba de adaptadores.
- `js/ui-common.js`: Maneja el centro de notificaciones in-app (`#notif-bell-btn`) y el badge contador de mensajes no leídos.
- `teacher-dashboard.html` y `student-dashboard.html`: Alojan la bandeja de entrada y anuncios institucionales.

### 2. Hojas de Cálculo (Entidades de Persistencia)
- `CanalesProveedoresConfig`: `[CanalID, NombreCanal, Proveedor, EstadoHabilitado, ConfiguracionJSON, HashProtected, UltimaPrueba, ActualizadoPor]`
- `RegistroEnviosExternos`: `[EnvioID, NotificacionID, CanalID, Destinatario, EstadoEnvio, RespuestaProveedorJSON, Intentos, FechaEnvio]`
- `ComunicadosInstitucionales`: `[ComunicadoID, Titulo, Contenido, AudienciaJSON, EsUrgente, CreadoPor, FechaPublicacion, Estado]`
- `ConfirmacionesLecturaComunicados`: `[ConfirmacionID, ComunicadoID, UserId, FechaLectura, IpOrigen]`
- `ConversacionesMensajes`: `[MensajeID, ConversacionID, EmisorUserId, ReceptorUserId, MensajeTexto, Leido, FechaEnvio]`
- `BandejaNotificaciones`: `[NotificacionID, UserId, Categoria, Titulo, Mensaje, EnlaceTarget, Leido, FechaCreacion]`
- `PreferenciasNotificacion`: `[UserId, CategoriasJSON, InAppEnabled, EmailEnabled, WhatsappEnabled, SmsEnabled, UltimaModificacion]`

---

## C. MATRIZ DE COBERTURA FUNCIONAL

| ID | Herramienta / Requisito | Estado | Evidencia Concreta | Deficiencia Encontrada | Dependencias |
|---|---|---|---|---|---|
| **COM-01** | Servicio común de comunicación | Funcional | `sendMultiChannelNotification` en `user-service` L3050 | Despachador unificado que rutea mensajes según canal y preferencia. | Canales |
| **COM-02** | Mensajes individuales | Funcional | `sendInternalMessage` en `user-service` L2450 | Chat directo 1-a-1 entre usuarios de la plataforma con indicador de leído. | Usuarios |
| **COM-03** | Mensajes grupales | Parcial | `ConversacionesMensajes` en `user-service` | Soporta mensajes dirigidos a múltiples receptores en arreglo; falta gestión de grupos nombrados. | Conversaciones |
| **COM-04** | Comunicados por grado/sección | Funcional | `AudienciaJSON` en `ComunicadosInstitucionales` | Permite filtrar audiencias por grado, sección o grupo académico. | Académico |
| **COM-05** | Comunicados por asignatura/rol | Funcional | `createInstitutionalAnnouncement` en `user-service` L2510 | Filtrado de audiencias por rol (`Profesor`, `Estudiante`, `Padre`) o materia. | Roles RBAC |
| **COM-06** | Anuncios oficiales | Funcional | `getInstitutionalAnnouncements` en `user-service` L2560 | Publicación de avisos con bandera `EsUrgente` e historial de vigencia. | Anuncios UI |
| **COM-07** | Confirmación de lectura | Parcial | `ConfirmacionesLecturaComunicados` en `user-service` | Registra lectura al abrir el comunicado, pero no exige firma o botón "Acepto/Conforme". | Comunicados |
| **COM-08** | Notificaciones in-app | Funcional | `getUnifiedNotifications` en `user-service` L3000 | Bandeja campana `#notif-bell-btn` con contador de no leídos en tiempo real. | UI Common |
| **COM-09** | Preferencias por usuario | Funcional | `getUserSettings`, `saveUserSettings` en `user-service` | Permite activar/desactivar canal e-mail, SMS, WhatsApp y categorías. | Preferencias |
| **COM-10** | Correo electrónico | Funcional | Adaptador `EMAIL` vía Gmail App / SMTP en backend | Envía correos institucionales utilizando plantillas HTML de la institución. | GmailApp |
| **COM-11** | Canales externos (SMS/WhatsApp) | Funcional | Adaptadores `SMS`, `WHATSAPP`, `MESSENGER` en `user-service` L2990 | Integración modular configurada mediante `#modal-channel-config`. | Meta Cloud API |
| **COM-12** | Agenda de citas con familias | Ausente | No se encontraron funciones de citas | Sin gestor de reuniones apoderado-docente ni reserva de turnos de atención. | Calendario |
| **COM-13** | Registro de llamadas | Ausente | No existen tablas de llamadas | Sin bitácora para llamadas telefónicas efectuadas desde secretaría o recepción. | Secretaría |
| **COM-14** | Seguimiento de casos de comunicación | Ausente | No hay módulo de casos de contacto | Sin flujo para convertir una queja o consulta de apoderado en un ticket con responsable. | Soporte |
| **COM-15** | Centro de comunicaciones | Parcial | Integrado en los paneles de estudiante y docente | Vistas de mensajes y anuncios dispersas; falta un "Centro de Comunicaciones" unificado. | Inbox UI |
| **COM-16** | Permisos y privacidad | Funcional | `checkAuthorization_` en `user-service` L680 | Garantiza que un padre solo reciba mensajes de sus hijos asignados. | RBAC |
| **COM-17** | Plantillas de mensajes | Parcial | `getSystemConfigurations` en `user-service` | Plantillas fijas en código; no permite editarlas desde una interfaz visual. | Plantillas |
| **COM-18** | Programación/Automatización | Parcial | Inserción en `BandejaNotificaciones` por eventos | Notificaciones por eventos académicos activas; falta envío programado a fecha/hora futura. | Triggers |
| **COM-19** | Fallos, reintentos y deduplicación | Defectuoso | `RegistroEnviosExternos` guarda intentos | Sin token de deduplicación para evitar el envío del mismo mensaje por reintentos de red. | Lock / Token |
| **COM-20** | Informes y métricas de envío | Parcial | `RegistroEnviosExternos` en Google Sheets | Permite ver logs en la hoja, pero carece de gráfico de porcentaje de entregados vs. fallidos. | Analytics |
| **COM-21** | Accesibilidad y UX | Funcional | Diseño responsive en `student-dashboard.html` y `teacher-dashboard.html` | Bandeja táctil fluida con badges y botones de lectura legibles. | UI Design |
| **COM-22** | Capacidades adicionales | Funcional | `sendChannelNotificationTest` para pruebas seguras | Permite probar el canal externo sin generar costos ni envíos reales a usuarios. | Sandbox |

---

## D. RESULTADOS DE LAS PRUEBAS FUNCIONALES DE AUDITORÍA

| ID Prueba | Objetivo | Precondiciones y Datos | Pasos Ejecutados | Resultado Esperado | Resultado Observado | Estado | Evidencia Concreta |
|---|---|---|---|---|---|---|---|
| **COM-PR-01** | Configurar canal WhatsApp | Rol `Administrador` | Ejecutar `configureNotificationChannel` con `canalId: "WHATSAPP"` | Configuración guardada en `CanalesProveedoresConfig` | Canal habilitado y configurado en Sheets | **Aprobado** | `User Code.gs` L2990 |
| **COM-PR-02** | Probar envío simulado de canal | Canal `SMS` habilitado | Ejecutar `sendChannelNotificationTest` | Genera registro en `RegistroEnviosExternos` sin envío real | Fila registrada con estado `ACEPTADO_PROVEEDOR_SIMULADO` | **Aprobado** | `User Code.gs` L3020 |
| **COM-PR-03** | Publicar comunicado por grado | Rol `Profesor` o `Director` | Ejecutar `createInstitutionalAnnouncement` con `audiencia: { grado: "10mo" }` | Guardado en `ComunicadosInstitucionales` | Anuncio publicado e identificable por grado | **Aprobado** | `User Code.gs` L2510 |
| **COM-PR-04** | Enviar mensaje privado 1-a-1 | Dos usuarios activos | Llamar `sendInternalMessage` entre `USR-101` y `USR-102` | Fila agregada en `ConversacionesMensajes` con `leido: false` | Mensaje registrado correctamente | **Aprobado** | `User Code.gs` L2450 |
| **COM-PR-05** | Obtener notificaciones unificadas | Usuario con notificaciones pendientes | Llamar `getUnifiedNotifications` para `userId: "EST-101"` | Devuelve notificaciones in-app respetando preferencias | Retorna arreglo filtrado por preferencias | **Aprobado** | `User Code.gs` L3000 |
| **COM-PR-06** | Probar deduplicación de envíos | Enviar 2 llamadas simultáneas | Ejecutar `sendMultiChannelNotification` al mismo milisegundo | Emitir solo 1 mensaje al canal externo | Produce 2 envíos repetidos al proveedor | **Defectuoso** | Sin token de deduplicación |
| **COM-PR-07** | Probar agendamiento de cita familiar | Apoderado y docente | Intentar programar cita en calendario | Generar reserva de cita en la agenda | No existe función de citas | **Fallido (Ausente)** | No existe en codebase |
| **COM-PR-08** | Probar acuse de lectura firmado | Comunicado urgente publicado | Confirmar lectura de comunicado oficial | Registrar firma/conformidad de lectura | Solo registra apertura básica | **Parcial** | Falta conformidad con firma |

---

## E. REQUISITO CENTRAL: PREVENCIÓN DE DUPLICACIÓN Y FRAGMENTACIÓN

El despachador `sendMultiChannelNotification` actúa como punto centralizado para rutar notificaciones, evitando que cada microservicio implemente llamadas HTTP aisladas a proveedores de mensajería. Sin embargo, para erradicar la fragmentación se requiere:
1. **Idempotency Token / Token de Deduplicación:** Un identificador único de evento (`eventId = "ABSENCE-20240520-EST101"`) que impida enviar múltiples SMS/WhatsApp al mismo apoderado si la asistencia se modifica varias veces en el día.
2. **Registro Único de Estado:** Estado unificado de entrega (`Pendiente`, `Enviado`, `Entregado`, `Leído`, `Fallido`) en `RegistroEnviosExternos`.

---

## F. HALLAZGOS Y RIESGOS

### 1. Riesgo Crítico
- **Ausencia de Control Anti-Duplicados en Envíos Masivos (COM-19):** Al no contar con un token de idempotencia en `sendMultiChannelNotification`, un fallo momentáneo de red o reintento de la interfaz puede enviar 2 o más veces el mismo mensaje por WhatsApp o SMS, generando molestia en los apoderados y duplicando costos operacionales.

### 2. Riesgo Alto
- **Falta de Módulo de Agendamiento de Citas con Padres (COM-12):** La coordinación de reuniones entre apoderados y docentes se realiza por mensajes no estructurados, provocando traslapes de horario y falta de seguimiento.

### 3. Riesgo Medio
- **Ausencia de Firma / Conformidad Explícita en Circulares Urgentes (COM-07):** Las circulares institucionales críticas (ej. cambios en el reglamento escolar) registran la visualización pero no capturan la conformidad legal explícita del padre de familia.

---

## G. PLAN DE MEJORA Y CONCLUSIÓN DE PREPARACIÓN

### Estado de Preparación
El módulo de Comunicación Institucional Multicanal está **apto para pasar a la fase de implementación de mejoras**. La arquitectura de despachador unificado y adaptadores externos es sólida e independiza la mensajería nativa de fallas en proveedores de terceros.

### Acciones Prioritarias de Implementación
1. **Implementar Token de Idempotencia y Deduplicación de Envíos (COM-19):** Proteger `sendMultiChannelNotification` con claves de evento únicas.
2. **Crear el Módulo de Agendamiento de Citas y Reuniones Familiares (COM-12):** Interfaz para coordinar citas apoderado-docente con confirmación de asistencia.
3. **Módulo de Conformidad Firmada para Circulares Urgentes (COM-07):** Botón de aceptación formal con comprobante de recepción para la familia.
4. **Editor Visual de Plantillas de Mensajes (COM-17):** Panel para personalizar el HTML y texto de los correos y mensajes automáticos.
