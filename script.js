var tablero = document.getElementById('tablero');
var inicioBtn = document.getElementById('inicio');
var tamañoInput = document.getElementById('tamañoTablero');
var tamañoFichaSelect = document.getElementById('tamañoFicha');
var formaFichaSelect = document.getElementById('formaFicha');
var contadorMovimientos = 0;
var contadorElem = document.getElementById('contadorMovimientos');
var temporizadorElem = document.getElementById('temporizador');
var modal = document.getElementById('modal');
var textoModal = document.getElementById('textoModal');
var cerrarModal = document.getElementById('cerrarModal');
var btnInfo = document.getElementById("info");

var intervaloTemporizador;
var segundos = 0;

//funciones auxiliares para el modal
cerrarModal.onclick = function () {
    modal.classList.remove('visible');
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.classList.remove('visible');
    }
}


//función auxiliar de botón de info, muestra modal con información del proyecto
function info() {
    mostrarModal(`
<h2>Proyecto Tablero</h2>
<p>Este proyecto consiste en un juego de fichas en un tablero NxN. El objetivo es organizar las fichas para que cada fila contenga fichas del mismo color.</p>

<h3>Controles</h3>
<ul>
  <li><strong>Inicio:</strong> Genera un nuevo tablero con la configuración seleccionada.</li>
  <li><strong>Tamaño de la ficha:</strong> Cambia las dimensiones de las fichas.</li>
  <li><strong>Tamaño del tablero:</strong> Define el número de filas y columnas (NxN).</li>
  <li><strong>Forma de la ficha:</strong> Permite elegir entre fichas cuadradas o circulares.</li>
</ul>

<h3>Funcionamiento</h3>
<p>Las fichas son arrastrables solo después de pulsar "Inicio". Cada intercambio se refleja visualmente y se actualiza el contador de movimientos. Al completar el tablero, se bloquean las fichas y se muestra un mensaje de victoria.</p>
`);
}

//función auxiliar para mostrar modal con mensaje
function mostrarModal(mensaje) {
    textoModal.innerHTML = mensaje;
    modal.classList.add('visible');
}


//función principal que inicializa eventos y tablero inicial
function main() {
    inicioBtn.addEventListener('click', inicio);
    btnInfo.addEventListener("click", info)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') modal.classList.remove('visible');
    });

    generarTablero(
        parseInt(tamañoInput.value, 10),
        tamañoFichaSelect.value,
        formaFichaSelect.value
    );
}

//función de botón de inicio, se genera nuevo tablero
function inicio() {
    contadorMovimientos = 0;
    contadorElem.textContent = 'Movimientos: 0';
    
    detenerTemporizador();
    iniciarTemporizador();

    //en caso de no asignar valor, tomará 4 por defecto
    var N = parseInt(tamañoInput.value || '4', 10);
    if (N < 2) {
        N = 2;
    }
    if (N > 7) {
        N = 7;
    }

    var tamañoFicha = tamañoFichaSelect.value;
    var formaFicha = formaFichaSelect.value;
    
    generarTablero(N, tamañoFicha, formaFicha);

    tablero.querySelectorAll('.ficha').forEach(c => {
        c.classList.remove('inactiva');
        c.setAttribute('draggable', 'true');
    });
    tablero.classList.remove('victoria');
}

//función que establece temporizador
function iniciarTemporizador() {
    segundos = 0;
    temporizadorElem.textContent = 'Tiempo: 0s';
    if (intervaloTemporizador) clearInterval(intervaloTemporizador);
    intervaloTemporizador = setInterval(() => {
        segundos++;
        temporizadorElem.textContent = `Tiempo: ${segundos}s`;
    }, 1000);
}

function detenerTemporizador() {
    clearInterval(intervaloTemporizador);
}

//función que crea cuadrícula N x N y distribuye colores aleatoriamente
function generarTablero(N, tamañoFichaClase, formaFicha) {
    //generación de N colores distintos (se usa HSL con comas por compatibilidad)
    var colores = [];
    for (var i = 0; i < N; i++) {
        var hue = Math.round((360 / N) * i);
        colores.push('hsl(' + hue + ', 70%, 55%)');
    }

    //creación de array con N copias de cada color (garantiza existencia de solución)
    var fichasArray = [];
    for (var c = 0; c < colores.length; c++) {
        for (var k = 0; k < N; k++) {
            fichasArray.push(colores[c]);
        }
    }

    //desordenado aleatorio
    shuffleArray(fichasArray);

    //contenedor tablero como grid NxN
    tablero.innerHTML = '';
    tablero.style.gridTemplateColumns = 'repeat(' + N + ', 1fr)';

    //creación elementos "ficha" con atributos data-ficha y data-color
    for (var idx = 0; idx < fichasArray.length; idx++) {
        var color = fichasArray[idx];
        var celda = document.createElement('div');

        //clases CSS
        var claseT = (tamañoFichaClase === 'pequeña') ? 'pequena' :
            (tamañoFichaClase === 'mediana') ? 'mediana' : 'grande';
        celda.classList.add('ficha', claseT, formaFicha);

        //identificador de la ficha
        celda.setAttribute('data-ficha', String(idx));
        //color lógico de la ficha
        celda.setAttribute('data-color', color);

        celda.classList.add('inactiva');
        celda.setAttribute('draggable', 'false');

        //drag & drop
        addDragHandlers(celda);

        celda.style.background = color;

        //adición al tablero
        tablero.appendChild(celda);
    }
}

