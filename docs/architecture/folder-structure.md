# [F8-Task13] Documentación de Estructura Modular de Carpetas

> **Nota de Arquitectura:** Las estructuras que están en el anexo A (carpetas del repositorio) y en el anexo B (hojas y spreadsheets por rol) son ejemplos de una estructura recomendable, y no una estructura obligatoria.

## Organización Modular del Repositorio

El repositorio está organizado conforme a la siguiente jerarquía modular recomendada:

```
.
├── index.html                   # Punto de entrada principal en la raíz
├── app/
│   ├── html/                    # Plantillas HTML y dashboards dinámicos
│   │   └── dashboards/
│   │       └── dynamic-dashboard.html
│   ├── js/                      # Módulos y controladores de cliente
│   ├── css/                     # Hojas de estilo y diseños visuales
│   └── assets/                  # Recursos gráficos e imágenes estáticas
├── backend/                     # Microservicios de Google Apps Script
│   ├── user-service/
│   ├── academic-service/
│   ├── task-service/
│   ├── exam-service/
│   ├── accounting-service/
│   └── developer-service/
├── tests/                       # Suites de prueba y regresión automatizada
│   └── regression/
│       └── modular-dashboard-suite.js
└── docs/                        # Documentación arquitectónica e inventarios
    └── architecture/
        ├── repository-inventory.md
        ├── routing-and-paths.md
        ├── staged-migration-procedure.md
        └── folder-structure.md
```

## Reglas de Preservación e Integridad

1. `index.html` (o `index.htm`) permanece en la raíz del repositorio garantizando la resolución directa del punto de entrada.
2. Los componentes estáticos y dinámicos se organizan funcionalmente bajo la carpeta `app/`.
3. La configuración de despliegue mediante `clasp` reconoce y sincroniza las subcarpetas del proyecto sin exponer credenciales ni archivos sensibles.
