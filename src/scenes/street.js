import * as THREE from 'three';
import { gsap } from 'gsap';
const R = {};
const rnd = (a,b) => a + Math.random()*(b-a);
const pick = a => a[(Math.random()*a.length)|0];
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const cnv = (w,h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const NEON = ['#ff4f9a','#2fd3e0','#f0a030','#ff3b2f','#7cff6b','#b06bff','#fff1c9'];
const THEMES = {
  akihabara: {sky:['#07060d','#170f2a','#3d1e3c'], fog:0x1a1226, fogD:.026, rain:1200, rainOp:.28, holo:false, rim:[0xff4f9a,0x2fd3e0], bloom:.85, bg:0x0d0a16},
  cyberpunk: {sky:['#020509','#061a22','#0f3a40'], fog:0x0a1c22, fogD:.034, rain:2600, rainOp:.48, holo:true, rim:[0xff2a6d,0x05d9e8], bloom:1.1, bg:0x050a10}
};
R.THEMES = THEMES;

/* ================= canvas textures ================= */
function speckle(g,w,h,n,a){ for (let i=0;i<n;i++){ const v = Math.random()<.5?0:255; g.fillStyle = `rgba(${v},${v},${v},${Math.random()*a})`; g.fillRect(Math.random()*w, Math.random()*h, 1+Math.random()*2.5, 1+Math.random()*2.5); } }
function grime(g,w,h,k){
  for (let i=0;i<(k||14);i++){ const x = Math.random()*w, sw = 3+Math.random()*18, sh = h*(.2+Math.random()*.8); const gr = g.createLinearGradient(0,0,0,sh); gr.addColorStop(0,'rgba(20,16,12,.26)'); gr.addColorStop(1,'rgba(20,16,12,0)'); g.fillStyle = gr; g.fillRect(x,0,sw,sh); }
  const b = g.createLinearGradient(0,h*.7,0,h); b.addColorStop(0,'rgba(10,8,6,0)'); b.addColorStop(1,'rgba(10,8,6,.3)'); g.fillStyle = b; g.fillRect(0,h*.7,w,h*.3);
}
function tx(T, c, rx, ry){ const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; if (rx) t.repeat.set(rx, ry || rx); t.anisotropy = 8; return t; }
function facadeCanvas(kind, base){
  const c = cnv(256,256), g = c.getContext('2d'); g.fillStyle = base; g.fillRect(0,0,256,256);
  if (kind === 'tile') {
    for (let i=0;i<70;i++){ g.fillStyle = `rgba(0,0,0,${Math.random()*.07})`; g.fillRect(((Math.random()*8)|0)*32, ((Math.random()*16)|0)*16, 32, 16); }
    g.strokeStyle = 'rgba(0,0,0,.17)'; g.lineWidth = 1.5;
    for (let y=0;y<=256;y+=16){ g.beginPath(); g.moveTo(0,y); g.lineTo(256,y); g.stroke(); }
    for (let y=0;y<256;y+=16) for (let x=(y/16)%2?16:0; x<=256; x+=32){ g.beginPath(); g.moveTo(x,y); g.lineTo(x,y+16); g.stroke(); }
  } else if (kind === 'concrete') {
    g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 2; g.strokeRect(0,0,256,128); g.strokeRect(0,128,256,128);
    g.fillStyle = 'rgba(0,0,0,.28)'; [[64,64],[192,64],[64,192],[192,192]].forEach(([x,y]) => { g.beginPath(); g.arc(x,y,3,0,7); g.fill(); });
    speckle(g,256,256,2600,.12);
  } else if (kind === 'siding') {
    for (let x=0;x<256;x+=8){ g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(x,0,3,256); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x+5,0,2,256); }
    for (let i=0;i<12;i++){ g.fillStyle = 'rgba(120,60,20,.18)'; g.fillRect(Math.random()*256, Math.random()*256, 3+Math.random()*6, 10+Math.random()*40); }
  } else if (kind === 'wood') {
    for (let y=0;y<256;y+=14){ g.fillStyle = `rgba(0,0,0,${.12+Math.random()*.15})`; g.fillRect(0,y,256,2); }
    speckle(g,256,256,1500,.08);
  }
  speckle(g,256,256,1800,.07); grime(g,256,256); return c;
}
function windowAtlas(){
  const S = 512, n = 4, cs = S/n; const cm = cnv(S,S), ce = cnv(S,S), gm = cm.getContext('2d'), ge = ce.getContext('2d');
  ge.fillStyle = '#000'; ge.fillRect(0,0,S,S);
  for (let j=0;j<n;j++) for (let i=0;i<n;i++){
    const x = i*cs+18, y = j*cs+20, w = cs-36, h = cs-44; const lit = Math.random() < .4, warm = Math.random() < .72;
    gm.fillStyle = '#404146'; gm.fillRect(x-5,y-5,w+10,h+10);
    if (lit) {
      const gr = gm.createLinearGradient(0,y,0,y+h); gr.addColorStop(0, warm?'#ffe2ad':'#e4f0ff'); gr.addColorStop(1, warm?'#e39a55':'#a3c1e6'); gm.fillStyle = gr; gm.fillRect(x,y,w,h);
      ge.fillStyle = warm ? '#ffc883' : '#c5dcff'; ge.fillRect(x,y,w,h);
      if (Math.random() < .6) { gm.fillStyle = warm ? 'rgba(140,50,35,.5)' : 'rgba(50,70,100,.4)'; gm.fillRect(x,y,w*.28,h); gm.fillRect(x+w*.72,y,w*.28,h); ge.fillStyle = 'rgba(0,0,0,.6)'; ge.fillRect(x,y,w*.28,h); ge.fillRect(x+w*.72,y,w*.28,h); }
      if (Math.random() < .35) { gm.fillStyle = 'rgba(0,0,0,.25)'; ge.fillStyle = 'rgba(0,0,0,.4)'; for (let k=0;k<h;k+=6){ gm.fillRect(x,y+k,w,2); ge.fillRect(x,y+k,w,2); } }
    } else {
      const gr = gm.createLinearGradient(0,y,0,y+h); gr.addColorStop(0,'#3d4258'); gr.addColorStop(.5,'#161922'); gr.addColorStop(1,'#0c0d12'); gm.fillStyle = gr; gm.fillRect(x,y,w,h);
      if (Math.random() < .5) { gm.fillStyle = 'rgba(200,200,210,.22)'; for (let k=0;k<h;k+=7) gm.fillRect(x,y+k,w,3); }
    }
    gm.fillStyle = '#404146'; gm.fillRect(x+w/2-2,y,4,h); ge.fillStyle = '#000'; ge.fillRect(x+w/2-2,y,4,h);
    gm.fillStyle = '#8c8880'; gm.fillRect(x-9,y+h+5,w+18,6);
  }
  return {cm, ce};
}
function interiorCanvas(col, warm){
  const c = cnv(512,256), g = c.getContext('2d');
  const gr = g.createLinearGradient(0,0,0,256); gr.addColorStop(0, warm?'#fff0d2':'#eef5ff'); gr.addColorStop(1, warm?'#a8723f':'#76879c'); g.fillStyle = gr; g.fillRect(0,0,512,256);
  g.fillStyle = '#fff'; for (let x=30;x<512;x+=120) g.fillRect(x,8,70,6);
  for (let s=0;s<3;s++){
    const y = 64+s*60; g.fillStyle = 'rgba(40,30,25,.7)'; g.fillRect(0,y+40,512,6);
    for (let x=6;x<506;){ const w = 10+Math.random()*28, h = 12+Math.random()*30; g.globalAlpha = .85; g.fillStyle = pick(['#c23b3b','#2d6fb3','#e2b33c','#3c9a5f','#222','#ddd','#8a5bc2','#e07a2f']); g.fillRect(x,y+40-h,w,h); g.globalAlpha = 1; x += w+3+Math.random()*8; }
  }
  if (col) { g.fillStyle = col; g.globalAlpha = .2; g.fillRect(0,0,512,256); g.globalAlpha = 1; }
  const rg = g.createLinearGradient(0,0,512,256); rg.addColorStop(.3,'rgba(255,255,255,0)'); rg.addColorStop(.42,'rgba(255,255,255,.2)'); rg.addColorStop(.5,'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0,0,512,256);
  return c;
}
function shutterCanvas(){ const c = cnv(256,256), g = c.getContext('2d'); g.fillStyle = '#8b8d90'; g.fillRect(0,0,256,256); for (let y=0;y<256;y+=8){ g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0,y,256,3); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0,y+5,256,2); } speckle(g,256,256,1500,.1); grime(g,256,256,8);
  if (Math.random() < .7) { g.strokeStyle = pick(['rgba(255,80,140,.5)','rgba(60,200,220,.5)','rgba(250,220,60,.5)']); g.lineWidth = 6; g.beginPath(); g.moveTo(40,170); for (let i=0;i<8;i++) g.lineTo(50+i*22, 140+Math.random()*60); g.stroke(); }
  return c; }
function stripeCanvas(a,b){ const c = cnv(64,64), g = c.getContext('2d'); for (let y=0;y<64;y+=16){ g.fillStyle = a; g.fillRect(0,y,64,8); g.fillStyle = b; g.fillRect(0,y+8,64,8); } speckle(g,64,64,200,.08); return c; }
function vendingCanvas(){
  const c = cnv(256,512), g = c.getContext('2d'); g.fillStyle = '#e9eef2'; g.fillRect(0,0,256,512);
  g.fillStyle = '#0b2c5a'; g.fillRect(0,0,256,44); g.fillStyle = '#fff'; g.font = '26px "Dela Gothic One"'; g.textAlign = 'center'; g.fillText('つめた〜い', 128, 32);
  for (let r=0;r<4;r++){ const y = 60+r*80;
    for (let k=0;k<6;k++){ const x = 14+k*39; g.fillStyle = pick(['#d23a2a','#2d6fb3','#e2b33c','#3c9a5f','#f1ece2','#1a1a1a','#e07a2f','#8a5bc2']); g.beginPath(); g.roundRect ? g.roundRect(x,y,28,52,6) : g.rect(x,y,28,52); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x+4,y+6,4,40); g.fillStyle = r%2 ? '#1c5fd1' : '#d12b2b'; g.fillRect(x+2,y+58,24,8); }
  }
  g.fillStyle = '#20242a'; g.fillRect(0,388,256,124); g.fillStyle = '#0a0b0d'; g.fillRect(40,430,176,50); g.fillStyle = '#7d828a'; g.fillRect(200,398,26,22);
  return c;
}
function asphaltCanvas(){ const c = cnv(512,512), g = c.getContext('2d'); g.fillStyle = '#2b2a2f'; g.fillRect(0,0,512,512);
  for (let i=0;i<8;i++){ g.fillStyle = `rgba(${Math.random()<.5?0:80},${Math.random()<.5?0:80},${Math.random()<.5?0:90},.12)`; g.fillRect(Math.random()*512, Math.random()*512, 60+Math.random()*200, 40+Math.random()*160); }
  speckle(g,512,512,16000,.18);
  g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 1.5;
  for (let k=0;k<6;k++){ let x = Math.random()*512, y = Math.random()*512; g.beginPath(); g.moveTo(x,y); for (let i=0;i<14;i++){ x += rnd(-18,18); y += rnd(-24,24); g.lineTo(x,y); } g.stroke(); }
  return c; }
function puddleCanvas(){ const c = cnv(256,256), g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0,0,256,256);
  for (let i=0;i<16;i++){ const x = Math.random()*256, y = Math.random()*256, r = 14+Math.random()*44; const gr = g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.65,'rgba(255,255,255,.85)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle = gr; g.save(); g.translate(x,y); g.scale(1,.5+Math.random()); g.translate(-x,-y); g.fillRect(x-r,y-r,r*2,r*2); g.restore(); }
  return c; }
function stopCanvas(){ const c = cnv(256,512), g = c.getContext('2d'); g.fillStyle = 'rgba(235,232,224,.92)'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '150px "Dela Gothic One"';
  ['止','ま','れ'].forEach((ch,i) => { g.save(); g.translate(128, 90 + i*165); g.scale(1,1.15); g.fillText(ch,0,0); g.restore(); }); return c; }
