import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Diorama from '../scenes/diorama.js';
import { DISTRICTS, PRODUCTS, SHOP_BLURBS } from '../data.js';
import { useStore } from '../store.jsx';
import { showTip } from '../util.js';

const HINTS = { shop: 'CLICK · BROWSE', district: 'CLICK · STORY', building: 'CLICK · FLY IN', roji: 'CLICK · ABOUT' };
const CHIPS = [{ key: 'roji', en: 'Roji Denki', jp: '本店' }, ...['akihabara', 'ueno', 'asakusa', 'koenji', 'kichijoji', 'shimokita', 'nakano'].map(k => ({ key: k, en: DISTRICTS[k].en, jp: DISTRICTS[k].jp }))];

export default function MapPage() {
  const nav = useNavigate();
  const { settings, settingsRef, fontsReady } = useStore();
  const stage = useRef(null), tip = useRef(null), scene = useRef(null);
  const [sel, setSel] = useState(null);

  useEffect(() => {
    if (!fontsReady || !stage.current) return;
    scene.current = Diorama.diorama(stage.current, {
      opts: () => settingsRef.current,
      onHover: (i, x, y) => showTip(tip.current, i && i.en, i && i.jp, i ? HINTS[i.type] : '', x, y),
      onSelect: i => setSel(i)
    });
    return () => { scene.current.destroy(); scene.current = null; };
  }, [fontsReady, settingsRef]);

  let panel = null;
  if (sel) {
    if (sel.type === 'district') {
      const d = DISTRICTS[sel.key], n = PRODUCTS.filter(p => p.from === d.from).length;
      panel = { eyebrow: 'DISTRICT · 仕入れ先', en: d.en, jp: d.jp, body: d.body, count: n > 0 ? `${n} ITEM${n === 1 ? '' : 'S'} ON THE SHELVES FROM HERE` : null };
    } else if (sel.type === 'shop') {
      panel = { eyebrow: 'SHOP IN THE ALLEY · 専門店', en: sel.en, jp: sel.jp, body: SHOP_BLURBS[sel.cat], count: `${PRODUCTS.filter(p => p.cat === sel.cat).length} ITEMS`, action: ['Step inside →', () => nav(`/dept/${sel.cat}`)] };
    } else if (sel.type === 'roji') {
      panel = { eyebrow: '本店 · OUR SHOP', en: 'Roji Denki', jp: '路地電気', body: 'Repair counter and shop at the end of the alley. Open 18:00–04:00, closed Tuesdays.', action: ['Shop the shelves →', () => nav('/shop')] };
    } else panel = { eyebrow: 'ON THE STREET', en: sel.en, jp: sel.jp, body: 'Part of the street. Nothing for sale here.' };
  }

  return (
    <section className="container" style={{ maxWidth: 1440, paddingBlock: '28px 96px' }}>
      <div className="section-head" style={{ margin: '8px 0 28px', gap: '16px 48px' }}>
        <div>
          <span className="eyebrow amber">ABOUT · 路地マップ</span>
          <h1 data-glitch className="title">The alley, from above</h1>
        </div>
        <p className="lede" style={{ maxWidth: 520 }}>Roji Denki is a repair counter and shop at the end of a back alley in Nakano. We buy electronics from closing shops and estate clearances across Tokyo, fix them on the bench, and sell them here and online.</p>
      </div>
      <div className="map-stage">
        <div ref={stage} className="stage" />
        <div className="scanlines" style={{ opacity: .5 }} />
        <div className="legend">
          <span><i style={{ background: 'var(--amber)' }} />Districts we buy from</span>
          <span><i style={{ background: 'var(--pink)', borderRadius: 2 }} />Shops in the alley</span>
          <span className="muted">Drag to rotate · click to fly in</span>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ position: 'absolute', right: 16, top: 16 }} onClick={() => { setSel(null); scene.current?.reset(); }}>Reset view · 全体</button>
        <div ref={tip} className="tip"><b /><small /><em /></div>
        {panel && (
          <div className="map-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span className="eyebrow amber" style={{ fontSize: 12 }}>{panel.eyebrow}</span>
              <button className="icon-btn" style={{ width: 32, height: 32, fontSize: 16 }} onClick={() => setSel(null)} aria-label="Close">×</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px 12px' }}><span className="display" style={{ fontSize: 26, lineHeight: 1.1 }}>{panel.en}</span><span className="muted" style={{ fontSize: 14 }}>{panel.jp}</span></div>
            <p className="lede" style={{ fontSize: 15, lineHeight: 1.6 }}>{panel.body}</p>
            {panel.count && <span className="eyebrow cyan">{panel.count}</span>}
            {panel.action && <button className="btn btn-pink btn-sm" style={{ alignSelf: 'flex-start', marginTop: 4, height: 44, padding: '0 20px', fontSize: 14 }} onClick={panel.action[1]}>{panel.action[0]}</button>}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 20 }}>
        <span className="eyebrow" style={{ fontSize: 12, color: 'var(--dim)', marginRight: 6 }}>JUMP TO</span>
        {CHIPS.map(c => <button key={c.key} className="chip" onClick={() => scene.current?.focus(c.key)}>{c.en}{settings.japanese && <small>{c.jp}</small>}</button>)}
      </div>
    </section>
  );
}
