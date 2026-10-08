import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { gsap } from 'gsap';
import { useStore } from '../store.jsx';

const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement;
const fsEnabled = () => typeof document !== 'undefined' && !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
const toggleFullscreen = () => {
  const el = document.documentElement;
  if (fsElement()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  else (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
};

const TICKER = ['本日営業 OPEN TONIGHT 18:00–04:00', '全品動作確認済 EVERY ITEM BENCH-TESTED', '送料無料 FREE SHIPPING OVER ¥10,000', 'NEW STOCK FROM AKIHABARA & NAKANO'];

export default function Header() {
  const { cart, setCartOpen, badgeRef, settingsRef } = useStore();
  const track = useRef(null), logo = useRef(null), bar = useRef(null);
  const count = cart.reduce((s, c) => s + c.qty, 0);
  const [isFs, setIsFs] = useState(() => !!fsElement());

  // Full-height views (street, departments) size themselves from the real header height, which grows on narrow screens.
  useEffect(() => {
    const el = bar.current, root = document.documentElement;
    const ro = new ResizeObserver(() => root.style.setProperty('--header-h', el.offsetHeight + 'px'));
    ro.observe(el);
    return () => { ro.disconnect(); root.style.removeProperty('--header-h'); };
  }, []);

  useEffect(() => {
    const sync = () => setIsFs(!!fsElement());
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    return () => { document.removeEventListener('fullscreenchange', sync); document.removeEventListener('webkitfullscreenchange', sync); };
  }, []);

  useEffect(() => {
    const tw = gsap.to(track.current, { xPercent: -50, duration: 45, ease: 'none', repeat: -1 });
    let t;
    const flick = () => {
      const fl = settingsRef.current.flicker ?? .5;
      if (logo.current && fl > 0) gsap.timeline().to(logo.current, { opacity: .2, duration: .04 }).to(logo.current, { opacity: 1, duration: .05 }).to(logo.current, { opacity: .35, duration: .05 }).to(logo.current, { opacity: 1, duration: .1 });
      t = setTimeout(flick, (1 - fl * .7) * (2500 + Math.random() * 4500));
    };
    t = setTimeout(flick, 1800);
    return () => { tw.kill(); clearTimeout(t); };
  }, [settingsRef]);

  const half = <span>{TICKER.map(s => [<span key={s}>{s}</span>, <span key={s + 'd'}>◆</span>])}</span>;
  return (
    <header ref={bar} className="header">
      <div className="ticker">
        <div ref={track} className="ticker-track">{half}{half}</div>
        <div className="ticker-dots" />
      </div>
      <nav className="nav">
        <Link to="/" className="logo"><span ref={logo} className="logo-jp">路地電気</span><span className="logo-en">ROJI DENKI</span></Link>
        <div className="nav-links">
          <Link to="/shop#arrivals" className="nav-arrivals">Arrivals</Link>
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/map">Map</NavLink>
          {fsEnabled() && (
            <button className="fs-btn" onClick={toggleFullscreen} aria-pressed={isFs} aria-label={isFs ? 'Exit full screen' : 'Enter full screen'} title={isFs ? 'Exit full screen' : 'Full screen'}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {isFs
                  ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
                  : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
              </svg>
            </button>
          )}
          <button className="cart-btn" onClick={() => setCartOpen(true)}>Cart<span ref={badgeRef} className="cart-count">{count}</span></button>
        </div>
      </nav>
    </header>
  );
}
