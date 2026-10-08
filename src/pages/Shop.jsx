import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { CATEGORIES, PRODUCTS, STATUS_COLORS, yen } from '../data.js';
import { useStore } from '../store.jsx';
import { useBoard } from '../useBoard.js';
import Thumb from '../components/Thumb.jsx';

const Flaps = ({ text, n, amber }) => (
  <span className={'flaps' + (amber ? ' amber' : '')} style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
    {[...text].map((c, i) => <span key={i} className="flap">{c === ' ' ? '\u00a0' : c}</span>)}
  </span>
);

export default function Shop() {
  const { settings, add, thumbs } = useStore();
  const jp = settings.japanese;
  const board = useBoard();
  const [params, setParams] = useSearchParams();
  const { hash } = useLocation();
  const nav = useNavigate();
  const cat = params.get('cat') || 'all';
  const grid = useRef(null), first = useRef(true);
  const products = PRODUCTS.filter(p => cat === 'all' || p.cat === cat);

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) requestAnimationFrame(() => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90 }));
  }, [hash]);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (grid.current) gsap.fromTo(grid.current.children, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .45, stagger: .045, ease: 'power2.out', clearProps: 'opacity,transform' });
  }, [cat]);

  const catName = CATEGORIES.find(c => c.key === cat)?.en || 'All';
  return (
    <>
      <section id="arrivals" className="container section">
        <div className="section-head">
          <div>
            <span className="eyebrow cyan">TERMINAL 3-CHOME</span>
            <h2 data-glitch className="title">Today's arrivals{jp && <span className="jp-sub">本日入荷</span>}</h2>
          </div>
          <p className="muted" style={{ margin: 0, maxWidth: 340, fontSize: 15, lineHeight: 1.6 }}>The board updates as stock comes off the bench. Newest at the top.</p>
        </div>
        <div className="board">
          <div className="board-row board-head">
            <span>TIME 時刻</span><span>ITEM 品名</span><span>FROM 入荷元</span><span style={{ textAlign: 'right' }}>PRICE 価格</span><span>STATUS</span>
          </div>
          {board.map((r, i) => (
            <div key={i} className="board-row">
              <Flaps text={r.time} n={5} amber />
              <Flaps text={r.item} n={16} />
              <Flaps text={r.from} n={10} />
              <Flaps text={r.price} n={8} amber />
              <span className="board-status">
                <b style={{ color: STATUS_COLORS[r.status] || '#77716b', textShadow: `0 0 10px ${STATUS_COLORS[r.status] || 'transparent'}` }}>{r.status}</b>
                {jp && <small>{r.jp}</small>}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section id="shop" className="container section" style={{ paddingBottom: 'clamp(64px,8vw,104px)' }}>
        <div className="section-head" style={{ marginBottom: 32 }}>
          <div>
            <span className="eyebrow pink">INSIDE THE SHOP</span>
            <h2 data-glitch className="title">The shelves{jp && <span className="jp-sub">店内</span>}</h2>
          </div>
          <span className="eyebrow muted" style={{ fontSize: 14 }}>{String(products.length).padStart(2, '0')} ITEMS · {catName.toUpperCase()}</span>
        </div>
        <div className="shelves">
          <aside className="vending" aria-label="Categories">
            <div className="vending-head"><span className="display" style={{ fontSize: 19 }}>自販機</span><span className="led" style={{ fontSize: 12, letterSpacing: '.14em' }}>PICK A CATEGORY</span></div>
            <div className="vending-glass">
              {CATEGORIES.map(c => {
                const on = c.key === cat, n = c.key === 'all' ? PRODUCTS.length : PRODUCTS.filter(p => p.cat === c.key).length;
                return (
                  <button key={c.key} className="slot" aria-pressed={on} onClick={() => setParams(c.key === 'all' ? {} : { cat: c.key }, { replace: true })}>
                    <span className="can" style={{ background: c.can, opacity: on ? 1 : .5, boxShadow: on ? `0 0 0 2px #f1ece2, 0 0 24px ${c.can}` : 'none' }} />
                    <span className="label">{c.en}{jp && <small>{c.jp}</small>}</span>
                    <span className="price">{String(n).padStart(2, '0')} ITEMS<span className="lamp" style={{ background: on ? '#ff3b2f' : '#3a2b2e', boxShadow: on ? '0 0 8px #ff3b2f' : 'none' }} /></span>
                  </button>
                );
              })}
            </div>
            <div className="vending-foot">
              <div className="out">取出口 · TAKE OUT</div>
              <div style={{ width: 48, height: 48, borderRadius: 6, background: '#d6d0c4', display: 'grid', placeItems: 'center' }}><span style={{ width: 4, height: 24, borderRadius: 2, background: '#26252a' }} /></div>
            </div>
          </aside>
          <div ref={grid} className="product-grid">
            {products.map(p => (
              <article key={p.id} className="card card-hover pcard" onClick={() => nav(`/product/${p.id}`)}>
                <Thumb src={thumbs[p.id]}>
                  {!thumbs[p.id] && <span className="ph">product shot · {p.ph}</span>}
                  <span className="badge-rank">RANK {p.grade}</span>
                </Thumb>
                <div className="pcard-body">
                  <div className="pcard-meta"><span>{p.from}</span>{jp && <span>{p.jp}</span>}</div>
                  <h3>{p.name}</h3>
                  <div className="pcard-foot">
                    <span className="price-led" style={{ fontSize: 21 }}>{yen(p.price)}</span>
                    <button className="btn btn-paper" onClick={e => { e.stopPropagation(); add(p.id); }}>Add to cart</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
