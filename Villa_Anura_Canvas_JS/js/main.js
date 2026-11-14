"use strict";
/* DATOS */
const ROOMS=[{name:"Archivo y briefing",x:0,y:0},{name:"Laboratorio de instrumentos",x:1,y:0},{name:"Taller de estructura",x:2,y:0},{name:"Sala de energía",x:2,y:1},{name:"Sala de comunicaciones",x:1,y:1},{name:"Propulsión y órbita",x:0,y:1},{name:"Oficina de presupuesto",x:0,y:2},{name:"Hangar de lanzamiento",x:1,y:2},{name:"Sala de control",x:2,y:2}];
const LEVELS=[
{id:1,type:"flyby",name:"Sobrevuelo",destination:"Cometa / asteroide",reference:"Voyager · New Horizons · Lucy",brief:"Una nave robot pasa cerca de un cometa o asteroide para tomar fotos y recoger información. Como va muy rápido y no se queda allí, debe aprovechar ese único encuentro y enviar los datos a la Tierra.",mass:[450,1500],power:[200,600],budget:[500,1000],link:[.5,40],data:[5,50],duration:[5,15],critical:"Masa seca y C3",special:"C3 ≥ 100 km²/s²; velocidad de encuentro 10–15 km/s",science:18,calendar:24,margin:.20,active:true},
{id:2,type:"orbiter",name:"Orbitador",destination:"Marte o Júpiter",reference:"MAVEN · MRO · Juno",brief:"Inserción orbital, propelente, blindaje y tolerancia a radiación. El orbitador puede convertirse en relevo para otra misión.",active:false},
{id:3,type:"probe",name:"Sonda atmosférica y penetrador",destination:"Atmósfera planetaria",reference:"Huygens · Galileo Probe · DAVINCI",brief:"Sobrevivir al descenso exige equilibrar escudo térmico, baterías y ventana de comunicaciones.",active:false},
{id:4,type:"lander",name:"Aterrizador",destination:"Luna o Marte",reference:"InSight · Phoenix · CLPS",brief:"El sitio de aterrizaje y el sistema EDL compiten con la masa científica y la energía.",active:false},
{id:5,type:"rover",name:"Rover",destination:"Superficie planetaria",reference:"Curiosity · Perseverance · VIPER",brief:"Movilidad, calefacción y ciencia comparten una fuente de potencia limitada.",active:false},
{id:6,type:"sample",name:"Retorno de muestras",destination:"Misión de ida y vuelta",reference:"OSIRIS-REx · Hayabusa2 · Mars Sample Return",brief:"Una cadena de eventos autónomos debe mantener fiabilidad suficiente para traer muestras.",active:false}
];
const INSTR=[{id:"cam",name:"Cámara óptica",mass:35,power:35,data:8,science:5,cost:35},{id:"spec",name:"Espectrómetro",mass:45,power:55,data:12,science:8,cost:50},{id:"dust",name:"Analizador de polvo",mass:25,power:25,data:5,science:4,cost:25},{id:"mag",name:"Magnetómetro",mass:20,power:15,data:2,science:3,cost:20}];
const SOURCES={solar:{name:"Paneles solares",power:520,mass:95,cost:90,decay:.02},rtg:{name:"MMRTG",power:320,mass:125,cost:150,decay:.008},hybrid:{name:"Sistema híbrido",power:650,mass:180,cost:180,decay:.012}};
const ANT={small:{name:"Antena compacta",d:1.2,tx:18,mass:35,cost:35},medium:{name:"Antena mediana",d:1.8,tx:35,mass:65,cost:65},large:{name:"Antena alta ganancia",d:2.4,tx:55,mass:105,cost:100}};
const ENGINES={chemical:{name:"Químico · Isp 320 s",isp:320,cost:85},efficient:{name:"Alto rendimiento · Isp 450 s",isp:450,cost:100}};
const LAUNCHERS={light:{name:"Lanzador clase ligera",cap:900,cost:100},medium:{name:"Lanzador clase media",cap:1500,cost:160},heavy:{name:"Lanzador clase pesada",cap:2400,cost:180}};
const $=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),fmt=n=>Number(n).toFixed(1).replace(/\.0$/,""),money=n=>fmt(n)+" M";
const LEVEL=LEVELS[0],canvas=$("gameCanvas"),ctx=canvas.getContext("2d");ctx.imageSmoothingEnabled=false;
/* ESTADO */
const state={screen:"TITLE",room:1,x:160,y:130,walk:0,anim:0,face:1,started:false,completed:new Set([1]),visited:new Set([1]),sound:true,audio:null,calendar:24,changes:0,confirmed:{},instrumentIds:[],structure:900,shield:220,source:"solar",antenna:"small",engine:"chemical",dv:3200,c3:80,encounterSpeed:15,exposure:2,launcher:"light",critical:"",sensitivity:false,solarKnown:false,exposureKnown:false,dvKnown:false,report:"",travel:0,intro:0,toastTimer:0};
let keys={},last=0,hudDirty=true;
/* CALCULO — motor puro: E1–E13 simplificadas y propagación de dependencias. */
function computeMission(s){
 const ins=INSTR.filter(i=>s.instrumentIds.includes(i.id)),mi=ins.reduce((a,x)=>a+x.mass,0),pi=ins.reduce((a,x)=>a+x.power,0),di=ins.reduce((a,x)=>a+x.data,0),si=ins.reduce((a,x)=>a+x.science,0),ci=ins.reduce((a,x)=>a+x.cost,0);
 const src=SOURCES[s.source],ant=ANT[s.antenna],eng=ENGINES[s.engine],launch=LAUNCHERS[s.launcher];
 const dry=s.structure+s.shield+mi+src.mass+ant.mass;
 let prop=0,total=dry,converged=false;for(let n=0;n<20;n++){const next=dry*(Math.exp(s.dv/(9.81*eng.isp))-1);if(Math.abs(next-prop)<.01){prop=next;converged=true;break}prop=next}
 total=dry+prop;
 const req=60+pi+ant.tx/.3+.1*dry,gen=src.power*Math.pow(1-src.decay,LEVEL.duration[0]);
 const comm=(.85*ant.tx*ant.d*ant.d)/(2.2*2.2),trans=comm*24*.72;
 const dataRatio=Math.min(1,trans/Math.max(1,di*24*.65)),science=si*dataRatio*Math.max(.55,1-(s.encounterSpeed-10)*.055);
 const cost=ci+src.cost+ant.cost+eng.cost+launch.cost+s.structure*.08+s.shield*.10+LEVEL.duration[0]*8;
 const margins={mass:(launch.cap*.8-total)/(launch.cap*.8),power:(gen-req)/Math.max(1,gen),budget:(LEVEL.budget[1]-cost)/LEVEL.budget[1],comm:(comm-0.5)/Math.max(.5,comm),data:dataRatio-0.9};
 const hard=[
 {id:"mass",label:"Masa con reserva del 20 %",ok:total<=launch.cap*.8,actual:total,limit:launch.cap*.8,why:`La masa calculada es ${fmt(total)} kg; el límite con reserva es ${fmt(launch.cap*.8)} kg.`,room:8},
 {id:"power",label:"Potencia EOL con margen",ok:gen>=1.2*req,actual:gen,limit:1.2*req,why:`La fuente entrega ${fmt(gen)} W al final de vida; se requieren ${fmt(1.2*req)} W con margen.`,room:4},
 {id:"budget",label:"Presupuesto con reserva",ok:cost*1.2<=LEVEL.budget[1],actual:cost*1.2,limit:LEVEL.budget[1],why:`Costo con reserva ${fmt(cost*1.2)} M frente a ${LEVEL.budget[1]} M.`,room:7},
 {id:"link",label:"Enlace y descarga de datos",ok:trans>=.9*di*24*.65,actual:trans,limit:.9*di*24*.65,why:`Se transmiten ${fmt(trans)} unidades frente a ${fmt(.9*di*24*.65)} requeridas.`,room:5},
 {id:"dv",label:"C3 y velocidad de encuentro",ok:s.c3>=100&&s.encounterSpeed>=10&&s.encounterSpeed<=15,actual:s.c3,limit:100,why:`C3 de lanzamiento ${fmt(s.c3)} km²/s² y velocidad de encuentro ${fmt(s.encounterSpeed)} km/s.`,room:6},
 {id:"science",label:"Valor científico y exposición",ok:science>=LEVEL.science,actual:science,limit:LEVEL.science,why:`Valor científico ${fmt(science)} frente al umbral ${LEVEL.science}.`,room:2},
 {id:"convergence",label:"Convergencia de masa",ok:converged,actual:prop,limit:20,why:"La iteración de propelente debe converger.",room:3}
 ];
 const soft=[{id:"exposure",label:"Imagen sin arrastre",ok:s.exposure>=Math.max(2,s.encounterSpeed*.55),why:`Exposición ${s.exposure} ms; para esta velocidad se recomienda ${fmt(s.encounterSpeed*.55)} ms.`,room:2}];
 return {mi,pi,di,si,dry,prop,total,req,gen,comm,trans,dataRatio,science,cost,hard,soft,margins,critical:Object.entries(margins).sort((a,b)=>a[1]-b[1])[0][0],budget:LEVEL.budget[1],capacity:launch.cap};
}
function invalidation(from){for(let i=from+1;i<=9;i++){if(state.completed.has(i)){state.completed.delete(i);state.changes++;state.calendar=Math.max(0,state.calendar-1)}}hudDirty=true}
function explainFailures(c){return c.hard.filter(v=>!v.ok).map(v=>{let chain=v.id==="mass"?"La estructura, los instrumentos y la antena suman masa seca; el propelente amplifica esa masa.":v.id==="power"?"Los instrumentos y el transmisor elevan la demanda; la fuente pierde potencia al envejecer.":v.id==="budget"?"Cada subsistema suma costo y la reserva protege contra incertidumbre.":v.id==="link"?"Más instrumentos producen más datos; una antena pequeña no los descarga a tiempo.":v.id==="dv"?"Más delta-v exige más propelente, que vuelve a aumentar la masa total.":v.id==="science"?"La velocidad reduce la exposición útil y la descarga incompleta reduce ciencia recuperada.":"El cálculo iterativo no alcanzó estabilidad.";return `<div class="field"><b class="warning">${v.label}: ${fmt(v.actual)} / ${fmt(v.limit)}</b><br>${v.why}<br><small>${chain}</small><br><small>Pista: revisa qué subsistema está empujando esta variable.</small></div>`}).join("")}
/* SALAS */
function roomObjects(id){return [{x:160,y:105,label:["Abrir briefing","Revisar instrumentos","Ajustar estructura","Configurar fuente","Alinear antena","Planificar trayectoria","Revisar presupuesto","Elegir lanzador","Abrir control"][id-1],action:"main"},{x:45,y:145,label:"Consultar nota",action:"note"}]}
function xy(id){return ROOMS[id-1]}
function neighbor(a,b){const x=xy(a),y=xy(b);return x&&y&&(Math.abs(x.x-y.x)+Math.abs(x.y-y.y)===1)}
function transition(to){if(to<1||to>9||!neighbor(state.room,to))return;if(to>state.room&&!state.completed.has(state.room)){toast("Completa primero la decisión de esta sala.");return}const old=xy(state.room),dest=xy(to);if(to<state.room){state.calendar=Math.max(0,state.calendar-1);state.changes++}state.room=to;if(dest.x>old.x){state.x=24;state.y=96}else if(dest.x<old.x){state.x=296;state.y=96}else if(dest.y>old.y){state.x=160;state.y=24}else{state.x=160;state.y=165}state.visited.add(to);$("roomlabel").textContent=ROOMS[to-1].name.toUpperCase();$("roomCounter").textContent=`Nivel 1 · Sala ${to} de 9`;updateMini();hudDirty=true}
function updateMini(){$("minimap").innerHTML=ROOMS.map((r,i)=>`<div class="mapcell ${state.completed.has(i+1)?"done":""} ${state.room===i+1?"current":""}" style="grid-column:${r.x+1};grid-row:${r.y+1}" title="${r.name}">${i+1}${i<8?(ROOMS[i+1].x>r.x?" ?":ROOMS[i+1].x<r.x?" ?":" ?"):""}</div>`).join("")}

