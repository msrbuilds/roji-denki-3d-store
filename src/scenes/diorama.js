import * as THREE from 'three';
import { gsap } from 'gsap';
const R = {};
const rnd = (a,b) => a + Math.random()*(b-a);
const pick = a => a[(Math.random()*a.length)|0];
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const cnv = (w,h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const NEON = ['#ff4f9a','#2fd3e0','#f0a030','#ff3b2f','#7cff6b','#b06bff','#fff1c9'];
const THEMES = {
  akihabara: {bg:0x0d0a16, fog:0x150f22, fogD:.034, rain:1100, rainOp:.32, holo:false, rim:[0xff4f9a,0x2fd3e0]},
  cyberpunk: {bg:0x050a10, fog:0x08171d, fogD:.042, rain:2600, rainOp:.55, holo:true, rim:[0xff2a6d,0x05d9e8]}
};
R.THEMES = THEMES;

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
    chars.forEach((ch,i) => {
      const y = top + i*size;
      if (ch === 'ー') { g.save(); g.translate(w/2, y); g.rotate(Math.PI/2); g.fillText(ch,0,0); g.restore(); }
      else g.fillText(ch, w/2, y);
    });
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
  for (let y = 0; y < 256; y += 4) g.fillRect(0, y, 512, 1.6);
  return new T.CanvasTexture(c);
}
function labelTex(T, en, jp, col, lit){
  const c = cnv(512,170), g = c.getContext('2d');
  g.fillStyle = lit ? 'rgba(12,10,15,.94)' : 'rgba(12,10,15,.78)';
  g.beginPath(); g.roundRect ? g.roundRect(6,6,500,158,18) : g.rect(6,6,500,158); g.fill();
  g.lineWidth = lit ? 6 : 3; g.strokeStyle = col; g.stroke();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  if (lit) { g.shadowColor = col; g.shadowBlur = 18; }
  g.fillStyle = lit ? col : '#f1ece2';
  let size = 58; g.font = size + 'px "Dela Gothic One"';
  while (g.measureText(en).width > 460 && size > 24) { size -= 4; g.font = size + 'px "Dela Gothic One"'; }
  g.fillText(en, 256, 62);
  g.shadowBlur = 0; g.fillStyle = '#a59f97'; g.font = '36px "DotGothic16"'; g.fillText(jp, 256, 124);
  const t = new T.CanvasTexture(c); t.anisotropy = 4; return t;
}
function windowCanvases(){
  return [0,1,2].map(() => {
    const c = cnv(128,128), g = c.getContext('2d');
    g.fillStyle = '#100e14'; g.fillRect(0,0,128,128);
    for (let y=0;y<4;y++) for (let x=0;x<4;x++) {
      const lit = Math.random() < .32;
      g.fillStyle = lit ? pick(['#ffcf85','#ffe6b0','#9fe2ff','#ff9cc4','#ffcf85']) : '#060508';
      g.fillRect(x*32+6, y*32+8, 20, 15);
      if (lit && Math.random() < .5) { g.fillStyle = 'rgba(0,0,0,.35)'; for (let k=0;k<3;k++) g.fillRect(x*32+6, y*32+10+k*5, 20, 1.5); }
    }
    return c;
  });
}
function base(T, el, opt){
  const r = new T.WebGLRenderer({antialias:true});
  r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  r.setSize(el.clientWidth || 1, el.clientHeight || 1);
  r.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y';
  el.appendChild(r.domElement);
  const cam = new T.PerspectiveCamera(opt.fov || 60, (el.clientWidth||1)/(el.clientHeight||1), .1, opt.far || 300);
  const ro = new ResizeObserver(() => { const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; r.setSize(w,h); cam.aspect = w/h; cam.updateProjectionMatrix(); });
  ro.observe(el);
  let raf = 0; const clock = new T.Clock();
  return {
    r, cam,
    start(fn){ const loop = () => { raf = requestAnimationFrame(loop); const dt = Math.min(clock.getDelta(), .05); if (!el.clientWidth) return; fn(dt); }; loop(); },
    destroy(){ cancelAnimationFrame(raf); ro.disconnect(); r.dispose(); r.forceContextLoss && r.forceContextLoss(); r.domElement.remove(); }
  };
}