function manholeCanvas(){ const c = cnv(128,128), g = c.getContext('2d'); g.fillStyle = '#3a3936'; g.beginPath(); g.arc(64,64,62,0,7); g.fill(); g.strokeStyle = '#25241f'; g.lineWidth = 3; for (let r=12;r<60;r+=10){ g.beginPath(); g.arc(64,64,r,0,7); g.stroke(); } for (let a=0;a<12;a++){ g.beginPath(); g.moveTo(64,64); g.lineTo(64+Math.cos(a*.52)*58, 64+Math.sin(a*.52)*58); g.stroke(); } return c; }
function norenCanvas(col, text){ const c = cnv(256,128), g = c.getContext('2d'); g.fillStyle = col; g.fillRect(0,0,256,128); g.clearRect(84,26,4,102); g.clearRect(170,26,4,102); g.fillStyle = '#f3ede2'; g.font = '62px "Dela Gothic One"'; g.textAlign = 'center'; g.textBaseline = 'middle'; [...text].forEach((ch,i) => g.fillText(ch, 43+i*86, 74)); return c; }
function checkerCanvas(){ const c = cnv(128,128), g = c.getContext('2d'); g.fillStyle = '#d6d0c0'; g.fillRect(0,0,128,128); g.fillStyle = '#8f8a80'; g.fillRect(0,0,64,64); g.fillRect(64,64,64,64); speckle(g,128,128,700,.1); g.strokeStyle = 'rgba(0,0,0,.2)'; g.strokeRect(0,0,128,128); return c; }
function plasterCanvas(col){ const c = cnv(256,256), g = c.getContext('2d'); g.fillStyle = '#ddd6c6'; g.fillRect(0,0,256,256); speckle(g,256,256,2000,.06); g.fillStyle = col; g.fillRect(0,170,256,14); g.fillStyle = '#3a342e'; g.fillRect(0,236,256,20); grime(g,256,256,6); return c; }
function pegCanvas(){ const c = cnv(128,128), g = c.getContext('2d'); g.fillStyle = '#b9905e'; g.fillRect(0,0,128,128); g.fillStyle = '#4a3420'; for (let y=8;y<128;y+=16) for (let x=8;x<128;x+=16){ g.beginPath(); g.arc(x,y,2.2,0,7); g.fill(); } speckle(g,128,128,400,.08); return c; }
function ceilingCanvas(){ const c = cnv(128,128), g = c.getContext('2d'); g.fillStyle = '#e7e3d8'; g.fillRect(0,0,128,128); speckle(g,128,128,1200,.12); g.strokeStyle = '#9d988c'; g.lineWidth = 3; g.strokeRect(0,0,128,128); return c; }
function cardCanvas(){ const c = cnv(128,128), g = c.getContext('2d'); g.fillStyle = '#b48a58'; g.fillRect(0,0,128,128); speckle(g,128,128,600,.1); g.fillStyle = 'rgba(220,200,150,.6)'; g.fillRect(0,56,128,16); g.fillStyle = '#2a2a2a'; g.font = '16px "DotGothic16"'; g.fillText('取扱注意', 30, 100); return c; }
function tagCanvas(price, name){ const c = cnv(256,104), g = c.getContext('2d'); g.fillStyle = '#ffe14d'; g.fillRect(0,0,256,104); g.strokeStyle = '#1a1a1a'; g.lineWidth = 4; g.strokeRect(4,4,248,96); g.fillStyle = '#1a1a1a'; g.textAlign = 'center'; g.font = '44px "DotGothic16"'; g.fillText(price, 128, 54); g.font = '19px "Zen Kaku Gothic New", sans-serif'; g.fillText(name.length > 22 ? name.slice(0,21)+'…' : name, 128, 86); return c; }
function popCanvas(col, grade){ const c = cnv(160,220), g = c.getContext('2d'); g.fillStyle = col; g.fillRect(0,0,160,220); g.fillStyle = '#fffaf0'; g.fillRect(10,10,140,200); g.fillStyle = '#d0281e'; g.textAlign = 'center'; g.font = '34px "Dela Gothic One"'; g.fillText('おすすめ', 80, 70); g.fillStyle = '#1a1a1a'; g.font = '28px "DotGothic16"'; g.fillText('RANK', 80, 128); g.font = '52px "Dela Gothic One"'; g.fillStyle = col; g.fillText(grade, 80, 186); return c; }
function posterCanvas(main, sub, col){ const c = cnv(256,360), g = c.getContext('2d'); g.fillStyle = '#efe7d4'; g.fillRect(0,0,256,360); g.fillStyle = col; g.fillRect(0,0,256,170); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '84px "Dela Gothic One"'; g.fillText(main, 128, 120); g.fillStyle = '#1a1a1a'; g.font = '30px "Dela Gothic One"'; g.fillText(sub, 128, 230); g.font = '20px "DotGothic16"'; g.fillText('ROJI DENKI', 128, 300); speckle(g,256,360,900,.08); return c; }
function noiseScreen(T){ const c = cnv(64,48), g = c.getContext('2d'); const t = new T.CanvasTexture(c); let f = 0; return {t, tick(){ if (f++ % 3) return; const im = g.createImageData(64,48); for (let i=0;i<im.data.length;i+=4){ const v = Math.random()*255; im.data[i]=v*.85; im.data[i+1]=v; im.data[i+2]=v*.95; im.data[i+3]=255; } g.putImageData(im,0,0); t.needsUpdate = true; }}; }
function skyTex(T, cols){ const c = cnv(4,256), g = c.getContext('2d'); const gr = g.createLinearGradient(0,0,0,256); gr.addColorStop(0,cols[0]); gr.addColorStop(.55,cols[1]); gr.addColorStop(1,cols[2]); g.fillStyle = gr; g.fillRect(0,0,4,256); return new T.CanvasTexture(c); }
function signTex(T, text, vertical, style){
  const w = vertical ? 128 : 512, h = vertical ? 512 : 128;
  const c = cnv(w,h), g = c.getContext('2d');
  g.fillStyle = style.bg; g.fillRect(0,0,w,h);
  g.strokeStyle = style.fg; g.lineWidth = 5; g.strokeRect(9,9,w-18,h-18);
  g.fillStyle = style.fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (style.glow) { g.shadowColor = style.fg; g.shadowBlur = 20; }
  if (vertical) {
    const chars = [...text]; const size = Math.min(92, (h-70)/chars.length);
    g.font = size + 'px "Dela Gothic One"';
    const top = (h - chars.length*size)/2 + size/2;
    chars.forEach((ch,i) => { const y = top + i*size; if (ch === 'ー') { g.save(); g.translate(w/2,y); g.rotate(Math.PI/2); g.fillText(ch,0,0); g.restore(); } else g.fillText(ch, w/2, y); });
  } else {
    let size = 70; g.font = size + 'px "Dela Gothic One"';
    while (g.measureText(text).width > w-70 && size > 20) { size -= 4; g.font = size + 'px "Dela Gothic One"'; }
    g.fillText(text, w/2, h/2 + 4);
  }
  const t = new T.CanvasTexture(c); t.anisotropy = 4; return t;
}
function holoTex(T, text, col){
  const c = cnv(512,256), g = c.getContext('2d');
  g.strokeStyle = col; g.lineWidth = 4; g.strokeRect(12,12,488,232);
  g.fillStyle = col; g.globalAlpha = .12; g.fillRect(12,12,488,232); g.globalAlpha = 1;
  g.shadowColor = col; g.shadowBlur = 26; g.textAlign = 'center'; g.textBaseline = 'middle';
  let size = 120; g.font = size + 'px "Dela Gothic One"';
  while (g.measureText(text).width > 440 && size > 30) { size -= 6; g.font = size + 'px "Dela Gothic One"'; }
  g.fillText(text, 256, 132);
  g.shadowBlur = 0; g.globalCompositeOperation = 'destination-out'; g.fillStyle = 'rgba(0,0,0,.55)';
  for (let y=0;y<256;y+=4) g.fillRect(0,y,512,1.6);
  return new T.CanvasTexture(c);
}

/* ================= renderer, post, mirror ================= */
const VS = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
function makePost(T, r){
  const w2 = r.capabilities.isWebGL2; const o = {type: w2 ? T.HalfFloatType : T.UnsignedByteType, depthBuffer:false};
  const rtS = new T.WebGLRenderTarget(1,1,{type:o.type, samples: w2 ? 4 : 0});
  const rtA = new T.WebGLRenderTarget(1,1,o), rtB = new T.WebGLRenderTarget(1,1,o), rtC = new T.WebGLRenderTarget(1,1,o), rtD = new T.WebGLRenderTarget(1,1,o);
  const ocam = new T.OrthographicCamera(-1,1,1,-1,0,1), qs = new T.Scene(), quad = new T.Mesh(new T.PlaneGeometry(2,2)); quad.frustumCulled = false; qs.add(quad);
  const mk = (u, fs) => new T.ShaderMaterial({uniforms:u, vertexShader:VS, fragmentShader:fs, depthTest:false, depthWrite:false});
  const bright = mk({tD:{value:null}, th:{value:.74}}, 'uniform sampler2D tD;uniform float th;varying vec2 vUv;void main(){vec3 c=texture2D(tD,vUv).rgb;float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(th,th+.35,l),1.);}');
  const blur = mk({tD:{value:null}, dir:{value:new T.Vector2()}}, 'uniform sampler2D tD;uniform vec2 dir;varying vec2 vUv;void main(){vec3 c=texture2D(tD,vUv).rgb*.227027;c+=texture2D(tD,vUv+dir*1.3846).rgb*.3162162;c+=texture2D(tD,vUv-dir*1.3846).rgb*.3162162;c+=texture2D(tD,vUv+dir*3.2308).rgb*.0702703;c+=texture2D(tD,vUv-dir*3.2308).rgb*.0702703;gl_FragColor=vec4(c,1.);}');
  const comp = mk({tS:{value:null}, tB1:{value:null}, tB2:{value:null}, bloom:{value:.9}, time:{value:0}, vig:{value:.5}, grain:{value:.045}, ca:{value:.0035}},
    'uniform sampler2D tS,tB1,tB2;uniform float bloom,time,vig,grain,ca;varying vec2 vUv;float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}void main(){vec2 d=vUv-.5;float r=dot(d,d);vec2 o=d*ca*(.5+r*4.);vec3 c=vec3(texture2D(tS,vUv+o).r,texture2D(tS,vUv).g,texture2D(tS,vUv-o).b);vec3 b=(texture2D(tB1,vUv).rgb+texture2D(tB2,vUv).rgb*1.4)*bloom;c=1.-(1.-clamp(c,0.,1.))*(1.-clamp(b,0.,1.));c*=mix(1.,1.-vig,smoothstep(.08,.5,r));c+=(h(vUv*vec2(1733.,977.)+time)-.5)*grain;gl_FragColor=vec4(c,1.);}');
  let W = 2, H = 2;
  const pass = (m, t) => { quad.material = m; r.setRenderTarget(t); r.render(qs, ocam); };
  return {
    setSize(w,h){ W = Math.max(4,w); H = Math.max(4,h); rtS.setSize(W,H); rtA.setSize(W>>1,H>>1); rtB.setSize(W>>1,H>>1); rtC.setSize(W>>2,H>>2); rtD.setSize(W>>2,H>>2); },
    render(scene, cam, t, bl){
      r.setRenderTarget(rtS); r.clear(); r.render(scene, cam);
      bright.uniforms.tD.value = rtS.texture; pass(bright, rtA);
      blur.uniforms.tD.value = rtA.texture; blur.uniforms.dir.value.set(1.6/(W>>1),0); pass(blur, rtB);
      blur.uniforms.tD.value = rtB.texture; blur.uniforms.dir.value.set(0,1.6/(H>>1)); pass(blur, rtA);
      blur.uniforms.tD.value = rtA.texture; blur.uniforms.dir.value.set(2.6/(W>>2),0); pass(blur, rtC);
      blur.uniforms.tD.value = rtC.texture; blur.uniforms.dir.value.set(0,2.6/(H>>2)); pass(blur, rtD);
      Object.assign(comp.uniforms.tS, {value:rtS.texture}); comp.uniforms.tB1.value = rtA.texture; comp.uniforms.tB2.value = rtD.texture; comp.uniforms.time.value = t % 10; comp.uniforms.bloom.value = bl;
      pass(comp, null);
    },
    dispose(){ [rtS,rtA,rtB,rtC,rtD].forEach(x => x.dispose()); [bright,blur,comp].forEach(m => m.dispose()); }
  };
}
function makeMirror(T, r){
  const rt = new T.WebGLRenderTarget(2,2); const mcam = new T.PerspectiveCamera(); const texM = new T.Matrix4(); const fwd = new T.Vector3(), tgt = new T.Vector3();
  return { rt, texM,
    setSize(w,h){ rt.setSize(Math.max(2,w>>1), Math.max(2,h>>1)); },
    update(scene, cam, hide){
      mcam.copy(cam); mcam.position.set(cam.position.x, -cam.position.y, cam.position.z);
      cam.getWorldDirection(fwd); tgt.copy(cam.position).add(fwd); tgt.y = -tgt.y;
      mcam.up.set(0,-1,0); mcam.lookAt(tgt); mcam.updateMatrixWorld(); mcam.projectionMatrix.copy(cam.projectionMatrix);
      texM.set(.5,0,0,.5, 0,.5,0,.5, 0,0,.5,.5, 0,0,0,1); texM.multiply(mcam.projectionMatrix).multiply(mcam.matrixWorldInverse);
      const prev = hide.map(o => o.visible); hide.forEach(o => o.visible = false);
      r.setRenderTarget(rt); r.clear(); r.render(scene, mcam);
      hide.forEach((o,i) => o.visible = prev[i]);
    },
    dispose(){ rt.dispose(); }
  };
}
function mirrorMat(T, mirror, o){
  const m = new T.MeshStandardMaterial({color:o.color ?? 0xffffff, map:o.map || null, roughness:o.roughness ?? .8, metalness:o.metalness ?? .1});
  const U = {tMirror:{value:mirror.rt.texture}, texM:{value:mirror.texM}, tMask:{value:o.mask || null}, uTime:o.timeU || {value:0}, uStr:{value:o.strength ?? 1}, uMaskScale:{value:o.maskScale || .08}, uFixed:{value: o.mask ? -1 : (o.fixed ?? .5)}};
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = 'uniform mat4 texM;\nvarying vec4 vMirror;\nvarying vec2 vWxz;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\nvec4 wpM = modelMatrix * vec4(transformed, 1.0);\nvMirror = texM * wpM;\nvWxz = wpM.xz;');
    sh.fragmentShader = 'uniform sampler2D tMirror;\nuniform sampler2D tMask;\nuniform float uTime;\nuniform float uStr;\nuniform float uMaskScale;\nuniform float uFixed;\nvarying vec4 vMirror;\nvarying vec2 vWxz;\n' + sh.fragmentShader.replace('#include <dithering_fragment>', [
      'float pud = uFixed < 0.0 ? texture2D(tMask, vWxz * uMaskScale).r : uFixed;',
      'vec2 rip = vec2(sin(vWxz.y*9.0+uTime*3.0)+sin(vWxz.x*13.0-uTime*2.3), cos(vWxz.x*8.0+uTime*2.7)+cos(vWxz.y*11.0+uTime*1.9)) * 0.0022;',
      'vec2 muv = vMirror.xy / vMirror.w + rip * (0.4 + pud);',
      'vec3 sharpR = texture2D(tMirror, muv).rgb;',
      'vec3 softR = (texture2D(tMirror, muv + vec2(0.006, 0.0)).rgb + texture2D(tMirror, muv - vec2(0.006, 0.0)).rgb + texture2D(tMirror, muv + vec2(0.0, 0.016)).rgb + texture2D(tMirror, muv - vec2(0.0, 0.016)).rgb) * 0.25;',
      'gl_FragColor.rgb += mix(softR * 0.32, sharpR * 0.85, pud) * uStr;',
      '#include <dithering_fragment>'].join('\n'));
  };
  m.customProgramCacheKey = () => 'roji-mirror-' + (o.mask ? 'm' : 'f');
  return m;
}
function base(T, el, opt){
  const r = new T.WebGLRenderer({antialias:!opt.post, powerPreference:'high-performance'});
  const dpr = Math.min(devicePixelRatio, opt.post ? 1.25 : 1.5);
  r.setPixelRatio(dpr); r.setSize(el.clientWidth || 1, el.clientHeight || 1);
  r.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y';
  el.appendChild(r.domElement);
  const cam = new T.PerspectiveCamera(opt.fov || 60, (el.clientWidth||1)/(el.clientHeight||1), .1, opt.far || 300);
  const post = opt.post ? makePost(T, r) : null, mirror = opt.mirror ? makeMirror(T, r) : null;
  const resize = () => { const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; r.setSize(w,h); cam.aspect = w/h; cam.updateProjectionMatrix(); const pw = Math.floor(w*dpr), ph = Math.floor(h*dpr); post && post.setSize(pw,ph); mirror && mirror.setSize(pw,ph); };
  resize();
  const ro = new ResizeObserver(resize); ro.observe(el);
  let raf = 0; const clock = new T.Clock();
  return {
    r, cam, mirror,
    render(scene, c, t, bl){ if (post) post.render(scene, c, t, bl); else { r.setRenderTarget(null); r.render(scene, c); } },
    start(fn){ const loop = () => { raf = requestAnimationFrame(loop); const dt = Math.min(clock.getDelta(), .05); if (!el.clientWidth) return; if (r.domElement.width !== Math.floor(el.clientWidth*dpr) || r.domElement.height !== Math.floor(el.clientHeight*dpr)) resize(); fn(dt); }; loop(); },
    destroy(){ cancelAnimationFrame(raf); ro.disconnect(); post && post.dispose(); mirror && mirror.dispose(); r.dispose(); r.forceContextLoss && r.forceContextLoss(); r.domElement.remove(); }
  };
}

