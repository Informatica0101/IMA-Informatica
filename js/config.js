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
  USER: 'https://script.google.com/macros/s/AKfycbzD1mMce5JpnkHqM2L8i-HrrVMpnNJYf4KK0A6g5zFAMBFS8fYOzG25yG92QT7OK8mc/exec',

  // Pega aquí la URL del despliegie del microservicio de tareas.
  TASK: 'https://script.google.com/macros/s/AKfycbz4geYGjF7FCe17VuLL8uylHaKM1vwbDqnFmEMgZXQQFVhBkKt0GtT0LB-_u94IVGDZ/exec',

  // Pega aquí la URL del despliegue del microservicio de exámenes.
  EXAM: 'https://script.google.com/macros/s/AKfycbwH_DWGdegGA4SfyE5cTXrTROA6l0AnKCAEbD26FMmumISGmp92kTPSdDd7hxMcYpzk/exec'
};

// --- URL del sitio para CORS (si es necesario ajustarlo en el backend) ---
var FRONTEND_URL = 'https://informatica0101.github.io';

/**
 * CONFIGURACIÓN ACADÉMICA CENTRALIZADA (v7.7.1)
 * Punto único de verdad para el alcance académico vigente.
 */
window.GLOBAL_SCOPE = {
    ParcialActual: "Segundo Parcial",
    GradoActual: ["Décimo"],
    SeccionActual: ["A"],
    AsignaturaActual: ["Informática I"],
    TemaActual: ["General"]
};

/**
 * ÍNDICE FORMAL DE PRESENTACIONES (v7.7.1)
 * Mapeo de temas a archivos de presentación para vinculación con el sistema de calificación.
 */
window.PRESENTATION_INDEX = [
    { tema: "Imperativos Procedurales", asignatura: "Programación", grado: "11", file: "Imperativos_Procedurales.html" },
    { tema: "Estructuras de Control", asignatura: "Programación", grado: "11", file: "Estructuras_Control.html" },
    { tema: "Hardware y Software", asignatura: "Informática I", grado: "10", file: "Hardware_Software.html" },
    { tema: "Sistemas Operativos", asignatura: "Informática I", grado: "10", file: "Sistemas_Operativos.html" }
    // Este índice se expandirá automáticamente tras la migración del banco de preguntas
];

window.PARCIAL_ACTUAL = window.GLOBAL_SCOPE.ParcialActual;

/**
 * Sincroniza la configuración académica global con el servidor/caché (v7.7.4)
 */
window.syncAcademicScope = function(callback) {
    var normalizeToArray = function(val) {
        if (!val) return [];
        if (Array.isArray(val)) return val.filter(Boolean);
        if (typeof val === 'string') return val.split(',').map(function(s){ return s.trim(); }).filter(Boolean);
        return [val];
    };

    var applyConfig = function(data) {
        if (!data) return;

        // Normalización profunda de campos multi-valor (v7.7.5)
        window.GLOBAL_SCOPE = {
            ParcialActual: data.ParcialActual || "Primer Parcial",
            GradoActual: normalizeToArray(data.GradoActual),
            SeccionActual: normalizeToArray(data.SeccionActual),
            AsignaturaActual: normalizeToArray(data.AsignaturaActual),
            TemaActual: normalizeToArray(data.TemaActual)
        };

        if (window.GLOBAL_SCOPE.TemaActual.length === 0) window.GLOBAL_SCOPE.TemaActual = ["General"];
        window.PARCIAL_ACTUAL = window.GLOBAL_SCOPE.ParcialActual;

        console.log("[IMA-SCOPE] Alcance académico sincronizado (Normalizado):", window.GLOBAL_SCOPE);

        document.dispatchEvent(new CustomEvent('academic-scope-updated', { detail: window.GLOBAL_SCOPE }));
        if (typeof callback === 'function') callback(window.GLOBAL_SCOPE);
    };

    if (typeof fetchApi !== 'function') {
        console.warn("[IMA-SCOPE] fetchApi no disponible para sincronización inicial.");
        return Promise.resolve(window.GLOBAL_SCOPE);
    }

    // Retornamos una promesa para que el llamador pueda esperar a la sincronización REAL (desde el servidor)
    return new Promise(function(resolve) {
        fetchApi('USER', 'getAcademicConfig', {}, 0, {
            store: 'academic_stats',
            key: 'config',
            onUpdate: function(data) {
                applyConfig(data);
                // No resolvemos aquí porque onUpdate puede llamarse varias veces (caché y luego servidor)
            }
        }).then(function(res) {
            if (res && res.status === 'success' && res.data) {
                applyConfig(res.data);
                resolve(window.GLOBAL_SCOPE);
            } else {
                resolve(window.GLOBAL_SCOPE);
            }
        }).catch(function(e) {
            console.error("[IMA-SCOPE] Fallo crítico en sincronización:", e);
            resolve(window.GLOBAL_SCOPE);
        });
    });
};