/* ---------- 1. Street alley (hero) ---------- */
R.alley = function(el, ctx){
  const T = THREE; const B = base(T, el, {fov:62, far:260}); const {r, cam} = B;
  const scene = new T.Scene(); scene.background = new T.Color(0x0d0a16); scene.fog = new T.FogExp2(0x150f22, .034);
  cam.position.set(0, 1.7, 10);
  scene.add(new T.AmbientLight(0x5a4a7a, .5));
  const moon = new T.DirectionalLight(0x6070c0, .25); moon.position.set(2,20,5); scene.add(moon);
  const winC = windowCanvases();
  const styleFor = () => {
    const col = pick(NEON); const k = Math.random();
    if (k < .4) return {bg:col, fg:'#140f18', col};
    if (k < .8) return {bg:'#0d0a12', fg:col, glow:true, col};
    return {bg:'#f3ead6', fg:'#d0281e', col:'#ffd9b0'};
  };
  const gc = cnv(64,256), gg = gc.getContext('2d');
  const lg = gg.createLinearGradient(0,0,0,256);
  lg.addColorStop(0,'rgba(255,255,255,0)'); lg.addColorStop(.5,'rgba(255,255,255,1)'); lg.addColorStop(1,'rgba(255,255,255,0)');
  gg.fillStyle = lg; gg.fillRect(0,0,64,256); gg.globalCompositeOperation = 'destination-in';
  const hg = gg.createLinearGradient(0,0,64,0);
  hg.addColorStop(0,'rgba(0,0,0,0)'); hg.addColorStop(.5,'rgba(0,0,0,1)'); hg.addColorStop(1,'rgba(0,0,0,0)');
  gg.fillStyle = hg; gg.fillRect(0,0,64,256);
  const reflTex = new T.CanvasTexture(gc);

  const ground = new T.Mesh(new T.PlaneGeometry(14,240), new T.MeshStandardMaterial({color:0x121017, roughness:.32, metalness:.45}));
  ground.rotation.x = -Math.PI/2; ground.position.z = -100; scene.add(ground);

  const signs = [], lights = [];
  const VT = ['電気','カラオケ','ラーメン','薬','酒場','喫茶','質屋','ゲーム','中古','修理','焼鳥','電話','麻雀','占い'];
  const HT = ['ARCADE','KISSA 喫茶','24H','RAMEN 拉麺','KARAOKE','HOTEL','BAR 酒','PACHI','DENKI 電気','RADIO'];
  const addSign = (mesh, col, x, z, reflect) => {
    scene.add(mesh); let refl = null, light = null;
    if (reflect) {
      refl = new T.Mesh(new T.PlaneGeometry(1.1,6), new T.MeshBasicMaterial({color:new T.Color(col), map:reflTex, transparent:true, opacity:.32, blending:T.AdditiveBlending, depthWrite:false}));
      refl.rotation.x = -Math.PI/2; refl.position.set(x, .02, z + 1.4); scene.add(refl);
    }
    if (signs.length % 3 === 0 && lights.length < 12) {
      light = new T.PointLight(new T.Color(col), 1.7, 10, 2); light.position.set(x*.7, mesh.position.y, z + .5); scene.add(light); lights.push(light);
    }
    signs.push({mat:mesh.material, refl, light, off:0});
  };
  for (const side of [-1,1]) {
    let z = 8;
    while (z > -152) {
      const d = rnd(3,7.5), h = rnd(5,17), bw = 4;
      const tx = new T.CanvasTexture(pick(winC)); tx.wrapS = tx.wrapT = T.RepeatWrapping; tx.repeat.set(Math.max(1,Math.round(d/2)), Math.max(1,Math.round(h/2)));
      const b = new T.Mesh(new T.BoxGeometry(bw,h,d), new T.MeshStandardMaterial({color:0x221e29, roughness:.85, emissive:0xffffff, emissiveMap:tx, emissiveIntensity:.55}));
      b.position.set(side*(3+bw/2), h/2, z - d/2); scene.add(b);
      const nV = Math.random() < .3 ? 2 : 1;
      for (let k=0;k<nV;k++) {
        if (Math.random() > .82) continue;
        const st = styleFor(), sh = rnd(2.4,3.6), y = Math.min(h - sh/2 - .3, rnd(2.8,6.5));
        if (y < sh/2 + 1.6) continue;
        const m = new T.Mesh(new T.PlaneGeometry(.8, sh), new T.MeshBasicMaterial({map:signTex(T, pick(VT), true, st), side:T.DoubleSide}));
        const sx = side*(2.5 - k*.05), sz = z - d*(.25 + k*.45); m.position.set(sx, y, sz); addSign(m, st.col, sx, sz, true);
      }
      if (Math.random() < .55) {
        const st = styleFor(), sw = Math.min(d - .5, 3.2);
        const m = new T.Mesh(new T.PlaneGeometry(sw, sw/4), new T.MeshBasicMaterial({map:signTex(T, pick(HT), false, st), side:T.DoubleSide}));
        m.rotation.y = side < 0 ? Math.PI/2 : -Math.PI/2; m.position.set(side*2.97, rnd(2.3,3.3), z - d/2); addSign(m, st.col, side*2.6, z - d/2, false);
      }
      if (z < -6 && Math.random() < .2) {
        const vm = new T.Mesh(new T.BoxGeometry(.7,1.8,.9), new T.MeshStandardMaterial({color:0x2a2730, roughness:.6}));
        vm.position.set(side*2.62, .9, z - d*.6); scene.add(vm);
        const panel = new T.Mesh(new T.PlaneGeometry(.55,1.1), new T.MeshBasicMaterial({color:pick([0x9fc8e0,0xe0aab8,0xb4dca8])}));
        panel.position.set(side*2.62 - side*.351, 1.05, z - d*.6); panel.rotation.y = side < 0 ? Math.PI/2 : -Math.PI/2; scene.add(panel);
      }
      z -= d + .15;
    }
  }
  const wireMat = new T.LineBasicMaterial({color:0x050407}); const lanterns = [];
  for (let z = 3; z > -148; z -= 13) {
    const pts = []; for (let i=0;i<=12;i++) { const x = -3 + i*.5; pts.push(new T.Vector3(x, 4.9 - .45*(1-(x/3)**2), z)); }
    scene.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), wireMat));
    const grp = new T.Group();
    [-2.2,-1.1,0,1.1,2.2].forEach((x,i) => {
      const s = new T.Mesh(new T.SphereGeometry(.2,14,12), new T.MeshBasicMaterial({color: i%2 ? 0xffe2b8 : 0xff4a2e}));
      s.scale.set(1,1.35,1); s.position.set(x, 4.9 - .45*(1-(x/3)**2) - .42, z); grp.add(s);
    });
    scene.add(grp); lanterns.push(grp);
    for (let k=0;k<2;k++) {
      const hy = rnd(8,11), cp = [];
      for (let i=0;i<=12;i++) { const x = -3 + i*.5; cp.push(new T.Vector3(x, hy - .6*(1-(x/3)**2), z - 5 - k*2)); }
      scene.add(new T.Line(new T.BufferGeometry().setFromPoints(cp), wireMat));
    }
  }
  const endWall = new T.Mesh(new T.BoxGeometry(6.2,22,1), new T.MeshStandardMaterial({color:0x1a1720, roughness:.9})); endWall.position.set(0,11,-158); scene.add(endWall);
  const endSign = new T.Mesh(new T.PlaneGeometry(5.4,1.35), new T.MeshBasicMaterial({map:signTex(T,'路地電気 ROJI',false,{bg:'#0d0a12',fg:'#ff4f9a',glow:true})}));
  endSign.position.set(0,4.4,-157.4); scene.add(endSign); signs.push({mat:endSign.material, off:0});
  const shop = new T.Mesh(new T.PlaneGeometry(3.6,2.4), new T.MeshBasicMaterial({map:signTex(T,'営業中 OPEN',false,{bg:'#fff1c9',fg:'#c2261c'})}));
  shop.position.set(0,1.3,-157.4); scene.add(shop);
  const sl = new T.PointLight(0xff4f9a,3,18,2); sl.position.set(0,4,-154); scene.add(sl);
  const sl2 = new T.PointLight(0xffd9a0,2.2,12,2); sl2.position.set(0,1.5,-155.5); scene.add(sl2);

  // cyberpunk holograms + light beams
  const holo = new T.Group(); holo.visible = false; scene.add(holo); const holos = [];
  const HTXT = ['電脳','AI 修理','ネオン','SALE 90%','ROJI.NET','未来','DATA 回収','ゲーム','中古電脳','2099'];
  for (let i=0;i<10;i++) {
    const col = pick(['#05d9e8','#ff2a6d','#d1f7ff','#f5e663']);
    const m = new T.Mesh(new T.PlaneGeometry(3.2,1.6), new T.MeshBasicMaterial({map:holoTex(T, HTXT[i], col), transparent:true, opacity:.6, blending:T.AdditiveBlending, depthWrite:false, side:T.DoubleSide}));
    m.position.set(rnd(-1.6,1.6), rnd(6,9.5), -8 - i*14 + rnd(-3,3)); m.rotation.y = rnd(-.5,.5);
    holo.add(m); holos.push({m, x:m.position.x, y:m.position.y, ph:Math.random()*6});
  }
  for (let i=0;i<7;i++) {
    const beam = new T.Mesh(new T.CylinderGeometry(.05,.6,34,12,1,true), new T.MeshBasicMaterial({color:pick([0x05d9e8,0xff2a6d]), transparent:true, opacity:.07, blending:T.AdditiveBlending, depthWrite:false, side:T.DoubleSide}));
    beam.position.set((i%2?1:-1)*rnd(1.4,2.6), 17, -6 - i*21); holo.add(beam);
  }

  const N = 2600, rp = new Float32Array(N*6), rv = new Float32Array(N);
  for (let i=0;i<N;i++) { const x = rnd(-3,3), y = rnd(0,14), z = rnd(-40,6); rp.set([x,y,z, x+.015,y-.38,z], i*6); rv[i] = rnd(14,22); }
  const rg = new T.BufferGeometry(); rg.setAttribute('position', new T.BufferAttribute(rp,3));
  const rain = new T.LineSegments(rg, new T.LineBasicMaterial({color:0xa9b8de, transparent:true, opacity:.32})); scene.add(rain);

  let theme = null;
  const applyTheme = k => { const th = THEMES[k] || THEMES.akihabara; scene.background.setHex(th.bg); scene.fog.color.setHex(th.fog); scene.fog.density = th.fogD; rg.setDrawRange(0, th.rain*2); rain.material.opacity = th.rainOp; holo.visible = th.holo; theme = k; };
  let mx = 0, my = 0; const onM = e => { mx = (e.clientX/innerWidth)*2 - 1; my = (e.clientY/innerHeight)*2 - 1; };
  window.addEventListener('mousemove', onM);
  let t = 0, walk = 0;
  B.start(dt => {
    const o = ctx.opts(); if (!o.active) return;
    if (o.theme !== theme) applyTheme(o.theme);
    t += dt;
    let p = ctx.progress();
    if (o.autoWalk) p = (1 - Math.cos(t*.1))/2;
    walk += (p - walk) * Math.min(1, dt*3.5);
    ctx.onWalk && ctx.onWalk(walk);
    if (!ctx.visible()) return;
    const z = 10 - walk*148;
    cam.position.z = z; cam.position.x += (mx*.7 - cam.position.x)*.04;
    cam.position.y = 1.7 + Math.sin(walk*160)*.03 - my*.15;
    cam.lookAt(cam.position.x*.3 + mx*.5, 2.5 - my*.5, z - 10);
    const fl = o.flicker;
    for (const s of signs) {
      let v = 1;
      if (s.off > 0) { s.off -= dt; v = .12 + Math.random()*.25; }
      else if (fl > 0 && Math.random() < fl*dt*.5) s.off = .05 + Math.random()*.4*fl;
      s.mat.color.setScalar(v);
      if (s.refl) s.refl.material.opacity = .32*v;
      if (s.light) s.light.intensity = 1.7*v;
    }
    lanterns.forEach((g,i) => { g.rotation.z = Math.sin(t*1.3 + i)*.012; });
    if (holo.visible) holos.forEach(h => {
      const glitch = Math.random() < .03;
      h.m.position.y = h.y + Math.sin(t*.8 + h.ph)*.2;
      h.m.position.x = h.x + (glitch ? rnd(-.25,.25) : 0);
      h.m.material.opacity = glitch ? .15 : .55 + Math.sin(t*3 + h.ph)*.1;
    });
    rain.visible = o.rain;
    if (rain.visible) {
      rain.position.z = z - 4;
      const n = (THEMES[theme] || THEMES.akihabara).rain;
      for (let i=0;i<n;i++) {
        const k = i*6; let y = rp[k+1] - rv[i]*dt*(theme === 'cyberpunk' ? 1.25 : 1);
        if (y < 0) { y = 14; const x = rnd(-3,3); rp[k] = x; rp[k+3] = x + .015; }
        rp[k+1] = y; rp[k+4] = y - .38;
      }
      rg.attributes.position.needsUpdate = true;
    }
    r.render(scene, cam);
  });
  return { destroy(){ window.removeEventListener('mousemove', onM); B.destroy(); } };
};

