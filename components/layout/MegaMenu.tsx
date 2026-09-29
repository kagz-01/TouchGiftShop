"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { categoryIcon } from "@/components/shop/CategoryIcons";
import { useShopCategories } from "@/components/shop/useShopCategories";
import Link from "next/link";
import { ChevronDown, Bot, MessageCircle, Target, Zap, CreditCard, Cake, Heart, HeartHandshake, Baby, GraduationCap, Feather, HeartPulse, User, Users, Briefcase, ShoppingBasket, Flower2, Sparkles, Activity, Home, Smartphone, Map, FlaskConical, Gem, Gift, Sword, Church, Banknote, Diamond, ClipboardList, Clock, RefreshCw, ScrollText, Package, Truck, Undo, Flag, Shield, Drama, Hammer, Dumbbell, Egg, Star, Leaf, Candy, Flame, Tag, Trophy, ChefHat, Gamepad2, Music, Tent, Building2, Apple, Wine, Shirt, LayoutDashboard, CalendarDays, Wallet, ScanLine, Store, Boxes, PartyPopper, Coffee, PenLine } from "lucide-react";


type MenuLink = {
  /** Omit the href to render the row as a non-clickable "soon" placeholder. */
  href?: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
};

type MegaMenuSection = {
  title: string;
  links: MenuLink[];
};

type MegaMenuCategory = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  sections: MegaMenuSection[];
  featured?: {
    title: string;
    description: string;
    href: string;
    buttonText?: string;
  };
};

// Lines we are building toward. Once a slug picks up stock in the catalog it
// turns into a live link with a count, straight from /api/categories.
const VISION_LINES = [
  { slug: "apparel",        label: "Wearables & Apparel", description: "Branded polos, caps, jackets.",      icon: <Shirt className="w-4 h-4" /> },
  { slug: null,             label: "Wine & Spirits",      description: "Bottles worth toasting to.",         icon: <Wine className="w-4 h-4" /> },
  { slug: "flowers",        label: "Fresh Flowers",       description: "Same-day bouquets across Nairobi.",  icon: <Flower2 className="w-4 h-4" /> },
  { slug: "fruits-edibles", label: "Fruit Hampers",       description: "For hospitals and fruit lovers.",    icon: <Apple className="w-4 h-4" /> },
  { slug: "perfumes",       label: "Luxury Fragrances",     description: "Authentic designer scents.",         icon: <Sparkles className="w-4 h-4" /> },
];