var GRADE_MAP = {
    'decimo': 10, 'undecimo': 11, 'duodecimo': 12,
    '10': 10, '11': 11, '12': 12, '10mo': 10, '11no': 11, '12mo': 12,
    'ibtp': 10, 'iibtp': 11, 'iiibtp': 12
};

window.parseGrade = function(gradeStr) {
    if (!gradeStr) return 10;
    var normalized = gradeStr.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "");

    if (normalized.indexOf("duodecimo") !== -1 || normalized.indexOf("iiibtp") !== -1) return 12;
    if (normalized.indexOf("undecimo") !== -1 || normalized.indexOf("iibtp") !== -1) return 11;
    if (normalized.indexOf("decimo") !== -1 || normalized.indexOf("ibtp") !== -1) return 10;

    var match = gradeStr.toString().match(/\d+/);
    if (match) {
        var num = parseInt(match[0]);
        if (num === 12) return 12;
        if (num === 11) return 11;
        if (num === 10) return 10;
    }

    return 10;
};

window.getSanitizedAcademicText = function(text) {
    if (!text) return "";
    return text.toString().trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/_/g, " ")
        .toUpperCase();
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
    var n = lvl.toLowerCase().normalize("NFD").replace(/[\u0300._-]/g, "").replace(/[\u0300-\u036f]/g, "");
    if (n === 'basico') return 'Básico';
    if (n === 'intermedio') return 'Intermedio';
    if (n === 'avanzado') return 'Avanzado';
    return lvl;
};

/**
 * REQ: Estandarización Psicométrica (Modulo 2)
 * Asegura el redondeo simétrico a 2 decimales para métricas de analítica.
 */
window.formatearMetricaPsicométrica = function(valor) {
    if (valor === undefined || valor === null) return "0.00";
    var num = parseFloat(valor);
    if (isNaN(num)) return "0.00";
    return (Math.round(num * 100) / 100).toFixed(2);
};

window.redondearMetrica = window.formatearMetricaPsicométrica;


/**
 * Sanitizador de HTML para etiquetas técnicas permitidas (Modulo 5.4)
 * Permite renderizar <code>, <b>, <i>, <br>, <pre> de forma segura.
 */
