Reglas, Normas y Procedimiento de Auditoría de Código

1. Objetivo

Establecer las normas, criterios y procedimientos obligatorios para la ejecución de auditorías técnicas de código fuente, garantizando un proceso riguroso, documentado, trazable y completamente independiente de cualquier criterio subjetivo o automatizado.

La auditoría tiene como finalidad identificar errores, defectos, inconsistencias, riesgos técnicos, deuda técnica, vulnerabilidades, incumplimientos de arquitectura, problemas de mantenibilidad y cualquier otro elemento que pueda afectar la calidad, estabilidad, seguridad o escalabilidad del sistema.


---

2. Reglas Fundamentales del Auditor

2.1 Objetividad Absoluta

La auditoría debe ejecutarse bajo un principio de objetividad total.

El auditor:

No debe validar implementaciones por autoridad.

No debe asumir que una solución es correcta por provenir de un desarrollador experimentado.

No debe aceptar una implementación únicamente porque fue solicitada o aprobada previamente.

No debe otorgar validez a un componente basándose en la reputación, antigüedad o jerarquía de quien lo desarrolló.


Toda conclusión deberá estar respaldada exclusivamente por evidencia técnica verificable.


---

2.2 Análisis Técnico Crítico

La revisión deberá realizarse desde múltiples perspectivas simultáneamente:

Como Revisor de Código (Code Reviewer)

Evaluando:

Calidad de implementación.

Legibilidad.

Mantenibilidad.

Cumplimiento de estándares.

Buenas prácticas.


Como Auditor Técnico

Evaluando:

Cumplimiento de requisitos.

Consistencia arquitectónica.

Integridad de procesos.

Correcto uso de componentes.


Como Inspector de Calidad

Evaluando:

Errores potenciales.

Casos límite.

Omisiones.

Duplicación de lógica.

Código muerto.


Como Auditor Forense

Evaluando:

Origen de comportamientos inesperados.

Dependencias ocultas.

Efectos colaterales.

Riesgos futuros.

Trazabilidad de cambios.


Ningún detalle debe considerarse demasiado pequeño para ser revisado.


---

2.3 Prohibición de Automatización

La auditoría debe realizarse exclusivamente mediante inspección manual.

Queda estrictamente prohibido utilizar:

Herramientas automáticas de auditoría.

Scripts de análisis masivo.

Escáneres automáticos de código.

Sistemas de revisión automática.

Herramientas de corrección automática.

Cualquier mecanismo que sustituya el análisis detallado.


La revisión deberá efectuarse:

Línea por línea.

Función por función.

Variable por variable.

Referencia por referencia.

Dependencia por dependencia.

Flujo lógico por flujo lógico.


El auditor es responsable de comprender completamente cada elemento inspeccionado antes de emitir una conclusión.


---

2.4 Registro Obligatorio de Hallazgos

Todo hallazgo identificado deberá registrarse obligatoriamente en el archivo:

Auditoria.txt

No se permite omitir hallazgos por considerarlos menores, evidentes o repetitivos.

Cada registro deberá contener como mínimo:

Fecha de auditoría.

Archivo auditado.

Módulo o sector afectado.

Línea o rango de líneas.

Tipo de hallazgo.

Descripción técnica detallada.

Impacto potencial.

Nivel de criticidad.

Dependencias relacionadas.



---

2.5 Conversión Obligatoria de Hallazgos en Tareas

Todo hallazgo registrado en Auditoria.txt deberá convertirse en una tarea concreta dentro del bloque:

"Tareas Pendientes" del archivo:

Tareas.txt

Cada tarea deberá:

Ser específica.

Ser verificable.

Tener un objetivo claro.

Estar vinculada al hallazgo original.

Permitir su posterior implementación y validación.


No podrán existir hallazgos sin una tarea asociada.


---

3. Proceso Oficial de Auditoría

3.1 Creación del Registro Maestro de Dependencias

Antes de iniciar la auditoría deberá crearse el archivo:

MapaDependencias.md

Este documento funcionará como un registro central de trazabilidad y deberá contener:

Funciones

Nombre.

Archivo de origen.

Descripción.

Parámetros.

Valor de retorno.

Archivos que la utilizan.


Variables Globales

Nombre.

Tipo.

Archivo de origen.

Archivos consumidores.


Constantes

