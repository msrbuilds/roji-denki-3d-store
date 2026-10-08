import { useEffect, useState } from 'react';

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function showTip(el, title, sub, hint, x, y) {
  if (!el) return;
  if (!title) { el.style.opacity = 0; return; }
  el.querySelector('b').textContent = title;
  el.querySelector('small').textContent = sub || '';
  el.querySelector('em').textContent = hint;
  el.style.transform = `translate(${x + 16}px, ${y + 16}px)`;
  el.style.opacity = 1;
}

export function useViewport() {
  const get = () => ({ w: window.innerWidth, h: window.innerHeight });
  const [vp, setVp] = useState(get);
  useEffect(() => {
    const on = () => setVp(get());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return vp;
}

export const hhmm = d => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
