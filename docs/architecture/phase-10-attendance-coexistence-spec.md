# ESPECIFICACIÓN FUNCIONAL Y OPERATIVA — FASE 10: ASISTENCIA, DISCIPLINA, CONVIVENCIA ESCOLAR, ORIENTACIÓN Y DELEGACIÓN DE ASISTENTES

## 1. MODALIDADES DE ASISTENCIA Y REGLAS DE CÓMPUTO
La plataforma soporta tres modalidades dinámicas configurables desde `ConfiguracionAcademica`:
- **Diaria:** Un único registro por estudiante por día lectivo (`SES-DIARIA-YYYY-MM-DD-GRADO-SECCION`).
- **Por Clase (Asignatura):** Registro independiente por cada período de clase en la matriz de horarios (`SES-AST-TIMESTAMP`).
- **Diaria Y Por Clase:** Modalidad combinada para control matutino y seguimiento detallado por asignatura.

### Cómputo de Tardanzas y Ausencias
- **Tardanza:** Registro con llegada posterior a la hora programada; acumula minutos de retraso (`minutosTardanza`).
- **Ausencia Injustificada:** Registro en estado `Ausente` sin justificante en estado `Aprobada`.
- **Salida Anticipada:** Retiro autorizado antes de la hora de finalización de jornada.
- **Justificaciones:** Ciclo de vida de solicitudes (`Presentada`, `Pendiente`, `RequiereInformacion`, `Aprobada`, `Rechazada`, `Cancelada`). Una justificación aprobada actualiza dinámicamente los registros de asistencia afectados.

---

## 2. CICLO DE VIDA DE INCIDENCIAS DE CONVIVENCIA ESCOLAR
Las incidencias disciplinarias se gestionan mediante estados explícitos:
1. **Reportada:** Incidencia ingresada por docente o personal administrativo.
2. **PendienteRevision:** En espera de evaluación por la comisión de convivencia o dirección.
3. **EnInvestigacion:** Caso en proceso de levantamiento de testimonios o evidencias.
4. **Confirmada:** Sanción/medida correctiva ratificada.
5. **Cerrada:** Caso concluido con medidas cumplidas.
6. **Reabierta:** Caso reabierto por reincidencia o nuevos antecedentes.

---

## 3. MODELO DE DELEGACIÓN Y DOBLE IDENTIDAD DE ASISTENTES
Las operaciones ejecutadas por asistentes administrativos/académicos registran metadatos de trazabilidad:
- `_executorUserId`: Identificador real del asistente ejecutante.
- `_delegatedFrom`: Identificador del titular del cargo (Director, Secretario, Coordinador).
- `_delegationId`: Identificador del acto formal de delegación en `AsignacionesAmbitosRoles`.
- **Restricciones:** Los asistentes no pueden realizar modificaciones a calificaciones oficiales o cierres de período a menos que la delegación esté activa y no haya sido revocada.

---

## 4. MODELO DE CONFIDENCIALIDAD DE CONSEJERÍA Y ORIENTACIÓN
- **Notas de Consejería y Orientación:** Almacenadas en `CasosSeguimiento` bajo categoría `Consejería` u `Orientación`.
- **Restricción de Acceso:** Visibles únicamente para `Consejeros`, `Orientación`, `Dirección` y `Administrador`.
- **Auditoría:** Todo intento de acceso no autorizado por docentes generales u otros roles registra un evento `UNAUTHORIZED_ACCESS_ATTEMPT`.