function drawFrog(x,y,t){
 // Flying conserva el pixel-art y los verdes del prototipo original.
 // El personaje se dibuja por partes: patas y brazos alternan durante la caminata.
 const moving=state.walk>0;
 const phase=moving?Math.sin(state.anim*15):0;
 const step=moving?Math.round(phase*3):0;
 const bob=moving?Math.abs(Math.sin(state.anim*15))*1.5:0;
 const dir=state.face||1;
 ctx.save();
 ctx.translate(Math.round(x),Math.round(y-bob));
 if(dir<0)ctx.scale(-1,1);

 // Sombra
 ctx.fillStyle="#0005";ctx.fillRect(-9,10,18,3);

 // Piernas animadas (se alternan en sentidos opuestos)
 ctx.fillStyle="#4f913f";
 ctx.fillRect(-7+step,5,5,7);ctx.fillRect(2-step,5,5,7);
 ctx.fillStyle="#68a94f";
 ctx.fillRect(-8+step,9,6,3);ctx.fillRect(2-step,9,6,3);
 ctx.fillStyle="#b9e49c";
 ctx.fillRect(-9+step,10,3,2);ctx.fillRect(4-step,10,3,2);

 // Brazos laterales con oscilación contraria a las piernas
 ctx.fillStyle="#4f913f";
 ctx.fillRect(-12-step,-1,4,8);ctx.fillRect(8+step,-1,4,8);
 ctx.fillStyle="#68a94f";
 ctx.fillRect(-13-step,1,4,5);ctx.fillRect(9+step,1,4,5);
 ctx.fillStyle="#b9e49c";
 ctx.fillRect(-13-step,2,2,2);ctx.fillRect(11+step,2,2,2);

 // Torso y vientre
 ctx.fillStyle="#4f913f";ctx.fillRect(-9,-5,18,13);
 ctx.fillStyle="#68a94f";ctx.fillRect(-8,-6,16,12);
 ctx.fillStyle="#b9e49c";ctx.fillRect(-5,-1,10,7);
 ctx.fillStyle="#d5e97b";ctx.fillRect(-4,0,8,5);

 // Cabeza ancha, ojos y hocico
 ctx.fillStyle="#4f913f";ctx.fillRect(-10,-12,20,11);
 ctx.fillRect(-11,-10,22,6);
 ctx.fillStyle="#68a94f";ctx.fillRect(-9,-13,18,11);
 ctx.fillRect(-11,-9,22,5);

 // Ojos elevados
 ctx.fillStyle="#4f913f";ctx.fillRect(-9,-16,6,6);ctx.fillRect(3,-16,6,6);
 ctx.fillStyle="#f1e8cf";ctx.fillRect(-8,-15,5,5);ctx.fillRect(3,-15,5,5);
 ctx.fillStyle="#222";ctx.fillRect(-6,-14,2,3);ctx.fillRect(5,-14,2,3);
 // Boca / sonrisa
 ctx.fillStyle="#2e6538";ctx.fillRect(-5,-5,10,1);
 ctx.fillStyle="#d5e97b";ctx.fillRect(-4,-4,8,1);
 // Pequeños detalles pixelados
 ctx.fillStyle="#3f873b";ctx.fillRect(-5,-10,2,2);ctx.fillRect(3,-9,2,2);

 // Gafitas de comandante: montura oscura pixelada, lentes celestes y puente central.
 // Se dibujan encima de los ojos para que formen parte del personaje al caminar.
 ctx.fillStyle="#182331";
 ctx.fillRect(-10,-16,8,1);ctx.fillRect(2,-16,8,1);
 ctx.fillRect(-11,-15,1,5);ctx.fillRect(-10,-10,8,1);
 ctx.fillRect(-3,-15,1,5);
 ctx.fillRect(2,-15,1,5);ctx.fillRect(3,-10,7,1);
 ctx.fillRect(10,-15,1,5);
 ctx.fillRect(-3,-14,6,1); // puente
 ctx.fillStyle="#69d8ef";
 ctx.fillRect(-9,-15,6,4);ctx.fillRect(3,-15,6,4);
 ctx.fillStyle="#c8f5ff";
 ctx.fillRect(-8,-15,2,1);ctx.fillRect(4,-15,2,1);
 ctx.fillStyle="#182331";
 ctx.fillRect(-12,-14,2,2);ctx.fillRect(10,-14,2,2);
 ctx.restore();
}

