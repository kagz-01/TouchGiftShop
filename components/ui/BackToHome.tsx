import Link from "next/link";

type BackToHomeProps = {
  className?: string;
  label?: string;
};

export default function BackToHome({ className = "", label = "Back to Home" }: BackToHomeProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand transition-colors ${className}`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      {label}
    </Link>
  );
}