/* ---------- 2. Product turntable ---------- */
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
      add(CY(.05,.14), dark, .62,1.15,.1);
      add(BX(.06,.42,.3), dark, .82,.6,0);
      break;
    }
    case 'md': {
      add(BX(1.1,.85,.26), M(0x6f86b8,{metalness:.65,roughness:.3}), 0,.425,0);
      add(BX(.66,.6,.02), glass, -.12,.45,.135);
      add(CY(.26,.012,40), metal, -.12,.45,.15, H);
      add(BX(.16,.42,.02), G(0x7fe0c9), .4,.48,.135);
      for (let i=0;i<4;i++) add(BX(.06,.1,.08), dark, .56,.2+i*.16,0);
      break;
    }
    case 'crt': {
      add(BX(1.4,1.25,1.25), M(0xd9d2c3), 0,.625,0);
      add(BX(1.06,.88,.02), dark, -.1,.7,.63);
      const sc = cnv(64,48), sg = sc.getContext('2d'); const st = new T.CanvasTexture(sc);
      add(BX(.9,.7,.02), new T.MeshBasicMaterial({map:st}), -.1,.7,.645);
      [.92,.62].forEach(y => add(CY(.07,.07), dark, .56,y,.66, H));
      for (let i=0;i<4;i++) add(BX(.2,.02,.01), dark, .56,.3+i*.05,.63);
      add(CY(.016,1.3), metal, -.32,1.8,-.25, 0,0,.42);
      add(CY(.016,1.3), metal, .32,1.8,-.25, 0,0,-.42);
      add(CY(.08,.1), dark, 0,1.28,-.25);
      let f = 0;
      g.userData.tick = () => {
        if ((f++ % 3)) return;
        const im = sg.createImageData(64,48);
        for (let i=0;i<im.data.length;i+=4) { const v = Math.random()*255; im.data[i]=v*.85; im.data[i+1]=v; im.data[i+2]=v*.95; im.data[i+3]=255; }
        sg.putImageData(im,0,0); st.needsUpdate = true;
      };
      break;
    }
    case 'vhs': {
      add(BX(1.9,.38,1.2), M(0x1a191d,{roughness:.4}), 0,.19,0);
      add(BX(1.91,.04,1.21), metal, 0,.39,0);
      add(BX(1.0,.07,.02), M(0x050406), -.3,.24,.605);
      add(BX(.42,.12,.02), G(0x3cff9a), .6,.26,.605);
      for (let i=0;i<5;i++) add(BX(.1,.05,.03), metal, -.7+i*.15,.1,.61);
      add(CY(.09,.04), metal, .6,.1,.62, H);
      break;
    }
    case 'halfcam': {
      add(BX(1.3,.72,.42), M(0x1c1b1f,{roughness:.8}), 0,.36,0);
      add(BX(1.31,.2,.43), metal, 0,.82,0);
      add(CY(.28,.32), metal, .1,.4,.36, H);
      add(CY(.21,.03), glass, .1,.4,.53, H);
      add(BX(.26,.15,.05), glass, -.42,.82,.2);
      add(CY(.06,.06), M(0xd23a2a), .45,.95,0);
      add(CY(.1,.08), metal, -.25,.95,0);
      break;
    }
    case 'instant': {
      add(BX(1.2,.95,1.0), M(0xf0ece4), 0,.475,0);
      add(BX(1.21,.2,1.01), M(0x1d1b20), 0,.1,0);
      add(CY(.3,.12), dark, .18,.55,.52, H);
      add(CY(.2,.02), glass, .18,.55,.59, H);
      add(BX(.36,.18,.05), M(0xdde7ee,{roughness:.2}), -.3,.82,.5);
      ['#e8452c','#f08a24','#f3c641','#4fa35a','#2d7fc1'].forEach((c,i) => add(BX(.05,.5,.01), M(new T.Color(c)), -.44+i*.06,.4,.505));
      add(BX(.8,.04,.02), M(0x050406), 0,.17,.51);
      break;
    }
    case 'handheld': {
      add(BX(.9,1.4,.2), M(0xc9c7c0), 0,.7,0);
      add(BX(.72,.56,.02), M(0x45434f), 0,.98,.105);
      add(BX(.56,.42,.02), G(0x9bc46a), 0,.98,.115);
      add(BX(.28,.09,.06), dark, -.22,.4,.11); add(BX(.09,.28,.06), dark, -.22,.4,.11);
      add(CY(.065,.06), M(0xb3245c), .16,.38,.11, H); add(CY(.065,.06), M(0xb3245c), .32,.46,.11, H);
      add(BX(.12,.04,.03), dark, -.08,.16,.11, 0,0,.4); add(BX(.12,.04,.03), dark, .1,.16,.11, 0,0,.4);
      break;
    }
    case 'arcade': {
      add(BX(2.1,.3,1.0), M(0x141318), 0,.15,0);
      add(BX(2.1,.04,1.0), M(0x2a3f8f,{roughness:.3}), 0,.32,0);
      add(CY(.03,.42), metal, -.6,.54,0);
      add(new T.SphereGeometry(.13,20,16), M(0xd23a2a,{roughness:.2}), -.6,.78,0);
      add(CY(.16,.04), dark, -.6,.35,0);
      const bc = [0xff4f9a,0x2fd3e0,0xf0a030,0x7cff6b,0xb06bff,0xf1ece2];
      for (let i=0;i<6;i++) add(CY(.085,.07), M(bc[i],{roughness:.25}), .05 + (i%3)*.27, .37, i<3 ? -.14 : .16);
      break;
    }
    case 'pager': {
      add(BX(.9,.55,.24), M(0x18171b,{roughness:.6}), 0,.275,0);
      add(BX(.62,.18,.02), G(0x7fe0c9), -.05,.37,.125);
      add(BX(.16,.08,.04), M(0x6a6870), .3,.14,.12);
      add(BX(.3,.42,.04), dark, 0,.28,-.14);
      add(CY(.04,.06), M(0xd23a2a), .35,.56,0);
      break;
    }
    case 'payphone': {
      const pink = M(0xff8fb3,{roughness:.35});
      add(BX(1.0,1.4,.7), pink, 0,.7,0);
      add(BX(.6,.16,.02), M(0xf3ead6), .1,1.24,.355);
      add(CY(.3,.05,40), M(0xf3ead6), .15,.72,.37, H);
      add(CY(.1,.06), pink, .15,.72,.4, H);
      add(BX(.22,.04,.02), M(0x050406), .15,1.05,.355);
      add(BX(.28,.16,.06), dark, .15,.22,.37);
      add(BX(.2,.95,.3), M(0xe66f97), -.6,.78,.1);
      add(BX(.13,1.0,.17), pink, -.72,.78,.28);
      add(BX(.2,.16,.22), pink, -.72,1.25,.3); add(BX(.2,.16,.22), pink, -.72,.31,.3);
      break;
    }
    default: add(BX(1,1,1), M(0x888888), 0,.5,0);
  }
  return g;
}
R.turntable = function(el, ctx){
  const T = THREE; const B = base(T, el, {fov:36, far:120}); const {r, cam} = B;
  r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene(); scene.background = new T.Color(0x0d0a16); scene.fog = new T.FogExp2(0x0d0a16, .07);
  cam.position.set(0, 2.4, 6.2);
  scene.add(new T.AmbientLight(0x6a5a8a, .4));
  const spot = new T.SpotLight(0xfff2dc, 2.6, 22, .42, .55, 1.1); spot.position.set(0,7.5,1.2); spot.target.position.set(0,.6,0);
  spot.castShadow = true; spot.shadow.mapSize.set(1024,1024); scene.add(spot, spot.target);
  const rimA = new T.PointLight(0xff4f9a,1.6,12,2); rimA.position.set(-3.5,2.4,-2.4);
  const rimB = new T.PointLight(0x2fd3e0,1.6,12,2); rimB.position.set(3.5,2,-2.4); scene.add(rimA, rimB);
  const floor = new T.Mesh(new T.PlaneGeometry(60,60), new T.MeshStandardMaterial({color:0x0d0b10, roughness:.55, metalness:.3}));
  floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; scene.add(floor);
  const plat = new T.Mesh(new T.CylinderGeometry(1.7,1.8,.22,64), new T.MeshStandardMaterial({color:0x1c1a22, roughness:.35, metalness:.6}));
  plat.position.y = .11; plat.receiveShadow = true; plat.castShadow = true; scene.add(plat);
  const ring = new T.Mesh(new T.TorusGeometry(1.76,.025,8,96), new T.MeshBasicMaterial({color:0xff4f9a})); ring.rotation.x = Math.PI/2; ring.position.y = .2; scene.add(ring);
  const cone = new T.Mesh(new T.ConeGeometry(2.1,7.2,48,1,true), new T.MeshBasicMaterial({color:0xfff2dc, transparent:true, opacity:.05, blending:T.AdditiveBlending, depthWrite:false, side:T.DoubleSide}));
  cone.position.y = 3.9; scene.add(cone);
  const DN = 260, dp = new Float32Array(DN*3);
  for (let i=0;i<DN;i++) { const a = Math.random()*6.28, rr = Math.random()*1.6; dp.set([Math.cos(a)*rr, rnd(.3,6), Math.sin(a)*rr], i*3); }
  const dg = new T.BufferGeometry(); dg.setAttribute('position', new T.BufferAttribute(dp,3));
  scene.add(new T.Points(dg, new T.PointsMaterial({color:0xfff2dc, size:.025, transparent:true, opacity:.55})));
  const scan = new T.Group(); scan.visible = false; scene.add(scan);
  scan.add(new T.Mesh(new T.CircleGeometry(1.9,64), new T.MeshBasicMaterial({color:0x05d9e8, transparent:true, opacity:.1, blending:T.AdditiveBlending, depthWrite:false, side:T.DoubleSide})));
  scan.add(new T.Mesh(new T.TorusGeometry(1.9,.015,6,96), new T.MeshBasicMaterial({color:0x05d9e8})));
  scan.children.forEach(c => c.rotation.x = Math.PI/2);
  const holder = new T.Group(); holder.position.y = .22; scene.add(holder);
  let model = null;
  const setModel = key => {
    if (model) { holder.remove(model); model.traverse(o => { o.geometry && o.geometry.dispose(); }); }
    model = buildModel(T, key);
    const box = new T.Box3().setFromObject(model), size = new T.Vector3(), c = new T.Vector3(); box.getSize(size); box.getCenter(c);
    const s = 2.1 / Math.max(size.x, size.y, size.z); model.scale.setScalar(s);
    model.position.set(-c.x*s, -box.min.y*s, -c.z*s);
    model.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    holder.add(model);
    if (gsap) gsap.fromTo(holder.scale, {x:.6,y:.6,z:.6}, {x:1,y:1,z:1, duration:.7, ease:'back.out(2)'});
  };
  let dragging = false, lx = 0, vel = 0;
  const cv = r.domElement;
  const pd = e => { dragging = true; lx = e.clientX; cv.setPointerCapture && cv.setPointerCapture(e.pointerId); el.style.cursor = 'grabbing'; };
  const pm = e => { if (!dragging) return; const dx = e.clientX - lx; lx = e.clientX; holder.rotation.y += dx*.01; vel = dx*.0012; };
  const pu = () => { dragging = false; el.style.cursor = 'grab'; };
  cv.addEventListener('pointerdown', pd); cv.addEventListener('pointermove', pm); cv.addEventListener('pointerup', pu); cv.addEventListener('pointerleave', pu);
  let theme = null, t = 0;
  B.start(dt => {
    const o = ctx.opts(); t += dt;
    if (o.theme !== theme) {
      theme = o.theme; const th = THEMES[theme] || THEMES.akihabara;
      scene.background.setHex(th.bg); scene.fog.color.setHex(th.bg);
      rimA.color.setHex(th.rim[0]); rimB.color.setHex(th.rim[1]); ring.material.color.setHex(th.rim[0]); scan.visible = th.holo;
    }
    if (!dragging) { holder.rotation.y += dt*.45 + vel; vel *= .94; }
    if (model && model.userData.tick) model.userData.tick();
    if (scan.visible) { const k = (t*.45) % 1; scan.position.y = .25 + k*2.5; scan.children[0].material.opacity = .12*(1 - k); }
    const fl = o.flicker || 0; ring.material.color.setScalar !== undefined;
    spot.intensity = 2.6 * (Math.random() < fl*.01 ? .4 : 1);
    cam.position.y = 2.4 + Math.sin(t*.5)*.05; cam.lookAt(0,1.05,0);
    r.render(scene, cam);
  });
  return { setModel, destroy(){ cv.removeEventListener('pointerdown', pd); B.destroy(); } };
};