function drawHuman(x,y,color){ctx.fillStyle="#0004";ctx.fillRect(x-7,y+9,15,4);ctx.fillStyle=color;ctx.fillRect(x-6,y-5,12,17);ctx.fillStyle="#d4ad8b";ctx.fillRect(x-5,y-12,10,9);ctx.fillStyle="#403b35";ctx.fillRect(x-5,y-13,10,3)}
function drawRoom(){const id=state.room;
 // Interior de nave espacial en pixel art: suelo metálico, mamparos y ventanales.
 ctx.fillStyle="#17232d";ctx.fillRect(0,0,320,192);
 ctx.fillStyle="#35434a";ctx.fillRect(0,0,320,18);ctx.fillRect(0,0,12,192);ctx.fillRect(308,0,12,192);
 ctx.fillStyle="#53616a";ctx.fillRect(14,18,292,5);ctx.fillRect(14,169,292,5);
 ctx.fillStyle="#25343d";ctx.fillRect(15,24,290,140);
 // Ventanal panorámico con espacio exterior
 ctx.fillStyle="#101b2c";ctx.fillRect(93,27,134,45);
 ctx.fillStyle="#45606b";ctx.fillRect(89,24,142,4);ctx.fillRect(89,72,142,4);ctx.fillRect(89,24,4,52);ctx.fillRect(227,24,4,52);
 ctx.fillStyle="#0c1a30";ctx.fillRect(96,30,128,39);
 for(let i=0;i<24;i++){const sx=100+(i*37%119),sy=32+(i*19%33);ctx.fillStyle=i%5===0?"#f1d49a":"#b8d4dc";ctx.fillRect(sx,sy,i%4===0?2:1,i%4===0?2:1)}
 ctx.fillStyle="#4e8791";ctx.beginPath();ctx.arc(181-(id%3)*23,51,9+(id%2)*3,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#8fca79";ctx.fillRect(176-(id%3)*23,47,5,3);ctx.fillStyle="#d6b878";ctx.fillRect(184-(id%3)*23,54,4,2);
 // Suelo en placas metálicas
 ctx.fillStyle="#1d2b35";ctx.fillRect(0,78,320,114);
 for(let y=82;y<192;y+=22){ctx.fillStyle="#31424b";ctx.fillRect(14,y,292,1);for(let x=20;x<306;x+=36){ctx.fillStyle="#43535b";ctx.fillRect(x,y+3,1,13);ctx.fillStyle="#1a2730";ctx.fillRect(x+2,y+17,25,2)}}
 ctx.fillStyle="#53616a";ctx.fillRect(16,83,5,72);ctx.fillRect(299,83,5,72);
 ctx.fillStyle="#8bbbd1";ctx.fillRect(18,91,2,12);ctx.fillRect(300,91,2,12);
 ctx.fillStyle="#e8b96a";ctx.fillRect(27,80,20,3);ctx.fillRect(273,80,20,3);
 ctx.fillStyle="#263d48";ctx.fillRect(24,27,52,42);ctx.fillRect(244,27,52,42);
 ctx.fillStyle="#526c7b";ctx.fillRect(28,31,44,34);ctx.fillRect(248,31,44,34);
 ctx.fillStyle="#8bbbd1";ctx.fillRect(32,36,14,3);ctx.fillRect(32,43,30,2);ctx.fillRect(32,50,23,2);
 ctx.fillStyle="#e8b96a";ctx.fillRect(252,36,10,4);ctx.fillRect(266,36,18,4);ctx.fillStyle="#8fca79";ctx.fillRect(252,47,30,3);
 ctx.fillStyle="#e8b96a";for(let x=20;x<62;x+=8){ctx.fillRect(x,160,4,2)}for(let x=258;x<300;x+=8){ctx.fillRect(x,160,4,2)}
 ctx.fillStyle="#e6c58b";ctx.font="6px monospace";ctx.fillText("SECTOR "+String(campaign.level).padStart(2,"0"),22,15);
if(id===1){ctx.fillStyle="#466f79";ctx.fillRect(25,80,65,40);ctx.fillStyle="#6baaa0";ctx.fillRect(30,85,55,30);}
if(id===2){for(let i=0;i<4;i++){ctx.fillStyle=["#7596a4","#9e795b","#7a9d79","#c1a16d"][i];ctx.fillRect(35+i*62,110,38,25)}}
if(id===3){ctx.fillStyle="#72563e";ctx.fillRect(55,110,210,24);ctx.fillStyle="#d6b878";ctx.fillRect(75,115,170,6);}
if(id===4){ctx.fillStyle="#526c7b";ctx.fillRect(80,95,160,40);ctx.fillStyle="#e8b96a";ctx.fillRect(100,105,120,8);}
if(id===5){ctx.fillStyle="#263d48";ctx.fillRect(85,85,150,55);ctx.fillStyle="#82a6a8";ctx.fillRect(95,95,130,30);ctx.fillStyle="#d6b878";ctx.fillRect(145,105,30,8);}
if(id===6){
ctx.fillStyle="#63503e";ctx.fillRect(32,92,70,39);ctx.fillStyle="#182c39";ctx.fillRect(40,68,54,34);ctx.fillStyle="#73ced0";ctx.fillRect(44,72,46,25);ctx.fillStyle="#29485a";ctx.fillRect(49,78,24,2);ctx.fillRect(49,84,35,2);ctx.fillRect(49,90,18,2);ctx.fillStyle="#9aa9ad";ctx.fillRect(63,102,7,8);ctx.fillRect(44,115,48,5);
ctx.fillStyle="#443c35";ctx.fillRect(119,77,166,66);ctx.fillStyle="#172a38";ctx.fillRect(123,80,158,57);
const planets=[[136,108,11,"#ffc967"],[155,103,2,"#b8a69a"],[166,112,3,"#dbb17b"],[178,98,4,"#71b5df"],[192,116,3,"#cf7856"],[209,99,8,"#c99b75"],[232,115,7,"#d7be8e"],[251,97,5,"#8ccdd1"],[268,113,5,"#688ad6"]];
for(const [x,y,r,color] of planets){ctx.fillStyle="#7a817d";ctx.fillRect(x-1,y+r,2,134-y-r);ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}ctx.strokeStyle="#e1cda6";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(232,115,11,3,-.3,0,Math.PI*2);ctx.stroke();
}
if(id===7){ctx.fillStyle="#72563e";ctx.fillRect(60,105,200,30);ctx.fillStyle="#e8b96a";ctx.fillRect(85,112,150,6);}
if(id===8){for(let i=0;i<3;i++){let x=80+i*75;ctx.fillStyle="#a0a4a2";ctx.fillRect(x,75,16,65);ctx.fillStyle="#d6d3bd";ctx.fillRect(x+3,58,10,18)}}
if(id===9){ctx.fillStyle="#4b5960";ctx.fillRect(30,110,260,35);for(let i=0;i<4;i++){ctx.fillStyle=["#9aaf9c","#a1a4c0","#d6b878","#85aab4"][i];ctx.fillRect(42+i*62,118,48,16)}}
for(const to of [id-1,id+1]){if(to<1||to>9||!neighbor(id,to))continue;const a=xy(id),b=xy(to),dx=b.x-a.x,dy=b.y-a.y;const locked=to>id&&!state.completed.has(id);ctx.fillStyle=locked?"#98534c":"#8fca79";if(dx)ctx.fillRect(dx>0?310:0,74,10,44);else ctx.fillRect(138,dy>0?177:0,44,15);ctx.fillStyle="#fff0d5";ctx.font="7px monospace";}
drawHuman(265,151,"#758fa5");ctx.fillStyle="#fff0d5";ctx.font="6px monospace";ctx.fillText("GUIA",253,134);drawFrog(state.x,state.y,state.anim)}
function render(){ctx.setTransform(3,0,0,3,0,0);ctx.imageSmoothingEnabled=false;if(state.screen==="TITLE"){ctx.fillStyle="#272f38";ctx.fillRect(0,0,320,192);ctx.fillStyle="#d78e5c";ctx.fillRect(0,145,320,47);drawFrog(160,135,0);ctx.textAlign="center";ctx.fillStyle="#f3d19a";ctx.font="bold 25px monospace";ctx.fillText("VILLA ANURA",160,45);ctx.font="bold 13px monospace";ctx.fillText("DISEÑO DE MISIONES",160,65);ctx.font="8px monospace";ctx.fillText("SPACE MISSION DESIGN GAME · 2026",160,84);ctx.fillText("ENTER / CLIC PARA COMENZAR",160,178);ctx.textAlign="left"}else if(state.screen==="SIM"){drawLaunch()}else drawRoom()}
/* UI */
function toast(t){$("toast").textContent=t;$("toast").style.display="block";clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>$("toast").style.display="none",2300)}
function plainLanguage(value){
 const terms=[
  [/propelente/gi,"combustible"],[/masa seca/gi,"peso de la nave sin combustible"],[/masa total/gi,"peso total de la nave"],[/masa de lanzamiento/gi,"peso total al despegar"],
  [/potencia EOL/gi,"potencia disponible al final de la misión"],[/EOL/gi,"al final de la misión"],[/TPS/gi,"escudo térmico"],[/EDL/gi,"sistema de aterrizaje"],
  [/aviónica/gi,"equipos electrónicos"],[/carga útil/gi,"instrumentos científicos"],[/carga útil/gi,"instrumentos científicos"],
  [/delta-v/gi,"cambio de velocidad (delta-v)"],[/impulso específico/gi,"eficiencia del motor"],[/C3/gi,"energía necesaria para salir rumbo al destino (C3)"],
  [/circularización/gi,"ajuste para quedarse en órbita"],[/inserción orbital/gi,"entrada en órbita"],[/aerofrenado/gi,"frenado usando la atmósfera"],
  [/relé/gi,"satélite que retransmite la señal"],[/ventana de contacto/gi,"tiempo disponible para comunicarnos"],[/ventana de relé/gi,"tiempo disponible para comunicarnos"],
  [/enlace/gi,"comunicación con la Tierra"],[/antena de alta ganancia/gi,"antena que concentra mejor la señal"],
  [/convergencia/gi,"comprobación de que el cálculo se estabiliza"],[/fiabilidad/gi,"probabilidad de que todo funcione"],[/redundancia/gi,"sistema de respaldo"],
  [/análisis de sensibilidad/gi,"prueba para ver qué cambia al modificar una pieza"],[/sensibilidad/gi,"prueba de cambios"],[/autónoma/gi,"por sí sola"],[/autónomo/gi,"por sí solo"],
  [/exposición/gi,"tiempo de captura de la cámara"],[/arrastre/gi,"imagen movida"],[/fracción de/gi,"parte del total: "],
  [/margen/gi,"reserva"],[/presupuesto/gi,"dinero disponible"],[/umbral científico/gi,"meta científica"],
  [/transmisor/gi,"equipo que envía los datos"],[/espectrómetro/gi,"instrumento que analiza la luz y ayuda a identificar materiales"],
  [/magnetómetro/gi,"instrumento que mide el magnetismo"],[/penetrador/gi,"sonda que entra en el suelo"],[/orbitador/gi,"nave que se queda dando vueltas alrededor del planeta"]
 ];
 let result=String(value);
 for(const [pattern,replacement] of terms) result=result.replace(pattern,replacement);
 return result;
}
function panel(title,desc,body,buttons){$("dialogTitle").textContent=plainLanguage(title);$("dialogDesc").innerHTML=plainLanguage(desc);$("dialogBody").innerHTML=plainLanguage(body);$("dialogFooter").innerHTML="";buttons.forEach(b=>{let x=document.createElement("button");x.textContent=plainLanguage(b.text);x.className=b.cls||"";x.disabled=!!b.disabled;x.onclick=b.action;$("dialogFooter").appendChild(x)});$("overlay").style.display="flex";state.returnScreen=state.screen;state.screen="PANEL"}
function close(){ $("overlay").style.display="none";state.screen=state.returnScreen||"EXPLORE";hudDirty=true}
function bar(id,val,limit){const p=clamp(val/Math.max(1,limit)*100,0,100);$(id).style.width=p+"%";$(id).style.background=val/Math.max(1,limit)>1?"#e47770":val/Math.max(1,limit)>=.85?"#e8b96a":"#8fca79"}
function updateHUD(){if(!hudDirty)return;const c=computeMission(state);$("hMasa").textContent=`${fmt(c.total)} / ${LAUNCHERS[state.launcher].cap} kg`;$("hEnergia").textContent=`${fmt(c.req)} / ${fmt(c.gen)} W`;$("hBudget").textContent=`${money(c.cost)} / ${LEVEL.budget[1]} M`;$("hCom").textContent=`${fmt(c.comm)} kbps`;$("hDatos").textContent=`${fmt(c.trans)} / ${fmt(c.di*24*.65)} GB`;$("hTiempo").textContent=`${state.calendar} meses · ${state.completed.size}/8`;bar("bMasa",c.total,LAUNCHERS[state.launcher].cap*.8);bar("bEnergia",c.req,c.gen);bar("bBudget",c.cost*1.2,LEVEL.budget[1]);bar("bCom",.5,c.comm);bar("bDatos",c.di*24*.65,c.trans);bar("bTiempo",LEVEL.calendar-state.calendar,LEVEL.calendar);hudDirty=false}
function option(id,title,desc,selected){return `<button class="option ${selected?"selected":""}" data-v="${id}"><strong>${title}</strong><small>${desc}</small></button>`}
function bindOptions(fn){document.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>fn(b.dataset.v))}
function readout(items){return `<div class="readout">${items.map(x=>`<div><small>${x[0]}</small><b>${x[1]}</b></div>`).join("")}</div>`}
function mainPanel(){const id=state.room,c=computeMission(state);if(id===1){panel("Archivo y briefing",`Dra. Cañahua: «El borrador dice que una antena del tamaño del observatorio cabe en una sonda pequeña». Don Hilario: «Flying, ordena esto».`,`<div class="note"><b>NIVEL 1 · SOBREVUELO</b><br>${LEVEL.brief}<br>Destino: ${LEVEL.destination}. Referencias: ${LEVEL.reference}.<br>Rangos: masa ${LEVEL.mass.join("–")} kg · potencia ${LEVEL.power.join("–")} W EOL · presupuesto ${LEVEL.budget.join("–")} M · enlace ${LEVEL.link.join("–")} kbps · duración ${LEVEL.duration.join("–")} años.<br>Restricción propia: ${LEVEL.special}.</div><div class="note">Borrador defectuoso: estructura 900 kg, antena grande, instrumentos máximos y lanzador ligero. No cumple masa ni presupuesto.</div><p>Tu tarea no es elegir números aislados: debes equilibrar subsistemas. Los cambios se propagan por toda la nave.</p>`,[{text:"Comenzar construcción",cls:"primary",action:()=>{state.completed.add(1);close();}}]);return}
if(id===2){let cards=INSTR.map(i=>`<label class="instrument-card"><input type="checkbox" data-inst="${i.id}" ${state.instrumentIds.includes(i.id)?"checked":""}><span><b>${i.name}</b><br>${i.mass} kg · ${i.power} W · ${i.data} GB/día<br>Ciencia: ${i.science} · Costo: ${i.cost} M</span></label>`).join("");panel("Laboratorio de instrumentos","Puedes llevar varios instrumentos para aprender más del cometa. Pero recuerda: cada uno pesa, necesita electricidad y cuesta dinero. Busca una combinación que te permita investigar sin sobrecargar la nave.",`<div class="note">Elige qué herramientas llevará Flying para estudiar el cometa. Intenta reunir suficiente información sin llenar la nave de equipos. También ajusta el tiempo de la cámara para que las fotos no salgan movidas.</div><div class="instrument-grid">${cards}</div><div id="live">${readout([["Masa instrumentos",c.mi+" kg"],["Potencia",c.pi+" W"],["Datos",c.di+" GB/d"],["Ciencia",c.si]])}</div><div class="exposure-panel"><div><b>Puzzle de exposición</b><br>La nave pasará muy rápido junto al cometa. Ajusta cuánto tiempo estará abierta la cámara: si es demasiado poco, la imagen puede quedar oscura; si no es adecuado, puede salir movida. Velocidad actual: ${state.encounterSpeed} km/s.</div><div class="exposure-heading"><label for="exp">Tiempo de exposición</label><b id="expV">${state.exposure} ms</b></div><input id="exp" type="range" min="2" max="15" step=".5" value="${state.exposure}"><div class="exposure-actions"><button id="expTest">Validar exposición</button><span id="expMsg" aria-live="polite"></span></div></div>`,[{text:"Confirmar instrumentos",cls:"primary",action:()=>{if(!state.exposureKnown){toast("Primero valida la exposición para evitar imágenes movidas.");return}state.instrumentIds=[...document.querySelectorAll("[data-inst]:checked")].map(x=>x.dataset.inst);if(!state.instrumentIds.length){toast("Selecciona al menos un instrumento.");return}state.completed.add(2);close();changed(2)}}]);document.querySelectorAll("[data-inst]").forEach(x=>x.onchange=()=>{const selected=INSTR.filter(i=>[...document.querySelectorAll("[data-inst]:checked")].some(z=>z.dataset.inst===i.id));$("live").innerHTML=readout([["Masa instrumentos",selected.reduce((a,i)=>a+i.mass,0)+" kg"],["Potencia",selected.reduce((a,i)=>a+i.power,0)+" W"],["Datos",selected.reduce((a,i)=>a+i.data,0)+" GB/d"],["Ciencia",selected.reduce((a,i)=>a+i.science,0)]])});$("exp").oninput=e=>{$("expV").textContent=e.target.value+" ms";state.exposure=+e.target.value;state.exposureKnown=false;$("expMsg").textContent=""};$("expTest").onclick=()=>{state.exposureKnown=state.exposure>=state.encounterSpeed*.55;$("expMsg").textContent=state.exposureKnown?"Correcto: la exposición evita el arrastre.":"Aumenta la exposición o reduce la velocidad.";};return}
if(id===3){panel("Taller de estructura","La estructura es el esqueleto que mantiene unida la nave. El blindaje la protege del entorno. Ambos añaden peso y, cuanto más pese la nave, más combustible necesitará para viajar.",`<div class="note">Ya elegiste los instrumentos. Ahora ajusta el tamaño de la estructura y la protección. Trata de que sea resistente, pero no tan pesada que la nave necesite demasiado combustible.</div><div class="field">Estructura <b id="strV">${state.structure} kg</b><input id="str" type="range" min="300" max="900" step="10" value="${state.structure}"></div><div class="field">Blindaje / térmica <b id="shV">${state.shield} kg</b><input id="sh" type="range" min="30" max="220" step="5" value="${state.shield}"></div><div id="strRead">${readout([["Masa seca",c.dry+" kg"],["Propelente",c.prop+" kg"],["Masa total",c.total+" kg"]])}</div>`,[{text:"Confirmar estructura",cls:"primary",action:()=>{state.structure=+$("str").value;state.shield=+$("sh").value;state.completed.add(3);close();changed(3)}}]);const upd=()=>{state.structure=+$("str").value;state.shield=+$("sh").value;$("strV").textContent=state.structure+" kg";$("shV").textContent=state.shield+" kg";let v=computeMission(state);$("strRead").innerHTML=readout([["Masa seca",v.dry+" kg"],["Propelente",fmt(v.prop)+" kg"],["Masa total",fmt(v.total)+" kg"]])};$("str").oninput=upd;$("sh").oninput=upd;return}
if(id===4){panel("Sala de energía","La nave necesita electricidad para que funcionen sus instrumentos y equipos. Elige una fuente que siga dando suficiente energía incluso después de mucho tiempo de viaje.",`<div class="note">Demanda actual ${fmt(c.req)} W. Margen mínimo exigido: 20 %. El envejecimiento reduce la potencia EOL.</div><div class="options">${Object.entries(SOURCES).map(([k,v])=>option(k,v.name,`${v.power} W BOL · ${v.mass} kg · ${v.cost} M`,state.confirmed.source&&state.source===k)).join("")}</div><div id="srcRead">${readout([["Potencia EOL",fmt(c.gen)+" W"],["Demanda",fmt(c.req)+" W"]])}</div><div class="field">Experimento solar: lectura relativa = 100 / distancia². La misión opera a 1.4 UA.<label>Distancia de prueba <b id="solarV">1 UA</b></label><input id="solar" type="range" min="1" max="3" step=".1" value="1"><button id="solarTest">Registrar lectura</button><span id="solarMsg"></span></div>`,[{text:"Confirmar fuente",cls:"primary",action:()=>{if(!state.solarKnown){toast("Primero registra el experimento solar.");return}if(!state.confirmed.source){toast("Selecciona una opcion.");return}state.completed.add(4);close();changed(4)}}]);bindOptions(k=>{state.source=k;state.confirmed.source=true;document.querySelectorAll("[data-v]").forEach(x=>x.classList.toggle("selected",x.dataset.v===k));let v=computeMission(state);$("srcRead").innerHTML=readout([["Potencia EOL",fmt(v.gen)+" W"],["Demanda",fmt(v.req)+" W"],["Masa fuente",SOURCES[k].mass+" kg"]])});$("solar").oninput=e=>$("solarV").textContent=e.target.value+" UA";$("solarTest").onclick=()=>{const d=+$("solar").value;state.solarKnown=Math.abs(d-1.4)<.06;$("solarMsg").textContent=state.solarKnown?"Factor solar registrado. La potencia disminuye con el cuadrado de la distancia.":"Esa distancia no representa el escenario de esta misión.";};return}
if(id===5){panel("Sala de comunicaciones","La antena es la forma en que la nave se comunica con la Tierra. Una antena más grande puede enviar mejor la información, pero también pesa más y necesita energía.",`<div class="note">Datos generados: ${c.di} GB/día. La descarga depende de potencia del transmisor, diámetro y distancia.</div><div class="options">${Object.entries(ANT).map(([k,v])=>option(k,v.name,`D=${v.d} m · Tx ${v.tx} W · masa ${v.mass} kg · ${v.cost} M`,state.confirmed.antenna&&state.antenna===k)).join("")}</div><div id="antRead">${readout([["Enlace",fmt(c.comm)+" kbps"],["Descarga",fmt(c.trans)+" GB"],["Masa",ANT[state.antenna].mass+" kg"]])}</div>`,[{text:"Confirmar antena",cls:"primary",action:()=>{if(!state.confirmed.antenna){toast("Selecciona una opcion.");return}state.completed.add(5);close();changed(5)}}]);bindOptions(k=>{state.antenna=k;state.confirmed.antenna=true;document.querySelectorAll("[data-v]").forEach(x=>x.classList.toggle("selected",x.dataset.v===k));let v=computeMission(state);$("antRead").innerHTML=readout([["Enlace",fmt(v.comm)+" kbps"],["Descarga",fmt(v.trans)+" GB"],["Masa",ANT[k].mass+" kg"]])});return}
if(id===6){panel("Propulsión y órbita","En esta sala decides cómo se moverá la nave. El motor y la cantidad de combustible deben permitirle seguir la ruta sin hacer que pese demasiado ni gastar más dinero del disponible.",`<div class="note">Nivel 1: C3 ≥ 100 km²/s² y velocidad de encuentro de 10–15 km/s. Isp mayor reduce propelente, pero puede aumentar costo.</div><div class="options">${Object.entries(ENGINES).map(([k,v])=>option(k,v.name,`Isp ${v.isp} s · ${v.cost} M`,state.confirmed.engine&&state.engine===k)).join("")}</div><div class="field">Delta-v de crucero <b id="dvV">${state.dv} m/s</b><input id="dv" type="range" min="900" max="3200" step="50" value="${state.dv}">C3 de lanzamiento <b id="c3V">${state.c3} km²/s²</b><input id="c3" type="range" min="80" max="180" step="5" value="${state.c3}">Velocidad de encuentro <b id="speedV">${state.encounterSpeed} km/s</b><input id="speed" type="range" min="10" max="15" step=".5" value="${state.encounterSpeed}"></div><div id="dvRead">${readout([["Propelente",fmt(c.prop)+" kg"],["Masa total",fmt(c.total)+" kg"]])}</div><button id="dvPuzzle">Validar secuencia de maniobras</button><span id="dvMsg"></span>`,[{text:"Confirmar trayectoria",cls:"primary",action:()=>{if(!state.dvKnown){toast("Primero valida la secuencia de maniobras.");return}if(!state.confirmed.engine){toast("Selecciona una opcion.");return}state.completed.add(6);close();changed(6)}}]);bindOptions(k=>{state.engine=k;state.confirmed.engine=true;document.querySelectorAll("[data-v]").forEach(x=>x.classList.toggle("selected",x.dataset.v===k));updateDv()});$("dv").oninput=e=>{state.dv=+e.target.value;updateDv()};$("c3").oninput=e=>{state.c3=+e.target.value;updateDv()};$("speed").oninput=e=>{state.encounterSpeed=+e.target.value;updateDv()};function updateDv(){state.dvKnown=false;state.dv=+$("dv").value;state.c3=+$("c3").value;state.encounterSpeed=+$("speed").value;$("dvV").textContent=state.dv+" m/s";$("c3V").textContent=state.c3+" km²/s²";$("speedV").textContent=state.encounterSpeed+" km/s";let v=computeMission(state);$("dvRead").innerHTML=readout([["Propelente",fmt(v.prop)+" kg"],["Masa total",fmt(v.total)+" kg"]])} $("dvPuzzle").onclick=()=>{state.dvKnown=state.dv>=1000&&state.dv<=2200&&state.c3>=100&&state.encounterSpeed>=10&&state.encounterSpeed<=15;$("dvMsg").textContent=state.dvKnown?"Trayectoria dentro de la ventana de diseño.":"La maniobra no alcanza una trayectoria compatible.";};return}
if(id===7){panel("Oficina de presupuesto","La reserva evita que una estimación optimista deje la misión sin recursos.",`<div class="note">Presupuesto de referencia ${LEVEL.budget[1]} M USD. Se exige 20 % de reserva sobre el costo calculado. Cada cambio confirmado al volver a una sala consume un mes.</div>${readout([["Costo estimado",money(c.cost)],["Con reserva",money(c.cost*1.2)],["Límite",money(c.budget)],["Calendario restante",state.calendar+" meses"]])}<div class="field">Sensibilidad: <button id="whatif">¿Qué pasa si añado 10 kg de estructura?</button><span id="whatifOut"></span></div>`,[{text:"Confirmar presupuesto",cls:"primary",action:()=>{state.completed.add(7);close();changed(7)}}]);$("whatif").onclick=()=>{const a=computeMission(state),b=computeMission({...state,structure:state.structure+10});state.sensitivity=true;$("whatifOut").textContent=` Masa total +${fmt(b.total-a.total)} kg; propelente +${fmt(b.prop-a.prop)} kg; costo +${fmt(b.cost-a.cost)} M.`};return}
if(id===8){panel("Hangar de lanzamiento","El lanzador debe soportar la masa total con 20 % de reserva. La capacidad depende de la arquitectura seleccionada.",`<div class="options">${Object.entries(LAUNCHERS).map(([k,v])=>option(k,v.name,`Capacidad ${v.cap} kg · ${v.cost} M`,state.confirmed.launcher&&state.launcher===k)).join("")}</div><div id="launchRead">${readout([["Masa",fmt(c.total)+" kg"],["Capacidad útil",fmt(c.capacity*.8)+" kg"]])}</div>`,[{text:"Confirmar lanzador",cls:"primary",action:()=>{if(!state.confirmed.launcher){toast("Selecciona una opcion.");return}state.completed.add(8);close();changed(8)}}]);bindOptions(k=>{state.launcher=k;state.confirmed.launcher=true;document.querySelectorAll("[data-v]").forEach(x=>x.classList.toggle("selected",x.dataset.v===k));let v=computeMission(state);$("launchRead").innerHTML=readout([["Masa",fmt(v.total)+" kg"],["Capacidad útil",fmt(v.capacity*.8)+" kg"]])+`<p class="${v.total<=v.capacity*.8?"good":"warning"}">${v.total<=v.capacity*.8?"Masa dentro del límite.":"Excede capacidad con reserva."}</p>`});return}
if(id===9){const fails=explainFailures(c),crit=[["mass","Masa"],["power","Potencia"],["budget","Presupuesto"],["comm","Comunicaciones"],["data","Datos"],["dv","Trayectoria"]];panel("Sala de control · Revisión de propagación","Declara cuál crees que es la restricción más crítica. El motor comparará tu hipótesis con el menor margen relativo.",`${readout([["Masa total",fmt(c.total)+" kg"],["Potencia EOL",fmt(c.gen)+" W"],["Demanda",fmt(c.req)+" W"],["Costo",money(c.cost)],["Enlace",fmt(c.comm)+" kbps"],["Ciencia",fmt(c.science)]])}<div class="field"><b>Restricción más crítica (tu diagnóstico)</b><select id="critical" style="width:100%;padding:8px;margin-top:7px;background:#202630;color:white"><option value="" disabled selected>Elige tu diagnostico</option>${crit.map(([k,v])=>`<option value="${k}" ${state.critical===k?"selected":""}>${v}</option>`).join("")}</select></div>${fails||`<p class="good">Todas las verificaciones duras están dentro de rango.</p>`}<button id="sensitivityBtn" class="small">Ver sensibilidad</button><span id="sensitivityOut"></span><div class="note">Sensibilidad registrada: ${state.sensitivity?"sí":"no"}. Calendario restante: ${state.calendar} meses.</div>`,[{text:"Validar perfil y simular",cls:"primary",disabled:!c.hard.every(x=>x.ok)||!state.sensitivity,action:()=>{if(!$("critical").value){toast("Elige tu diagnostico.");return}state.critical=$("critical").value;state.screen="SIM";state.travel=0;state.simMessage="Validando perfil...";close();state.screen="SIM"}} ,{text:"Volver a explorar",action:close}]);$("sensitivityBtn").onclick=()=>{const base=computeMission(state),tests=[["+10 kg estructura",computeMission({...state,structure:state.structure+10})],["Antena inmediatamente menor",computeMission({...state,antenna:state.antenna==="large"?"medium":"small"})],["+100 m/s delta-v",computeMission({...state,dv:state.dv+100})]];$("sensitivityOut").innerHTML=tests.map(([n,v])=>`<div class="field">${n}: masa ${fmt(v.total-base.total)} kg Δ · potencia requerida ${fmt(v.req-base.req)} W Δ · costo ${fmt(v.cost-base.cost)} M Δ</div>`).join("");state.sensitivity=true};return}}
function changed(room){invalidation(room);hudDirty=true;updateMini();toast("Cambio propagado: revisa masa, potencia, costo y datos.");}
function notePanel(){panel("Nota de ingeniería","Don Hilario dejó una nota junto al equipo.",`<div class="note">No diseñes cada subsistema por separado. La masa seca afecta al propelente; la potencia y la antena afectan a la descarga; la duración degrada la fuente.</div>`,[{text:"Volver",action:close}])}
function openBoard(){if(state.screen==="SIM")return;const c=computeMission(state);panel("Pizarra de Flying · Propagación en vivo","Cada decisión modifica más de una variable. Las barras muestran márgenes y no solo valores aislados.",`${readout([["Masa seca",fmt(c.dry)+" kg"],["Propelente",fmt(c.prop)+" kg"],["Masa total",fmt(c.total)+" kg"],["Potencia requerida",fmt(c.req)+" W"],["Potencia EOL",fmt(c.gen)+" W"],["Enlace",fmt(c.comm)+" kbps"],["Datos transmitidos",fmt(c.trans)+" GB"],["Ciencia",fmt(c.science)],["Costo",money(c.cost)],["Calendario",state.calendar+" meses"]])}<div class="note">Cadena de causa dominante: ${c.critical}. Cambiar instrumentos, antena o delta-v puede alterar varios márgenes simultáneamente.</div>`,[{text:"Cerrar",action:close}])}
function startFinal(){const c=computeMission(state),ok=c.hard.every(x=>x.ok),marginEfficiency=[c.margins.mass,c.margins.power,c.margins.budget].reduce((a,m)=>a+Math.max(0,1-Math.abs(m-.2)/.3),0)/3,score=Math.round(30*Math.min(1,c.science/LEVEL.science)+20*marginEfficiency+15*Math.min(1,Math.max(0,c.margins.budget)/.2)+15*(state.critical===c.critical?1:.5)+10*(state.sensitivity?1:0)+10*state.calendar/LEVEL.calendar);const result=!ok?"FALLO":c.science>=LEVEL.science?"ÉXITO":"ÉXITO PARCIAL";state.report=`VILLA ANURA · NIVEL 1: SOBREVUELO\nResultado: ${result}\nPuntaje: ${clamp(score,0,100)}/100\nMasa seca: ${fmt(c.dry)} kg · propelente: ${fmt(c.prop)} kg · total: ${fmt(c.total)} kg\nPotencia requerida: ${fmt(c.req)} W · potencia EOL: ${fmt(c.gen)} W\nEnlace: ${fmt(c.comm)} kbps · datos recuperados: ${fmt(c.trans)} GB\nCosto: ${money(c.cost)} · presupuesto: ${LEVEL.budget[1]} M\nRestricción real más crítica: ${c.critical}. Declarada: ${state.critical}.\nSensibilidad: ${state.sensitivity?"registrada":"no registrada"}.\n\n${c.hard.filter(x=>!x.ok).map(x=>x.why).join("\n")||"El perfil superó las verificaciones del modelo."}\n\n${result==="FALLO"?"Flying recomienda volver al taller. La física no acepta sobornos.":"La misión completó el perfil de diseño. Don Hilario solicita que no le entreguen otra hoja de cálculo."}`;$("overlay").style.display="none";panel("Informe de misión",result,`<div id="report"><pre style="white-space:pre-wrap;font:12px/1.6 monospace">${state.report}</pre><p>Estrellas: ${score>=85?"★★★":score>=65?"★★":score>=45?"★":"—"}</p><p class="note">Los módulos validados de este nivel (antena y apuntado) quedan disponibles como herencia conceptual para el siguiente caso.</p></div>`,[{text:"Copiar informe",action:()=>navigator.clipboard?.writeText(state.report).then(()=>toast("Informe copiado."),()=>toast("No se pudo copiar automáticamente."))},{text:"Reintentar nivel",cls:"primary",action:()=>{close();state.screen="EXPLORE";state.room=1;state.x=160;state.y=130;state.completed=new Set([1]);state.calendar=24;hudDirty=true;updateMini()}},{text:"Volver al título",action:()=>{close();state.screen="TITLE"}}]);}
function showIntro(){panel("Briefing de Villa Anura","Dra. Cañahua: «Tenemos un sobrevuelo, un presupuesto y una hoja de cálculo que parece una tortilla». Dr. Tembleque: «La masa es como unos cuantos». Don Hilario: «Flying, tú sí observas las cosas».",`<div class="note">Flying: «El problema no es elegir piezas bonitas. Es conseguir que masa, potencia, datos, comunicaciones, propelente y presupuesto sean compatibles. Croac.»</div><p><b>Campaña de seis casos de estudio</b></p><div class="options">${LEVELS.map((v,i)=>`<div class="field"><b>${i+1}. ${v.name}</b><br><small>${v.destination} · ${v.reference}</small><p>${v.brief}</p><span class="${v.active?"good":"warning"}">${v.active?"DISPONIBLE EN ESTE PROTOTIPO":"FICHA PREPARADA · FASE FUTURA"}</span></div>`).join("")}</div><p>El MVP implementa de principio a fin el Nivel 1: Sobrevuelo. Los niveles 2 a 6 quedan definidos como fichas de campaña, sin presentarse como jugables todavía.</p>`,[{text:"Entrar al archivo",cls:"primary",action:()=>{close();state.screen="EXPLORE";state.started=true;state.visited.add(1)}}])}
/* DIALOGOS / SIMULACION */
function simFrame(){document.body.classList.add("launching");if(state.travel>=14){document.body.classList.remove("launching");startFinal()}}