/* ================= product models ================= */
function buildModel(T, key){
  const g = new T.Group();
  const M = (c,o) => new T.MeshStandardMaterial(Object.assign({color:c, roughness:.5, metalness:.1}, o||{}));
  const G = c => new T.MeshBasicMaterial({color:c});
  const add = (geo, mat, x=0, y=0, z=0, rx=0, ry=0, rz=0) => { const m = new T.Mesh(geo, mat); m.position.set(x,y,z); m.rotation.set(rx,ry,rz); g.add(m); return m; };
  const BX = (w,h,d) => new T.BoxGeometry(w,h,d), CY = (r,h,s) => new T.CylinderGeometry(r,r,h,s||28);
  const dark = M(0x1d1b20), metal = M(0xb9b6b0, {metalness:.8, roughness:.3}), glass = M(0x22313a, {roughness:.08, metalness:.4});
  const H = Math.PI/2;
  switch (key) {
    case 'cassette': {
      add(BX(1.6,1.1,.42), M(0xc8c3ba,{metalness:.55,roughness:.3}), 0,.55,0);
      add(BX(1.0,.5,.02), glass, 0,.66,.215);
      [-.24,.24].forEach(x => { add(CY(.13,.03), M(0xf1ece2), x,.66,.225, H); add(CY(.045,.045), dark, x,.66,.235, H); });
      add(BX(1.61,.07,.43), M(0xe8662c), 0,.22,0);
      for (let i=0;i<5;i++) add(BX(.2,.08,.16), i===1 ? M(0xd23a2a) : dark, -.5+i*.25, 1.14, 0);
      add(CY(.05,.14), dark, .62,1.15,.1); add(BX(.06,.42,.3), dark, .82,.6,0);
      break;
    }
    case 'md': {
      add(BX(1.1,.85,.26), M(0x6f86b8,{metalness:.65,roughness:.3}), 0,.425,0);
      add(BX(.66,.6,.02), glass, -.12,.45,.135); add(CY(.26,.012,40), metal, -.12,.45,.15, H);
      add(BX(.16,.42,.02), G(0x7fe0c9), .4,.48,.135);
      for (let i=0;i<4;i++) add(BX(.06,.1,.08), dark, .56,.2+i*.16,0);
      break;
    }
    case 'boombox': {
      const silver = M(0xbfbcb5,{metalness:.6,roughness:.3});
      add(BX(2.0,1.0,.5), silver, 0,.5,0); add(BX(2.01,.08,.51), dark, 0,.06,0);
      [-.62,.62].forEach(x => { add(CY(.34,.04,40), dark, x,.5,.26, H); add(CY(.26,.05,40), M(0x2b2a2e,{roughness:.95}), x,.5,.27, H); add(CY(.08,.06), metal, x,.5,.3, H); add(new T.TorusGeometry(.35,.02,8,40), metal, x,.5,.27); });
      add(BX(.5,.32,.02), glass, 0,.55,.255); [-.1,.1].forEach(x => add(CY(.06,.02), M(0xf1ece2), x,.55,.265, H));
      for (let i=0;i<6;i++) add(BX(.12,.06,.12), i===2 ? M(0xd23a2a) : dark, -.35+i*.14, 1.03, .1);
      add(BX(1.5,.07,.1), dark, 0,1.32,0); add(BX(.07,.3,.1), dark, -.72,1.15,0); add(BX(.07,.3,.1), dark, .72,1.15,0);
      add(CY(.015,1.0), metal, .85,1.45,-.1, 0,0,-.5);
      break;
    }
    case 'turntable': {
      add(BX(1.8,.28,1.4), M(0x6e4527,{roughness:.55}), 0,.14,0); add(BX(1.81,.03,1.41), metal, 0,.29,0);
      add(CY(.6,.06,48), metal, -.2,.33,.05); add(CY(.58,.015,48), M(0x0d0d0f,{roughness:.25}), -.2,.37,.05); add(CY(.16,.018,32), M(0xd23a2a), -.2,.372,.05);
      add(CY(.08,.12), dark, .6,.36,-.45); add(BX(.04,.04,.85), metal, .45,.43,-.05, 0,.35,0); add(BX(.06,.05,.12), dark, .3,.42,.34);
      add(CY(.05,.05), metal, .5,.32,.55); add(CY(.05,.05), metal, .75,.32,.55);
      break;
    }
    case 'crt': {
      add(BX(1.4,1.25,1.25), M(0xd9d2c3), 0,.625,0); add(BX(1.06,.88,.02), dark, -.1,.7,.63);
      const ns = noiseScreen(T); add(BX(.9,.7,.02), new T.MeshBasicMaterial({map:ns.t}), -.1,.7,.645);
      [.92,.62].forEach(y => add(CY(.07,.07), dark, .56,y,.66, H));
      for (let i=0;i<4;i++) add(BX(.2,.02,.01), dark, .56,.3+i*.05,.63);
      add(CY(.016,1.3), metal, -.32,1.8,-.25, 0,0,.42); add(CY(.016,1.3), metal, .32,1.8,-.25, 0,0,-.42); add(CY(.08,.1), dark, 0,1.28,-.25);
      g.userData.tick = ns.tick;
      break;
    }
    case 'vhs': {
      add(BX(1.9,.38,1.2), M(0x1a191d,{roughness:.4}), 0,.19,0); add(BX(1.91,.04,1.21), metal, 0,.39,0);
      add(BX(1.0,.07,.02), M(0x050406), -.3,.24,.605); add(BX(.42,.12,.02), G(0x3cff9a), .6,.26,.605);
      for (let i=0;i<5;i++) add(BX(.1,.05,.03), metal, -.7+i*.15,.1,.61);
      add(CY(.09,.04), metal, .6,.1,.62, H);
      break;
    }
    case 'camcorder': {
      add(BX(.6,.62,1.4), M(0x2b2b30,{roughness:.5}), 0,.31,0);
      add(CY(.24,.42), dark, 0,.36,.85, H); add(CY(.19,.02), glass, 0,.36,1.06, H);
      add(CY(.07,.45), dark, -.22,.78,.25, H); add(BX(.08,.5,.9), M(0x111114), .34,.35,0);
      add(new T.SphereGeometry(.035,10,8), G(0xff2a2a), .2,.62,.7); add(BX(.3,.04,.2), metal, .1,.63,-.3);
      break;
    }
    case 'projector': {
      add(BX(.7,.85,1.2), M(0x5d6b58,{roughness:.45,metalness:.3}), 0,.425,0);
      add(CY(.12,.38), metal, 0,.5,.78, H); add(CY(.09,.02), glass, 0,.5,.97, H);
      add(CY(.025,.6), metal, 0,1.1,.3, -.45); add(CY(.025,.6), metal, 0,1.1,-.3, .45);
      add(CY(.42,.05,40), metal, 0,1.45,.52, 0,0,H); add(CY(.42,.05,40), metal, 0,1.45,-.52, 0,0,H);
      add(CY(.12,.06), dark, 0,1.45,.52, 0,0,H); add(CY(.12,.06), dark, 0,1.45,-.52, 0,0,H);
      add(CY(.07,.05), dark, .38,.6,.2, 0,0,H);
      break;
    }
    case 'halfcam': {
      add(BX(1.3,.72,.42), M(0x1c1b1f,{roughness:.8}), 0,.36,0); add(BX(1.31,.2,.43), metal, 0,.82,0);
      add(CY(.28,.32), metal, .1,.4,.36, H); add(CY(.21,.03), glass, .1,.4,.53, H);
      add(BX(.26,.15,.05), glass, -.42,.82,.2); add(CY(.06,.06), M(0xd23a2a), .45,.95,0); add(CY(.1,.08), metal, -.25,.95,0);
      break;
    }
    case 'slr': {
      add(BX(1.36,.72,.46), M(0x1a191d,{roughness:.8}), 0,.36,0); add(BX(1.37,.18,.47), metal, 0,.81,0);
      add(new T.CylinderGeometry(.2,.32,.32,4), M(0x1a191d,{roughness:.6}), 0,1.05,0, 0,Math.PI/4,0);
      add(CY(.32,.55), dark, 0,.42,.5, H); add(CY(.31,.06), metal, 0,.42,.64, H); add(CY(.24,.02), glass, 0,.42,.78, H);
      add(CY(.07,.07), metal, .45,.95,0); add(CY(.09,.06), metal, -.45,.95,0);
      break;
    }
    case 'rangefinder': {
      add(BX(1.3,.7,.4), M(0x2a2622,{roughness:.85}), 0,.35,0); add(BX(1.31,.26,.41), metal, 0,.83,0);
      add(BX(.22,.13,.02), glass, -.42,.85,.21); add(BX(.12,.1,.02), glass, .3,.85,.21);
      add(CY(.24,.3), metal, .05,.38,.33, H); add(CY(.17,.02), glass, .05,.38,.49, H); add(CY(.05,.05), M(0xd23a2a), .45,1.0,0);
      break;
    }
    case 'instant': {
      add(BX(1.2,.95,1.0), M(0xf0ece4), 0,.475,0); add(BX(1.21,.2,1.01), M(0x1d1b20), 0,.1,0);
      add(CY(.3,.12), dark, .18,.55,.52, H); add(CY(.2,.02), glass, .18,.55,.59, H);
      add(BX(.36,.18,.05), M(0xdde7ee,{roughness:.2}), -.3,.82,.5);
      ['#e8452c','#f08a24','#f3c641','#4fa35a','#2d7fc1'].forEach((c,i) => add(BX(.05,.5,.01), M(new T.Color(c)), -.44+i*.06,.4,.505));
      add(BX(.8,.04,.02), M(0x050406), 0,.17,.51);
      break;
    }
    case 'handheld': {
      add(BX(.9,1.4,.2), M(0xc9c7c0), 0,.7,0); add(BX(.72,.56,.02), M(0x45434f), 0,.98,.105); add(BX(.56,.42,.02), G(0x9bc46a), 0,.98,.115);
      add(BX(.28,.09,.06), dark, -.22,.4,.11); add(BX(.09,.28,.06), dark, -.22,.4,.11);
      add(CY(.065,.06), M(0xb3245c), .16,.38,.11, H); add(CY(.065,.06), M(0xb3245c), .32,.46,.11, H);
      add(BX(.12,.04,.03), dark, -.08,.16,.11, 0,0,.4); add(BX(.12,.04,.03), dark, .1,.16,.11, 0,0,.4);
      break;
    }
    case 'arcade': {
      add(BX(2.1,.3,1.0), M(0x141318), 0,.15,0); add(BX(2.1,.04,1.0), M(0x2a3f8f,{roughness:.3}), 0,.32,0);
      add(CY(.03,.42), metal, -.6,.54,0); add(new T.SphereGeometry(.13,20,16), M(0xd23a2a,{roughness:.2}), -.6,.78,0); add(CY(.16,.04), dark, -.6,.35,0);
      const bc = [0xff4f9a,0x2fd3e0,0xf0a030,0x7cff6b,0xb06bff,0xf1ece2];
      for (let i=0;i<6;i++) add(CY(.085,.07), M(bc[i],{roughness:.25}), .05+(i%3)*.27, .37, i<3 ? -.14 : .16);
      break;
    }
    case 'console': {
      add(BX(1.4,.32,1.0), M(0xd6d1c7,{roughness:.6}), 0,.16,-.25); add(BX(1.41,.1,.2), M(0x6d1f2a), 0,.1,.2);
      add(BX(.8,.04,.3), dark, 0,.33,-.35); add(BX(.5,.22,.08), M(0x4a3d40), 0,.44,-.35);
      [-.42,.42].forEach(x => { add(BX(.62,.07,.28), M(0x2a2a2e), x,.035,.62); add(BX(.14,.03,.04), dark, x-.15,.08,.62); add(BX(.04,.03,.14), dark, x-.15,.08,.62); add(CY(.035,.03), M(0xd23a2a), x+.12,.08,.6); add(CY(.035,.03), M(0xd23a2a), x+.22,.08,.64); });
      break;
    }
    case 'minicab': {
      const blk = M(0x141318,{roughness:.5});
      add(BX(.9,1.8,.8), blk, 0,.9,0); add(BX(.01,1.4,.7), M(0xff4f9a), .455,.95,0); add(BX(.01,1.4,.7), M(0xff4f9a), -.455,.95,0);
      add(BX(.7,.55,.02), G(0x5fd3ff), 0,1.35,.37, -.25); add(BX(.86,.22,.1), G(0xfff1c9), 0,1.72,.36);
      add(BX(.9,.12,.4), blk, 0,.98,.5, .25); add(CY(.02,.16), metal, -.2,1.1,.52); add(new T.SphereGeometry(.05,12,10), M(0xd23a2a), -.2,1.19,.52);
      [.05,.17,.29].forEach(x => add(CY(.035,.03), M(0x2fd3e0), x,1.06,.54, .25)); add(BX(.3,.3,.02), metal, 0,.45,.41);
      break;
    }
    case 'pager': {
      add(BX(.9,.55,.24), M(0x18171b,{roughness:.6}), 0,.275,0); add(BX(.62,.18,.02), G(0x7fe0c9), -.05,.37,.125);
      add(BX(.16,.08,.04), M(0x6a6870), .3,.14,.12); add(BX(.3,.42,.04), dark, 0,.28,-.14); add(CY(.04,.06), M(0xd23a2a), .35,.56,0);
      break;
    }
    case 'payphone': {
      const pink = M(0xff8fb3,{roughness:.35});
      add(BX(1.0,1.4,.7), pink, 0,.7,0); add(BX(.6,.16,.02), M(0xf3ead6), .1,1.24,.355);
      add(CY(.3,.05,40), M(0xf3ead6), .15,.72,.37, H); add(CY(.1,.06), pink, .15,.72,.4, H);
      add(BX(.22,.04,.02), M(0x050406), .15,1.05,.355); add(BX(.28,.16,.06), dark, .15,.22,.37);
      add(BX(.2,.95,.3), M(0xe66f97), -.6,.78,.1); add(BX(.13,1.0,.17), pink, -.72,.78,.28);
      add(BX(.2,.16,.22), pink, -.72,1.25,.3); add(BX(.2,.16,.22), pink, -.72,.31,.3);
      break;
    }
    case 'rotary': {
      const b = M(0x111113,{roughness:.22});
      add(BX(1.0,.42,.95), b, 0,.21,0); add(BX(.9,.14,.55), b, 0,.46,-.1, -.3);
      add(CY(.3,.05,40), M(0xe9e4da), 0,.4,.42, H-.5); add(CY(.12,.06), b, 0,.41,.44, H-.5);
      add(BX(1.1,.12,.2), b, 0,.66,-.15); add(BX(.22,.2,.26), b, -.48,.6,-.15); add(BX(.22,.2,.26), b, .48,.6,-.15);
      break;
    }
    case 'flip': {
      const s = M(0xc7c9d0,{metalness:.6,roughness:.3});
      add(BX(.5,.95,.07), s, 0,.475,0, -.15);
      const cr = Math.cos(.15), sr = Math.sin(.15);
      for (let r=0;r<4;r++) for (let c=0;c<3;c++) { const ly = -.3 + r*.12; add(BX(.11,.07,.02), dark, (c-1)*.14, .475 + ly*cr + .045*sr, -ly*sr + .045*cr, -.15); }
      add(BX(.5,.95,.07), s, 0,1.40,-.23, -.35); add(BX(.38,.5,.01), G(0x7fd8ff), 0,1.43,-.19, -.35);
      break;
    }
    default: add(BX(1,1,1), M(0x888888), 0,.5,0);
  }
  return g;
}
function normalize(T, model, size){
  const box = new T.Box3().setFromObject(model), s3 = new T.Vector3(), c = new T.Vector3(); box.getSize(s3); box.getCenter(c);
  const s = size / Math.max(s3.x, s3.y, s3.z); model.scale.setScalar(s); model.position.set(-c.x*s, -box.min.y*s, -c.z*s);
  const wrap = new T.Group(); wrap.add(model); wrap.userData.tick = model.userData.tick; return wrap;
}
R.buildModel = buildModel;

