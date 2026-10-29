import Link from "next/link";

/* ── Shared dropdown row for the mobile utility menus — the top bar's menu and
   the shop header's menu both use it so the two stay visually identical. */

export function MenuRow({
  href,
  icon,
  label,
  badge,
  onNavigate,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onNavigate: () => void;
}) {
  return (
    <Link
      role="menuitem"
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-brand-muted hover:text-brand hover:bg-brand/5 transition-colors"
    >
      <span className="text-brand shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {!!badge && badge > 0 && (
        <span className="min-w-4 h-4 px-1 bg-coral text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none ring-2 ring-white/60 dark:ring-[#12121a]">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}