const GUIDES = [
 ["Archivo y briefing", "Aquí definimos el objetivo de la misión. Un sobrevuelo pasa junto a su destino sin quedarse en órbita. La observación dura poco y hay que preparar los instrumentos antes del encuentro.", "El briefing reúne los límites de masa, energía, dinero y ciencia. Las decisiones de las siguientes salas afectan a todo el vehículo."],
 ["Laboratorio de instrumentos", "Los instrumentos son los sentidos de la sonda. Una cámara registra imágenes, un espectrómetro estudia la luz para investigar materiales, el analizador recoge información del polvo y el magnetómetro mide campos magnéticos.", "Cada instrumento necesita electricidad, añade masa y produce datos que debemos transmitir. El experimento de exposición representa cómo ajustar la captura durante un encuentro rápido."],
 ["Taller de estructura", "La estructura sostiene las piezas y soporta esfuerzos durante el lanzamiento. El blindaje y la protección térmica ayudan a proteger los equipos del entorno espacial.", "La masa seca incluye el vehículo sin propelente. Al aumentar esa masa, también aumenta el propelente necesario para realizar una misma maniobra. Los valores de este prototipo simplifican ese diseño."],
 ["Sala de energía", "Los paneles solares convierten luz en electricidad. Un generador de radioisótopos aprovecha calor para generar electricidad. La opción híbrida combina fuentes en este modelo.", "Los equipos y el transmisor comparten la energía disponible. Hay que considerar el envejecimiento de la fuente y conservar un margen. El experimento muestra cómo disminuye la iluminación al alejarse del Sol."],
 ["Sala de comunicaciones", "La antena permite que Flying envíe a la Tierra las fotos y los datos que consiga. Una antena más grande puede ayudar a que llegue más información, pero ocupa más espacio, pesa más y cuesta más.", "Una mejor descarga puede exigir más masa, electricidad y presupuesto. Recoger datos sirve de poco si la misión no consigue enviarlos. Compara la producción de instrumentos con la capacidad de descarga."],
 ["Propulsión y órbita", "Aquí eliges el motor y preparas la ruta. El cambio de velocidad indica cuánto puede cambiar su rapidez la nave. Un motor que aprovecha mejor el combustible puede ayudar a reducir cuánto necesita llevar.", "C3 caracteriza la energía de salida de la trayectoria. La velocidad de encuentro influye en la observación del objetivo. La maqueta del sistema solar es ilustrativa y sus tamaños y distancias no están a escala."],
 ["Oficina de presupuesto", "Aquí sumamos los costos de los subsistemas, el lanzamiento y las operaciones. La reserva permite afrontar desviaciones sobre lo previsto.", "El análisis de sensibilidad cambia una cantidad pequeña para observar sus efectos en el resto del diseño. Añadir estructura también cambia el propelente. Las revisiones consumen tiempo del calendario del prototipo."],
 ["Hangar de lanzamiento", "El lanzador transporta la misión fuera de la Tierra. Su capacidad debe cubrir la masa de la sonda y su propelente, conservando la reserva indicada en el desafío.", "Una clase de mayor capacidad también cuesta más. Comprueba que el vehículo elegido sea compatible tanto con la masa total como con el presupuesto."],
 ["Sala de control", "Reunimos las decisiones y comprobamos que el conjunto pueda cumplir la misión. La revisión incluye masa, potencia, comunicaciones, trayectoria, presupuesto y ciencia.", "Antes de despegar, revisa si la nave tiene un peso adecuado, suficiente energía, buena comunicación y dinero para completar la misión. Elige cuál crees que es el mayor problema y corrígelo antes del lanzamiento."]
];
function guidePanel(){const [name,first,second]=GUIDES[state.room-1];panel("Guía de misión",name,`<p class="desc">${first}</p><p class="desc">${second}</p>`,[{text:"Volver a la sala",action:close}])}
function drawLaunch(){
 const t=state.travel, ascent=Math.max(0,t-3), altitude=ascent*ascent*2.8;
 const sky=ctx.createLinearGradient(0,0,0,192);sky.addColorStop(0,"#030916");sky.addColorStop(1,t<7?"#364b66":"#0b1a30");ctx.fillStyle=sky;ctx.fillRect(0,0,320,192);
 for(let i=0;i<65;i++){ctx.fillStyle=i%3?"#becbd9":"#ffffff";ctx.fillRect((i*73)%320,((i*37)+altitude*.25)%170,1,1)}
 ctx.save();ctx.translate(t>3&&t<7?Math.sin(t*90)*.6:0,0);
 const ground=171+altitude;ctx.fillStyle="#152329";ctx.fillRect(0,ground,320,80);ctx.fillStyle="#536371";ctx.fillRect(108,ground-96,6,96);for(let y=ground-90;y<ground;y+=12)ctx.fillRect(108,y,24,3);
 const y=109-Math.max(0,t-9)*14;
 if(t>2){const glow=ctx.createRadialGradient(160,y+36,1,160,y+36,60);glow.addColorStop(0,"#ffcc77aa");glow.addColorStop(1,"#ff880000");ctx.fillStyle=glow;ctx.fillRect(100,y-20,120,120);ctx.fillStyle="#ff792d";ctx.beginPath();ctx.moveTo(151,y+27);ctx.lineTo(160,y+65+Math.sin(t*48)*7);ctx.lineTo(169,y+27);ctx.fill();ctx.fillStyle="#fff1b1";ctx.beginPath();ctx.moveTo(155,y+27);ctx.lineTo(160,y+49);ctx.lineTo(165,y+27);ctx.fill();}
 for(let i=0;i<22&&t>2;i++){ctx.fillStyle="rgba(193,204,211,.18)";ctx.beginPath();ctx.arc(160+Math.sin(i*17)*((t-2)*8+i),ground+8-i%4*5,8+(i%5)*3,0,Math.PI*2);ctx.fill()}
 ctx.fillStyle="#b4c7d8";ctx.beginPath();ctx.moveTo(150,y+9);ctx.lineTo(140,y+32);ctx.lineTo(153,y+28);ctx.lineTo(167,y+28);ctx.lineTo(180,y+32);ctx.lineTo(170,y+9);ctx.fill();
 const hull=ctx.createLinearGradient(150,0,170,0);hull.addColorStop(0,"#8599ae");hull.addColorStop(.45,"#ffffff");hull.addColorStop(1,"#9bafc0");ctx.fillStyle=hull;ctx.fillRect(150,y-31,20,59);ctx.beginPath();ctx.moveTo(150,y-31);ctx.quadraticCurveTo(151,y-50,160,y-61);ctx.quadraticCurveTo(169,y-50,170,y-31);ctx.fill();ctx.fillStyle="#b85739";ctx.fillRect(150,y-19,20,5);ctx.fillStyle="#163d5c";ctx.beginPath();ctx.arc(160,y-28,4,0,Math.PI*2);ctx.fill();ctx.restore();
 ctx.fillStyle="#02060c";ctx.fillRect(0,0,320,19);ctx.fillRect(0,170,320,22);ctx.textAlign="center";ctx.fillStyle="#f4e8cf";ctx.font="8px monospace";ctx.fillText(t<3?"SECUENCIA DE IGNICIÓN · "+Math.ceil(3-t):t<7?"DESPEGUE":t<11?"RUMBO A LAS ESTRELLAS":"COMIENZA LA MISIÓN",160,183);ctx.textAlign="left";
}

