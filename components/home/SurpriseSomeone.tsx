import Link from "next/link";
import { EyeOff, MapPin, Camera, Zap } from "lucide-react";

export default function SurpriseSomeone() {
  return (
    <section className="py-12 md:py-16">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-brand-light rounded-3xl p-8 md:p-12">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-white/80 text-xs font-semibold">
                <span className="animate-wiggle inline-flex">
                  <EyeOff className="w-3.5 h-3.5 text-white/80" />
                </span>
                Keep it secret
              </span>

              <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
                Surprise Someone
                <br />
                <span className="text-gold">Today</span>
              </h2>

              <p className="text-white/70 text-sm leading-relaxed max-w-md">
                Don&apos;t know their address? No problem. Let them drop their own delivery pin.
                Anonymous mode hides your name and the price. The surprise stays intact.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/shop"
                  className="px-5 py-2.5 bg-gold text-brand-deep rounded-xl font-bold text-sm shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 transition-all"
                >
                  Send a Surprise
                </Link>
                <Link
                  href="/surprise"
                  className="px-5 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl font-semibold text-sm hover:bg-white/20 transition-all"
                >
                  How it Works
                </Link>
              </div>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <MapPin className="w-6 h-6 text-white" />, title: "Pin Drop", desc: "They choose the spot" },
                { icon: <EyeOff className="w-6 h-6 text-white" />, title: "Anonymous", desc: "Your identity hidden" },
                { icon: <Camera className="w-6 h-6 text-white" />, title: "Photo Proof", desc: "See before it ships" },
                { icon: <Zap className="w-6 h-6 text-white" />, title: "Same-Day", desc: "Nairobi delivery" },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all"
                >
                  <div className="flex mb-2">{feature.icon}</div>
                  <p className="text-sm font-bold text-white">{feature.title}</p>
                  <p className="text-xs text-white/60">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
