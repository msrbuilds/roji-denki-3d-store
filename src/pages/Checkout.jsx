import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { PAY_METHODS, PRODUCTS, QR_CELLS, yen } from '../data.js';
import { useStore } from '../store.jsx';
import { hhmm } from '../util.js';

const STATUS = { review: '確認中 · REVIEW', pay: '支払 · PAYMENT', paying: '投入 · WAITING', printing: '印刷中 · PRINTING', done: 'ありがとう · THANK YOU' };
const METHOD_LABEL = { cash: '現金 CASH', ic: 'IC TRANSIT CARD', card: 'クレジット CREDIT CARD', qr: 'QR PAY' };
const METHOD_RECEIPT = { cash: 'CASH', ic: 'TRANSIT IC', card: 'CREDIT CARD', qr: 'QR PAY' };
const COINS = [[100, '¥100', '50%', 44, '#c7c7cc'], [500, '¥500', '50%', 44, '#d9c27a'], [1000, '¥1,000', '4px', 70, '#b9cbe0'], [5000, '¥5,000', '4px', 70, '#d8c3dc'], [10000, '¥10,000', '4px', 76, '#d7cfae']];

function downloadReceipt(rc) {
  const rows = [['路地電気 ROJI DENKI', '', 2], ['3-2-1 Back Alley, Nakano, Tokyo', '', 0], [rc.date, '', 0], ['ORDER No.', rc.orderNo], ['-'],
    ...rc.lines.map(l => [l.name + ' ×' + l.qty, l.lineFmt]), ['-'], ['SUBTOTAL', rc.subtotalFmt], ['SHIPPING', rc.shipFmt], ['TOTAL', rc.totalFmt, 1], ['PAID BY', rc.method],
    ...(rc.isCash ? [['INSERTED', rc.insertedFmt], ['CHANGE', rc.changeFmt]] : []), ['-']];
  const W = 600, lh = 38, H = rows.length * lh + 260;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, W, H); g.fillStyle = '#1a1a1a'; g.strokeStyle = '#1a1a1a';
  rows.forEach((r, i) => {
    const y = 70 + i * lh;
    if (r[0] === '-') { g.setLineDash([6, 6]); g.beginPath(); g.moveTo(40, y - 10); g.lineTo(W - 40, y - 10); g.stroke(); g.setLineDash([]); return; }
    g.font = (r[2] === 2 ? '34px' : r[2] === 1 ? '30px' : '22px') + ' "DotGothic16", monospace';
    if (r[2] === 2 || (r[2] === 0 && !r[1])) { g.textAlign = 'center'; g.fillText(r[0], W / 2, y); return; }
    g.textAlign = 'left'; g.fillText(r[0], 40, y); g.textAlign = 'right'; g.fillText(r[1] || '', W - 40, y);
  });
  let x = 40; const by = H - 170;
  while (x < W - 40) { const w = 1 + Math.floor(Math.random() * 4); g.fillRect(x, by, w, 70); x += w + 1 + Math.floor(Math.random() * 4); }
  g.textAlign = 'center'; g.font = '24px "DotGothic16", monospace'; g.fillText('またお越しください · COME BACK SOON', W / 2, H - 50);
  const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = `roji-denki-${rc.orderNo}.png`; document.body.appendChild(a); a.click(); a.remove();
}

