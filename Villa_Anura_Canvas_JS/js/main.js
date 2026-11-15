import { Progress } from './progress.js';
import { AudioManager } from './audio.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const W = 960, H = 540;
const progress = new Progress();
const audio = new AudioManager();
const EN_US_TRANSLATIONS={
  "VILLA ANURA · LABORATORIO ORBITAL": "VILLA ANURA · ORBITAL LAB",
  "MISIÓN 2 · EXPERIMENTO DE BOTÁNICA EN AUSENCIA DE GRAVEDAD": "MISSION 2 · BOTANY EXPERIMENT IN MICROGRAVITY",
  "Completa las tres casillas escribiendo 0 o 1 en cada una.": "Fill in all three boxes with 0 or 1.",
  "Agua · Radiación UV · CO₂": "Water · UV Radiation · CO₂",
  "FLYN · OPERADORA": "FLYN · FLIGHT OPERATOR",
  "SISTEMA": "SYSTEM",
  "BOTÁNICO": "BOTANY",
  "Escribe 0 o 1": "Enter 0 or 1",
  "CONFIGURACIÓN DE VARIABLES": "VARIABLE CONFIGURATION",
  "AGUA": "WATER",
  "RADIACIÓN UV": "UV RADIATION",
  "0 o 1": "0 or 1",
  "Haz clic en una casilla y escribe 0 o 1.": "Click a box and enter 0 or 1.",
  "Usa Retroceso para borrar el valor de la casilla seleccionada.": "Press Backspace to clear the selected box.",
  "CONSULTAR RESULTADO ▶": "VIEW RESULT ▶",
  "RESULTADO DEL EXPERIMENTO": "EXPERIMENT RESULT",
  "PRUEBAS: ": "TRIALS: ",
  "CONTINUAR ▶": "CONTINUE ▶",
  "¡LOS 6 SISTEMAS ESTÁN LISTOS! PRESIONA ENTER PARA LANZAR": "ALL 6 SYSTEMS ARE READY! PRESS ENTER TO LAUNCH",
  "VILLA ANURA  ·  CENTRO DE CONTROL": "VILLA ANURA · MISSION CONTROL",
  "ESTRELLAS": "STARS",
  "MISIÓN 1 / 3  ·  DISEÑO Y PREPARACIÓN": "MISSION 1 / 3 · SPACECRAFT DESIGN & PREPARATION",
  "SEIS SISTEMAS PARA CONFIGURAR LA NAVE": "SIX SYSTEMS TO CONFIGURE YOUR SPACECRAFT",
  "COMBUSTIBLE": "FUEL",
  "OXÍGENO": "OXYGEN",
  "AERODINÁMICA": "AERODYNAMICS",
  "SEGURIDAD": "SAFETY",
  "MATERIALES": "MATERIALS",
  "TECNOLOGÍA": "TECHNOLOGY",
  "MASA": "MASS",
  "MDL": "HINTS",
  "¡LOS SEIS SISTEMAS ESTÁN LISTOS!": "ALL SIX SYSTEMS ARE READY!",
  "LANZAR MISIÓN  ▶": "LAUNCH MISSION ▶",
  "RECURSOS PREPARADOS  ": "SYSTEMS CONFIGURED  ",
  "SALDO DISPONIBLE  $ ": "AVAILABLE BALANCE  $ ",
  "✓ SELECCIONADO": "✓ SELECTED",
  "VER OPCIONES": "VIEW OPTIONS",
  "ELIGE UNA OPCIÓN": "SELECT AN OPTION",
  "Selecciona una alternativa para configurar este sistema.": "Select an option to configure this system.",
  "ELEGIR": "SELECT",
  "Pulsa el número correspondiente · ESC para cerrar": "Press the matching number · ESC to close",
  "CONTROL DE MASA": "MASS CHECK",
  "PRESUPUESTO DE MISIÓN": "MISSION BUDGET",
  "PISTA DE FLYN": "FLYN'S HINT",
  "MASA INSTALADA": "INSTALLED MASS",
  "Suma de los recursos seleccionados": "Total mass of selected systems",
  "Presupuesto restante para esta misión": "Remaining budget for this mission",
  "Abre una categoría inferior y solicita una pista para recibir ayuda.": "Open a system category and request a hint for help.",
  "Pistas restantes: ": "HINTS LEFT: ",
  "Pulsa ESC o haz clic fuera para cerrar": "Press ESC or click outside to close",
  "VILLA ANURA": "VILLA ANURA",
  "HANGAR ESPACIAL": "SPACE HANGAR",
  "¡BIENVENIDO, EXPLORADOR!": "WELCOME, EXPLORER!",
  "Soy Flyn. Prepárate para diseñar": "I'm Flyn. Get ready to design",
  "y lanzar nuestras misiones espaciales.": "and launch our space missions.",
  "PRESIONA  ENTER  PARA JUGAR": "PRESS ENTER TO PLAY",
  "Acércate a una consola para instalar sus sistemas.": "Move closer to a console to install its systems.",
  "Ese sistema ya está instalado. ¡Bien hecho!": "That system is already installed. Well done!",
  "¡Todos los sistemas listos! Pulsa ENTER para despegar.": "All systems are ready! Press ENTER to launch.",
  "NAVE PREPARADA": "SPACECRAFT READY",
  "¡Despegue! El cometa se aproxima por la derecha.": "Liftoff! The comet is approaching from the right.",
  "SOBREVUELO · COMETA AURELIA": "FLYBY · AURELIA COMET",
  "DATOS ": "DATA ",
  "VENTANA DE OBSERVACIÓN": "OBSERVATION WINDOW",
  "¡Pulsa E cuando el cometa esté cerca!": "Press E when the comet is nearby!",
  "¡Foto capturada! Pulsa E para guardar.": "Image captured! Press E to save.",
  "Datos guardados. Pulsa E para transmitir.": "Data saved. Press E to transmit.",
  "¡Datos enviados a la Tierra!": "Data transmitted to Earth!",
  "¡El cometa está en el campo de visión! Pulsa E ahora.": "The comet is in view! Press E now.",
  "El cometa pasó. Pulsa R para repetir el sobrevuelo.": "The comet passed. Press R to retry the flyby.",
  "¡Imagen capturada! Ahora guarda los datos en la memoria.": "Image captured! Now save the data to memory.",
  "Datos almacenados. Orienta la antena para transmitir.": "Data stored. Aim the antenna to transmit.",
  "¡La Tierra recibió los datos! Misión completada.": "Earth received the data! Mission complete.",
  "¡MISIÓN ": "MISSION ",
  " COMPLETADA!": " COMPLETE!",
  "DESAFÍO DE LA MISIÓN ": "MISSION CHALLENGE ",
  "Selecciona la decisión más adecuada:": "Choose the best decision:",
  "PULSA A O B PARA RESPONDER": "PRESS A OR B TO ANSWER",
  "ENTER · FINALIZAR CAMPAÑA": "ENTER · FINISH CAMPAIGN",
  "ENTER · SIGUIENTE MISIÓN": "ENTER · NEXT MISSION",
  "★ +2 ESTRELLAS": "★ +2 STARS",
  "LANZAMIENTO DE MISIÓN": "MISSION LAUNCH",
  "¡Todos los sistemas están preparados! Flyn está despegando.": "All systems are ready! Flyn is launching.",
  "¡Regresamos a la Tierra! Usa las flechas para controlar el descenso y conserva combustible para frenar antes de tocar el suelo.": "We're returning to Earth! Use the arrow keys to control your descent and save fuel for braking before touchdown.",
  "VILLA ANURA · REGRESO A LA TIERRA": "VILLA ANURA · RETURN TO EARTH",
  "MISIÓN 3 · DESCENSO Y ATERRIZAJE CONTROLADO": "MISSION 3 · CONTROLLED DESCENT & LANDING",
  "RESERVA": "REMAINING FUEL",
  "VELOCIDAD": "SPEED",
  "km/h": "km/h",
  "DESCENSO": "DESCENT",
  "ALTITUD RESTANTE": "ALTITUDE REMAINING",
  "CONTROLES": "CONTROLS",
  "↑  FRENAR": "↑  BRAKE",
  "Consume combustible": "Uses fuel",
  "↓  ACELERAR": "↓  ACCELERATE",
  "GAME OVER · PULSA R PARA REINTENTAR": "GAME OVER · PRESS R TO RETRY",
  "¡CAMPAÑA COMPLETADA!": "CAMPAIGN COMPLETE!",
  "MISIÓN CUMPLIDA · REGRESO SEGURO A LA TIERRA": "MISSION ACCOMPLISHED · SAFE RETURN TO EARTH",
  "¡Flyn celebra tu gran aterrizaje!": "Flyn celebrates your safe landing!",
  "CERTIFICADO": "CERTIFICATE",
  "DE EXPLORADOR ESPACIAL": "SPACE EXPLORER",
  "Se reconoce tu habilidad para:": "This certificate recognizes your ability to:",
  "DISEÑAR · EXPERIMENTAR · ATERRIZAR": "DESIGN · EXPERIMENT · LAND",
  "Completaste las tres misiones de Villa Anura y lograste un regreso seguro a la Tierra.": "You completed all three Villa Anura missions and returned safely to Earth.",
  "VILLA ANURA · ACADEMIA DE EXPLORACIÓN": "VILLA ANURA · EXPLORER ACADEMY",
  "RECOMPENSAS": "REWARDS",
  "★  +3 ESTRELLAS": "★  +3 STARS",
  "🎟  +5 TICKETS": "🎟  +5 TICKETS",
  "★  MEDALLA DE ORO": "★  GOLD MEDAL",
  "VOLVER AL INICIO": "BACK TO HOME",
  "FLYN ESTÁ INSTALANDO RECURSOS": "FLYN IS INSTALLING SYSTEMS",
  "¡Selección confirmada!": "Selection confirmed!",
  "FLYN ESTÁ INSTALANDO: ": "FLYN IS INSTALLING: ",
  "¡Recurso instalado!": "System installed!",
  "¡Hola! Soy Flyn. Esta es nuestra misión de exploración espacial. Completa las tres misiones y administra el presupuesto inicial de 5.000 créditos.": "Hi! I'm Flyn. Welcome to our space exploration mission. Complete all three missions and manage your starting budget of 5,000 credits.",
  "¡Llegamos al espacio! Vamos a iniciar el experimento botánico.": "We've reached space! Let's begin the botany experiment.",
  "Selecciona 0 o 1 en las tres casillas y consulta el resultado.": "Choose 0 or 1 in all three boxes, then view the result.",
  "Selecciona 0 o 1 en cada casilla.": "Select 0 or 1 in each box.",
  "Valor registrado. Completa las otras casillas y consulta el resultado.": "Value recorded. Complete the other boxes and view the result.",
  "Casilla vacía. Escribe 0 o 1.": "Box cleared. Enter 0 or 1.",
  "Casilla Agua seleccionada. Escribe 0 o 1.": "Water box selected. Enter 0 or 1.",
  "Casilla Radiación UV seleccionada. Escribe 0 o 1.": "UV Radiation box selected. Enter 0 or 1.",
  "Casilla CO₂ seleccionada. Escribe 0 o 1.": "CO₂ box selected. Enter 0 or 1.",
  "Completa las tres casillas: escribe 0 o 1 en cada una.": "Complete all three boxes: enter 0 or 1 in each one.",
  "La combinación 000 no está incluida en el Excel. Prueba otra combinación.": "Combination 000 is not included in the dataset. Try another combination.",
  "Esta combinación no está incluida en los siete resultados del Excel.": "This combination is not included among the seven dataset results.",
  "Experimento ejecutado.": "Experiment complete.",
  "Completa las tres misiones y administra el presupuesto inicial de 5.000 créditos.": "Complete all three missions and manage the starting budget of 5,000 credits.",
  "Continúa la primera misión administrando el presupuesto de 5.000 créditos.": "Continue the first mission and manage the 5,000-credit budget.",
  "Compara la autonomía que necesitas con el peso y el presupuesto: no siempre hace falta la opción mayor.": "Compare the range you need with the spacecraft's weight and budget. The largest option isn't always necessary.",
  "Elige una reserva que cubra la duración de la misión sin cargar oxígeno innecesario.": "Choose an oxygen reserve that covers the mission without adding unnecessary weight.",
  "El perfil aerodinámico modifica el consumo durante el vuelo. Según el catálogo, la cónica es la referencia; compara las unidades por segundo antes de elegir.": "The aerodynamic profile affects fuel use during flight. The catalog lists the conical profile as a reference; compare the units per second before choosing.",
  "Piensa en el riesgo principal de esta misión y elige la protección adecuada.": "Consider the mission's main risk and choose the right protection.",
  "Lleva los materiales necesarios para cumplir el objetivo, evitando añadir masa sin utilidad.": "Choose the materials needed for the mission without adding unnecessary mass.",
  "Prioriza la tecnología que permita cumplir el objetivo científico y enviar los datos.": "Prioritize technology that supports the science objectives and data transmission.",
  "¡Los seis sistemas están listos!": "All six systems are ready!",
  "Los seis sistemas están listos": "All six systems are ready",
  "Presupuesto insuficiente. Elige otra opción.": "Insufficient funds. Choose another option.",
  "La masa superaría el límite de ": "The spacecraft mass would exceed the limit of ",
  " kg. Elige una opción más ligera.": " kg. Choose a lighter option.",
  "Abre primero una categoría para recibir una pista.": "Open a system category before requesting a hint.",
  "No quedan pistas disponibles.": "No hints remaining.",
  "Abre una categoría y solicita una pista para recibir ayuda.": "Open a system category and request a hint for help.",
  "¡Bienvenido al laboratorio! Configura agua, radiación UV y CO₂.": "Welcome to the lab! Configure water, UV radiation, and CO₂.",
  "¡Aterrizaje seguro! Has controlado la velocidad y el combustible.": "Safe landing! You controlled your speed and fuel.",
  "Propulsor activo: reduces la velocidad, pero consumes combustible.": "Thruster active: you're slowing down, but using fuel.",
  "Acelerando el descenso: aumenta la velocidad de impacto.": "Accelerating descent: impact speed is increasing.",
  "Combustible agotado: no puedes activar el propulsor.": "Out of fuel: the thruster can no longer fire.",
  "Caída por gravedad: decide cuándo frenar.": "Gravity is increasing your descent speed. Decide when to brake.",
  "GAME OVER · La nave llegó con demasiada velocidad.": "GAME OVER · The spacecraft hit the ground too fast.",
  "¡Campaña completada! Has realizado el experimento botánico y regresado a la Tierra con un aterrizaje seguro.": "Campaign complete! You finished the botany experiment and returned safely to Earth.",
  "¡Misión completada!": "Mission complete!",
  "Elige una opción para configurar este sistema.": "Choose an option to configure this system.",
  "COMBINACIÓN ": "COMBINATION ",
  "Fuente: ": "Source: ",
  "FLYN": "FLYN",
  "Selección confirmada": "Selection confirmed",

  "Aún faltan sistemas. Revisa las cuatro consolas.": "Some systems are still missing. Check the four consoles.",
  "A · ": "A · ",
  "B · ": "B · ",
  "GAME OVER": "GAME OVER",
  "Pulsa R para volver a intentar": "Press R to try again",
  "MISIÓN 1  ✓     MISIÓN 2  ✓     MISIÓN 3  ✓": "MISSION 1  ✓     MISSION 2  ✓     MISSION 3  ✓",
  "¡EL COMETA YA PASÓ!": "THE COMET HAS PASSED!",
  "Pulsa R para intentarlo otra vez.": "Press R to try again.",
  "La masa supera el límite permitido.": "Spacecraft mass exceeds the allowed limit.",
  "MASA  ·  ": "MASS  ·  ",
  "MASA  ": "MASS  ",
  "SALDO DISPONIBLE": "AVAILABLE BALANCE",
  "RECURSOS PREPARADOS": "SYSTEMS CONFIGURED",
  "COMBUSTIBLE": "FUEL",
  "OXÍGENO": "OXYGEN",
  "AERODINÁMICA": "AERODYNAMICS",
  "SEGURIDAD": "SAFETY",
  "MATERIALES": "MATERIALS",
  "TECNOLOGÍA": "TECHNOLOGY",
  "¡BIENVENIDO, EXPLORADOR!": "WELCOME, EXPLORER!",
  "PRESIONA  ENTER  PARA JUGAR": "PRESS ENTER TO PLAY",
  "VILLA ANURA  ·  CENTRO DE CONTROL": "VILLA ANURA · MISSION CONTROL",
  "VILLA ANURA · REGRESO A LA TIERRA": "VILLA ANURA · RETURN TO EARTH",
  "MISIÓN 3 · DESCENSO Y ATERRIZAJE CONTROLADO": "MISSION 3 · CONTROLLED DESCENT & LANDING",
  "¡CAMPAÑA COMPLETADA!": "CAMPAIGN COMPLETE!",
  "MISIÓN CUMPLIDA · REGRESO SEGURO A LA TIERRA": "MISSION ACCOMPLISHED · SAFE RETURN TO EARTH"

};
const ADDITIONAL_EN_US_TRANSLATIONS={
  "¡CONFIGURACIÓN COMPLETADA! PRESIONA ENTER PARA LANZAR":"CONFIGURATION COMPLETE! PRESS ENTER TO LAUNCH",
  "¡Todo en orden! La nave está lista. Podemos avanzar con la misión 2.":"Everything is in order! The spacecraft is ready. We can proceed to Mission 2.",
  "MISIÓN FALLIDA":"MISSION FAILED",
  "¡Agotaste el presupuesto! La misión ha fallado.":"You have run out of budget. Mission failed.",
  "PULSA R PARA VOLVER AL MENÚ DE INICIO":"PRESS R TO RETURN TO THE HOME MENU",
  "Mantén ESPACIO para frenar. Administra el combustible hasta tocar la plataforma.":"Hold SPACE to brake. Manage your fuel until touchdown.",
  "Frenado activo: mantén el control y vigila la reserva de combustible.":"Braking engaged: stay in control and watch your remaining fuel.",
  "Caída por gravedad: pulsa ESPACIO para frenar.":"Gravity is pulling you down. Press SPACE to brake.",
  "␣  FRENAR":"␣  BRAKE",
  "Mantén ESPACIO":"Hold SPACE",
  "FLYN TE ACOMPAÑA":"FLYN IS HERE TO HELP",
  "CONFIGURACIÓN DE LA NAVE":"SPACECRAFT CONFIGURATION",
  "Cada perfil tiene un diseño de cohete diferente.":"Each aerodynamic profile has a different rocket design.",
  "¡Todo en orden! La nave está lista. Podemos avanzar con la misión 2.":"All systems are in order! The spacecraft is ready. We can proceed to Mission 2."
};
let gameLanguage='en-US';
try{gameLanguage=localStorage.getItem('villaAnuraLanguage')||'en-US';}catch{}
function tr(value){
  let raw=String(value);
  if(gameLanguage==='es')return raw;
  if(Object.prototype.hasOwnProperty.call(EN_US_TRANSLATIONS,raw))return EN_US_TRANSLATIONS[raw];
  if(Object.prototype.hasOwnProperty.call(ADDITIONAL_EN_US_TRANSLATIONS,raw))return ADDITIONAL_EN_US_TRANSLATIONS[raw];
  const option=raw.match(/^(\d+\.\s+)(.+)$/);
  if(option)return option[1]+tr(option[2]);
  if(raw.startsWith('COMBINACIÓN '))return 'COMBINATION '+raw.slice('COMBINACIÓN '.length);
  if(raw.startsWith('Fuente: '))return 'Source: '+raw.slice('Fuente: '.length);
  if(raw.startsWith('PRUEBAS: '))return 'TRIALS: '+raw.slice('PRUEBAS: '.length);
  if(raw.startsWith('ESTRELLAS'))return 'STARS'+raw.slice('ESTRELLAS'.length);
  if(raw.startsWith('FLYN ESTÁ INSTALANDO: '))return 'FLYN IS INSTALLING: '+tr(raw.slice('FLYN ESTÁ INSTALANDO: '.length));
  if(raw.startsWith('¡MISIÓN ')&&raw.endsWith(' COMPLETADA!'))return raw.replace('¡MISIÓN ','MISSION ').replace(' COMPLETADA!',' COMPLETE!');
  if(raw.startsWith('MISIÓN ')&&raw.includes(' · '))return raw.replace('MISIÓN ','MISSION ');
  return raw;
}
function setGameLanguage(next){
  gameLanguage=next==='es'?'es':'en-US';
  try{localStorage.setItem('villaAnuraLanguage',gameLanguage);}catch{}
  document.documentElement.lang=gameLanguage;
  document.title=gameLanguage==='en-US'?'Villa Anura — Space Mission Game':'Villa Anura — Videojuego';
  canvas.setAttribute('aria-label',gameLanguage==='en-US'?'Villa Anura video game':'Videojuego Villa Anura');
  const hint=document.querySelector('.screen-hint');
  if(hint)hint.textContent=gameLanguage==='en-US'?'VILLA ANURA · SPACE MISSION GAME':'VILLA ANURA · VIDEOJUEGO ESPACIAL';
  audio.select();
}
document.documentElement.lang=gameLanguage;
document.title=gameLanguage==='en-US'?'Villa Anura — Space Mission Game':'Villa Anura — Videojuego';
const screenHint=document.querySelector('.screen-hint');
if(screenHint)screenHint.textContent=gameLanguage==='en-US'?'VILLA ANURA · SPACE MISSION GAME':'VILLA ANURA · VIDEOJUEGO ESPACIAL';