/* MAIN */
function nearest(){const objects=[roomObjects(state.room)[0],{x:265,y:151,label:"Hablar con el guía",action:"guide"}];return objects.filter(o=>Math.hypot(o.x-state.x,o.y-state.y)<40).sort((a,b)=>Math.hypot(a.x-state.x,a.y-state.y)-Math.hypot(b.x-state.x,b.y-state.y))[0]||null}
function interact(){if(state.screen==="TITLE"){showIntro();return}if(state.screen==="EXPLORE"){const target=nearest();if(target?.action==="guide")guidePanel();else if(target)mainPanel();else notePanel()}}
function move(dt){if(state.screen!=="EXPLORE")return;let dx=0,dy=0;if(keys.ArrowLeft||keys.a||keys.A)dx--;if(keys.ArrowRight||keys.d||keys.D)dx++;if(keys.ArrowUp||keys.w||keys.W)dy--;if(keys.ArrowDown||keys.s||keys.S)dy++;if(dx&&dy){dx*=.707;dy*=.707}if(dx||dy){state.walk=1;state.anim+=dt;if(dx!==0)state.face=dx>0?1:-1;state.x+=dx*85*dt;state.y+=dy*85*dt}else state.walk=0;state.x=clamp(state.x,15,305);state.y=clamp(state.y,20,172);const here=xy(state.room);const next=state.room<9?state.room+1:null,prev=state.room>1?state.room-1:null;for(const [to,side] of [[next,"next"],[prev,"prev"]]){if(!to||!neighbor(state.room,to))continue;const dest=xy(to),dxr=dest.x-here.x,dyr=dest.y-here.y;let hit=(dxr===1&&state.x>300&&Math.abs(state.y-96)<23)||(dxr===-1&&state.x<20&&Math.abs(state.y-96)<23)||(dyr===1&&state.y>168&&Math.abs(state.x-160)<25)||(dyr===-1&&state.y<22&&Math.abs(state.x-160)<25);if(hit){if(side==="next"&&!state.completed.has(state.room)){toast("Completa la decisión de esta sala antes de avanzar.");state.x=dxr===1?298:dxr===-1?22:state.x;state.y=dyr===1?166:dyr===-1?24:state.y;return}transition(to);return}}}
function frame(now){const dt=Math.min(.05,(now-last)/1000||0);last=now;if(state.screen==="EXPLORE"){move(dt);const o=nearest();$("hint").textContent=o?"[E] "+o.label:"WASD / Flechas: mover · E: interactuar · L: pizarra";$("hint").style.display="block"}else if(state.screen==="SIM"){state.travel+=dt;simFrame()}render();updateHUD();requestAnimationFrame(frame)}
function keydown(e){const k=e.key;if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(k))e.preventDefault();keys[k]=true;if(!e.repeat&&(k==="e"||k==="E"||k===" "))interact();if(k==="Enter"&&state.screen==="TITLE")interact();if(k==="l"||k==="L")openBoard();if(k==="Escape"&&$("overlay").style.display==="flex")close();if(k==="m"||k==="M")toggleSound()}
function toggleSound(){state.sound=!state.sound;$("soundBtn").textContent="Audio: "+(state.sound?"ON":"OFF")+" [M]";if(state.sound)beep(600)}
function beep(f=440){if(!state.sound)return;try{const A=state.audio||(state.audio=new(window.AudioContext||window.webkitAudioContext)()),o=A.createOscillator(),g=A.createGain();o.frequency.value=f;g.gain.value=.04;o.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+.08)}catch(e){}}
$("notebookBtn").onclick=openBoard;$("soundBtn").onclick=toggleSound;$("overlay").addEventListener("click",e=>{if(e.target===$("overlay"))close()});$("gameCanvas").addEventListener("click",interact);document.addEventListener("keydown",keydown);document.addEventListener("keyup",e=>keys[e.key]=false);window.addEventListener("blur",()=>keys={});updateMini();
const fullscreenBtn=$("fullscreenBtn");
if(fullscreenBtn){
 fullscreenBtn.addEventListener("click",async()=>{
  try{
   if(!document.fullscreenElement){
    await document.documentElement.requestFullscreen();
    document.body.classList.add("fullscreen-mode");
    fullscreenBtn.textContent="Salir de pantalla completa";
   }else{
    await document.exitFullscreen();
   }
  }catch(err){
   document.body.classList.toggle("fullscreen-mode");
   fullscreenBtn.textContent=document.body.classList.contains("fullscreen-mode")?"Salir de pantalla completa":"Pantalla completa";
  }
 });
 document.addEventListener("fullscreenchange",()=>{
  const active=!!document.fullscreenElement;
  document.body.classList.toggle("fullscreen-mode",active);
  fullscreenBtn.textContent=active?"Salir de pantalla completa":"Pantalla completa";
 });
}

