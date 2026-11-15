export class AudioManager{
  constructor(){this.enabled=true;this.ctx=null;this.masterGain=null;this.musicBus=null;this.musicTimer=null;this.musicNodes=[];this.musicStep=0;this.musicRequested=false;}
  ensureContext(){
    try{
      this.ctx??=new(window.AudioContext||window.webkitAudioContext)();
      if(this.ctx.state==='suspended')this.ctx.resume();
      if(!this.masterGain){this.masterGain=this.ctx.createGain();this.masterGain.gain.value=.72;this.masterGain.connect(this.ctx.destination);}
      return this.ctx;
    }catch{return null;}
  }
  tone(f=440,d=.1,type='sine',volume=.035){
    if(!this.enabled)return;
    const ctx=this.ensureContext();if(!ctx)return;
    try{
      const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,ctx.currentTime);
      o.connect(g);g.connect(this.masterGain);g.gain.setValueAtTime(.001,ctx.currentTime);
      g.gain.linearRampToValueAtTime(volume,ctx.currentTime+.012);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+d);
      o.start();o.stop(ctx.currentTime+d+.02);
    }catch{}
  }
  playMusic(){
    this.musicRequested=true;if(!this.enabled||this.musicTimer)return;
    const ctx=this.ensureContext();if(!ctx)return;
    try{
      this.musicBus=ctx.createGain();this.musicBus.gain.setValueAtTime(0,ctx.currentTime);
      this.musicBus.gain.linearRampToValueAtTime(.22,ctx.currentTime+3.5);this.musicBus.connect(this.masterGain);
      // Fondo espacial original: capas cálidas, muy suaves y sin percusión.
      const padFilter=ctx.createBiquadFilter();padFilter.type='lowpass';padFilter.frequency.value=520;padFilter.connect(this.musicBus);
      const droneA=ctx.createOscillator(),gainA=ctx.createGain();droneA.type='sine';droneA.frequency.value=110;
      gainA.gain.value=.10;droneA.connect(gainA);gainA.connect(padFilter);droneA.start();
      const droneB=ctx.createOscillator(),gainB=ctx.createGain();droneB.type='sine';droneB.frequency.value=164.81;
      gainB.gain.value=.045;droneB.connect(gainB);gainB.connect(padFilter);droneB.start();
      const droneC=ctx.createOscillator(),gainC=ctx.createGain();droneC.type='triangle';droneC.frequency.value=220;
      gainC.gain.value=.012;droneC.connect(gainC);gainC.connect(padFilter);droneC.start();
      this.musicNodes=[droneA,droneB,droneC,padFilter];
      // Destellos armónicos muy espaciados para dar sensación de espacio sin distraer.
      const notes=[392,523.25,659.25,523.25,440,587.33];
      const playNote=()=>{
        if(!this.enabled||!this.musicBus)return;
        const freq=notes[this.musicStep%notes.length];this.musicStep++;
        const osc=ctx.createOscillator(),env=ctx.createGain(),filter=ctx.createBiquadFilter();
        osc.type='sine';osc.frequency.value=freq;filter.type='lowpass';filter.frequency.value=1150;
        env.gain.setValueAtTime(.001,ctx.currentTime);env.gain.linearRampToValueAtTime(.042,ctx.currentTime+.28);
        env.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+2.25);
        osc.connect(filter);filter.connect(env);env.connect(this.musicBus);osc.start();osc.stop(ctx.currentTime+2.3);
      };
      playNote();this.musicTimer=setInterval(playNote,3900);
    }catch{}
  }
  stopMusic(){
    if(this.musicTimer){clearInterval(this.musicTimer);this.musicTimer=null;}
    if(!this.ctx||!this.musicBus)return;
    try{
      const bus=this.musicBus;bus.gain.cancelScheduledValues(this.ctx.currentTime);bus.gain.setTargetAtTime(0,this.ctx.currentTime,.35);
      const nodes=[...this.musicNodes];setTimeout(()=>nodes.forEach(node=>{try{node.stop();}catch{}}),1300);
      setTimeout(()=>{try{bus.disconnect();}catch{}},1400);this.musicNodes=[];this.musicBus=null;
    }catch{}
  }
  toggle(){this.enabled=!this.enabled;if(this.enabled){if(this.musicRequested)this.playMusic();}else this.stopMusic();return this.enabled;}
  start(){this.tone(520,.11,'triangle',.028);setTimeout(()=>this.tone(660,.09,'sine',.022),75);}
  select(){this.tone(720,.055,'triangle',.024);setTimeout(()=>this.tone(960,.065,'sine',.018),55);}
  confirm(){this.tone(523.25,.09,'sine',.03);setTimeout(()=>this.tone(783.99,.12,'triangle',.024),85);}
  launch(){
    if(!this.enabled)return;const ctx=this.ensureContext();if(!ctx)return;
    try{
      const osc=ctx.createOscillator(),env=ctx.createGain(),filter=ctx.createBiquadFilter();
      osc.type='sawtooth';osc.frequency.setValueAtTime(85,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(310,ctx.currentTime+1.15);
      filter.type='lowpass';filter.frequency.value=520;env.gain.setValueAtTime(.001,ctx.currentTime);
      env.gain.linearRampToValueAtTime(.085,ctx.currentTime+.18);env.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+1.35);
      osc.connect(filter);filter.connect(env);env.connect(this.masterGain);osc.start();osc.stop(ctx.currentTime+1.4);
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
  // Campanilla cálida, breve y delicada para mostrar el certificado final.
  certificate(){
    if(!this.enabled)return;const ctx=this.ensureContext();if(!ctx)return;
    [659.25,783.99,987.77].forEach((freq,i)=>{
      const t=ctx.currentTime+i*.12,osc=ctx.createOscillator(),env=ctx.createGain(),filter=ctx.createBiquadFilter();
      osc.type='sine';osc.frequency.value=freq;filter.type='lowpass';filter.frequency.value=1800;
      env.gain.setValueAtTime(.001,t);env.gain.linearRampToValueAtTime(.055,t+.07);env.gain.exponentialRampToValueAtTime(.001,t+1.15);
      osc.connect(filter);filter.connect(env);env.connect(this.masterGain);osc.start(t);osc.stop(t+1.2);
    });
  }
}