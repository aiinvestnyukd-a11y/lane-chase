interface NyukdMarkProps { inline?: boolean; size?: number; }

export const NyukdMark = ({ inline = false, size = 36 }: NyukdMarkProps = {}) => {
  const inner = Math.round(size * 0.6);
  return (
    <a
      href="https://nyukd.com"
      target="_blank"
      rel="noopener noreferrer"
      className={inline ? '' : 'fixed top-6 left-6'}
      style={inline ? undefined : { zIndex: 50 }}
      aria-label="NYUKD"
    >
      <span
        className="inline-flex items-center justify-center"
        style={{ width: size, height: size, borderRadius: 8, background: '#11162A', border: '1px solid #2A3358' }}
      >
        <svg width={inner} height={inner} viewBox="0 0 32 32" aria-hidden="true">
          <path d="M9 24 L9 8 L23 24 L23 8" stroke="#F1F2F7" strokeWidth="2.5" fill="none" strokeLinecap="square" />
          <circle cx="23" cy="24" r="2.2" fill="#3DD9D6" />
        </svg>
      </span>
    </a>
  );
};
