# Villa Anura — Space Mission Simulator

Videojuego educativo para niños, centrado en el diseño guiado y la ejecución conceptual de misiones espaciales robóticas.

## Enfoque actual
- Público objetivo: niños.
- Diseño de nave: guiado, con explicaciones de Flyn.
- Realismo físico: simple, mediante reglas educativas visuales.
- Objetivo principal: aprender a preparar, ejecutar y evaluar misiones espaciales. Tickets y moscas son recompensas secundarias.

## Primer MVP: Misión 1 — Sobrevuelo
Flujo implementado:
1. Centro de control y mapa de seis misiones.
2. Briefing interactivo del sobrevuelo.
3. Selección guiada de componentes de nave.
4. Comprobación simplificada de masa, energía y almacenamiento.
5. Simulación por etapas: observar el cometa, guardar datos y transmitirlos a la Tierra.
6. Informe de misión y desbloqueo de progreso.

La misión requiere cámara científica, antena de comunicación, panel solar y unidad de almacenamiento. El catálogo también presenta componentes no necesarios para enseñar selección y restricciones. Los valores son parámetros didácticos simplificados, no especificaciones reales de una nave.

## Estado de las seis misiones
- Sobrevuelo: primer flujo funcional de prototipo.
- Orbitador, Sonda atmosférica, Aterrizador, Rover y Retorno de muestras: visibles en el mapa, pendientes de diseño e implementación de sus mecánicas propias.

## Ejecutar localmente
Abre esta carpeta en Visual Studio Code y ejecuta `index.html` con Live Server. También puedes ejecutar `python -m http.server 8000` desde esta carpeta y abrir `http://localhost:8000`.

## Estado técnico
Esta versión es un prototipo funcional de interfaz y flujo educativo. La simulación del sobrevuelo es conceptual y determinista; todavía no representa una simulación astrodinámica validada. El progreso se almacena en localStorage del navegador.
