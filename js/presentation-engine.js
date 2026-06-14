/**
 * IMA Presentation Engine v2.4
 * Centralized logic for navigation, security, and dynamic evaluation.
 * Optimized for ES5 legacy compatibility, Zoom resistance, and PWA/Mobile support.
 */

(function(window) {
    var PresentationEngine = {
        currentSlide: 0,
        slides: [],
        quizQuestions: [],
        currentQuizIndex: 0,
        quizStarted: false,

        init: function() {
            this.slides = document.querySelectorAll('.slide');
            this.setupNavigation();
            this.setupFullscreen();
            this.setupSecurity();
            this.showSlide(0);

            if (window.presentationMetadata) {
                this.loadQuizFromBank();
            }

            console.log("[PresentationEngine] Initialized with " + this.slides.length + " slides.");
        },

        setupNavigation: function() {
            var self = this;
            var nextBtn = document.getElementById('next-btn');
            var prevBtn = document.getElementById('prev-btn');
            var container = document.getElementById('presentation-container');

            if (nextBtn) {
                nextBtn.onclick = function(e) {
                    if (e.stopPropagation) e.stopPropagation();
                    self.nextSlide();
                };
            }
            if (prevBtn) {
                prevBtn.onclick = function(e) {
                    if (e.stopPropagation) e.stopPropagation();
                    self.prevSlide();
                };
            }

            document.addEventListener('keydown', function(e) {
                if (e.keyCode === 39) self.nextSlide(); // Arrow Right
                if (e.keyCode === 37) self.prevSlide(); // Arrow Left
                if (e.keyCode === 32) { // Space
                    if (e.preventDefault) e.preventDefault();
                    self.nextSlide();
                }
            });

            var lastClickTime = 0;
            if (container) {
                container.addEventListener('click', function(e) {
                    // Ignore clicks on interactive elements
                    if (e.target.closest('.quiz-option, a, .concept-box, button')) return;

                    var now = new Date().getTime();
                    if (now - lastClickTime < 300) return; // Debounce
                    lastClickTime = now;

                    var width = container.clientWidth;
                    var clickX = e.clientX;

                    if (window.innerWidth <= 768) {
                        // Mobile: 30% Left = Prev, 70% Right = Next
                        if (clickX < (width * 0.30)) self.prevSlide();
                        else self.nextSlide();
                    } else {
                        self.nextSlide();
                    }
                });

                var touchStartX = 0;
                container.addEventListener('touchstart', function(e) {
                    touchStartX = e.changedTouches[0].screenX;
                }, { passive: true });

                container.addEventListener('touchend', function(e) {
                    var diffX = touchStartX - e.changedTouches[0].screenX;
                    if (Math.abs(diffX) > 50) {
                        if (diffX > 0) self.nextSlide();
                        else self.prevSlide();
                    }
                }, { passive: true });
            }
        },

        setupFullscreen: function() {
            var self = this;
            var container = document.getElementById('presentation-container');
            if (!container) return;

            container.addEventListener('dblclick', function(e) {
                // Mechanism: Only trigger on Portada (Slide 1)
                if (self.currentSlide !== 0) return;
                if (e.target.closest('.quiz-option, a, button')) return;

                if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                    var el = document.documentElement;
                    var rfs = el.requestFullscreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
                    if (rfs) rfs.call(el);
                } else {
                    var efs = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
                    if (efs) efs.call(document);
                }
            });

            var events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
            for (var i = 0; i < events.length; i++) {
                document.addEventListener(events[i], function() { self.handleUIState(); });
            }

            window.addEventListener('resize', function() {
                // Zoom Resistance: check every resize
                self.handleUIState();
            });
        },

        setupSecurity: function() {
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
            document.body.style.msUserSelect = 'none';
            document.body.style.mozUserSelect = 'none';
        },

        handleUIState: function() {
            var header = document.getElementById('main-header');
            var footer = document.getElementById('main-footer');
            var mobileNav = document.querySelector('.mobile-bottom-nav');
            var controls = document.getElementById('controls-wrapper');
            var presentationContainer = document.getElementById('presentation-container');

            // Zoom resistance rule: window.innerHeight >= (screen.height - 15)
            // This detects if the window is maximized or at high zoom level occupying most of screen
            var isWindowFull = (window.innerHeight >= (window.screen.height - 15));
            var isNativeFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
            var shouldHide = isWindowFull || isNativeFull;

            if (header) {
                if (shouldHide) header.classList.add('hide-element');
                else header.classList.remove('hide-element');
            }
            if (footer) {
                if (shouldHide) footer.classList.add('hide-element');
                else footer.classList.remove('hide-element');
            }
            if (mobileNav) {
                if (shouldHide) mobileNav.classList.add('hide-element');
                else mobileNav.classList.remove('hide-element');
            }
            if (controls) {
                if (shouldHide) controls.classList.add('hide-element');
                else controls.classList.remove('hide-element');
            }

            // Adjustment for main margin when header is hidden
            var main = document.querySelector('main');
            if (main) {
                if (shouldHide) {
                    main.style.marginTop = '0';
                    main.style.height = '100vh';
                    if (presentationContainer) presentationContainer.style.height = '100vh';
                } else {
                    main.style.marginTop = '';
                    main.style.height = '';
                    if (presentationContainer) presentationContainer.style.height = '';
                }
            }
        },

        showSlide: function(n) {
            if (this.slides.length === 0) return;
            this.slides[this.currentSlide].classList.remove('active');

            this.currentSlide = n;
            if (this.currentSlide < 0) this.currentSlide = 0;
            if (this.currentSlide >= this.slides.length) this.currentSlide = this.slides.length - 1;

            var activeSlide = this.slides[this.currentSlide];
            activeSlide.classList.add('active');

            var counter = document.getElementById('slide-counter');
            if (counter) counter.innerHTML = (this.currentSlide + 1) + ' / ' + this.slides.length;

            var prevBtn = document.getElementById('prev-btn');
            var nextBtn = document.getElementById('next-btn');
            if (prevBtn) prevBtn.disabled = (this.currentSlide === 0);
            if (nextBtn) nextBtn.disabled = (this.currentSlide === this.slides.length - 1);

            // 16-Slide Structure Rule: Evaluation typically on index 14
            if (this.currentSlide === 14 && !this.quizStarted) {
                this.renderCurrentQuizQuestion();
            }
        },

        nextSlide: function() {
            if (this.currentSlide < this.slides.length - 1) this.showSlide(this.currentSlide + 1);
        },

        prevSlide: function() {
            if (this.currentSlide > 0) this.showSlide(this.currentSlide - 1);
        },

        loadQuizFromBank: function() {
            var self = this;
            var meta = window.presentationMetadata;
            if (!meta) return;

            var levels = ['basico', 'intermedio', 'avanzado'];
            var allLoaded = [];

            function fetchLevel(idx) {
                if (idx >= levels.length) {
                    self.quizQuestions = self.filterAndShuffle(allLoaded, 10);
                    return;
                }
                // Dynamic path prefixing based on nesting level
                var pathPrefix = window.location.pathname.split('/').length > 2 ? '../../' : '../';
                if (window.location.pathname.indexOf('/juegos/') !== -1) pathPrefix = '../'; // Special case for games folder

                var path = pathPrefix + 'js/Banco_Preguntas/' + meta.grado + '/' + meta.asignatura + '/' + levels[idx] + '.json';

                var xhr = new XMLHttpRequest();
                xhr.open('GET', path, true);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            try {
                                var data = JSON.parse(xhr.responseText);
                                var filtered = data.filter(function(q) {
                                    var qTema = (q.tema || q.Tema || "").toLowerCase().replace(/\s+/g, '_');
                                    var targetTema = meta.tema.toLowerCase().replace(/\s+/g, '_');
                                    return qTema === targetTema;
                                });
                                allLoaded = allLoaded.concat(filtered);
                            } catch (e) {}
                        }
                        fetchLevel(idx + 1);
                    }
                };
                xhr.send();
            }

            fetchLevel(0);
        },

        filterAndShuffle: function(array, limit) {
            var shuffled = array.slice();
            for (var i = shuffled.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = shuffled[i];
                shuffled[i] = shuffled[j];
                shuffled[j] = temp;
            }
            return shuffled.slice(0, limit);
        },

        renderCurrentQuizQuestion: function() {
            var self = this;
            var qText = document.getElementById('quiz-question-text');
            var qGrid = document.getElementById('quiz-options-grid');
            var qFeedback = document.getElementById('quiz-feedback');

            if (!qText || this.quizQuestions.length === 0) {
                if (qText) qText.innerHTML = "Cargando evaluación...";
                return;
            }

            this.quizStarted = true;
            if (this.currentQuizIndex >= this.quizQuestions.length) {
                qText.innerHTML = "¡Evaluación Completada!";
                qGrid.innerHTML = "";
                qFeedback.innerHTML = "Has finalizado el quiz con éxito.";
                qFeedback.className = "mt-6 p-4 rounded-xl bg-green-50 text-green-700 font-bold block";
                qFeedback.style.display = "block";
                return;
            }

            var rawQ = this.quizQuestions[this.currentQuizIndex];
            var q = window.normalizeQuestion ? window.normalizeQuestion(rawQ) : rawQ;

            qText.innerHTML = (this.currentQuizIndex + 1) + ". " + (window.sanitizarHTMLTecnico ? window.sanitizarHTMLTecnico(q.enunciado || q.Pregunta) : (q.enunciado || q.Pregunta));
            qGrid.innerHTML = "";
            if (qFeedback) qFeedback.style.display = "none";

            var options = [q.opcionA, q.opcionB, q.opcionC, q.opcionD].filter(function(o) { return !!o; });
            if (q.tipo_pregunta === 'verdadero_falso' || q.TipoActividad === 'verdadero_falso') {
                options = ["Verdadero", "Falso"];
            }

            for (var i = 0; i < options.length; i++) {
                (function(opt) {
                    var btn = document.createElement('button');
                    btn.className = "quiz-option";
                    btn.innerHTML = window.sanitizarHTMLTecnico ? window.sanitizarHTMLTecnico(opt) : opt;
                    btn.onclick = function(e) {
                        if (e.stopPropagation) e.stopPropagation();
                        self.handleAnswer(opt, q.respuesta_correcta_literal || q.RespuestaCorrecta, btn);
                    };
                    qGrid.appendChild(btn);
                })(options[i]);
            }
        },

        handleAnswer: function(selected, correct, btn) {
            var self = this;
            var qFeedback = document.getElementById('quiz-feedback');
            var buttons = document.querySelectorAll('.quiz-option');

            for (var i = 0; i < buttons.length; i++) {
                buttons[i].disabled = true;
            }

            var isCorrect = (selected === correct);
            btn.classList.add(isCorrect ? 'correct' : 'incorrect');

            if (!isCorrect) {
                for (var j = 0; j < buttons.length; j++) {
                    if (buttons[j].innerHTML === correct || buttons[j].textContent === correct) {
                        buttons[j].classList.add('correct');
                    }
                }
            }

            if (qFeedback) {
                qFeedback.innerHTML = isCorrect ? "¡Excelente! Respuesta correcta." : "Incorrecto. La respuesta es: " + correct;
                qFeedback.className = "mt-6 p-4 rounded-xl font-bold text-center block " + (isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700");
                qFeedback.style.display = "block";
            }

            setTimeout(function() {
                self.currentQuizIndex++;
                self.renderCurrentQuizQuestion();
            }, 2000);
        }
    };

    window.PresentationEngine = PresentationEngine;
    document.addEventListener('DOMContentLoaded', function() { PresentationEngine.init(); });
})(window);