Nombre.

Valor.

Ubicación.

Dependencias.


Clases

Nombre.

Responsabilidad.

Herencia.

Dependencias.


Módulos

Nombre.

Función dentro del sistema.

Dependencias entrantes.

Dependencias salientes.


El objetivo es construir un mapa completo de relaciones internas del sistema.


---

3.2 Elaboración del Plan de Auditoría

Antes de auditar cualquier archivo deberá elaborarse un plan formal que establezca:

Orden de revisión.

Archivos a inspeccionar.

Dependencias críticas.

Riesgos conocidos.

Componentes prioritarios.

Estado actual de la auditoría.


El plan deberá actualizarse conforme avance el proceso.


---

3.3 Auditoría de Componentes Centrales

La auditoría iniciará obligatoriamente por los componentes de control principal del sistema, incluyendo:

Controladores.

Servicios principales.

Gestores de estado.

Núcleo de negocio.

Módulos de integración.

Sistemas de autenticación.

Motores de procesamiento.


Para cada archivo auditado se deberá registrar en MapaDependencias.md:

Funciones.

Variables.

Constantes.

Eventos.

Dependencias.

Relaciones con otros módulos.


Toda la información deberá organizarse por archivo y por bloques funcionales.


---

3.4 Creación de Respaldo

Antes de iniciar la revisión de cualquier archivo deberá generarse una copia de respaldo.

El archivo original no podrá ser modificado durante la etapa de auditoría.

La copia de respaldo servirá como referencia para validar la integridad del proceso.


---

3.5 Inspección Manual Exhaustiva

Cada archivo será revisado completamente mediante inspección manual.

La revisión deberá abarcar:

Variables

Declaración.

Alcance.

Uso.

Reutilización.

Riesgos.


Funciones

Entradas.

Salidas.

Validaciones.

Casos límite.

Dependencias.


Lógica de Negocio

Flujo de ejecución.

Condiciones.

Reglas de negocio.

Coherencia funcional.


Dependencias

Importaciones.

Exportaciones.

Referencias cruzadas.

Acoplamientos.


Gestión de Errores

Captura de excepciones.

Manejo de estados inválidos.

Recuperación de fallos.


Rendimiento

Operaciones redundantes.

Bucles innecesarios.

Consultas repetidas.

Cálculos duplicados.


Ningún elemento podrá considerarse auditado sin haber sido inspeccionado individualmente.


---

3.6 Registro de Hallazgos y Trazabilidad

Todo hallazgo deberá registrarse en Auditoria.txt indicando:

Fecha.

Archivo.

Línea o rango de líneas.

Módulo afectado.

Función afectada.

Variable afectada.

Dependencias relacionadas.

Descripción técnica.

Impacto potencial.


Posteriormente deberá consultarse MapaDependencias.md para determinar:

Qué otros archivos utilizan el elemento afectado.

Qué procesos dependen de él.

Qué impacto podría generar una futura corrección.


Esta información deberá agregarse al registro correspondiente.


---

3.7 Validación Final y Restauración

Una vez finalizada la auditoría de un archivo:

1. Se comparará obligatoriamente con su copia de respaldo.


2. Si no existen diferencias:

El respaldo será eliminado.



3. Si existen diferencias:

El archivo auditado será restaurado utilizando la copia de respaldo.

Se verificará que quede exactamente igual a su estado original.




La auditoría no debe introducir modificaciones permanentes al código fuente.


---

4. Restricción Absoluta Durante la Auditoría

Durante la fase de auditoría queda estrictamente prohibido:

Corregir errores.

Refactorizar código.

Optimizar funciones.

Eliminar elementos.

Agregar nuevas funcionalidades.

Alterar configuraciones.

Modificar estructuras existentes.


La auditoría es exclusivamente una actividad de inspección, documentación y generación de hallazgos.

Toda corrección deberá realizarse posteriormente mediante las tareas registradas en Instrucciones.txt.

La separación entre auditoría y corrección es obligatoria para preservar la objetividad, trazabilidad e integridad del proceso. :::

Además, recomendaría agregar una sección de clasificación de severidad de hallazgos (Crítico, Alto, Medio, Bajo, Observación) y una sección de criterios de cierre de auditoría, ya que facilitarán priorizar correcciones y medir cuándo una auditoría puede considerarse completada formalmente.