//algoritmo para mezclar un array in-place
function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    return arr;
}

//handlers Drag & Drop a una celda
function addDragHandlers(celda) {
    //guardado de id en dataTransfer
    celda.addEventListener('dragstart', function (e) {
        if (celda.classList.contains('inactiva')) return;
        //marca visual
        e.target.classList.add('elemento-en-arrastre');
        //identificador para poder localizar el origen al soltar
        e.dataTransfer.setData('text/plain', e.target.getAttribute('data-ficha'));
        //necesario para ciertos navegadores
        e.dataTransfer.effectAllowed = 'move';
    });

    //cuando termina el arrastre (sea drop o cancel)
    celda.addEventListener('dragend', function (e) {
        e.target.classList.remove('elemento-en-arrastre');
    });

    //cuando un elemento arrastrado se mueve sobre esta celda
    celda.addEventListener('dragover', function (e) {
        //necesario para permitir el drop (por defecto no está permitido)
        e.preventDefault();
        //indicación visual
        e.dataTransfer.dropEffect = 'move';
        return false;
    });

    //entrada del arrastre en la celda
    celda.addEventListener('dragenter', function (e) {
        e.target.classList.add('elemento-en-sobrevuelo');
    });

    //salida del arrastre de la celda
    celda.addEventListener('dragleave', function (e) {
        e.target.classList.remove('elemento-en-sobrevuelo');
    });

    //cuando soltamos sobre la celda: hacemos el intercambio de datos (no de nodos)
    celda.addEventListener('drop', function (e) {
        e.preventDefault(); //evita comportamientos por defecto del navegador
        e.target.classList.remove('elemento-en-sobrevuelo');

        //recuperamos el id (data-ficha) del origen
        var origenId = e.dataTransfer.getData('text/plain');
        if (!origenId || origenId.trim() === '') { return; }

        //localizamos los elementos origen y destino
        var origenElem = tablero.querySelector("[data-ficha='" + origenId + "']");
        //e.target puede ser un hijo si hay estructura interna, nos aseguramos de usar el .ficha
        var destinoElem = e.target;
        if (!destinoElem.classList.contains('ficha')) {
            destinoElem = destinoElem.closest('.ficha');
        }
        if (!origenElem || !destinoElem || origenElem === destinoElem) { return; }

        //intercambiamos data-color y style.background (solo datos visuales)
        var colorOrigen = origenElem.getAttribute('data-color');
        var colorDestino = destinoElem.getAttribute('data-color');

        //swap
        origenElem.setAttribute('data-color', colorDestino);
        origenElem.style.background = colorDestino;

        destinoElem.setAttribute('data-color', colorOrigen);
        destinoElem.style.background = colorOrigen;

        incrementarContadorMovimientos();

        //tras cada intercambio comprobamos si el tablero cumple la condición de victoria
        //necesitamos conocer N: calculamos por número de columnas
        var computedStyle = window.getComputedStyle(tablero);
        var gridCols = computedStyle.getPropertyValue('grid-template-columns').split(' ').length;
        var N = gridCols || Math.round(Math.sqrt(tablero.children.length));
        if (comprobarVictoria(N)) {
            detenerTemporizador();
            //acción al ganar: puedes cambiar por un modal / mensaje bonito en CSS
            tablero.classList.add('victoria');
            tablero.querySelectorAll('.ficha').forEach(c => {
                c.classList.add('inactiva');
                c.setAttribute('draggable', 'false');
            });
            mostrarModal('<h2>¡Enhorabuena!</h2><p>Has completado el tablero.</p>');
        }
    });
}

function incrementarContadorMovimientos() {
    contadorMovimientos++;
    contadorElem.textContent = 'Movimientos: ' + contadorMovimientos;
}

//comprueba si cada fila contiene fichas del mismo color
function comprobarVictoria(N) {
    //N es el número de columnas/filas
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
                return false; //esta fila no es homogénea
            }
        }
    }
    //si todas las filas son homogéneas devolvemos true
    return true;
}

document.addEventListener('DOMContentLoaded', main);