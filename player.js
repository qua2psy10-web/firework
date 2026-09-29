const $=id=>document.getElementById(id);
let svg,ctx,master,playing=false,pos=0,anchor=0,active=[];
const cues=SHOW.flatMap(s=>[{t:s.t,type:'launch',s},{t:s.t+1.43,type:'burst',s}]).sort((a,b)=>a.t-b.t);
let next=0;
$('scene').addEventListener('load',()=>{svg=$('scene').contentDocument.documentElement;svg.pauseAnimations();svg.setCurrentTime(0);$('play').disabled=false;});
function initAudio(){if(ctx)return;ctx=new(window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=+$('volume').value*.6;const compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-18;compressor.ratio.value=8;master.connect(compressor);compressor.connect(ctx.destination);}
// A clear tonal whistle follows the 1.35-second ascent, fading before the burst.
function launchWhistle(shell){
 const now=ctx.currentTime, duration=1.32;
 const tone=ctx.createOscillator(), envelope=ctx.createGain(), pan=ctx.createStereoPanner();
 const vibrato=ctx.createOscillator(), depth=ctx.createGain();
 const pitch=1+(shell.r-145)/1600;
 tone.type='sine';
 tone.frequency.setValueAtTime(720*pitch,now);
 tone.frequency.exponentialRampToValueAtTime(1550*pitch,now+.85);
 tone.frequency.exponentialRampToValueAtTime(1850*pitch,now+duration);
 envelope.gain.setValueAtTime(0,now);
 envelope.gain.linearRampToValueAtTime(.23,now+.10);
 envelope.gain.setValueAtTime(.19,now+.85);
 envelope.gain.exponentialRampToValueAtTime(.001,now+duration);
 vibrato.frequency.value=8;depth.gain.value=11;
 vibrato.connect(depth);depth.connect(tone.frequency);
 pan.pan.value=(shell.x/800-1)*.75;
 tone.connect(envelope);envelope.connect(pan);pan.connect(master);
 active.push(tone,vibrato);
 tone.onended=()=>{
  active=active.filter(node=>node!==tone&&node!==vibrato);
  tone.disconnect();vibrato.disconnect();depth.disconnect();envelope.disconnect();pan.disconnect();
 };
 tone.start(now);vibrato.start(now);
 tone.stop(now+duration);vibrato.stop(now+duration);
}
function sound(cue){if(cue.type==='launch')launchWhistle(cue.s);const when=ctx.currentTime,s=cue.s,burst=cue.type==='burst',duration=burst?2.7:1.25;const n=Math.ceil(ctx.sampleRate*duration),buffer=ctx.createBuffer(1,n,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<n;i++){let t=i/ctx.sampleRate;data[i]=(Math.random()*2-1)*(burst?Math.exp(-t*3.6)*(1+.2*Math.sin(t*190)):Math.sin(Math.PI*t/duration)*.23);}const source=ctx.createBufferSource();source.buffer=buffer;const filter=ctx.createBiquadFilter();filter.type=burst?'lowpass':'bandpass';filter.frequency.setValueAtTime(burst?2800:850,when);filter.frequency.exponentialRampToValueAtTime(burst?100:1700,when+duration);const gain=ctx.createGain();gain.gain.value=burst?.45+s.r/600:.17;const pan=ctx.createStereoPanner();pan.pan.value=(s.x/800-1)*.75;source.connect(filter);filter.connect(gain);gain.connect(pan);pan.connect(master);source.start();active.push(source);source.onended=()=>{active=active.filter(x=>x!==source);source.disconnect();filter.disconnect();gain.disconnect();pan.disconnect();};if(burst){const osc=ctx.createOscillator(),g=ctx.createGain();osc.frequency.setValueAtTime(70,when);osc.frequency.exponentialRampToValueAtTime(24,when+.6);g.gain.setValueAtTime(.45,when);g.gain.exponentialRampToValueAtTime(.001,when+1.3);osc.connect(g);g.connect(pan);osc.start();osc.stop(when+1.4);active.push(osc);osc.onended=()=>{active=active.filter(x=>x!==osc);osc.disconnect();g.disconnect();};}}
function hush(){active.forEach(s=>{try{s.stop()}catch{}});active=[];}
function cursor(){next=cues.findIndex(c=>c.t>=pos);if(next<0)next=cues.length;}
function draw(){if(svg)svg.setCurrentTime(pos);$('seek').value=pos;$('time').textContent=`${Math.floor(pos/60)}:${String(Math.floor(pos%60)).padStart(2,'0')} / 1:00`;$('phase').textContent=pos<13?'第一章　尺玉':pos<28?'第二章　彩りの大輪':pos<42?'第三章　夜空いっぱいに':pos<59.5?'終章　スターマイン':'余韻';}
async function play(){if(!svg)return;initAudio();await ctx.resume();if(pos>=60)pos=0;cursor();anchor=performance.now()-pos*1000;playing=true;$('cover').hidden=true;$('play').textContent='一時停止';}
function pause(){playing=false;hush();$('play').textContent='再生';}
$('start').onclick=play;$('play').onclick=()=>playing?pause():play();$('restart').onclick=()=>{pause();pos=0;draw();play()};$('seek').oninput=()=>{hush();pos=+$('seek').value;anchor=performance.now()-pos*1000;cursor();draw()};$('volume').oninput=()=>{if(master)master.gain.setTargetAtTime(+$('volume').value*.6,ctx.currentTime,.02)};
$('full').onclick=async()=>{if(document.fullscreenElement)await document.exitFullscreen();else if($('stage').requestFullscreen)await $('stage').requestFullscreen();};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)pause()});
function frame(now){if(playing){pos=Math.min(60,(now-anchor)/1000);while(next<cues.length&&cues[next].t<=pos){if(pos-cues[next].t<.15)sound(cues[next]);next++}draw();if(pos>=60){pause();$('heading').textContent='夜空に、余韻。';$('intro').textContent='60秒の花火をご覧いただき、ありがとうございました。';$('start').textContent='もう一度再生';$('cover').hidden=false;}}requestAnimationFrame(frame)}requestAnimationFrame(frame);
