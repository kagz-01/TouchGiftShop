"use client";

/** Printing is an event, and event handlers cannot live in a server component. */
export default function PortalPrintButton({
  label = "Print / Save as PDF",
  className = "",
  style,
}: {
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button type="button" onClick={() => window.print()} className={className} style={style}>
      {label}
    </button>
  );
}
