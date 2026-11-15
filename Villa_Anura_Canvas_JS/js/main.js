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
function drawFrog(x,y,scale=1){ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(scale,scale);const bob=Math.sin(clock*8)*1.3;ctx.translate(0,bob);rect(-13,-27,26,23,'#258b50');rect(-17,-37,11,13,'#258b50');rect(6,-37,11,13,'#258b50');rect(-15,-36,9,10,'#f9fff0');rect(7,-36,9,10,'#f9fff0');rect(-12,-34,4,6,'#173d48');rect(9,-34,4,6,'#173d48');rect(-8,-12,16,7,'#b9e878');rect(-12,-4,9,5,'#176b43');rect(4,-4,9,5,'#176b43');rect(-19,-18,7,11,'#258b50');rect(12,-18,7,11,'#258b50');ctx.restore();}
function background(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#d9f0eb');g.addColorStop(.62,'#edf6e9');g.addColorStop(1,'#c6e3d5');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);stars();planet(830,104,48,'#b7dcd6');planet(115,105,25,'#d1e2f2');}
function controlRoom(){background();
// distant skyline and observation windows
rect(0,180,W,258,'#e7f4eb');
for(let i=0;i<5;i++){const x=i*205-25;roundPanel(x,205,178,178,'#b5d9d3','#9ac9bf',9);roundPanel(x+9,214,160,159,'#dff4ee','#c3e4db',5);rect(x+22,238,130,3,'#b0d6d2');planet(x+120,274,18,['#d0dcef','#b9dfd3','#e8d9b8'][i%3]);rect(x+22,322,65,4,'#8ec4b3');rect(x+22,335,105,4,'#a6d1c7');}
// overhead control panels
rect(0,0,W,38,'#a9d3c8');rect(0,38,W,5,'#8bbeb2');
for(let i=0;i<9;i++){rect(34+i*105,12,48,12,'#d9f3e8');rect(38+i*105,15,12,6,i%3===0?'#e7c46d':'#83bca8');}
rect(0,435,W,105,'#a9d2c1');rect(0,435,W,8,'#79b99a');
for(let i=0;i<12;i++){rect(i*82,443,2,97,'#91c3ad');}
 // central holographic mission table
roundPanel(390,318,210,104,'#8db9ae','#6d9f96',12);rect(408,331,174,67,'#c9e9de');planet(495,361,22,'#a7d2cb');ctx.strokeStyle='#73b6a3';ctx.lineWidth=2;ctx.beginPath();ctx.arc(495,361,42,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(450,361);ctx.lineTo(540,361);ctx.moveTo(495,321);ctx.lineTo(495,401);ctx.stroke();txt('MAPA ESTELAR',495,414,9,'#f7fff8','center');
// consoles
stations.forEach((s,i)=>{const active=installed.has(s.id);roundPanel(s.x-43,385,86,54,active?'#c6e9d4':'#fffdf4',active?'#75b78e':'#b9d9ce',7);txt(s.icon,s.x,410,20,'#36576a','center');txt(active?'OK':s.name,s.x,430,9,active?'#4d9b6d':'#567d78','center');if(Math.abs(player.x-s.x)<62){roundPanel(s.x-74,347,148,30,'#fffef7','#b9dccc',7);txt(active?'INSTALADO':'E · INSTALAR',s.x,367,10,'#4c8668','center');}});
// frog in foreground on its own ground line
drawFrog(player.x,player.y);
hud();
if(dialogueTimer>0)dialogBox(dialogue);
if(messageTimer>0){roundPanel(330,458,300,36,'#fffdf5','#d1e6d9',8);txt(message,480,481,11,'#4e806c','center');}
roundPanel(18,72,300,82,'#fffdf5','#c8e3d8',10);txt('CENTRO DE CONTROL',34,96,12,'#659b7b');txt('Prepara la nave para el sobrevuelo.',34,120,13,'#456879');txt('Muévete, salta y activa cada módulo.',34,141,11,'#7b9a90');
roundPanel(700,72,240,82,'#fffdf5','#c8e3d8',10);txt('MISIÓN 01 · SOBRE VUELO',716,96,11,'#659b7b');txt('Sistemas '+installed.size+'/4',716,122,15,'#456879');txt('← → mover   ESPACIO saltar',716,142,10,'#7b9a90');
}
function hud(){roundPanel(18,14,210,43,'#fffdf5','#c8e3d8',8);txt('VILLA ANURA',32,32,11,'#58936d');txt('HANGAR ESPACIAL',32,48,10,'#456879');roundPanel(805,14,137,43,'#fffdf5','#c8e3d8',8);txt('🪰 '+progress.data.flies+'    🎟 '+progress.data.tickets,819,41,13,'#456879');}
function dialogBox(t){roundPanel(675,390,265,65,'#fffef8','#c9e4d7',9);txt('FLYING',690,411,10,'#65a078');txt(t.length>35?t.slice(0,34)+'…':t,690,435,11,'#456879');}
function titleScreen(){background();rect(0,420,W,120,'#b4d9c7');rect(0,420,W,7,'#8dc59e');planet(770,190,105,'#a8d9ce');planet(180,155,42,'#d0e1f2');drawFrog(480,390,2.3);txt('VILLA ANURA',480,88,40,'#478268','center');txt('SPACE MISSION ADVENTURE',480,118,14,'#72988a','center');roundPanel(330,448,300,55,'#fffef6','#c6e3d7',9);txt('PRESIONA ENTER PARA JUGAR',480,482,14,'#4b8965','center');}
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
function completeScene(){background();planet(480,215,112,'#abd9cf');drawFrog(480,365,1.8);txt('¡MISIÓN COMPLETADA!',480,88,29,'#4c8668','center');txt('Capturaste, guardaste y transmitiste los datos del cometa.',480,123,13,'#547a82','center');roundPanel(330,445,300,55,'#fffef6','#c6e3d7',9);txt('ENTER · SIGUIENTE DESTINO',480,479,13,'#4b8965','center');}
function draw(){ctx.clearRect(0,0,W,H);if(mode==='title')titleScreen();else if(mode==='hangar')controlRoom();else if(mode==='flyby')flybyScene();else if(mode==='complete')completeScene();else if(mode==='missed'){flybyScene();roundPanel(280,205,400,115,'#fffef5','#c6e3d7',10);txt('¡EL COMETA YA PASÓ!',480,245,20,'#a66d4d','center');txt('Pulsa R para intentarlo otra vez.',480,277,13,'#547a82','center');}}
function startGame(){if(mode!=='title')return;mode='hangar';say('¡Hola! Soy Flying. Este es nuestro centro de control.');audio.start();canvas.focus();}\nfunction keyDown(e){if(['ArrowLeft','ArrowRight','ArrowUp',' ','Space'].includes(e.key))e.preventDefault();keys[e.code]=true;if(e.repeat)return;if(mode==='title'&&(e.code==='Enter'||e.code==='NumpadEnter')){e.preventDefault();startGame();}else if(mode==='hangar'){if(e.code==='KeyE')interactHangar();if(e.code==='Enter')startMission();}else if(mode==='flyby'){if(e.code==='KeyE')interactFlyby();}else if(mode==='missed'&&e.code==='KeyR'){mode='flyby';cometX=1050;observationWindow=0;missionPhase=0;resetPlayer();say('¡Nueva oportunidad! Prepárate.');}else if(mode==='complete'&&e.code==='Enter'){mode='hangar';say('¡Buen trabajo! La siguiente misión se está preparando.');}}
function loop(now){const dt=Math.min(.035,(now-last)/1000||0);last=now;clock+=dt;if(dialogueTimer>0)dialogueTimer-=dt;if(messageTimer>0)messageTimer-=dt;if(mode==='hangar')updatePlayer(dt);if(mode==='flyby')updateFlyby(dt);draw();requestAnimationFrame(loop);}
canvas.tabIndex=0;canvas.style.cursor='pointer';document.addEventListener('keydown',keyDown);document.addEventListener('keyup',e=>keys[e.code]=false);window.addEventListener('blur',()=>Object.keys(keys).forEach(k=>keys[k]=false));canvas.addEventListener('pointerdown',()=>{canvas.focus();if(mode==='title')startGame();});canvas.addEventListener('click',()=>{if(mode==='title')startGame();});requestAnimationFrame(loop);
