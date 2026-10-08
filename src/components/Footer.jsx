import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer" id="visit">
      <div className="container footer-grid">
        <div className="footer-col">
          <span className="footer-logo">路地電気</span>
          <span className="led muted" style={{ fontSize: 14, letterSpacing: '.24em' }}>ROJI DENKI</span>
        </div>
        <div className="footer-col">
          <span className="eyebrow cyan">VISIT</span>
          <span>3-2-1 Back Alley, Nakano, Tokyo</span>
          <span className="muted">Under the Chūō line tracks, third door past the ramen stall.</span>
          <span className="muted">Open 18:00–04:00 · Closed Tuesdays</span>
          <Link to="/map">See the alley map →</Link>
        </div>
        <form className="footer-col" onSubmit={e => e.preventDefault()}>
          <span className="eyebrow amber">NEW STOCK ALERTS</span>
          <span className="muted">One email when a batch comes off the bench.</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="footer-input" type="email" placeholder="you@example.com" aria-label="Email address" />
            <button className="btn btn-sm" style={{ height: 46, background: 'var(--cyan)', color: 'var(--ink)' }}>Notify me</button>
          </div>
        </form>
      </div>
      <div className="container footer-bottom">
        <span>© Roji Denki</span>
        <span style={{ display: 'flex', gap: 20 }}><Link to="/shop">Shipping</Link><Link to="/shop">Returns</Link><Link to="/map">Contact</Link></span>
      </div>
    </footer>
  );
}
