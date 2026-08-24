"use client";

import { useState, useEffect } from "react";
import { Gift, Users, PartyPopper, HeartHandshake, TreePine, Hand, Star, ArrowRight, Check, Loader2 } from "lucide-react";

export type HamperTemplate = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  priceRange: string;
  itemCount: number;
  items: { name: string; price: number; category: string }[];
  occasions: string[];
  popular?: boolean;
};

const FALLBACK_TEMPLATES: HamperTemplate[] = [
  {
    id: "welcome-kit",
    name: "New Hire Welcome Kit",
    description: "Make new hires feel valued from day one with a curated onboarding experience.",
    icon: <Hand className="w-6 h-6" />,
    gradient: "from-violet-500 to-purple-500",
    priceRange: "KSh 2,500 – 5,000",
    itemCount: 5,
    items: [
      { name: "Artisan Coffee Beans", price: 850, category: "drinks" },
      { name: "Premium Chocolate Box", price: 650, category: "chocolates" },
      { name: "Branded Notebook", price: 450, category: "personalised" },
      { name: "Scented Candle", price: 550, category: "lifestyle" },
      { name: "Welcome Card", price: 200, category: "personalised" },
    ],
    occasions: ["onboarding", "new hire", "welcome"],
    popular: true,
  },
  {
    id: "client-thank-you",
    name: "Client Appreciation",
    description: "Strengthen relationships with a thoughtful gift after closing a deal or during holidays.",
    icon: <HeartHandshake className="w-6 h-6" />,
    gradient: "from-gold to-gold-light",
    priceRange: "KSh 3,000 – 8,000",
    itemCount: 4,
    items: [
      { name: "Premium Wine Bottle", price: 1200, category: "drinks" },
      { name: "Luxury Chocolate Truffles", price: 950, category: "chocolates" },
      { name: "Artisan Cheese Board", price: 1100, category: "food" },
      { name: "Thank You Card", price: 200, category: "personalised" },
    ],
    occasions: ["client", "thank you", "holiday"],
  },
  {
    id: "event-gift-bag",
    name: "Conference Gift Bag",
    description: "Branded gift bags for conferences, launches, and corporate events.",
    icon: <PartyPopper className="w-6 h-6" />,
    gradient: "from-coral to-pink-400",
    priceRange: "KSh 1,500 – 3,000",
    itemCount: 4,
    items: [
      { name: "Premium Notebook", price: 350, category: "personalised" },
      { name: "Artisan Chocolate Bar", price: 300, category: "chocolates" },
      { name: "Branded Tote Bag", price: 450, category: "personalised" },
      { name: "Gourmet Snack Pack", price: 400, category: "food" },
    ],
    occasions: ["event", "conference", "launch"],
  },
  {
    id: "holiday-gift",
    name: "Festive Season Hamper",
    description: "Christmas, New Year, Ramadan, Easter — seasonal gifts for your entire team.",
    icon: <TreePine className="w-6 h-6" />,
    gradient: "from-emerald-500 to-teal-500",
    priceRange: "KSh 2,000 – 6,000",
    itemCount: 5,
    items: [
      { name: "Festive Cookie Box", price: 650, category: "food" },
      { name: "Spiced Tea Collection", price: 500, category: "drinks" },
      { name: "Holiday Candle", price: 550, category: "lifestyle" },
      { name: "Chocolate Truffles", price: 600, category: "chocolates" },
      { name: "Festive Card", price: 200, category: "personalised" },
    ],
    occasions: ["christmas", "new year", "holiday", "eid"],
  },
  {
    id: "employee-milestone",
    name: "Milestone Celebration",
    description: "Reward work anniversaries, promotions, and exceptional performance.",
    icon: <Star className="w-6 h-6" />,
    gradient: "from-amber-500 to-yellow-400",
    priceRange: "KSh 2,000 – 4,500",
    itemCount: 4,
    items: [
      { name: "Premium Gift Box", price: 800, category: "hampers" },
      { name: "Artisan Coffee Set", price: 750, category: "drinks" },
      { name: "Luxury Soap Set", price: 600, category: "lifestyle" },
      { name: "Congrats Card", price: 200, category: "personalised" },
    ],
    occasions: ["anniversary", "promotion", "milestone", "celebration"],
  },
  {
    id: "premium-executive",
    name: "Executive Luxury Box",
    description: "Premium gifts for C-suite executives and high-value clients.",
    icon: <Gift className="w-6 h-6" />,
    gradient: "from-brand to-brand-deep",
    priceRange: "KSh 8,000 – 15,000",
    itemCount: 5,
    items: [
      { name: "Premium Whiskey Set", price: 2500, category: "drinks" },
      { name: "Artisan Chocolate Collection", price: 1200, category: "chocolates" },
      { name: "Leather Card Holder", price: 1800, category: "accessories" },
      { name: "Gourmet Gift Basket", price: 1500, category: "food" },
      { name: "Personalised Crystal", price: 1100, category: "personalised" },
    ],
    occasions: ["executive", "vip", "premium", "luxury"],
  },
];

