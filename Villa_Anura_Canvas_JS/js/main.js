import { Progress } from './progress.js';
import { AudioManager } from './audio.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const W = 960, H = 540;
const progress = new Progress();
const audio = new AudioManager();

const player = { x: 118, y: 420, w: 34, h: 42, vx: 0, vy: 0, grounded: true, facing: 1, anim: 0 };
const keys = {};
let mode = 'title', clock = 0, last = 0, dialogue = '', dialogueTimer = 0;
let installed = new Set(), missionPhase = 0, cometX = 1030, observationWindow = 0, dataSaved = false, dataSent = false;
const missionNames = ['SOBREVUELO','ORBITADOR','SONDA ATMOSFÉRICA','ATERRIZADOR','ROVER EXPLORADOR','RETORNO DE MUESTRAS'];
let missionIndex = 0, challengeAnswered = false, challengeFeedback = '', challengeCorrect = false;
let missionBudget=5000, mdlHints=3, activeCategory=null, selectedResources={}, actionAnimation=0, actionLabel='', utilityPanel=null, hintMessage='', launchTimer=0;
let botanyFactors={water:null,uv:null,co2:null}, botanyActiveInput=null, botanyTested=new Set(), botanyResult=null, botanyNotice='Selecciona 0 o 1 en cada casilla.';
const missionBriefs=[
{title:'DISEÑO Y PUESTA EN ÓRBITA',objective:'Prepara una nave equilibrada y lista para el lanzamiento.',limit:12.5},
{title:'BOTÁNICA EN MICROGRAVEDAD',objective:'Investiga cómo se comportan las plantas al combinar agua, radiación UV y CO₂.',limit:11.5},
{title:'ORBITADOR',objective:'Configura la nave para entrar en órbita y estudiar un planeta.',limit:12},
{title:'SONDA ATMOSFÉRICA',objective:'Protege la sonda y prepara sus instrumentos para medir la atmósfera.',limit:11},
{title:'ATERRIZADOR Y ROVER',objective:'Prepara un aterrizaje seguro y la exploración de la superficie.',limit:12},
{title:'RETORNO DE MUESTRAS',objective:'Prepara la recolección, conservación y retorno de una muestra.',limit:13}
];
const missionChallenges=[
{q:'¿Qué debes comprobar antes de autorizar el lanzamiento?',a:'Que la nave cumpla los límites de masa y tenga sus sistemas preparados',b:'Que la nave lleve la mayor cantidad posible de recursos',correct:0,why:'¡Correcto! Antes del lanzamiento se verifican la configuración, los sistemas y los límites de masa.'},
{q:'En microgravedad, ¿qué debes considerar al estudiar el crecimiento de una planta?',a:'Observar cómo cambian germinación y orientación al variar las condiciones',b:'Suponer que todas las plantas crecen igual que en la Tierra',correct:0,why:'¡Correcto! El experimento permite comparar resultados de germinación, orientación y condiciones ambientales.'},
{q:'La nave se acerca al planeta demasiado rápido. ¿Qué maniobra necesita para entrar en órbita?',a:'Reducir su velocidad mediante propulsión',b:'Acelerar hacia el planeta sin corregir la trayectoria',correct:0,why:'¡Bien pensado! La inserción orbital requiere ajustar la velocidad y la trayectoria.'},
{q:'La sonda entra en una atmósfera muy caliente. ¿Qué sistema es esencial?',a:'Un panel solar más grande',b:'Un escudo térmico adecuado',correct:1,why:'¡Exacto! El escudo térmico protege la sonda del calentamiento durante la entrada.'},
{q:'El terreno tiene rocas y pendientes. ¿Dónde conviene aterrizar?',a:'En una zona relativamente plana y despejada',b:'En la pendiente más pronunciada',correct:0,why:'¡Correcto! Una zona plana reduce el riesgo de vuelco y daños en el aterrizador.'},
{q:'¿Cómo debes conservar una muestra durante el viaje de regreso?',a:'Dejarla expuesta para ahorrar peso',b:'Sellarla en un contenedor que evite contaminación',correct:1,why:'¡Excelente! El sellado protege la muestra y evita que se contamine durante el retorno.'}
];
let earnedStars=Number(localStorage.getItem('villaAnuraStars')||0);
let completedMissions=JSON.parse(localStorage.getItem('villaAnuraCompleted')||'[]');
function saveProgress(){localStorage.setItem('villaAnuraStars',String(earnedStars));localStorage.setItem('villaAnuraCompleted',JSON.stringify(completedMissions));}

