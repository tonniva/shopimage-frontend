export function ProgressBar({ value = 0, indeterminate = false }) {
  return (
    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
      <div
        className={`h-full bg-gray-900 transition-all ${indeterminate ? "animate-pulse w-1/3" : ""}`}
        style={!indeterminate ? { width: `${value}%` } : {}}
      />
    </div>
  );
}