export function Card({ className = "", ...props }) {
    return <div className={`rounded-2xl border border-gray-100 shadow-sm bg-white ${className}`} {...props} />;
  }
  export function CardContent({ className = "", ...props }) {
    return <div className={`${className}`} {...props} />;
  }