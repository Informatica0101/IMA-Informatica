// --- INSTRUCCIONES DE DESPLIEGUE DE MICROSERVICIOS ---
// 1. Para cada carpeta en el directorio `backend` (ej. `user-service`), crea un NUEVO proyecto de Google Apps Script.
// 2. Copia el contenido del archivo `Code.gs` de esa carpeta en el proyecto de Apps Script.
// 3. Haz clic en "Implementar" > "Nueva implementación".
// 4. Selecciona "Aplicación web" como tipo, dale una descripción (ej. "User Service v1").
// 5. En "Quién tiene acceso", selecciona "Cualquiera".
// 6. Haz clic en "Implementar" y copia la URL de la aplicación web.
// 7. Pega esa URL en el campo correspondiente de este objeto de configuración.
// 8. Repite este proceso para CADA microservicio.
// ----------------------------------------------------------

window.SERVICE_URLS = {
  // Pega aquí la URL del despliegue del microservicio de usuarios.
  USER: 'https://script.google.com/macros/s/AKfycbwwEL7Yi8QwvDnXtBefurqyytRJwy0eM12mcOmwMjjXctDJo9l-YTXdhPZCSrDS5BrP/exec',

  // Pega aquí la URL del despliegie del microservicio de tareas.
  TASK: 'https://script.google.com/macros/s/AKfycbxWuV297LRx8487hMeh_FBHxkTFtytNT3UZoQBZwfQv_gE85QRrBj88KJ_0_CvXeh_W/exec',

  // Pega aquí la URL del despliegue del microservicio de exámenes.
  EXAM: 'https://script.google.com/macros/s/AKfycbwyLYiXI3KHmBm8tr7-Gr8QXP-k5jPe8wlX622C8nvwRD2EV0Uu5ViwT6RVyLb4wz4/exec'
};

// --- URL del sitio para CORS (si es necesario ajustarlo en el backend) ---
const FRONTEND_URL = 'https://informatica0101.github.io';

/**
 * CONFIGURACIÓN ACADÉMICA CENTRALIZADA
 * Punto único de verdad para el período escolar vigente.
 * Valores: "Primer Parcial", "Segundo Parcial", "Tercer Parcial", "Cuarto Parcial"
 */
window.PARCIAL_ACTUAL = "Segundo Parcial";

const GRADE_MAP = {
    'decimo': 10, 'undecimo': 11, 'duodecimo': 12,
    '10': 10, '11': 11, '12': 12, '10mo': 10, '11no': 11, '12mo': 12,
    'ibtp': 10, 'iibtp': 11, 'iiibtp': 12
};

window.parseGrade = function(gradeStr) {
    if (!gradeStr) return 10;
    const normalized = gradeStr.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "");

    if (normalized.includes("duodecimo") || normalized.includes("iiibtp")) return 12;
    if (normalized.includes("undecimo") || normalized.includes("iibtp")) return 11;
    if (normalized.includes("decimo") || normalized.includes("ibtp")) return 10;

    const match = gradeStr.toString().match(/\d+/);
    if (match) {
        const num = parseInt(match[0]);
        if (num === 12) return 12;
        if (num === 11) return 11;
        if (num === 10) return 10;
    }

    return 10;
};

window.normalizeSubject = function(name) {
    if (!name) return 'General';
    return name.trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s*\(?(?:[IVX]+)?\s*Parcial\)?/i, '')
        .replace(/\s+\(?[IVX]+\)?$/i, '')
        .replace(/\s+I{1,3}$/i, '')
        .trim();
};

window.getStandardLevelName = function(lvl) {
    if (!lvl) return 'Básico';
    const n = lvl.toLowerCase().normalize("NFD").replace(/[\u0300._-]/g, "").replace(/[\u0300-\u036f]/g, "");
    if (n === 'basico') return 'Básico';
    if (n === 'intermedio') return 'Intermedio';
    if (n === 'avanzado') return 'Avanzado';
    return lvl;
};

/**
 * REQ 7: Guardián Global de Alcance (Scope Guard)
 * Centraliza la lógica de visibilidad para prevenir fugas accidentales de contenido.
 */
/**
 * Normaliza nombres de parciales para permitir comparaciones flexibles
 * (ej. "II Parcial" -> "Segundo Parcial")
 */
function normalizePartial(p) {
    if (!p) return "";
    const n = p.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (n.includes("primer") || n === "i parcial") return "Primer Parcial";
    if (n.includes("segundo") || n === "ii parcial") return "Segundo Parcial";
    if (n.includes("tercer") || n === "iii parcial") return "Tercer Parcial";
    if (n.includes("cuarto") || n === "iv parcial") return "Cuarto Parcial";
    return p;
}
window.normalizePartial = normalizePartial;

window.isContentAuthorized = function(contentPartial) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user?.rol === 'Profesor') return true;

    if (!contentPartial) return false;

    const normContent = normalizePartial(contentPartial);
    const normActual = normalizePartial(window.PARCIAL_ACTUAL);

    // El estudiante solo tiene acceso al parcial configurado globalmente
    if (normContent === normActual) return true;

    // Manejo de asignaturas que abarcan múltiples parciales
    const partialGroups = {
        "I y II Parcial": ["Primer Parcial", "Segundo Parcial"],
        "III y IV Parcial": ["Tercer Parcial", "Cuarto Parcial"]
    };

    if (partialGroups[contentPartial]) {
        return partialGroups[contentPartial].includes(normActual);
    }

    return false;
};

