import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import HamperBuilder from "@/components/gift-lab/HamperBuilder";

export default function BuildHamperPage() {
  return (
    <div className="min-h-screen section-theme-a">
      {/* ── Sticky header ── */}
      <div className="bg-white border-b border-black/5 sticky top-0 z-30">
        <div className="page-container-capped py-3 flex items-center gap-3">
          <Link
            href="/gift-lab"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-brand-muted hover:bg-brand/5 hover:text-brand transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-brand-deep text-sm leading-none">Build a Hamper</h1>
            <p className="text-[11px] text-brand-muted mt-0.5">Handpick every item · We box it beautifully</p>
          </div>
        </div>
      </div>

      {/* ── Builder ── */}
      <div className="w-full page-container-capped py-6 md:py-8">
        <HamperBuilder />
      </div>
    </div>
  );
}
