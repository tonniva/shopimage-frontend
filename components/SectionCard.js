// components/SectionCard.js
export function SectionCard({ title, subtitle, right, children, className = "" }) {
    return (
            <section
      className={[
        "border border-black bg-white p-4 md:p-5 space-y-4",
       // hover/active
       "transition-all duration-200 will-change-transform",
        "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]",
        "active:translate-y-0 active:shadow-[2px_2px_0_#000]",
        className,
      ].join(" ")}
    >
        {(title || right || subtitle) ? (
          <div className="flex items-start justify-between gap-4">
            <div>
              {title ? <h2 className="text-base font-semibold">{title}</h2> : null}
              {subtitle ? <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p> : null}
            </div>
            {right ? <div className="shrink-0">{right}</div> : null}
          </div>
        ) : null}
        <div>{children}</div>
      </section>
    );
  }