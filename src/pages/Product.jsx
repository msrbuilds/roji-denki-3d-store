import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Scenes from '../scenes/street.js';
import { CATEGORIES, CONDITION, DEPTS, PRODUCTS, yen } from '../data.js';
import { useStore } from '../store.jsx';
import Thumb from '../components/Thumb.jsx';

export default function Product() {
  const { id } = useParams();
  const { state } = useLocation();
  const nav = useNavigate();
  const { settings, settingsRef, fontsReady, thumbs, add, ensureInCart } = useStore();
  const p = PRODUCTS.find(x => x.id === id) || PRODUCTS[0];
  const from = state?.from && DEPTS.find(d => d.key === state.from);
  const cIdx = CATEGORIES.findIndex(c => c.key === p.cat);
  const stage = useRef(null), scene = useRef(null);
  const jp = settings.japanese;

  useEffect(() => {
    if (!fontsReady || !stage.current) return;
    scene.current = Scenes.turntable(stage.current, { opts: () => settingsRef.current });
    scene.current.setModel(p.model);
    return () => { scene.current.destroy(); scene.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsReady]);
  useEffect(() => { scene.current && scene.current.setModel(p.model); }, [p.model]);

  const related = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).concat(PRODUCTS.filter(x => x.cat !== p.cat && x.id !== p.id)).slice(0, 3);
  return (
    <section className="container pdp">
      <button className="link-back" onClick={() => from ? nav(`/dept/${from.key}`) : nav('/shop#shop')}>{from ? `← Back to the ${from.en} shop` : '← Back to the shelves'}</button>
      <div className="pdp-main">
        <div className="pdp-stage">
          <div ref={stage} className="stage" />
          <div className="scanlines" style={{ opacity: .5 }} />
          <span className="corner cyan" style={{ top: 16, left: 16, fontSize: 13 }}>SHELF {String(cIdx).padStart(2, '0')} · {CATEGORIES[cIdx].en.toUpperCase()}</span>
          <span className="corner muted" style={{ bottom: 16, left: 16 }}>DRAG TO ROTATE ↔</span>
          <span className="corner" style={{ bottom: 16, right: 16, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 11, letterSpacing: 0, color: 'var(--dim)' }}>low-poly stand-in model</span>
        </div>
        <div className="pdp-info">
          <div className="muted" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', fontSize: 13 }}><span>From {p.from}</span>{jp && <span>{p.jp}</span>}</div>
          <h1 data-glitch>{p.name}</h1>
          <p className="lede">{p.desc}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 18px' }}>
            <span className="price-led" style={{ fontSize: 38, textShadow: '0 0 14px oklch(0.75 0.16 75 / .5)' }}>{yen(p.price)}</span>
            <span className="badge-rank" style={{ fontSize: 13 }}>RANK {p.grade}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <button className="btn btn-pink" style={{ height: 52, padding: '0 28px' }} onClick={() => add(p.id)}>Add to cart</button>
            <button className="btn btn-ghost" style={{ height: 52, padding: '0 28px' }} onClick={() => { ensureInCart(p.id); nav('/checkout'); }}>Buy now · 券売機へ</button>
          </div>
          <div className="card notes">
            <span className="eyebrow amber">BENCH NOTES · 作業記録</span>
            {p.notes.map(n => <div key={n} className="note">{n}</div>)}
          </div>
          <dl className="specs">
            <dt>Year</dt><dd>c. {p.year}</dd>
            <dt>Condition</dt><dd>Rank {p.grade} · {CONDITION[p.grade]}</dd>
            <dt>In the box</dt><dd>{p.includes}</dd>
            <dt>Ships from</dt><dd>Nakano, Tokyo · 3–5 days</dd>
          </dl>
        </div>
      </div>
      <div className="related">
        <h2 className="display" style={{ margin: 0, display: 'flex', alignItems: 'baseline', gap: 14, fontSize: 28 }}>Nearby on the shelf{jp && <span className="muted" style={{ fontSize: 14, fontFamily: 'var(--body)' }}>近くの棚</span>}</h2>
        <div className="related-grid">
          {related.map(r => (
            <article key={r.id} className="card card-hover rcard" onClick={() => nav(`/product/${r.id}`, { state })}>
              <Thumb src={thumbs[r.id]} w={84} h={84} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{r.name}</span>
                <span className="price-led" style={{ fontSize: 17 }}>{yen(r.price)}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