window.sanitizarHTMLTecnico = function(html) {
    if (!html) return '';

    var temp = document.createElement('div');
    temp.textContent = html;
    var sanitized = temp.innerHTML;

    var tags = 'p|div|span|strong|b|i|u|s|strike|em|ul|ol|li|code|pre|br|blockquote|h1|h2|h3|center|table|thead|tbody|tr|td|th';

    sanitized = sanitized.replace(new RegExp('&lt;(/?)(' + tags + ')(.*?)&gt;', 'gi'), function(match, slash, tag, attrs) {
        var cleanAttrs = attrs.replace(/&quot;/g, '"').replace(/\s*on\w+\s*=\s*(?:'[^']*'|"[^" ]*"|[^\s>]+)/gi, '');
        return '<' + slash + tag + cleanAttrs + '>';
    });

    sanitized = sanitized.replace(/&lt;a\s+(.*?)&gt;/gi, function(match, attrs) {
        var cleanAttrs = attrs.replace(/&quot;/g, '"').replace(/\s*on\w+\s*=\s*(?:'[^']*'|"[^" ]*"|[^\s>]+)/gi, '');
        if (cleanAttrs.indexOf('target=') === -1) cleanAttrs += ' target="_blank"';
        return '<a ' + cleanAttrs + '>';
    });
    sanitized = sanitized.replace(/&lt;\/a&gt;/gi, '</a>');

    sanitized = sanitized.replace(/&amp;(lt|gt|quot|apos|amp|nbsp);/g, '&$1;');

    return sanitized;
};

/**
 * Normaliza nombres de parciales para permitir comparaciones flexibles
 */
function normalizePartial(p) {
    if (!p) return "";
    var n = p.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (n.indexOf("primer") !== -1 || n === "i parcial") return "Primer Parcial";
    if (n.indexOf("segundo") !== -1 || n === "ii parcial") return "Segundo Parcial";
    if (n.indexOf("tercer") !== -1 || n === "iii parcial") return "Tercer Parcial";
    if (n.indexOf("cuarto") !== -1 || n === "iv parcial") return "Cuarto Parcial";
    return p;
}
window.normalizePartial = normalizePartial;

window.isContentAuthorized = function(contentPartial, contentSubject, contentTopic, contentGrade, contentSection) {
    var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    var user = userRaw ? JSON.parse(userRaw) : { rol: 'Invitado' };

    // El profesor siempre tiene acceso completo
    if (user.rol === 'Profesor') return true;

    // Si no hay configuración de alcance cargada, ser restrictivo por defecto
    if (!window.GLOBAL_SCOPE) return false;

    // Helper para normalizar strings de comparación
    var fastNorm = function(s) {
        if (!s) return "";
        return s.toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    // --- TIER 1: VALIDACIÓN GLOBAL (VIGENTE) ---

    // 1. Verificación de Parcial (OBLIGATORIO)
    if (!contentPartial) return false;
    var normContentP = normalizePartial(contentPartial);
    var normActualP = normalizePartial(window.GLOBAL_SCOPE.ParcialActual);

    var partialAuthorized = (normContentP === normActualP);
    if (!partialAuthorized) {
        var partialGroups = {
            "I y II Parcial": ["Primer Parcial", "Segundo Parcial"],
            "III y IV Parcial": ["Tercer Parcial", "Cuarto Parcial"]
        };
        if (partialGroups[contentPartial]) {
            partialAuthorized = partialGroups[contentPartial].indexOf(normActualP) !== -1;
        }
    }
    if (!partialAuthorized) return false;

    // 2. Verificación de Grado (Global)
    if (contentGrade && window.GLOBAL_SCOPE.GradoActual && window.GLOBAL_SCOPE.GradoActual.length > 0) {
        var cGradeVal = window.parseGrade(contentGrade);
        var gMatch = false;
        for (var i = 0; i < window.GLOBAL_SCOPE.GradoActual.length; i++) {
            if (window.parseGrade(window.GLOBAL_SCOPE.GradoActual[i]) === cGradeVal) {
                gMatch = true;
                break;
            }
        }
        if (!gMatch) return false;
    }

    // 3. Verificación de Sección (Global)
    if (contentSection && window.GLOBAL_SCOPE.SeccionActual && window.GLOBAL_SCOPE.SeccionActual.length > 0) {
        var sMatch = false;
        var sectionsToCheck = Array.isArray(contentSection) ? contentSection : contentSection.toString().split(',').map(function(s){return s.trim();});
        for (var j = 0; j < sectionsToCheck.length; j++) {
            if (window.GLOBAL_SCOPE.SeccionActual.indexOf(sectionsToCheck[j]) !== -1) {
                sMatch = true;
                break;
            }
        }
        if (!sMatch) return false;
    }

    // 4. Verificación de Asignatura (Global)
    if (contentSubject && window.GLOBAL_SCOPE.AsignaturaActual && window.GLOBAL_SCOPE.AsignaturaActual.length > 0) {
        var normSubj = fastNorm(contentSubject);
        var asigMatch = false;
        for (var k = 0; k < window.GLOBAL_SCOPE.AsignaturaActual.length; k++) {
            if (fastNorm(window.GLOBAL_SCOPE.AsignaturaActual[k]) === normSubj) {
                asigMatch = true;
                break;
            }
        }
        if (!asigMatch) return false;
    }

    // 5. Verificación de Tema (Global)
    if (contentTopic && window.GLOBAL_SCOPE.TemaActual && window.GLOBAL_SCOPE.TemaActual.length > 0) {
        if (window.GLOBAL_SCOPE.TemaActual.indexOf("General") === -1) {
            var normTopic = fastNorm(contentTopic);
            var tMatch = false;
            for (var l = 0; l < window.GLOBAL_SCOPE.TemaActual.length; l++) {
                if (fastNorm(window.GLOBAL_SCOPE.TemaActual[l]) === normTopic) {
                    tMatch = true;
                    break;
                }
            }
            if (!tMatch) return false;
        }
    }

    // --- TIER 2: VALIDACIÓN DE PERFIL (SOLO PARA ALUMNOS LOGUEADOS) ---
    // Si el usuario es estudiante, solo puede ver lo que corresponde a SU grado y sección
    if (user.rol === 'Estudiante' || user.rol === 'Alumno') {
        if (contentGrade) {
            if (window.parseGrade(contentGrade) !== window.parseGrade(user.grado)) return false;
        }
        if (contentSection && user.seccion) {
            if (!window.checkSectionHelper(contentSection, user.seccion)) return false;
        }
    }

    return true;
};

window.validateQuestion = function(q) {
    var normalized = window.normalizeQuestion(q);
    var required = ['Asignatura', 'Nivel', 'Pregunta', 'RespuestaCorrecta'];

    if (normalized.TipoActividad === 'ordering' || normalized.TipoActividad === 'matching') {
        var index = required.indexOf('RespuestaCorrecta');
        if (index > -1) required.splice(index, 1);
    }

    for (var i = 0; i < required.length; i++) {
        var field = required[i];
        if (!normalized[field] || normalized[field].toString().trim() === "") {
            return { valid: false, error: "Campo requerido faltante: " + field };
        }
    }

    if (normalized.TipoActividad === 'verdadero_falso') {
        if (!normalized.OpcionA || !normalized.OpcionB) return { valid: false, error: "Verdadero/Falso requiere OpcionA y OpcionB" };
    } else if (normalized.TipoActividad === 'opcion_multiple' || normalized.TipoActividad === 'Selección múltiple') {
        if (!normalized.OpcionA || !normalized.OpcionB || !normalized.OpcionC) return { valid: false, error: "Opción Múltiple requiere al menos 3 opciones (A, B, C)" };
    }

    return { valid: true };
};

window.GamesAdapter = window.GamesAdapter || {
    isFallback: true,
    init: function() { return Promise.resolve({ lb: { global: [], subjectTops: {} }, record: {} }); },
    showLoading: function(active) {
        console.warn("[IMA-SYSTEM] GamesAdapter (Fallback) showLoading:", active);
        return Promise.resolve();
    },
    saveResult: function() { return Promise.resolve({ status: 'success' }); },
    recordAction: function() {},
    finishSession: function() { return Promise.resolve({ status: 'success' }); },
    endSession: function() {},
    getLeaderboard: function() { return Promise.resolve({ status: 'success', global: [], subjectTops: {} }); },
    getPersonalRecord: function() { return Promise.resolve({}); }
};

window.normalizeQuestion = function(q) {
    if (!q) return null;

    var id = q.id || q.ID || q.PreguntaID || ("bank_" + Math.random().toString(36).substr(2, 9));
    var Asignatura = q.Asignatura || q.subject || q.asignatura || "Informática I";
    var Pregunta = q.Pregunta || q.question || q.pregunta || q.enunciado || "";
    var TipoActividad = q.TipoActividad || q.type || q.tipoActividad || q.tipo_pregunta || "opcion_multiple";
    var Nivel = q.Nivel || q.nivel || "Básico";
    var Tema = q.Tema || q.tema || (q.tags && q.tags[0]) || "General";
    var Grado = q.Grado || q.grado || 10;

    var OpcionA = q.OpcionA || q.opcionA || (q.options && q.options[0]) || "";
    var OpcionB = q.OpcionB || q.opcionB || (q.options && q.options[1]) || "";
    var OpcionC = q.OpcionC || q.opcionC || (q.options && q.options[2]) || "";
    var OpcionD = q.OpcionD || q.opcionD || (q.options && q.options[3]) || "";

    var respuestaCorrecta = (q.RespuestaCorrecta !== undefined) ? q.RespuestaCorrecta :
                             ((q.respuestaCorrecta !== undefined) ? q.respuestaCorrecta :
                             ((q.respuesta_correcta_literal !== undefined) ? q.respuesta_correcta_literal :
                             ((q.answer !== undefined) ? q.answer :
                             ((q.correctAnswer !== undefined) ? q.correctAnswer :
                             ((q.correct_answer !== undefined) ? q.correct_answer :
                             ((q.correctType !== undefined) ? q.correctType :
                             ((q.solution !== undefined) ? q.solution :
                             ((q.a !== undefined) ? q.a : null))))))));

    if (respuestaCorrecta === null && TipoActividad !== 'ordering' && TipoActividad !== 'matching' && TipoActividad !== 'emparejamiento') {
        console.warn("[IMA-NORMALIZER] No se detectó respuesta correcta para la pregunta:", q);
    }

    var Enunciado = q.enunciado || Pregunta;
    var TipoPregunta = q.tipo_pregunta || TipoActividad;
    var RespuestaCorrectaLiteral = q.respuesta_correcta_literal || respuestaCorrecta;
    var OpcionesVisibles = q.opciones_visibles || q.opciones || [];
    var Parejas = q.parejas || [];

    var result = {};
    for (var key in q) { result[key] = q[key]; }

    result.id = id;
    result.Asignatura = Asignatura;
    result.Pregunta = Pregunta;
    result.TipoActividad = TipoActividad;
    result.Nivel = Nivel;
    result.Tema = Tema;
    result.Grado = Grado;
    result.OpcionA = OpcionA;
    result.OpcionB = OpcionB;
    result.OpcionC = OpcionC;
    result.OpcionD = OpcionD;
    result.RespuestaCorrecta = (respuestaCorrecta !== null) ? String(respuestaCorrecta).trim() : null;

    result.enunciado = Enunciado;
    result.tipo_pregunta = TipoPregunta;
    result.respuesta_correcta_literal = (RespuestaCorrectaLiteral !== null) ? String(RespuestaCorrectaLiteral).trim() : null;
    result.opciones_visibles = OpcionesVisibles;
    result.parejas = Parejas;

    result.asignatura = Asignatura;
    result.pregunta = Pregunta;
    result.tipoActividad = TipoActividad;
    result.nivel = Nivel;
    result.tema = Tema;
    result.grado = Grado;
    result.opcionA = OpcionA;
    result.opcionB = OpcionB;
    result.opcionC = OpcionC;
    result.opcionD = OpcionD;
    result.respuestaCorrecta = result.RespuestaCorrecta;

    return result;
};
