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
let missionIndex = 0;
let particles = [], pulse = 0, message = '', messageTimer = 0, jumpWasDown = false;

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
  const walking=Math.abs(player.vx)>5,step=walking?Math.sin(player.anim*13)*3:0;
  const blink=Math.sin(clock*1.7)>0.985;
  // sombra
  ctx.globalAlpha=.18;ctx.fillStyle='#173b38';ctx.beginPath();ctx.ellipse(0,1,39,8,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
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
  // pórtico, plataformas y barandillas de la instalación
  rect(335,118,12,245,'#d99f2d');rect(613,118,12,245,'#d99f2d');rect(335,118,290,10,'#e7b844');
  for(let y=153;y<345;y+=48){rect(347,y,266,5,'#e8b94f');rect(347,y,7,33,'#c18a32');rect(606,y,7,33,'#c18a32');}
  // plataforma principal de servicio
  rect(324,337,312,13,'#e6ae35');rect(343,350,14,15,'#c38a2e');rect(602,350,14,15,'#c38a2e');
  for(let x=350;x<610;x+=34){rect(x,339,5,9,'#fff0a6');}
  // escalera lateral
  ctx.strokeStyle='#d69b31';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(610,350);ctx.lineTo(657,414);ctx.stroke();
  for(let i=0;i<5;i++){let x=615+i*8,y=358+i*10;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+18,y+1);ctx.stroke();}
  drawRocket();
  // monitor mural izquierda: mapa terrestre y telemetría
  roundPanel(18,130,218,126,'#dce8ed','#8daab9',8);rect(30,142,194,101,'#073f70');planet(91,190,34,'#51b7d0');planet(91,190,27,'#63c58c');
  for(let i=0;i<5;i++){rect(139,160+i*14,70,4,'#39cbd5');rect(139,167+i*14,35+(i%3)*10,3,'#83e5db');}
  // monitor mural derecha: esquema de nave
  roundPanel(733,125,207,126,'#dce8ed','#8daab9',8);rect(746,138,181,100,'#073d6a');
  ctx.strokeStyle='#56e1ef';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(786,190);ctx.lineTo(850,163);ctx.lineTo(891,190);ctx.lineTo(850,214);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(850,163);ctx.lineTo(850,214);ctx.stroke();
  for(let i=0;i<4;i++)rect(761,151+i*14,18,3,'#4ed6e2');
  // side consoles and robotic arm
  roundPanel(24,274,185,69,'#e6eef0','#a8c0c8',7);rect(37,285,160,42,'#154c70');for(let i=0;i<5;i++){rect(48+i*27,299,16,3,'#56d5dc');rect(48+i*27,308,8,12,'#45aebd');}
  roundPanel(748,273,188,70,'#e6eef0','#a8c0c8',7);rect(761,285,162,44,'#154c70');planet(838,306,15,'#83d0d8');rect(808,324,62,3,'#55d7dc');
  // brazo robótico amarillo en el lateral derecho
  ctx.strokeStyle='#e4a82e';ctx.lineWidth=17;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(827,274);ctx.lineTo(866,236);ctx.lineTo(903,254);ctx.stroke();
  planet(866,236,10,'#f1c54e');planet(903,254,9,'#e4ad32');rect(900,249,24,8,'#344d60');
  // plantas decorativas y cajas técnicas
  roundPanel(226,320,38,34,'#f8ffff','#bdcfca',5);for(let i=0;i<5;i++)rect(235+i*4,297-(i%2)*7,4,25,'#4baf73');
  roundPanel(697,320,38,34,'#f8ffff','#bdcfca',5);for(let i=0;i<5;i++)rect(706+i*4,297-(i%2)*7,4,25,'#4baf73');
  // logo mural
  roundPanel(272,177,160,62,'#f9ffff','#c3d9df',6);planet(303,206,15,'#5ab6c6');txt('VILLA ANURA',326,204,13,'#1d617c');txt('CENTRO ESPACIAL',326,222,8,'#47798a');
  // encabezado y panel de misión
  roundPanel(14,12,260,48,'#fafdff','#b8d9df',8);txt('VILLA ANURA',29,33,15,'#177b70');txt('CENTRO DE CONTROL ESPACIAL',29,50,8,'#527e8d');
  roundPanel(14,75,265,74,'#f9ffff','#9fcbd1',10);txt('MISIÓN '+(missionIndex+1)+' / 6 · '+missionNames[missionIndex],29,99,11,'#155b79');txt('Prepara la nave para estudiar',29,119,11,'#243d64');txt('un cometa de cerca.',29,135,11,'#243d64');
  // HUD superior derecha
  roundPanel(790,12,156,45,'#f9ffff','#b8d9df',8);txt('★  0       🎟  0',807,41,16,'#155b79');
  // estaciones interactivas: consolas delante del hangar
  const cards=[{x:150,id:'camera',icon:'▦',label:'COMPONENTES'},{x:420,id:'antenna',icon:'✣',label:'DISEÑO DE NAVE'},{x:650,id:'solar',icon:'▶',label:'SIMULADOR'},{x:835,id:'memory',icon:'🚀',label:'LANZAMIENTO'}];
  cards.forEach((s)=>{const active=installed.has(s.id);roundPanel(s.x-48,382,96,65,active?'#dff6e9':'#f8ffff',active?'#65bb8a':'#9fc8d1',8);roundPanel(s.x-38,390,76,35,'#e5f7fb','#b7d8df',5);txt(s.icon,s.x,416,22,'#087b9a','center');roundPanel(s.x-52,448,104,22,'#15516e','#e2f8fa',5);txt(active?'LISTO':s.label,s.x,463,8,'#ffffff','center');if(Math.abs(player.x-s.x)<64){roundPanel(s.x-67,350,134,25,'#ffffff','#72c4ae',6);txt(active?'SISTEMA LISTO':'E · INTERACTUAR',s.x,367,9,'#287d66','center');}});
  // Flying protagonista en primer plano
  drawFrog(player.x,player.y,1.22);
  // controles inferiores estilo videojuego
  roundPanel(292,493,376,34,'#f8ffff','#b9d9e0',16);txt('← → MOVER     ESPACIO SALTAR     E INTERACTUAR',480,515,9,'#164f70','center');
  if(dialogueTimer>0)dialogBox(dialogue);
  if(messageTimer>0){roundPanel(332,455,296,30,'#fffef8','#b9dccd',8);txt(message,480,475,10,'#3e8066','center');}
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
  drawFrog(480,438,1.75);
  // mensaje de bienvenida
  roundPanel(620,347,302,91,'#fffdf2','#1b7895',10);txt('¡BIENVENIDO, EXPLORADOR!',638,371,12,'#153d62');txt('Soy Flying. Prepárate para diseñar',638,395,11,'#153d62');txt('y lanzar nuestras misiones espaciales.',638,414,11,'#153d62');
  // botón principal tipo pixel UI
  roundPanel(264,463,432,60,'#0b7890','#f5ffff',16);roundPanel(273,468,414,47,'#0c5f79','#59d7d0',12);txt('PRESIONA  ENTER  PARA JUGAR',480,499,17,'#ffffff','center');
  txt('VILLA ANURA v1.0',18,532,9,'#26445a');
}
function resetPlayer(){player.x=115;player.y=420;player.vx=0;player.vy=0;player.grounded=true;}
function updatePlayer(dt){const left=keys.ArrowLeft||keys.KeyA,right=keys.ArrowRight||keys.KeyD,jump=keys.Space||keys.ArrowUp||keys.KeyW;player.vx=((right?1:0)-(left?1:0))*210;if(player.vx)player.facing=Math.sign(player.vx);if(jump&&!jumpWasDown&&player.grounded){player.vy=-570;player.grounded=false;audio.jump();}jumpWasDown=!!jump;player.vy+=1450*dt;player.x=Math.max(32,Math.min(928,player.x+player.vx*dt));player.y+=player.vy*dt;if(player.y>=420){player.y=420;player.vy=0;player.grounded=true;}player.anim+=dt;}
function interactHangar(){const station=stations.find(s=>Math.abs(player.x-s.x)<62);if(!station){say('Acércate a una consola para instalar sus sistemas.');return;}if(installed.has(station.id)){say('Ese sistema ya está instalado. ¡Bien hecho!');return;}installed.add(station.id);audio.data();say(station.desc+' instalado.');if(installed.size===4){say('¡Todos los sistemas listos! Pulsa ENTER para despegar.');notify('NAVE PREPARADA');}}
function startMission(){if(installed.size<4){say('Aún faltan sistemas. Revisa las cuatro consolas.');return;}mode='flyby';missionPhase=0;cometX=1050;observationWindow=0;dataSaved=false;dataSent=false;resetPlayer();say('¡Despegue! El cometa se aproxima por la derecha.');audio.start();}
function flybyScene(){background();planet(135,140,58,'#b8d9d4');planet(820,110,32,'#d6e3ef');
// starfield and distant comet trail
for(let i=0;i<7;i++){let sx=(i*150-clock*34)%W;if(sx<0)sx+=W;rect(sx,200+(i*31)%150,3,3,'#ffffff');}
const cx=cometX;ctx.fillStyle='#a6a997';ctx.beginPath();ctx.arc(cx,275,49,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d0d1bd';ctx.beginPath();ctx.arc(cx-15,258,18,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d5e9e5aa';ctx.beginPath();ctx.moveTo(cx-40,245);ctx.lineTo(cx-205,185);ctx.lineTo(cx-72,278);ctx.fill();
rect(0,438,W,102,'#b8d9cb');rect(0,438,W,7,'#8cc4a1');drawFrog(170,420);
roundPanel(20,18,225,48,'#fffdf5','#c8e4d8',8);txt('SOBREVUELO · COMETA AURELIA',32,38,10,'#5e9977');txt('DATOS '+(missionPhase>=1?1:0)+'/1',32,55,11,'#476b79');
roundPanel(695,18,245,58,'#fffdf5','#c8e4d8',8);txt('VENTANA DE OBSERVACIÓN',710,40,10,'#639878');rect(710,48,210,8,'#e7eee8');rect(710,48,Math.max(0,210-observationWindow*2),8,'#e7b85e');
roundPanel(330,365,300,55,'#fffdf5','#c8e4d8',8);txt(missionPhase===0?'¡Pulsa E cuando el cometa esté cerca!':missionPhase===1?'¡Foto capturada! Pulsa E para guardar.':missionPhase===2?'Datos guardados. Pulsa E para transmitir.':'¡Datos enviados a la Tierra!',480,398,12,'#466f78','center');
drawFrog(player.x,player.y);if(dialogueTimer>0)dialogBox(dialogue);
}
function updateFlyby(dt){updatePlayer(dt);cometX-=125*dt;observationWindow+=dt;if(missionPhase===0&&cometX<250){say('¡El cometa está en el campo de visión! Pulsa E ahora.');missionPhase=0;}if(cometX<-90&&missionPhase===0){say('El cometa pasó. Pulsa R para repetir el sobrevuelo.');mode='missed';}if(missionPhase===1&&dataSaved===false){}}
function interactFlyby(){if(missionPhase===0){if(cometX<400&&cometX>95){missionPhase=1;say('¡Imagen capturada! Ahora guarda los datos en la memoria.');audio.data();}else say('Espera a que el cometa entre en el campo de visión.');}else if(missionPhase===1){dataSaved=true;missionPhase=2;say('Datos almacenados. Orienta la antena para transmitir.');audio.data();}else if(missionPhase===2){dataSent=true;missionPhase=3;say('¡La Tierra recibió los datos! Misión completada.');audio.win();setTimeout(()=>{if(mode==='flyby'){mode='complete';if(!progress.data.completed.includes('flyby-v1')){progress.data.completed.push('flyby-v1');progress.data.flies++;progress.data.tickets+=3;progress.save();}}},1000);}}
function completeScene(){background();planet(480,215,112,'#abd9cf');drawFrog(480,365,1.65);txt('¡MISIÓN '+(missionIndex+1)+' COMPLETADA!',480,88,27,'#4c8668','center');txt('¡Excelente trabajo, explorador! Has completado '+missionNames[missionIndex]+'.',480,123,12,'#547a82','center');roundPanel(300,445,360,55,'#fffef6','#c6e3d7',9);txt(missionIndex===5?'ENTER · VOLVER AL CENTRO':'ENTER · SIGUIENTE MISIÓN',480,479,13,'#4b8965','center');}
function draw(){ctx.clearRect(0,0,W,H);if(mode==='title')titleScreen();else if(mode==='hangar')controlRoom();else if(mode==='flyby')flybyScene();else if(mode==='complete')completeScene();else if(mode==='missed'){flybyScene();roundPanel(280,205,400,115,'#fffef5','#c6e3d7',10);txt('¡EL COMETA YA PASÓ!',480,245,20,'#a66d4d','center');txt('Pulsa R para intentarlo otra vez.',480,277,13,'#547a82','center');}}
function startGame(){if(mode!=='title')return;mode='hangar';say('¡Hola! Soy Flying. Este es nuestro centro de control.');audio.start();canvas.focus();}
function keyDown(e){if(['ArrowLeft','ArrowRight','ArrowUp',' ','Space'].includes(e.key))e.preventDefault();keys[e.code]=true;if(e.repeat)return;if(mode==='title'&&(e.code==='Enter'||e.code==='NumpadEnter')){e.preventDefault();startGame();}else if(mode==='hangar'){if(e.code==='KeyE')interactHangar();if(e.code==='Enter')startMission();}else if(mode==='flyby'){if(e.code==='KeyE')interactFlyby();}else if(mode==='missed'&&e.code==='KeyR'){mode='flyby';cometX=1050;observationWindow=0;missionPhase=0;resetPlayer();say('¡Nueva oportunidad! Prepárate.');}else if(mode==='complete'&&e.code==='Enter'){if(missionIndex<5){missionIndex++;installed.clear();mode='hangar';resetPlayer();say('¡Vamos con la misión '+(missionIndex+1)+': '+missionNames[missionIndex]+'. Revisa el centro de control!');}else{missionIndex=0;installed.clear();mode='title';say('¡Has completado las seis misiones espaciales!');}}}
function loop(now){const dt=Math.min(.035,(now-last)/1000||0);last=now;clock+=dt;if(dialogueTimer>0)dialogueTimer-=dt;if(messageTimer>0)messageTimer-=dt;if(mode==='hangar')updatePlayer(dt);if(mode==='flyby')updateFlyby(dt);draw();requestAnimationFrame(loop);}
canvas.tabIndex=0;canvas.style.cursor='pointer';document.addEventListener('keydown',keyDown);document.addEventListener('keyup',e=>keys[e.code]=false);window.addEventListener('blur',()=>Object.keys(keys).forEach(k=>keys[k]=false));canvas.addEventListener('pointerdown',()=>{canvas.focus();if(mode==='title')startGame();else if(mode==='complete')keyDown({key:'Enter',code:'Enter',repeat:false,preventDefault(){}});});canvas.addEventListener('click',()=>{if(mode==='title')startGame();else if(mode==='complete')keyDown({key:'Enter',code:'Enter',repeat:false,preventDefault(){}});});requestAnimationFrame(loop);