const resourceCategories=[{id:'fuel',name:'COMBUSTIBLE',icon:'⛽',options:[['1 galón',500,1.2],['2 galones',900,2.1],['3 galones',1500,3.2]]},{id:'oxygen',name:'OXÍGENO',icon:'◉',options:[['Reserva básica',400,0.8],['Reserva estándar',750,1.4],['Reserva extendida',1200,2.2]]},{id:'aero',name:'AERODINÁMICA',icon:'✈',options:[['Elíptica · 11 unidades/s',100,0],['Cónica · 10 unidades/s',250,0],['Ojival · 9,5 unidades/s',500,0],['Von Kármán · 9 unidades/s',900,0]]},{id:'safety',name:'SEGURIDAD',icon:'🛡',options:[['Protección básica',500,0.7],['Protección reforzada',950,1.5],['Sistema redundante',1400,2.3]]},{id:'materials',name:'MATERIALES',icon:'▣',options:[['Kit ligero',350,0.6],['Kit científico',700,1.3],['Kit avanzado',1100,2.0]]},{id:'technology',name:'TECNOLOGÍA',icon:'⌘',options:[['Sistema básico',500,0.5],['Sistema mejorado',900,1.0],['Sistema avanzado',1350,1.7]]}];
let particles = [], pulse = 0, message = '', messageTimer = 0, jumpWasDown = false;
function totalMass(){return Object.values(selectedResources).reduce((sum,item)=>sum+(item.mass||0),0);}
function wrapText(value,x,y,maxWidth,lineHeight,color='#426879',align='center'){const words=String(value).split(' '),lines=[];let line='';ctx.font='bold 11px system-ui';for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;}if(line)lines.push(line);ctx.fillStyle=color;ctx.textAlign=align;lines.slice(0,3).forEach((row,i)=>ctx.fillText(row,x,y+i*lineHeight));ctx.textAlign='left';}
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
  // Laboratorio orbital: la misión ya está en el espacio.
  const sky=ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#d8edf5');sky.addColorStop(.55,'#eaf5f3');sky.addColorStop(1,'#d4e8e9');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  for(let i=0;i<68;i++){const sx=(i*137)%W,sy=(i*73)%H;rect(sx,sy,2+(i%4===0?1:0),2,'#ffffff');}
  planet(845,112,65,'#a9d7e7');planet(845,112,51,'#b9e3e9');
  ctx.strokeStyle='#9fc6cd';ctx.lineWidth=8;ctx.beginPath();ctx.arc(845,112,77,0,Math.PI*2);ctx.stroke();
  rect(0,0,W,12,'#b7d2d6');rect(0,12,W,4,'#e7f6f3');
  roundPanel(28,12,904,50,'#fffdf5','#b9d8d4',12);
  txt('VILLA ANURA · LABORATORIO ORBITAL',48,34,14,'#397d6c');
  txt('MISIÓN 2 · EXPERIMENTO DE BOTÁNICA EN AUSENCIA DE GRAVEDAD',48,52,10,'#426879');
  roundPanel(55,76,850,54,'#e8f5ef','#a9d2c4',10);
  txt('Completa las tres casillas escribiendo 0 o 1 en cada una.',480,99,13,'#285d60','center');
  txt('Agua · Radiación UV · CO₂',480,117,10,'#5c7d7b','center');

  // Flying acompaña al jugador desde la consola de la nave
  roundPanel(48,150,205,265,'#e5f1f0','#9dbfc2',12);
  txt('FLYING · OPERADORA',150,177,11,'#397d6c','center');
  roundPanel(70,192,161,78,'#164e70','#78b8bf',8);
  txt('SISTEMA',150,212,9,'#9de8df','center');
  txt('BOTÁNICO',150,232,14,'#ffffff','center');
  for(let i=0;i<4;i++)rect(94,246+i*5,35+i*10,2,'#6ed8d5');
  drawFrog(150,382,0.63);
  txt('Escribe 0 o 1',150,404,9,'#547782','center');

  // Tres campos de entrada vacíos, en una sola fila
  roundPanel(275,150,637,265,'#fffef8','#c8ded8',12);
  txt('CONFIGURACIÓN DE VARIABLES',593,185,13,'#397d6c','center');
  const fields=[['water','AGUA',380,320],['uv','RADIACIÓN UV',590,530],['co2','CO₂',800,740]];
  fields.forEach(([id,label,center,left])=>{
    txt(label,center,235,label==='RADIACIÓN UV'?11:13,'#31596a','center');
    const active=botanyActiveInput===id;
    roundPanel(left,255,120,70,active?'#f0fbf7':'#ffffff',active?'#299b82':'#9abfc0',8);
    txt(botanyFactors[id]===null?'':String(botanyFactors[id]),center,301,28,'#267f61','center');
    if(botanyFactors[id]===null)txt('0 o 1',center,301,12,'#a5b8b8','center');
    if(active)roundPanel(left+4,259,112,62,'#00000000','#55bda7',6);
  });
  txt('Haz clic en una casilla y escribe 0 o 1.',593,348,10,'#66828a','center');
  txt('Usa Retroceso para borrar el valor de la casilla seleccionada.',593,365,9,'#82999a','center');
  roundPanel(480,378,226,29,'#15516e','#58c9cf',8);
  txt('CONSULTAR RESULTADO ▶',593,398,10,'#ffffff','center');

  // Resultado y referencia del Excel
  roundPanel(48,430,864,98,'#fffef8','#c8ded8',9);
  txt('RESULTADO DEL EXPERIMENTO',68,451,9,'#397d6c');
  if(botanyResult){
    txt('COMBINACIÓN '+botanyKey(),68,468,9,'#397d6c');
    wrapText(botanyResult.result,68,484,650,12,'#35596a','left');
    txt('Fuente: '+botanyResult.source,68,518,8,'#718b8c','left');
  }else{
    wrapText(botanyNotice,68,480,650,13,'#547782','left');
  }
  txt('PRUEBAS: '+botanyTested.size+'/7',842,451,9,'#397d6c','center');
  if(botanyTested.size===7){
    roundPanel(755,478,160,35,'#ffd13e','#e4b52e',8);
    txt('CONTINUAR ▶',835,501,10,'#754c24','center');
  }
}


const stations = [
  { id: 'camera', x: 170, icon: '📷', name: 'CÁMARA', desc: 'Captura imágenes científicas' },
  { id: 'antenna', x: 340, icon: '📡', name: 'ANTENA', desc: 'Envía información a la Tierra' },
  { id: 'solar', x: 620, icon: '☀', name: 'ENERGÍA', desc: 'Alimenta los sistemas de la nave' },
  { id: 'memory', x: 790, icon: '💾', name: 'MEMORIA', desc: 'Guarda las imágenes capturadas' }
];