/* ================= 1. realistic street ================= */
R.alley = function(el, ctx){
  const T = THREE; const B = base(T, el, {fov:55, far:240, post:true, mirror:true}); const {cam, mirror} = B;
  const scene = new T.Scene();
  const skies = {akihabara:skyTex(T, THEMES.akihabara.sky), cyberpunk:skyTex(T, THEMES.cyberpunk.sky)};
  scene.background = skies.akihabara; scene.fog = new T.FogExp2(0x1a1226, .026);
  cam.position.set(0, 1.62, 10);
  scene.add(new T.HemisphereLight(0x5b4a8a, 0x120e16, .6));
  const timeU = {value:0};
  let lightsUsed = 0; const MAXL = 18;
  const light = (col, int, dist, x, y, z) => { if (lightsUsed >= MAXL) return null; lightsUsed++; const l = new T.PointLight(new T.Color(col), int, dist, 2); l.position.set(x,y,z); scene.add(l); return l; };

  const FACC = [['tile','#bdb3a4'],['tile','#8f8679'],['tile','#c8c0b2'],['concrete','#8b8883'],['siding','#6d777c'],['siding','#7b6656'],['tile','#a69a8c'],['concrete','#a19c93']].map(([k,b]) => facadeCanvas(k,b));
  const woodC = facadeCanvas('wood', '#4a3022');
  const WA = windowAtlas(); const winMapC = WA.cm, winEmC = WA.ce;
  const shutterCs = [shutterCanvas(), shutterCanvas(), shutterCanvas()];
  const interiorCs = [interiorCanvas(null,true), interiorCanvas(null,false), interiorCanvas(null,true)];
  const vendC = vendingCanvas();
  const frameMat = new T.MeshStandardMaterial({color:0x232227, roughness:.5, metalness:.6});
  const facMat = (c, w, h) => new T.MeshStandardMaterial({map:tx(T, c, w/4, h/4), roughness:.92, metalness:.02});
  const signs = [];
  const VT = ['電気','カラオケ','ラーメン','薬','酒場','喫茶','質屋','中古','修理','焼鳥','麻雀','占い','理容','歯科'];
  const HT = ['KISSA 喫茶','24H','RAMEN 拉麺','KARAOKE','HOTEL','BAR 酒','PACHI','RADIO','中華 CHUKA','薬局 DRUG','コインランドリー','たばこ'];
  const styleFor = () => { const col = pick(NEON); const k = Math.random(); if (k < .4) return {bg:col, fg:'#140f18', col}; if (k < .78) return {bg:'#0d0a12', fg:col, glow:true, col}; return {bg:'#f3ead6', fg:'#d0281e', col:'#ffd9b0'}; };
  const basicLit = (t, s) => { const m = new T.MeshBasicMaterial({map:t}); m.color.setScalar(s); return m; };

  // ground
  const road = new T.Mesh(new T.PlaneGeometry(6, 240), mirrorMat(T, mirror, {map:tx(T, asphaltCanvas(), 1, 40), roughness:.78, color:0xa09ea6, mask:tx(T, puddleCanvas()), maskScale:.09, strength:1, timeU}));
  road.rotation.x = -Math.PI/2; road.position.set(0,0,-100); scene.add(road);
  const concrete = new T.MeshStandardMaterial({color:0x5c5a55, roughness:.9});
  [-1,1].forEach(s => {
    const gt = new T.Mesh(new T.BoxGeometry(.5,.05,240), concrete); gt.position.set(s*2.75,.025,-100); scene.add(gt);
    const ln = new T.Mesh(new T.PlaneGeometry(.12,240), new T.MeshStandardMaterial({color:0xcfcdc6, roughness:.55})); ln.rotation.x = -Math.PI/2; ln.position.set(s*2.32,.006,-100); scene.add(ln);
  });
  const stop = new T.Mesh(new T.PlaneGeometry(1.7,3.4), new T.MeshStandardMaterial({map:new T.CanvasTexture(stopCanvas()), transparent:true, roughness:.5}));
  stop.rotation.x = -Math.PI/2; stop.position.set(0,.007,3.2); scene.add(stop);
  const sline = new T.Mesh(new T.PlaneGeometry(4.6,.3), new T.MeshStandardMaterial({color:0xdedbd2, roughness:.5})); sline.rotation.x = -Math.PI/2; sline.position.set(0,.007,1.1); scene.add(sline);
  const mhT = new T.CanvasTexture(manholeCanvas());
  for (let z=-8; z>-150; z-=23) { const mh = new T.Mesh(new T.CircleGeometry(.36,24), new T.MeshStandardMaterial({map:mhT, roughness:.4, metalness:.7})); mh.rotation.x = -Math.PI/2; mh.position.set(rnd(-1.2,1.2),.008,z); scene.add(mh); }

  // department storefronts
  const depts = ctx.depts || [];
  const hits = [], deptFx = {};
  depts.forEach(d => { deptFx[d.key] = {mats:[], lights:[], base:[]}; });
  depts.forEach(d => { const L = light(d.col, 2.2, 11, d.side*1.6, 2.6, d.z); L && deptFx[d.key].lights.push(L); });

  const P = (side, w, h, mat, y, off, z) => { const m = new T.Mesh(new T.PlaneGeometry(w,h), mat); m.rotation.y = -side*Math.PI/2; m.position.set(side*(3-off), y, z); scene.add(m); return m; };
  const BXs = (side, w, h, dep, mat, y, off, z) => { const m = new T.Mesh(new T.BoxGeometry(dep, h, w), mat); m.position.set(side*(3-off), y, z); scene.add(m); return m; };
  const faceIdx = side => side < 0 ? 0 : 1;

  const winPlane = (side, zc, d, y0, rows) => {
    const cols = Math.max(1, Math.round((d-.6)/2.0));
    const ox = Math.floor(Math.random()*4)/4, oy = Math.floor(Math.random()*4)/4;
    const tm = tx(T, winMapC, cols/4, rows/4); tm.offset.set(ox,oy);
    const te = tx(T, winEmC, cols/4, rows/4); te.offset.set(ox,oy);
    P(side, d-.6, rows*3-.2, new T.MeshStandardMaterial({map:tm, emissiveMap:te, emissive:0xffffff, emissiveIntensity:.8, roughness:.25, metalness:.35, transparent:true, alphaTest:.5}), y0 + (rows*3-.2)/2 + .1, .03, zc);
  };
  const vSign = (x, y, z, L, text, st, bright) => {
    const sm = basicLit(signTex(T, text, true, st), bright || 1.3);
    const m = new T.Mesh(new T.BoxGeometry(.8, L, .09), [frameMat, frameMat, frameMat, frameMat, sm, sm]); m.position.set(x,y,z); scene.add(m);
    return sm;
  };
  const building = (side, zTop, d, dept) => {
    const zc = zTop - d/2, GF = 3.8, FH = 3.0;
    const floors = dept ? 3 : pick([2,3,3,4,4,5,6]); const h = GF + (floors-1)*FH, bw = 6;
    const kind = dept ? 'dept' : Math.random() < .17 ? 'izakaya' : Math.random() < .55 ? 'glass' : 'shutter';
    const body = new T.Mesh(new T.BoxGeometry(bw, h, d), facMat(kind === 'izakaya' ? woodC : pick(FACC), d, h)); body.position.set(side*(3+bw/2), h/2, zc); scene.add(body);
    const par = new T.Mesh(new T.BoxGeometry(bw, .35, d+.04), new T.MeshStandardMaterial({color:0x56524c, roughness:.9})); par.position.set(side*(3+bw/2), h+.17, zc); scene.add(par);
    if (floors > 1) winPlane(side, zc, d, GF, floors-1);
    // storefront
    if (kind === 'glass' || kind === 'dept') {
      BXs(side, d-.4, .14, .16, frameMat, 2.66, .08, zc);
      BXs(side, .12, 2.66, .16, frameMat, 1.33, .08, zc - d/2 + .26); BXs(side, .12, 2.66, .16, frameMat, 1.33, .08, zc + d/2 - .26);
      const ic = dept ? new T.CanvasTexture(interiorCanvas(dept.col, true)) : new T.CanvasTexture(pick(interiorCs));
      P(side, d-.6, 2.55, new T.MeshStandardMaterial({color:0x111111, emissive:0xffffff, emissiveMap:ic, emissiveIntensity:dept ? 1.15 : .9, roughness:.08, metalness:.7}), 1.33, .05, zc);
      if (!dept && Math.random() < .5) light(0xffd9a6, .9, 6, side*1.8, 1.7, zc);
    } else if (kind === 'shutter') {
      P(side, d-.4, 2.65, new T.MeshStandardMaterial({map:tx(T, pick(shutterCs), (d-.4)/3, 1), roughness:.45, metalness:.6}), 1.33, .03, zc);
      BXs(side, d-.3, .25, .3, frameMat, 2.78, .15, zc);
    } else {
      P(side, 1.7, 2.2, new T.MeshStandardMaterial({color:0x111111, emissive:0xffd29a, emissiveIntensity:.8, roughness:.15, metalness:.5}), 1.1, .04, zc);
      const nm = new T.MeshStandardMaterial({map:new T.CanvasTexture(norenCanvas(pick(['#1f2f5a','#7a1e1e','#20352a']), pick(['居酒屋','焼鳥','酒処']))), transparent:true, alphaTest:.5, side:T.DoubleSide, roughness:.9});
      P(side, 2.0, 1.0, nm, 1.9, .12, zc);
      [-1.25,1.25].forEach(o => { const lm = new T.MeshBasicMaterial({color:0xff4a2e}); lm.color.setScalar(1.4); const s = new T.Mesh(new T.SphereGeometry(.24,16,12), lm); s.scale.set(1,1.4,1); s.position.set(side*(3-.4), 2.35, zc+o); scene.add(s); signs.push({mats:[lm], base:1.4, off:0}); });
      light(0xff6a3a, 1.1, 6, side*2.2, 2.3, zc);
    }
    // awning
    if (kind !== 'dept' && kind !== 'izakaya' && Math.random() < .6) {
      const cols = pick([['#c8312b','#f1ece2'],['#1d5f8a','#f1ece2'],['#2f6b3a','#e9e1cf'],['#d7a12a','#3a2a18']]);
      const am = new T.MeshStandardMaterial({map:tx(T, stripeCanvas(cols[0], cols[1]), 1, (d-.5)/1.2), roughness:.85, side:T.DoubleSide});
      const aw = new T.Mesh(new T.BoxGeometry(1.15, .05, d-.5), am); aw.position.set(side*(3-.56), 2.95, zc); aw.rotation.z = side*.24; scene.add(aw);
      const val = new T.Mesh(new T.BoxGeometry(.03, .26, d-.5), new T.MeshStandardMaterial({color:new T.Color(cols[0]), roughness:.85})); val.position.set(side*(3-1.12), 2.7, zc); scene.add(val);
    }
    // horizontal signboard
    if (kind !== 'dept' && Math.random() < .82) {
      const st = styleFor(); const lit = Math.random() < .55; const t = signTex(T, pick(HT), false, st);
      const sm = lit ? basicLit(t, 1.25) : new T.MeshStandardMaterial({map:t, roughness:.6});
      const mats = [frameMat, frameMat, frameMat, frameMat, frameMat, frameMat]; mats[faceIdx(side)] = sm;
      BXs(side, d-.5, .8, .16, mats, 3.32, .08, zc);
      if (lit) signs.push({mats:[sm], base:1.25, off:0});
      else [-.3,.3].forEach(o => { const lm = basicLit(null, 1.6); lm.color.set(0xfff0c8).multiplyScalar(1.6); const l = new T.Mesh(new T.BoxGeometry(.12,.05,.18), lm); l.position.set(side*(3-.42), 3.8, zc + o*(d-.8)); scene.add(l); });
    }
    // vertical sign
    if (kind !== 'dept' && h > 6.5 && Math.random() < .75) {
      const st = styleFor(), L = Math.min(h - 5, rnd(2.6, 4.2)); const y = 4.4 + L/2, sz = zc + rnd(-d/2+.8, d/2-.8);
      const sm = vSign(side*(3-.8), y, sz, L, pick(VT), st);
      [y + L/2 - .2, y - L/2 + .2].forEach(by => { const br = new T.Mesh(new T.BoxGeometry(.4,.05,.05), frameMat); br.position.set(side*(3-.2), by, sz); scene.add(br); });
      signs.push({mats:[sm], base:1.3, off:0, light: Math.random() < .4 ? light(st.col, 1.4, 8, side*1.9, y, sz + .6) : null});
    }
    // AC units, balconies, pipes
    const balc = !dept && Math.random() < .3;
    for (let f=1; f<floors; f++) {
      const fy = GF + (f-1)*FH;
      if (balc) {
        const sl = new T.Mesh(new T.BoxGeometry(.8,.1,d-.8), concrete); sl.position.set(side*(3-.4), fy+.05, zc); scene.add(sl);
        const rl = new T.Mesh(new T.BoxGeometry(.04,.95,d-.8), new T.MeshStandardMaterial({color:0xb8bec4, roughness:.4, metalness:.3, transparent:true, opacity:.88})); rl.position.set(side*(3-.78), fy+.55, zc); scene.add(rl);
      }
      if (Math.random() < .5) {
        const az = zc + rnd(-d/2+.7, d/2-.7);
        const ac = new T.Mesh(new T.BoxGeometry(.32,.55,.8), new T.MeshStandardMaterial({color:0xcac8c1, roughness:.6})); ac.position.set(side*(3-(balc ? .62 : .17)), fy+.42, az); scene.add(ac);
        const fan = new T.Mesh(new T.CircleGeometry(.19,20), new T.MeshStandardMaterial({color:0x2a2a2e, roughness:.8})); fan.rotation.y = -side*Math.PI/2; fan.position.set(side*(3-(balc ? .79 : .34)), fy+.42, az+.12); scene.add(fan);
      }
    }
    const pipe = new T.Mesh(new T.CylinderGeometry(.045,.045,h,8), new T.MeshStandardMaterial({color:0x8f8a80, roughness:.6, metalness:.4})); pipe.position.set(side*(3-.07), h/2, zTop-.18); scene.add(pipe);
    // rooftop
    if (!dept && Math.random() < .35) {
      const tank = new T.Mesh(new T.CylinderGeometry(.55,.55,1.1,16), new T.MeshStandardMaterial({color:0xb7b2a8, roughness:.7})); tank.position.set(side*(3+3.2), h+1.1, zc); scene.add(tank);
      const leg = new T.Mesh(new T.BoxGeometry(1.0,.5,1.0), frameMat); leg.position.set(side*(3+3.2), h+.4, zc); scene.add(leg);
    } else if (!dept && Math.random() < .3) {
      const st = styleFor(), bwid = Math.min(d-.4, 4.2);
      const mats = [frameMat,frameMat,frameMat,frameMat,frameMat,frameMat]; const sm = basicLit(signTex(T, pick(HT), false, st), 1.15); mats[faceIdx(side)] = sm;
      BXs(side, bwid, 1.2, .12, mats, h + 1.1, .2, zc); signs.push({mats:[sm], base:1.15, off:0});
    }
    // department dressing
    if (dept) {
      const fx = deptFx[dept.key];
      const st = {bg:'#0d0a12', fg:dept.col, glow:true};
      const hm = basicLit(signTex(T, dept.en.toUpperCase() + '  ' + dept.jp, false, st), 1.45);
      const mats = [frameMat,frameMat,frameMat,frameMat,frameMat,frameMat]; mats[faceIdx(side)] = hm;
      BXs(side, d-.4, 1.0, .2, mats, 3.3, .1, zc);
      const vm = vSign(side*(3-.85), 7.0, zc + d/2 - 1.0, 4.4, dept.jp, {bg:dept.col, fg:'#140f18'}, 1.4);
      const dm = new T.MeshBasicMaterial({color:new T.Color(dept.col)}); dm.color.multiplyScalar(1.6);
      [[1.9,.07,2.45],[.07,2.45,1.22]].forEach(([w,hh,y], i) => {
        if (i === 0) BXs(side, w, hh, .06, dm, y, .09, zc);
        else { BXs(side, hh*0+.07, 2.45, .06, dm, 1.22, .09, zc - .95); BXs(side, .07, 2.45, .06, dm, 1.22, .09, zc + .95); }
      });
      const om = basicLit(signTex(T, 'OPEN 営業中', false, {bg:'#0d0a12', fg:'#ff3b2f', glow:true}), 1.4);
      P(side, .9, .23, om, 2.15, .07, zc + d/2 - 1.1);
      fx.mats.push(hm, vm, dm, om); fx.base = [1.45, 1.4, 1.6, 1.4];
      const hb = new T.Mesh(new T.BoxGeometry(1.4, 9, d), new T.MeshBasicMaterial({transparent:true, opacity:0, depthWrite:false}));
      hb.position.set(side*(3-.7), 4.5, zc); hb.userData.dept = dept; scene.add(hb); hits.push(hb);
    }
  };
  const fill = (side, from, to) => { let z = from; while (z - to > .5) { let d = rnd(3.5, 7.5); if (z - d - to < 2.5) d = z - to; building(side, z, d, null); z -= d + .12; } };
  [-1, 1].forEach(side => {
    let cur = 8;
    depts.filter(d => d.side === side).sort((a,b) => b.z - a.z).forEach(d => {
      const top = d.z + 4.6; fill(side, cur, top + .12); building(side, top, 9.2, d); cur = d.z - 4.6 - .12;
    });
    fill(side, cur, -158.1);
  });

  // end of the street: Roji Denki main counter
  const endWall = new T.Mesh(new T.BoxGeometry(6.2, 14, 1), facMat(FACC[3], 6.2, 14)); endWall.position.set(0,7,-158.6); scene.add(endWall);
  const eic = new T.CanvasTexture(interiorCanvas('#ff4f9a', true));
  const eg = new T.Mesh(new T.PlaneGeometry(4.4,2.5), new T.MeshStandardMaterial({color:0x111111, emissive:0xffffff, emissiveMap:eic, emissiveIntensity:1.1, roughness:.08, metalness:.7})); eg.position.set(0,1.3,-158.05); scene.add(eg);
  const esm = basicLit(signTex(T, '路地電気 ROJI DENKI', false, {bg:'#0d0a12', fg:'#ff4f9a', glow:true}), 1.5);
  const es = new T.Mesh(new T.BoxGeometry(5.4,1.25,.16), [frameMat,frameMat,frameMat,frameMat,esm,frameMat]); es.position.set(0,3.35,-157.95); scene.add(es);
  light(0xff4f9a, 3, 16, 0, 3.8, -154); light(0xffd9a0, 1.8, 10, 0, 1.6, -156);
  const endHit = new T.Mesh(new T.BoxGeometry(6, 5, 1), new T.MeshBasicMaterial({transparent:true, opacity:0, depthWrite:false})); endHit.position.set(0,2.5,-157.6); endHit.userData.dept = {key:'all', en:'Roji Denki', jp:'路地電気 · 本店'}; scene.add(endHit); hits.push(endHit);
  deptFx.all = {mats:[esm], lights:[], base:[1.5]};

  // utility poles, lamps, wires
  const poleMat = new T.MeshStandardMaterial({color:0x8d8a83, roughness:.85});
  const stripeT = tx(T, stripeCanvas('#e8c21e','#1a1a1a'), 1, 2);
  const tops = [];
  for (let i=0, z=5; z>-150; z-=13, i++) {
    const side = i%2 ? 1 : -1, x = side*2.72;
    const pole = new T.Mesh(new T.CylinderGeometry(.1,.14,10.5,10), poleMat); pole.position.set(x,5.25,z); scene.add(pole);
    const cover = new T.Mesh(new T.CylinderGeometry(.155,.155,.9,12), new T.MeshStandardMaterial({map:stripeT, roughness:.6})); cover.position.set(x,1.3,z); scene.add(cover);
    [[9.6,1.4],[8.9,1.0]].forEach(([y,w]) => { const a = new T.Mesh(new T.BoxGeometry(w,.09,.09), frameMat); a.position.set(x,y,z); scene.add(a); });
    if (i%3 === 0) { const tr = new T.Mesh(new T.CylinderGeometry(.26,.26,.9,12), new T.MeshStandardMaterial({color:0x9a9d9e, roughness:.5, metalness:.5})); tr.position.set(x + side*.35, 7.4, z); scene.add(tr); }
    const arm = new T.Mesh(new T.BoxGeometry(.9,.05,.05), frameMat); arm.position.set(x - side*.45, 5.6, z); scene.add(arm);
    const lm = new T.MeshBasicMaterial({color:0xfff0d0}); lm.color.multiplyScalar(1.7);
    const head = new T.Mesh(new T.BoxGeometry(.42,.1,.22), [frameMat,frameMat,frameMat,lm,frameMat,frameMat]); head.position.set(x - side*.9, 5.55, z); scene.add(head);
    if (i%2 === 0) light(0xffd7a0, 1.3, 13, x - side*.9, 5.3, z);
    tops.push([new T.Vector3(x-.65,9.65,z), new T.Vector3(x,9.65,z), new T.Vector3(x+.65,9.65,z), new T.Vector3(x-.45,8.95,z), new T.Vector3(x+.45,8.95,z)]);
  }
  const wireMat = new T.LineBasicMaterial({color:0x0b0a0d});
  const cat = (a, b, sag) => { const pts = []; for (let k=0;k<=14;k++){ const t = k/14; const p = a.clone().lerp(b, t); p.y -= Math.sin(t*Math.PI)*sag; pts.push(p); } scene.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), wireMat)); };
  for (let i=0;i<tops.length-1;i++) for (let k=0;k<5;k++) cat(tops[i][k], tops[(i+1)][k], rnd(.3,.7));
  tops.forEach(tp => { for (let k=0;k<3;k++) { const s = Math.random()<.5?-1:1; cat(tp[(Math.random()*5)|0], new T.Vector3(s*3, rnd(5,8.5), tp[0].z + rnd(-4,4)), rnd(.2,.6)); } });

  // street props
  const vendFront = new T.CanvasTexture(vendC);
  [[-1,-4],[1,-27],[-1,-52],[1,-76],[-1,-99],[1,-124]].forEach(([side, z]) => {
    const body = new T.Mesh(new T.BoxGeometry(.8,1.85,.95), new T.MeshStandardMaterial({color:pick([0x1f3f7a,0xb52a26,0xe8e6e0]), roughness:.4, metalness:.3})); body.position.set(side*(3-.45), .93, z); scene.add(body);
    const fm = basicLit(vendFront, 1.2); P(side, .85, 1.6, fm, 1.0, .86, z);
  });
  const coneM = new T.MeshStandardMaterial({color:0xe2562a, roughness:.6});
  [[-1.9,6.5],[-1.6,5.8],[2.0,-31]].forEach(([x,z]) => { const c = new T.Mesh(new T.ConeGeometry(.17,.62,16), coneM); c.position.set(x,.33,z); scene.add(c); const bb = new T.Mesh(new T.BoxGeometry(.36,.04,.36), new T.MeshStandardMaterial({color:0x1a1a1a})); bb.position.set(x,.02,z); scene.add(bb); });
  const potM = new T.MeshStandardMaterial({color:0x6b4a32, roughness:.8}), leafM = new T.MeshStandardMaterial({color:0x2f4a2a, roughness:.9});
  for (let z=-12; z>-150; z-=17) { const s = Math.random()<.5?-1:1; const x = s*2.5; const p = new T.Mesh(new T.CylinderGeometry(.2,.16,.4,12), potM); p.position.set(x,.2,z); scene.add(p); for (let k=0;k<3;k++){ const l = new T.Mesh(new T.SphereGeometry(rnd(.16,.24),10,8), leafM); l.position.set(x+rnd(-.1,.1), .5+k*.12, z+rnd(-.1,.1)); scene.add(l); } }
  // red lanterns string at the alley mouth
  { const pts = []; for (let i=0;i<=12;i++){ const x = -3 + i*.5; pts.push(new T.Vector3(x, 4.9 - .45*(1-(x/3)**2), 6)); } scene.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), wireMat));
    [-2.2,-1.1,0,1.1,2.2].forEach((x,i) => { const lm = new T.MeshBasicMaterial({color: i%2 ? 0xffe2b8 : 0xff4a2e}); lm.color.multiplyScalar(1.35); const s = new T.Mesh(new T.SphereGeometry(.2,14,12), lm); s.scale.set(1,1.35,1); s.position.set(x, 4.9 - .45*(1-(x/3)**2) - .42, 6); scene.add(s); signs.push({mats:[lm], base:1.35, off:0}); }); }

  // cyberpunk holograms
  const holo = new T.Group(); holo.visible = false; scene.add(holo); const holos = [];
  const HTXT = ['電脳','AI 修理','ネオン','SALE 90%','ROJI.NET','未来','DATA 回収','ゲーム','中古電脳','2099'];
  for (let i=0;i<10;i++) {
    const col = pick(['#05d9e8','#ff2a6d','#d1f7ff','#f5e663']);
    const m = new T.Mesh(new T.PlaneGeometry(3.2,1.6), new T.MeshBasicMaterial({map:holoTex(T, HTXT[i], col), transparent:true, opacity:.6, blending:T.AdditiveBlending, depthWrite:false, side:T.DoubleSide}));
    m.position.set(rnd(-1.6,1.6), rnd(6.5,10), -8 - i*14 + rnd(-3,3)); m.rotation.y = rnd(-.5,.5); holo.add(m); holos.push({m, x:m.position.x, y:m.position.y, ph:Math.random()*6});
  }
  for (let i=0;i<7;i++) { const beam = new T.Mesh(new T.CylinderGeometry(.05,.6,34,12,1,true), new T.MeshBasicMaterial({color:pick([0x05d9e8,0xff2a6d]), transparent:true, opacity:.07, blending:T.AdditiveBlending, depthWrite:false, side:T.DoubleSide})); beam.position.set((i%2?1:-1)*rnd(1.4,2.4), 17, -6 - i*21); holo.add(beam); }

  // rain
  const N = 2600, rp = new Float32Array(N*6), rv = new Float32Array(N);
  for (let i=0;i<N;i++) { const x = rnd(-3,3), y = rnd(0,14), z = rnd(-40,6); rp.set([x,y,z, x+.012,y-.36,z], i*6); rv[i] = rnd(14,22); }
  const rg = new T.BufferGeometry(); rg.setAttribute('position', new T.BufferAttribute(rp,3));
  const rain = new T.LineSegments(rg, new T.LineBasicMaterial({color:0xb5c2e2, transparent:true, opacity:.28})); rain.frustumCulled = false; scene.add(rain);

  // interaction
  const ray = new T.Raycaster(), ndc = new T.Vector2(); let hover = null, down = null, mx = 0, my = 0;
  const cv = B.r.domElement;
  const onM = e => { mx = (e.clientX/innerWidth)*2 - 1; my = (e.clientY/innerHeight)*2 - 1; };
  window.addEventListener('mousemove', onM);
  const hitAt = e => { const b = cv.getBoundingClientRect(); ndc.set(((e.clientX-b.left)/b.width)*2-1, -((e.clientY-b.top)/b.height)*2+1); ray.setFromCamera(ndc, cam); const h = ray.intersectObjects(hits, false)[0]; return h && h.distance < 45 ? h.object.userData.dept : null; };
  const pm = e => { const d = hitAt(e); if (d !== hover) { hover = d; cv.style.cursor = d ? 'pointer' : ''; } const b = cv.getBoundingClientRect(); ctx.onHover && ctx.onHover(d ? {key:d.key, en:d.en, jp:d.jp} : null, e.clientX-b.left, e.clientY-b.top); };
  const pd = e => { down = {x:e.clientX, y:e.clientY}; };
  const pu = e => { if (down && Math.abs(e.clientX-down.x) + Math.abs(e.clientY-down.y) < 8) { const d = hitAt(e); if (d) ctx.onEnter && ctx.onEnter(d.key); } down = null; };
  const pl = () => { hover = null; ctx.onHover && ctx.onHover(null,0,0); };
  cv.addEventListener('pointermove', pm); cv.addEventListener('pointerdown', pd); cv.addEventListener('pointerup', pu); cv.addEventListener('pointerleave', pl);

  let theme = null, t = 0, walk = ctx.progress() || 0;
  const applyTheme = k => { const th = THEMES[k] || THEMES.akihabara; scene.background = skies[k] || skies.akihabara; scene.fog.color.setHex(th.fog); scene.fog.density = th.fogD; rg.setDrawRange(0, th.rain*2); rain.material.opacity = th.rainOp; holo.visible = th.holo; theme = k; };
  B.start(dt => {
    const o = ctx.opts(); if (!o.active) return;
    if (o.theme !== theme) applyTheme(o.theme);
    t += dt; timeU.value = t;
    walk += (ctx.progress() - walk) * Math.min(1, dt*3.5);
    ctx.onWalk && ctx.onWalk(walk);
    if (!ctx.visible()) return;
    const z = 10 - walk*148;
    cam.position.z = z; cam.position.x += (mx*.6 - cam.position.x)*.04;
    cam.position.y = 1.62 + Math.sin(walk*160)*.025 - my*.12;
    cam.lookAt(cam.position.x*.3 + mx*.5, 2.3 - my*.45, z - 10);
    const fl = o.flicker;
    for (const s of signs) {
      let v = 1;
      if (s.off > 0) { s.off -= dt; v = .12 + Math.random()*.25; }
      else if (fl > 0 && Math.random() < fl*dt*.5) s.off = .05 + Math.random()*.4*fl;
      s.mats.forEach(m => m.color.setScalar(s.base*v));
      if (s.light) s.light.intensity = 1.4*v;
    }
    Object.keys(deptFx).forEach(k => {
      const f = deptFx[k], on = hover && hover.key === k, pulse = on ? 1.35 + Math.sin(t*8)*.1 : 1;
      f.mats.forEach((m,i) => { if (m === f.mats[2] && k !== 'all') { m.color.set(depts.find(d => d.key === k).col).multiplyScalar(f.base[i]*pulse); } else m.color.setScalar(f.base[i]*pulse); });
      f.lights.forEach(l => l.intensity = on ? 3.6 : 2.2);
    });
    if (holo.visible) holos.forEach(h => { const gl = Math.random() < .03; h.m.position.y = h.y + Math.sin(t*.8 + h.ph)*.2; h.m.position.x = h.x + (gl ? rnd(-.25,.25) : 0); h.m.material.opacity = gl ? .15 : .55 + Math.sin(t*3 + h.ph)*.1; });
    rain.visible = o.rain;
    if (rain.visible) {
      rain.position.z = z - 4; const n = (THEMES[theme] || THEMES.akihabara).rain, sp = theme === 'cyberpunk' ? 1.25 : 1;
      for (let i=0;i<n;i++) { const k = i*6; let y = rp[k+1] - rv[i]*dt*sp; if (y < 0) { y = 14; const x = rnd(-3,3); rp[k] = x; rp[k+3] = x + .012; } rp[k+1] = y; rp[k+4] = y - .36; }
      rg.attributes.position.needsUpdate = true;
    }
    mirror.update(scene, cam, [road, rain]);
    B.render(scene, cam, t, (THEMES[theme] || THEMES.akihabara).bloom);
  });
  return { destroy(){ window.removeEventListener('mousemove', onM); cv.removeEventListener('pointermove', pm); cv.removeEventListener('pointerdown', pd); cv.removeEventListener('pointerup', pu); cv.removeEventListener('pointerleave', pl); B.destroy(); } };
};

