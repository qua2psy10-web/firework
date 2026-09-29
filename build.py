import math,random,json
from pathlib import Path
random.seed(829)
out=Path(__file__).parent
shows=[]
def shot(t,x,y,r,color,kind='chrysanthemum'):
 shows.append(dict(t=round(t,3),x=x,y=y,r=r,color=color,kind=kind))
colors=['#ffd68a','#ffb9d9','#8fdfff','#bdadff','#8cffe0','#ff887a']
for i,t in enumerate([1,5.3,9.5,14,18.4,22.5,26.5,30.7,34.5,38.4]):
 shot(t,800 if i==0 else random.randint(410,1190),random.randint(265,390),145+i*15,colors[i%6], 'willow' if i in [5,8,9] else 'chrysanthemum')
for i,t in enumerate([16,24,29,33,37,40]):shot(t,random.randint(300,1300),random.randint(300,460),140+i*10,colors[(i+2)%6])
for i in range(35):
 t=42+i*.36
 shot(t,270+(i%7)*177,290+85*math.sin(i*1.7),155+(i%4)*19,colors[i%6])
for i in range(7):shot(53.5+i*.10,290+i*170,260+(i%2)*65,240,'#ffe0a0','willow')
shows.sort(key=lambda x:x['t'])
s=['<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="title desc">', '<title id="title">星降る夜 — 60秒の花火</title><desc id="desc">尺玉から大輪へ、最後は黄金のスターマイン。音付きは同梱のindex.htmlで再生。</desc>', '<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#02040e"/><stop offset=".7" stop-color="#090f25"/><stop offset="1" stop-color="#151b32"/></linearGradient><radialGradient id="halo"><stop stop-color="#ffddb0" stop-opacity=".17"/><stop offset="1" stop-color="#ffd798" stop-opacity="0"/></radialGradient><linearGradient id="water" x2="0" y2="1"><stop stop-color="#0c172c"/><stop offset="1" stop-color="#030710"/></linearGradient></defs><rect width="1600" height="900" fill="url(#sky)"/>']
for i in range(125):
 x=random.randint(10,1590); y=random.randint(10,600)
 s.append(f'<circle cx="{x}" cy="{y}" r="{random.uniform(.4,1.3):.2f}" fill="#b7c8e9" opacity="{random.uniform(.15,.6):.2f}"/>')
s.append('<path d="M0 707L95 678 170 696 260 661 365 690 450 651 565 699 680 679 780 707 930 669 1050 700 1190 663 1330 691 1450 665 1600 700V900H0Z" fill="#040810"/><path d="M0 744Q750 731 1600 747V900H0Z" fill="url(#water)"/>')
for k,e in enumerate(shows):
 t,x,y,r,c=e['t'],e['x'],e['y'],e['r'],e['color']; burst=t+1.35; duration=4.45 if e['kind']=='willow' else 3.4
 s.append(f'<g opacity="0"><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.05;.86;1" begin="{t}s" dur="1.4s" fill="freeze"/><path d="M{x-30} 745 Q{x-15} 470 {x} {y}" fill="none" stroke="{c}" stroke-width="2" pathLength="100" stroke-dasharray="9 100" stroke-dashoffset="9"><animate attributeName="stroke-dashoffset" from="9" to="-100" begin="{t}s" dur="1.35s" fill="freeze"/></path></g>')
 s.append(f'<circle cx="{x}" cy="{y}" r="{r*1.6}" fill="url(#halo)" opacity="0"><animate attributeName="opacity" values="0;1;0" keyTimes="0;.04;1" begin="{burst}s" dur="{duration}s" fill="freeze"/></circle>')
 s.append(f'<g fill="none" stroke="{c}" stroke-linecap="round" opacity="0"><animate attributeName="opacity" values="0;1;1;.85;0" keyTimes="0;.015;.25;.62;1" begin="{burst}s" dur="{duration}s" fill="freeze"/>')
 # Change burning-star color as the shell expands; preserve the golden willow finale.
 changing=e['kind']=='chrysanthemum'
 sequence=f'#fff5da;#ffd06a;#ff638e;#9d9bff;#78dfff' if k==0 else f'#fff5da;{c};{colors[(k+3)%len(colors)]};#a8b9ff;#d8eaff'
 def color_animation(attribute):
  return f'<animate attributeName="{attribute}" values="{sequence}" keyTimes="0;.18;.42;.68;1" calcMode="linear" begin="{burst}s" dur="{duration}s" fill="freeze"/>' if changing else ''
 s.append(color_animation('stroke'))
 for j in range(100 if e['kind']=='willow' else 78):
  a=j*math.tau/(100 if e['kind']=='willow' else 78)+random.uniform(-.018,.018); rr=r*random.uniform(.82,1.06); dx=math.cos(a)*rr;dy=math.sin(a)*rr;fall=105 if e['kind']=='willow' else 58
  d=f'M{x} {y} Q{x+dx*.8:.1f} {y+dy*.8:.1f} {x+dx:.1f} {y+dy+fall:.1f}'
  s.append(f'<path d="{d}" stroke-width="{random.uniform(1.8,3.2):.1f}" pathLength="100" stroke-dasharray="1 2 1 3 2 3 1 4 2 100" stroke-dashoffset="22"><animate attributeName="stroke-dashoffset" values="22;-44;-73;-89" keyTimes="0;.22;.55;1" calcMode="spline" keySplines="0 .4 .4 1;0 0 1 1;0 0 1 1" begin="{burst}s" dur="{duration}s" fill="freeze"/></path>')
 s.append('</g>')
 s.append(f'<ellipse cx="{x}" cy="807" rx="{r*.65}" ry="38" fill="{c}" opacity="0"><animate attributeName="opacity" values="0;.09;.035;0" keyTimes="0;.06;.5;1" begin="{burst}s" dur="{duration}s" fill="freeze"/>{color_animation("fill")}</ellipse>')
for i in range(40):
 y=748+i*3.9
 s.append(f'<path d="M0 {y}H1600" stroke="#040914" stroke-width="{random.uniform(1,3):.1f}" opacity=".7"/>')
s.append('</svg>')
(out/'fireworks.svg').write_text('\n'.join(s))
(out/'show.json').write_text(json.dumps(shows))
(out/'events.js').write_text('const SHOW = '+json.dumps(shows)+';\n')
print(f'{len(shows)} shells, last ember at {max(e["t"]+1.35+(4.45 if e["kind"]=="willow" else 3.4) for e in shows):.2f}s')

# Package the same animation and player into both standalone and published pages.
html=(out/'index.html').read_text()
svg=(out/'fireworks.svg').read_text().replace('<svg xmlns=', '<svg id="inline-scene" xmlns=',1)
a=html.index('<object '); b=html.index('</object>',a)+len('</object>')
html=html[:a]+svg+html[b:]
html=html.replace('object{display:block','object,#inline-scene{display:block')
js=(out/'player.js').read_text()
a=js.index("$('scene').addEventListener");b=js.index('\nfunction initAudio',a)
js=js[:a]+"svg=$('inline-scene');svg.pauseAnimations();svg.setCurrentTime(0);$('play').disabled=false;"+js[b:]
html=html.replace('<script src="events.js"></script><script src="player.js"></script>', '<script>'+(out/'events.js').read_text()+js+'</script>')
(out/'花火・音付き.html').write_text(html)
(out/'docs').mkdir(exist_ok=True)
(out/'docs/index.html').write_text(html)