const MEGA_MENU_DATA: MegaMenuCategory[] = [
  {
    id: "find-gift",
    label: "Find a Gift",
    icon: <Sparkles className="w-5 h-5 text-brand" />,
    sections: [
      {
        title: "Signature Gifts",
        links: [
          { href: "/shop?category=gift-sets", label: "Gift Sets & Hampers", icon: <Gift className="w-4 h-4" />, description: "Curated boxes ready to impress." },
          { href: "/shop?category=perfumes", label: "Luxury Fragrances", icon: <Sparkles className="w-4 h-4" />, description: "Designer scents for him & her." },
          { href: "/shop?category=flowers", label: "Fresh Flowers", icon: <Flower2 className="w-4 h-4" />, description: "Same-day Nairobi delivery." },
          { href: "/shop?category=drinks", label: "Wine & Spirits", icon: <Wine className="w-4 h-4" />, description: "Alcoholic & non-alcoholic." },
          { href: "/shop?category=fruits", label: "Fruit Hampers", icon: <Apple className="w-4 h-4" />, description: "Fresh, healthy, and premium." },
        ],
      },
      {
        title: "Corporate & Merch",
        links: [
          { href: "/shop?category=apparel", label: "Wearables", icon: <Shirt className="w-4 h-4" />, description: "Hoodies, shirts, and socks." },
          { href: "/shop?category=drinkware", label: "Drinkware", icon: <Coffee className="w-4 h-4" />, description: "Flasks and thermal mugs." },
          { href: "/shop?category=stationery-office", label: "Stationery", icon: <PenLine className="w-4 h-4" />, description: "Premium notebooks and pens." },
          { href: "/shop?category=awards-trophies", label: "Awards & Trophies", icon: <Trophy className="w-4 h-4" />, description: "Recognition done right." },
        ],
      },
      {
        title: "By Budget",
        links: [
          { href: "/shop?minPrice=0&maxPrice=2000", label: "Under KSh 2,000", icon: <Tag className="w-4 h-4" />, description: "Small tokens, big meaning." },
          { href: "/shop?minPrice=2000&maxPrice=5000", label: "KSh 2,000-5,000", icon: <Tag className="w-4 h-4" />, description: "Our most popular tier." },
          { href: "/shop?minPrice=5000&maxPrice=10000", label: "KSh 5,000-10,000", icon: <Tag className="w-4 h-4" />, description: "For the bigger moments." },
          { href: "/shop?minPrice=10000", label: "Luxury KSh 10,000+", icon: <Gem className="w-4 h-4" />, description: "The grand gesture." },
        ],
      },
    ],
    featured: {
      title: "Not sure what to gift?",
      description: "Answer 4 quick questions and we will curate the picks that actually suit them.",
      href: "/gift-quiz",
      buttonText: "Try Gift Match",
    },
  },
  {
    id: "gift-lab",
    label: "Gift Lab",
    highlight: true,
    sections: [
      {
        title: "Step 1: The Base",
        links: [
          { href: "/gift-lab?step=base&type=box", label: "Premium Keepsake Box", icon: <Package className="w-4 h-4" />, description: "Signature magnetic boxes." },
          { href: "/gift-lab?step=base&type=basket", label: "Woven Artisan Basket", icon: <ShoppingBasket className="w-4 h-4" />, description: "Hand-woven traditional baskets." },
          { href: "/gift-lab?step=base&type=tote", label: "Eco-Friendly Tote", icon: <Leaf className="w-4 h-4" />, description: "Heavy-canvas reusable totes." },
        ],
      },
      {
        title: "Step 2: The Goodies",
        links: [
          { href: "/gift-lab?step=items&cat=fragrances", label: "Designer Fragrances", icon: <Sparkles className="w-4 h-4" />, description: "Add a signature scent." },
          { href: "/gift-lab?step=items&cat=drinks", label: "Wines & Spirits", icon: <Wine className="w-4 h-4" />, description: "Add a celebratory bottle." },
          { href: "/gift-lab?step=items&cat=treats", label: "Gourmet & Fruits", icon: <Apple className="w-4 h-4" />, description: "Fresh fruits, nuts & sweets." },
        ],
      },
      {
        title: "Step 3: The Finish",
        links: [
          { href: "/gift-lab?step=finish&type=notes", label: "Handwritten Notes", icon: <ScrollText className="w-4 h-4" />, description: "Penned by our calligraphers." },
          { href: "/gift-lab?step=finish&type=ribbon", label: "Corporate Branding", icon: <Briefcase className="w-4 h-4" />, description: "Custom logo ribbons & tags." },
          { href: "/gift-lab?step=finish&type=flowers", label: "Add Fresh Flowers", icon: <Flower2 className="w-4 h-4" />, description: "Top it with a mini bouquet." },
        ],
      },
    ],
    featured: {
      title: "The Ultimate Customizer",
      description: "Be the curator. Mix premium items into a one-of-one gift they will not forget.",
      href: "/gift-lab",
      buttonText: "Start Building",
    },
  },
  {
    id: "occasions",
    label: "Occasions",
    sections: [
      {
        title: "Corporate Events",
        links: [
          { href: "/shop?holiday=end-of-year", label: "End of Year", icon: <CalendarDays className="w-4 h-4" />, description: "Appreciate clients & staff." },
          { href: "/shop?holiday=onboarding", label: "Client Onboarding", icon: <HeartHandshake className="w-4 h-4" />, description: "Start the relationship right." },
          { href: "/shop?holiday=workiversary", label: "Workiversaries", icon: <Trophy className="w-4 h-4" />, description: "Celebrate employee loyalty." },
        ],
      },
      {
        title: "Personal Milestones",
        links: [
          { href: "/shop?holiday=birthday", label: "Birthdays", icon: <Cake className="w-4 h-4" />, description: "Make their new year count." },
          { href: "/shop?holiday=anniversary", label: "Anniversaries", icon: <HeartPulse className="w-4 h-4" />, description: "Celebrate years together." },
          { href: "/shop?holiday=wedding", label: "Weddings", icon: <Church className="w-4 h-4" />, description: "For the newly-weds." },
        ],
      },
      {
        title: "Seasonal",
        links: [
          { href: "/shop?holiday=valentines", label: "Valentine's Day", icon: <Heart className="w-4 h-4" />, description: "Curated romantic sets." },
          { href: "/shop?holiday=mothers-day", label: "Mother's Day", icon: <Flower2 className="w-4 h-4" />, description: "Spoil the moms." },
          { href: "/shop?holiday=fathers-day", label: "Father's Day", icon: <Briefcase className="w-4 h-4" />, description: "Premium picks for him." },
        ],
      },
    ],
    featured: {
      title: "Never miss a date",
      description: "Set reminders for birthdays, workiversaries, and renewals. We'll send curated suggestions before the day.",
      href: "/reminders",
      buttonText: "Set Reminders",
    },
  },
  {
    id: "collections",
    label: "Collections",
    sections: [
      {
        title: "The Edits",
        links: [
          { href: "/shop?tag=premium", label: "The Platinum Edit", icon: <Gem className="w-4 h-4" />, description: "Our most luxurious items." },
          { href: "/shop?tag=corporate", label: "Corporate Essentials", icon: <Briefcase className="w-4 h-4" />, description: "Branded kits & merch." },
          { href: "/shop?personalizable=1", label: "Personalized", icon: <Target className="w-4 h-4" />, description: "Engraved and monogrammed." },
          { href: "/shop?tag=sustainable", label: "Eco-Friendly", icon: <Leaf className="w-4 h-4" />, description: "Earth-conscious picks." },
        ],
      },
    ],
    featured: {
      title: "Browse the full shelf",
      description: "Everything we carry, filterable by category, budget, colour, and stock.",
      href: "/shop",
      buttonText: "Open Catalog",
    },
  },
  {
    id: "corporate",
    label: "Corporate",
    sections: [
      {
        title: "For Your Team",
        links: [
          { href: "/corporate/clients", label: "Client Appreciation", icon: <Briefcase className="w-4 h-4" />, description: "Keep your VIPs loyal." },
          { href: "/corporate/pools", label: "Team Gift Pools", icon: <Users className="w-4 h-4" />, description: "Chip in together, gift bigger." },
          { href: "/corporate/milestones", label: "Milestone Gifting", icon: <CalendarDays className="w-4 h-4" />, description: "Birthdays and workiversaries, automated." },
        ],
      },
      {
        title: "Catalog & Bulk",
        links: [
          { href: "/corporate/catalog", label: "Promo Catalog", icon: <ScrollText className="w-4 h-4" />, description: "Browse items for your logo." },
          { href: "/corporate/showroom", label: "Virtual Showroom", icon: <Store className="w-4 h-4" />, description: "See the range before you buy." },
          { href: "/corporate/build", label: "Hamper Builder", icon: <ShoppingBasket className="w-4 h-4" />, description: "Assemble hampers in bulk." },
        ],
      },
      {
        title: "Plan & Track",
        links: [
          { href: "/corporate/calendar", label: "Gifting Calendar", icon: <CalendarDays className="w-4 h-4" />, description: "Plan the whole year at once." },
          { href: "/corporate/dashboard", label: "Impact Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, description: "Spend and delivery, tracked." },
          { href: "/corporate/whatsapp", label: "WhatsApp Bot", icon: <MessageCircle className="w-4 h-4" />, description: "Gifting straight from chat." },
        ],
      },
    ],
    featured: {
      title: "The Executive Suite",
      description: "Account managers, bulk pricing, and white-labelled gifting for enterprises.",
      href: "/corporate",
      buttonText: "Corporate Portal",
    },
  },
  {
    id: "gift-cards",
    label: "Gift Cards",
    sections: [
      {
        title: "Send",
        links: [
          { href: "/gift-cards", label: "Digital Gift Card", icon: <Sparkles className="w-4 h-4" />, description: "Straight to their inbox." },
          { href: "/corporate", label: "Cards for Your Team", icon: <Building2 className="w-4 h-4" />, description: "Bulk cards, one invoice." },
          { href: "/reminders", label: "Schedule a Delivery", icon: <Clock className="w-4 h-4" />, description: "Buy now, send on the day." },
        ],
      },
      {
        title: "Manage",
        links: [
          { href: "/account", label: "Check Balance", icon: <CreditCard className="w-4 h-4" />, description: "See what is left to spend." },
          { href: "/orders", label: "Your Orders", icon: <Package className="w-4 h-4" />, description: "Track what you have sent." },
          { href: "/track", label: "Track a Gift", icon: <Map className="w-4 h-4" />, description: "Follow the delivery live." },
        ],
      },
    ],
    featured: {
      title: "Let them choose",
      description: "Send a beautifully designed digital card instantly, or schedule it for their day.",
      href: "/gift-cards",
      buttonText: "Buy Gift Card",
    },
  },
];

export default function MegaMenu() {
  const categories = useShopCategories();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 200);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Categories are built from the live list so a newly imported product line
  // shows up here without a deploy. Only the hand-written edits stay.
  const menus = useMemo(() => {
    const shopByCategory: MegaMenuSection = {
      title: "Shop by Category",
      links: categories.map((c) => ({
        href: `/shop?category=${c.slug}`,
        label: c.name,
        icon: categoryIcon(c.slug),
        description: `${c.count} product${c.count === 1 ? "" : "s"} in stock.`,
      })),
    };

    const expandingRange: MegaMenuSection = {
      title: "Expanding Range",
      links: VISION_LINES.map((line) => {
        const stocked = line.slug ? categories.find((c) => c.slug === line.slug) : undefined;
        return stocked
          ? { href: `/shop?category=${stocked.slug}`, label: line.label, icon: line.icon, description: `${stocked.count} in stock.` }
          : { label: line.label, icon: line.icon, description: line.description };
      }),
    };

    return MEGA_MENU_DATA.map((m) =>
      m.id === "collections"
        ? { ...m, sections: [shopByCategory, ...m.sections, expandingRange] }
        : m
    );
  }, [categories]);

  const activeData = menus.find((m) => m.id === activeMenu);

  return (
    <div ref={menuRef} className="relative" onMouseLeave={handleMouseLeave}>

      {/* NAV LINKS */}
      <nav className="flex items-center justify-center gap-10 py-3.5">
        {menus.map((item) => {
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onMouseEnter={() => handleMouseEnter(item.id)}
              onClick={() => setActiveMenu(isActive ? null : item.id)}
              className={`relative flex items-center gap-1 text-[13px] font-bold tracking-wide transition-all duration-200 select-none group ${
                isActive
                  ? "text-brand"
                  : item.highlight
                  ? "text-brand hover:text-brand-dark"
                  : "text-theme-heading hover:text-brand"
              }`}
            >
              {item.label}

              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isActive ? "rotate-180 text-brand" : "text-theme-body/40 group-hover:text-brand"
                }`}
              />

              {item.highlight && !isActive && (
                <span className="absolute -top-1.5 -right-2 w-1.5 h-1.5 bg-coral rounded-full animate-pulse-soft" />
              )}

              {/* Active Underline Indicator */}
              <span
                className={`absolute -bottom-[15px] left-0 right-0 h-0.5 bg-brand transition-transform duration-300 origin-center ${
                  isActive ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* MEGA DROPDOWN */}
      {activeData && (
        <div
          onMouseEnter={() => handleMouseEnter(activeData.id)}
          className="absolute top-[calc(100%+4px)] left-1/2 -translate-x-1/2 z-50"
          style={{ width: "min(1140px, calc(100vw - 3rem))" }}
        >
          {/* Animation lives on its own layer: the keyframes set transform,
              which would otherwise wipe out -translate-x-1/2 above. */}
          <div style={{ animation: "slideDownFade 0.16s ease-out both" }}>
          <div className="absolute -top-2 left-0 right-0 h-2" />
          <div className="bg-white dark:bg-[#16162a] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.14),0_1px_0_rgba(155,27,90,0.07)] border border-gray-100 dark:border-white/10 overflow-hidden">
            <div className="flex items-stretch">

              {/* LINK COLUMNS */}
              <div className="flex-1 min-w-0 flex divide-x divide-gray-100 dark:divide-white/8">
                {activeData.sections.map((section) => (
                  <div key={section.title} className="flex-1 min-w-0 p-5">
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-theme-body/50 mb-3">
                      <span className="w-4 h-px bg-brand/40" />
                      {section.title}
                    </p>
                    <ul className="space-y-0.5">
                      {section.links.map((link) => {
                        const row = (
                          <>
                            {link.icon && (
                              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-brand/6 text-brand/55 group-hover:bg-brand/12 group-hover:text-brand transition-all duration-200 [&>svg]:w-4 [&>svg]:h-4">
                                {link.icon}
                              </span>
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                <span className="text-[13px] font-bold text-theme-heading group-hover:text-brand transition-colors">
                                  {link.label}
                                </span>
                                {!link.href && (
                                  <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-brand/60 bg-brand/8 rounded-full px-1.5 py-0.5">
                                    Soon
                                  </span>
                                )}
                              </span>
                              {link.description && (
                                <span className="block text-[11px] leading-snug text-theme-body/60 mt-0.5">
                                  {link.description}
                                </span>
                              )}
                            </span>
                          </>
                        );

                        return (
                          <li key={link.label}>
                            {link.href ? (
                              <Link
                                href={link.href}
                                onClick={() => setActiveMenu(null)}
                                className="group flex items-start gap-3 p-2 rounded-xl hover:bg-brand/5 transition-all duration-200"
                              >
                                {row}
                              </Link>
                            ) : (
                              <span className="group flex items-start gap-3 p-2 rounded-xl cursor-default">
                                {row}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>

              {/* FEATURED CARD */}
              {activeData.featured && (
                <aside className="relative w-[300px] shrink-0 overflow-hidden bg-gradient-to-br from-brand/8 via-brand/4 to-coral/6 dark:from-brand/18 dark:via-brand/10 dark:to-coral/12 p-6 flex flex-col border-l border-gray-100 dark:border-white/8">
                  <span className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
                  <span className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-coral/10 blur-2xl pointer-events-none" />
                  <span className="relative inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-brand/60 mb-4">
                    <span className="w-4 h-px bg-brand/40" />
                    TouchGift Edit
                  </span>
                  <p className="relative font-display font-bold text-[20px] text-theme-heading leading-snug mb-2">
                    {activeData.featured.title}
                  </p>
                  <p className="relative text-xs text-theme-body leading-relaxed">
                    {activeData.featured.description}
                  </p>
                  <Link
                    href={activeData.featured.href}
                    onClick={() => setActiveMenu(null)}
                    className="relative mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl text-xs font-bold hover:bg-brand-dark hover:shadow-[0_4px_16px_rgba(155,27,90,0.35)] hover:-translate-y-0.5 transition-all duration-200 self-start"
                  >
                    {activeData.featured.buttonText || "Explore"}
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>
                </aside>
              )}

            </div>
          </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDownFade {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
