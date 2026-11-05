/*** SISTEMA SONIC UI - WEB AUDIO API
 * Genera micro-tonos sintéticos en tiempo real para dar respuesta auditiva
 * sin cargar archivos externos de audio.
 */

// Instanciamos el contexto de audio nativo del navegador
const AudioContext = window.AudioContext || window.webkitAudioContext;
let contextoAudio = null;

/**
 * Inicializa o reanuda el contexto de audio tras la primera interacción
 * (Política de Autoplay de los navegadores web)
 */
function obtenerContextoAudio() {
    if (!contextoAudio) {
        contextoAudio = new AudioContext();
    }
    if (contextoAudio.state === 'suspended') {
        contextoAudio.resume();
    }
    return contextoAudio;
}

/**
 * Reproduce un sonido mecánico corto tipo "clic" para botones y enlaces
 */
function reproducirSonidoClic() {
    // Si el usuario prefiere movimiento/estímulos reducidos, respetamos su entorno
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    try {
        const ctx = obtenerContextoAudio();
        const oscilador = ctx.createOscillator();
        const ganancia = ctx.createGain();

        // Configuración de onda y frecuencia para un 'clic' seco y limpio
        oscilador.type = 'triangle';
        oscilador.frequency.setValueAtTime(1200, ctx.currentTime);
        oscilador.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

        // Volumen y decaimiento ultrarrápido (40 milisegundos)
        ganancia.gain.setValueAtTime(0.15, ctx.currentTime);
        ganancia.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

        // Conexión de nodos y ejecución
        oscilador.connect(ganancia);
        ganancia.connect(ctx.destination);

        oscilador.start(ctx.currentTime);
        oscilador.stop(ctx.currentTime + 0.04);
    } catch (e) { // Manejo silencioso en navegadores restringidos
       
    }//catch 
}

/**
 * Reproduce un tono de confirmación más suave al alternar pestañas o filtros
 */
function reproducirSonidoFiltro() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    try {
        const ctx = obtenerContextoAudio();
        const oscilador = ctx.createOscillator();
        const ganancia = ctx.createGain();

        oscilador.type = 'sine';
        oscilador.frequency.setValueAtTime(600, ctx.currentTime);
        oscilador.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.06);

        ganancia.gain.setValueAtTime(0.1, ctx.currentTime);
        ganancia.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

        oscilador.connect(ganancia);
        ganancia.connect(ctx.destination);

        oscilador.start(ctx.currentTime);
        oscilador.stop(ctx.currentTime + 0.06);
    } catch (e) { // Manejo silencioso
        
    }//catch  

}//reproducirSonidoFiltro

/**
 * Reproduce un arpegio de confirmación positivo cuando el formulario se envía con éxito
 */
function reproducirSonidoExito() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    try {
        const ctx = obtenerContextoAudio();
        const oscilador = ctx.createOscillator();
        const ganancia = ctx.createGain();

        oscilador.type = 'sine';
        oscilador.frequency.setValueAtTime(523.25, ctx.currentTime); // Nota C5 (Do)
        oscilador.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // Nota E5 (Mi)

        ganancia.gain.setValueAtTime(0.12, ctx.currentTime);
        ganancia.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

        oscilador.connect(ganancia);
        ganancia.connect(ctx.destination);

        oscilador.start(ctx.currentTime);
        oscilador.stop(ctx.currentTime + 0.2);
    } catch (e) {
        // Manejo silencioso
    }
}

// SISTEMA DE FILTRADO INTERACTIVO DE PROYECTOS

function inicializarFiltrosProyectos() {
    const botonesFiltro = document.querySelectorAll('.boton-filtro');
    const tarjetasProyecto = document.querySelectorAll('.tarjeta-proyecto');

    if (!botonesFiltro.length || !tarjetasProyecto.length) return;

    botonesFiltro.forEach(boton => {
        boton.addEventListener('click', () => {
            const categoriaFiltro = boton.getAttribute('data-filtro');

            // 1. Reproducir retroalimentación auditiva
            reproducirSonidoFiltro();

            // 2. Actualizar estados ARIA y clases activas
            botonesFiltro.forEach(btn => {
                btn.classList.remove('activo');
                btn.setAttribute('aria-selected', 'false');
            });//boton

            boton.classList.add('activo');
            boton.setAttribute('aria-selected', 'true');

            // 3. Filtrar proyectos visibles
            tarjetasProyecto.forEach(tarjeta => {
                const categoriasTarjeta = tarjeta.getAttribute('data-categoria') || '';

                if (categoriaFiltro === 'todos' || categoriasTarjeta.includes(categoriaFiltro)) {
                    tarjeta.style.display = 'flex';
                } else {
                    tarjeta.style.display = 'none';
                }//else
            });//tarjetasProyecto.forEach

        });//boton.addEventListener

    });//botonesFiltro.forEach

}//inicializarFiltrosProyectos

