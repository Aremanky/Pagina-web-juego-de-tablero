var tablero = document.getElementById('tablero');
var inicioBtn = document.getElementById('inicio');
var tamañoInput = document.getElementById('tamañoTablero');
var tamañoFichaSelect = document.getElementById('tamañoFicha');
var contadorMovimientos = 0;
var contadorElem = document.getElementById('contadorMovimientos');
var modal = document.getElementById('modal');
var textoModal = document.getElementById('textoModal');
var cerrarModal = document.getElementById('cerrarModal');
var btnInfo = document.getElementById("info");

function incrementarContadorMovimientos() {
    contadorMovimientos++;
    contadorElem.textContent = 'Movimientos: ' + contadorMovimientos;
}

cerrarModal.onclick = function () {
    modal.style.display = 'none';
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

function mostrarModal(mensaje) {
    textoModal.innerHTML = mensaje;
    modal.style.display = 'flex';
}

// Añade handlers Drag & Drop a una celda (ficha)
function addDragHandlers(celda) {
    // Cuando comienza el arrastre: guardamos el id (data-ficha) en dataTransfer
    celda.addEventListener('dragstart', function (e) {
        if (celda.classList.contains('inactiva')) return;
        // marca visual
        e.target.classList.add('elemento-en-arrastre');
        // ponemos el identificador para poder localizar el origen al soltar
        e.dataTransfer.setData('text/plain', e.target.getAttribute('data-ficha'));
        // some browsers require esto para permitir drop en otros elementos
        e.dataTransfer.effectAllowed = 'move';
    });

    // Cuando termina el arrastre (sea drop o cancel)
    celda.addEventListener('dragend', function (e) {
        e.target.classList.remove('elemento-en-arrastre');
    });

    // Cuando un elemento arrastrado se mueve sobre esta celda
    celda.addEventListener('dragover', function (e) {
        // necesario para permitir el drop (por defecto no está permitido)
        e.preventDefault();
        // indicación visual
        e.dataTransfer.dropEffect = 'move';
        return false;
    });

    // Entrada del arrastre en la celda
    celda.addEventListener('dragenter', function (e) {
        e.target.classList.add('elemento-en-sobrevuelo');
    });

    // Salida del arrastre de la celda
    celda.addEventListener('dragleave', function (e) {
        e.target.classList.remove('elemento-en-sobrevuelo');
    });

    // Cuando soltamos sobre la celda: hacemos el intercambio de datos (no de nodos)
    celda.addEventListener('drop', function (e) {
        e.preventDefault(); // evita comportamientos por defecto del navegador
        e.target.classList.remove('elemento-en-sobrevuelo');

        // recuperamos el id (data-ficha) del origen
        var origenId = e.dataTransfer.getData('text/plain');
        if (!origenId || origenId.trim() === '') { return; }

        // localizamos los elementos origen y destino
        var origenElem = tablero.querySelector("[data-ficha='" + origenId + "']");
        // e.target puede ser un hijo si hay estructura interna, nos aseguramos de usar el .ficha
        var destinoElem = e.target;
        if (!destinoElem.classList.contains('ficha')) {
            destinoElem = destinoElem.closest('.ficha');
        }
        if (!origenElem || !destinoElem || origenElem === destinoElem) { return; }

        // Intercambiamos data-color y style.background (solo datos visuales)
        var colorOrigen = origenElem.getAttribute('data-color');
        var colorDestino = destinoElem.getAttribute('data-color');

        // swap
        origenElem.setAttribute('data-color', colorDestino);
        origenElem.style.background = colorDestino;

        destinoElem.setAttribute('data-color', colorOrigen);
        destinoElem.style.background = colorOrigen;

        if (typeof incrementarContadorMovimientos === 'function') {
            incrementarContadorMovimientos();
        }

        // tras cada intercambio comprobamos si el tablero cumple la condición de victoria
        // Necesitamos conocer N: calculamos por número de columnas
        var computedStyle = window.getComputedStyle(tablero);
        var gridCols = computedStyle.getPropertyValue('grid-template-columns').split(' ').length;
        var N = gridCols || Math.round(Math.sqrt(tablero.children.length));
        if (comprobarVictoria(N)) {
            // acción al ganar: puedes cambiar por un modal / mensaje bonito en CSS
            tablero.classList.add('victoria');
            tablero.querySelectorAll('.ficha').forEach(c => {
                c.classList.add('inactiva');
                c.setAttribute('draggable', 'false');
            });
            mostrarModal('¡Enhorabuena! Has completado el tablero.');
        }
    });
}

// Comprueba si cada fila contiene fichas del mismo color
function comprobarVictoria(N) {
    // N es el número de columnas/filas
    var total = tablero.children.length;
    if (total === 0) { return false; }
    var filas = Math.round(total / N);

    for (var r = 0; r < filas; r++) {
        var indiceBase = r * N;
        var primera = tablero.children[indiceBase];
        if (!primera) { return false; }
        var colorRef = primera.getAttribute('data-color');

        for (var c = 1; c < N; c++) {
            var cel = tablero.children[indiceBase + c];
            if (!cel) { return false; }
            if (cel.getAttribute('data-color') !== colorRef) {
                return false; // esta fila no es homogénea
            }
        }
    }
    // si todas las filas son homogéneas devolvemos true
    return true;
}

// Cuando se pulsa "Inicio" se genera un nuevo tablero con N y el tamaño elegido
function inicio() {
    contadorMovimientos = 0;
    contadorElem.textContent = 'Movimientos: 0';
    var N = parseInt(tamañoInput.value || '2', 10);
    if (isNaN(N)) { N = 2; }
    // Clamp entre 1 y 7 (según enunciado)
    if (N < 1) { N = 1; }
    if (N > 7) { N = 7; }

    var tamañoFicha = tamañoFichaSelect.value; // 'pequeña'|'mediana'|'grande'
    generarTablero(N, tamañoFicha);

    tablero.querySelectorAll('.ficha').forEach(c => {
        c.classList.remove('inactiva');
        c.setAttribute('draggable', 'true');
    });
}

// función principal que crea la cuadrícula N x N y distribuye colores coherente-aleatorio
function generarTablero(N, tamañoFichaClase) {
    // 1) Generar N colores distintos (usamos HSL con comas por compatibilidad)
    var colores = [];
    for (var i = 0; i < N; i++) {
        var hue = Math.round((360 / N) * i);
        colores.push('hsl(' + hue + ', 70%, 55%)');
    }

    // 2) Crear un array con N copias de cada color -> total N*N (garantiza existencia de solución)
    var fichasArray = [];
    for (var c = 0; c < colores.length; c++) {
        for (var k = 0; k < N; k++) {
            fichasArray.push(colores[c]);
        }
    }

    // 3) Mezclar aleatoriamente (Fisher–Yates)
    shuffleArray(fichasArray);

    // 4) Preparar el contenedor tablero como grid NxN
    // limpiamos cualquier contenido previo
    tablero.innerHTML = '';
    // dejamos que CSS gestione la estética (.ficha, .pequena/.mediana/.grande),
    // pero definimos la rejilla para que sea exactamente N columnas
    tablero.style.display = 'grid';
    tablero.style.gridTemplateColumns = 'repeat(' + N + ', 1fr)';
    tablero.style.gridAutoRows = 'auto';
    tablero.style.gap = '8px';

    // 5) Crear N*N elementos "ficha" con atributos data-ficha y data-color
    for (var idx = 0; idx < fichasArray.length; idx++) {
        var color = fichasArray[idx];
        var celda = document.createElement('div');

        // clase base para el CSS
        celda.classList.add('ficha');

        // normalizamos la clase de tamaño (evitamos tildes en la clase)
        var claseT = (tamañoFichaClase === 'pequeña') ? 'pequena' :
            (tamañoFichaClase === 'mediana') ? 'mediana' : 'grande';
        celda.classList.add(claseT);

        // atributos data-* exigidos por el enunciado
        // data-ficha: identificador de la ficha (útil para dataTransfer)
        celda.setAttribute('data-ficha', String(idx));
        // data-color: color lógico de la ficha (guarda el color para comprobaciones)
        celda.setAttribute('data-color', color);

        celda.classList.add('ficha', claseT, 'inactiva');
        celda.setAttribute('draggable', 'false');

        addDragHandlers(celda);

        // estilo visual inmediato: fondo según el color
        celda.style.background = color;

        // añadimos al tablero
        tablero.appendChild(celda);
    }
}

// algoritmo Fisher–Yates para mezclar un array in-place
function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    return arr;
}

