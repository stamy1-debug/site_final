import * as THREE from './vendor/three.module.js';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused = reducedMotion;
const sceneEl = document.querySelector('#scene');
const pause = document.querySelector('#pause');
function updatePause(){pause.textContent = paused ? '▷' : 'Ⅱ';pause.setAttribute('aria-label',paused ? 'Pornește animația' : 'Oprește animația');pause.title=pause.getAttribute('aria-label');}
updatePause();
try {
 const scene = new THREE.Scene();
 const camera = new THREE.PerspectiveCamera(38,1,.1,100);
 camera.position.set(0,0,8.7);
 const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
 renderer.setClearColor(0x000000,0);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 sceneEl.appendChild(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0xffffff,0x5d391f,3.2));
 const key=new THREE.DirectionalLight(0xfff5e4,4.5);key.position.set(-3,5,5);scene.add(key);
 const rim=new THREE.DirectionalLight(0xffffff,3);rim.position.set(4,-1,-3);scene.add(rim);
 const group=new THREE.Group();scene.add(group);
 const material=new THREE.MeshStandardMaterial({color:0xff5000,roughness:.31,metalness:.24});
 let geometry=new THREE.TorusGeometry(1.52,.55,48,128);
 const mesh=new THREE.Mesh(geometry,material);group.add(mesh);
 let wires = new THREE.LineSegments(new THREE.WireframeGeometry(geometry),new THREE.LineBasicMaterial({color:0x983000,transparent:true,opacity:.1}));group.add(wires);
 group.rotation.set(.95,-.5,-.35);
 const orbitGroup=new THREE.Group();scene.add(orbitGroup);orbitGroup.rotation.set(.45,.1,-.4);
 for(let i=0;i<3;i++){
  const points=[];for(let j=0;j<=180;j++){let a=j/180*Math.PI*2;points.push(new THREE.Vector3(Math.cos(a)*2.55,Math.sin(a)*2.55,0));}
  const orbit=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0x8c9480,transparent:true,opacity:.28}));orbit.rotation.set(i*.82,.6+i*.5,0);orbitGroup.add(orbit);
 }
 const node=new THREE.Mesh(new THREE.SphereGeometry(.075,16,16),new THREE.MeshBasicMaterial({color:0x333b25}));node.position.set(2.5,.4,0);orbitGroup.add(node);
 let pointerX=0,pointerY=0,dragging=false,lastX=0,lastY=0,offsetX=0,offsetY=0;
 const resize=()=>{const{width,height}=sceneEl.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();};
 new ResizeObserver(resize).observe(sceneEl);resize();
 sceneEl.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;sceneEl.setPointerCapture(e.pointerId);});
 sceneEl.addEventListener('pointermove',e=>{if(dragging){offsetX+=(e.clientX-lastX)*.009;offsetY+=(e.clientY-lastY)*.009;lastX=e.clientX;lastY=e.clientY;}else{const r=sceneEl.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width-.5;pointerY=(e.clientY-r.top)/r.height-.5;}});
 const stop=()=>{dragging=false;};sceneEl.addEventListener('pointerup',stop);sceneEl.addEventListener('pointercancel',stop);
 sceneEl.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();offsetX+=e.key==='ArrowRight'?.2:e.key==='ArrowLeft'?-.2:0;offsetY+=e.key==='ArrowDown'?.2:e.key==='ArrowUp'?-.2:0;}});
 pause.addEventListener('click',()=>{paused=!paused;updatePause();});
 const formulas={torus:'R = 1.52 · r = 0.55',knot:'p = 2 · q = 3',sphere:'x² + y² + z² = r²'};
 document.querySelectorAll('[data-shape]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-shape]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
  geometry.dispose();wires.geometry.dispose();
  geometry=button.dataset.shape==='knot'?new THREE.TorusKnotGeometry(1.12,.35,180,24,2,3):button.dataset.shape==='sphere'?new THREE.SphereGeometry(1.78,40,24):new THREE.TorusGeometry(1.52,.55,48,128);
  mesh.geometry=geometry;wires.geometry=new THREE.WireframeGeometry(geometry);
  document.querySelector('.formula-tag').innerHTML=formulas[button.dataset.shape]+' <span>↗</span>';
 }));
 let last=0,t=0,visible=true;
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}).observe(sceneEl);
 renderer.setAnimationLoop(now=>{const dt=Math.min((now-last)/1000,.05);last=now;if(!visible||document.hidden)return;if(!paused&&!dragging)t+=dt;
 group.rotation.x=.95+offsetY+Math.sin(t*.28)*.12+pointerY*.08;
 group.rotation.y=-.5+offsetX+t*.13+pointerX*.15;
 group.position.y=paused?0:Math.sin(t*.65)*.055;
 orbitGroup.rotation.z=-.4+t*.035;
 renderer.render(scene,camera);
 });
}catch(error){
 sceneEl.innerHTML='<svg viewBox="0 0 600 550" role="img" aria-label="Tor matematic"><defs><radialGradient id="fallback"><stop stop-color="#ff8844"/><stop offset="1" stop-color="#f34400"/></radialGradient></defs><ellipse cx="300" cy="265" rx="155" ry="115" fill="none" stroke="url(#fallback)" stroke-width="85" transform="rotate(-35 300 265)"/></svg>';
 document.querySelector('.drag-hint').textContent='PREVIZUALIZARE GEOMETRICĂ';document.querySelector('.shape-controls').hidden=true;pause.hidden=true;
}
let lab='parabola';const parameter=document.querySelector('#parameter');
function drawGraph(){
 const a=Number(parameter.value);document.querySelector('#param-value').textContent=a.toFixed(1);
 document.querySelector('#equation').innerHTML=lab==='parabola'?`f(x) = <span>${a}</span>x²`:`f(x) = <span>${a}</span> sin(x)`;
 const p=[];for(let px=0;px<=600;px+=2){const x=(px-300)/40;const y=lab==='parabola'?a*x*x:a*Math.sin(x);p.push(`${px===0?'M':'L'}${px},${220-y*40}`);}document.querySelector('#curve').setAttribute('d',p.join(' '));
 document.querySelector('#graph').setAttribute('aria-label',`Graficul funcției f(x) = ${a} ${lab==='parabola'?'x la pătrat':'sinus de x'}`);
 const text=a===0?'Când a = 0, toate valorile funcției sunt zero. Graficul coincide cu axa Ox.':lab==='parabola'?(a>0?'Pentru a > 0, parabola se deschide în sus.':'Pentru a < 0, parabola se deschide în jos.')+' Cu cât |a| crește, cu atât curba devine mai îngustă.':`Amplitudinea undei este ${Math.abs(a).toFixed(1)}. ${a<0?'Semnul negativ reflectă graficul față de axa Ox.':'Parametrul a schimbă înălțimea undei, fără să-i schimbe perioada.'}`;
 document.querySelector('#lab-explanation').textContent=text;
}
parameter.addEventListener('input',drawGraph);
document.querySelectorAll('[data-lab]').forEach(button=>button.addEventListener('click',()=>{lab=button.dataset.lab;document.querySelectorAll('[data-lab]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});document.querySelector('#graph-label').textContent=lab==='parabola'?'EXPERIMENT 001 — PARABOLA':'EXPERIMENT 002 — UNDA';drawGraph();}));
document.querySelector('#reset-lab').addEventListener('click',()=>{parameter.value=1;drawGraph();});drawGraph();
document.querySelector('[data-topic="geometry"]').addEventListener('click',e=>{e.preventDefault();document.querySelector('[data-shape="sphere"]').click();document.querySelector('.hero').scrollIntoView({behavior:reducedMotion?'instant':'smooth'});sceneEl.focus({preventScroll:true});});
const questions=[
 {question:'2, 6, 12, 20, … Ce număr continuă șirul?',answers:['28','30','32','36'],correct:1,explanation:'Diferențele sunt 4, 6, 8. Urmează 10, deci 20 + 10 = 30. Termenul al n-lea este n(n + 1).'},
 {question:'Un pătrat are diagonala de 6√2 cm. Ce arie are?',answers:['12 cm²','24 cm²','36 cm²','72 cm²'],correct:2,explanation:'Diagonala unui pătrat este l√2. Latura este 6 cm, iar aria este 6² = 36 cm².'},
 {question:'Dacă f(x) = 2x + 3, pentru ce valoare a lui x avem f(x) = 11?',answers:['3','4','5','7'],correct:1,explanation:'Pornim de la 2x + 3 = 11. Scădem 3: 2x = 8. Împărțim la 2 și obținem x = 4.'}
];let questionIndex=0;
function renderQuestion(){const q=questions[questionIndex];document.querySelector('#question').textContent=q.question;document.querySelector('#quiz-count').textContent=`0${questionIndex+1} / 03`;document.querySelector('#quiz-category').textContent=['LOGICĂ','GEOMETRIE','ALGEBRĂ'][questionIndex]+' / NIVEL EXPLORATOR';document.querySelector('#feedback').textContent='';document.querySelector('#next-question').hidden=true;const answers=document.querySelector('#answers');answers.innerHTML='';q.answers.forEach((answer,index)=>{const b=document.createElement('button');b.textContent=String.fromCharCode(65+index)+' / '+answer;b.addEventListener('click',()=>{[...answers.children].forEach((btn,i)=>{btn.disabled=true;if(i===q.correct)btn.classList.add('correct');});if(index!==q.correct)b.classList.add('wrong');document.querySelector('#feedback').textContent=(index===q.correct?'Exact! ':'Aproape — hai să vedem ideea. ')+q.explanation;const next=document.querySelector('#next-question');next.hidden=false;next.innerHTML=(questionIndex===2?'Ia-o de la capăt':'Următoarea provocare')+' <span>→</span>';});answers.append(b);});}
document.querySelector('#next-question').addEventListener('click',()=>{questionIndex=(questionIndex+1)%questions.length;renderQuestion();document.querySelector('#answers button').focus({preventScroll:true});});renderQuestion();
