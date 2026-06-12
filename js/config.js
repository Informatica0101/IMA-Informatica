/**
 * QuizPro v7.5 - Centralized Configuration & Security
 * Strict ES5 Implementation with Namespacing and IIFE.
 */
var QuizProApp = window.QuizProApp || {};

(function(app) {
    // --- URLs de Microservicios ---
    app.SERVICE_URLS = {
        USER: 'https://script.google.com/macros/s/AKfycbzgz0ULhN1_px6DEtI9P_NbCW2ARSxn6JImXw4auWxbcHiBB23iZodrUKzA2wprtCY/exec',
        TASK: 'https://script.google.com/macros/s/AKfycbxn8xRxUj2hz4UnirI5F-PDwFh9XGZn4QjpveQerzjlXsyM7396gXpRX0Udyjyb-YsJ/exec',
        EXAM: 'https://script.google.com/macros/s/AKfycbwyLYiXI3KHmBm8tr7-Gr8QXP-k5jPe8wlX622C8nvwRD2EV0Uu5ViwT6RVyLb4wz4/exec'
    };

    app.FRONTEND_URL = 'https://informatica0101.github.io';
    app.PARCIAL_ACTUAL = "Segundo Parcial";

    var GRADE_MAP = {
        'decimo': 10, 'undecimo': 11, 'duodecimo': 12,
        '10': 10, '11': 11, '12': 12, '10mo': 10, '11no': 11, '12mo': 12,
        'ibtp': 10, 'iibtp': 11, 'iiibtp': 12
    };

    app.parseGrade = function(gradeStr) {
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

    app.getSanitizedAcademicText = function(text) {
        if (!text) return "";
        return text.toString().trim()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/_/g, " ")
            .toUpperCase();
    };

    app.normalizeSubject = function(name) {
        if (!name) return 'General';
        return name.trim()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/\s*\(?(?:[IVX]+)?\s*Parcial\)?/i, '')
            .replace(/\s+\(?[IVX]+\)?$/i, '')
            .replace(/\s+I{1,3}$/i, '')
            .trim();
    };

    app.getStandardLevelName = function(lvl) {
        if (!lvl) return 'Básico';
        var n = lvl.toLowerCase().normalize("NFD").replace(/[\u0300._-]/g, "").replace(/[\u0300-\u036f]/g, "");
        if (n === 'basico') return 'Básico';
        if (n === 'intermedio') return 'Intermedio';
        if (n === 'avanzado') return 'Avanzado';
        return lvl;
    };

    app.formatearMetricaPsicométrica = function(valor) {
        if (valor === undefined || valor === null) return "0.00";
        var num = parseFloat(valor);
        if (isNaN(num)) return "0.00";
        return (Math.round(num * 100) / 100).toFixed(2);
    };

    app.redondearMetrica = app.formatearMetricaPsicométrica;

    /**
     * REQ v7.2: XP Range Calculation
     * Returns the academic rank based on accumulated XP.
     */
    app.getRange = function(xp) {
        var x = parseInt(xp || 0);
        if (x >= 22001) return 'Leyenda';
        if (x >= 14001) return 'Maestro';
        if (x >= 8001) return 'Avanzado';
        if (x >= 4001) return 'Promedio';
        if (x >= 1501) return 'Principiante';
        return 'Básico';
    };

    /**
     * Helper manual para extraer parámetros de la URL (ES5 compatible).
     * @param {string} param - Nombre del parámetro.
     * @returns {string|null} - Valor del parámetro o null.
     */
    app.getUrlParam = function(param) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (decodeURIComponent(pair[0]) === param) {
                return decodeURIComponent(pair[1]);
            }
        }
        return null;
    };

    app.sanitizarHTMLTecnico = function(html) {
        if (!html) return '';
        var temp = document.createElement('div');
        temp.textContent = html;
        var sanitized = temp.innerHTML;

        // REQ v7.5: Enhanced Sanitization including span and p
        return sanitized
            .replace(/&lt;code&gt;/gi, '<code>').replace(/&lt;\/code&gt;/gi, '</code>')
            .replace(/&lt;b&gt;/gi, '<b>').replace(/&lt;\/b&gt;/gi, '</b>')
            .replace(/&lt;strong&gt;/gi, '<strong>').replace(/&lt;\/strong&gt;/gi, '</strong>')
            .replace(/&lt;i&gt;/gi, '<i>').replace(/&lt;\/i&gt;/gi, '</i>')
            .replace(/&lt;em&gt;/gi, '<em>').replace(/&lt;\/em&gt;/gi, '</em>')
            .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
            .replace(/&lt;pre&gt;/gi, '<pre>').replace(/&lt;\/pre&gt;/gi, '</pre>')
            .replace(/&lt;span&gt;/gi, '<span>').replace(/&lt;\/span&gt;/gi, '</span>')
            .replace(/&lt;p&gt;/gi, '<p>').replace(/&lt;\/p&gt;/gi, '</p>')
            .replace(/&lt;ul&gt;/gi, '<ul>').replace(/&lt;\/ul&gt;/gi, '</ul>')
            .replace(/&lt;ol&gt;/gi, '<ol>').replace(/&lt;\/ol&gt;/gi, '</ol>')
            .replace(/&lt;li&gt;/gi, '<li>').replace(/&lt;\/li&gt;/gi, '</li>')
            .replace(/&lt;a\s+href=(&quot;|')(.*?)(&quot;|')&gt;/gi, '<a href=$1$2$3 target="_blank" class="text-blue-600 underline">')
            .replace(/&lt;\/a&gt;/gi, '</a>');
    };

    app.normalizePartial = function(p) {
        if (!p) return "";
        var n = p.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        if (n.indexOf("primer") !== -1 || n === "i parcial") return "Primer Parcial";
        if (n.indexOf("segundo") !== -1 || n === "ii parcial") return "Segundo Parcial";
        if (n.indexOf("tercer") !== -1 || n === "iii parcial") return "Tercer Parcial";
        if (n.indexOf("cuarto") !== -1 || n === "iv parcial") return "Cuarto Parcial";
        return p;
    };

    app.isContentAuthorized = function(contentPartial) {
        var userRaw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        var user = userRaw ? JSON.parse(userRaw) : null;
        if (user && user.rol === 'Profesor') return true;

        if (!contentPartial) return false;

        var normContent = app.normalizePartial(contentPartial);
        var normActual = app.normalizePartial(app.PARCIAL_ACTUAL);

        if (normContent === normActual) return true;

        var partialGroups = {
            "I y II Parcial": ["Primer Parcial", "Segundo Parcial"],
            "III y IV Parcial": ["Tercer Parcial", "Cuarto Parcial"]
        };

        if (partialGroups[contentPartial]) {
            var group = partialGroups[contentPartial];
            for (var i = 0; i < group.length; i++) {
                if (group[i] === normActual) return true;
            }
        }
        return false;
    };

    app.validateQuestion = function(q) {
        var normalized = app.normalizeQuestion(q);
        var required = ['Asignatura', 'Nivel', 'Pregunta', 'RespuestaCorrecta'];

        if (normalized.TipoActividad === 'ordering' || normalized.TipoActividad === 'matching' || normalized.TipoActividad === 'emparejamiento') {
            var index = -1;
            for (var i = 0; i < required.length; i++) {
                if (required[i] === 'RespuestaCorrecta') { index = i; break; }
            }
            if (index > -1) required.splice(index, 1);
        }

        for (var j = 0; j < required.length; j++) {
            var field = required[j];
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

    app.normalizeQuestion = function(q) {
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

        var respuestaCorrecta = q.RespuestaCorrecta !== undefined ? q.RespuestaCorrecta :
                                q.respuestaCorrecta !== undefined ? q.respuestaCorrecta :
                                q.respuesta_correcta_literal !== undefined ? q.respuesta_correcta_literal :
                                q.answer !== undefined ? q.answer :
                                q.correctAnswer !== undefined ? q.correctAnswer :
                                q.correct_answer !== undefined ? q.correct_answer :
                                q.correctType !== undefined ? q.correctType :
                                q.solution !== undefined ? q.solution :
                                q.a !== undefined ? q.a :
                                null;

        var Enunciado = q.enunciado || Pregunta;
        var TipoPregunta = q.tipo_pregunta || TipoActividad;
        var RespuestaCorrectaLiteral = q.respuesta_correcta_literal || respuestaCorrecta;
        var OpcionesVisibles = q.opciones_visibles || q.opciones || [];
        var Parejas = q.parejas || [];

        var normalized = {};
        for (var key in q) {
            if (Object.prototype.hasOwnProperty.call(q, key)) {
                normalized[key] = q[key];
            }
        }

        normalized.id = id;
        normalized.Asignatura = Asignatura;
        normalized.Pregunta = Pregunta;
        normalized.TipoActividad = TipoActividad;
        normalized.Nivel = Nivel;
        normalized.Tema = Tema;
        normalized.Grado = Grado;
        normalized.OpcionA = OpcionA;
        normalized.OpcionB = OpcionB;
        normalized.OpcionC = OpcionC;
        normalized.OpcionD = OpcionD;
        normalized.RespuestaCorrecta = (respuestaCorrecta !== null) ? String(respuestaCorrecta).trim() : null;
        normalized.enunciado = Enunciado;
        normalized.tipo_pregunta = TipoPregunta;
        normalized.respuesta_correcta_literal = (RespuestaCorrectaLiteral !== null) ? String(RespuestaCorrectaLiteral).trim() : null;
        normalized.opciones_visibles = OpcionesVisibles;
        normalized.parejas = Parejas;

        // Aliases for compatibility
        normalized.asignatura = Asignatura;
        normalized.pregunta = Pregunta;
        normalized.tipoActividad = TipoActividad;
        normalized.nivel = Nivel;
        normalized.tema = Tema;
        normalized.grado = Grado;
        normalized.opcionA = OpcionA;
        normalized.opcionB = OpcionB;
        normalized.opcionC = OpcionC;
        normalized.opcionD = OpcionD;
        normalized.respuestaCorrecta = normalized.RespuestaCorrecta;

        return normalized;
    };


    // --- Native Client Security ---
    (function() {
        document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
        document.addEventListener('keydown', function(e) {
            var forbidden = [123, 73, 74, 85, 83]; // F12, I, J, U, S
            if (forbidden.indexOf(e.keyCode) !== -1 && (e.keyCode === 123 || e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                return false;
            }
        });
        console.log("[Security] Interceptors active.");
    })();

})(QuizProApp);