/* ---------- 3. Top-down diorama ---------- */
R.diorama = function(el, ctx){
  const T = THREE; const B = base(T, el, {fov:32, far:500}); const {r, cam} = B;
  r.shadowMap.enabled = true;
  const scene = new T.Scene(); scene.background = new T.Color(0x0d0a16); scene.fog = new T.Fog(0x0d0a16, 70, 160);
  scene.add(new T.AmbientLight(0x6a5a8a, .55));
  const sun = new T.DirectionalLight(0x8a90ff, .55); sun.position.set(-20,40,12); sun.castShadow = true;
  Object.assign(sun.shadow.camera, {left:-30, right:30, top:30, bottom:-30}); sun.shadow.mapSize.set(1024,1024); scene.add(sun);
  const slab = new T.Mesh(new T.BoxGeometry(46,1.2,46), new T.MeshStandardMaterial({color:0x17141d, roughness:.9})); slab.position.y = -.6; scene.add(slab);
  const ground = new T.Mesh(new T.PlaneGeometry(44,44), new T.MeshStandardMaterial({color:0x1f1c26, roughness:.85})); ground.rotation.x = -Math.PI/2; ground.position.y = .01; ground.receiveShadow = true; scene.add(ground);
  const road = (w,d,x,z,c) => { const m = new T.Mesh(new T.BoxGeometry(w,.02,d), new T.MeshStandardMaterial({color:c||0x2a2632, roughness:.6})); m.position.set(x,.03,z); m.receiveShadow = true; scene.add(m); };
  road(2.2,24,0,-1,0x332e3c); road(1.6,44,-6,0); road(1.6,44,6,0); road(44,1.6,0,-14); road(44,1.6,0,12);
  const winC = windowCanvases();
  const pickables = [], infos = [], flick = [];
  const reg = (meshes, info) => { meshes.forEach(m => { m.userData.info = info; pickables.push(m); }); infos.push(info); };
  const bldg = (x,z,w,d,h,color) => {
    const tx = new T.CanvasTexture(pick(winC)); tx.wrapS = tx.wrapT = T.RepeatWrapping; tx.repeat.set(Math.max(1,Math.round(w)), Math.max(1,Math.round(h)));
    const mat = new T.MeshStandardMaterial({color:color||0x2a2532, roughness:.8, emissive:0xffffff, emissiveMap:tx, emissiveIntensity:.5});
    const m = new T.Mesh(new T.BoxGeometry(w,h,d), mat); m.position.set(x,h/2,z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    const roof = new T.Mesh(new T.BoxGeometry(w*.96,.08,d*.96), new T.MeshStandardMaterial({color:0x15131a})); roof.position.set(x,h+.04,z); scene.add(roof);
    return m;
  };
  const sprite = (tex, x, y, z, s) => { const sp = new T.Sprite(new T.SpriteMaterial({map:tex, transparent:true, depthTest:false})); sp.scale.set(5.2*s,1.73*s,1); sp.position.set(x,y,z); sp.renderOrder = 10; scene.add(sp); return sp; };

  // our shop at the end of the alley
  const home = bldg(0,-12.2,4.2,2.6,3.4,0x2b2333);
  const homeSign = new T.Mesh(new T.PlaneGeometry(3.4,.85), new T.MeshBasicMaterial({map:signTex(T,'路地電気 ROJI',false,{bg:'#0d0a12',fg:'#ff4f9a',glow:true})}));
  homeSign.position.set(0,2.7,-10.88); scene.add(homeSign);
  const homeL = new T.PointLight(0xff4f9a,2.4,12,2); homeL.position.set(0,2.5,-9.5); scene.add(homeL);
  const homeLbl = sprite(labelTex(T,'ROJI DENKI','路地電気 · 本店','#ff4f9a',true), 0,6.4,-12.2, 1);
  reg([home, homeSign], {type:'roji', key:'roji', en:'Roji Denki', jp:'路地電気', pos:new T.Vector3(0,0,-12.2), r:16});

  // category shops along the alley
  const SHOPS = [
    {key:'audio', en:'Audio', jp:'音響', col:'#ff4f9a', x:-2.4, z:8},
    {key:'tv', en:'TV & Video', jp:'テレビ', col:'#2fd3e0', x:2.4, z:4},
    {key:'camera', en:'Cameras', jp:'カメラ', col:'#f0a030', x:-2.4, z:0},
    {key:'game', en:'Games', jp:'ゲーム', col:'#7cff6b', x:2.4, z:-4},
    {key:'phone', en:'Phones', jp:'電話', col:'#b06bff', x:-2.4, z:-8}
  ];
  SHOPS.forEach(s => {
    const h = rnd(2.6,4.2), m = bldg(s.x, s.z, 2.4, 3.6, h);
    const side = Math.sign(s.x);
    const sg = new T.Mesh(new T.PlaneGeometry(.55,1.9), new T.MeshBasicMaterial({map:signTex(T, s.jp, true, {bg:'#0d0a12', fg:s.col, glow:true}), side:T.DoubleSide}));
    sg.position.set(s.x - side*1.45, Math.min(h-.4, 2.2), s.z + 1.2); scene.add(sg);
    const lit = labelTex(T, s.en.toUpperCase(), s.jp + ' · SHOP', s.col, true), dim = labelTex(T, s.en.toUpperCase(), s.jp + ' · SHOP', s.col, false);
    const lb = sprite(dim, s.x, h + 2, s.z, .62); lb.material.opacity = .8;
    const pl = new T.PointLight(new T.Color(s.col), 1, 6, 2); pl.position.set(s.x - side*1.1, 2, s.z + 1.2); scene.add(pl);
    flick.push(sg.material);
    const info = {type:'shop', key:s.key, en:s.en, jp:s.jp, cat:s.key, pos:new T.Vector3(s.x,0,s.z), r:14,
      hl(on){ lb.material.map = on ? lit : dim; lb.material.opacity = on ? 1 : .8; lb.scale.set(5.2*(on?.78:.62), 1.73*(on?.78:.62), 1); pl.intensity = on ? 3 : 1; m.material.emissiveIntensity = on ? .9 : .5; }};
    reg([m, sg], info);
  });
  const FILL = [['Coin laundry','コインランドリー'],['Ramen stall','ラーメン屋'],['Pachinko hall','パチンコ'],['Apartments','アパート'],['Karaoke box','カラオケ'],['Bathhouse','銭湯'],['Konbini','コンビニ'],['Tobacco stand','たばこ屋'],['Izakaya','居酒屋'],['Bookshop','古本屋'],['Parking','駐車場'],['Clinic','診療所']];
  const addFill = (x,z,w,d,h) => {
    const [en,jp] = pick(FILL); const m = bldg(x,z,w,d,h);
    if (Math.random() < .35) { const nb = new T.Mesh(new T.BoxGeometry(w*.6,.25,.08), new T.MeshBasicMaterial({color:new T.Color(pick(NEON))})); nb.position.set(x, h+.3, z + d/2 - .1); scene.add(nb); flick.push(nb.material); }
    reg([m], {type:'building', key:'b'+infos.length, en, jp, pos:new T.Vector3(x,0,z), r:14, hl(on){ m.material.emissiveIntensity = on ? 1 : .5; m.material.color.setHex(on ? 0x4a3f58 : 0x2a2532); }});
  };
  [[2.4,8],[-2.4,4],[2.4,0],[-2.4,-4],[2.4,-8]].forEach(([x,z]) => addFill(x,z,2.4,3.6,rnd(2,5)));
  for (let gx=-19; gx<=19; gx+=4.2) for (let gz=-19; gz<=19; gz+=4.2) {
    if (Math.abs(gx) < 5 && gz > -15.5 && gz < 11) continue;
    if (gz > 14 && gz < 19) continue;
    if (Math.abs(Math.abs(gx) - 6) < 1.4 || Math.abs(gz + 14) < 1.4 || Math.abs(gz - 12) < 1.4) continue;
    if (Math.random() < .12) continue;
    addFill(gx + rnd(-.3,.3), gz + rnd(-.3,.3), rnd(2.2,3.4), rnd(2.2,3.4), rnd(1.2,7.5));
  }
  // elevated train line
  const TZ = 16.5;
  const beam = new T.Mesh(new T.BoxGeometry(46,.3,1.6), new T.MeshStandardMaterial({color:0x3a3742, roughness:.7})); beam.position.set(0,2.3,TZ); beam.castShadow = true; scene.add(beam);
  for (let x=-21; x<=21; x+=3.5) { const p = new T.Mesh(new T.CylinderGeometry(.18,.18,2.2,10), new T.MeshStandardMaterial({color:0x2a2830})); p.position.set(x,1.1,TZ); scene.add(p); }
  const train = new T.Group(); scene.add(train); const cars = [];
  for (let i=0;i<5;i++) {
    const car = new T.Group();
    const body = new T.Mesh(new T.BoxGeometry(3.2,.9,1.1), new T.MeshStandardMaterial({color:0xe6e0d4, roughness:.5})); body.castShadow = true; car.add(body);
    const stripe = new T.Mesh(new T.BoxGeometry(3.22,.16,1.12), new T.MeshBasicMaterial({color:0xf08a24})); stripe.position.y = -.2; car.add(stripe);
    const win = new T.Mesh(new T.BoxGeometry(3.0,.24,1.13), new T.MeshBasicMaterial({color:0xfff1c9})); win.position.y = .14; car.add(win);
    car.position.set(-i*3.35, 2.95, TZ); train.add(car); cars.push(car);
  }
  sprite(labelTex(T,'CHŪŌ LINE','中央線 · 高架','#f08a24',false), 18,5.4,TZ, .6);
  // district pins
  const DIST = [
    {key:'akihabara', en:'Akihabara', jp:'秋葉原', x:21, z:-1, dir:'→'},
    {key:'ueno', en:'Ueno', jp:'上野', x:19, z:-11, dir:'↗'},
    {key:'asakusa', en:'Asakusa', jp:'浅草', x:12, z:-20, dir:'↗'},
    {key:'koenji', en:'Koenji', jp:'高円寺', x:-21, z:-3, dir:'←'},
    {key:'kichijoji', en:'Kichijoji', jp:'吉祥寺', x:-20, z:7, dir:'←'},
    {key:'shimokita', en:'Shimokitazawa', jp:'下北沢', x:-11, z:21, dir:'↙'},
    {key:'nakano', en:'Nakano', jp:'中野', x:7.5, z:-17, dir:'●'}
  ];
  const pins = [];
  DIST.forEach(d => {
    const stem = new T.Mesh(new T.CylinderGeometry(.08,.08,4.2,10), new T.MeshStandardMaterial({color:0xf0a030, metalness:.6, roughness:.3})); stem.position.set(d.x,2.1,d.z); scene.add(stem);
    const head = new T.Mesh(new T.SphereGeometry(.5,20,16), new T.MeshBasicMaterial({color:0xf0a030})); head.position.set(d.x,4.5,d.z); scene.add(head);
    const halo = new T.Mesh(new T.TorusGeometry(.9,.04,8,48), new T.MeshBasicMaterial({color:0xf0a030, transparent:true, opacity:.6})); halo.rotation.x = Math.PI/2; halo.position.set(d.x,.08,d.z); scene.add(halo);
    const lit = labelTex(T, d.dir + ' ' + d.en.toUpperCase(), d.jp, '#f0a030', true), dim = labelTex(T, d.dir + ' ' + d.en.toUpperCase(), d.jp, '#f0a030', false);
    const lb = sprite(dim, d.x, 6.6, d.z, .7);
    pins.push({head, halo, y:4.5, ph:Math.random()*6});
    reg([stem, head], {type:'district', key:d.key, en:d.en, jp:d.jp, pos:new T.Vector3(d.x,0,d.z), r:18,
      hl(on){ lb.material.map = on ? lit : dim; head.material.color.setHex(on ? 0xffd27a : 0xf0a030); lb.scale.set(5.2*(on?.86:.7), 1.73*(on?.86:.7), 1); }});
  });

  // camera rig
  const st = {tx:0, ty:0, tz:0, r:62, theta:Math.PI/4, phi:.92};
  const HOME = {tx:0, ty:0, tz:0, r:62, phi:.92};
  const fly = (to, dur) => { if (gsap) { gsap.killTweensOf(st); gsap.to(st, Object.assign({duration:dur||1.4, ease:'power3.inOut'}, to)); } else Object.assign(st, to); };
  const flyInfo = info => fly({tx:info.pos.x, tz:info.pos.z, r:info.r || 14, phi:.82});
  const ray = new T.Raycaster(), ndc = new T.Vector2(); let hover = null, down = null;
  const cv = r.domElement;
  const hit = e => { const b = cv.getBoundingClientRect(); ndc.set(((e.clientX-b.left)/b.width)*2-1, -((e.clientY-b.top)/b.height)*2+1); ray.setFromCamera(ndc, cam); const h = ray.intersectObjects(pickables, false)[0]; return h ? h.object.userData.info : null; };
  const pub = i => i && ({type:i.type, key:i.key, en:i.en, jp:i.jp, cat:i.cat});
  const setHover = (info, e) => {
    if (info !== hover) { hover && hover.hl && hover.hl(false); info && info.hl && info.hl(true); hover = info; cv.style.cursor = info ? 'pointer' : 'grab'; }
    const b = cv.getBoundingClientRect(); ctx.onHover && ctx.onHover(pub(info), e ? e.clientX - b.left : 0, e ? e.clientY - b.top : 0);
  };
  const pd = e => { down = {x:e.clientX, y:e.clientY, lx:e.clientX, ly:e.clientY, moved:0}; cv.setPointerCapture && cv.setPointerCapture(e.pointerId); };
  const pm = e => {
    if (down) {
      const dx = e.clientX - down.lx, dy = e.clientY - down.ly; down.lx = e.clientX; down.ly = e.clientY; down.moved += Math.abs(dx) + Math.abs(dy);
      if (down.moved > 5) { st.theta -= dx*.006; st.phi = clamp(st.phi - dy*.004, .35, 1.25); cv.style.cursor = 'grabbing'; }
    } else setHover(hit(e), e);
  };
  const pu = e => { if (down && down.moved < 6) { const info = hit(e); if (info) { flyInfo(info); ctx.onSelect && ctx.onSelect(pub(info)); } } down = null; cv.style.cursor = hover ? 'pointer' : 'grab'; };
  const pl = () => { down = null; setHover(null); };
  cv.addEventListener('pointerdown', pd); cv.addEventListener('pointermove', pm); cv.addEventListener('pointerup', pu); cv.addEventListener('pointerleave', pl);
  cv.style.cursor = 'grab';

  let theme = null, t = 0, tx = -30;
  B.start(dt => {
    const o = ctx.opts(); t += dt;
    if (o.theme !== theme) { theme = o.theme; const th = THEMES[theme] || THEMES.akihabara; scene.background.setHex(th.bg); scene.fog.color.setHex(th.bg); }
    tx += dt*5; if (tx > 40) tx = -30;
    cars.forEach((c,i) => { c.position.x = tx - i*3.35; c.visible = Math.abs(c.position.x) < 21.5; });
    pins.forEach(p => { p.head.position.y = p.y + Math.sin(t*2 + p.ph)*.15; p.halo.scale.setScalar(1 + ((t*.8 + p.ph) % 1)*.8); p.halo.material.opacity = .6*(1 - ((t*.8 + p.ph) % 1)); });
    homeL.intensity = 2.4 + Math.sin(t*3)*.4;
    const fl = o.flicker || 0;
    flick.forEach(m => m.color.setScalar(Math.random() < fl*.01 ? .25 : 1));
    const sp = Math.sin(st.phi);
    cam.position.set(st.tx + st.r*sp*Math.sin(st.theta), st.ty + st.r*Math.cos(st.phi), st.tz + st.r*sp*Math.cos(st.theta));
    cam.lookAt(st.tx, st.ty, st.tz);
    r.render(scene, cam);
  });
  return {
    reset(){ fly(HOME, 1.2); },
    focus(key){ const i = infos.find(x => x.key === key); if (i) { flyInfo(i); ctx.onSelect && ctx.onSelect(pub(i)); } },
    destroy(){ cv.removeEventListener('pointerdown', pd); cv.removeEventListener('pointermove', pm); cv.removeEventListener('pointerup', pu); cv.removeEventListener('pointerleave', pl); gsap && gsap.killTweensOf(st); B.destroy(); }
  };
};

export default R;
