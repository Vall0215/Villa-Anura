# Villa Anura

Videojuego educativo 2D desarrollado con JavaScript y la API Canvas de HTML5.

## Tecnologías

- HTML5: estructura mínima y elemento `<canvas>`.
- CSS3: interfaz y presentación.
- JavaScript: lógica del videojuego, controles, escenas, misiones y dibujo mediante Canvas 2D.
- Git y GitHub: control de versiones.

## Ejecutar localmente

No abras `index.html` directamente con doble clic si el navegador bloquea recursos. Inicia un servidor local desde esta carpeta:

### Opción 1: VS Code
1. Abre esta carpeta en Visual Studio Code.
2. Instala la extensión **Live Server**.
3. Haz clic derecho en `index.html`.
4. Selecciona **Open with Live Server**.

### Opción 2: Python
```bash
python -m http.server 8000
```
Luego abre http://localhost:8000

## Estructura

```text
Villa_Anura_Canvas_JS/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── assets/
│   ├── sprites/
│   └── audio/
├── docs/
├── .gitignore
└── README.md
```

## Estado del proyecto

Esta primera organización conserva el prototipo Canvas existente y separa HTML, CSS y JavaScript. El siguiente refactor dividirá `main.js` en módulos como `engine`, `input`, `player`, `scenes`, `missions` y `ui`, sin cambiar las mecánicas de golpe.

## Controles actuales

- WASD o flechas: mover a Flying.
- E o Espacio: interactuar.
- L: abrir la pizarra.
- M: activar/desactivar audio.
- Esc: cerrar paneles.
