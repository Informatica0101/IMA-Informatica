# ESQUEMA ACTUAL DE SPREADSHEETS Y TABLAS POR MICROSERVICIO (ESTADO ACTUAL DE LA PLATAFORMA)

**Fecha de Documentación:** 2025-05-24
**Propósito:** Registrar las estructuras de tablas, columnas y encabezados reales que operan actualmente en los Spreadsheets de la plataforma antes de ejecutar tareas del anexo técnico.

> **Nota de Arquitectura:** Las estructuras que están en el anexo A (carpetas del repositorio) y en el anexo B (hojas y spreadsheets por rol) son ejemplos de una estructura recomendable, y no una estructura obligatoria.

---

## 1. MICROSERVICIO ACADÉMICO (`backend/academic-service/Code.gs`)
**Spreadsheet Principal:** `SP_ACADEMIC` (`SPREADSHEET_ID`)

### Tablas y Encabezados Clave:
1. **`ConfiguracionAcademica`:**
   - Columnas: `Clave`, `Valor`, `Modulo`, `Descripcion`, `UltimaModificacion`
2. **`HistorialAcademico`:**
   - Columnas: `HistorialID`, `EstudianteID`, `AsignaturaID`, `Grado`, `Seccion`, `AnoLectivo`, `NotaFinal`, `PromedioGeneral`, `Estado`, `FechaRegistro`
3. **`Matriculas`:**
   - Columnas: `MatriculaID`, `Fecha`, `UserId`, `Alumno`, `AnoLectivo`, `Estado`, `Grado`, `Seccion`, `BecaDescuento`
4. **`ExpedientesEstudiantes`:**
   - Columnas: `ExpedienteID`, `Nombres`, `Apellidos`, `DNI`, `CodigoInstitucional`, `FechaNacimiento`, `GradoActivo`, `SeccionActiva`, `EstadoExpediente`
5. **`HorariosClase`:**
   - Columnas: `HorarioID`, `OfertaID/Materia`, `DiaSemana`, `HoraInicio`, `HoraFin`, `AulaCodigo`, `DocenteUserID`, `Grado`, `Seccion`, `Estado`, `FechaRegistro`
6. **`OfertaAcademica`:**
   - Columnas: `OfertaID`, `Grado`, `Seccion`, `NivelAcademic`, `Jornada`, `Modalidad`, `DocenteTitularID`, `MaxCapacidadAdmin`, `CupoMaximo`, `Estado`
7. **`SedesAulas`:**
   - Columnas: `AulaID`, `AulaCodigo`, `NombreAula`, `CapacidadFisica`, `UbicacionSede`, `EquipamientoJSON`, `Estado`
8. **`RestriccionesCurriculares`:**
   - Columnas: `RestriccionID`, `TipoRestriccion`, `AsignaturaOrigenID`, `AsignaturaDestinoID`, `Ambito`, `Grado`, `Seccion`, `Regimen`, `Estado`, `FechaRegistro`, `UsuarioRegistro`
9. **`PlantillasHorarios`:**
   - Columnas: `PlantillaID`, `NombrePlantilla`, `Grado`, `Seccion`, `AnoBase`, `EstructuraJSON`, `Estado`, `FechaCreacion`, `UsuarioCreacion`
10. **`VersionesHorarios`:**
    - Columnas: `VersionID`, `CodigoVersion`, `AnoLectivo`, `EstructuraHorariosJSON`, `ResumenCambios`, `CreadoPor`, `FechaCreacion`
11. **`HistorialCambiosEntidad`:**
    - Columnas: `LogID`, `EntidadTipo`, `EntidadID`, `TipoOperacion`, `DetallesPayload`, `UsuarioActor`, `EstadoOperacion`, `FechaHora`

---

## 2. MICROSERVICIO DE USUARIOS Y NOTIFICACIONES (`backend/user-service/Code.gs`)
**Spreadsheet Principal:** `SP_USER`

### Tablas y Encabezados Clave:
1. **`Usuarios`:**
   - Columnas: `UserId`, `NombreCompleto`, `Email`, `RolPrincipal`, `RolesAdicionales`, `DNI`, `Telefono`, `EstadoCuenta`
2. **`Personas`:**
   - Columnas: `PersonaID`, `Nombres`, `Apellidos`, `DNI`, `Direccion`, `Telefono`, `TipoRelacion`