/* ================= 2. shop interior ================= */
R.interior = function(el, ctx){
  const T = THREE; const B = base(T, el, {fov:54, far:60, post:true, mirror:true}); const {cam, mirror} = B;
  const dept = ctx.dept, col = new T.Color(dept.col);
  const scene = new T.Scene(); scene.background = new T.Color(0x0b0a0e); scene.fog = new T.Fog(0x0b0a0e, 9, 24);
  cam.position.set(0, 1.6, 2.5);
  const hemi = new T.HemisphereLight(0xeef2ff, 0x2a2420, .6); scene.add(hemi);
  const timeU = {value:0};
  const RW = 4.5, BACK = -4.6, FRONT = 3.6, HT = 3.1;
  const floor = new T.Mesh(new T.PlaneGeometry(RW*2, FRONT-BACK), mirrorMat(T, mirror, {map:tx(T, checkerCanvas(), RW, (FRONT-BACK)/2), roughness:.45, fixed:.32, strength:.55, timeU}));
  floor.rotation.x = -Math.PI/2; floor.position.set(0,0,(FRONT+BACK)/2); scene.add(floor);
  const wallM = new T.MeshStandardMaterial({map:tx(T, plasterCanvas(dept.col), 3, 1), roughness:.92});
  const back = new T.Mesh(new T.PlaneGeometry(RW*2, HT), wallM); back.position.set(0,HT/2,BACK); scene.add(back);
  [-1,1].forEach(s => { const w = new T.Mesh(new T.PlaneGeometry(FRONT-BACK, HT), wallM); w.rotation.y = -s*Math.PI/2; w.position.set(s*RW, HT/2, (FRONT+BACK)/2); scene.add(w); });
  const ceil = new T.Mesh(new T.PlaneGeometry(RW*2, FRONT-BACK), new T.MeshStandardMaterial({map:tx(T, ceilingCanvas(), RW*2/1.2, (FRONT-BACK)/1.2), roughness:.95})); ceil.rotation.x = Math.PI/2; ceil.position.set(0,HT,(FRONT+BACK)/2); scene.add(ceil);
  const tubes = [];
  [-3.4,-1.2,1.0].forEach(z => [-2.1,2.1].forEach(x => {
    const hs = new T.Mesh(new T.BoxGeometry(.32,.06,1.45), new T.MeshStandardMaterial({color:0xdedede, roughness:.5})); hs.position.set(x,HT-.04,z); scene.add(hs);
    const tm = new T.MeshBasicMaterial({color:0xf4f8ff}); tm.color.multiplyScalar(1.8); const tb = new T.Mesh(new T.BoxGeometry(.12,.04,1.32), tm); tb.position.set(x,HT-.09,z); scene.add(tb); tubes.push(tm);
  }));
  [[-2.1,-3.2],[2.1,-3.2],[-2.1,.4],[2.1,.4]].forEach(([x,z]) => { const l = new T.PointLight(0xf2f6ff, .85, 9, 2); l.position.set(x,2.85,z); scene.add(l); });
  const accent = new T.PointLight(col, 1.6, 7, 2); accent.position.set(0,2.6,BACK+.6); scene.add(accent);

  const metalD = new T.MeshStandardMaterial({color:0x3a3d42, roughness:.45, metalness:.7});
  const metalL = new T.MeshStandardMaterial({color:0xb8bcc2, roughness:.4, metalness:.6});
  const pegM = new T.MeshStandardMaterial({map:tx(T, pegCanvas(), 4, 2.3), roughness:.85});
  const LV = [.1,.62,1.14,1.66];
  const unit = (cx, cz, w, ry) => {
    const g = new T.Group(); g.position.set(cx,0,cz); g.rotation.y = ry; scene.add(g); const dp = .55, Hh = 2.3;
    [-w/2, w/2].forEach(x => [-dp/2+.02, dp/2-.02].forEach(z => { const u = new T.Mesh(new T.BoxGeometry(.05,Hh,.05), metalD); u.position.set(x,Hh/2,z); g.add(u); }));
    const pb = new T.Mesh(new T.PlaneGeometry(w,Hh), pegM); pb.position.set(0,Hh/2,-dp/2); g.add(pb);
    LV.concat([2.2]).forEach(y => { const b = new T.Mesh(new T.BoxGeometry(w,.03,dp), metalL); b.position.set(0,y,0); g.add(b); const lip = new T.Mesh(new T.BoxGeometry(w,.06,.02), metalD); lip.position.set(0,y-.01,dp/2); g.add(lip); });
    return g;
  };
  const uA = unit(-2.05, BACK+.35, 3.8, 0), uB = unit(2.05, BACK+.35, 3.8, 0), uL = unit(-RW+.32, -1.1, 4.4, Math.PI/2);
  const cardM = new T.MeshStandardMaterial({map:new T.CanvasTexture(cardCanvas()), roughness:.9});
  const vhsM = new T.MeshStandardMaterial({color:0x111114, roughness:.5});
  const tapeCols = [0xd23a2a,0x2d6fb3,0xe2b33c,0xf1ece2,0x3c9a5f,0x1a1a1a];
  const item = () => {
    const g = new T.Group(); const k = Math.random(); let w;
    const bx = (a,b,c,m,x,y,z,ry) => { const mm = new T.Mesh(new T.BoxGeometry(a,b,c), m); mm.position.set(x,y,z); mm.rotation.y = ry||0; g.add(mm); };
    if (k < .3) { w = rnd(.26,.42); const h = rnd(.16,.32), d = rnd(.24,.38); bx(w,h,d,cardM,0,h/2,0); if (Math.random()<.45) bx(w*.85,h*.75,d*.85,cardM,0,h+h*.375,0,rnd(-.2,.2)); }
    else if (k < .5) { w = .14; const n = 3 + (Math.random()*7|0); for (let i=0;i<n;i++) bx(.12,.024,.08, new T.MeshStandardMaterial({color:pick(tapeCols), roughness:.4}), 0,.012+i*.025,0,rnd(-.15,.15)); }
    else if (k < .68) { const n = 4 + (Math.random()*5|0); w = n*.031; for (let i=0;i<n;i++) bx(.026,.19,.105, vhsM, -w/2+.015+i*.031,.095,0); }
    else if (k < .84) { w = .36; bx(.34,.16,.4, new T.MeshStandardMaterial({color:0x2f62b8, roughness:.5}),0,.08,0); for (let i=0;i<4;i++) bx(.06,.06,.06, new T.MeshStandardMaterial({color:pick(tapeCols)}), rnd(-.1,.1),.17,rnd(-.12,.12),rnd(0,3)); }
    else { w = .22; for (let i=0;i<2;i++) { const t = new T.Mesh(new T.TorusGeometry(.08,.014,8,24), new T.MeshStandardMaterial({color:0x1a1a1c, roughness:.6})); t.rotation.x = Math.PI/2; t.position.set(i*.03,.015+i*.03,0); g.add(t); } }
    return {g, w};
  };
  const fillLevel = (u, y, w, excl) => {
    let x = -w/2 + .08;
    while (x < w/2 - .12) { const it = item(); if (x + it.w > w/2 - .06) break; const cx = x + it.w/2; if (excl && excl.some(e => Math.abs(e - cx) < .5)) { x += .1; continue; } if (Math.random() < .12) { x += .15; continue; } it.g.position.set(cx, y+.015, rnd(-.08,.04)); u.add(it.g); x += it.w + rnd(.03,.08); }
  };
  [[uA,[.05,1.35]],[uB,[-1.35,-.05]]].forEach(([u,ex]) => { fillLevel(u, LV[0], 3.8); fillLevel(u, LV[1], 3.8); fillLevel(u, LV[3], 3.8); fillLevel(u, LV[2], 3.8, ex); });
  LV.forEach(y => fillLevel(uL, y, 4.4));

  // products on the eye-level shelf
  const prods = ctx.products.slice(0,4); const pick3 = [];
  const slots = [[uA,.05],[uA,1.35],[uB,-1.35],[uB,-.05]];
  prods.forEach((p, i) => {
    const [u, lx] = slots[i];
    const m = normalize(T, buildModel(T, p.model), .68); m.rotation.y = (i < 2 ? .35 : -.35) + rnd(-.1,.1);
    const holder = new T.Group(); holder.position.set(lx, LV[2]+.016, -.02); holder.add(m); u.add(holder);
    const tag = new T.Mesh(new T.PlaneGeometry(.34,.14), new T.MeshBasicMaterial({map:new T.CanvasTexture(tagCanvas(p.priceFmt, p.name))})); tag.position.set(lx, LV[2]-.045, .29); u.add(tag);
    const pop = new T.Mesh(new T.PlaneGeometry(.2,.28), new T.MeshStandardMaterial({map:new T.CanvasTexture(popCanvas(dept.col, p.grade)), roughness:.7})); pop.position.set(lx + (lx < 0 ? -.43 : .43), LV[2]+.16, .18); pop.rotation.y = lx < 0 ? .3 : -.3; u.add(pop);
    const spot = new T.PointLight(0xfff2dc, .55, 2.2, 2); spot.position.set(lx, LV[3]-.12, .1); u.add(spot);
    const hb = new T.Mesh(new T.BoxGeometry(.78,.62,.5), new T.MeshBasicMaterial({transparent:true, opacity:0, depthWrite:false})); hb.position.set(lx, LV[2]+.33, 0); hb.userData.prod = p; u.add(hb);
    pick3.push({p, hb, holder, model:m, spot, ry:m.rotation.y, lift:0});
  });
  // counter + CRT + neon + posters
  const counter = new T.Mesh(new T.BoxGeometry(.9,.96,3.2), new T.MeshStandardMaterial({color:0x7a5a3c, roughness:.6})); counter.position.set(RW-.6,.48,-.6); scene.add(counter);
  const ctop = new T.Mesh(new T.BoxGeometry(1.0,.05,3.3), new T.MeshStandardMaterial({color:0xd8d2c4, roughness:.35})); ctop.position.set(RW-.6,.985,-.6); scene.add(ctop);
  const reg = new T.Mesh(new T.BoxGeometry(.45,.26,.42), new T.MeshStandardMaterial({color:0x26252a, roughness:.5})); reg.position.set(RW-.6,1.14,-1.5); scene.add(reg);
  const ns = noiseScreen(T);
  const tv = new T.Mesh(new T.BoxGeometry(.5,.42,.46), new T.MeshStandardMaterial({color:0xd9d2c3, roughness:.5})); tv.position.set(RW-.6,1.22,-.1); scene.add(tv);
  const scr = new T.Mesh(new T.PlaneGeometry(.36,.28), new T.MeshBasicMaterial({map:ns.t})); scr.rotation.y = -Math.PI/2; scr.position.set(RW-.6-.236,1.24,-.1); scene.add(scr);
  const peg2 = new T.Mesh(new T.PlaneGeometry(3.2,1.6), pegM); peg2.rotation.y = -Math.PI/2; peg2.position.set(RW-.01,1.9,-.6); scene.add(peg2);
  for (let i=0;i<5;i++) { const c = new T.Mesh(new T.TorusGeometry(.12,.016,8,24), new T.MeshStandardMaterial({color:pick([0x1a1a1c,0xd23a2a,0x2d6fb3,0xe9e4da]), roughness:.6})); c.rotation.y = Math.PI/2; c.position.set(RW-.05, 2.15 - (i%2)*.15, -1.8 + i*.55); scene.add(c); }
  const neonM = new T.MeshBasicMaterial({map:signTex(T, dept.en.toUpperCase() + '  ' + dept.jp, false, {bg:'#0d0a12', fg:dept.col, glow:true})}); neonM.color.setScalar(1.45);
  const neon = new T.Mesh(new T.PlaneGeometry(3.6,.72), neonM); neon.position.set(0,2.66,BACK+.02); scene.add(neon);
  const posters = [[dept.jp.slice(0,2), 'SALE 中古', dept.col],['修理', 'REPAIRS', '#2d6fb3'],['買取', 'WE BUY', '#d0281e']];
  [[-RW+.01, 2.55, 1.6, Math.PI/2],[-RW+.01, 2.55, 2.6, Math.PI/2],[RW-.01, 2.6, 1.9, -Math.PI/2]].forEach((pp,i) => { const m = new T.Mesh(new T.PlaneGeometry(.6,.84), new T.MeshStandardMaterial({map:new T.CanvasTexture(posterCanvas(...posters[i])), roughness:.8})); m.position.set(pp[0],pp[1],pp[2]); m.rotation.y = pp[3]; scene.add(m); });
  const DN = 220, dpz = new Float32Array(DN*3); for (let i=0;i<DN;i++) dpz.set([rnd(-4,4), rnd(.3,3), rnd(-4.4,2)], i*3);
  const dg = new T.BufferGeometry(); dg.setAttribute('position', new T.BufferAttribute(dpz,3)); scene.add(new T.Points(dg, new T.PointsMaterial({color:0xfff2dc, size:.012, transparent:true, opacity:.5})));

  const ray = new T.Raycaster(), ndc = new T.Vector2(); let hover = null, down = null, mx = 0, my = 0;
  const cv = B.r.domElement; const hbs = pick3.map(x => x.hb);
  const rel = e => { const b = cv.getBoundingClientRect(); return [e.clientX-b.left, e.clientY-b.top, b]; };
  const hitAt = e => { const [x,y,b] = rel(e); ndc.set((x/b.width)*2-1, -(y/b.height)*2+1); ray.setFromCamera(ndc, cam); const h = ray.intersectObjects(hbs, false)[0]; return h ? h.object.userData.prod : null; };
  const pm = e => { const [x,y,b] = rel(e); mx = (x/b.width)*2-1; my = (y/b.height)*2-1; const p = hitAt(e); if (p !== hover) { hover = p; cv.style.cursor = p ? 'pointer' : ''; } ctx.onHover && ctx.onHover(p ? {id:p.id, name:p.name, priceFmt:p.priceFmt} : null, x, y); };
  const pd = e => { down = {x:e.clientX, y:e.clientY}; };
  const pu = e => { if (down && Math.abs(e.clientX-down.x) + Math.abs(e.clientY-down.y) < 8) { const p = hitAt(e); if (p) ctx.onPick && ctx.onPick(p.id); } down = null; };
  const pl = () => { hover = null; mx = my = 0; ctx.onHover && ctx.onHover(null,0,0); };
  cv.addEventListener('pointermove', pm); cv.addEventListener('pointerdown', pd); cv.addEventListener('pointerup', pu); cv.addEventListener('pointerleave', pl);

  const look = new T.Vector3(0,1.25,BACK), tgt = new T.Vector3(), wp = new T.Vector3();
  let t = 0, theme = null;
  B.start(dt => {
    const o = ctx.opts(); t += dt; timeU.value = t;
    if (o.theme !== theme) { theme = o.theme; const cy = theme === 'cyberpunk'; scene.background.setHex(cy ? 0x050a10 : 0x0b0a0e); scene.fog.color.setHex(cy ? 0x050a10 : 0x0b0a0e); tubes.forEach(m => m.color.set(cy ? 0xbff8ff : 0xf4f8ff).multiplyScalar(1.8)); hemi.color.set(cy ? 0x9fe8ff : 0xeef2ff); }
    tgt.set(mx*1.4, 1.25 - my*.35, BACK);
    if (hover) { const h = pick3.find(x => x.p === hover); h.hb.getWorldPosition(wp); tgt.lerp(wp, .45); }
    look.lerp(tgt, Math.min(1, dt*3));
    cam.position.x += (mx*.35 - cam.position.x)*.05; cam.position.y = 1.6 + Math.sin(t*.6)*.015;
    cam.lookAt(look);
    pick3.forEach(x => { const on = x.p === hover; x.lift += ((on ? .06 : 0) - x.lift)*Math.min(1, dt*8); x.holder.position.y = LV[2]+.016 + x.lift; x.model.rotation.y = on ? x.model.rotation.y + dt*1.2 : x.model.rotation.y + (x.ry - x.model.rotation.y)*.05; x.spot.intensity = on ? 1.6 : .55; x.model.userData.tick && x.model.userData.tick(); });
    ns.tick();
    const fl = o.flicker || 0; if (Math.random() < fl*.02) tubes[(Math.random()*tubes.length)|0].color.setScalar(.4); else if (Math.random() < .2) tubes.forEach(m => { if (m.color.r < 1) m.color.set(theme === 'cyberpunk' ? 0xbff8ff : 0xf4f8ff).multiplyScalar(1.8); });
    mirror.update(scene, cam, [floor]);
    B.render(scene, cam, t, (THEMES[theme] || THEMES.akihabara).bloom*.8);
  });
  return { destroy(){ cv.removeEventListener('pointermove', pm); cv.removeEventListener('pointerdown', pd); cv.removeEventListener('pointerup', pu); cv.removeEventListener('pointerleave', pl); B.destroy(); } };
};