/**
 * Validador de estructura de preguntas para el Banco Central.
 * Asegura que los datos cumplen con el esquema requerido antes de persistir.
 */
window.validateQuestion = function(q) {
    // Normalizar antes de validar para ser flexible con nombres de campos (v3.2)
    const normalized = window.normalizeQuestion(q);

    const required = ['Asignatura', 'Nivel', 'Pregunta', 'RespuestaCorrecta'];

    // Saltamos validación de RespuestaCorrecta para tipos que manejan datos complejos como pares o items
    if (normalized.TipoActividad === 'ordering' || normalized.TipoActividad === 'matching') {
        const index = required.indexOf('RespuestaCorrecta');
        if (index > -1) required.splice(index, 1);
    }

    for (const field of required) {
        if (!normalized[field] || normalized[field].toString().trim() === "") {
            return { valid: false, error: `Campo requerido faltante: ${field}` };
        }
    }

    // Validar que al menos haya 2 opciones si es V/F o 3-4 si es Opción Múltiple
    if (normalized.TipoActividad === 'verdadero_falso') {
        if (!normalized.OpcionA || !normalized.OpcionB) return { valid: false, error: "Verdadero/Falso requiere OpcionA y OpcionB" };
    } else if (normalized.TipoActividad === 'opcion_multiple' || normalized.TipoActividad === 'Selección múltiple') {
        if (!normalized.OpcionA || !normalized.OpcionB || !normalized.OpcionC) return { valid: false, error: "Opción Múltiple requiere al menos 3 opciones (A, B, C)" };
    }

    return { valid: true };
};

/**
 * REQ: Fallback de seguridad para GamesAdapter (Incidencia 1)
 * Previene errores de referencia si el script no carga a tiempo o falla.
 */
window.GamesAdapter = window.GamesAdapter || {
    isFallback: true,
    init: () => Promise.resolve({ lb: { global: [], subjectTops: {} }, record: {} }),
    showLoading: (active) => {
        console.warn("[IMA-SYSTEM] GamesAdapter (Fallback) showLoading:", active);
        return Promise.resolve();
    },
    saveResult: () => Promise.resolve({ status: 'success' }),
    recordAction: () => {},
    finishSession: () => Promise.resolve({ status: 'success' }),
    endSession: () => {},
    getLeaderboard: () => Promise.resolve({ status: 'success', global: [], subjectTops: {} }),
    getPersonalRecord: () => Promise.resolve({})
};

/**
 * REQ: Normalización Universal de Preguntas (Incidencia 3)
 * Estandariza el campo de respuesta correcta para eliminar el error "undefined".
 */
window.normalizeQuestion = function(q) {
    if (!q) return null;

    // Mapeo crítico para resolver errores de integridad (v3.2)
    const id = q.id || q.ID || q.PreguntaID || `bank_${Math.random().toString(36).substr(2, 9)}`;
    const Asignatura = q.Asignatura || q.subject || q.asignatura || "Informática I";
    const Pregunta = q.Pregunta || q.question || q.pregunta || "";
    const TipoActividad = q.TipoActividad || q.type || q.tipoActividad || "opcion_multiple";
    const Nivel = q.Nivel || q.nivel || "Básico";
    const Tema = q.Tema || q.tema || (q.tags && q.tags[0]) || "General";
    const Grado = q.Grado || q.grado || 10;

    const OpcionA = q.OpcionA || q.opcionA || (q.options && q.options[0]) || "";
    const OpcionB = q.OpcionB || q.opcionB || (q.options && q.options[1]) || "";
    const OpcionC = q.OpcionC || q.opcionC || (q.options && q.options[2]) || "";
    const OpcionD = q.OpcionD || q.opcionD || (q.options && q.options[3]) || "";

    const respuestaCorrecta = q.RespuestaCorrecta ??
                             q.respuestaCorrecta ??
                             q.answer ??
                             q.correctAnswer ??
                             q.correct_answer ??
                             q.correctType ??
                             q.solution ??
                             q.a ??
                             null;

    if (respuestaCorrecta === null && TipoActividad !== 'ordering' && TipoActividad !== 'matching') {
        console.warn("[IMA-NORMALIZER] No se detectó respuesta correcta para la pregunta:", q);
    }

    return {
        ...q,
        id,
        Asignatura,
        Pregunta,
        TipoActividad,
        Nivel,
        Tema,
        Grado,
        OpcionA,
        OpcionB,
        OpcionC,
        OpcionD,
        RespuestaCorrecta: (respuestaCorrecta !== null) ? String(respuestaCorrecta).trim() : null,
        // Mantener campos para compatibilidad con código existente que use camelCase
        asignatura: Asignatura,
        pregunta: Pregunta,
        tipoActividad: TipoActividad,
        nivel: Nivel,
        tema: Tema,
        grado: Grado,
        opcionA: OpcionA,
        opcionB: OpcionB,
        opcionC: OpcionC,
        opcionD: OpcionD,
        respuestaCorrecta: (respuestaCorrecta !== null) ? String(respuestaCorrecta).trim() : null
    };
};