const player = { x: 118, y: 420, w: 34, h: 42, vx: 0, vy: 0, grounded: true, facing: 1, anim: 0 };
const keys = {};
let mode = 'title', clock = 0, last = 0, dialogue = '', dialogueTimer = 0;
let installed = new Set(), missionPhase = 0, cometX = 1030, observationWindow = 0, dataSaved = false, dataSent = false;
const missionNames = ['SOBREVUELO','ORBITADOR','SONDA ATMOSFÉRICA','ATERRIZADOR','ROVER EXPLORADOR','RETORNO DE MUESTRAS'];
let missionIndex = 0, challengeAnswered = false, challengeFeedback = '', challengeCorrect = false;
const INITIAL_MISSION_BUDGET=5000;
let missionBudget=INITIAL_MISSION_BUDGET, mdlHints=3, activeCategory=null, selectedResources={}, actionAnimation=0, actionLabel='', utilityPanel=null, hintMessage='', launchTimer=0;
let botanyFactors={water:null,uv:null,co2:null}, botanyActiveInput=null, botanyTested=new Set(), botanyResult=null, botanyNotice='Selecciona 0 o 1 en cada casilla.';
let landingAltitude=460, landingSpeed=88, landingFuel=34, landingStatus='ready', landingThrottle=false, landingMessage='Mantén ESPACIO para frenar. Administra el combustible hasta tocar la plataforma.';
let frogMood='neutral', frogMoodTimer=0, idleMoodClock=0, rocketProfile=0, budgetFailureReason='';
let landingAudioCooldown=0;
const missionBriefs=[
{title:'DISEÑO Y PUESTA EN ÓRBITA',objective:'Prepara una nave equilibrada y lista para el lanzamiento.',limit:12.5},
{title:'BOTÁNICA EN MICROGRAVEDAD',objective:'Investiga cómo se comportan las plantas al combinar agua, radiación UV y CO₂.',limit:11.5},
{title:'REGRESO Y ATERRIZAJE EN LA TIERRA',objective:'Controla la velocidad de descenso y administra el combustible para aterrizar sin daños.',limit:12}
];
const missionChallenges=[
{q:'¿Qué debes comprobar antes de autorizar el lanzamiento?',a:'Que la nave cumpla los límites de masa y tenga sus sistemas preparados',b:'Que la nave lleve la mayor cantidad posible de recursos',correct:0,why:'¡Correcto! Antes del lanzamiento se verifican la configuración, los sistemas y los límites de masa.'},
{q:'En microgravedad, ¿qué debes considerar al estudiar el crecimiento de una planta?',a:'Observar cómo cambian germinación y orientación al variar las condiciones',b:'Suponer que todas las plantas crecen igual que en la Tierra',correct:0,why:'¡Correcto! El experimento permite comparar resultados de germinación, orientación y condiciones ambientales.'},
{q:'¿Qué indica que el aterrizaje fue seguro?',a:'Tocar tierra con una velocidad vertical baja y controlada',b:'Llegar a la superficie a la mayor velocidad posible',correct:0,why:'¡Aterrizaje exitoso! Una velocidad vertical baja y controlada reduce el riesgo de daños en la nave.'}
];
let earnedStars=Number(localStorage.getItem('villaAnuraStars')||0);
let completedMissions=JSON.parse(localStorage.getItem('villaAnuraCompleted')||'[]');
function saveProgress(){localStorage.setItem('villaAnuraStars',String(earnedStars));localStorage.setItem('villaAnuraCompleted',JSON.stringify(completedMissions));}

