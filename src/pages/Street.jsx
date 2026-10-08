import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Scenes from '../scenes/street.js';
import { DEPTS, PRODUCTS } from '../data.js';
import { useStore } from '../store.jsx';
import { clamp, showTip, useViewport } from '../util.js';

const STREET_LEN = 148;

// Auto-walk tour: stroll from the entrance, pause in front of each department, linger at the main counter, then head back.
const STOP_VIEW = 8;          // metres short of a storefront's centre, so it sits ahead and to the side
const WALK_SPEED = 1.8;       // m/s average while strolling
const RETURN_SPEED = 7;       // m/s on the way back to the entrance
const DWELL = { start: 3, dept: 4.5, end: 6 };
const USER_PAUSE = 4;         // s to hold after the visitor scrolls, before the tour carries on
const TOUR = [
  { w: 0, dwell: DWELL.start },
  ...DEPTS.map(d => ({ w: (10 - (d.z + STOP_VIEW)) / STREET_LEN, dwell: DWELL.dept })).sort((a, b) => a.w - b.w),
  { w: 1, dwell: DWELL.end }
];
const easeInOut = x => (1 - Math.cos(Math.PI * x)) / 2;

export default function Street() {
  const nav = useNavigate();
  const { settings, settingsRef, walkRef, fontsReady } = useStore();
  const stage = useRef(null), cap0 = useRef(null), cap2 = useRef(null), meter = useRef(null), bar = useRef(null), tip = useRef(null);
  const [near, setNear] = useState(null);
  const [dist, setDist] = useState([]);
  const last = useRef({ sig: '', t: 0, near: null });
  const { w: vw, h: vh } = useViewport();
  const jp = settings.japanese, full = vh >= 680;

  // The street is a single full-screen view: page scroll is locked and wheel/touch/keys move along the street.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const step = d => { walkRef.current = clamp(walkRef.current + d, 0, 1); };
    let ty = null;
    const onWheel = e => { e.preventDefault(); step((e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY) * .00035); };
    const onTS = e => { ty = e.touches[0].clientY; };
    const onTM = e => { if (ty == null) return; e.preventDefault(); const y = e.touches[0].clientY; step((ty - y) * .0016); ty = y; };
    const onKey = e => {
      if (/INPUT|TEXTAREA/.test(e.target?.tagName || '')) return;
      const k = e.key;
      if (['ArrowUp', 'w', 'PageDown', ' '].includes(k)) { e.preventDefault(); step(.03); }
      else if (['ArrowDown', 's', 'PageUp'].includes(k)) { e.preventDefault(); step(-.03); }
      else if (k === 'Home') step(-1); else if (k === 'End') step(1);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTS, { passive: true });
    window.addEventListener('touchmove', onTM, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('wheel', onWheel); window.removeEventListener('touchstart', onTS);
      window.removeEventListener('touchmove', onTM); window.removeEventListener('keydown', onKey);
    };
  }, [walkRef]);

  useEffect(() => {
    if (!settings.autoWalk) return;
    let raf, prev = performance.now(), clock = 0, set = walkRef.current;
    // Pause briefly wherever the visitor is, then walk to the next stop ahead.
    let leg = null, holdUntil = DWELL.start;
    const nextLeg = from => {
      const stop = TOUR.find(s => s.w > from + .002);
      const to = stop ? stop.w : 0, speed = stop ? WALK_SPEED : RETURN_SPEED;
      const dur = Math.max(2, Math.abs(to - from) * STREET_LEN / speed);
      return { from, to, t0: clock, dur, dwell: stop ? stop.dwell : DWELL.start };
    };
    const tick = now => {
      clock += Math.min(.1, (now - prev) / 1000); prev = now;
      if (Math.abs(walkRef.current - set) > 1e-4) { leg = null; holdUntil = clock + USER_PAUSE; }
      if (!leg && clock >= holdUntil) leg = nextLeg(walkRef.current);
      if (leg) {
        const k = Math.min(1, (clock - leg.t0) / leg.dur);
        walkRef.current = leg.from + (leg.to - leg.from) * easeInOut(k);
        if (k === 1) { holdUntil = clock + leg.dwell; leg = null; }
      }
      set = walkRef.current;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [settings.autoWalk, walkRef]);

  useEffect(() => {
    if (!fontsReady || !stage.current) return;
    const caps = [[cap0, 0, .07], [cap2, .9, 1]];
    const scene = Scenes.alley(stage.current, {
      depts: DEPTS,
      opts: () => ({ ...settingsRef.current, active: true }),
      progress: () => walkRef.current,
      visible: () => true,
      onHover: (i, x, y) => showTip(tip.current, i && i.en, i && i.jp, 'CLICK · STEP INSIDE', x, y),
      onEnter: k => nav(k === 'all' ? '/shop' : `/dept/${k}`),
      onWalk: w => {
        caps.forEach(([ref, a, b]) => {
          const n = ref.current; if (!n) return;
          const o = Math.min(a <= 0 ? 1 : clamp((w - a) / .05, 0, 1), b >= 1 ? 1 : clamp((b - w) / .05, 0, 1));
          n.style.opacity = o; n.style.transform = `translateY(${(1 - o) * 14}px)`; n.style.pointerEvents = o > .5 ? 'auto' : 'none';
        });
        if (meter.current) meter.current.textContent = String(Math.round(w * STREET_LEN)).padStart(3, '0') + ' M';
        if (bar.current) bar.current.style.width = (w * 100).toFixed(1) + '%';
        const z = 10 - w * STREET_LEN;
        let nk = null; DEPTS.forEach(d => { const dz = z - d.z; if (!nk && dz > -3 && dz < 16) nk = d.key; });
        const ds = DEPTS.map(d => Math.round(z - d.z)), sig = nk + '|' + ds.join(','), now = performance.now();
        if (sig !== last.current.sig && (nk !== last.current.near || now - last.current.t > 200)) {
          last.current = { sig, t: now, near: nk }; setNear(nk); setDist(ds);
        }
      }
    });
    return () => scene.destroy();
  }, [fontsReady, nav, settingsRef, walkRef]);

  const nd = near && DEPTS.find(d => d.key === near);
  const ndNum = nd ? String(DEPTS.indexOf(nd) + 1).padStart(2, '0') : '';
  return (
    <section className="street" aria-label="The street">
      <div ref={stage} className="street-stage" />
      <div className="street-fade-v" />
      <div className="scanlines" />
      <div className="street-fade-h" />

      {vw >= 1100 && (
        <div className="directory">
          <div className="directory-head"><span>案内板 · DIRECTORY</span><span style={{ color: 'var(--dim)' }}>CLICK TO ENTER</span></div>
          {DEPTS.map((d, i) => {
            const v = dist[i], on = near === d.key, passed = v !== undefined && v < -3;
            return (
              <button key={d.key} className="directory-row" onClick={() => nav(`/dept/${d.key}`)} style={{ borderLeftColor: on ? d.col : 'transparent', background: on ? 'rgba(241,236,226,.07)' : undefined }}>
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                <span className="name">{d.en}{jp && <small>{d.jp}</small>}</span>
                <span className="dist" style={{ color: on ? d.col : 'var(--muted)' }}>{d.side < 0 ? '←' : '→'} {v === undefined ? '' : passed ? 'PASSED' : Math.max(0, v) + ' M'}</span>
              </button>
            );
          })}
        </div>
      )}
      <div ref={tip} className="tip"><b /><small /><em /></div>

      <div className="captions">
        <div ref={cap0} className="caption" style={{ gap: 18 }}>
          <span className="eyebrow cyan" style={{ fontSize: 14, textShadow: '0 1px 3px rgba(0,0,0,.95), 0 0 12px oklch(0.75 0.16 200 / .6)' }}>NAKANO · BACK ALLEY 3-CHOME</span>
          <h1 data-glitch className="shadowed">Salvaged electronics from Tokyo's back streets.</h1>
          {full && <p className="shadowed-sm">Cassette players, CRTs, film cameras and pagers, rescued from closing shops and restored on our bench under the tracks.</p>}
          <div className="row">
            <Link className="btn btn-pink" to="/shop">Shop the alley</Link>
            <Link className="btn btn-ghost" to="/map">See the alley map</Link>
          </div>
          {full && <span className="hint">SCROLL TO WALK · CLICK A STOREFRONT TO GO INSIDE</span>}
        </div>

        {nd && (
          <div className="caption" style={{ gap: 14 }}>
            <span className="eyebrow" style={{ fontSize: 14, color: nd.col, textShadow: `0 0 10px ${nd.col}` }}>{nd.side < 0 ? '← ON YOUR LEFT' : 'ON YOUR RIGHT →'} · DEPT {ndNum}</span>
            <h2 data-glitch className="shadowed">{nd.en}{jp && <span style={{ fontSize: '.45em', color: 'var(--soft)' }}>{nd.jp}</span>}</h2>
            {full && <p className="shadowed-sm" style={{ maxWidth: 440, fontSize: 16 }}>{nd.blurb}</p>}
            <div className="row">
              <button className="btn" style={{ background: nd.col, color: 'var(--ink)', boxShadow: `0 0 28px ${nd.col}` }} onClick={() => nav(`/dept/${nd.key}`)}>Step inside →</button>
              <span className="eyebrow muted">{PRODUCTS.filter(p => p.cat === nd.key).length} ITEMS ON THE SHELVES</span>
            </div>
          </div>
        )}

        <div ref={cap2} className="caption" style={{ opacity: 0 }}>
          <span className="eyebrow pink" style={{ fontSize: 14, textShadow: '0 0 10px oklch(0.75 0.16 355 / .6)' }}>突き当たり · END OF THE ALLEY</span>
          <h2 data-glitch className="shadowed" style={{ fontSize: 'clamp(30px,4.2vw,58px)' }}>The main counter. Every shelf in one place.</h2>
          <Link className="btn btn-pink" style={{ alignSelf: 'flex-start' }} to="/shop">Browse everything</Link>
        </div>
      </div>

      <div className="meter">
        <span>WALKED</span>
        <span ref={meter} className="meter-val">000 M</span>
        <span className="meter-track"><span ref={bar} className="meter-bar" /></span>
      </div>
    </section>
  );
}
