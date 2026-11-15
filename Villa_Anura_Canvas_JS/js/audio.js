export class AudioManager{
  constructor(){
    this.enabled=true;
    this.ctx=null;
    this.masterGain=null;
    this.musicBus=null;
    this.musicTimer=null;
    this.musicNodes=[];
    this.musicStep=0;
    this.musicRequested=false;
  }

  ensureContext(){
    try{
      this.ctx??=new(window.AudioContext||window.webkitAudioContext)();
      if(this.ctx.state==='suspended')this.ctx.resume();
      if(!this.masterGain){
        this.masterGain=this.ctx.createGain();
        this.masterGain.gain.value=0.72;
        this.masterGain.connect(this.ctx.destination);
      }
      return this.ctx;
    }catch{return null;}
  }

  tone(f=440,d=.1,type='sine',volume=.035){
    if(!this.enabled)return;
    const ctx=this.ensureContext();
    if(!ctx)return;
    try{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type=type;
      o.frequency.setValueAtTime(f,ctx.currentTime);
      o.connect(g);g.connect(this.masterGain);
      g.gain.setValueAtTime(volume,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+d);
      o.start();o.stop(ctx.currentTime+d+.02);
    }catch{}
  }

  playMusic(){
    this.musicRequested=true;
    if(!this.enabled||this.musicTimer)return;
    const ctx=this.ensureContext();
    if(!ctx)return;
    try{
      this.musicBus=ctx.createGain();
      this.musicBus.gain.setValueAtTime(0,ctx.currentTime);
      this.musicBus.gain.linearRampToValueAtTime(.62,ctx.currentTime+1.8);
      this.musicBus.connect(this.masterGain);

      // Ambientación espacial suave: dos capas armónicas originales.
      const droneA=ctx.createOscillator(),gainA=ctx.createGain();
      droneA.type='sine';droneA.frequency.value=110;
      gainA.gain.value=.12;droneA.connect(gainA);gainA.connect(this.musicBus);
      droneA.start();
      const droneB=ctx.createOscillator(),gainB=ctx.createGain();
      droneB.type='triangle';droneB.frequency.value=164.81;
      gainB.gain.value=.055;droneB.connect(gainB);gainB.connect(this.musicBus);
      droneB.start();
      this.musicNodes=[droneA,droneB];

      // Melodía original pentatónica, lenta y discreta.
      const notes=[523.25,659.25,783.99,659.25,587.33,698.46,880,698.46];
      const playNote=()=>{
        if(!this.enabled||!this.musicBus)return;
        const freq=notes[this.musicStep%notes.length];
        this.musicStep++;
        const osc=ctx.createOscillator(),env=ctx.createGain();
        osc.type='sine';osc.frequency.value=freq;
        env.gain.setValueAtTime(.001,ctx.currentTime);
        env.gain.linearRampToValueAtTime(.095,ctx.currentTime+.08);
        env.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+1.05);
        osc.connect(env);env.connect(this.musicBus);
        osc.start();osc.stop(ctx.currentTime+1.08);
      };
      playNote();
      this.musicTimer=setInterval(playNote,1450);
    }catch{}
  }

  stopMusic(){
    if(this.musicTimer){clearInterval(this.musicTimer);this.musicTimer=null;}
    if(!this.ctx||!this.musicBus)return;
    try{
      const bus=this.musicBus;
      bus.gain.cancelScheduledValues(this.ctx.currentTime);
      bus.gain.setTargetAtTime(0,this.ctx.currentTime,.18);
      const nodes=[...this.musicNodes];
      setTimeout(()=>nodes.forEach(node=>{try{node.stop();}catch{}}),850);
      setTimeout(()=>{try{bus.disconnect();}catch{}},900);
      this.musicNodes=[];this.musicBus=null;
    }catch{}
  }

  toggle(){
    this.enabled=!this.enabled;
    if(this.enabled){
      if(this.musicRequested)this.playMusic();
    }else{
      this.stopMusic();
    }
    return this.enabled;
  }

  start(){
    this.tone(520,.11,'triangle',.028);
    setTimeout(()=>this.tone(660,.09,'sine',.022),75);
  }
  select(){
    this.tone(720,.055,'triangle',.024);
    setTimeout(()=>this.tone(960,.065,'sine',.018),55);
  }
  confirm(){
    this.tone(523.25,.09,'sine',.03);
    setTimeout(()=>this.tone(783.99,.12,'triangle',.024),85);
  }
  launch(){
    if(!this.enabled)return;
    const ctx=this.ensureContext();
    if(!ctx)return;
    try{
      const osc=ctx.createOscillator(),env=ctx.createGain(),filter=ctx.createBiquadFilter();
      osc.type='sawtooth';osc.frequency.setValueAtTime(85,ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(310,ctx.currentTime+1.15);
      filter.type='lowpass';filter.frequency.value=520;
      env.gain.setValueAtTime(.001,ctx.currentTime);
      env.gain.linearRampToValueAtTime(.085,ctx.currentTime+.18);
      env.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+1.35);
      osc.connect(filter);filter.connect(env);env.connect(this.masterGain);
      osc.start();osc.stop(ctx.currentTime+1.4);
    }catch{}
  }
  brake(){this.tone(245,.055,'triangle',.016)}
  jump(){this.tone(380,.09,'triangle',.025)}
  ticket(){this.tone(880,.08);setTimeout(()=>this.tone(1150,.1),70)}
  data(){this.tone(660,.09,'sine',.025);setTimeout(()=>this.tone(880,.11,'sine',.022),75)}
  experiment(){[740,988,1175].forEach((f,i)=>setTimeout(()=>this.tone(f,.1,'sine',.021),i*85))}
  bump(){this.tone(150,.16,'sawtooth',.04)}
  bonus(){[660,880,1040].forEach((f,i)=>setTimeout(()=>this.tone(f,.13),i*80))}
  win(){[523,659,784,1046].forEach((f,i)=>setTimeout(()=>this.tone(f,.18,'triangle',.03),i*130))}
}