// Catálogo de respuestas de la Misión 1. Cada categoría conserva las opciones indicadas para el juego.
const resourceCategories=[
{id:'aero',name:'AERODINÁMICA',icon:'✈',options:[['Elíptica',100,0],['Cónica',250,0],['Ojival',500,0],['Von Kármán',900,0]]},
{id:'fuel',name:'COMBUSTIBLE',icon:'⛽',options:[['Criogénico',500,1.2],['Hidrocarburo',900,2.1],['Hipergólico',1500,3.2],['Sólido',1500,3.2],['Eléctrico / Iónico',1500,3.2]]},
{id:'oxygen',name:'OXÍGENO',icon:'◉',options:[['Holgada',400,0.8],['Estándar',750,1.4],['Moderada',1200,2.2],['Muy limitada',1200,2.2]]},
{id:'safety',name:'SEGURIDAD',icon:'🛡',options:[['Escape en el Lanzamiento',500,0.7],['Protección Térmica',950,1.5],['Soporte Vital y Control Ambiental',1400,2.3],['Blindaje contra Micrometeoritos',1400,2.3],['Sistema de Paracaídas y Aterrizaje',1400,2.3],['Trajes Espaciales',1400,2.3],['Sistemas de Supresión de Incendios',1400,2.3],['Equipos de Supervivencia y Botiquines',1400,2.3]]},
{id:'materials',name:'MATERIALES',icon:'▣',options:[['Económica',350,0.6],['Ligera',700,1.3],['Compuesta',1100,2.0],['Carga especializada',1100,2.0]]},
{id:'technology',name:'TECNOLOGÍA',icon:'⌘',options:[['Sistema de propulsión',500,0.5],['Software de vuelo',900,1.0],['Sistemas mecánicos',1350,1.7],['Sistemas de energía',1350,1.7],['Aislante Térmico',1350,1.7]]}
];
let particles = [], pulse = 0, message = '', messageTimer = 0, jumpWasDown = false;
function totalMass(){return Object.values(selectedResources).reduce((sum,item)=>sum+(item.mass||0),0);}
function wrapText(value,x,y,maxWidth,lineHeight,color='#426879',align='center'){const words=tr(value).split(' '),lines=[];let line='';ctx.font='bold 11px system-ui';for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;}if(line)lines.push(line);ctx.fillStyle=color;ctx.textAlign=align;lines.slice(0,3).forEach((row,i)=>ctx.fillText(row,x,y+i*lineHeight));ctx.textAlign='left';}
function chosenAllResources(){return Object.keys(selectedResources).length===6;}