3. **`RelacionesFamiliares` / `RelacionesEstudianteTutor`:**
   - Columnas: `VinculoID`, `TutorPersonaID`, `EstudianteID`, `TipoParentesco`, `EsTutorLegal`, `EsContactoEmergencia`, `Estado`
4. **`RestriccionesCustodiaLegal`:**
   - Columnas: `RestriccionID`, `EstudianteID`, `TutorProhibidoID`, `NumeroOrdenJudicial`, `MotivoLegal`, `RegistradoPor`, `FechaRegistro`
5. **`BandejaNotificaciones`:**
   - Columnas: `NotificacionID`, `DestinatarioUserID`, `Titulo`, `Mensaje`, `Canal`, `EstadoEntrega`, `DeduplicationKey`, `FechaHora`

---

## 3. MICROSERVICIO DE TAREAS Y AULA VIRTUAL (`backend/task-service/Code.gs`)
**Spreadsheet Principal:** `SP_TASK`

### Tablas y Encabezados Clave:
1. **`AulasVirtuales`:**
   - Columnas: `ClassroomID`, `NombreMateria`, `Grado`, `Seccion`, `DocenteUserID`, `Estado`
2. **`MaterialesEducativos`:**
   - Columnas: `MaterialID`, `ClassroomID`, `Titulo`, `Descripcion`, `TipoRecurso`, `FileID`, `UrlRecurso`, `FechaPublicacion`
3. **`PublicacionesAnuncios`:**
   - Columnas: `PostID`, `ClassroomID`, `AutorUserID`, `Contenido`, `ArchivosAdjuntosJSON`, `FechaPublicacion`
4. **`EntregasVersiones`:**
   - Columnas: `VersionID`, `EntregaID`, `TareaID`, `UserID`, `VersionNum`, `FileID`, `TextoRespuesta`, `FechaEntrega`
5. **`EvaluacionesRubricas`:**
   - Columnas: `EvaluacionRubricaID`, `EntregaID`, `RubricaJSON`, `PuntajeCalculado`, `Observaciones`, `EvaluadoEn`

---

## 4. MICROSERVICIO DE EXÁMENES Y EVALUACIONES (`backend/exam-service/Code.gs`)
**Spreadsheet Principal:** `SP_EXAM`

### Tablas y Encabezados Clave:
1. **`BancoPreguntas`:**
   - Columnas: `PreguntaID`, `AreaCurricular`, `Asignatura`, `Grado`, `Tema`, `Dificultad`, `TipoPregunta`, `TextoPregunta`, `OpcionesJSON`, `RespuestaCorrecta`
2. **`Examenes`:**
   - Columnas: `ExamenID`, `Titulo`, `Asignatura`, `Grado`, `Seccion`, `FechaLimite`, `TiempoLimiteMinutos`, `PreguntasJSON`, `Estado`
3. **`CalificacionesEstudiantes`:**
   - Columnas: `CalificacionID`, `EvaluacionID`, `UserID`, `NotaObtenida`, `PuntajePonderado`, `EsBorrador`, `EsPublicada`, `Observaciones`, `FechaRegistro`
4. **`RubricasEvaluacion`:**
   - Columnas: `RubricaID`, `Titulo`, `Asignatura`, `CriteriosJSON`, `Estado`

---

## 5. MICROSERVICIO FINANCIERO Y CONTABLE (`backend/accounting-service/Code.gs`)
**Spreadsheet Principal:** `SP_ACCOUNTING`

### Tablas y Encabezados Clave:
1. **`CargosEstudiante`:**
   - Columnas: `CargoID`, `Fecha`, `UserId`, `Concepto`, `MontoBase`, `Descuento`, `MontoFinal`, `Estado`, `FechaVencimiento`
2. **`PagosAbonos`:**
   - Columnas: `PagoID`, `Fecha`, `UserId`, `ReferenciaTransaccion`, `Monto`, `MetodoPago`, `EstadoVerificacion`
3. **`FacturasFiscales`:**
   - Columnas: `FacturaID`, `NumeroCAI`, `RangoAutorizado`, `FechaEmision`, `RTNCliente`, `MontoExento`, `MontoGravado15`, `ISV15`, `TotalPagado`
4. **`BoletasPago` / `ExpedientesLaborales`:**
   - Columnas: `ExpedienteLaboralID`, `PersonaID`, `CodigoEmpleado`, `CargoID`, `SueldoBase`, `FechaIngreso`
