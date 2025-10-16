export function Button({ className = "", ...props }) {
    const base =
      "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium shadow-sm border border-gray-200 bg-white hover:bg-gray-50 transition text-black";
    return <button className={`${base} ${className}`} {...props} />;
  }