requestAnimationFrame(frame);
/* Campaña: modelos educativos calibrados con los documentos del proyecto. */
const campaign = {level:1, practice:false, results:{}, modules:{}, design:null};
const missionProfiles = {
 2:{name:'Orbitador',destination:'Marte',budget:2500,mass:[1500,6000],power:[500,3000],years:4,margin:.22,science:16,scale:2,structure:[600,1800,50],shield:[40,250,10],dv:[800,2500,100],capacity:[3500,5000,7500],link:60,window:86400,period:'día',dataScale:1,calendar:30,goal:'Hacer que la nave se quede dando vueltas alrededor de Marte y dejar listo un punto de comunicación para la siguiente sonda.',special:'Prepara los movimientos para entrar en órbita, protege los equipos electrónicos y escoge una órbita desde la que pueda comunicarse la siguiente sonda.'},
 3:{name:'Sonda atmosférica',destination:'Atmósfera de Yaku · escenario ficticio',budget:700,mass:[150,400],power:[50,300],years:0,margin:.24,science:14,scale:.18,structure:[50,120,5],shield:[60,160,5],dv:[0,0,1],capacity:[400,500,650],link:.25,window:5400,period:'descenso',dataScale:.0004,calendar:18,goal:'Medir cómo es la atmósfera de Yaku y enviar la información antes de que la sonda pierda contacto con la nave que la acompaña.',special:'El escudo térmico debe tener un peso adecuado para proteger la sonda. Coordina el descenso con la duración de la batería y el tiempo durante el que podrá comunicarse.'},
 4:{name:'Aterrizador',destination:'Marte',budget:900,mass:[350,1000],power:[100,600],years:1,margin:.26,science:14,scale:.55,structure:[180,500,10],shield:[30,150,5],dv:[2000,6000,100],capacity:[1800,2500,3500],link:2,window:14400,period:'sol',dataScale:.01,calendar:24,goal:'Llegar al suelo sin golpearse, escoger un lugar seguro y mantener los instrumentos funcionando.',special:'Elige un terreno que no sea demasiado inclinado, procura que la nave toque el suelo despacio y asegúrate de que pueda frenar a tiempo.'},
 5:{name:'Rover',destination:'Marte',budget:2700,mass:[180,1050],power:[110,900],years:2,margin:.28,science:16,scale:.6,structure:[180,600,10],shield:[30,150,5],dv:[0,0,1],capacity:[1200,1700,2200],link:12,window:900,period:'sol',dataScale:.004,calendar:30,goal:'Moverse por un terreno seguro, investigar y administrar la energía para que alcance durante la jornada.',special:'Reparte la energía entre moverse, mantenerse caliente y hacer mediciones. El rover debe poder tomar decisiones por sí mismo porque las instrucciones desde la Tierra tardan en llegar.'},
 6:{name:'Retorno de muestras',destination:'Yaku · campaña ficticia',budget:8000,mass:[1500,4500],power:[500,3000],years:6,margin:.30,science:18,scale:1.5,structure:[400,1200,50],shield:[100,400,25],dv:[4000,6500,100],capacity:[5000,6500,8000],link:15,window:8640000,period:'campaña',dataScale:8,calendar:36,goal:'Recoger un poco de material del destino, guardarlo bien y traerlo de vuelta a la Tierra.',special:'La nave debe tener combustible para ir y volver, proteger la muestra y reutilizar al menos tres equipos de misiones anteriores. Cada paso debe funcionar para que la muestra llegue a casa.'}
};
const moduleSpecs=[{mass:20,power:10,cost:100},{mass:40,power:5,cost:120},{mass:50,power:0,cost:80},{mass:60,power:10,cost:140},{mass:75,power:20,cost:160}];
const moduleNames=['Antena y apuntado','Motor y blindaje','TPS y baterías','Descenso propulsivo','Movilidad y autonomía'];
const sequenceNames={2:['Frenado de captura','Circularización','Ajuste de plano'],6:['Lanzamiento','Crucero','Aterrizaje','Recolección','Ascenso','Encuentro orbital','Retorno','Reentrada']};
const stockState={...state,confirmed:{},instrumentIds:[...state.instrumentIds]};
function newDesign(n){const p=missionProfiles[n];return {instruments:[],structure:p.structure[1],shield:p.shield[0],power:p.power[0],source:'',antenna:'',engine:'',dv:p.dv[0],launcher:'',duration:n===3?180:p.years,orbit:'',aero:'',site:'',contact:5,route:'',drive:12,heat:2,measure:1,sample:20,seals:1,redundancy:'',reuse:[],sequence:[],start:120,scienceTest:false,energyTest:false,linkTest:false,sensitivity:false,critical:''}}
function availableModules(){return campaign.practice?Object.fromEntries(moduleNames.map((name,i)=>[i+1,{name,...moduleSpecs[i],relay:100,edl:850}])):campaign.modules}
function computeProfile(n,d,heritage={}){
 const p=missionProfiles[n],ins=INSTR.filter(i=>d.instruments.includes(i.id));
 const mi=ins.reduce((v,i)=>v+i.mass*p.scale,0),pi=ins.reduce((v,i)=>v+i.power*p.scale,0);
 const data=ins.reduce((v,i)=>v+i.data*p.dataScale,0),baseScience=ins.reduce((v,i)=>v+i.science,0);
 const ant={compact:{mass:8*p.scale,tx:8,gain:1,cost:25},medium:{mass:16*p.scale,tx:15,gain:2.5,cost:50},large:{mass:30*p.scale,tx:25,gain:5,cost:95}}[d.antenna]||{mass:0,tx:0,gain:0,cost:0};
 const battery=d.source==='battery',rtg=d.source==='rtg';
 const sourceMass=battery?d.power*d.duration/60/150:rtg?d.power/2.5:d.power/12;
 const reused=[...new Set(d.reuse)].filter(id=>id<n&&heritage[id]);
 const inheritedMass=reused.reduce((sum,id)=>sum+(heritage[id].mass||moduleSpecs[id-1].mass),0);
 const inheritedPower=reused.reduce((sum,id)=>sum+(heritage[id].power??moduleSpecs[id-1].power),0);
 const special=n===5?75:n===6?d.sample*12+d.seals*25+(d.redundancy==='dual'?100:0):0;
 const dry=d.structure+d.shield+mi+sourceMass+ant.mass+special+inheritedMass;
 const isp=d.engine==='efficient'?450:320,prop=(n===3||n===5)?0:dry*(Math.exp(d.dv/(9.81*isp))-1),total=dry+prop;
 const sourceDecay=battery?1:Math.pow(rtg?.992:.97,p.years)*(n===4&&!rtg?.8:1);
 const gen=d.source?d.power*sourceDecay:0;
 const req=20+pi+inheritedPower+ant.tx/.3+.08*dry+(n===5?35:0);
 const relay=heritage[2]?.relay||80,edl=heritage[4]?.edl||650;
 const overlap=n===3?Math.max(0,Math.min(d.start+d.duration,relay)-d.start):0;
 const seconds=n===3?overlap*60:p.window;
 const rate=p.link*ant.tx*ant.gain/(1+dry/3000),trans=rate*seconds/8000000;
 const fraction=data?Math.min(1,trans/data):0;
 const science=baseScience*fraction*(n===2&&d.orbit==='relay'?1.05:1);
 const used=[...new Set(d.reuse)].filter(id=>id<n&&heritage[id]);
 const launchIndex=['light','medium','heavy'].indexOf(d.launcher),capacity=p.capacity[Math.max(0,launchIndex)];
 const baseCost=ins.reduce((v,i)=>v+i.cost,0)+total*.12+d.power*.12+ant.cost+(launchIndex+1)*70+d.shield*.15+p.years*10+(n===6?d.seals*80+(d.redundancy==='dual'?250:0):0);
 const cost=baseCost+used.reduce((sum,id)=>sum+.85*(heritage[id].cost||moduleSpecs[id-1].cost),0);
 const rules=[];
 const add=(id,label,value,limit,ok,why,margin)=>rules.push({id,label,value,limit,ok,why,margin});
 const measured=(n===4||n===5)?dry:total;
 add('mass','Masa del vehículo',measured,p.mass[1],measured>=p.mass[0]&&measured<=p.mass[1],'Estructura, protección y equipos suman masa. El propelente aumenta la masa de lanzamiento.',(p.mass[1]-measured)/p.mass[1]);
 add('launch','Capacidad con reserva',total,capacity*(1-p.margin),!!d.launcher&&total<=capacity*(1-p.margin),'La masa total debe caber en el lanzador conservando la reserva.',(capacity*(1-p.margin)-total)/capacity);
 add('power','Potencia EOL / demanda con margen',gen,req*(1+p.margin),!!d.source&&gen>=req*(1+p.margin),'Los instrumentos, el transmisor y la calefacción comparten la fuente. Aumentar generación también añade masa.',(gen-req*(1+p.margin))/Math.max(1,gen));
 add('budget','Costo con reserva (M USD)',cost*(1+p.margin),p.budget,cost*(1+p.margin)<=p.budget,'Los componentes y el propelente elevan el costo. Compara una configuración menos pesada.',(p.budget-cost*(1+p.margin))/p.budget);
 add('data','Datos recuperados (GB)',trans,data*.9,!!d.antenna&&trans>=data*.9,'La tasa y la ventana limitan la descarga. Más instrumentos producen más datos.',(trans-data*.9)/Math.max(.001,trans));
 add('science','Ciencia recuperada',science,p.science,science>=p.science,'Selecciona instrumentos útiles y transmite sus observaciones.',(science-p.science)/p.science);
 const check=(id,label,ok,why,value=ok?1:0,limit=1)=>add(id,label,value,limit,ok,why,ok?1:-1);
 if(n===2){check('insertion','Inserción orbital',!!d.engine&&!!d.aero&&d.dv>=(d.aero==='yes'?1200:1800),'El aerofrenado reduce el delta-v propulsivo, pero requiere protección y tiempo.',d.dv,d.aero==='yes'?1200:1800);check('shield','Blindaje y aerofrenado',d.shield>=(d.aero==='yes'?100:60),'El frenado atmosférico necesita más protección.',d.shield,d.aero==='yes'?100:60);check('orbit','Órbita de relé',!!d.orbit,'Elige la órbita. La órbita de relé ofrece una ventana más larga a la siguiente sonda.')}
 if(n===3){check('tps','Fracción de TPS (30–50 %)',d.shield/total>=.3&&d.shield/total<=.5,'Más escudo protege la entrada, pero reduce la masa disponible para instrumentos.',d.shield/total,.3);check('battery','Batería primaria',battery&&gen>=req*(1+p.margin),'El descenso necesita baterías dimensionadas para toda su duración.');check('relay','Descenso dentro de la ventana (min)',d.duration>=60&&d.start+d.duration<=relay,'El orbitador puede perder visibilidad antes de acabar el descenso.',d.start+d.duration,relay)}
 if(n===4){check('site','Pendiente del sitio',!!d.site&&d.site!=='crater','El cráter tiene 21°; la llanura 6° y la terraza 12°. Elige un sitio estable.');check('landing','Contacto suave (m/s)',d.contact<2.5,'Una velocidad de contacto excesiva daña los instrumentos.',d.contact,2.5);check('braking','Frenado de descenso (m/s)',!!d.engine&&d.dv>=2500,'El descenso requiere suficiente delta-v antes del contacto.',d.dv,2500)}
 if(n===5){check('edl','Masa admitida por el EDL (kg)',dry<=edl,'El descenso heredado limita el tamaño del rover.',dry,edl);const energy=d.drive*180+d.heat*100+d.measure*120;check('daily','Energía diaria (Wh)',energy<=gen*12&&d.drive>=2&&d.heat>=8&&d.measure>=3,'Conducir, calentar y medir compiten por la energía; el frío exige al menos ocho horas de calefacción.',energy,gen*12);check('route','Ruta y autonomía',d.route==='safe'||(d.route==='rocks'&&d.drive<=4),'Las dunas atrapan las ruedas. En rocas, limita la conducción a cuatro horas; la ruta firme permite más tiempo.')}
 let reliability=1;
 if(n===6){const links=[.99,.99,.96,.97,.95,.94,.99,.96].map((v,i)=>Math.min(.999,v+(d.redundancy==='dual'?.025:0)+(used.includes(Math.min(5,Math.max(1,i)))?.015:0)));reliability=links.reduce((a,b)=>a*b,1);check('return','Delta-v de ida y vuelta',!!d.engine&&d.dv>=4500,'La muestra y el sellado elevan la masa y el propelente de retorno.',d.dv,4500);check('chain','Fiabilidad de la cadena',reliability>=.85,'Las probabilidades se multiplican. La redundancia y los módulos validados refuerzan la cadena.',reliability,.85);check('inheritance','Módulos reutilizados',used.length>=3,'Selecciona al menos tres módulos obtenidos en misiones anteriores.',used.length,3);check('containment','Fallo de contención del modelo',Math.pow(.01,d.seals)<1e-6,'Los sellos independientes reducen el riesgo y añaden masa y costo.',Math.pow(.01,d.seals),1e-6);check('sample','Muestra científica (kg)',d.sample>=1&&d.sample<=10,'Una muestra excesiva hace crecer la masa de retorno.',d.sample,10)}
 if(sequenceNames[n])check('sequence','Secuencia de operaciones',JSON.stringify(d.sequence)===JSON.stringify(sequenceNames[n]),'Ordena las operaciones según sus dependencias antes de validar.');
 const critical=[...rules].sort((a,b)=>a.margin-b.margin)[0].id;
 return {dry,prop,total,gen,req,cost,science,rate,trans,data,capacity,rules,critical,reliability,relay,edl,used};
}
function showMissionTypewriter(n,done){
 const box=$('missionIntro'),title=$('missionIntroTitle'),text=$('missionIntroText');
 const p=LEVELS[n-1]||LEVELS[0],heading=`MISIÓN ${String(n).padStart(2,'0')} · ${p.name.toUpperCase()}`;
 const copy=p.brief||"Flying, prepara la nave y revisa cada sistema antes de comenzar.";
 box.classList.remove('fade');box.style.display='block';title.textContent='';text.textContent='';
 let a=0,b=0;const cursor=document.createElement('span');cursor.className='cursor';text.appendChild(cursor);
 const typeBody=()=>{if(b<copy.length){text.insertBefore(document.createTextNode(copy[b++]),cursor);setTimeout(typeBody,17)}else{setTimeout(()=>{box.classList.add('fade');setTimeout(()=>{box.style.display='none';box.classList.remove('fade');if(done)done()},850)},1800)}};
 const typeTitle=()=>{if(a<heading.length){title.textContent+=heading[a++];setTimeout(typeTitle,34)}else typeBody()};
 typeTitle();
}
function selectMission(n,practice=false){
 campaign.level=n;campaign.practice=practice;campaign.design=n===1?null:newDesign(n);
 Object.assign(state,stockState,{confirmed:{},instrumentIds:[...stockState.instrumentIds],completed:new Set(),visited:new Set([1]),room:1,x:160,y:130,screen:'EXPLORE',returnScreen:'EXPLORE',calendar:n===1?24:missionProfiles[n].calendar,sensitivity:false});
 $('overlay').style.display='none';document.body.classList.remove('launching');keys={};updateMini();refreshMissionLabel();showMissionTypewriter(n,()=>mainPanel());
}
function refreshMissionLabel(){$('roomCounter').textContent=`Nivel ${campaign.level} · Sala ${state.room} de 9${campaign.practice?' · Prueba libre':''}`;$('roomlabel').textContent=ROOMS[state.room-1].name.toUpperCase()}
const originalTransition=transition;
transition=function(to){originalTransition(to);refreshMissionLabel()};
showIntro=function(){panel('Misiones de Villa Anura','La campaña conserva resultados y herencias mientras esta página permanece abierta.',`<div class="options">${LEVELS.map((p,i)=>`<div class="field"><b>${i+1}. ${p.name}</b><p>${p.brief}</p><p>${campaign.results[i+1]?'Completada':'Pendiente'}</p><button data-campaign="${i+1}" ${i&&!campaign.results[i]?'disabled':''}>Jugar campaña</button> <button data-practice="${i+1}">Probar nivel</button></div>`).join('')}</div><p class="desc">Prueba libre permite revisar cualquier nivel con módulos de referencia. Sus resultados no desbloquean la campaña.</p>`,[{text:'Cerrar',action:close}]);document.querySelectorAll('[data-campaign]').forEach(b=>b.onclick=()=>selectMission(+b.dataset.campaign));document.querySelectorAll('[data-practice]').forEach(b=>b.onclick=()=>selectMission(+b.dataset.practice,true))};
const oldMainPanel=mainPanel,oldBoard=openBoard,oldFinal=startFinal,oldGuide=guidePanel;
const originalPanel=panel;
panel=function(...args){const returnScreen=state.screen==='PANEL'?state.returnScreen:state.screen;originalPanel(...args);state.returnScreen=returnScreen};
mainPanel=function(){if(campaign.level===1)return oldMainPanel();missionPanel()};
openBoard=function(){if(campaign.level===1)return oldBoard();if(state.screen==='SIM')return;const c=computeProfile(campaign.level,campaign.design,availableModules());panel('Pizarra de Flying',missionProfiles[campaign.level].name,profileReadout(c)+ruleList(c),[{text:'Cerrar',action:close}])};
guidePanel=function(){if(campaign.level===1)return oldGuide();const p=missionProfiles[campaign.level],base=GUIDES[state.room-1];panel('Guía de misión',p.name+' · '+base[0],`<p class="desc">${base[1]}</p><p class="desc">${p.goal}</p><div class="note">${p.special}</div><p class="desc">${missionHelp(campaign.level,state.room)}</p>`,[{text:'Volver',action:close}])};
function missionHelp(n,r){if(r===6)return {2:'Primero frena para capturar la nave, después circulariza y finalmente ajusta el plano. El aerofrenado consume tres meses de operación adicionales.',3:'La órbita heredada determina la ventana de contacto. El descenso dura entre una y tres horas; empieza a transmitir mientras el relé sigue visible.',4:'La llanura tiene 6° de pendiente, la terraza 12° y el cráter 21°. El contacto debe ocurrir por debajo de 2,5 m/s.',5:'Terreno firme reduce el riesgo. Las rocas requieren conducción lenta y las dunas pueden inmovilizar el vehículo. El retardo de señal exige decisiones a bordo.',6:'Lanzamiento y crucero preceden al aterrizaje. Después se recoge, asciende y realiza el encuentro orbital. Finalmente vienen retorno y reentrada.'}[n];if(r===4&&n===5)return 'Planifica al menos 2 horas de conducción, 8 de calefacción y 3 de ciencia. El generador dispone de 12 horas equivalentes de energía útil por sol.';return 'Revisa la pizarra con L. Las lecturas se recalculan al cambiar cada decisión; el control final explica las restricciones incumplidas.'}
function profileReadout(c){return readout([['Masa seca',fmt(c.dry)+' kg'],['Propelente',fmt(c.prop)+' kg'],['Lanzamiento',fmt(c.total)+' kg'],['Potencia EOL',fmt(c.gen)+' W'],['Demanda',fmt(c.req)+' W'],['Costo',money(c.cost)],['Enlace',fmt(c.rate)+' kbps'],['Datos',fmt(c.trans)+' / '+fmt(c.data)+' GB'],['Ciencia',fmt(c.science)]])}
function ruleList(c){return c.rules.map(r=>`<div class="field"><b class="${r.ok?'good':'warning'}">${r.ok?'✓':'×'} ${r.label}</b> · ${Number(r.value.toPrecision(4))} / ${Number(r.limit.toPrecision(4))}${r.ok?'':`<p>${r.why}</p>`}</div>`).join('')}
function numberField(key,label,min,max,step=1){return `<div class="field"><label>${label}<input data-number="${key}" type="number" min="${min}" max="${max}" step="${step}" value="${campaign.design[key]}" style="width:100px"></label></div>`}
function choice(key,label,entries){return `<div class="field"><label>${label}<select data-choice="${key}"><option value="">Elige una opción…</option>${entries.map(([id,text])=>`<option value="${id}" ${campaign.design[key]===id?'selected':''}>${text}</option>`).join('')}</select></label></div>`}
const SIMPLE_ROOM_HINTS={
 1:"Primero entiende el encargo: ¿a dónde vamos y qué debe conseguir la nave? Lee el objetivo y mira los límites antes de elegir piezas.",
 2:"Escoge los instrumentos que ayudarán a investigar. Más herramientas pueden dar más información, pero también pesan, gastan energía y cuestan dinero.",
 3:"Ajusta la estructura y la protección. Necesitamos una nave resistente, pero demasiado peso hace más difícil y caro el viaje.",
 4:"Elige de dónde saldrá la electricidad. La energía debe alcanzar para mantener encendidos los equipos durante la misión.",
 5:"Escoge cómo se comunicará la nave con la Tierra. Queremos enviar la mayor cantidad posible de información sin gastar demasiado peso y energía.",
 6:"Prepara el motor y la ruta. La nave debe tener fuerza suficiente para llegar a su destino, pero no conviene cargar combustible de más.",
 7:"Revisa cuánto dinero se necesita. Si algo cuesta demasiado, piensa qué se puede ajustar sin poner en riesgo el objetivo.",
 8:"Elige el cohete que llevará la nave al espacio. Debe poder levantar todo su peso y ajustarse al dinero disponible.",
 9:"Haz una revisión final. Comprueba los avisos, identifica el problema más importante y corrígelo antes de iniciar la misión."
};
function missionPanel(){
 const n=campaign.level,p=missionProfiles[n],d=campaign.design,r=state.room,c=computeProfile(n,d,availableModules());let body='',actions=[];
 if(r===1)body=`<p>${p.goal}</p><div class="note">${p.special}</div><p>Masa ${p.mass.join('–')} kg · Potencia nominal ${p.power.join('–')} W · Presupuesto ${p.budget} M USD · Reserva ${Math.round(p.margin*100)} % · Ciencia mínima ${p.science}.</p><p>Duración ${n===3?'1–3 horas':p.years+' años'}. Destino ${p.destination}.</p><p>Borrador de los científicos cargado. Don Hilario pide revisar equipos, protección, energía y trayectoria.</p><p>Herencias disponibles ${Object.values(availableModules()).map(m=>m.name).join(', ')||'ninguna'}.</p><p>Modelo educativo simplificado, calibrado para esta campaña.</p>`;
 if(r===2)body=`<div class="instrument-grid">${INSTR.map(i=>`<label class="instrument-card"><input data-instrument="${i.id}" type="checkbox" ${d.instruments.includes(i.id)?'checked':''}><span><b>${i.name}</b><br>${fmt(i.mass*p.scale)} kg · ${fmt(i.power*p.scale)} W · ${i.science} ciencia</span></label>`).join('')}</div><button id="scienceExperiment">Probar cuánta información generan los instrumentos</button>`;
 if(r===3)body=numberField('structure','Estructura (kg)',...p.structure)+numberField('shield',n===3?'Escudo TPS (kg)':'Protección (kg)',...p.shield);
 if(r===4){body=choice('source','Fuente',n===3?[['battery','Baterías primarias']]:[['solar','Paneles solares'],['rtg','Generador de radioisótopos']])+numberField('power','Potencia inicial (W)',...p.power,10)+`<button id="energyExperiment">Comprobar cuánta energía tenemos</button>`;if(n===5)body+=numberField('drive','Conducir (h)',0,12)+numberField('heat','Calentar (h)',0,12)+numberField('measure','Medir (h)',0,12)}
 if(r===5)body=choice('antenna','Antena',[['compact','Compacta'],['medium','Mediana'],['large','Alta ganancia']])+`<button id="linkExperiment">Probar envío de datos</button><p>Ventana ${n===3?c.relay+' minutos de relé heredado':p.window+' segundos por '+p.period}. La prueba calcula GB recuperables.</p>`;
 if(r===6){
  if(p.dv[1])body+=choice('engine','Motor',[['chemical','Químico · Isp 320 s'],['efficient','Alto rendimiento · Isp 450 s']])+numberField('dv','Delta-v (m/s)',...p.dv);
  if(n===2)body+=choice('aero','Aerofrenado',[['yes','Sí · mayor protección y 3 meses'],['no','No · mayor delta-v']])+choice('orbit','Órbita final',[['science','Baja · relé de 80 min'],['relay','Cobertura de relé · 110 min']]);
  if(n===3)body+=numberField('duration','Duración del descenso (min)',60,180,5)+numberField('start','Inicio desde apertura del relé (min)',0,120,5);
  if(n===4)body+=choice('site','Sitio de aterrizaje',[['plain','Llanura · 6°'],['terrace','Terraza · 12°'],['crater','Cráter · 21°']])+numberField('contact','Velocidad de contacto (m/s)',.5,5,.5);
  if(n===5)body+=choice('route','Ruta autónoma',[['safe','Rodeo por terreno firme'],['rocks','Paso entre rocas'],['dunes','Atajo por dunas']]);
  if(n===6)body+=numberField('sample','Muestra (kg)',1,20)+numberField('seals','Sellos independientes',1,5)+choice('redundancy','Cadena de eventos',[['single','Equipos simples'],['dual','Equipos redundantes']])+`<div class="field">${Object.entries(availableModules()).filter(([id])=>+id<6).map(([id,m])=>`<label><input type="checkbox" data-reuse="${id}" ${d.reuse.includes(+id)?'checked':''}>${m.name} · ahorro 15 M</label>`).join('')}</div>`;
  if(sequenceNames[n])body+=`<p>Ordena los pasos de la misión</p><div>${[...sequenceNames[n]].reverse().map(v=>`<button data-event="${v}" ${d.sequence.includes(v)?'disabled':''}>${v}</button>`).join('')}</div><p>${d.sequence.join(' → ')||'Secuencia vacía'}</p><button id="clearSequence">Reiniciar secuencia</button>`;
 }
 if(r===7)body=`<p>Dinero disponible: ${p.budget} M · reserva: ${Math.round(p.margin*100)} % · tiempo restante: ${state.calendar} meses.</p><button id="sensitivityExperiment">¿Qué cambia al añadir 10 kg de estructura?</button>`;
 if(r===8)body=choice('launcher','Lanzador',p.capacity.map((v,i)=>[['light','medium','heavy'][i],v+' kg de capacidad nominal']))+'<p>El cohete debe poder levantar el peso de la nave y su combustible. La reserva deja un margen de seguridad.</p>';
 if(r===9){body=choice('critical','Tu diagnóstico',c.rules.map(v=>[v.id,v.label]))+ruleList(c);actions.push({text:'Revisar todo y despegar',cls:'primary',action:()=>{const check=computeProfile(n,d,availableModules());if(!check.rules.every(v=>v.ok)||!d.critical||!d.sensitivity||[1,2,3,4,5,6,7,8].some(i=>!state.completed.has(i))){toast('Completa las salas, realiza la prueba de cambios y revisa que todos los puntos estén en orden.');return}close();state.screen='SIM';state.travel=0;keys={}}})}
 else actions.push({text:'Confirmar sala',cls:'primary',action:()=>{const needs={2:d.instruments.length&&d.scienceTest,4:d.source&&d.energyTest,5:d.antenna&&d.linkTest,7:d.sensitivity,8:d.launcher};if(r in needs&&!needs[r]){toast('Termina la selección y la pequeña prueba de esta sala antes de continuar.');return}state.completed.add(r);close();updateMini()}});
 actions.push({text:'Volver',action:close});
 panel(ROOMS[r-1].name,`Misión ${n} · ${p.name}`,`<div class="note"><b>¿Qué tienes que hacer aquí?</b><br>${SIMPLE_ROOM_HINTS[r]}</div>`+body+`<div id="experimentOutput" aria-live="polite"></div><div id="missionReadout">${profileReadout(c)}</div>`,actions);
 const update=()=>{if(state.completed.has(r)){state.completed.delete(r);state.calendar=Math.max(0,state.calendar-1)}invalidation(r);const value=computeProfile(n,d,availableModules());$('missionReadout').innerHTML=profileReadout(value);updateMini()};
 document.querySelectorAll('[data-number]').forEach(input=>input.onchange=()=>{const value=Number(input.value);if(!Number.isFinite(value)||input.value===''||!input.checkValidity()){input.value=d[input.dataset.number];toast('Introduce un valor dentro del rango y paso indicados.');return}d[input.dataset.number]=value;update()});
 document.querySelectorAll('[data-choice]').forEach(input=>input.onchange=()=>{d[input.dataset.choice]=input.value;if(input.dataset.choice!=='critical')update()});
 document.querySelectorAll('[data-instrument]').forEach(input=>input.onchange=()=>{d.instruments=[...document.querySelectorAll('[data-instrument]:checked')].map(x=>x.dataset.instrument);d.scienceTest=false;update()});
 document.querySelectorAll('[data-reuse]').forEach(input=>input.onchange=()=>{d.reuse=[...document.querySelectorAll('[data-reuse]:checked')].map(x=>+x.dataset.reuse);update()});
 document.querySelectorAll('[data-event]').forEach(button=>button.onclick=()=>{d.sequence.push(button.dataset.event);update();missionPanel()});
 if($('clearSequence'))$('clearSequence').onclick=()=>{d.sequence=[];update();missionPanel()};
 const experiment=(id,flag,output)=>{if($(id))$(id).onclick=()=>{const value=computeProfile(n,d,availableModules());d[flag]=true;$('experimentOutput').innerHTML=`<div class="note">${output(value)}</div>`}};
 experiment('scienceExperiment','scienceTest',v=>`Carga útil ${fmt(v.science)} ciencia recuperable; ${fmt(v.data)} GB generados. La descarga puede limitar el resultado.`);
 experiment('energyExperiment','energyTest',v=>`Potencia final ${fmt(v.gen)} W; demanda con reserva ${fmt(v.req*(1+p.margin))} W. Fuente y masa modifican este balance.`);
 experiment('linkExperiment','linkTest',v=>`Enlace ${fmt(v.rate)} kbps; recuperables ${fmt(v.trans)} GB de ${fmt(v.data)} GB.`);
 experiment('sensitivityExperiment','sensitivity',v=>{const other=computeProfile(n,{...d,structure:d.structure+10},availableModules());return `+10 kg de estructura → +${fmt(other.total-v.total)} kg de lanzamiento, +${fmt(other.req-v.req)} W de demanda y +${fmt(other.cost-v.cost)} M.`});
}
function awardMission(n,c){if(campaign.practice)return;campaign.results[n]=true;if(n<6)campaign.modules[n]={name:moduleNames[n-1],...moduleSpecs[n-1],relay:n===2?(campaign.design.orbit==='relay'?110:80):undefined,edl:n===4?Math.min(1050,Math.round(c.dry*1.5)):undefined}}
startFinal=function(){
 if(campaign.level===1){const c=computeMission(state);oldFinal();if(c.hard.every(v=>v.ok)){awardMission(1,c);const button=document.createElement('button');button.textContent='Continuar al orbitador';button.onclick=()=>selectMission(2,campaign.practice);$('dialogFooter').appendChild(button)}return}
 const n=campaign.level,d=campaign.design,p=missionProfiles[n],c=computeProfile(n,d,availableModules()),ok=c.rules.every(r=>r.ok);
 const months=Math.max(0,state.calendar-(n===2&&d.aero==='yes'?3:0));
 const efficiency=['mass','power','budget'].reduce((sum,id)=>sum+Math.max(0,1-Math.abs(c.rules.find(r=>r.id===id).margin-.2)),0)/3;
 const score=Math.round(30*Math.min(1,c.science/p.science)+20*efficiency+15*Math.max(0,1-c.cost/p.budget)+15*(d.critical===c.critical?1:0)+10*(d.sensitivity?1:0)+10*months/p.calendar);
 if(ok)awardMission(n,c);
 const status=!ok?'FALLO':months===0?'ÉXITO PARCIAL':'ÉXITO';
 state.report=`Nivel ${n} · ${p.name}\n${status} · ${score}/100\nDiagnóstico declarado: ${d.critical}; menor margen: ${c.critical}.\n`+c.rules.map(r=>`${r.ok?'OK':'REVISAR'} ${r.label}: ${r.value.toPrecision(4)} / ${r.limit.toPrecision(4)}`).join('\n');
 const buttons=[{text:'Misiones',action:()=>{close();state.screen='TITLE';showIntro()}},{text:'Reintentar',action:()=>selectMission(n,campaign.practice)}];
 if(ok&&n<6)buttons.push({text:'Siguiente misión',cls:'primary',action:()=>selectMission(n+1,campaign.practice)});
 panel(`Informe · ${p.name}`,`${status} · ${score}/100 · ${score>=85?'★★★':score>=65?'★★':score>=45?'★':'—'}`,`<p>Diagnóstico declarado <b>${d.critical}</b>. Menor margen calculado <b>${c.critical}</b>.</p><p>Calendario restante ${months} meses. ${campaign.practice?'Prueba libre con herencias de referencia.':n<6?'Módulo validado para la siguiente misión.':'Campaña completada. La muestra de Yaku ha regresado.'}</p>${profileReadout(c)}${ruleList(c)}`,buttons);
};
const missionMenu=document.createElement('button');missionMenu.textContent='Misiones';missionMenu.className='small';missionMenu.onclick=()=>{if(state.screen==='SIM')return;showIntro()};$('controls').appendChild(missionMenu);

window.__test=()=>{const c=computeMission(state);console.assert(c.total>=c.dry,"Masa total incluye propelente");console.assert(c.req>c.pi,"Potencia incluye subsistemas");console.assert(c.cost>0,"Costo positivo");console.assert(c.hard.length===7,"Siete verificaciones");console.log("Villa Anura · pruebas básicas ejecutadas",c);return c};
if(location.hash==="#debug")window.__test();
