export function Input({ className = "", ...props }) {
  const base = `
    w-full px-3 py-2 text-sm font-mc
    bg-white border-pixel shadow-[inset_0_2px_0_0_rgba(0,0,0,0.08)]
    outline-none focus:ring-0 focus:outline-2 focus:outline-[var(--mc-border)]
  `;
  return <input className={`${base} ${className}`} {...props} />;
}