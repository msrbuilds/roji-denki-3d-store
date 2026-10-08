import { useEffect, useRef, useState } from 'react';
import { ARRIVAL_POOL, FLAP_CHARS } from './data.js';
import { hhmm } from './util.js';

const COLS = [['time', 0, 5, 'end'], ['item', 2, 16, 'end'], ['from', 5, 10, 'end'], ['price', 8, 8, 'start']];
const blank = () => ({ time: ' '.repeat(5), item: ' '.repeat(16), from: ' '.repeat(10), price: ' '.repeat(8), status: '', jp: '' });
const fit = (s, n, pad) => pad === 'start' ? s.padStart(n).slice(-n) : s.padEnd(n).slice(0, n);
const toStr = r => ({ time: fit(r.time, 5), item: fit(r.item, 16), from: fit(r.from, 10), price: fit(r.price, 8, 'start'), status: r.status, jp: r.jp });

/** Split-flap departure board: a new arrival is pushed to the top every 7s and every changed tile flips. */
export function useBoard() {
  const [board, setBoard] = useState(() => Array.from({ length: 5 }, blank));
  const boardRef = useRef(board);
  boardRef.current = board;

  useEffect(() => {
    let idx = -1, flipTimer = null;
    const next = (d, status) => { idx = (idx + 1) % ARRIVAL_POOL.length; const [item, jp, from, price] = ARRIVAL_POOL[idx]; return { time: hhmm(d), item, jp, from, price, status }; };
    const flip = rows => {
      clearInterval(flipTimer);
      const T = rows.map(toStr), start = boardRef.current.map(r => ({ ...r }));
      let tick = 0;
      flipTimer = setInterval(() => {
        tick++; let done = true;
        const out = T.map((tr, ri) => {
          const sr = start[ri] || {}; const o = { jp: tr.jp }; let rowDone = true;
          for (const [col, off] of COLS) {
            o[col] = [...tr[col]].map((ch, j) => {
              if ((sr[col] || '')[j] === ch || tick >= ri * 1.6 + off + j * .45 + 3) return ch;
              rowDone = false; return FLAP_CHARS[(Math.random() * FLAP_CHARS.length) | 0];
            }).join('');
          }
          o.status = rowDone ? tr.status : '';
          if (!rowDone) done = false;
          return o;
        });
        setBoard(out);
        if (done) clearInterval(flipTimer);
      }, 50);
    };
    const now = Date.now();
    let rows = [0, 1, 2, 3, 4].map(i => next(new Date(now - i * 9 * 60000), i === 0 ? 'JUST IN' : ['ON SALE', 'ON SALE', 'LAST ONE', 'SOLD OUT'][(i * 3) % 4]));
    const t0 = setTimeout(() => flip(rows), 600);
    const iv = setInterval(() => {
      const old = rows.slice(0, 4).map(r => r.status === 'JUST IN' ? { ...r, status: Math.random() < .25 ? 'LAST ONE' : 'ON SALE' } : r);
      rows = [next(new Date(), 'JUST IN'), ...old];
      flip(rows);
    }, 7000);
    return () => { clearTimeout(t0); clearInterval(iv); clearInterval(flipTimer); };
  }, []);

  return board;
}
