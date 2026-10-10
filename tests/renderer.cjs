const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let nodes=0;class Element{constructor(){nodes++;this.attrs={};this.children=[]}setAttribute(k,v){this.attrs[k]=String(v)}appendChild(n){this.children.push(n)}replaceChildren(){this.children=[]}}
const show=JSON.parse(fs.readFileSync('show.json','utf8')),groups=show.map(()=>new Element());
const svg={ownerDocument:{createElementNS:()=>new Element()},querySelector:q=>groups[Number(q.match(/\d+/)[0])]};
const sandbox={};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('renderer.js','utf8'),sandbox);
const renderer=sandbox.createFireworkRenderer(svg,show),initialNodes=nodes;let maxVisible=0;
const start=performance.now();
for(let frame=0;frame<=1800;frame++){
 const t=frame/30;renderer.render(t);
 maxVisible=Math.max(maxVisible,groups.filter(g=>g.attrs.display==='inline').length);
 for(let i=0;i<show.length;i++)assert.equal(groups[i].attrs.display==='inline',t>=show[i].t&&t<show[i].t+1.35+(show[i].kind==='willow'?4.45:3.4));
}
assert.equal(nodes,initialNodes);assert(groups.every(g=>g.attrs.display==='none'));
renderer.render(56);const snapshot=JSON.stringify(groups.filter(g=>g.attrs.display==='inline').map(g=>g.children.slice(1)));renderer.render(3);renderer.render(56);assert.equal(JSON.stringify(groups.filter(g=>g.attrs.display==='inline').map(g=>g.children.slice(1))),snapshot);
assert(!snapshot.includes('NaN'));assert(!snapshot.includes('Infinity'));
assert.equal(fs.readFileSync('docs/index.html','utf8'),fs.readFileSync('花火・音付き.html','utf8'));
assert(fs.readFileSync('docs/index.html','utf8').includes('function createFireworkRenderer'));
console.log(JSON.stringify({frames:1801,maxVisible,animatedStarPathsAtPeak:maxVisible*6,nodesCreatedDuringPlayback:nodes-initialNodes,calculationTestMs:Math.round(performance.now()-start),endAndSeek:'passed'}));
