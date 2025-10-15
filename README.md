# Juego de Tablero

[![Demo](https://img.shields.io/badge/Demo-Disponible-brightgreen)](#)  [![Licencia](https://img.shields.io/badge/Licencia-MIT-blue)](#)

> Interfaz elegante y accesible para un juego de fichas arrastrables en un tablero NxN. Pensado para mostrar buenas prácticas en UI, manejo DOM y mecánicas de interacción (drag & drop) usando HTML, CSS y JavaScript puro.

---

## Vista rápida

Una experiencia interactiva que permite generar tableros NxN, personalizar la forma y tamaño de las fichas, y resolver el reto organizando filas homogéneas por color.

---

## Características principales

* Interfaz oscura moderna, centrada en la legibilidad y la jerarquía visual.
* Generación dinámica de tableros NxN (configurable entre 1 y 7).
* Fichas personalizables: tamaño (pequeña, mediana, grande) y forma (cuadrado / círculo).
* Drag & drop nativo (sin librerías) con feedback visual (hover, arrastre, animación de victoria).
* Contador de movimientos y temporizador integrados.
* Modal informativo y mensajes de victoria.
* Estado de bloqueo tras completar el tablero para evitar interacciones extra.

---

## Estructura del repositorio

```
root/
├─ index.html         # Punto de entrada
├─ style.css          # Estilos (variables, grid, estado)
├─ script.js          # Lógica del juego
├─ LICENSE            # Licencia MIT
└─ README.md          # Este archivo
```

---

## Cómo ejecutar (rápido)

La aplicación es estática: basta con abrir `index.html` en cualquier navegador moderno.

Opciones recomendadas para desarrollo local:

**Usando Python (servidor local simple):**

```bash
# Desde la carpeta del proyecto
python3 -m http.server 8000
# Abrir http://localhost:8000
```

**Usando npm (http-server):**

```bash
npm install -g http-server
http-server . -p 8000
# Abrir http://localhost:8000
```

---

## Controles y configuración

* **Inicio**: genera un nuevo tablero con la configuración actual.
* **Tamaño de la ficha**: ajusta las dimensiones visuales de las fichas.
* **Tamaño del tablero**: define N (número de filas/columnas, rango 1–7).
* **Forma de la ficha**: alterna entre cuadrado y círculo.
* **Información**: abre un modal con instrucciones resumidas.

---

## Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.