function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function txt(value,x,y,size=14,color='#36576a',align='left'){ctx.fillStyle=color;ctx.font='bold '+size+'px system-ui';ctx.textAlign=align;ctx.fillText(value,x,y);ctx.textAlign='left';}
function panel(x,y,w,h,fill='#fffdf5',stroke='#cfe4d8'){rect(x,y,w,h,fill);rect(x,y,w,3,stroke);rect(x,y+h-3,w,3,stroke);rect(x,y,3,h,stroke);rect(x+w-3,y,3,h,stroke);}
function roundPanel(x,y,w,h,fill='#fffdf5',stroke='#cfe4d8',r=10){ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();ctx.stroke();}
function say(t){dialogue=t;dialogueTimer=3.8;}
function notify(t){message=t;messageTimer=2.2;}
function planet(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffffff45';ctx.beginPath();ctx.ellipse(x-r*.2,y-r*.25,r*.55,r*.17,-.4,0,Math.PI*2);ctx.fill();}
function stars(){for(let i=0;i<50;i++){const x=(i*191-clock*(i%3+1)*5)%W;const y=(i*79)%300;rect((x+W)%W,y,2+(i%3===0?1:0),2,'#ffffffaa');}}
function drawFrog(x,y,scale=1){
  ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(scale,scale);
  const airborne=!player.grounded,hop=airborne?Math.min(5,Math.abs(player.vy)*.008):Math.sin(player.anim*4)*1.2,step=airborne?-hop:0;
  const blink=Math.sin(clock*1.7)>0.985;
  // sombra
  ctx.globalAlpha=.18;ctx.fillStyle='#173b38';ctx.beginPath();ctx.ellipse(0,1,airborne?31:39,airborne?5:8,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  // patas traseras anchas
  rect(-36,-18+step,18,13,'#087d32');rect(-43,-13+step,18,9,'#39b923');rect(20,-18-step,18,13,'#087d32');rect(26,-13-step,18,9,'#39b923');
  rect(-39,-8+step,23,7,'#050d0b');rect(19,-8-step,23,7,'#050d0b');
  // cuerpo verde y vientre crema, sin ropa ni accesorios
  rect(-25,-48,50,37,'#050d0b');rect(-22,-46,44,34,'#168b26');rect(-18,-42,36,27,'#43bd27');
  rect(-16,-29,32,18,'#050d0b');rect(-13,-28,26,16,'#f0df8a');rect(-10,-24,20,11,'#f7e9a4');
  // brazos/patitas delanteras
  rect(-31,-42,13,31,'#050d0b');rect(-28,-40,12,27,'#15932b');rect(-25,-35,9,22,'#55c92c');
  rect(18,-42,13,31,'#050d0b');rect(16,-40,12,27,'#15932b');rect(16,-35,9,22,'#55c92c');
  // cabeza ancha con contorno pixelado
  rect(-35,-91,70,55,'#050d0b');rect(-39,-81,8,31,'#050d0b');rect(31,-81,8,31,'#050d0b');
  rect(-32,-88,64,49,'#15962b');rect(-35,-78,70,30,'#15962b');rect(-30,-84,60,42,'#4bc52b');
  // ojos elevados y grandes
  rect(-31,-105,26,28,'#050d0b');rect(5,-105,26,28,'#050d0b');
  rect(-28,-102,22,24,'#42c52b');rect(7,-102,22,24,'#42c52b');
  rect(-25,-98,17,18,'#f2d96e');rect(8,-98,17,18,'#f2d96e');
  rect(-20,-94,12,13,'#050d0b');rect(11,-94,12,13,'#050d0b');
  if(blink){rect(-19,-87,10,3,'#ffffff');rect(12,-87,10,3,'#ffffff');}
  else{rect(-18,-96,8,9,'#ffffff');rect(13,-96,8,9,'#ffffff');rect(-15,-93,5,7,'#050d0b');rect(16,-93,5,7,'#050d0b');}
  // hocico, mejillas y sonrisa
  rect(-9,-76,5,4,'#147d24');rect(5,-76,5,4,'#147d24');
  rect(-27,-67,9,7,'#f18b83');rect(18,-67,9,7,'#f18b83');
  rect(-12,-58,24,3,'#050d0b');rect(-7,-55,14,3,'#050d0b');
  // pequeños brillos y motas
  rect(-28,-82,5,5,'#9be94d');rect(23,-82,5,5,'#9be94d');rect(-18,-48,4,4,'#83e44b');rect(13,-45,4,4,'#83e44b');
  ctx.restore();
}
function background(){
  // Villa Anura: hangar pastel, luminoso y limpio, basado en la referencia aprobada
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#dff2ee');g.addColorStop(.64,'#f4f8ef');g.addColorStop(1,'#d7e9e4');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // ventanales panorámicos: exterior claro y estructura geométrica
  rect(0,54,W,300,'#f8fcfa');
  for(let x=0;x<=W;x+=120){rect(x,54,4,300,'#b9cfd2');}
  for(let y=56;y<=354;y+=82){rect(0,y,W,4,'#c5dadd');}
  // cielo suave y planeta a través del ventanal
  planet(842,138,54,'#a9d7e9');planet(842,138,43,'#b9e2ed');
  // cerchas superiores azul grisáceo
  rect(0,0,W,55,'#d9e8e9');rect(0,0,W,5,'#c0d5d9');
  for(let x=-35;x<W;x+=145){ctx.strokeStyle='#9fb6c0';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+82,54);ctx.moveTo(x+82,0);ctx.lineTo(x,54);ctx.stroke();}
  for(let x=72;x<W;x+=180){rect(x,53,3,16,'#a7bdc2');roundPanel(x-19,68,42,9,'#fff9dc','#d5e2d9',4);}
  // gran pórtico amarillo de ensamblaje, visible detrás de Flying
  rect(369,83,12,276,'#d9a63e');rect(579,83,12,276,'#d9a63e');rect(369,83,222,12,'#e6b84e');
  rect(390,95,9,250,'#efc85f');rect(560,95,9,250,'#efc85f');
  for(let y=128;y<350;y+=56){rect(380,y,190,5,'#e7bd58');}
  rect(470,69,28,11,'#e7b94b');rect(482,80,4,25,'#d39a36');
  // pantallas laterales de telemetría
  roundPanel(20,245,160,101,'#dce8eb','#a9c5cb',8);rect(37,258,130,61,'#164e70');
  for(let i=0;i<5;i++){rect(47+i*22,278,13,3,'#7ddbd7');rect(47+i*22,288,7,14,'#52b7bb');}
  roundPanel(766,250,150,96,'#dce8eb','#a9c5cb',8);rect(782,261,118,64,'#174d6c');planet(850,289,18,'#83cbd4');rect(818,315,64,3,'#79d4d5');
  // pequeños indicadores verdes en los extremos
  for(const x of [218,710]){rect(x,311,5,18,'#65b87e');rect(x+7,306,5,23,'#65b87e');rect(x+14,313,5,16,'#65b87e');}
  // suelo claro con perspectiva, líneas finas y franja de seguridad
  rect(0,360,W,180,'#e8f0ed');rect(0,359,W,5,'#9ebfba');
  for(let x=-80;x<=1040;x+=72){ctx.strokeStyle='#c4d8d4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(480,364);ctx.lineTo(x,540);ctx.stroke();}
  for(let y=395;y<540;y+=42){rect(0,y,W,2,'#cbdcd8');}
  rect(0,514,W,8,'#edc85d');for(let x=0;x<W;x+=34){rect(x,514,17,8,'#fff0bd');}
}
function drawRocket(){
  // nave de lanzamiento central, con detalles pixel-art y plataforma amarilla
  rect(426,190,108,164,'#9aabb8');rect(438,150,84,200,'#edf5f7');rect(446,140,68,205,'#ffffff');
  // hombros y punta de la nave
  ctx.fillStyle='#f9ffff';ctx.beginPath();ctx.moveTo(446,151);ctx.lineTo(480,104);ctx.lineTo(514,151);ctx.closePath();ctx.fill();ctx.strokeStyle='#8ba5b5';ctx.lineWidth=3;ctx.stroke();
  rect(456,104,48,9,'#e6edf0');rect(452,155,56,7,'#43b8a9');rect(452,238,56,7,'#43b8a9');rect(452,312,56,7,'#43b8a9');
  // ventanillas e insignias
  for(const y of [180,215,270]){roundPanel(467,y,26,23,'#d7edf5','#7b9aaa',5);planet(480,y+11,7,'#3f91c4');}
  rect(439,337,82,15,'#b9cbd3');rect(431,350,98,12,'#839aa8');
  // patas y soporte inferior
  rect(438,320,12,40,'#dce6e9');rect(510,320,12,40,'#dce6e9');
}
function controlRoom(){
  background();
  // Escenario principal: hangar y cohete, enmarcados como una pantalla de misión
  roundPanel(28,12,904,50,'#fffdf5','#b9d8d4',12);
  txt('VILLA ANURA  ·  CENTRO DE CONTROL',48,33,13,'#397d6c');
  txt('★ '+earnedStars+'  ESTRELLAS',690,42,11,'#a47727','right');
  txt('MISIÓN 1 / 1  ·  EXPLORACIÓN ESPACIAL',48,51,10,'#426879');
  txt('SECCIÓN '+(missionIndex+1)+' / 6  ·  '+missionBriefs[missionIndex].title,48,64,9,'#66828a');
  // Presupuesto y masa como controles visibles en la esquina izquierda
  roundPanel(38,70,150,42,'#fff0bd','#e4bd55',10);
  txt('$ '+missionBudget.toLocaleString('es-CO'),113,97,18,'#8b5b23','center');
  roundPanel(38,119,150,38,'#ffd13e','#e4b52e',10);
  txt('MASA  ·  '+totalMass().toFixed(1)+' kg',113,143,12,'#8b315f','center');
  // MDL es el botón de pistas
  roundPanel(810,70,122,48,'#ffd13e','#e4b52e',20);
  txt('MDL  '+mdlHints,871,100,17,'#8b315f','center');
  // Escena central contenida como pantalla de simulación
  roundPanel(54,75,852,326,'#f7fcfa','#9abdc0',14);
  ctx.save();ctx.beginPath();ctx.roundRect(60,81,840,314,10);ctx.clip();
  // fondo hangar y cohete a escala de escenario
  rect(60,81,840,314,'#e9f4f1');
  rect(60,81,840,36,'#d8e8e9');
  for(let x=60;x<900;x+=105)rect(x,117,3,235,'#c0d5d7');
  for(let y=117;y<360;y+=61)rect(60,y,840,3,'#c5dadd');
  // ventanal y planeta
  planet(795,167,43,'#b5dce8');
  // pórtico de ensamblaje
  rect(392,128,11,224,'#dba63c');rect(557,128,11,224,'#dba63c');rect(392,128,176,10,'#e8bd50');
  for(let y=164;y<335;y+=43)rect(403,y,154,5,'#e8bd50');
  // cohete principal
  rect(452,175,57,168,'#f8ffff');ctx.fillStyle='#ffffff';ctx.beginPath();ctx.moveTo(452,177);ctx.lineTo(480,137);ctx.lineTo(509,177);ctx.closePath();ctx.fill();rect(446,334,69,9,'#9fb4bb');rect(459,206,42,7,'#48b5aa');rect(459,271,42,7,'#48b5aa');
  roundPanel(469,222,22,22,'#d9edf4','#83aeb9',4);planet(480,233,6,'#4d9cc1');
  // consolas laterales
  roundPanel(78,230,145,83,'#dbe8ec','#a6c3ca',7);rect(89,241,123,61,'#124a6c');for(let i=0;i<4;i++){rect(100,253+i*10,55+(i%2)*25,3,'#56d7dc');}
  roundPanel(737,230,145,83,'#dbe8ec','#a6c3ca',7);rect(748,241,123,61,'#124a6c');planet(808,267,17,'#7dcbd5');rect(780,291,57,3,'#62d3d5');
  // Flying espera junto a su puesto; tras seleccionar recurso se desplaza visualmente al cohete
  const frogX=actionAnimation>0?480:270;
  drawFrog(frogX,actionAnimation>0?340:350,0.58);
  if(actionAnimation>0){roundPanel(335,356,290,28,'#fffdf4','#c5ded8',8);txt(actionLabel,480,375,10,'#397c68','center');}
  ctx.restore();
  // Controles superiores al frente de la pantalla: presupuesto, masa y pistas
  roundPanel(72,82,150,38,'#fff0bd','#e4bd55',10);txt('$ '+missionBudget.toLocaleString('es-CO'),147,107,16,'#8b5b23','center');
  roundPanel(230,82,150,38,'#ffd13e','#e4b52e',10);txt('MASA  '+totalMass().toFixed(1)+' / '+missionBriefs[missionIndex].limit+' kg',305,107,11,'#8b315f','center');
  roundPanel(780,82,122,42,'#ffd13e','#e4b52e',20);txt('MDL  '+mdlHints,841,109,16,'#8b315f','center');
  // Objetivo de la misión siempre visible en el escenario
  roundPanel(265,115,450,42,'#fffdf4','#c5ded8',8);
  txt(missionBriefs[missionIndex].objective,490,141,10,'#426879','center');
  // estado de recursos
  const chosen=Object.keys(selectedResources).length;
  roundPanel(75,408,810,32,'#fffdf5','#c8ded8',9);
  if(chosen===6){txt('¡LOS SEIS SISTEMAS ESTÁN LISTOS!',480,429,12,'#397d65','center');roundPanel(380,443,200,25,'#ffd13e','#e4b52e',9);txt('LANZAR MISIÓN  ▶',480,460,11,'#754c24','center');}
  else{txt('RECURSOS PREPARADOS  '+chosen+'/6',94,429,11,'#477b6c');txt('SALDO DISPONIBLE  $ '+missionBudget.toLocaleString('es-CO'),866,429,11,'#8b672e','right');}
  // seis botones inferiores
  const startX=58, gap=8, bw=134, by=451;
  resourceCategories.forEach((cat,i)=>{
    const x=startX+i*(bw+gap),active=activeCategory===cat.id,done=!!selectedResources[cat.id];
    roundPanel(x,by,bw,66,done?'#dff4e6':active?'#dff3f4':'#e7ebee',done?'#69b78a':active?'#4faeb2':'#bdcbd0',10);
    txt(cat.icon,x+17,by+27,19,done?'#34885e':'#35647a');
    txt(cat.name,x+42,by+27,9,'#31566a');
    txt(done?'✓ SELECCIONADO':'VER OPCIONES',x+bw/2,by+49,8,done?'#36875e':'#65818a','center');
  });
  // panel desplegable de opciones integrado en la misma pantalla
  if(activeCategory){
    const cat=resourceCategories.find(v=>v.id===activeCategory);
    roundPanel(245,125,470,252,'#fffef8','#6daeb4',13);
    roundPanel(263,140,434,39,'#15516e','#58c9cf',8);
    txt(cat.name+' · ELIGE UNA OPCIÓN',480,165,13,'#ffffff','center');
    txt('El costo se descuenta del presupuesto total de esta misión.',480,198,10,'#547782','center');
    cat.options.forEach((opt,i)=>{
      const yy=215+i*43,canPay=missionBudget>=opt[1];
      roundPanel(280,yy,400,35,canPay?'#edf8f5':'#f2eeee',canPay?'#9acbbd':'#d9c5c5',7);
      txt((i+1)+'. '+opt[0],296,yy+22,11,canPay?'#31596c':'#a18e8e');
      txt('SELECCIONAR',661,yy+22,9,canPay?'#397d65':'#a18e8e','right');
    });
    txt('Pulsa 1, 2 o 3 · ESC para cerrar',480,361,9,'#66828a','center');
  }
  if(messageTimer>0){roundPanel(330,388,300,26,'#fffef5','#c6e0d7',8);txt(message,480,406,10,'#3e8066','center');}
  if(utilityPanel){
    roundPanel(300,155,360,190,'#fffef8','#62aeb4',13);
    roundPanel(318,169,324,37,'#15516e','#58c9cf',8);
    txt(utilityPanel==='mass'?'CONTROL DE MASA':utilityPanel==='budget'?'PRESUPUESTO DE MISIÓN':'PISTA DE FLYING',480,193,13,'#ffffff','center');
    if(utilityPanel==='mass'){
      txt('MASA INSTALADA',480,235,11,'#66828a','center');
      txt(totalMass().toFixed(1)+' kg',480,269,24,'#397d65','center');
      txt('Suma de los recursos seleccionados',480,296,10,'#66828a','center');
    }else if(utilityPanel==='budget'){
      txt('SALDO DISPONIBLE',480,235,11,'#66828a','center');txt('$ '+missionBudget.toLocaleString('es-CO'),480,269,24,'#397d65','center');txt('Presupuesto restante para esta misión',480,296,10,'#66828a','center');
    }else{
      const hint=hintMessage||'Abre una categoría inferior y solicita una pista para recibir ayuda.';
      wrapText(hint,480,237,290,15,'#426879','center');
      txt('Pistas restantes: '+mdlHints,480,320,10,'#66828a','center');
    }
    txt('Pulsa ESC o haz clic fuera para cerrar',480,333,9,'#66828a','center');
  }
}
function hud(){roundPanel(18,14,210,43,'#fffdf5','#c8e3d8',8);txt('VILLA ANURA',32,32,11,'#58936d');txt('HANGAR ESPACIAL',32,48,10,'#456879');roundPanel(805,14,137,43,'#fffdf5','#c8e3d8',8);txt('🪰 '+progress.data.flies+'    🎟 '+progress.data.tickets,819,41,13,'#456879');}
function dialogBox(t){roundPanel(675,390,265,65,'#fffef8','#c9e4d7',9);txt('FLYING',690,411,10,'#65a078');txt(t.length>35?t.slice(0,34)+'…':t,690,435,11,'#456879');}
function titleScreen(){
  background();
  // composición de portada inspirada en la referencia: hangar completo y marca
  // logo superior izquierdo
  roundPanel(30,28,286,100,'#faffff','#18a8a7',15);txt('✦  VILLA',54,67,34,'#087d68');txt('ANURA 🚀',54,105,34,'#087d68');roundPanel(43,112,255,28,'#087b9a','#d6ffff',12);txt('SPACE MISSION ADVENTURE',170,131,11,'#ffffff','center');
  // cohete protagonista al fondo
  rect(410,94,12,255,'#dba32e');rect(538,94,12,255,'#dba32e');rect(410,94,140,9,'#e7b844');drawRocket();
  // consolas decorativas y mapa
  roundPanel(34,264,190,100,'#dfeaf0','#9ebbc7',8);rect(46,276,166,75,'#06436f');planet(92,312,25,'#50b6d0');for(let i=0;i<4;i++)rect(132,292+i*12,62,3,'#59dbe0');
  roundPanel(737,257,190,104,'#dfeaf0','#9ebbc7',8);rect(750,269,164,78,'#06436f');planet(826,307,26,'#64b9c8');for(let i=0;i<4;i++)rect(861,287+i*12,38,3,'#57d7df');
  // Flying en traje espacial, en el centro
  drawFrog(480,438,0.82);
  // mensaje de bienvenida
  roundPanel(620,347,302,91,'#fffdf2','#1b7895',10);txt('¡BIENVENIDO, EXPLORADOR!',638,371,12,'#153d62');txt('Soy Flying. Prepárate para diseñar',638,395,11,'#153d62');txt('y lanzar nuestras misiones espaciales.',638,414,11,'#153d62');
  // botón principal tipo pixel UI
  roundPanel(264,463,432,60,'#0b7890','#f5ffff',16);roundPanel(273,468,414,47,'#0c5f79','#59d7d0',12);txt('PRESIONA  ENTER  PARA JUGAR',480,499,17,'#ffffff','center');
  txt('VILLA ANURA v1.0',18,532,9,'#26445a');
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
  txt('¡SECCIÓN '+(missionIndex+1)+' COMPLETADA!',480,57,25,'#4c8668','center');
  roundPanel(185,105,590,330,'#fffef8','#9fcbd1',13);
  roundPanel(205,122,550,46,'#15516e','#58c9cf',9);
  txt('DESAFÍO DE LA SECCIÓN '+(missionIndex+1)+' / 6',480,151,15,'#ffffff','center');
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
    txt(missionIndex===5?'ENTER · FINALIZAR CAMPAÑA':'ENTER · SIGUIENTE MISIÓN',480,478,12,'#ffffff','center');
    roundPanel(330,449,300,48,'#15516e','#65d3cf',10);
  }else{roundPanel(330,449,300,48,'#15516e','#65d3cf',10);txt('PULSA A O B PARA RESPONDER',480,478,11,'#ffffff','center');}
}
function launchScene(){background();planet(760,170,62,'#b5dce8');roundPanel(60,55,840,410,'#eaf5f2','#9abdc0',16);for(let x=100;x<880;x+=100)rect(x,80,3,300,'#c0d5d7');for(let y=120;y<390;y+=65)rect(60,y,840,3,'#c5dadd');rect(410,350,140,14,'#e4bd55');rect(425,315,110,35,'#d7e5e7');const lift=Math.min(210,launchTimer*72);ctx.save();ctx.translate(0,-lift);rect(452,175,57,168,'#f8ffff');ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(452,177);ctx.lineTo(480,137);ctx.lineTo(509,177);ctx.closePath();ctx.fill();rect(459,206,42,7,'#48b5aa');rect(459,271,42,7,'#48b5aa');ctx.fillStyle='#f3a34b';ctx.beginPath();ctx.moveTo(462,344);ctx.lineTo(480,390+Math.sin(clock*18)*8);ctx.lineTo(498,344);ctx.closePath();ctx.fill();ctx.restore();drawFrog(480,390,0.55);txt('LANZAMIENTO DE MISIÓN',480,95,22,'#397d65','center');txt('¡Todos los sistemas preparados! Flying está despegando.',480,430,12,'#547a82','center');}
function draw(){ctx.clearRect(0,0,W,H);if(mode==='title')titleScreen();else if(mode==='hangar')controlRoom();else if(mode==='launch')launchScene();else if(mode==='botany')botanyScene();else if(mode==='flyby')flybyScene();else if(mode==='complete')completeScene();else if(mode==='missed'){flybyScene();roundPanel(280,205,400,115,'#fffef5','#c6e3d7',10);txt('¡EL COMETA YA PASÓ!',480,245,20,'#a66d4d','center');txt('Pulsa R para intentarlo otra vez.',480,277,13,'#547a82','center');}}
function startGame(){if(mode!=='title')return;mode='hangar';missionIndex=0;missionBudget=5000;mdlHints=3;selectedResources={};activeCategory=null;say('¡Hola! Soy Flying. Esta es nuestra misión de exploración espacial. Completa sus seis secciones administrando el presupuesto total.');audio.start();canvas.focus();}
function keyDown(e){
 if(['ArrowLeft','ArrowRight','ArrowUp',' ','Space'].includes(e.key))e.preventDefault();
 keys[e.code]=true;if(e.repeat)return;
 if(mode==='title'&&(e.code==='Enter'||e.code==='NumpadEnter')){e.preventDefault();startGame();return;}
 if(mode==='botany'){
   if(e.code==='Escape'){botanyActiveInput=null;return;}
   const digit=(e.code==='Digit0'||e.code==='Numpad0')?0:(e.code==='Digit1'||e.code==='Numpad1')?1:null;
   if((digit===0||digit===1)&&botanyActiveInput){
     botanyFactors[botanyActiveInput]=digit;
     botanyResult=null;
     botanyNotice='Valor registrado. Completa las otras casillas y consulta el resultado.';
     audio.data();
   }else if((e.code==='Backspace'||e.code==='Delete')&&botanyActiveInput){
     botanyFactors[botanyActiveInput]=null;botanyResult=null;
     botanyNotice='Casilla vacía. Escribe 0 o 1.';
   }else if(e.code==='Tab'){
     const order=['water','uv','co2'];
     const current=order.indexOf(botanyActiveInput);
     botanyActiveInput=order[(current+1)%order.length];
     e.preventDefault();
   }
   return;
 }
 if(mode==='hangar'){
   if(chosenAllResources()&&(e.code==='Enter'||e.code==='NumpadEnter')){mode='launch';launchTimer=0;activeCategory=null;utilityPanel=null;audio.start();return;}
   if(activeCategory&&['Digit1','Digit2','Digit3'].includes(e.code)){
     const cat=resourceCategories.find(v=>v.id===activeCategory),opt=cat.options[Number(e.code.slice(-1))-1];
     if(opt){const old=selectedResources[cat.id];const mass=totalMass()-(old?old.mass:0)+opt[2];if(missionBudget+(old?old.cost:0)<opt[1])notify('Presupuesto insuficiente.');else if(mass>missionBriefs[missionIndex].limit)notify('La masa supera el límite permitido.');else{if(old)missionBudget+=old.cost;missionBudget-=opt[1];selectedResources[cat.id]={label:opt[0],cost:opt[1],mass:opt[2]};activeCategory=null;actionAnimation=1.8;actionLabel='FLYING INSTALANDO RECURSOS';say('¡Selección confirmada!');audio.data();}}
   }else if(e.code==='Escape'){activeCategory=null;utilityPanel=null;}return;
 }
 if(mode==='missed'&&e.code==='KeyR'){mode='flyby';cometX=1050;observationWindow=0;missionPhase=0;resetPlayer();return;}
 if(mode==='complete'){
   if(!challengeCorrect&&(e.code==='KeyA'||e.code==='Digit1'||e.code==='KeyB'||e.code==='Digit2')){
     const q=missionChallenges[missionIndex],choice=(e.code==='KeyA'||e.code==='Digit1')?0:1;
     challengeAnswered=true;challengeCorrect=choice===q.correct;challengeFeedback=challengeCorrect?q.why:'No es la mejor decisión. Revisa el objetivo de la misión e inténtalo otra vez.';
     if(challengeCorrect){audio.win();if(!completedMissions.includes(missionIndex)){earnedStars+=2;completedMissions.push(missionIndex);saveProgress();}}else audio.data();return;
   }
   if(challengeCorrect&&(e.code==='Enter'||e.code==='NumpadEnter')){
     if(missionIndex<5){missionIndex++;selectedResources={};activeCategory=null;utilityPanel=null;challengeAnswered=false;challengeFeedback='';challengeCorrect=false;resetPlayer();if(missionIndex===1){mode='botany';botanyFactors={water:0,uv:0,co2:0};botanyTested=new Set();botanyResult=null;botanyNotice='Configura las variables con 0 o 1 y ejecuta la prueba.';say('¡Bienvenido al laboratorio! Configura agua, radiación UV y CO₂.');}else{mode='hangar';say('Continúa la misión 1: '+missionBriefs[missionIndex].objective);}audio.start();}
     else{mode='title';say('¡Has completado la misión de exploración espacial y sus seis secciones!');}
   }
 }
}
function loop(now){const dt=Math.min(.035,(now-last)/1000||0);last=now;clock+=dt;if(mode==='launch'){launchTimer+=dt;if(launchTimer>3.2){if(missionIndex===0||missionIndex===1){missionIndex=1;mode='botany';botanyFactors={water:null,uv:null,co2:null};botanyTested=new Set();botanyResult=null;botanyNotice='Selecciona 0 o 1 en las tres casillas y consulta el resultado.';say('¡Llegamos al espacio! Vamos a iniciar el experimento botánico.');}else{mode='complete';challengeAnswered=false;challengeFeedback='';challengeCorrect=false;}}}if(dialogueTimer>0)dialogueTimer-=dt;if(messageTimer>0)messageTimer-=dt;if(actionAnimation>0)actionAnimation=Math.max(0,actionAnimation-dt);if(mode==='flyby')updateFlyby(dt);draw();requestAnimationFrame(loop);}
canvas.tabIndex=0;canvas.style.cursor='pointer';document.addEventListener('keydown',keyDown);document.addEventListener('keyup',e=>keys[e.code]=false);window.addEventListener('blur',()=>Object.keys(keys).forEach(k=>keys[k]=false));canvas.addEventListener('pointerdown',()=>{canvas.focus();if(mode==='title')startGame();else if(mode==='complete')keyDown({key:'Enter',code:'Enter',repeat:false,preventDefault(){}});});canvas.addEventListener('click',(e)=>{
  canvas.focus();
  const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;
  if(mode==='title'){startGame();return;}
  if(mode==='hangar'){
    if(utilityPanel){if(x<290||x>670||y<145||y>355){utilityPanel=null;return;}return;}
    if(x>=72&&x<=222&&y>=82&&y<=120){utilityPanel='budget';audio.data();return;}
    if(x>=230&&x<=380&&y>=82&&y<=120){utilityPanel='mass';audio.data();return;}
    if(x>=780&&x<=902&&y>=82&&y<=124){
      if(!activeCategory){notify('Abre primero una categoría para recibir una pista.');return;}
      if(mdlHints<=0){notify('No quedan pistas disponibles.');return;}
      mdlHints--;const cat=resourceCategories.find(v=>v.id===activeCategory);
      hintMessage=({fuel:'Compara la autonomía que necesitas con el peso y el presupuesto: no siempre hace falta la opción mayor.',oxygen:'Elige una reserva que cubra la duración de la misión sin cargar oxígeno innecesario.',aero:'El perfil aerodinámico modifica el consumo durante el vuelo. Según el catálogo, la cónica es la referencia; compara las unidades por segundo antes de elegir.',safety:'Piensa en el riesgo principal de esta misión y elige la protección adecuada.',materials:'Lleva los materiales necesarios para cumplir el objetivo, evitando añadir masa sin utilidad.',technology:'Prioriza la tecnología que permita cumplir el objetivo científico y enviar los datos.'})[cat.id];
      utilityPanel='hint';audio.data();return;
    }
    if(chosenAllResources()&&x>=380&&x<=580&&y>=443&&y<=468){mode='launch';launchTimer=0;activeCategory=null;utilityPanel=null;audio.start();return;}
    if(activeCategory){
      const cat=resourceCategories.find(v=>v.id===activeCategory);
      if(x>=280&&x<=680&&y>=215&&y<=344){
        const choice=Math.max(0,Math.min(2,Math.floor((y-215)/43))),opt=cat.options[choice];
        if(missionBudget<opt[1]){notify('Presupuesto insuficiente. Elige otra opción.');return;}
        const previous=selectedResources[cat.id];const projectedMass=totalMass()-(previous?previous.mass:0)+opt[2];if(projectedMass>missionBriefs[missionIndex].limit){notify('La masa superaría el límite de '+missionBriefs[missionIndex].limit+' kg. Elige una opción más ligera.');return;}
        if(selectedResources[cat.id])missionBudget+=selectedResources[cat.id].cost;
        missionBudget-=opt[1];selectedResources[cat.id]={label:opt[0],cost:opt[1],mass:opt[2]};
        activeCategory=null;actionAnimation=1.8;actionLabel='FLYING ESTÁ INSTALANDO: '+cat.name;
        say('¡Recurso instalado!');audio.data();return;
      }
      if(x<245||x>715||y<125||y>377){activeCategory=null;return;}
      return;
    }
    const bx=58,by=451,bw=134,gap=8;
    if(y>=by&&y<=by+66){const i=Math.floor((x-bx)/(bw+gap));if(i>=0&&i<6){activeCategory=resourceCategories[i].id;audio.data();return;}}
    return;
  }

  if(mode==='botany'){
    if(botanyTested.size===7&&x>=755&&x<=915&&y>=478&&y<=513){mode='complete';challengeAnswered=false;challengeFeedback='';challengeCorrect=false;return;}
    if(y>=255&&y<=325){
      if(x>=320&&x<=440){botanyActiveInput='water';botanyNotice='Casilla Agua seleccionada. Escribe 0 o 1.';return;}
      if(x>=530&&x<=650){botanyActiveInput='uv';botanyNotice='Casilla Radiación UV seleccionada. Escribe 0 o 1.';return;}
      if(x>=740&&x<=860){botanyActiveInput='co2';botanyNotice='Casilla CO₂ seleccionada. Escribe 0 o 1.';return;}
    }
    if(x>=480&&x<=706&&y>=378&&y<=407){
      if(Object.values(botanyFactors).some(v=>v===null)){botanyNotice='Completa las tres casillas: escribe 0 o 1 en cada una.';return;}
      const key=botanyKey();
      if(key==='000'){botanyNotice='La combinación 000 no está incluida en el Excel. Prueba otra combinación.';botanyResult=null;return;}
      const result=botanyExperiments[key];
      if(!result){botanyNotice='Esta combinación no está incluida en los siete resultados del Excel.';return;}
      botanyTested.add(key);botanyResult=result;botanyNotice='Experimento ejecutado.';botanyActiveInput=null;audio.data();return;
    }
    return;
  }
  if(mode==='complete'&&!challengeCorrect){
    const choice=y>=251&&y<=299?0:y>=310&&y<=358?1:-1;
    if(choice>=0){const q=missionChallenges[missionIndex];challengeCorrect=choice===q.correct;challengeFeedback=challengeCorrect?q.why:'No es la mejor decisión. Revisa el objetivo e inténtalo otra vez.';if(challengeCorrect){audio.win();if(!completedMissions.includes(missionIndex)){earnedStars+=2;completedMissions.push(missionIndex);saveProgress();}}else audio.data();}
  }
});;requestAnimationFrame(loop);
