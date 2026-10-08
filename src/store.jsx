import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { PRODUCTS } from './data.js';
import Scenes from './scenes/street.js';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

const DEFAULTS = { theme: 'akihabara', rain: true, flicker: 0.5, autoWalk: false, japanese: true };
const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };

export function totalsFor(cart) {
  const subtotal = cart.reduce((s, ci) => s + (PRODUCTS.find(p => p.id === ci.id)?.price || 0) * ci.qty, 0);
  const ship = subtotal === 0 || subtotal >= 10000 ? 0 : 800;
  return { subtotal, ship, total: subtotal + ship };
}

const FONT_SAMPLES = [
  ['64px "Dela Gothic One"', '電気カラオケラーメン薬酒場喫茶質屋ゲーム中古修理焼鳥営業中路地電脳未来回収音響テレビカメラ電話止まれ居酒屋酒処つめた〜い買取おすすめ拉麺中華薬局たばこコインランドリー理容歯科占い麻雀専門店ROJI'],
  ['32px "DotGothic16"', 'OPEN 24H ¥0123456789 秋葉原上野浅草高円寺吉祥寺下北沢中野本店中央線高架取扱注意'],
  ['20px "Zen Kaku Gothic New"', 'Abc']
];

export function StoreProvider({ children }) {
  const [settings, setSettings] = useState(() => ({ ...DEFAULTS, ...read('roji-settings', {}) }));
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  useEffect(() => { localStorage.setItem('roji-settings', JSON.stringify(settings)); }, [settings]);

  const [cart, setCart] = useState(() => read('roji-cart', []));
  useEffect(() => { localStorage.setItem('roji-cart', JSON.stringify(cart)); }, [cart]);
  const [cartOpen, setCartOpen] = useState(false);

  const [fontsReady, setFontsReady] = useState(false);
  const [thumbs, setThumbs] = useState({});
  const walkRef = useRef(0);
  const badgeRef = useRef(null);

  useEffect(() => {
    Promise.all(FONT_SAMPLES.map(([f, t]) => document.fonts.load(f, t))).catch(() => {}).finally(() => setFontsReady(true));
  }, []);
  useEffect(() => {
    if (!fontsReady) return;
    const t = setTimeout(() => {
      try { setThumbs(Scenes.thumbnails(PRODUCTS.map(p => ({ id: p.id, model: p.model })))); }
      catch (e) { console.warn('thumbnails', e); }
    }, 200);
    return () => clearTimeout(t);
  }, [fontsReady]);

  const add = useCallback(id => {
    setCart(c => c.find(x => x.id === id) ? c.map(x => x.id === id ? { ...x, qty: x.qty + 1 } : x) : [...c, { id, qty: 1 }]);
    setCartOpen(true);
    if (badgeRef.current) gsap.fromTo(badgeRef.current, { scale: 1.7 }, { scale: 1, duration: .5, ease: 'back.out(3)' });
  }, []);
  const setQty = useCallback((id, d) => setCart(c => c.map(x => x.id === id ? { ...x, qty: x.qty + d } : x).filter(x => x.qty > 0)), []);
  const ensureInCart = useCallback(id => setCart(c => c.find(x => x.id === id) ? c : [...c, { id, qty: 1 }]), []);
  const clearCart = useCallback(() => setCart([]), []);
  const setSetting = useCallback((k, v) => setSettings(s => ({ ...s, [k]: v })), []);

  const value = useMemo(() => ({
    settings, settingsRef, setSetting,
    cart, add, setQty, ensureInCart, clearCart, totals: totalsFor(cart),
    cartOpen, setCartOpen, badgeRef,
    fontsReady, thumbs, walkRef
  }), [settings, setSetting, cart, add, setQty, ensureInCart, clearCart, cartOpen, fontsReady, thumbs]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
