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
function drawFrog(x,y,scale=1){
  ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(scale,scale);
  const walking=Math.abs(player.vx)>5,step=walking?Math.sin(player.anim*15)*3:0;
  const blink=Math.sin(clock*1.7)>0.985;
  // soft shadow and tiny antenna spark
  ctx.globalAlpha=.2;ctx.fillStyle='#315b68';ctx.beginPath();ctx.ellipse(0,2,25,5,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  // backpack
  rect(-21,-29,8,25,'#24617a');rect(-19,-27,5,19,'#57a9b5');rect(14,-29,8,25,'#24617a');
  // legs and boots
  rect(-14,-9+step,11,9,'#167b4c');rect(4,-9-step,11,9,'#167b4c');
  rect(-17,-4+step,14,6,'#17354f');rect(3,-4-step,14,6,'#17354f');rect(-15,-3+step,9,2,'#83d8c5');rect(5,-3-step,9,2,'#83d8c5');
  // astronaut body suit
  rect(-17,-30,34,25,'#183b58');rect(-14,-29,28,22,'#f4fbf7');rect(-11,-27,22,17,'#ffffff');rect(-9,-12,18,3,'#a9dfe0');
  rect(-5,-24,10,10,'#4a9fae');rect(-3,-22,6,6,'#d6f4e9');rect(-2,-21,4,2,'#f5c65b');
  // arms, animated slightly while walking
  rect(-22,-27,7,17,'#1b4761');rect(-20,-25,6,12,'#f5fbf5');rect(-22,-13,8,6,'#54b84c');
  rect(15,-27,7,17,'#1b4761');rect(15,-25,6,12,'#f5fbf5');rect(14,-13,8,6,'#54b84c');
  // frog head silhouette with dark pixel outline
  rect(-19,-52,38,29,'#17274c');rect(-22,-47,5,18,'#17274c');rect(17,-47,5,18,'#17274c');
  rect(-16,-54,11,7,'#17274c');rect(5,-54,11,7,'#17274c');
  rect(-17,-50,34,25,'#39a94a');rect(-20,-45,4,14,'#39a94a');rect(16,-45,4,14,'#39a94a');
  rect(-14,-53,9,5,'#91dc54');rect(5,-53,9,5,'#91dc54');rect(-16,-49,32,21,'#65c83e');rect(-18,-43,4,11,'#65c83e');
  // forehead shine and eyes
  rect(-12,-49,7,2,'#c9f47b');rect(6,-49,6,2,'#c9f47b');
  rect(-12,-45,8,9,'#17274c');rect(5,-45,8,9,'#17274c');
  if(blink){rect(-10,-41,5,2,'#f8fff8');rect(7,-41,5,2,'#f8fff8');}
  else{rect(-9,-44,4,6,'#ffffff');rect(7,-44,4,6,'#ffffff');rect(-8,-43,2,4,'#182b50');rect(8,-43,2,4,'#182b50');}
  // cheeks, nose and smile
  rect(-16,-35,6,5,'#f27c9a');rect(10,-35,6,5,'#f27c9a');rect(-2,-35,2,2,'#17304b');rect(3,-35,2,2,'#17304b');
  rect(-5,-30,10,2,'#17304b');rect(-3,-28,6,2,'#17304b');
  // headset and glass highlights
  rect(-22,-47,4,9,'#55b8d2');rect(18,-47,4,9,'#55b8d2');rect(-19,-53,7,3,'#2c5068');rect(12,-53,7,3,'#2c5068');
  rect(-13,-51,4,2,'#ffffff');rect(7,-51,4,2,'#ffffff');
  ctx.restore();
}
function background(){
  // Bright white assembly hangar with glass roof and exterior light
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#f9fcff');g.addColorStop(.58,'#eaf5f6');g.addColorStop(1,'#dcebee');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // distant glass panes
  rect(0,54,W,300,'#e7f4f7');
  for(let x=0;x<W;x+=120){rect(x,55,4,290,'#c3d7df');rect(x+7,62,100,270,'#f8fdff');}
  for(let y=70;y<340;y+=82)rect(0,y,W,3,'#c5dbe2');
  // soft sky and planet visible outside
  planet(840,142,53,'#a9d7ed');planet(840,142,42,'#bfe7f4');rect(805,137,72,3,'#eafaff');
  // ceiling trusses
  rect(0,0,W,54,'#e4edf1');for(let x=0;x<W;x+=80){rect(x,0,5,55,'#aabec9');rect(x,14,80,4,'#c1d1d8');}
  for(let x=-40;x<W;x+=160){ctx.strokeStyle='#9eb3bf';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+90,54);ctx.stroke();ctx.beginPath();ctx.moveTo(x+90,0);ctx.lineTo(x,54);ctx.stroke();}
  // hanging industrial lights
  for(let x=70;x<W;x+=180){rect(x,49,3,20,'#8ba4b1');roundPanel(x-19,64,42,9,'#fff9df','#d6e1dc',4);rect(x-12,66,28,3,'#fff3b8');}
  // clean white floor with perspective tiles
  rect(0,354,W,186,'#e9f1ef');rect(0,354,W,5,'#9dbbb8');
  for(let x=-100;x<W+100;x+=100){ctx.strokeStyle='#c6d8d5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(480,354);ctx.lineTo(x,540);ctx.stroke();}
  for(let y=390;y<540;y+=42)rect(0,y,W,2,'#d1e0dd');
  // safety markings
  rect(0,516,W,8,'#f1c75d');for(let x=0;x<W;x+=34){rect(x,516,17,8,'#fff3c4');}
  // side workbenches and monitor clusters
  roundPanel(24,230,170,108,'#dce8ec','#9db8c4',8);rect(37,244,144,65,'#174f70');rect(44,251,130,51,'#1b6d91');
  for(let i=0;i<5;i++){rect(52+i*22,266,12,3,'#7ce2e0');rect(52+i*22,277,8,14,'#65c8cf');}
  roundPanel(765,235,170,104,'#dce8ec','#9db8c4',8);rect(779,248,142,68,'#164b6c');planet(850,280,20,'#8ad1dc');rect(806,307,85,3,'#6cd5df');
  // structural rocket gantry in the middle
  rect(370,112,18,244,'#e4b34b');rect(572,112,18,244,'#e4b34b');rect(370,112,220,13,'#e4b34b');
  for(let y=132;y<350;y+=48){rect(370,y,220,5,'#f3cf71');rect(370,y,12,42,'#c38b37');rect(578,y,12,42,'#c38b37');}
  // spacecraft assembly module
  rect(447,145,67,188,'#d6e3e9');rect(454,143,53,188,'#fbfdff');rect(454,205,53,8,'#4aa6a7');rect(454,278,53,7,'#4aa6a7');
  rect(465,130,35,18,'#d9e8ed');rect(459,125,47,9,'#9db4c1');rect(442,325,77,13,'#c4d4db');rect(434,337,93,13,'#e2e9ec');
  // crane above rocket
  rect(450,76,64,9,'#e8b94d');rect(477,52,10,27,'#d89f37');rect(469,42,27,11,'#e7b64c');rect(481,79,3,49,'#8ba0a9');
  // potted plants soften the hangar
  rect(212,325,24,28,'#ffffff');rect(207,317,34,8,'#c9d8d6');for(let i=0;i<4;i++){rect(213+i*5,303-(i%2)*6,5,17,'#66b779');}
  rect(710,325,24,28,'#ffffff');rect(705,317,34,8,'#c9d8d6');for(let i=0;i<4;i++){rect(711+i*5,303-(i%2)*6,5,17,'#66b779');}
}
function controlRoom(){background();
  // mission banner
  roundPanel(18,14,250,44,'#ffffff','#d3e4e6',8);txt('VILLA ANURA',32,32,12,'#31825f');txt('HANGAR DE ENSAMBLAJE',32,48,10,'#456879');
  // interactive consoles placed in the foreground
  stations.forEach((s)=>{const active=installed.has(s.id);roundPanel(s.x-42,380,84,65,active?'#e4f7e9':'#ffffff',active?'#66b986':'#b8d0d7',8);rect(s.x-31,389,62,34,active?'#d7f2e2':'#e6f2f5');txt(s.icon,s.x,414,20,'#36576a','center');txt(active?'LISTO':s.name,s.x,438,9,active?'#39865c':'#4d7180','center');if(Math.abs(player.x-s.x)<62){roundPanel(s.x-69,346,138,27,'#ffffff','#8fc7b0',7);txt(active?'SISTEMA INSTALADO':'E · INTERACTUAR',s.x,364,9,'#357d5b','center');}});
  // holographic mission map to the right
  roundPanel(690,82,244,116,'#fafdff','#b9d4df',10);txt('MAPA DE MISIÓN',708,105,11,'#347b8a');rect(708,119,207,61,'#e5f3f7');planet(812,150,21,'#83c6d7');ctx.strokeStyle='#64a6b8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(812,150,38,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(755,150);ctx.lineTo(870,150);ctx.moveTo(812,128);ctx.lineTo(812,172);ctx.stroke();
  // mission guidance panel
  roundPanel(18,72,300,86,'#ffffff','#c8dfe3',10);txt('CENTRO DE CONTROL',34,97,12,'#34876a');txt('Prepara la nave para el sobrevuelo.',34,122,13,'#456879');txt('← → caminar   ESPACIO saltar',34,144,11,'#6c8b94');
  roundPanel(700,215,240,72,'#ffffff','#c8dfe3',10);txt('MISIÓN 01 · SOBRE VUELO',716,239,11,'#34876a');txt('Sistemas '+installed.size+'/4',716,264,15,'#456879');
  drawFrog(player.x,player.y);
  if(dialogueTimer>0)dialogBox(dialogue);
  if(messageTimer>0){roundPanel(330,458,300,36,'#ffffff','#b9dccd',8);txt(message,480,481,11,'#3e8066','center');}
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
function startGame(){if(mode!=='title')return;mode='hangar';say('¡Hola! Soy Flying. Este es nuestro centro de control.');audio.start();canvas.focus();}
function keyDown(e){if(['ArrowLeft','ArrowRight','ArrowUp',' ','Space'].includes(e.key))e.preventDefault();keys[e.code]=true;if(e.repeat)return;if(mode==='title'&&(e.code==='Enter'||e.code==='NumpadEnter')){e.preventDefault();startGame();}else if(mode==='hangar'){if(e.code==='KeyE')interactHangar();if(e.code==='Enter')startMission();}else if(mode==='flyby'){if(e.code==='KeyE')interactFlyby();}else if(mode==='missed'&&e.code==='KeyR'){mode='flyby';cometX=1050;observationWindow=0;missionPhase=0;resetPlayer();say('¡Nueva oportunidad! Prepárate.');}else if(mode==='complete'&&e.code==='Enter'){mode='hangar';say('¡Buen trabajo! La siguiente misión se está preparando.');}}
function loop(now){const dt=Math.min(.035,(now-last)/1000||0);last=now;clock+=dt;if(dialogueTimer>0)dialogueTimer-=dt;if(messageTimer>0)messageTimer-=dt;if(mode==='hangar')updatePlayer(dt);if(mode==='flyby')updateFlyby(dt);draw();requestAnimationFrame(loop);}
canvas.tabIndex=0;canvas.style.cursor='pointer';document.addEventListener('keydown',keyDown);document.addEventListener('keyup',e=>keys[e.code]=false);window.addEventListener('blur',()=>Object.keys(keys).forEach(k=>keys[k]=false));canvas.addEventListener('pointerdown',()=>{canvas.focus();if(mode==='title')startGame();});canvas.addEventListener('click',()=>{if(mode==='title')startGame();});requestAnimationFrame(loop);
