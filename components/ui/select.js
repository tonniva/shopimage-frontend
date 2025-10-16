export function Select({ className = "", ...props }) {
    const base =
      "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5";
    return <select className={`${base} ${className}`} {...props} />;
  }