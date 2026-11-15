export class AudioManager{
  constructor(){
    this.enabled=true;this.musicRequested=false;
    this.ambient=new Audio(new URL('../assets/audio/ambient-space.mp3',import.meta.url));
    this.ambient.loop=true;this.ambient.volume=.16;this.ambient.preload='auto';
    this.effects={
      landing:new Audio(new URL('../assets/audio/landing-soft.mp3',import.meta.url)),
      certificate:new Audio(new URL('../assets/audio/certificate-victory.mp3',import.meta.url)),
      gameOver:new Audio(new URL('../assets/audio/game-over.mp3',import.meta.url))
    };
    Object.values(this.effects).forEach(a=>{a.preload='auto';a.volume=.55;});
    this.ctx=null;this.masterGain=null;
  }
  ensureContext(){
    try{
      this.ctx??=new(window.AudioContext||window.webkitAudioContext)();
      if(this.ctx.state==='suspended')this.ctx.resume();
      if(!this.masterGain){this.masterGain=this.ctx.createGain();this.masterGain.gain.value=.72;this.masterGain.connect(this.ctx.destination);}
      return this.ctx;
    }catch{return null;}
  }
  tone(f=440,d=.1,type='sine',volume=.035){
    if(!this.enabled)return;const ctx=this.ensureContext();if(!ctx)return;
    try{const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,ctx.currentTime);o.connect(g);g.connect(this.masterGain);g.gain.setValueAtTime(.001,ctx.currentTime);g.gain.linearRampToValueAtTime(volume,ctx.currentTime+.012);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+d);o.start();o.stop(ctx.currentTime+d+.02);}catch{}
  }
  playEffect(name){
    if(!this.enabled||!this.effects[name])return;
    try{const sound=this.effects[name].cloneNode();sound.volume=this.effects[name].volume;sound.play().catch(()=>{});}catch{}
  }
  playMusic(){
    this.musicRequested=true;if(!this.enabled)return;
    try{this.ambient.play().catch(()=>{});}catch{}
  }
  stopMusic(){try{this.ambient.pause();this.ambient.currentTime=0;}catch{}}
  toggle(){
    this.enabled=!this.enabled;
    if(this.enabled){if(this.musicRequested)this.playMusic();}
    else{this.stopMusic();Object.values(this.effects).forEach(a=>{try{a.pause();a.currentTime=0;}catch{}});}
    return this.enabled;
  }
  start(){this.tone(520,.11,'triangle',.028);setTimeout(()=>this.tone(660,.09,'sine',.022),75);}
  select(){this.tone(720,.055,'triangle',.024);setTimeout(()=>this.tone(960,.065,'sine',.018),55);}
  confirm(){this.tone(523.25,.09,'sine',.03);setTimeout(()=>this.tone(783.99,.12,'triangle',.024),85);}
  launch(){
    if(!this.enabled)return;const ctx=this.ensureContext();if(!ctx)return;
    try{const osc=ctx.createOscillator(),env=ctx.createGain(),filter=ctx.createBiquadFilter();osc.type='sawtooth';osc.frequency.setValueAtTime(85,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(310,ctx.currentTime+1.15);filter.type='lowpass';filter.frequency.value=520;env.gain.setValueAtTime(.001,ctx.currentTime);env.gain.linearRampToValueAtTime(.085,ctx.currentTime+.18);env.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+1.35);osc.connect(filter);filter.connect(env);env.connect(this.masterGain);osc.start();osc.stop(ctx.currentTime+1.4);}catch{}
  }
  brake(){this.tone(245,.055,'triangle',.016)}
  jump(){this.tone(380,.09,'triangle',.025)}
  ticket(){this.tone(880,.08);setTimeout(()=>this.tone(1150,.1),70)}
  data(){this.tone(660,.09,'sine',.025);setTimeout(()=>this.tone(880,.11,'sine',.022),75)}
  experiment(){[740,988,1175].forEach((f,i)=>setTimeout(()=>this.tone(f,.1,'sine',.021),i*85))}
  bump(){this.playEffect('gameOver');}
  landing(){this.playEffect('landing');}
  bonus(){[660,880,1040].forEach((f,i)=>setTimeout(()=>this.tone(f,.13),i*80))}
  win(){[523,659,784,1046].forEach((f,i)=>setTimeout(()=>this.tone(f,.18,'triangle',.03),i*130))}
  certificate(){this.playEffect('certificate');}
}