const botanyExperiments = {
  '100': {result:'Se obtuvo un 100 % de germinación, pero las raíces y los brotes presentaron orientaciones anormales y aleatorias.',source:'NASA – OS-26: Zea mays seeds in microgravity.'},
  '010': {result:'Se identificaron daños en el desarrollo de los cloroplastos. La exposición espacial incluía diferentes factores, por lo que no puede atribuirse el daño exclusivamente a la radiación UV.',source:'Richards et al. (2025) – Simulated deep space exposure on seeds.'},
  '001': {result:'En algunas especies de plantas similares al maíz se proporcionó una gran carga evaporativa que puso a prueba el control de la humedad de la zona radicular y la recuperación del agua transpirada por condensación.',source:'NASA – Advanced Plant Habitat: validation study.'},
  '110': {result:'Los estudios de maíz en microgravedad documentan la importancia de la hidratación para la germinación, mientras que los estudios de exposición espacial muestran posibles daños por radiación.',source:'NASA – OS-26 · Richards et al. (2025).'},
  '101': {result:'Permitió controlar la humedad de la zona radicular y la concentración de CO₂. En experimentos con trigo y Arabidopsis se validó el control de estas condiciones y el seguimiento del crecimiento en órbita.',source:'Advanced Plant Habitat – Hardware Validation.'},
  '011': {result:'La exposición a la radiación espacial en los niveles probados no tuvo un impacto significativo en la tasa de germinación de Arabidopsis y las semillas de múltiples plantas de cultivo.',source:'NASA (2024) – Impact of Space Radiation with Other Combined Space Environmental Factors.'},
  '111': {result:'La exposición a la radiación espacial en los niveles probados no tuvo un impacto significativo en la tasa de germinación y las semillas de múltiples plantas de cultivo.',source:'NASA (2024) – Radiation and Combined Environmental Factors · Advanced Plant Habitat.'}
};
function botanyKey(){return [botanyFactors.water,botanyFactors.uv,botanyFactors.co2].map(v=>v===null?'_':String(v)).join('');}
function botanyScene(){
  const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#06152c');sky.addColorStop(.55,'#102a49');sky.addColorStop(1,'#183b55');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  for(let i=0;i<95;i++){const sx=(i*137)%W,sy=(i*73)%H;rect(sx,sy,2+(i%4===0?1:0),2,'#d7efff');}
  planet(845,112,65,'#5689aa');planet(845,112,51,'#83bdce');ctx.strokeStyle='#7ab0c5';ctx.lineWidth=5;ctx.beginPath();ctx.arc(845,112,77,0,Math.PI*2);ctx.stroke();
  roundPanel(28,12,904,50,'#fffdf5','#b9d8d4',12);txt('VILLA ANURA · LABORATORIO ORBITAL',48,34,14,'#397d6c');txt('MISIÓN 2 · EXPERIMENTO DE BOTÁNICA EN AUSENCIA DE GRAVEDAD',48,52,10,'#426879');
  roundPanel(55,76,850,54,'#e8f5ef','#a9d2c4',10);txt('Completa las tres casillas escribiendo 0 o 1 en cada una.',480,99,13,'#285d60','center');txt('Agua · Radiación UV · CO₂',480,117,10,'#5c7d7b','center');
  roundPanel(48,150,205,265,'#e5f1f0','#9dbfc2',12);txt('FLYN · OPERADORA',150,177,11,'#397d6c','center');
  roundPanel(70,192,161,78,'#164e70','#78b8bf',8);txt('SISTEMA',150,212,9,'#9de8df','center');txt('BOTÁNICO',150,232,14,'#ffffff','center');for(let i=0;i<4;i++)rect(94,246+i*5,35+i*10,2,'#6ed8d5');
  drawEnvironmentIndicators(150,290);
  drawPlantPreview(150,335);
  drawFrog(150,405,0.52);
  roundPanel(275,150,637,265,'#fffef8','#c8ded8',12);txt('CONFIGURACIÓN DE VARIABLES',593,185,13,'#397d6c','center');
  const fields=[['water','AGUA',380,320],['uv','RADIACIÓN UV',590,530],['co2','CO₂',800,740]];
  fields.forEach(([id,label,center,left])=>{txt(label,center,235,label==='RADIACIÓN UV'?11:13,'#31596a','center');const active=botanyActiveInput===id;roundPanel(left,255,120,70,active?'#f0fbf7':'#ffffff',active?'#299b82':'#9abfc0',8);txt(botanyFactors[id]===null?'':String(botanyFactors[id]),center,301,28,'#267f61','center');if(botanyFactors[id]===null)txt('0 o 1',center,301,12,'#a5b8b8','center');if(active)roundPanel(left+4,259,112,62,'#00000000','#55bda7',6);const value=botanyFactors[id];roundPanel(left+16,337,88,23,value===1?'#dff4e6':value===0?'#f5e8dc':'#eef3f1',value===1?'#72bc91':value===0?'#d7b28d':'#c8d8d5',6);txt(value===null?'SIN CONFIGURAR':value===1?'ACTIVADO':'DESACTIVADO',center,353,7,'#52717a','center');});
  txt('Selecciona cada variable y escribe 0 o 1.',593,371,9,'#66828a','center');
  roundPanel(480,378,226,29,'#15516e','#58c9cf',8);txt('CONSULTAR RESULTADO ▶',593,398,10,'#ffffff','center');
  roundPanel(48,430,864,98,'#fffef8','#c8ded8',9);txt('RESULTADO DEL EXPERIMENTO',68,451,9,'#397d6c');
  if(botanyResult){txt('COMBINACIÓN '+botanyKey(),68,468,9,'#397d6c');wrapText(botanyResult.result,68,484,650,12,'#35596a','left');txt('Fuente: '+botanyResult.source,68,518,8,'#718b8c','left');}
  else wrapText(botanyNotice,68,480,650,13,'#547782','left');
  txt('PRUEBAS: '+botanyTested.size+'/7',842,451,9,'#397d6c','center');
  if(botanyResult){roundPanel(755,478,160,35,'#ffd13e','#e4b52e',8);txt('CONTINUAR ▶',835,501,10,'#754c24','center');}
}
function drawEnvironmentIndicators(x,y){
  const water=botanyFactors.water,uv=botanyFactors.uv,co2=botanyFactors.co2;
  ctx.fillStyle=water===1?'#36a9d6':'#9aaeb3';ctx.beginPath();ctx.moveTo(x-42,y-10);ctx.quadraticCurveTo(x-57,y+7,x-42,y+12);ctx.quadraticCurveTo(x-27,y+7,x-42,y-10);ctx.fill();
  ctx.strokeStyle=uv===1?'#e5b84b':'#a8b5b5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-4,y-9);ctx.lineTo(x-4,y+7);ctx.moveTo(x-14,y-1);ctx.lineTo(x+6,y-1);ctx.moveTo(x-11,y-8);ctx.lineTo(x+3,y+6);ctx.moveTo(x+3,y-8);ctx.lineTo(x-11,y+6);ctx.stroke();
  ctx.fillStyle=co2===1?'#6e9db1':'#a7b8bb';ctx.beginPath();ctx.arc(x+35,y+2,7,0,Math.PI*2);ctx.arc(x+43,y-4,9,0,Math.PI*2);ctx.arc(x+52,y+2,7,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffffff';ctx.font='bold 7px system-ui';ctx.textAlign='center';ctx.fillText('CO₂',x+43,y+5);ctx.textAlign='left';
}
function drawPlantPreview(x,y){
  const ready=Object.values(botanyFactors).every(v=>v!==null),water=botanyFactors.water,uv=botanyFactors.uv,co2=botanyFactors.co2;
  const height=ready?18+(water?24:5)+(co2?16:0)-(uv?5:0):8;
  // Roots, growing medium and stem update live as the three switches are entered.
  ctx.strokeStyle='#9b754c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y+3);ctx.lineTo(x-8,y+20);ctx.moveTo(x,y+3);ctx.lineTo(x+7,y+19);ctx.moveTo(x,y+5);ctx.lineTo(x,y+25);ctx.stroke();
  rect(x-20,y,40,5,'#8c6a45');rect(x-17,y+5,34,8,'#d9b17a');
  ctx.strokeStyle=ready?'#39965b':'#78a68a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-height);ctx.stroke();
  if(height>12){ctx.fillStyle=water===0?'#86aa80':'#4aa56b';ctx.beginPath();ctx.ellipse(x-9,y-height+9,10,5,-.5,0,Math.PI*2);ctx.ellipse(x+9,y-height+17,10,5,.5,0,Math.PI*2);ctx.fill();}
  if(height>28){ctx.fillStyle=co2===1?'#43a56a':'#80ad77';ctx.beginPath();ctx.ellipse(x-7,y-height+24,8,4,-.5,0,Math.PI*2);ctx.ellipse(x+8,y-height+30,8,4,.5,0,Math.PI*2);ctx.fill();}
  if(ready&&uv===1){ctx.fillStyle='#e6bd55';ctx.beginPath();ctx.arc(x+26,y-height-1,5,0,Math.PI*2);ctx.fill();}
  if(!ready){ctx.fillStyle='#597a79';ctx.font='bold 8px system-ui';ctx.textAlign='center';ctx.fillText('VISTA PREVIA DE CRECIMIENTO',x,y+39);ctx.textAlign='left';}
  else{ctx.fillStyle='#397d65';ctx.font='bold 8px system-ui';ctx.textAlign='center';ctx.fillText('PLANTA CONFIGURADA',x,y+39);ctx.textAlign='left';}
}
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function txt(value,x,y,size=14,color='#36576a',align='left'){ctx.fillStyle=color;ctx.font='bold '+size+'px system-ui';ctx.textAlign=align;ctx.fillText(tr(value),x,y);ctx.textAlign='left';}
function panel(x,y,w,h,fill='#fffdf5',stroke='#cfe4d8'){rect(x,y,w,h,fill);rect(x,y,w,3,stroke);rect(x,y+h-3,w,3,stroke);rect(x,y,3,h,stroke);rect(x+w-3,y,3,h,stroke);}
function roundPanel(x,y,w,h,fill='#fffdf5',stroke='#cfe4d8',r=10){ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();ctx.stroke();}
function say(t){dialogue=tr(t);dialogueTimer=3.8;}
function notify(t){message=tr(t);messageTimer=2.2;}
function planet(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffffff45';ctx.beginPath();ctx.ellipse(x-r*.2,y-r*.25,r*.55,r*.17,-.4,0,Math.PI*2);ctx.fill();}
function stars(){for(let i=0;i<50;i++){const x=(i*191-clock*(i%3+1)*5)%W;const y=(i*79)%300;rect((x+W)%W,y,2+(i%3===0?1:0),2,'#ffffffaa');}}
function drawFrog(x,y,scale=1){
  ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(scale,scale);
  const mood=frogMood,blink=Math.sin(clock*2.1)>0.988&& !['sleepy','love','proud'].includes(mood);
  // Sombra y silueta pixelada base, conservando el diseño original de Flyn.
  ctx.globalAlpha=.2;ctx.fillStyle='#000000';ctx.beginPath();ctx.ellipse(0,1,32,7,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  rect(-36,-18,18,13,'#087d32');rect(-43,-13,18,9,'#39b923');rect(20,-18,18,13,'#087d32');rect(26,-13,18,9,'#39b923');rect(-39,-8,23,7,'#050d0b');rect(19,-8,23,7,'#050d0b');
  rect(-25,-48,50,37,'#050d0b');rect(-22,-46,44,34,'#168b26');rect(-18,-42,36,27,'#43bd27');rect(-16,-29,32,18,'#050d0b');rect(-13,-28,26,16,'#f0df8a');rect(-10,-24,20,11,'#f7e9a4');
  rect(-31,-42,13,31,'#050d0b');rect(-28,-40,12,27,'#15932b');rect(18,-42,13,31,'#050d0b');rect(16,-40,12,27,'#15932b');
  rect(-35,-91,70,55,'#050d0b');rect(-39,-81,8,31,'#050d0b');rect(31,-81,8,31,'#050d0b');rect(-32,-88,64,49,'#15962b');rect(-35,-78,70,30,'#15962b');rect(-30,-84,60,42,'#4bc52b');
  rect(-31,-105,26,28,'#050d0b');rect(5,-105,26,28,'#050d0b');rect(-28,-102,22,24,'#42c52b');rect(7,-102,22,24,'#42c52b');
  // Ojos: doce variantes expresivas.
  if(mood==='love'){
    rect(-25,-98,17,18,'#f2d96e');rect(8,-98,17,18,'#f2d96e');
    rect(-23,-95,7,7,'#ed6f9b');rect(-16,-95,7,7,'#ed6f9b');rect(-21,-88,10,7,'#ed6f9b');
    rect(10,-95,7,7,'#ed6f9b');rect(17,-95,7,7,'#ed6f9b');rect(12,-88,10,7,'#ed6f9b');
  }else if(mood==='sleepy'||mood==='proud'||mood==='happy'||mood==='excited'){
    rect(-25,-98,17,18,'#f2d96e');rect(8,-98,17,18,'#f2d96e');
    rect(-22,-91,12,3,'#050d0b');rect(-19,-94,3,3,'#050d0b');rect(11,-91,12,3,'#050d0b');rect(14,-94,3,3,'#050d0b');
  }else if(mood==='angry'){
    rect(-25,-98,17,18,'#f2d96e');rect(8,-98,17,18,'#f2d96e');
    rect(-25,-101,18,5,'#050d0b');rect(8,-96,18,5,'#050d0b');rect(-20,-94,10,12,'#050d0b');rect(12,-94,10,12,'#050d0b');
  }else if(mood==='wink'||mood==='mischievous'){
    rect(-25,-98,17,18,'#f2d96e');rect(8,-98,17,18,'#f2d96e');rect(-21,-92,10,3,'#050d0b');rect(11,-96,9,10,'#ffffff');rect(14,-93,5,7,'#050d0b');
  }else{
    rect(-25,-98,17,18,'#f2d96e');rect(8,-98,17,18,'#f2d96e');
    if(!blink){rect(-18,-96,8,9,'#ffffff');rect(13,-96,8,9,'#ffffff');rect(-15,-93,5,7,'#050d0b');rect(16,-93,5,7,'#050d0b');}
    else{rect(-19,-88,11,3,'#050d0b');rect(12,-88,11,3,'#050d0b');}
  }
  rect(-27,-67,9,7,'#f18b83');rect(18,-67,9,7,'#f18b83');
  // Boca según emoción.
  if(mood==='sad'||mood==='confused'||mood==='nervous'||mood==='angry'){
    rect(-12,-55,8,3,'#050d0b');rect(-5,-59,10,4,'#050d0b');rect(4,-55,8,3,'#050d0b');
  }else if(mood==='surprised'||mood==='sleepy'){
    rect(-5,-61,10,10,'#050d0b');rect(-2,-58,4,4,'#f18b83');
  }else if(mood==='happy'||mood==='excited'||mood==='mischievous'){
    rect(-13,-60,26,5,'#050d0b');rect(-9,-55,18,5,'#050d0b');rect(-5,-55,10,4,'#ef7891');
    if(mood==='mischievous'){rect(1,-54,10,7,'#ed6e87');rect(6,-55,8,4,'#ffffff');}
  }else if(mood==='proud'||mood==='love'){
    rect(-11,-57,22,3,'#050d0b');rect(-7,-54,14,3,'#050d0b');
  }else{rect(-12,-58,24,3,'#050d0b');}
  // Accesorios/gestos característicos del sprite sheet.
  if(mood==='excited'||mood==='happy'){rect(-48,-94,7,7,'#ffd64d');rect(-53,-88,7,3,'#ffd64d');rect(41,-94,7,7,'#ffd64d');rect(46,-88,7,3,'#ffd64d');}
  if(mood==='love'||mood==='excited'){drawPixelHeart(-47,-103,'#f26d91');drawPixelHeart(42,-108,'#f26d91');}
  if(mood==='sad'){rect(-23,-79,4,10,'#55bce8');rect(-19,-72,4,7,'#55bce8');rect(22,-78,4,10,'#55bce8');rect(18,-71,4,7,'#55bce8');}
  if(mood==='angry'){rect(39,-112,5,12,'#ed514d');rect(34,-107,14,4,'#ed514d');rect(41,-116,5,4,'#ed514d');}
  if(mood==='surprised'){rect(-49,-100,5,12,'#ffd64d');rect(-44,-95,5,5,'#ffd64d');rect(44,-105,5,12,'#ffd64d');}
  if(mood==='confused'){txt('?',43,-99,17,'#b58be8','center');}
  if(mood==='sleepy'){txt('Z z',44,-102,11,'#9bc8ef');rect(35,-67,8,5,'#d9f5ff');}
  if(mood==='nervous'){rect(39,-82,7,11,'#55bce8');rect(41,-78,3,5,'#d9f5ff');rect(-49,-98,5,5,'#55bce8');}
  if(mood==='proud'){rect(-48,-99,7,7,'#ffd64d');rect(42,-108,7,7,'#ffd64d');rect(45,-111,2,13,'#ffd64d');}
  ctx.restore();
}
function drawPixelHeart(x,y,color){
  rect(x+3,y,6,4,color);rect(x+15,y,6,4,color);rect(x,y+4,24,7,color);rect(x+4,y+11,16,5,color);rect(x+8,y+16,8,4,color);
}
function setFrogMood(mood,duration=2.6){
  frogMood=mood;frogMoodTimer=duration;
}
function background(){
  // Fondo espacial limpio: solo negro, estrellas y destellos sutiles.
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#030817');g.addColorStop(.58,'#080f27');g.addColorStop(1,'#111b36');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  for(let i=0;i<190;i++){
    const x=(i*191+((clock*(i%4+1)*2)%W))%W,y=(i*79)%H;
    const twinkle=.55+.45*Math.sin(clock*1.8+i*2.17);
    const size=i%17===0?3:i%5===0?2:1;
    ctx.globalAlpha=twinkle;rect(x,y,size,size,i%9===0?'#8ed8ee':i%7===0?'#f7dca0':'#e9f2ff');
    if(i%31===0){rect(x-4,y,9,1,'#d7ecff');rect(x,y-4,1,9,'#d7ecff');}
  }
  ctx.globalAlpha=1;
}
function drawRocket(){
  drawRocketProfile(480,350,rocketProfile);
}
function drawRocketProfile(cx,baseY,profile=0){
  const colors=[['#eaf5ff','#2879b9','#f5ca5d'],['#f3e8ff','#8d58b6','#d8b3ee'],['#fff0ee','#c34f5d','#f1b0a6'],['#e8fff5','#399b82','#9bdac8']];
  const [body,accent,detail]=colors[profile%4],w=profile===1?60:profile===2?54:profile===3?66:58,top=baseY-205;
  // silueta distinta para cada perfil aerodinámico
  ctx.fillStyle=body;ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.beginPath();
  if(profile===0){ctx.moveTo(cx-w/2,top+34);ctx.quadraticCurveTo(cx,top-8,cx+w/2,top+34);ctx.lineTo(cx+w/2,baseY-12);ctx.lineTo(cx-w/2,baseY-12);ctx.closePath();}
  else if(profile===1){ctx.moveTo(cx-w/2,top+42);ctx.lineTo(cx,top-2);ctx.lineTo(cx+w/2,top+42);ctx.lineTo(cx+w/2-4,baseY-12);ctx.lineTo(cx-w/2+4,baseY-12);ctx.closePath();}
  else if(profile===2){ctx.moveTo(cx-w/2,top+22);ctx.quadraticCurveTo(cx,top-16,cx+w/2,top+22);ctx.lineTo(cx+w/2,baseY-12);ctx.lineTo(cx-w/2,baseY-12);ctx.closePath();}
  else{ctx.moveTo(cx-w/2,top+50);ctx.lineTo(cx-w/2+8,top+20);ctx.quadraticCurveTo(cx,top-12,cx+w/2-8,top+20);ctx.lineTo(cx+w/2,top+50);ctx.lineTo(cx+w/2,baseY-12);ctx.lineTo(cx-w/2,baseY-12);ctx.closePath();}
  ctx.fill();ctx.stroke();rect(cx-w/2-7,baseY-60,7,45,accent);rect(cx+w/2,baseY-60,7,45,accent);
  rect(cx-w/2+5,top+65,w-10,6,accent);rect(cx-w/2+5,baseY-75,w-10,6,accent);
  roundPanel(cx-12,top+82,24,25,'#cdeaf2',accent,5);planet(cx,top+94,7,'#4d9cc1');
  rect(cx-8,baseY-17,16,6,detail);rect(cx-16,baseY-10,32,7,'#8ca6b0');
}
function controlRoom(){
  background();
  roundPanel(28,12,904,50,'#fffdf5','#b9d8d4',12);
  txt('VILLA ANURA  ·  CENTRO DE CONTROL',48,33,13,'#397d6c');txt('★ '+earnedStars+'  ESTRELLAS',690,42,11,'#a47727','right');
  txt('MISIÓN 1 / 3  ·  DISEÑO Y PREPARACIÓN',48,51,10,'#426879');txt('SEIS SISTEMAS PARA CONFIGURAR LA NAVE',48,64,9,'#66828a');
  roundPanel(38,70,150,42,'#fff0bd','#e4bd55',10);txt('$ '+missionBudget.toLocaleString(gameLanguage==='en-US'?'en-US':'es-CO'),113,97,18,'#8b5b23','center');
  roundPanel(198,70,150,42,'#ffd13e','#e4b52e',10);txt('MASA '+totalMass().toFixed(1)+' / 12.5 kg',273,97,11,'#8b315f','center');
  roundPanel(810,70,122,48,'#ffd13e','#e4b52e',20);txt('MDL  '+mdlHints,871,100,17,'#8b315f','center');
  // Mitad izquierda: hangar y nave; sin las dos pantallas azules laterales.
  roundPanel(28,125,440,306,'#eaf5f2','#9abdc0',14);ctx.save();ctx.beginPath();ctx.roundRect(34,131,428,294,10);ctx.clip();
  rect(34,131,428,294,'#dcebea');for(let x=34;x<462;x+=72)rect(x,131,2,294,'#bfd4d5');for(let y=131;y<425;y+=58)rect(34,y,428,2,'#bfd4d5');
  rect(192,160,10,235,'#d9a63e');rect(292,160,10,235,'#d9a63e');rect(192,160,110,9,'#e6b84e');for(let y=192;y<380;y+=45)rect(202,y,90,5,'#e7bd58');
  drawRocketProfile(247,360,rocketProfile);
  drawFrog(actionAnimation>0?247:100,390,0.56);
  if(actionAnimation>0){roundPanel(132,392,230,23,'#fffdf4','#c5ded8',7);txt(actionLabel,247,408,8,'#397c68','center');}
  ctx.restore();
  // Mitad derecha: selector de respuestas, manteniendo los catálogos actuales.
  roundPanel(484,125,448,306,'#fffef8','#a9d0c7',14);
  if(activeCategory){
    const cat=resourceCategories.find(v=>v.id===activeCategory);
    roundPanel(502,141,412,36,'#15516e','#58c9cf',8);txt(cat.name+' · ELIGE UNA OPCIÓN',708,164,12,'#ffffff','center');
    txt('Selecciona una alternativa para configurar este sistema.',708,193,9,'#547782','center');
    cat.options.forEach((opt,i)=>{const yy=207+i*Math.min(37,190/cat.options.length),hh=Math.min(31,190/cat.options.length-4),canPay=missionBudget>=opt[1];roundPanel(508,yy,400,hh,canPay?'#edf8f5':'#f2eeee',canPay?'#9acbbd':'#d9c5c5',6);txt((i+1)+'. '+opt[0],520,yy+hh*.68,opt[0].length>31?8:10,canPay?'#31596c':'#a18e8e');txt('ELEGIR',895,yy+hh*.68,8,canPay?'#397d65':'#a18e8e','right');});
    if(activeCategory==='aero'){const selected=selectedResources.aero;txt(selected?'Perfil instalado: '+selected.label:'Cada perfil tiene un diseño de cohete diferente.',708,408,9,'#547782','center');}
  }else{
    txt('CONFIGURACIÓN DE LA NAVE',708,174,14,'#397d6c','center');txt('Selecciona uno de los seis sistemas.',708,201,10,'#547782','center');
    roundPanel(540,225,336,92,'#eaf5f1','#b8d8ce',9);txt('FLYN TE ACOMPAÑA',708,252,12,'#397d6c','center');wrapText('Elige cada sistema. Observa cómo cambia la nave y mantén el presupuesto bajo control.',708,278,285,15,'#426879','center');
    txt('PRESUPUESTO DISPONIBLE  $ '+missionBudget.toLocaleString(gameLanguage==='en-US'?'en-US':'es-CO'),708,350,10,'#8b672e','center');
  }
  // Indicador de misión y acción inferior.
  const chosen=Object.keys(selectedResources).length;
  if(chosen===6){
    roundPanel(75,408,810,32,'#e2f5e9','#72bc91',9);
    txt('¡CONFIGURACIÓN COMPLETADA! PRESIONA ENTER PARA LANZAR',480,429,12,'#28764f','center');
  }else{
    roundPanel(75,408,810,32,'#fffdf5','#c8ded8',9);
    txt('RECURSOS PREPARADOS  '+chosen+'/6',94,429,11,'#477b6c');txt('SALDO DISPONIBLE  $ '+missionBudget.toLocaleString(gameLanguage==='en-US'?'en-US':'es-CO'),866,429,11,'#8b672e','right');
  }
  const startX=28,gap=7,bw=146,by=451;
  resourceCategories.forEach((cat,i)=>{const x=startX+i*(bw+gap),active=activeCategory===cat.id,done=!!selectedResources[cat.id];roundPanel(x,by,bw,66,done?'#dff4e6':active?'#fff0bd':'#f5e6a8',done?'#69b78a':active?'#dcae35':'#d4ad43',10);txt(cat.name,x+bw/2,by+27,10,'#244f62','center');txt(done?'✓ SELECCIONADO':'VER OPCIONES',x+bw/2,by+49,8,done?'#36875e':'#65818a','center');});
  if(messageTimer>0){roundPanel(330,388,300,26,'#fffef5','#c6e0d7',8);txt(message,480,406,10,'#3e8066','center');}
  if(utilityPanel){roundPanel(300,155,360,190,'#fffef8','#62aeb4',13);roundPanel(318,169,324,37,'#15516e','#58c9cf',8);txt(utilityPanel==='mass'?'CONTROL DE MASA':utilityPanel==='budget'?'PRESUPUESTO DE MISIÓN':'PISTA DE FLYN',480,193,13,'#ffffff','center');if(utilityPanel==='mass'){txt('MASA INSTALADA',480,235,11,'#66828a','center');txt(totalMass().toFixed(1)+' kg',480,269,24,'#397d65','center');}else if(utilityPanel==='budget'){txt('SALDO DISPONIBLE',480,235,11,'#66828a','center');txt('$ '+missionBudget.toLocaleString(gameLanguage==='en-US'?'en-US':'es-CO'),480,269,24,'#397d65','center');}else{wrapText(hintMessage||'Abre una categoría inferior y solicita una pista para recibir ayuda.',480,237,290,15,'#426879','center');txt('Pistas restantes: '+mdlHints,480,320,10,'#66828a','center');}txt('Pulsa ESC o haz clic fuera para cerrar',480,333,9,'#66828a','center');}
}
function hud(){roundPanel(18,14,210,43,'#fffdf5','#c8e3d8',8);txt('VILLA ANURA',32,32,11,'#58936d');txt('HANGAR ESPACIAL',32,48,10,'#456879');roundPanel(805,14,137,43,'#fffdf5','#c8e3d8',8);txt('🪰 '+progress.data.flies+'    🎟 '+progress.data.tickets,819,41,13,'#456879');}
function dialogBox(t){roundPanel(675,390,265,65,'#fffef8','#c9e4d7',9);txt('FLYN',690,411,10,'#65a078');txt(t.length>35?t.slice(0,34)+'…':t,690,435,11,'#456879');}
function titleScreen(){
  background();
  // Logo stays in the upper-left corner; rocket emoji intentionally removed.
  roundPanel(30,28,286,100,'#faffff','#18a8a7',15);
  txt('✦  VILLA',54,67,34,'#087d68');
  txt('ANURA',54,105,34,'#087d68');
  roundPanel(43,112,255,28,'#087b9a','#d6ffff',12);
  txt('SPACE MISSION ADVENTURE',170,131,11,'#ffffff','center');

  // A hovering rocket with animated exhaust replaces the yellow launch frame.
  drawFloatingRocket();
  drawFrog(480,438,0.82);

  roundPanel(620,347,302,91,'#fffdf2','#1b7895',10);
  txt('¡BIENVENIDO, EXPLORADOR!',638,371,12,'#153d62');
  txt('Soy Flyn. Prepárate para diseñar',638,395,11,'#153d62');
  txt('y lanzar nuestras misiones espaciales.',638,414,11,'#153d62');
  roundPanel(244,458,472,68,'#ffd13e','#fff0a6',17);
  roundPanel(253,464,454,55,'#087b91','#baf6ed',13);
  txt('PRESIONA  ENTER  PARA JUGAR',480,499,17,'#ffffff','center');
  txt('VILLA ANURA v1.0',18,532,9,'#26445a');
}
function drawFloatingRocket(){
  const bob=Math.sin(clock*1.45)*5.5;
  const drift=Math.sin(clock*.68)*7;
  const cx=480+drift;
  const baseY=282+bob;

  // Soft engine glow
  ctx.save();
  ctx.globalAlpha=.17;
  ctx.fillStyle='#54cbe8';
  ctx.beginPath();ctx.ellipse(cx,baseY+7,24,29,0,0,Math.PI*2);ctx.fill();
  ctx.restore();

  drawRocketProfile(cx,baseY,rocketProfile);

  // Animated pixel-art exhaust, like a small rocket gently climbing.
  const flicker=Math.sin(clock*17)*5+Math.sin(clock*9)*3;
  ctx.save();
  ctx.fillStyle='#f07843';
  ctx.beginPath();
  ctx.moveTo(cx-10,baseY-10);
  ctx.lineTo(cx-7,baseY+12+flicker*.25);
  ctx.lineTo(cx,baseY+37+flicker);
  ctx.lineTo(cx+7,baseY+12-flicker*.2);
  ctx.lineTo(cx+10,baseY-10);
  ctx.closePath();ctx.fill();

  ctx.fillStyle='#ffd45c';
  ctx.beginPath();
  ctx.moveTo(cx-5,baseY-8);
  ctx.lineTo(cx-3,baseY+13);
  ctx.lineTo(cx,baseY+28+flicker*.65);
  ctx.lineTo(cx+4,baseY+12);
  ctx.lineTo(cx+5,baseY-8);
  ctx.closePath();ctx.fill();

  rect(cx-2,baseY+1,4,13,'#fff1b0');

  // Small glowing exhaust pixels drift below the flame.
  for(let i=0;i<5;i++){
    const phase=(clock*34+i*17)%34;
    const px=cx+Math.sin(clock*4+i*2)*((i%2)*4+2);
    const py=baseY+17+phase;
    const alpha=Math.max(0,1-phase/36);
    ctx.globalAlpha=alpha*.8;
    rect(px,py,3,3,i%2?'#ffb14f':'#f47a48');
  }
  ctx.restore();
}
function resetPlayer(){player.x=115;player.y=420;player.vx=0;player.vy=0;player.grounded=true;}
function updatePlayer(dt){const left=keys.ArrowLeft||keys.KeyA,right=keys.ArrowRight||keys.KeyD,jump=keys.Space||keys.ArrowUp||keys.KeyW;const moving=left||right;player.vx=((right?1:0)-(left?1:0))*185;if(player.vx)player.facing=Math.sign(player.vx);if(player.grounded&&((jump&&!jumpWasDown)||moving)){player.vy=jump?-570:-455;player.grounded=false;audio.jump();}jumpWasDown=!!jump;player.vy+=1450*dt;player.x=Math.max(32,Math.min(928,player.x+player.vx*dt));player.y+=player.vy*dt;if(player.y>=420){player.y=420;player.vy=0;player.grounded=true;}player.anim+=dt;}
function interactHangar(){const station=stations.find(s=>Math.abs(player.x-s.x)<62);if(!station){say('Acércate a una consola para instalar sus sistemas.');return;}if(installed.has(station.id)){say('Ese sistema ya está instalado. ¡Bien hecho!');return;}installed.add(station.id);audio.data();say(station.desc+' instalado.');if(installed.size===4){say('¡Todos los sistemas listos! Pulsa ENTER para despegar.');notify('NAVE PREPARADA');}}
function startMission(){if(installed.size<4){say('Aún faltan sistemas. Revisa las cuatro consolas.');return;}mode='flyby';missionPhase=0;cometX=1050;observationWindow=0;dataSaved=false;dataSent=false;resetPlayer();say('¡Despegue! El cometa se aproxima por la derecha.');audio.start();}
function flybyScene(){background();planet(135,140,58,'#b8d9d4');planet(820,110,32,'#d6e3ef');
// starfield and distant comet trail
for(let i=0;i<7;i++){let sx=(i*150-clock*34)%W;if(sx<0)sx+=W;rect(sx,200+(i*31)%150,3,3,'#ffffff');}
const cx=cometX;ctx.fillStyle='#a6a997';ctx.beginPath();ctx.arc(cx,275,49,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d0d1bd';ctx.beginPath();ctx.arc(cx-15,258,18,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d5e9e5aa';ctx.beginPath();ctx.moveTo(cx-40,245);ctx.lineTo(cx-205,185);ctx.lineTo(cx-72,278);ctx.fill();
rect(0,438,W,102,'#b8d9cb');rect(0,438,W,7,'#8cc4a1');drawFrog(170,420,0.9);
roundPanel(20,18,225,48,'#fffdf5','#c8e4d8',8);txt('SOBREVUELO · COMETA AURELIA',32,38,10,'#5e9977');txt('DATOS '+(missionPhase>=1?1:0)+'/1',32,55,11,'#476b79');
roundPanel(695,18,245,58,'#fffdf5','#c8e4d8',8);txt('VENTANA DE OBSERVACIÓN',710,40,10,'#639878');rect(710,48,210,8,'#e7eee8');rect(710,48,Math.max(0,210-observationWindow*2),8,'#e7b85e');
roundPanel(330,365,300,55,'#fffdf5','#c8e4d8',8);txt(missionPhase===0?'¡Pulsa E cuando el cometa esté cerca!':missionPhase===1?'¡Foto capturada! Pulsa E para guardar.':missionPhase===2?'Datos guardados. Pulsa E para transmitir.':'¡Datos enviados a la Tierra!',480,398,12,'#466f78','center');
drawFrog(player.x,player.y);if(dialogueTimer>0)dialogBox(dialogue);
}
function updateFlyby(dt){updatePlayer(dt);cometX-=125*dt;observationWindow+=dt;if(missionPhase===0&&cometX<250){say('¡El cometa está en el campo de visión! Pulsa E ahora.');missionPhase=0;}if(cometX<-90&&missionPhase===0){say('El cometa pasó. Pulsa R para repetir el sobrevuelo.');mode='missed';}if(missionPhase===1&&dataSaved===false){}}
function interactFlyby(){if(missionPhase===0){if(cometX<400&&cometX>95){missionPhase=1;say('¡Imagen capturada! Ahora guarda los datos en la memoria.');audio.data();}else say('Espera a que el cometa entre en el campo de visión.');}else if(missionPhase===1){dataSaved=true;missionPhase=2;say('Datos almacenados. Orienta la antena para transmitir.');audio.data();}else if(missionPhase===2){dataSent=true;missionPhase=3;say('¡La Tierra recibió los datos! Misión completada.');audio.win();setTimeout(()=>{if(mode==='flyby'){mode='complete';challengeAnswered=false;challengeFeedback='';challengeCorrect=false;if(!progress.data.completed.includes('flyby-v1')){progress.data.completed.push('flyby-v1');progress.data.flies++;progress.data.tickets+=3;progress.save();}}},1000);}}
function completeScene(){
  background();planet(480,215,112,'#abd9cf');drawFrog(480,365,0.78);
  const q=missionChallenges[missionIndex];
  txt('¡MISIÓN '+(missionIndex+1)+' COMPLETADA!',480,57,25,'#4c8668','center');
  roundPanel(185,105,590,330,'#fffef8','#9fcbd1',13);
  roundPanel(205,122,550,46,'#15516e','#58c9cf',9);
  txt('DESAFÍO DE LA MISIÓN '+(missionIndex+1)+' / 3',480,151,15,'#ffffff','center');
  roundPanel(220,184,105,100,'#e7f5f4','#b6d9d5',8);
  if(missionIndex===0){rect(252,213,42,44,'#f7ffff');rect(260,204,26,10,'#e4bd55');rect(264,226,18,18,'#4d9cc1');}
  else if(missionIndex===1){planet(272,231,27,'#9da69c');}
  else if(missionIndex===2){planet(272,231,27,'#64b6d2');ctx.strokeStyle='#e5a93d';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(272,231,43,17,-.3,0,Math.PI*2);ctx.stroke();}
  else if(missionIndex===3){rect(250,202,43,50,'#e6a84a');rect(256,208,31,38,'#dceff2');}
  else if(missionIndex===4){rect(238,251,68,12,'#9aab9f');rect(249,230,48,20,'#e8b84e');}
  else{roundPanel(245,203,55,54,'#d5e6eb','#799ba9',7);roundPanel(254,214,37,31,'#e5bd68','#9c814b',5);}
  txt(q.q,345,207,14,'#24465c');
  txt('Selecciona la decisión más adecuada:',345,235,11,'#548477');
  roundPanel(345,251,390,48,'#edf8f5','#8dc7b6',8);txt('A · '+q.a,363,280,11,'#24546a');
  roundPanel(345,310,390,48,'#edf8f5','#8dc7b6',8);txt('B · '+q.b,363,339,11,'#24546a');
  if(challengeFeedback){roundPanel(220,370,520,43,challengeCorrect?'#e1f5e7':'#fff0df',challengeCorrect?'#83c99a':'#e5b37d',8);wrapText(challengeFeedback,480,388,480,14,challengeCorrect?'#28764d':'#966337','center');}
  if(challengeCorrect){
    txt('★ +2 ESTRELLAS',480,435,14,'#a47727','center');
    txt(missionIndex===2?'ENTER · FINALIZAR CAMPAÑA':'ENTER · SIGUIENTE MISIÓN',480,478,12,'#ffffff','center');
    roundPanel(330,449,300,48,'#15516e','#65d3cf',10);
  }else{roundPanel(330,449,300,48,'#15516e','#65d3cf',10);txt('PULSA A O B PARA RESPONDER',480,478,11,'#ffffff','center');}
}
function launchScene(){
  background();planet(760,170,62,'#b5dce8');roundPanel(60,55,840,410,'#eaf5f2','#9abdc0',16);
  for(let x=100;x<880;x+=100)rect(x,80,3,300,'#c0d5d7');for(let y=120;y<390;y+=65)rect(60,y,840,3,'#c5dadd');rect(410,350,140,14,'#e4bd55');rect(425,315,110,35,'#d7e5e7');
  const lift=Math.min(210,launchTimer*72);ctx.save();ctx.translate(0,-lift);drawRocketProfile(480,350,rocketProfile);ctx.fillStyle='#f3a34b';ctx.beginPath();ctx.moveTo(468,344);ctx.lineTo(480,390+Math.sin(clock*18)*8);ctx.lineTo(492,344);ctx.closePath();ctx.fill();ctx.restore();drawFrog(480,390,0.55);
  txt('LANZAMIENTO DE MISIÓN',480,95,22,'#397d65','center');txt('¡Todos los sistemas preparados! Flyn está despegando.',480,430,12,'#547a82','center');
}
function launchSuccessScene(){background();roundPanel(150,110,660,310,'#fffef8','#8dc7b6',16);drawFrog(480,315,0.85);txt('¡TODO EN ORDEN!',480,165,25,'#397d65','center');wrapText('La nave está en órbita y todos los sistemas funcionan correctamente.',480,365,520,18,'#426879','center');txt('PREPARADOS PARA LA MISIÓN 2',480,400,13,'#15516e','center');}
function beginLandingMission(){
  missionIndex=2;
  landingAltitude=460;
  landingSpeed=88;
  landingFuel=34;
  landingStatus='ready';
  landingThrottle=false;
  landingMessage='Mantén ESPACIO para frenar. Administra el combustible hasta tocar la plataforma.'
  challengeAnswered=false;challengeFeedback='';challengeCorrect=false;
  mode='landing';
  say('¡Regresamos a la Tierra! Usa las flechas para controlar el descenso y conserva combustible para frenar antes de tocar el suelo.');
  audio.start();
}
function awardCampaignVictory(){
  const firstCompletion=progress.completeMission('villa-anura-final-campaign');
  if(firstCompletion){
    progress.data.flies+=1;
    progress.data.tickets+=5;
    progress.save();
    earnedStars+=3;
    if(!completedMissions.includes(2))completedMissions.push(2);
    saveProgress();
  }
}
function updateLanding(dt){
  if(landingStatus!=='ready')return;
  landingAudioCooldown=Math.max(0,landingAudioCooldown-dt);
  const brake=!!keys.Space;
  landingThrottle=false;
  landingSpeed+=4.6*dt;
  if(brake&&landingFuel>0){
    landingSpeed-=30*dt;landingFuel=Math.max(0,landingFuel-4*dt);landingThrottle=true;
    if(landingAudioCooldown<=0){audio.brake();landingAudioCooldown=.32;}
    landingMessage='Frenado activo: mantén el control y vigila la reserva de combustible.';
  }else landingMessage=landingFuel<=0?'Combustible agotado: ya no puedes frenar.':'Caída por gravedad: pulsa ESPACIO para frenar.';
  landingSpeed=Math.max(0,Math.min(155,landingSpeed));
  landingAltitude-=landingSpeed/3.6*1.2*dt;
  if(landingAltitude<=0){
    landingAltitude=0;
    if(landingSpeed<=18&&landingFuel>=0){
      landingStatus='landed';landingMessage='¡Aterrizaje seguro! Has controlado la velocidad y el combustible.';setFrogMood('proud',8);
      awardCampaignVictory();mode='victory';audio.stopMusic();audio.landing();setTimeout(()=>audio.certificate(),220);
    }else{landingStatus='crashed';landingMessage='GAME OVER · La nave llegó con demasiada velocidad.';setFrogMood('sad',8);audio.bump();}
  }
}
function landingScene(){
  const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#bfe4f1');sky.addColorStop(.66,'#e8f5f0');sky.addColorStop(1,'#f4f2dc');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  for(let i=0;i<40;i++){const sx=(i*173)%W,sy=(i*67)%290;rect(sx,sy,2,2,'#ffffff');}planet(790,145,58,'#7ebed5');planet(790,145,44,'#a4d7df');
  rect(0,438,W,102,'#b5d9b6');rect(0,438,W,7,'#8fc39c');for(let x=0;x<W;x+=84){rect(x,453,44,5,'#9fc99f');rect(x+20,468,31,4,'#a3cba0');}
  roundPanel(365,444,230,30,'#e5edf0','#92adb7',7);rect(385,456,190,7,'#e8c75b');
  roundPanel(28,12,904,50,'#fffdf5','#b9d8d4',12);txt('VILLA ANURA · REGRESO A LA TIERRA',48,34,14,'#397d6c');txt('MISIÓN 3 · DESCENSO Y ATERRIZAJE CONTROLADO',48,52,10,'#426879');
  roundPanel(42,88,152,315,'#fffef8','#b9d8d4',10);txt('COMBUSTIBLE',118,113,11,'#397d6c','center');roundPanel(94,137,48,210,'#e5efec','#b7ceca',7);
  const fuelH=196*(landingFuel/34);rect(103,340-fuelH,30,fuelH,landingFuel>15?'#4aa879':landingFuel>6?'#e3b44b':'#d66b55');txt(Math.round(landingFuel)+'%',118,376,18,'#906a32','center');txt('RESERVA',118,393,8,'#6b8587','center');
  roundPanel(766,88,152,315,'#fffef8','#b9d8d4',10);txt('VELOCIDAD',842,113,11,'#397d6c','center');txt('km/h',842,130,9,'#6b8587','center');roundPanel(818,149,48,198,'#e5efec','#b7ceca',7);
  const speedH=184*Math.min(1,landingSpeed/120);rect(827,340-speedH,30,speedH,landingSpeed>75?'#d66b55':landingSpeed>35?'#e3b44b':'#4aa879');txt(Math.round(landingSpeed)+'',842,376,20,landingSpeed>75?'#b65343':'#286b76','center');txt('DESCENSO',842,393,8,'#6b8587','center');
  roundPanel(342,82,276,55,'#fffef8','#b9d8d4',9);txt('ALTITUD RESTANTE',480,102,9,'#6b8587','center');txt(Math.max(0,Math.round(landingAltitude))+' m',480,126,17,'#286b76','center');
  const shipY=165+(460-landingAltitude)*.34;ctx.save();ctx.translate(0,Math.min(150,shipY-165));drawRocketProfile(480,320,rocketProfile);if(landingThrottle){setFrogMood('nervous',.35);ctx.fillStyle='#f3a34b';ctx.beginPath();ctx.moveTo(468,316);ctx.lineTo(480,355+Math.sin(clock*22)*5);ctx.lineTo(492,316);ctx.closePath();ctx.fill();}ctx.restore();
  roundPanel(220,165,180,190,'#fffef8','#b9d8d4',10);txt('CONTROLES',310,190,11,'#397d6c','center');roundPanel(245,220,130,60,'#e4f5ed','#8dc7ae',8);txt('␣  FRENAR',310,256,15,'#286b62','center');txt('Mantén ESPACIO',310,299,9,'#a16a37','center');
  drawFrog(660,405,0.55);
  roundPanel(205,505,550,27,'#fffdf5','#b9d8d4',8);txt(landingStatus==='crashed'?'GAME OVER · PULSA R PARA REINTENTAR':landingMessage,480,523,9,landingStatus==='crashed'?'#a34c43':'#426879','center');
  if(landingStatus==='crashed'){roundPanel(365,365,230,88,'#fff4ed','#d89b81',10);txt('GAME OVER',480,397,19,'#a34c43','center');txt('Pulsa R para volver a intentar',480,426,10,'#875e52','center');}
}
function victoryScene(){
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#d8eff4');g.addColorStop(.56,'#eff8ef');g.addColorStop(1,'#d4eadb');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // Celebratory confetti and soft orbital backdrop
  for(let i=0;i<48;i++){
    const x=(i*137+clock*13)%W;
    const y=(i*71+Math.sin(clock*1.5+i)*9)%470;
    const colors=['#e7bd50','#66bfa4','#72b9d5','#f19a8e','#ffffff'];
    rect(x,y,5,8,colors[i%colors.length]);
  }
  planet(830,130,70,'#a9d8e8');planet(830,130,55,'#bce6ec');
  ctx.strokeStyle='#9fcbd0';ctx.lineWidth=6;ctx.beginPath();ctx.arc(830,130,83,0,Math.PI*2);ctx.stroke();

  roundPanel(28,15,904,66,'#fffdf5','#b9d8d4',14);
  txt('¡CAMPAÑA COMPLETADA!',480,47,25,'#397d65','center');
  txt('MISIÓN CUMPLIDA · REGRESO SEGURO A LA TIERRA',480,68,10,'#527986','center');

  // Celebration platform
  rect(0,458,W,82,'#e4f0e9');rect(0,458,W,5,'#a7c9b9');
  for(let x=0;x<W;x+=52){rect(x,515,25,7,'#e9c85f');}

  // Flyn celebrates next to the certificate
  setFrogMood('proud',10);drawFrog(315,430,0.9);
  roundPanel(110,455,410,30,'#fffdf5','#c1d9ce',9);
  txt('¡Flyn celebra tu gran aterrizaje!',315,475,11,'#397d65','center');

  // Certificate card
  roundPanel(475,130,410,330,'#fffdf4','#d9b75b',16);
  roundPanel(490,145,380,300,'#fffef9','#e8d69b',11);
  // ornamental corners
  for(const [x,y] of [[510,165],[850,165],[510,420],[850,420]]){
    rect(x,y,14,4,'#d4aa44');rect(x,y,4,14,'#d4aa44');
  }
  txt('CERTIFICADO',680,190,12,'#9a792d','center');
  txt('DE EXPLORADOR ESPACIAL',680,218,17,'#245b70','center');
  rect(555,231,250,3,'#e3c66d');
  txt('Se reconoce tu habilidad para:',680,260,10,'#5a7377','center');
  txt('DISEÑAR · EXPERIMENTAR · ATERRIZAR',680,286,11,'#397d65','center');
  wrapText('Completaste las tres misiones de Villa Anura y lograste un regreso seguro a la Tierra.',680,315,315,16,'#4b6872','center');
  txt('MISIÓN 1  ✓     MISIÓN 2  ✓     MISIÓN 3  ✓',680,375,9,'#548477','center');
  txt('VILLA ANURA · ACADEMIA DE EXPLORACIÓN',680,424,8,'#9a792d','center');

  // Gold medal and ribbon laid over the lower-right corner of the certificate
  ctx.fillStyle='#4d91b6';ctx.beginPath();ctx.moveTo(770,350);ctx.lineTo(795,350);ctx.lineTo(786,390);ctx.lineTo(768,390);ctx.closePath();ctx.fill();
  ctx.fillStyle='#e77770';ctx.beginPath();ctx.moveTo(795,350);ctx.lineTo(820,350);ctx.lineTo(815,390);ctx.lineTo(793,390);ctx.closePath();ctx.fill();
  ctx.fillStyle='#f0c64e';ctx.beginPath();ctx.arc(795,400,36,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#b8872e';ctx.lineWidth=4;ctx.stroke();
  ctx.fillStyle='#fff3bc';ctx.beginPath();ctx.arc(795,400,26,0,Math.PI*2);ctx.fill();
  txt('★',795,410,29,'#b9892e','center');

  // Reward summary
  roundPanel(42,95,185,116,'#fffef8','#b8d8d0',11);
  txt('RECOMPENSAS',134,120,10,'#397d65','center');
  txt('★  +3 ESTRELLAS',134,151,12,'#a47727','center');
  txt('🎟  +5 TICKETS',134,177,11,'#477b85','center');
  txt('★  MEDALLA DE ORO',134,197,9,'#a47727','center');

  roundPanel(350,495,260,36,'#15516e','#58c9cf',9);
  txt('VOLVER AL INICIO',480,518,11,'#ffffff','center');
}
function drawLanguageControl(){
  roundPanel(790,10,84,38,'#fffdf5','#9fcfc0',10);
  txt(gameLanguage==='en-US'?'🌐 EN-US':'🌐 ES',832,35,10,'#397d65','center');
}
function drawAudioControl(){
  roundPanel(885,10,58,38,audio.enabled?'#fffdf5':'#e8eded',audio.enabled?'#9fcfc0':'#b8c8c8',10);
  txt(audio.enabled?'♫  ON':'♪  OFF',914,35,10,audio.enabled?'#397d65':'#7b8d8d','center');
}
function draw(){
 ctx.clearRect(0,0,W,H);
 if(mode==='title')titleScreen();
 else if(mode==='hangar')controlRoom();
 else if(mode==='launch')launchScene();
 else if(mode==='launchSuccess')launchSuccessScene();
 else if(mode==='botany')botanyScene();
 else if(mode==='landing')landingScene();
 else if(mode==='victory')victoryScene();
 else if(mode==='budgetFailed'){background();roundPanel(180,150,600,230,'#fff4ed','#d89b81',14);txt(tr('MISIÓN FALLIDA'),480,210,25,'#a34c43','center');wrapText(budgetFailureReason,480,260,500,18,'#875e52','center');txt(tr('PULSA R PARA VOLVER AL MENÚ DE INICIO'),480,330,13,'#15516e','center');}
 else if(mode==='flyby')flybyScene();
 else if(mode==='complete')completeScene();
 else if(mode==='missed'){flybyScene();roundPanel(280,205,400,115,'#fffef5','#c6e3d7',10);txt('¡EL COMETA YA PASÓ!',480,245,20,'#a66d4d','center');txt('Pulsa R para intentarlo otra vez.',480,277,13,'#547a82','center');}
 drawLanguageControl();drawAudioControl();
}
function startGame(){if(mode!=='title')return;setFrogMood('neutral',0);budgetFailureReason='';mode='hangar';missionIndex=0;missionBudget=INITIAL_MISSION_BUDGET;mdlHints=3;selectedResources={};activeCategory=null;say('¡Hola! Soy Flyn. Esta es nuestra misión de exploración espacial. Completa las tres misiones y administra el presupuesto inicial de 5.000 créditos.');audio.start();audio.playMusic();canvas.focus();}
function keyDown(e){
 idleMoodClock=0;
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code))e.preventDefault();
 keys[e.code]=true;if(e.repeat)return;
 if(e.code==='KeyM'){audio.toggle();return;}
 if(mode==='budgetFailed'&&e.code==='KeyR'){mode='title';budgetFailureReason='';missionBudget=INITIAL_MISSION_BUDGET;selectedResources={};activeCategory=null;setFrogMood('neutral',0);return;}
 if(mode==='title'&&(e.code==='Enter'||e.code==='NumpadEnter')){e.preventDefault();startGame();return;}
 if(mode==='botany'){
   if(e.code==='Escape'){botanyActiveInput=null;return;}
   if(e.code==='Backspace'||e.code==='Delete')e.preventDefault();
   const digit=(e.code==='Digit0'||e.code==='Numpad0')?0:(e.code==='Digit1'||e.code==='Numpad1')?1:null;
   if((digit===0||digit===1)&&botanyActiveInput){botanyFactors[botanyActiveInput]=digit;botanyResult=null;botanyNotice='Valor registrado. Completa las otras casillas y consulta el resultado.';setFrogMood('happy');audio.data();}
   else if((e.code==='Backspace'||e.code==='Delete')&&botanyActiveInput){botanyFactors[botanyActiveInput]=null;botanyResult=null;botanyNotice='Casilla vacía. Escribe 0 o 1.';}
   else if(e.code==='Tab'){const order=['water','uv','co2'];botanyActiveInput=order[(order.indexOf(botanyActiveInput)+1)%3];e.preventDefault();}
   return;
 }
 if(mode==='victory'){if(e.code==='Enter'||e.code==='NumpadEnter')mode='title';return;}
 if(mode==='landing'){if(e.code==='KeyR'&&landingStatus==='crashed'){beginLandingMission();audio.start();}return;}
 if(mode==='hangar'){
   if(chosenAllResources()&&(e.code==='Enter'||e.code==='NumpadEnter')){mode='launch';launchTimer=0;activeCategory=null;utilityPanel=null;audio.launch();return;}
   if(activeCategory&&/^Digit[1-8]$/.test(e.code)){const cat=resourceCategories.find(v=>v.id===activeCategory),choice=Number(e.code.slice(-1))-1,opt=cat.options[choice];if(opt)chooseResource(cat,choice,opt);}
   if(e.code==='Escape'){activeCategory=null;utilityPanel=null;}return;
 }
 if(mode==='complete'){
   if(!challengeCorrect&&(e.code==='KeyA'||e.code==='Digit1'||e.code==='KeyB'||e.code==='Digit2')){
     const q=missionChallenges[missionIndex],choice=(e.code==='KeyA'||e.code==='Digit1')?0:1;
     challengeAnswered=true;challengeCorrect=choice===q.correct;challengeFeedback=challengeCorrect?q.why:'No es la mejor decisión. Revisa el objetivo de la misión e inténtalo otra vez.';
     setFrogMood(challengeCorrect?'excited':'confused');
     if(challengeCorrect){setFrogMood('proud',4);audio.win();if(!completedMissions.includes(missionIndex)){earnedStars+=2;completedMissions.push(missionIndex);setFrogMood('love',4);saveProgress();}}else{setFrogMood('angry');audio.data();}return;
   }
   if(challengeCorrect&&(e.code==='Enter'||e.code==='NumpadEnter')){if(missionIndex===1){beginLandingMission();return;}if(missionIndex===2){mode='title';return;}}
 }
}
function chooseResource(cat,choice,opt){
 const previous=selectedResources[cat.id],projected=totalMass()-(previous?previous.mass:0)+opt[2];
 if(missionBudget+(previous?previous.cost:0)<opt[1]){
   missionBudget=0;budgetFailureReason='¡Agotaste todo el presupuesto! La misión ha fallado.';setFrogMood('sad',5);mode='budgetFailed';audio.bump();return;
 }
 if(projected>missionBriefs[0].limit){notify('La masa superaría el límite de 12.5 kg. Elige una opción más ligera.');setFrogMood('nervous');return;}
 if(previous)missionBudget+=previous.cost;
 missionBudget-=opt[1];selectedResources[cat.id]={label:opt[0],cost:opt[1],mass:opt[2]};
 if(cat.id==='aero')rocketProfile=choice;
 activeCategory=null;actionAnimation=1.8;actionLabel='FLYN ESTÁ INSTALANDO: '+cat.name;setFrogMood(cat.id==='aero'?'mischievous':'happy');say('¡Recurso instalado!');audio.confirm();
}
function loop(now){
 const dt=Math.min(.035,(now-last)/1000||0);last=now;clock+=dt;if((mode==='title'||mode==='hangar')&&frogMood==='neutral'){idleMoodClock+=dt;if(idleMoodClock>12){setFrogMood('sleepy',2.4);idleMoodClock=0;}}
 if(mode==='launch'){launchTimer+=dt;if(launchTimer>3.2){mode='launchSuccess';launchTimer=0;audio.confirm();}}
 if(mode==='launchSuccess'){launchTimer+=dt;if(launchTimer>2.6){missionIndex=1;mode='botany';botanyFactors={water:null,uv:null,co2:null};botanyActiveInput=null;botanyTested=new Set();botanyResult=null;botanyNotice='Selecciona 0 o 1 en las tres casillas y consulta el resultado.';say('¡Todo en orden! La nave está lista. Podemos avanzar con la misión 2.');}}
 if(dialogueTimer>0)dialogueTimer-=dt;if(messageTimer>0)messageTimer-=dt;if(actionAnimation>0)actionAnimation=Math.max(0,actionAnimation-dt);if(mode==='flyby')updateFlyby(dt);if(mode==='landing')updateLanding(dt);if(frogMoodTimer>0){frogMoodTimer-=dt;if(frogMoodTimer<=0)frogMood='neutral';}draw();requestAnimationFrame(loop);
}


canvas.tabIndex=0;canvas.style.cursor='pointer';
document.addEventListener('keydown',keyDown);
document.addEventListener('keyup',e=>keys[e.code]=false);
window.addEventListener('blur',()=>Object.keys(keys).forEach(k=>keys[k]=false));
canvas.addEventListener('pointerdown',()=>canvas.focus());
canvas.addEventListener('click',(e)=>{
 idleMoodClock=0;canvas.focus();const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;
 if(x>=790&&x<=874&&y>=10&&y<=48){setGameLanguage(gameLanguage==='en-US'?'es':'en-US');return;}
 if(x>=885&&x<=943&&y>=10&&y<=48){audio.toggle();return;}
 if(mode==='title'){startGame();return;}
 if(mode==='budgetFailed')return;
 if(mode==='hangar'){
   if(utilityPanel){if(x<290||x>670||y<145||y>355)utilityPanel=null;return;}
   if(x>=38&&x<=188&&y>=70&&y<=112){utilityPanel='budget';audio.data();return;}
   if(x>=198&&x<=348&&y>=70&&y<=112){utilityPanel='mass';audio.data();return;}
   if(x>=810&&x<=932&&y>=70&&y<=118){if(!activeCategory){notify('Abre primero una categoría para recibir una pista.');return;}if(mdlHints<=0){notify('No quedan pistas disponibles.');return;}mdlHints--;setFrogMood('surprised');const cat=resourceCategories.find(v=>v.id===activeCategory);hintMessage=({fuel:'Compara la autonomía que necesitas con el peso y el presupuesto: no siempre hace falta la opción mayor.',oxygen:'Elige una reserva que cubra la duración de la misión sin cargar oxígeno innecesario.',aero:'El perfil aerodinámico modifica el consumo durante el vuelo. Compara las cuatro formas antes de elegir.',safety:'Piensa en el riesgo principal de esta misión y elige la protección adecuada.',materials:'Lleva los materiales necesarios para cumplir el objetivo, evitando añadir masa sin utilidad.',technology:'Prioriza la tecnología que permita cumplir el objetivo científico y enviar los datos.'})[cat.id];utilityPanel='hint';audio.data();return;}
   if(chosenAllResources()&&x>=75&&x<=885&&y>=408&&y<=440){mode='launch';launchTimer=0;activeCategory=null;utilityPanel=null;audio.launch();return;}
   if(activeCategory){const cat=resourceCategories.find(v=>v.id===activeCategory),rowH=Math.min(37,190/cat.options.length);if(x>=508&&x<=908&&y>=207&&y<207+cat.options.length*rowH){const choice=Math.max(0,Math.min(cat.options.length-1,Math.floor((y-207)/rowH)));chooseResource(cat,choice,cat.options[choice]);return;}if(x<500||x>920||y<135||y>425)activeCategory=null;return;}
   const bx=28,by=451,bw=146,gap=7;if(y>=by&&y<=by+66){const i=Math.floor((x-bx)/(bw+gap));if(i>=0&&i<6){activeCategory=resourceCategories[i].id;setFrogMood(i===0?'mischievous':'confused');audio.select();return;}}
   return;
 }
 if(mode==='victory'){if(x>=350&&x<=610&&y>=495&&y<=531){mode='title';audio.select();}return;}
 if(mode==='landing'&&landingStatus==='crashed'){beginLandingMission();audio.start();return;}
 if(mode==='botany'){
   if(botanyResult&&x>=755&&x<=915&&y>=478&&y<=513){beginLandingMission();audio.confirm();return;}
   if(y>=255&&y<=325){if(x>=320&&x<=440){botanyActiveInput='water';botanyNotice='Casilla Agua seleccionada. Escribe 0 o 1.';audio.select();return;}if(x>=530&&x<=650){botanyActiveInput='uv';botanyNotice='Casilla Radiación UV seleccionada. Escribe 0 o 1.';audio.select();return;}if(x>=740&&x<=860){botanyActiveInput='co2';botanyNotice='Casilla CO₂ seleccionada. Escribe 0 o 1.';audio.select();return;}}
   if(x>=480&&x<=706&&y>=378&&y<=407){if(Object.values(botanyFactors).some(v=>v===null)){botanyNotice='Completa las tres casillas: escribe 0 o 1 en cada una.';return;}const key=botanyKey();if(key==='000'){botanyNotice='La combinación 000 no está incluida en el Excel. Prueba otra combinación.';botanyResult=null;setFrogMood('angry');return;}const result=botanyExperiments[key];if(!result){botanyNotice='Esta combinación no está incluida en los siete resultados del Excel.';return;}botanyTested.add(key);botanyResult=result;botanyNotice='Experimento ejecutado.';botanyActiveInput=null;setFrogMood('surprised');audio.experiment();return;}
   return;
 }
 if(mode==='complete'&&!challengeCorrect){const choice=y>=251&&y<=299?0:y>=310&&y<=358?1:-1;if(choice>=0){const q=missionChallenges[missionIndex];challengeCorrect=choice===q.correct;challengeFeedback=challengeCorrect?q.why:'No es la mejor decisión. Revisa el objetivo e inténtalo otra vez.';setFrogMood(challengeCorrect?'excited':'angry');if(challengeCorrect){audio.win();if(!completedMissions.includes(missionIndex)){earnedStars+=2;completedMissions.push(missionIndex);setFrogMood('love',4);saveProgress();}}else audio.data();}}
});
requestAnimationFrame(loop);
