import { useNavigate } from 'react-router-dom';
import { PRODUCTS, yen } from '../data.js';
import { useStore } from '../store.jsx';
import Thumb from './Thumb.jsx';

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, setQty, totals, thumbs, settings } = useStore();
  const nav = useNavigate();
  const items = cart.map(ci => ({ ...PRODUCTS.find(p => p.id === ci.id), qty: ci.qty })).filter(i => i.id);
  return (
    <>
      <div className="backdrop" onClick={() => setCartOpen(false)} style={{ opacity: cartOpen ? 1 : 0, pointerEvents: cartOpen ? 'auto' : 'none' }} />
      <aside className="drawer" style={{ transform: cartOpen ? 'translateX(0)' : 'translateX(105%)' }} aria-hidden={!cartOpen}>
        <div className="drawer-head">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span className="display" style={{ fontSize: 24 }}>Cart</span>
            {settings.japanese && <span className="muted" style={{ fontSize: 13 }}>買い物かご</span>}
          </div>
          <button className="icon-btn" onClick={() => setCartOpen(false)} aria-label="Close cart">×</button>
        </div>
        <div className="drawer-body">
          {items.length === 0 && (
            <div style={{ margin: 'auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8, padding: '40px 0' }}>
              <span className="eyebrow" style={{ color: 'var(--dim)' }}>EMPTY</span>
              <span className="muted">Nothing in the cart yet.</span>
            </div>
          )}
          {items.map(it => (
            <div key={it.id} style={{ display: 'flex', gap: 14, padding: '16px 0', borderBottom: '1px solid rgba(241,236,226,.08)' }}>
              <Thumb src={thumbs[it.id]} w={72} h={72} />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{it.name}</span>
                <span className="muted" style={{ fontSize: 12 }}>{it.from} · Rank {it.grade}</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 4 }}>
                  <div className="qty">
                    <button onClick={() => setQty(it.id, -1)} aria-label="Remove one">−</button>
                    <span className="led" style={{ minWidth: 22, textAlign: 'center', fontSize: 14 }}>{it.qty}</span>
                    <button onClick={() => setQty(it.id, 1)} aria-label="Add one">+</button>
                  </div>
                  <span className="price-led" style={{ fontSize: 17 }}>{yen(it.price * it.qty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="drawer-foot">
          <div className="r"><span>Subtotal</span><span className="led" style={{ color: 'var(--paper)' }}>{yen(totals.subtotal)}</span></div>
          <div className="r"><span>Shipping</span><span className="led" style={{ color: 'var(--paper)' }}>{totals.subtotal === 0 ? '—' : totals.ship === 0 ? 'Free' : yen(totals.ship)}</span></div>
          <div className="r" style={{ color: 'var(--paper)', fontWeight: 700, fontSize: 16, alignItems: 'baseline' }}><span>Total</span><span className="price-led" style={{ fontSize: 24, fontWeight: 400 }}>{yen(totals.total)}</span></div>
          <button className="btn btn-pink" style={{ marginTop: 8, height: 52 }} onClick={() => { setCartOpen(false); nav('/checkout'); }}>Checkout · 券売機へ</button>
        </div>
      </aside>
    </>
  );
}