// DB category -> visual style for dynamically-loaded templates
const CATEGORY_STYLES: Record<string, { icon: React.ReactNode; gradient: string }> = {
  welcome: { icon: <Hand className="w-6 h-6" />, gradient: "from-violet-500 to-purple-500" },
  client: { icon: <HeartHandshake className="w-6 h-6" />, gradient: "from-gold to-gold-light" },
  recognition: { icon: <Star className="w-6 h-6" />, gradient: "from-amber-500 to-yellow-400" },
  holiday: { icon: <TreePine className="w-6 h-6" />, gradient: "from-emerald-500 to-teal-500" },
  event: { icon: <PartyPopper className="w-6 h-6" />, gradient: "from-coral to-pink-400" },
  executive: { icon: <Gift className="w-6 h-6" />, gradient: "from-brand to-brand-deep" },
  milestone: { icon: <Users className="w-6 h-6" />, gradient: "from-blue-500 to-indigo-400" },
  sympathy: { icon: <HeartHandshake className="w-6 h-6" />, gradient: "from-slate-400 to-gray-500" },
};

interface DbTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price_range_min: number | null;
  price_range_max: number | null;
  item_count: number;
  is_featured: boolean;
  occasions: string[];
  hamper_template_items?: { product_name: string; price: number; quantity: number }[];
}

function mapDbTemplate(t: DbTemplate): HamperTemplate {
  const style = CATEGORY_STYLES[t.category] ?? CATEGORY_STYLES.welcome;
  const fmt = (n: number) => `KSh ${n.toLocaleString()}`;
  const range = t.price_range_min != null && t.price_range_max != null
    ? `${fmt(t.price_range_min)} – ${fmt(t.price_range_max)}`
    : t.price_range_min != null ? `${fmt(t.price_range_min)}+` : "Custom quote";

  return {
    id: t.id,
    name: t.name,
    description: t.description || "",
    icon: style.icon,
    gradient: style.gradient,
    priceRange: range,
    itemCount: t.item_count,
    items: (t.hamper_template_items ?? []).map((it) => ({
      name: it.product_name,
      price: Number(it.price),
      category: "template",
    })),
    occasions: t.occasions ?? [],
    popular: t.is_featured,
  };
}

interface TemplateLibraryProps {
  onSelect: (template: HamperTemplate) => void;
  selectedId?: string;
}

export default function TemplateLibrary({ onSelect, selectedId }: TemplateLibraryProps) {
  const [filter, setFilter] = useState<string>("all");
  const [templates, setTemplates] = useState<HamperTemplate[]>(FALLBACK_TEMPLATES);
  const [loading, setLoading] = useState(true);

  // Load templates from DB; fall back to bundled starters if empty/unreachable
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/corporate/templates");
        const data = await res.json();
        if (!cancelled && Array.isArray(data.templates) && data.templates.length > 0) {
          setTemplates(data.templates.map(mapDbTemplate));
        }
      } catch {
        // keep fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const occasions = ["all", "onboarding", "client", "event", "holiday", "milestone", "premium"];
  const occasionLabels: Record<string, string> = {
    all: "All Templates",
    onboarding: "Welcome & Onboarding",
    client: "Client Gifts",
    event: "Events & Conferences",
    holiday: "Holiday & Seasonal",
    milestone: "Milestones",
    premium: "Premium & Executive",
  };

  const filtered = filter === "all"
    ? templates
    : templates.filter((t) => t.occasions.some((o) => o.includes(filter)));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display italic text-xl font-bold mb-2 text-theme-heading">Start with a Template</h3>
        <p className="text-theme-muted text-sm">Choose a pre-built corporate hamper template, then customize it to match your brand.</p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {occasions.map((occ) => (
          <button
            key={occ}
            onClick={() => setFilter(occ)}
            className={`px-4 py-2 shape-premium-button text-sm font-medium whitespace-nowrap transition-all ${
              filter === occ
                ? "bg-brand text-white"
                : "card-theme border border-surface-border text-theme-muted hover:border-brand/30"
            }`}
          >
            {occasionLabels[occ]}
          </button>
        ))}
      </div>

      {/* Template grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-52 rounded-3xl bg-theme-muted/10 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-theme-muted text-sm">No templates match this filter.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className={`relative text-left p-5 shape-premium-card border-2 transition-all duration-300 group hover:-translate-y-1 ${
                selectedId === template.id
                  ? "border-brand shadow-ribbon bg-brand/5"
                  : "border-surface-border hover:border-brand/30 card-theme"
              }`}
            >
              {template.popular && selectedId !== template.id && (
                <span className="absolute top-3 right-3 bg-gold text-brand-deep text-[10px] font-bold px-2 py-0.5 shape-premium-button uppercase tracking-wider">
                  Popular
                </span>
              )}
              {selectedId === template.id && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-brand shape-premium-button flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}

              <div className={`w-12 h-12 bg-gradient-to-br ${template.gradient} shape-premium-card flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                {template.icon}
              </div>

              <h4 className="font-display italic font-bold text-theme-heading mb-1 group-hover:text-gold transition-colors">
                {template.name}
              </h4>
              <p className="text-theme-muted text-xs leading-relaxed mb-3 line-clamp-2">{template.description}</p>

              <div className="flex items-center justify-between text-xs">
                <span className="text-theme-heading font-semibold">{template.priceRange}</span>
                <span className="text-theme-muted">{template.itemCount} items</span>
              </div>

              {/* Mini item preview */}
              {template.items.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {template.items.slice(0, 3).map((item, i) => (
                    <span key={i} className="text-[10px] bg-white/10 dark:bg-white/5 text-theme-muted px-2 py-0.5 rounded-full">
                      {item.name}
                    </span>
                  ))}
                  {template.items.length > 3 && (
                    <span className="text-[10px] bg-white/10 dark:bg-white/5 text-theme-muted px-2 py-0.5 rounded-full">
                      +{template.items.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="mt-3 flex items-center gap-1 text-brand text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Use this template <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { FALLBACK_TEMPLATES as TEMPLATES };
