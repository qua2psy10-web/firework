// Project a sphere into a small, fixed set of SVG paths. No per-star SMIL,
// no hidden completed animations, and no DOM allocation during playback.
function createFireworkRenderer(svg,show){
 const ns='http://www.w3.org/2000/svg', palette=['#ffd68a','#ffb9d9','#8fdfff','#bdadff','#8cffe0','#ff887a'];
 const make=(name,attrs,parent)=>{const n=svg.ownerDocument.createElementNS(ns,name);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);parent.appendChild(n);return n};
 const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
 const shells=show.map((s,k)=>{
  const g=svg.querySelector(`[data-firework="${k}"]`);g.replaceChildren();g.setAttribute('display','none');
  const launch=make('path',{fill:'none',stroke:s.color,'stroke-width':2.2,'stroke-linecap':'round'},g);
  const halo=make('circle',{cx:s.x,cy:s.y,r:s.r*1.35,fill:'url(#halo)'},g);
  const stars=make('g',{'stroke-linecap':'round',fill:'none'},g);
  const paths=Array.from({length:6},(_,i)=>make('path',{'stroke-width':(1.1+i*.48).toFixed(2),opacity:(.32+i*.13).toFixed(2)},stars));
  const reflection=make('ellipse',{cx:s.x,cy:807,rx:s.r*.65,ry:24},g);
  const count=s.t>=42?84:120;
  const particles=Array.from({length:count},(_,j)=>{
   const z=1-2*(j+.5)/count,a=j*Math.PI*(3-Math.sqrt(5))+k*.7,ring=Math.sqrt(1-z*z);
   return {z,x:Math.cos(a)*ring,y:Math.sin(a)*ring,band:Math.min(5,Math.floor((z+1)*3))};
  });
  const colors=(k===0?['#fff5da','#ffd06a','#ff638e','#9d9bff','#78dfff']:['#fff5da',s.color,palette[(k+3)%6],'#a8b9ff','#d8eaff']).map(rgb);
  return {s,g,launch,halo,stars,paths,reflection,particles,colors,visible:false};
 });
 const stops=[0,.18,.42,.68,1];
 function render(time){
  for(const h of shells){
   const {s}=h,age=time-s.t,duration=s.kind==='willow'?4.45:3.4;
   const visible=age>=0&&age<1.35+duration;
   if(visible!==h.visible){h.g.setAttribute('display',visible?'inline':'none');h.visible=visible;}
   if(!visible)continue;
   if(age<1.35){
    h.launch.setAttribute('display','inline');h.stars.setAttribute('display','none');h.halo.setAttribute('opacity',0);h.reflection.setAttribute('opacity',0);
    const u=age/1.35,v=Math.max(0,u-.085),point=q=>`${(s.x-30+30*q).toFixed(1)} ${(745+(s.y-745)*q).toFixed(1)}`;
    h.launch.setAttribute('d',`M${point(v)} L${point(u)}`);continue;
   }
   h.launch.setAttribute('display','none');h.stars.setAttribute('display','inline');
   const u=(age-1.35)/duration,spread=(1-Math.exp(-4*u))/(1-Math.exp(-4));
   const fade=Math.min(1,u/.018)*Math.pow(1-u, .65);
   let color=s.color;
   if(s.kind!=='willow'){
    let i=0;while(i<3&&u>stops[i+1])i++;
    const f=(u-stops[i])/(stops[i+1]-stops[i]);
    color=`rgb(${h.colors[i].map((v,j)=>Math.round(v+(h.colors[i+1][j]-v)*f)).join(',')})`;
   }
   h.stars.setAttribute('stroke',color);h.stars.setAttribute('opacity',fade.toFixed(3));
   h.halo.setAttribute('opacity',(fade*.5).toFixed(3));
   h.reflection.setAttribute('fill',color);h.reflection.setAttribute('opacity',(fade*.08).toFixed(3));
   const bands=['','','','','',''];
   for(const p of h.particles){
    const point=q=>{const perspective=1/(1-p.z*q*.27);return `${(s.x+(p.x*s.r*q+p.z*s.r*.07*q*q)*perspective).toFixed(1)} ${(s.y+(p.y*s.r*q+(s.kind==='willow'?110:65)*u*u)*perspective).toFixed(1)}`};
    // Three separated embers preserve the sparkling trail without dash animation.
    for(let n=0;n<3;n++){
     const head=Math.max(0,spread-n*.022),tail=Math.max(0,head-(n===0?.018:.007));
     bands[p.band]+=`M${point(tail)}L${point(head)}`;
    }
   }
   h.paths.forEach((p,i)=>p.setAttribute('d',bands[i]));
  }
 }
 render(0);
 return {render};
}
