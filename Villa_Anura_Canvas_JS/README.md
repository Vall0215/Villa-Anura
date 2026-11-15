# Villa Anura
Videojuego educativo 2D de exploración espacial, desarrollado con JavaScript ES Modules y Canvas 2D.

## Experiencia actual (prototipo jugable)
- Centro de control con interfaz clara y luminosa.
- Seis misiones en progresión: Sobrevuelo, Orbitador, Sonda atmosférica, Aterrizador, Rover y Retorno de muestras.
- Desbloqueo secuencial: cada misión se habilita al completar la anterior.
- Cada recorrido incluye tres objetos de objetivo, tickets coleccionables y obstáculos cuya cantidad aumenta según la misión.
- Recompensa por primera finalización: una mosca y tickets adicionales.
- Tienda local de atuendos comprables con tickets; selección de apariencia de Flying.
- Flying con paleta de colores intercambiable, parpadeo y pequeños saltos al moverse.
- Efectos de sonido sintetizados para salto, datos, tickets, obstáculos, bonus y victoria.
- Progreso guardado en localStorage del navegador.

## Ejecutar localmente
Abre esta carpeta en Visual Studio Code y ejecuta `index.html` con Live Server. También puedes ejecutar `python -m http.server 8000` desde esta carpeta y abrir `http://localhost:8000`.

## Controles
- Mover: flechas izquierda/derecha o A/D.
- Saltar: Espacio, W o flecha arriba.
- Sonido: botón de nota musical en la interfaz.

## Alcance pendiente
Esta versión implementa un ciclo de juego común y progresión para las seis misiones. Los objetivos, objetos visuales y obstáculos son una primera representación jugable; todavía falta desarrollar mecánicas científicas específicas por arquitectura (inserción orbital, perfiles atmosféricos, selección de zona de aterrizaje, análisis de muestras, etc.), arte final/spritesheets, pruebas de balance y pruebas completas en distintos navegadores.
