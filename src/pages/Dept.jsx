import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Scenes from '../scenes/street.js';
import { DEPTS, PRODUCTS, yen } from '../data.js';
import { useStore } from '../store.jsx';
import { showTip } from '../util.js';
import Thumb from '../components/Thumb.jsx';

export default function Dept() {
  const { key } = useParams();
  const nav = useNavigate();
  const { settings, settingsRef, fontsReady, thumbs } = useStore();
  const d = DEPTS.find(x => x.key === key) || DEPTS[0];
  const idx = DEPTS.indexOf(d);
  const stage = useRef(null), tip = useRef(null);
  const items = PRODUCTS.filter(p => p.cat === d.key);

  useEffect(() => {
    if (!fontsReady || !stage.current) return;
    const scene = Scenes.interior(stage.current, {
      dept: d,
      products: items.map(p => ({ id: p.id, name: p.name, priceFmt: yen(p.price), grade: p.grade, model: p.model })),
      opts: () => settingsRef.current,
      onHover: (i, x, y) => showTip(tip.current, i && i.name, i && i.priceFmt, 'CLICK · LOOK CLOSER', x, y),
      onPick: id => nav(`/product/${id}`, { state: { from: d.key } })
    });
    return () => scene.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsReady, d.key]);

  return (
    <section className="dept" aria-label={`${d.en} department`}>
      <div ref={stage} className="stage" />
      <div className="scanlines" style={{ opacity: .35 }} />
      <div className="dept-fade" />
      <div className="dept-info">
        <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => nav('/')}>← Back to the street</button>
        <span className="eyebrow" style={{ color: d.col, textShadow: `0 0 10px ${d.col}` }}>DEPT {String(idx + 1).padStart(2, '0')} · 専門店</span>
        <h1 data-glitch>{d.en}{settings.japanese && <span style={{ fontSize: '.45em', color: 'var(--soft)' }}>{d.jp}</span>}</h1>
        <p className="lede" style={{ fontSize: 15 }}>{d.blurb}</p>
      </div>
      <div ref={tip} className="tip" style={{ borderColor: 'var(--amber)' }}><b /><small className="price-led" style={{ fontSize: 15 }} /><em /></div>
      <div className="dept-list">
        <span className="eyebrow muted" style={{ fontSize: 12 }}>ON THESE SHELVES · 陳列中</span>
        {items.map(p => (
          <button key={p.id} className="dept-item" onClick={() => nav(`/product/${p.id}`, { state: { from: d.key } })}>
            <Thumb src={thumbs[p.id]} w={48} h={36} />
            <span className="t">{p.name}<span className="price-led" style={{ fontSize: 15, fontWeight: 400 }}>{yen(p.price)}</span></span>
          </button>
        ))}
      </div>
      <div className="dept-bottom">
        <span className="led" style={{ fontSize: 12, letterSpacing: '.16em', color: 'var(--soft)', textShadow: '0 1px 6px #000' }}>HOVER A SHELF ITEM · CLICK TO LOOK CLOSER</span>
        <div className="dept-tabs">
          {DEPTS.map(x => {
            const on = x.key === d.key;
            return <button key={x.key} className="dept-tab" onClick={() => nav(`/dept/${x.key}`)} style={on ? { background: x.col, color: 'var(--ink)', borderColor: x.col } : undefined}>{x.en}</button>;
          })}
        </div>
      </div>
    </section>
  );
}