function info() {
    mostrarModal(`
<h2>Proyecto Tablero - Aseguramiento de Información</h2>
<p>Este proyecto consiste en un juego de fichas en un tablero NxN. El objetivo es organizar las fichas para que cada fila contenga fichas del mismo color.</p>

<h3>Objetivos</h3>
<ul>
  <li>Aprender composiciones con Flexbox y Grid.</li>
  <li>Practicar Drag & Drop con dataTransfer.</li>
  <li>Desarrollar interacción y feedback visual en la web.</li>
</ul>

<h3>Elementos de la interfaz</h3>
<ul>
  <li>Tablero dinámico NxN.</li>
  <li>Botón <strong>Inicio</strong> para generar un nuevo tablero.</li>
  <li>Selector de tamaño de fichas y tamaño de tablero.</li>
  <li>Contador de movimientos.</li>
</ul>

<h3>Funcionamiento</h3>
<p>Las fichas son arrastrables solo después de pulsar "Inicio". Cada intercambio se refleja visualmente y se actualiza el contador de movimientos. Al completar el tablero, se bloquean las fichas y se muestra un mensaje de victoria.</p>

<h3>Opciones adicionales</h3>
<ul>
  <li>Cambiar forma de las fichas (círculos, cuadrados, triángulos).</li>
  <li>Temporizador para medir el tiempo de resolución.</li>
  <li>Modal con instrucciones o información del juego.</li>
</ul>
`);
}

function main() {
    inicioBtn.addEventListener('click', inicio);
    btnInfo.addEventListener("click", info)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') modal.style.display = 'none';
    });

    // Generar un tablero inicial según el valor actual del input (UX)
    var inicialN = parseInt(tamañoInput.value || '2', 10);
    if (isNaN(inicialN) || inicialN < 1) { inicialN = 2; }
    if (inicialN > 7) { inicialN = 7; }
    generarTablero(inicialN, tamañoFichaSelect.value);
}

document.addEventListener('DOMContentLoaded', main);