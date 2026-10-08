export default function Thumb({ src, w, h, style, className = '', children }) {
  return (
    <div className={'thumb ' + className} style={{ width: w, height: h, ...style }}>
      {src && <img src={src} alt="" loading="lazy" />}
      {children}
    </div>
  );
}
