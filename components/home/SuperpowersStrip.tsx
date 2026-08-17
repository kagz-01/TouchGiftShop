import Link from "next/link";
import { Users, ShoppingBag, Sparkles } from "lucide-react";

export default function SuperpowersStrip() {
  return (
    <section className="pb-8 pt-4 md:pb-12 md:pt-6">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Gift Pool Card */}
          <Link href="/gift-lab/pool" className="group block relative overflow-hidden bg-brand-bg rounded-3xl p-8 md:p-10 border border-brand/5 hover:border-brand/20 transition-all duration-500 hover:shadow-card hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:bg-gold transition-colors duration-300">
                  <Users className="w-6 h-6 text-brand group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-brand-deep mb-3">
                  Start a Gift Pool
                </h3>
                <p className="text-brand-muted text-sm md:text-base max-w-sm mb-8 leading-relaxed">
                  Chip in with friends and colleagues to get them something truly premium. We'll handle the money collection and the flawless delivery.
                </p>
              </div>
              <div className="inline-flex items-center text-sm font-bold text-brand group-hover:text-gold transition-colors">
                Pool a Gift →
              </div>
            </div>
          </Link>

          {/* Custom Hamper Card */}
          <Link href="/gift-lab" className="group block relative overflow-hidden bg-blush rounded-3xl p-8 md:p-10 border border-brand/5 hover:border-brand/20 transition-all duration-500 hover:shadow-card hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full -translate-y-1/3 translate-x-1/3 group-hover:scale-110 transition-transform duration-700" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:bg-brand transition-colors duration-300">
                  <ShoppingBag className="w-6 h-6 text-brand group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-brand-deep mb-3">
                  Build a Custom Hamper
                </h3>
                <p className="text-brand-muted text-sm md:text-base max-w-sm mb-8 leading-relaxed">
                  Handpick every single item. We'll beautifully curate, package, and ribbon it up to create a one-of-a-kind gifting experience.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-sm font-bold text-brand group-hover:text-brand-dark transition-colors">
                <Sparkles className="w-4 h-4" />
                Start Building
              </div>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
}
