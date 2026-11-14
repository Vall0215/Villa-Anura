# Villa Anura
Videojuego educativo 2D con JavaScript ES Modules y Canvas 2D.

## Dirección visual y jugabilidad
- Perspectiva lateral (side-scrolling).
- Pixel art HD con un centro de control espacial luminoso.
- Flying con estados de animación: idle, run, jump, fall y land.
- Tickets recogidos durante la exploración.
- Moscas como recompensa por completar misiones.
- Efectos de sonido y progreso guardado localmente.

## Ejecutar
Abre esta carpeta en VS Code y usa Live Server. Alternativamente, ejecuta `python -m http.server 8000` y visita http://localhost:8000.

## Controles
Flechas o A/D para moverse; Espacio, W o flecha arriba para saltar.

## Módulos
`main.js` coordina el juego; `player.js` controla Flying y sus físicas; `scene.js` dibuja el escenario; `collectibles.js` gestiona tickets; `progress.js` guarda recompensas; `audio.js` produce efectos; `input.js` gestiona teclado; `config.js` contiene parámetros.

Esta es la base lateral. Las seis misiones educativas, la tienda y los atuendos se integrarán progresivamente conservando sus objetivos originales.
