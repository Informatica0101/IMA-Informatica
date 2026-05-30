const presentationData = [
    {
        grade: "Décimo",
        sections: ["A", "B"],
        subjects: [
            {
                name: "Informática I",
                partial: "Primer Parcial",
                sections: "A, B",
                topics: [
                    { title: "Procesadores de Texto", file: "Informatica_I/prosesadores_texto.html" }
                ]
            }
        ]
    }
];

const checkSection = (sectionsField, targetSection) => {
    if (!sectionsField || !targetSection) return true;
    if (Array.isArray(sectionsField)) return sectionsField.includes(targetSection);
    return sectionsField.split(',').map(s => s.trim()).includes(targetSection);
};

function renderLevel(type, level, params = {}) {
    console.log("Level:", level, "Params:", params);
    const sourceData = presentationData;
    let items = [];
    let nextLevel = '';
    const role = 'Estudiante';

    switch(level) {
        case 'Grado':
            items = [...new Set(sourceData.map(d => d.grade))].filter(Boolean);
            nextLevel = 'Sección';
            break;
        case 'Sección':
            const gradeObj = sourceData.find(d => d.grade === params.grado);
            items = gradeObj ? gradeObj.sections : [];
            nextLevel = 'Parcial';
            break;
        case 'Parcial':
            const gradeObjP = sourceData.find(d => d.grade === params.grado);
            if (gradeObjP) {
                items = [...new Set(gradeObjP.subjects
                    .filter(s => checkSection(s.sections, params.seccion) && (!params.asignatura || s.name === params.asignatura))
                    .map(s => s.partial)
                )];
            }
            nextLevel = 'Asignatura';
            break;
        case 'Asignatura':
            const gradeObjA = sourceData.find(d => d.grade === params.grado);
            if (gradeObjA) {
                items = [...new Set(gradeObjA.subjects
                    .filter(s => checkSection(s.sections, params.seccion) && (!params.parcial || s.partial === params.parcial))
                    .map(s => s.name)
                )];
            }
            nextLevel = 'Temas';
            break;
        case 'Temas':
            const gradeObjT = sourceData.find(d => d.grade === params.grado);
            let finalItems = [];
            if (gradeObjT) {
                const subject = gradeObjT.subjects.find(s =>
                    s.name === params.asignatura &&
                    s.partial === params.parcial &&
                    checkSection(s.sections, params.seccion)
                );
                finalItems = subject ? subject.topics : [];
            }
            console.log("Final Items:", finalItems);
            return;
    }

    console.log("Items:", items);
    if (items.length > 0) {
        const item = items[0];
        const currentLevelKey = (level === 'Grado' ? 'grado' : (level === 'Sección' ? 'seccion' : (level === 'Asignatura' ? 'asignatura' : (level === 'Parcial' ? 'parcial' : level.toLowerCase()))));
        renderLevel(type, nextLevel, {...params, [currentLevelKey]: item});
    }
}

renderLevel('Presentaciones', 'Grado');
