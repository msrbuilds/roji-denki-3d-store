import { useEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { StoreProvider, useStore } from './store.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Settings from './components/Settings.jsx';
import Street from './pages/Street.jsx';
import Shop from './pages/Shop.jsx';
import Dept from './pages/Dept.jsx';
import Product from './pages/Product.jsx';
import Checkout from './pages/Checkout.jsx';
import MapPage from './pages/MapPage.jsx';

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

function Shell() {
  const { settings } = useStore();
  const { pathname, hash } = useLocation();
  const cyber = settings.theme === 'cyberpunk';
  const glitchRef = useRef(null);
  const cyberRef = useRef(cyber);
  cyberRef.current = cyber;

  useEffect(() => { if (!hash) window.scrollTo({ top: 0 }); }, [pathname, hash]);

  // Cyberpunk theme: random RGB-split glitches on headings + a scan bar.
  useEffect(() => {
    let timer;
    const tick = () => {
      if (cyberRef.current) {
        const els = [...document.querySelectorAll('[data-glitch]')].filter(e => {
          const r = e.getBoundingClientRect();
          return e.offsetParent && r.bottom > 0 && r.top < innerHeight && getComputedStyle(e.parentElement).opacity !== '0';
        });
        const e = els[(Math.random() * els.length) | 0];
        if (e) {
          const ts = e.style.textShadow;
          gsap.timeline()
            .to(e, { x: -5, skewX: 10, textShadow: '4px 0 #ff2a6d, -4px 0 #05d9e8', duration: .05 })
            .to(e, { x: 4, skewX: -6, duration: .05 })
            .to(e, { x: 0, skewX: 0, duration: .07, clearProps: 'transform', onComplete: () => { e.style.textShadow = ts; } });
        }
        if (glitchRef.current) gsap.fromTo(glitchRef.current, { top: Math.random() * innerHeight, height: 4 + Math.random() * 36, opacity: .9, x: -30 }, { x: 30, opacity: 0, duration: .28, ease: 'steps(3)' });
      }
      timer = setTimeout(tick, 1100 + Math.random() * 2600);
    };
    timer = setTimeout(tick, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {cyber && <><div className="cyber-overlay" /><div ref={glitchRef} className="glitch-bar" /></>}
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Street />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/dept/:key" element={<Dept />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="*" element={<Street />} />
        </Routes>
      </main>
      {pathname !== '/' && <Footer />}
      <CartDrawer />
      <Settings />
    </>
  );
}