/* ================= 3. product turntable ================= */
R.turntable = function(el, ctx){
  const T = THREE; const B = base(T, el, {fov:36, far:120}); const {r, cam} = B;
  r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene(); scene.background = new T.Color(0x0d0a16); scene.fog = new T.FogExp2(0x0d0a16, .07);
  cam.position.set(0, 2.4, 6.2);
  scene.add(new T.AmbientLight(0x6a5a8a, .4));
  const spot = new T.SpotLight(0xfff2dc, 2.6, 22, .42, .55, 1.1); spot.position.set(0,7.5,1.2); spot.target.position.set(0,.6,0); spot.castShadow = true; spot.shadow.mapSize.set(1024,1024); scene.add(spot, spot.target);
  const rimA = new T.PointLight(0xff4f9a,1.6,12,2); rimA.position.set(-3.5,2.4,-2.4); const rimB = new T.PointLight(0x2fd3e0,1.6,12,2); rimB.position.set(3.5,2,-2.4); scene.add(rimA, rimB);
  const floor = new T.Mesh(new T.PlaneGeometry(60,60), new T.MeshStandardMaterial({color:0x0d0b10, roughness:.55, metalness:.3})); floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; scene.add(floor);
  const plat = new T.Mesh(new T.CylinderGeometry(1.7,1.8,.22,64), new T.MeshStandardMaterial({color:0x1c1a22, roughness:.35, metalness:.6})); plat.position.y = .11; plat.receiveShadow = true; scene.add(plat);
  const ring = new T.Mesh(new T.TorusGeometry(1.76,.025,8,96), new T.MeshBasicMaterial({color:0xff4f9a})); ring.rotation.x = Math.PI/2; ring.position.y = .2; scene.add(ring);
  const cone = new T.Mesh(new T.ConeGeometry(2.1,7.2,48,1,true), new T.MeshBasicMaterial({color:0xfff2dc, transparent:true, opacity:.05, blending:T.AdditiveBlending, depthWrite:false, side:T.DoubleSide})); cone.position.y = 3.9; scene.add(cone);
  const scan = new T.Group(); scan.visible = false; scene.add(scan);
  scan.add(new T.Mesh(new T.CircleGeometry(1.9,64), new T.MeshBasicMaterial({color:0x05d9e8, transparent:true, opacity:.1, blending:T.AdditiveBlending, depthWrite:false, side:T.DoubleSide})));
  scan.add(new T.Mesh(new T.TorusGeometry(1.9,.015,6,96), new T.MeshBasicMaterial({color:0x05d9e8}))); scan.children.forEach(c => c.rotation.x = Math.PI/2);
  const holder = new T.Group(); holder.position.y = .22; scene.add(holder);
  let model = null;
  const setModel = key => {
    if (model) holder.remove(model);
    model = normalize(T, buildModel(T, key), 2.1); model.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); holder.add(model);
    if (gsap) gsap.fromTo(holder.scale, {x:.6,y:.6,z:.6}, {x:1,y:1,z:1, duration:.7, ease:'back.out(2)'});
  };
  let dragging = false, lx = 0, vel = 0; const cv = r.domElement;
  const pd = e => { dragging = true; lx = e.clientX; el.style.cursor = 'grabbing'; };
  const pm = e => { if (!dragging) return; const dx = e.clientX - lx; lx = e.clientX; holder.rotation.y += dx*.01; vel = dx*.0012; };
  const pu = () => { dragging = false; el.style.cursor = 'grab'; };
  cv.addEventListener('pointerdown', pd); window.addEventListener('pointermove', pm); window.addEventListener('pointerup', pu);
  let theme = null, t = 0;
  B.start(dt => {
    const o = ctx.opts(); t += dt;
    if (o.theme !== theme) { theme = o.theme; const th = THEMES[theme] || THEMES.akihabara; scene.background.setHex(th.bg); scene.fog.color.setHex(th.bg); rimA.color.setHex(th.rim[0]); rimB.color.setHex(th.rim[1]); ring.material.color.setHex(th.rim[0]); scan.visible = th.holo; }
    if (!dragging) { holder.rotation.y += dt*.45 + vel; vel *= .94; }
    if (model && model.userData.tick) model.userData.tick();
    if (scan.visible) { const k = (t*.45) % 1; scan.position.y = .25 + k*2.5; scan.children[0].material.opacity = .12*(1-k); }
    cam.position.y = 2.4 + Math.sin(t*.5)*.05; cam.lookAt(0,1.05,0);
    B.render(scene, cam, t, 0);
  });
  return { setModel, destroy(){ cv.removeEventListener('pointerdown', pd); window.removeEventListener('pointermove', pm); window.removeEventListener('pointerup', pu); B.destroy(); } };
};