// INDICADOR DE PROGRESO DE LECTURA Y SCROLL NAVEGACIÓN

function inicializarNavegacionScroll() {
    const enlacesNav = document.querySelectorAll('.enlace-nav');
    const secciones = document.querySelectorAll('section[id]');

    if (!enlacesNav.length || !secciones.length) return;

    const opcionesObserver = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const idSeccion = entry.target.getAttribute('id');
                enlacesNav.forEach(enlace => {
                    if (enlace.getAttribute('href') === `#${idSeccion}`) {
                        enlace.classList.add('activo');
                    } else {
                        enlace.classList.remove('activo');
                    }
                });
            }
        });
    }, opcionesObserver);

    secciones.forEach(seccion => observer.observe(seccion));
}

// FORMULARIO DE CONTACTO ACCESIBLE Y ENVÍO DINÁMICO MAILTO

function inicializarFormularioContacto() {
    const formulario = document.getElementById('formulario-contacto');
    const notificacion = document.getElementById('notificacion-formulario');

    if (!formulario) return;

    const campos = {
        nombre: document.getElementById('campo-nombre'),
        email: document.getElementById('campo-email'),
        mensaje: document.getElementById('campo-mensaje')
    };

    function validarCampo(nombreCampo) {
        const campo = campos[nombreCampo];
        const errorSpan = document.getElementById(`error-${nombreCampo}`);
        let esValido = true;
        let mensajeError = '';

        if (campo.validity.valueMissing) {
            mensajeError = 'Este campo es obligatorio.';
            esValido = false;
        } else if (nombreCampo === 'email' && campo.validity.typeMismatch) {
            mensajeError = 'Ingresa un correo electrónico válido (ej. usuario@dominio.com).';
            esValido = false;
        }

        if (!esValido) {
            campo.setAttribute('aria-invalid', 'true');
            if (errorSpan) errorSpan.textContent = mensajeError;
        } else {
            campo.setAttribute('aria-invalid', 'false');
            if (errorSpan) errorSpan.textContent = '';
        }

        return esValido;
    }

    // Escuchamos eventos de desenfoque e ingreso de texto en tiempo real
    Object.keys(campos).forEach(key => {
        const campo = campos[key];
        if (campo) {
            campo.addEventListener('blur', () => validarCampo(key));
            campo.addEventListener('input', () => {
                if (campo.getAttribute('aria-invalid') === 'true') {
                    validarCampo(key);
                }
            });
        }
    });

    // Envío del formulario con construcción dinámica mailto:
    formulario.addEventListener('submit', (e) => {
        e.preventDefault(); // Detenemos la recarga de página predeterminada

        let formularioValido = true;
        Object.keys(campos).forEach(key => {
            if (!validarCampo(key)) {
                formularioValido = false;
            }
        });

        if (formularioValido) {
            // Retroalimentación de Sonic UI
            reproducirSonidoExito();

            const nombre = campos.nombre.value.trim();
            const email = campos.email.value.trim();
            const mensaje = campos.mensaje.value.trim();

            const asunto = encodeURIComponent(`Nuevo mensaje de contacto de: ${nombre}`);
            const cuerpo = encodeURIComponent(`Nombre: ${nombre}\nCorreo: ${email}\n\nMensaje:\n${mensaje}`);

            // Desencadenamos la apertura del cliente de correo nativo
            window.location.href = `mailto:mrg.dev.mx@gmail.com?subject=${asunto}&body=${cuerpo}`;

            if (notificacion) {
                notificacion.className = 'notificacion-contacto exito';
                notificacion.textContent = 'Abriendo tu aplicación de correo predeterminada con los datos del mensaje...';
            }

            formulario.reset();
            Object.keys(campos).forEach(key => campos[key].removeAttribute('aria-invalid'));
        } else {
            if (notificacion) {
                notificacion.className = 'notificacion-contacto error';
                notificacion.textContent = 'Por favor, corrige los errores señalados en el formulario.';
            }
        }
    });
}

// VINCULACIÓN DE EVENTOS DE AUDIO A ELEMENTOS INTERACTIVOS

function vincularEfectosSonoros() {
    // Escuchamos clics en todos los botones y enlaces del portafolio
    const elementosInteractivos = document.querySelectorAll('.boton, .enlace-red-social, .enlace-volver-arriba, .lista-redes-pie a, .enlace-nav');

    elementosInteractivos.forEach(elemento => {
        elemento.addEventListener('click', () => {
            reproducirSonidoClic();
        });//elemento.addEventListener

    });//elementosInteractivos.forEach

}//vincularEfectosSonoros

// Inicialización cuando el DOM esté completamente cargado

document.addEventListener('DOMContentLoaded', () => {
    inicializarFiltrosProyectos();
    vincularEfectosSonoros();
    inicializarNavegacionScroll();
    inicializarFormularioContacto();
});// document.addEventListener(DOMContentLoaded)