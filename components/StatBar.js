// components/StatBar.jsx
export function StatBar({ files = [], results = [], quota }) {
  const filesCount = files?.length || 0;
  const doneCount = results?.filter((r) => r?.ok).length || 0;

  const plan = quota?.plan?.toUpperCase?.() || "—";
  const remDay =
    quota?.remaining_day === null || quota?.remaining_day === undefined
      ? "∞"
      : quota.remaining_day;
  const remMonth =
    quota?.remaining_month === null || quota?.remaining_month === undefined
      ? "—"
      : quota.remaining_month;

  return (
    <div className="border border-black bg-white rounded-xl p-3 md:p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* left: live session stats */}
        <div className="flex items-center gap-2 md:gap-3">
          <Badge>Files: {filesCount}</Badge>
          <Badge>Done: {doneCount}</Badge>
        </div>

        {/* right: quota */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 w-full md:w-auto">
          <Kpi
            label="Plan"
            value={plan}
            valueClass="text-black"
          />
          <Kpi
            label="Remaining Today"
            value={remDay}
          />
          <Kpi
            label="Remaining Month"
            value={remMonth}
          />
        </div>
      </div>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-black px-2.5 py-1 text-xs font-medium bg-white shadow-[2px_2px_0_#000]">
      {children}
    </span>
  );
}

function Kpi({ label, value, valueClass = "" }) {
  return (
    <div className="border border-black rounded-lg px-3 py-2 bg-white">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div
        className={[
          "text-sm font-semibold leading-tight inline-flex px-1.5 rounded",
          valueClass,
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}