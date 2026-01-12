// js/main.js

/**
 * Contiene la lógica global para el menú de navegación móvil.
 * Centraliza las funciones `toggleMobileMenu` y `closeMobileMenu`.
 * Realiza comprobaciones para evitar errores en páginas que no tienen el menú.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del Menú Móvil ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenuCloseButton = document.getElementById('mobile-menu-close-button');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');

    const mobileCoursesToggle = document.getElementById('mobile-courses-toggle');
    const mobileCoursesArrow = document.getElementById('mobile-courses-arrow');
    const mobileGradesContainer = document.getElementById('mobile-grades-container');

    const mobileAdditionalResourcesToggle = document.getElementById('mobile-additional-resources-toggle');
    const mobileAdditionalResourcesArrow = document.getElementById('mobile-additional-resources-arrow');
    const mobileAdditionalResourcesContainer = document.getElementById('mobile-additional-resources-container');

    // Variables de estado para el menú móvil
    let activeMobileGradeElement = null;
    let activeMobileSubjectElement = null;

    // --- Funciones del Menú Móvil ---

    /**
     * Cierra el menú móvil y resetea todos sus submenús y estados.
     * Se asigna al objeto `window` para ser accesible desde atributos `onclick` en el HTML.
     */
    window.closeMobileMenu = function() {
        if (!mobileMenuOverlay) return;

        mobileMenuOverlay.classList.add('hidden');
        if (mobileMenuIcon) {
            mobileMenuIcon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
        }

        // Resetear todos los submenús y flechas
        if (mobileGradesContainer) {
            mobileGradesContainer.classList.remove('visible-height');
            mobileGradesContainer.classList.add('hidden-height');
        }
        if (mobileCoursesArrow) {
            mobileCoursesArrow.classList.remove('rotate-90');
        }
        if (mobileAdditionalResourcesContainer) {
            mobileAdditionalResourcesContainer.classList.remove('visible-height');
            mobileAdditionalResourcesContainer.classList.add('hidden-height');
        }
        if (mobileAdditionalResourcesArrow) {
            mobileAdditionalResourcesArrow.classList.remove('rotate-90');
        }
        if (activeMobileGradeElement) {
            activeMobileGradeElement.classList.remove('visible-height');
            activeMobileGradeElement.classList.add('hidden-height');
            const arrow = activeMobileGradeElement.previousElementSibling.querySelector('span');
            if (arrow) arrow.classList.remove('rotate-90');
            activeMobileGradeElement = null;
        }
        if (activeMobileSubjectElement) {
            activeMobileSubjectElement.classList.remove('visible-height');
            activeMobileSubjectElement.classList.add('hidden-height');
            const arrow = activeMobileSubjectElement.previousElementSibling.querySelector('span');
            if (arrow) arrow.classList.remove('rotate-90');
            activeMobileSubjectElement = null;
        }
    }

    /**
     * Alterna la visibilidad del menú móvil.
     */
    function toggleMobileMenu() {
        if (!mobileMenuOverlay) return;

        const isHidden = mobileMenuOverlay.classList.contains('hidden');
        if (isHidden) {
            mobileMenuOverlay.classList.remove('hidden');
            if (mobileMenuIcon) {
                mobileMenuIcon.setAttribute('d', 'M6 18L18 6M6 6l12 12');
            }
        } else {
            window.closeMobileMenu(); // Usa la función global para asegurar un reseteo completo
        }
    }

    // --- Asignación de Eventos ---
    // Se asignan los listeners solo si los elementos correspondientes existen en la página.
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', toggleMobileMenu);
    }
    if (mobileMenuCloseButton) {
        mobileMenuCloseButton.addEventListener('click', toggleMobileMenu);
    }
    if (mobileCoursesToggle) {
        mobileCoursesToggle.addEventListener('click', () => {
            if (mobileGradesContainer) {
                mobileGradesContainer.classList.toggle('hidden-height');
                mobileGradesContainer.classList.toggle('visible-height');
            }
            if (mobileCoursesArrow) mobileCoursesArrow.classList.toggle('rotate-90');
        });
    }
    if (mobileAdditionalResourcesToggle) {
        mobileAdditionalResourcesToggle.addEventListener('click', () => {
            if (mobileAdditionalResourcesContainer) {
                mobileAdditionalResourcesContainer.classList.toggle('hidden-height');
                mobileAdditionalResourcesContainer.classList.toggle('visible-height');
            }
            if (mobileAdditionalResourcesArrow) mobileAdditionalResourcesArrow.classList.toggle('rotate-90');
        });
    }
});