/* ================= 4. thumbnails ================= */
R.thumbnails = function(list, w, h){
  const T = THREE; w = w || 480; h = h || 360;
  const r = new T.WebGLRenderer({antialias:true, preserveDrawingBuffer:true}); r.setPixelRatio(1); r.setSize(w,h); r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene(); scene.background = new T.Color(0x15121a);
  const bc = cnv(256,256), bg = bc.getContext('2d'); const gr = bg.createRadialGradient(128,110,10,128,128,180); gr.addColorStop(0,'#3a2f48'); gr.addColorStop(1,'#100d14'); bg.fillStyle = gr; bg.fillRect(0,0,256,256);
  const wall = new T.Mesh(new T.PlaneGeometry(14,9), new T.MeshBasicMaterial({map:new T.CanvasTexture(bc)})); wall.position.set(0,3,-3); scene.add(wall);
  const fl = new T.Mesh(new T.PlaneGeometry(20,20), new T.MeshStandardMaterial({color:0x1d1922, roughness:.55, metalness:.2})); fl.rotation.x = -Math.PI/2; fl.receiveShadow = true; scene.add(fl);
  scene.add(new T.AmbientLight(0x8070a0, .45));
  const sp = new T.SpotLight(0xfff2dc, 2.4, 25, .5, .6, 1); sp.position.set(2,6,4.5); sp.target.position.set(0,.8,0); sp.castShadow = true; sp.shadow.mapSize.set(1024,1024); scene.add(sp, sp.target);
  const ra = new T.PointLight(0xff4f9a, 1.3, 12, 2); ra.position.set(-3,2.5,-1.6); const rb = new T.PointLight(0x2fd3e0, 1.3, 12, 2); rb.position.set(3,2,-1.6); scene.add(ra, rb);
  const cam = new T.PerspectiveCamera(30, w/h, .1, 50); cam.position.set(2.4,2.1,5.6); cam.lookAt(0,.9,0);
  const out = {}; let cur = null;
  list.forEach(it => {
    if (cur) scene.remove(cur);
    cur = normalize(T, buildModel(T, it.model), 2.0); cur.rotation.y = -.25; cur.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    if (cur.userData.tick) cur.userData.tick();
    scene.add(cur); r.render(scene, cam);
    const du = r.domElement.toDataURL('image/jpeg', .88), bin = atob(du.split(',')[1]), arr = new Uint8Array(bin.length);
    for (let i=0;i<bin.length;i++) arr[i] = bin.charCodeAt(i);
    out[it.id] = URL.createObjectURL(new Blob([arr], {type:'image/jpeg'}));
  });
  r.dispose(); r.forceContextLoss && r.forceContextLoss();
  return out;
};

export default R;
