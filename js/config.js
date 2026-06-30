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
  USER: 'https://script.google.com/macros/s/AKfycbxzclcX7ulnXKLn0yLKiJdo3CsBz10OYYfQDwj9UklMhAS8BfY_eSywtZ7jwO5aulr3/exec',

  // Pega aquí la URL del despliegie del microservicio de tareas.
  TASK: 'https://script.google.com/macros/s/AKfycbz4geYGjF7FCe17VuLL8uylHaKM1vwbDqnFmEMgZXQQFVhBkKt0GtT0LB-_u94IVGDZ/exec',

  // Pega aquí la URL del despliegue del microservicio de exámenes.
  EXAM: 'https://script.google.com/macros/s/AKfycbwyLYiXI3KHmBm8tr7-Gr8QXP-k5jPe8wlX622C8nvwRD2EV0Uu5ViwT6RVyLb4wz4/exec'
};

// --- URL del sitio para CORS (si es necesario ajustarlo en el backend) ---
var FRONTEND_URL = 'https://informatica0101.github.io';

/**
 * CONFIGURACIÓN ACADÉMICA CENTRALIZADA
 * Punto único de verdad para el período escolar vigente.
 * Valores: "Primer Parcial", "Segundo Parcial", "Tercer Parcial", "Cuarto Parcial"
 */
window.PARCIAL_ACTUAL = "Segundo Parcial";

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

window.isContentAuthorized = function(contentPartial) {
    var userRaw = localStorage.getItem('currentUser');
    if (!userRaw) return false;
    var user = JSON.parse(userRaw);
    if (user && user.rol === 'Profesor') return true;

    if (!contentPartial) return false;

    var normContent = normalizePartial(contentPartial);
    var normActual = normalizePartial(window.PARCIAL_ACTUAL);

    if (normContent === normActual) return true;

    var partialGroups = {
        "I y II Parcial": ["Primer Parcial", "Segundo Parcial"],
        "III y IV Parcial": ["Tercer Parcial", "Cuarto Parcial"]
    };

    if (partialGroups[contentPartial]) {
        return partialGroups[contentPartial].indexOf(normActual) !== -1;
    }

    return false;
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