export default function Checkout() {
  const { cart, totals, clearCart } = useStore();
  const nav = useNavigate();
  const [step, setStep] = useState('review');
  const [method, setMethod] = useState(null);
  const [inserted, setInserted] = useState(0);
  const [pin, setPin] = useState(0);
  const [icLit, setIcLit] = useState(false);
  const [qrScanned, setQrScanned] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const busy = useRef(false), timers = useRef([]);
  const coinRef = useRef(null), icRef = useRef(null), ccRef = useRef(null), receiptRef = useRef(null);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const lines = cart.map(ci => { const p = PRODUCTS.find(x => x.id === ci.id); return p && { id: p.id, name: p.name, qty: ci.qty, lineFmt: yen(p.price * ci.qty) }; }).filter(Boolean);
  const empty = lines.length === 0 && !receipt;
  const payActive = (step === 'pay' || step === 'paying') && !empty;
  const paying = step === 'paying';

  const complete = (ins) => {
    const d = new Date();
    const rc = {
      orderNo: 'RD-' + Math.floor(1000 + Math.random() * 9000),
      date: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}  ${hhmm(d)}`,
      lines, subtotalFmt: yen(totals.subtotal), shipFmt: totals.ship ? yen(totals.ship) : 'FREE', totalFmt: yen(totals.total),
      method: METHOD_RECEIPT[method], isCash: method === 'cash', insertedFmt: yen(ins ?? inserted), changeFmt: yen(Math.max(0, (ins ?? inserted) - totals.total))
    };
    setReceipt(rc); setStep('printing'); clearCart();
  };
  // Animate the paper out of the slot once the receipt is rendered.
  useEffect(() => {
    if (step !== 'printing' || !receiptRef.current) return;
    const el = receiptRef.current, h = el.firstElementChild?.scrollHeight || 0;
    const finish = () => { el.style.height = h + 'px'; busy.current = false; setStep('done'); };
    const fb = setTimeout(finish, 3000);
    gsap.fromTo(el, { height: 0 }, { height: h, duration: 2.4, ease: 'steps(16)', onComplete: () => { clearTimeout(fb); finish(); } });
    return () => clearTimeout(fb);
  }, [step]);

  const select = k => { if (!payActive || busy.current) return; setMethod(k); setStep('paying'); setInserted(0); setPin(0); setIcLit(false); setQrScanned(false); };
  const insertCoin = v => {
    if (busy.current) return;
    const c = coinRef.current;
    if (c) {
      Object.assign(c.style, { borderRadius: v >= 1000 ? '3px' : '50%', width: v >= 1000 ? '46px' : '30px', background: v >= 1000 ? '#c9d6b4' : v === 500 ? '#d9c27a' : '#c7c7cc' });
      gsap.fromTo(c, { y: -30, opacity: 1, rotate: 0 }, { y: 18, opacity: 0, rotate: v >= 1000 ? 0 : 90, duration: .45, ease: 'power2.in' });
    }
    const ins = inserted + v; setInserted(ins);
    if (ins >= totals.total) { busy.current = true; later(() => complete(ins), 650); }
  };
  const tapIc = () => {
    if (busy.current) return; busy.current = true;
    if (icRef.current) gsap.timeline().to(icRef.current, { x: -70, y: -6, rotate: -10, duration: .35, ease: 'power2.out' }).to(icRef.current, { x: 0, y: 0, rotate: 0, duration: .35, delay: .45 });
    later(() => setIcLit(true), 350); later(() => complete(), 1300);
  };
  const insertCard = () => {
    if (busy.current) return; busy.current = true;
    if (ccRef.current) gsap.to(ccRef.current, { x: 120, opacity: 0, duration: .5, ease: 'power2.in' });
    [1, 2, 3, 4].forEach(n => later(() => setPin(n), 500 + n * 260));
    later(() => complete(), 500 + 4 * 260 + 450);
  };
  const scanQr = () => { if (busy.current) return; busy.current = true; setQrScanned(true); later(() => complete(), 900); };

  const ringCol = paying && method === 'ic' ? (icLit ? '#7cff6b' : '#2fd3e0') : '#4a4650';
  return (
    <section className="container" style={{ maxWidth: 1120, paddingBlock: '28px 96px' }}>
      <Link className="link-back" to="/shop">← Keep shopping</Link>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '8px 0 28px' }}>
        <span className="eyebrow pink">CHECKOUT · 券売機</span>
        <h1 data-glitch className="title">Buy your ticket</h1>
      </div>
      <div className="machine">
        <div className="marquee"><span>きっぷうりば · ROJI DENKI TICKETS</span><span className="amber" style={{ textShadow: '0 0 8px oklch(0.75 0.16 75)' }}>{empty ? 'カートが空 · EMPTY' : STATUS[step]}</span></div>
        <div className="machine-body">
          <div className="screen">
            <div className="screen-inner">
              {empty && (
                <div style={{ margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center', padding: '60px 0' }}>
                  <span className="led" style={{ fontSize: 22, letterSpacing: '.14em' }}>NO TICKETS SELECTED</span>
                  <span style={{ fontSize: 15, opacity: .75 }}>カートが空です · Your cart is empty.</span>
                  <button className="lcd-btn ghost" onClick={() => nav('/shop')}>Go to the shelves</button>
                </div>
              )}
              {!empty && step === 'review' && (<>
                <span className="step">1 · 確認 REVIEW ORDER</span>
                <div style={{ borderTop: '1px dashed rgba(159,245,227,.3)' }}>
                  {lines.map(l => <div key={l.id} className="line"><span>{l.name} × {l.qty}</span><span className="led">{l.lineFmt}</span></div>)}
                </div>
                <div className="led" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}><span>SHIPPING 送料</span><span>{totals.ship ? yen(totals.ship) : 'Free'}</span></div>
                <div className="led" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><span style={{ fontSize: 15 }}>TOTAL 合計</span><span style={{ fontSize: 32, textShadow: '0 0 12px rgba(159,245,227,.6)' }}>{yen(totals.total)}</span></div>
                <form style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }} onSubmit={e => { e.preventDefault(); setStep('pay'); }}>
                  <input className="lcd-input" placeholder="Name · お名前" autoComplete="name" />
                  <input className="lcd-input" placeholder="Email · メール" type="email" autoComplete="email" />
                  <input className="lcd-input" placeholder="Delivery address · 配送先" autoComplete="street-address" style={{ gridColumn: '1/-1' }} />
                  <button className="lcd-btn" style={{ justifySelf: 'start', marginTop: 6 }}>次へ · Choose payment →</button>
                </form>
              </>)}
              {!empty && step === 'pay' && (<>
                <span className="step">2 · 支払方法 CHOOSE PAYMENT</span>
                <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span className="led" style={{ fontSize: 15 }}>TOTAL 合計</span>
                  <span className="big">{yen(totals.total)}</span>
                  <span style={{ fontSize: 15, opacity: .8 }}>Press a payment button to continue.</span>
                </div>
                <button className="lcd-btn ghost" style={{ alignSelf: 'flex-start', height: 40 }} onClick={() => setStep('review')}>← Edit order</button>
              </>)}
              {paying && (<>
                <span className="step">3 · {METHOD_LABEL[method]}</span>
                {method === 'cash' && (
                  <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <span className="led" style={{ fontSize: 15 }}>投入金額 INSERTED</span>
                    <span className="big">{yen(inserted)}</span>
                    <span className="led" style={{ fontSize: 16, opacity: .8 }}>残り REMAINING {yen(Math.max(0, totals.total - inserted))}</span>
                    <span style={{ fontSize: 14, opacity: .7 }}>Use the coin and bill slot.</span>
                  </div>
                )}
                {method === 'ic' && (
                  <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <span className="led" style={{ fontSize: 'clamp(26px,3.4vw,40px)', lineHeight: 1.1 }}>{icLit ? 'ピッ · CARD READ' : 'カードをタッチ TOUCH CARD'}</span>
                    <span className="led" style={{ fontSize: 20 }}>{yen(totals.total)}</span>
                    <span style={{ fontSize: 14, opacity: .7 }}>Tap your transit card on the reader.</span>
                  </div>
                )}
                {method === 'card' && (
                  <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <span className="led" style={{ fontSize: 'clamp(26px,3.4vw,40px)', lineHeight: 1.1 }}>カードを挿入 INSERT CARD</span>
                    <div style={{ display: 'flex', gap: 14 }}>{[1, 2, 3, 4].map(i => <span key={i} style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid var(--lcd)', background: pin >= i ? 'var(--lcd)' : 'transparent', boxShadow: pin >= i ? '0 0 10px var(--lcd)' : 'none' }} />)}</div>
                    <span className="led" style={{ fontSize: 20 }}>{yen(totals.total)}</span>
                  </div>
                )}
                {method === 'qr' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24, margin: 'auto 0' }}>
                    <div style={{ padding: 12, border: '2px solid var(--lcd)', borderRadius: 6, boxShadow: '0 0 20px rgba(159,245,227,.35)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(21,7px)', gridAutoRows: '7px' }}>{QR_CELLS.map((v, i) => <span key={i} style={{ background: v ? 'var(--lcd)' : 'transparent' }} />)}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 160 }}>
                      <span className="led" style={{ fontSize: 24 }}>{qrScanned ? '確認 · CONFIRMED' : 'SCAN TO PAY'}</span>
                      <span className="led" style={{ fontSize: 20 }}>{yen(totals.total)}</span>
                      <button className="lcd-btn" style={{ alignSelf: 'flex-start' }} onClick={scanQr}>Simulate phone scan</button>
                    </div>
                  </div>
                )}
              </>)}
              {step === 'printing' && (
                <div style={{ margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
                  <span className="led" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>印刷中</span>
                  <span className="led" style={{ fontSize: 16, letterSpacing: '.16em' }}>PRINTING RECEIPT…</span>
                </div>
              )}
              {step === 'done' && receipt && (
                <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <span className="led" style={{ fontSize: 'clamp(28px,4vw,44px)', lineHeight: 1.1, textShadow: '0 0 16px rgba(159,245,227,.6)' }}>ありがとうございました</span>
                  <span style={{ fontSize: 16, lineHeight: 1.6 }}>Thank you. Order {receipt.orderNo} is on the bench and ships in 3–5 days.</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
                    <button className="lcd-btn" onClick={() => downloadReceipt(receipt)}>Download receipt</button>
                    <button className="lcd-btn ghost" onClick={() => nav('/')}>Back to the alley</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="pay-col">
            <span className="led" style={{ fontSize: 12, letterSpacing: '.16em', color: '#4a4640' }}>PAYMENT · お支払い</span>
            <div className="pay-grid">
              {PAY_METHODS.map(m => {
                const on = paying && method === m.key;
                return (
                  <button key={m.key} className="pay-btn" onClick={() => select(m.key)} disabled={!payActive}
                    style={{ background: on ? 'var(--pink)' : '#f6f3ec', opacity: payActive ? 1 : .45, cursor: payActive ? 'pointer' : 'default', boxShadow: on ? '0 0 26px oklch(0.75 0.16 355 / .7), inset 0 -4px 0 rgba(0,0,0,.15)' : 'inset 0 -4px 0 rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.15)' }}>
                    <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 8 }}>
                      <span className="jp">{m.jp}</span>
                      <span className="lamp" style={{ background: on ? '#ff3b2f' : payActive ? '#2fd3e0' : '#8d877f', boxShadow: `0 0 8px ${on ? '#ff3b2f' : payActive ? '#2fd3e0' : 'transparent'}` }} />
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{m.en}</span>
                  </button>
                );
              })}
            </div>
            <div className="hardware">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, letterSpacing: '.12em' }}>硬貨・紙幣 COINS &amp; BILLS</span>
                <span className="slot-line" style={{ position: 'relative', width: 110 }}><span ref={coinRef} style={{ position: 'absolute', left: '50%', top: -34, marginLeft: -15, width: 30, height: 30, borderRadius: '50%', background: '#d9c27a', opacity: 0 }} /></span>
              </div>
              {paying && method === 'cash' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {COINS.map(([v, label, radius, w, bg]) => <button key={v} className="coin" style={{ minWidth: w, borderRadius: radius, background: bg }} onClick={() => insertCoin(v)}>{label}</button>)}
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span className="ic-ring" style={{ border: `3px solid ${ringCol}`, boxShadow: `0 0 18px ${ringCol}` }}>IC</span>
                {paying && method === 'ic' && <button ref={icRef} className="pay-card" onClick={tapIc} style={{ background: 'linear-gradient(135deg,oklch(0.8 0.13 200),oklch(0.65 0.13 200))', color: '#061a19' }}>TRANSIT IC<span className="led" style={{ fontSize: 11 }}>TAP ON READER</span></button>}
                {paying && method === 'card' && <button ref={ccRef} className="pay-card" onClick={insertCard} style={{ background: 'linear-gradient(135deg,#2b2433,#4a3a5a)', color: 'var(--paper)' }}><span style={{ width: 22, height: 16, borderRadius: 3, background: '#d9c27a' }} /><span className="led" style={{ fontSize: 11 }}>INSERT ↓</span></button>}
                <span style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, fontSize: 11, letterSpacing: '.12em' }}>CARD<span className="slot-line" style={{ width: 90, height: 8 }} /></span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 18 }}>
          <span style={{ fontSize: 12, letterSpacing: '.14em', color: '#4a4640' }}>レシート · RECEIPT</span>
          <span className="slot-line" style={{ width: 'min(380px,100%)' }} />
        </div>
      </div>
      <div ref={receiptRef} className="receipt-wrap">
        {receipt && (
          <div className="receipt">
            <span style={{ fontSize: 22, textAlign: 'center' }}>路地電気 ROJI DENKI</span>
            <span style={{ textAlign: 'center', fontSize: 12 }}>3-2-1 Back Alley, Nakano, Tokyo</span>
            <span style={{ textAlign: 'center', fontSize: 12 }}>{receipt.date}</span>
            <span className="r" style={{ marginTop: 10 }}><span>ORDER No.</span><span>{receipt.orderNo}</span></span>
            <hr />
            {receipt.lines.map(l => <span key={l.id} className="r"><span>{l.name} ×{l.qty}</span><span>{l.lineFmt}</span></span>)}
            <hr />
            <span className="r"><span>SUBTOTAL</span><span>{receipt.subtotalFmt}</span></span>
            <span className="r"><span>SHIPPING</span><span>{receipt.shipFmt}</span></span>
            <span className="r" style={{ fontSize: 20, marginTop: 4 }}><span>TOTAL</span><span>{receipt.totalFmt}</span></span>
            <span className="r"><span>PAID BY</span><span>{receipt.method}</span></span>
            {receipt.isCash && <><span className="r"><span>INSERTED</span><span>{receipt.insertedFmt}</span></span><span className="r"><span>CHANGE</span><span>{receipt.changeFmt}</span></span></>}
            <span className="barcode" />
            <span style={{ textAlign: 'center' }}>またお越しください</span>
            <span style={{ textAlign: 'center', fontSize: 12 }}>COME BACK SOON</span>
          </div>
        )}
      </div>
    </section>
  );
}
