/**
 * Data constants for index.html
 */

window.presentationData = [
    /* {
        grade: "Décimo",
        subjects: [
            {
                name: "Informática I",
                topics: [
                    { title: "Procesadores de Texto", file: "Informatica_I/prosesadores_texto.html" },
                    { title: "Formato de texto y tablas", file: "Informatica_I/texto_tablas.html" },
                    { title: "Insertar/Formato de página", file: "Informatica_I/insertar_formato.html" },
                    { title: "Hojas de Cálculo", file: "Informatica_I/hojas_calculo.html" }
                ]
            }
        ]
    }, */
    {
        grade: "Undécimo",
        subjects: [
            {
                name: "Programación",
                topics: [
                    { title: "Introducción a la Programación", file: "II_BTP_A/Programacion/introduccion_programacion.html" }
                    
                ]
            }
            /* {
                name: "Informática Aplicada I",
                topics: [
                    { title: "Sistemas de Numeración", file: "II_BTP_A/Informatica_Aplicada_I/sistemas_numeracion.html" },
                    { title: "Numeración Hexadecimal", file: "II_BTP_A/Informatica_Aplicada_I/hexadecimales.html" },
                    { title: "Manejo de Archivos", file: "II_BTP_A/Informatica_Aplicada_I/manejo_archivos.html" }
                ]
            },
            {
                name: "Ofimática I",
                topics: [
                    { title: "Referencias Relativas y Absolutas", file: "II_BTP_A/Ofimatica_I/referencias_relayabso.html" },
                    { title: "Formato Condicional", file: "II_BTP_A/Ofimatica_I/formato_condicional.html" },
                    { title: "Formato de tabla dinamica", file: "II_BTP_A/Ofimatica_I/tablas_dinamicas.html" },
                    { title: "Validación y Filtrado de Datos", file: "II_BTP_A/Ofimatica_I/validacion-datos.html" },
                    { title: "Fundamentos de VBA", file: "II_BTP_A/Ofimatica_I/fundamentos_VBA.html" }
                ]
            },
            {
                name: "Análisis y Diseño de Sistemas",
                topics: []
            } */
        ]
    },
    {
        grade: "Duodécimo",
        subjects: [
            {
                name: "Diseño Web",
                topics: [
                    { title: "Introducción al Diseño Web", file: "III_BTP_A/introduccion_diseno_web.html" }
                ]
            }
            /* {
                name: "Diseño Web II",
                topics: [
                    { title: "Grid vs Flexbox", file: "III_BTP_A/dw_II/tablas_columnas.html" },
                    { title: "Eventos de JavaScript", file: "III_BTP_A/dw_II/eventos_javascript.html" }
                ]
            } */
        ]
    }
];

window.additionalResourcesData = [
    {
        category: "Artículos",
        items: [
            { title: "Destreza en el teclado", file: "II_BTP_A/Ofimatica_I/articulo-destreza.html" },
            // { title: "Línea de tiempo de la computación", file: "Informatica_I/articulo_lineadetiempo.html" },
            { title: "Evolución de Suites Informáticas", file: "II_BTP_A/Ofimatica_I/articulo-evolucion-suite.html" }
        ]
    },
    {
        category: "Actividades Practicas",
        items: [
            { title: "Periféricos Entrada/Salida", action: "load-peripherals-game" },
            { title: "WebMaster Quiz", action: "load-webmaster-quiz" },
            { title: "Destreza en el Teclado", action: "load-dexterity-game" },
            { title: "Atajos", file: "interactivo.html" }
        ]
    }
];

window.downloadContentData = [
    /* {
        grade: "Décimo",
        subjects: [
            {
                name: "Informática I",
                topics: [
                    { title: "Procesadores de Texto", file: "Informatica_I/procesadores_palabras.pdf" },
                    { title: "Formato de texto y tablas", file: "Informatica_I/texto_tablas.pdf" },
                    { title: "Insertar/Formato de página", file: "Informatica_I/formato_insercion.pdf" },
                    { title: "Hojas de Calculo", file: "Informatica_I/hojas_calculo.pdf" },
                    { title: "Guia de Estudio", file: "guia_estudios/GE_infoA.pdf"}
                ]
            }
        ]
    }, */
    {
        grade: "Undécimo",
        subjects: [
            {
                name: "Programación",
                topics: [
                    { title: "Introduccion a programacion", file: "II_BTP_A/Programacion/Programación_2026.pdf" }
                ]
            }
            /* {
                name: "Informática Aplicada I",
                topics: [
                    { title: "Sistemas de Numeración", file: "II_BTP_A/Informatica_Aplicada_I/sistemas_numeracion.pdf" },
                    { title: "Numeración Hexadecimal", file: "II_BTP_A/Informatica_Aplicada_I/hexadecimales.pdf" },
                    { title: "Manejo de Archivos", file: "II_BTP_A/Informatica_Aplicada_I/manejo_archivos.pdf" },
                    { title: "Guia de Estudio", file: "guia_estudios/GE_Info_Apli.pdf" }
                ]
            },
            {
                name: "Ofimática I",
                topics: [
                    { title: "Referencias Relativas y Absolutas", file: "II_BTP_A/Ofimatica_I/referencias_relayabso.pdf" },
                    { title: "Formato Condicional", file: "II_BTP_A/Ofimatica_I/formato_condicional.pdf" },
                    { title: "Formato de Tabla Dinámica", file: "II_BTP_A/Ofimatica_I/formato_tablas.pdf" },
                    { title: "Validación y Filtrado de Datos", file: "II_BTP_A/Ofimatica_I/validacion_filtrado.pdf" },
                    { title: "Fundamentos de VBA", file: "II_BTP_A/Ofimatica_I/fundamentos_VBA.pdf" },
                    { title: "Guia de Estudio", file: "guia_estudios/GE_OFIMATICA.pdf" }
                ]
            },
            {
                name: "Análisis y Diseño de Sistemas",
                topics: [
                    { title: "Metodologías Ágiles", file: "II_BTP_A/analisis_diseno/metodologias_agiles.pdf" },
                    { title: "Documentación en el D.S.", file: "II_BTP_A/analisis_diseno/documentacion.pdf" },
                    { title: "Creación de Bases de Datos", file: "II_BTP_A/analisis_diseno/Base_de_datos.pdf" },
                    { title: "Guia de Estudio", file: "guia_estudios/GE_AYD.pdf" }
                ]
            } */
        ]
    },
    {
        grade: "Duodécimo",
        subjects: [
            {
                name: "Diseño Web",
                topics: [
                    { title: "Introduccion a Html", file: "III_BTP_A/introducción a HTML.pdf" }
                ]
            }
            /* {
                name: "Diseño Web II",
                topics: [
                    { title: "Grid vs Flexbox", file: "III_BTP_A/dw_II/tablas_columnas.pdf" },
                    { title: "Eventos de JavaScript", file: "III_BTP_A/dw_II/eventosJS.pdf" },
                    { title: "Guía de Estudios IV Parcial", file: "guia_estudios/GDESR-DW-IIIBTP_4parcial.pdf" }
                ]
            } */
        ]
    }
];
