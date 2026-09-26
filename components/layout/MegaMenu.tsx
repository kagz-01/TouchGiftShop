"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Bot, MessageCircle, Target, Zap, CreditCard, Cake, Heart, HeartHandshake, Baby, GraduationCap, Feather, HeartPulse, User, Users, Briefcase, ShoppingBasket, Flower2, Sparkles, Activity, Home, Smartphone, Map, FlaskConical, Gem, Gift, Sword, Church, Banknote, Diamond, ClipboardList, Clock, RefreshCw, ScrollText, Package, Truck, Undo, Flag, Shield, Drama, Hammer, Dumbbell, Egg, Star, Leaf, Candy, Flame, Tag, Trophy, ChefHat, Gamepad2, Music, Tent, Building2, Apple } from "lucide-react";


type MegaMenuSection = {
  title: string;
  links: Array<{ href: string; label: string; icon?: React.ReactNode; description?: string }>;
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
    image: string;
    href: string;
    buttonText?: string;
  }[];
};

const MEGA_MENU_DATA: MegaMenuCategory[] = [
  {
    id: "find-gift",
    label: "Find a Gift",
    icon: <Sparkles className="w-5 h-5 text-brand" />,
    sections: [
      {
        title: "By Person",
        links: [
          { href: "/shop?for=her", label: "For Her", icon: <User className="w-4 h-4" />, description: "Curated for the remarkable women in your life." },
          { href: "/shop?for=him", label: "For Him", icon: <User className="w-4 h-4" />, description: "Sophisticated choices for the modern gentleman." },
          { href: "/shop?for=couples", label: "For Couples", icon: <Users className="w-4 h-4" />, description: "Shared experiences and paired luxury gifts." },
          { href: "/shop?for=parents", label: "For Parents", icon: <Heart className="w-4 h-4" />, description: "Show your deepest appreciation." },
          { href: "/shop?for=colleagues", label: "For Colleagues", icon: <Building2 className="w-4 h-4" />, description: "Professional, elegant, and always appropriate." },
        ],
      },
      {
        title: "By Budget",
        links: [
          { href: "/shop?price=under-2k", label: "Under KSh 2,000", icon: <Tag className="w-4 h-4" />, description: "Small tokens of great appreciation." },
          { href: "/shop?price=2k-5k", label: "KSh 2,000-5,000", icon: <Tag className="w-4 h-4" />, description: "Our most popular sweet spot." },
          { href: "/shop?price=5k-10k", label: "KSh 5,000-10,000", icon: <Tag className="w-4 h-4" />, description: "Premium tier for those special moments." },
          { href: "/shop?price=over-10k", label: "Luxury KSh 10,000+", icon: <Gem className="w-4 h-4" />, description: "The grand gesture. Pure opulence." },
        ],
      },
      {
        title: "Quick Help",
        links: [
          { href: "/ai-finder", label: "AI Gift Finder", icon: <Bot className="w-4 h-4" />, description: "Let our smart concierge find the perfect match." },
          { href: "/shop?filter=last-minute", label: "Last-Minute Gifts", icon: <Clock className="w-4 h-4" />, description: "Guaranteed same-day Nairobi delivery." },
          { href: "/shop?filter=best-sellers", label: "Best Sellers", icon: <Trophy className="w-4 h-4" />, description: "Tried, tested, and universally loved." },
        ],
      },
    ],
    featured: [
      {
        title: "Not sure what to gift?",
        description: "Answer a few questions and let our AI concierge narrow it down to the perfect curated selection.",
        image: "/hero/hero-toast.webp",
        href: "/ai-finder",
        buttonText: "Try Gift Match"
      },
    ],
  },
  {
    id: "occasions",
    label: "Occasions",
    sections: [
      {
        title: "Milestones",
        links: [
          { href: "/shop?occasion=birthday", label: "Birthdays", icon: <Cake className="w-4 h-4" />, description: "Make their new year unforgettable." },
          { href: "/shop?occasion=anniversary", label: "Anniversaries", icon: <HeartPulse className="w-4 h-4" />, description: "Celebrate your years together." },
          { href: "/shop?occasion=graduation", label: "Graduation", icon: <GraduationCap className="w-4 h-4" />, description: "Mark their greatest achievement." },
          { href: "/shop?occasion=wedding", label: "Weddings & Engagement", icon: <Church className="w-4 h-4" />, description: "For the newly weds and lovebirds." },
        ],
      },
      {
        title: "Just Because",
        links: [
          { href: "/shop?occasion=thank-you", label: "Thank You", icon: <HeartHandshake className="w-4 h-4" />, description: "Gratitude expressed beautifully." },
          { href: "/shop?occasion=get-well", label: "Get Well Soon", icon: <Activity className="w-4 h-4" />, description: "Wishes for a speedy recovery." },
          { href: "/shop?occasion=thinking-of-you", label: "Thinking of You", icon: <MessageCircle className="w-4 h-4" />, description: "When they cross your mind." },
          { href: "/shop?occasion=apology", label: "Apology (I'm Sorry)", icon: <Undo className="w-4 h-4" />, description: "Mend fences with a sweet gesture." },
        ],
      },
      {
        title: "Professional",
        links: [
          { href: "/shop?occasion=new-job", label: "New Job & Promotion", icon: <Briefcase className="w-4 h-4" />, description: "Celebrate their career leaps." },
          { href: "/shop?occasion=retirement", label: "Retirement", icon: <Clock className="w-4 h-4" />, description: "Honoring a legacy of hard work." },
          { href: "/shop?occasion=farewell", label: "Farewell / Bon Voyage", icon: <Flag className="w-4 h-4" />, description: "Send them off in style." },
        ],
      },
    ],
    featured: [
      {
        title: "The Calendar",
        description: "Never miss a date. Set up gift reminders for birthdays and anniversaries and get curated suggestions.",
        image: "/hero/hero-flowers.webp",
        href: "/reminders",
        buttonText: "Set Reminders"
      },
    ]
  },
  {
    id: "collections",
    label: "Collections",
    sections: [
      {
        title: "Signature Gifts",
        links: [
          { href: "/shop?category=hampers", label: "Curated Hampers", icon: <ShoppingBasket className="w-4 h-4" />, description: "Our famous hand-packed luxury boxes." },
          { href: "/shop?category=flowers", label: "Fresh Flowers", icon: <Flower2 className="w-4 h-4" />, description: "Hand-tied bouquets and bloom boxes." },
          { href: "/shop?category=liquor", label: "Fine Spirits & Wine", icon: <Flame className="w-4 h-4" />, description: "Premium bottles for a proper toast." },
          { href: "/shop?category=perfumes", label: "Designer Fragrances", icon: <Sparkles className="w-4 h-4" />, description: "Authentic, high-end signature scents." },
        ],
      },
      {
        title: "Specialty",
        links: [
          { href: "/shop?category=wellness", label: "Wellness & Spa", icon: <Activity className="w-4 h-4" />, description: "Relaxation and self-care essentials." },
          { href: "/shop?category=chocolates", label: "Gourmet Chocolates", icon: <Candy className="w-4 h-4" />, description: "Artisan chocolates and sweet treats." },
          { href: "/shop?category=fruits", label: "Fresh Fruit Baskets", icon: <Apple className="w-4 h-4" />, description: "Farm-fresh exotic fruit selections." },
          { href: "/shop?category=tech", label: "Tech & Gadgets", icon: <Smartphone className="w-4 h-4" />, description: "Premium accessories for the modern era." },
        ],
      },
      {
        title: "The Edits",
        links: [
          { href: "/shop?edit=local", label: "Made in Kenya", icon: <Map className="w-4 h-4" />, description: "Showcasing the best local artisans." },
          { href: "/shop?edit=sustainable", label: "Eco-Friendly", icon: <Leaf className="w-4 h-4" />, description: "Sustainable and earth-conscious picks." },
          { href: "/shop?edit=personalized", label: "Personalized", icon: <Target className="w-4 h-4" />, description: "Engraved, monogrammed, and bespoke." },
        ],
      }
    ]
  },
  {
    id: "gift-lab",
    label: "Gift Lab",
    highlight: true,
    sections: [
      {
        title: "Step 1: The Base",
        links: [
          { href: "/gift-lab?step=base&type=box", label: "Premium Keepsake Box", icon: <Package className="w-4 h-4" />, description: "Our signature magnetic closure boxes." },
          { href: "/gift-lab?step=base&type=basket", label: "Woven Artisan Basket", icon: <ShoppingBasket className="w-4 h-4" />, description: "Hand-woven traditional baskets." },
          { href: "/gift-lab?step=base&type=tote", label: "Eco-Friendly Tote", icon: <Leaf className="w-4 h-4" />, description: "Reusable, heavy-canvas branded totes." },
        ],
      },
      {
        title: "Step 2: The Goodies",
        links: [
          { href: "/gift-lab?step=items&cat=treats", label: "Gourmet Treats", icon: <Candy className="w-4 h-4" />, description: "Fill it with chocolates, nuts, and sweets." },
          { href: "/gift-lab?step=items&cat=drinks", label: "Wines & Spirits", icon: <Flame className="w-4 h-4" />, description: "Add a celebratory bottle to the mix." },
          { href: "/gift-lab?step=items&cat=spa", label: "Spa & Self-Care", icon: <Activity className="w-4 h-4" />, description: "Bath salts, candles, and lotions." },
        ],
      },
      {
        title: "Step 3: The Finish",
        links: [
          { href: "/gift-lab?step=finish", label: "Handwritten Notes", icon: <ScrollText className="w-4 h-4" />, description: "Your message, penned by our calligraphers." },
          { href: "/gift-lab?step=finish", label: "Silk Ribbon Selection", icon: <Heart className="w-4 h-4" />, description: "Choose the perfect color to tie it off." },
          { href: "/gift-lab?step=finish", label: "Add Fresh Flowers", icon: <Flower2 className="w-4 h-4" />, description: "Top it off with a miniature bouquet." },
        ],
      },
    ],
    featured: [
      {
        title: "The Ultimate Customizer",
        description: "Be the curator. Mix and match premium items to create a 1-of-1 gift experience that they will never forget.",
        image: "/hero/hero-corporate.webp",
        href: "/gift-lab",
        buttonText: "Start Building"
      },
    ],
  },
  {
    id: "corporate",
    label: "Corporate",
    sections: [
      {
        title: "Corporate Services",
        links: [
          { href: "/corporate/clients", label: "Client Appreciation", icon: <Briefcase className="w-4 h-4" />, description: "Keep your VIPs loyal with luxury." },
          { href: "/corporate/team", label: "Employee Onboarding", icon: <Users className="w-4 h-4" />, description: "Welcome kits that make a statement." },
          { href: "/corporate/events", label: "Events & Conferences", icon: <Tent className="w-4 h-4" />, description: "Bulk speaker gifts and attendee swag." },
        ],
      },
      {
        title: "Branded Merch",
        links: [
          { href: "/corporate/catalog", label: "PromoHub Catalog", icon: <ScrollText className="w-4 h-4" />, description: "Browse 1000+ items for your logo." },
          { href: "/corporate/apparel", label: "Branded Apparel", icon: <User className="w-4 h-4" />, description: "Premium polos, jackets, and caps." },
          { href: "/corporate/drinkware", label: "Custom Drinkware", icon: <FlaskConical className="w-4 h-4" />, description: "Tumblers, mugs, and water bottles." },
        ],
      },
      {
        title: "Operations",
        links: [
          { href: "/corporate/fulfillment", label: "Warehousing & Fulfillment", icon: <Truck className="w-4 h-4" />, description: "We store it and ship it on demand." },
          { href: "/corporate/api", label: "HR API Integration", icon: <Zap className="w-4 h-4" />, description: "Automate birthday and anniversary gifts." },
        ]
      }
    ],
    featured: [
      {
        title: "The Executive Suite",
        description: "Dedicated account managers, bulk discounts, and fully white-labeled gifting solutions for enterprises.",
        image: "/hero/hero-corporate.webp",
        href: "/corporate",
        buttonText: "Corporate Portal"
      },
    ],
  },
  {
    id: "gift-cards",
    label: "Gift Cards",
    sections: [
      {
        title: "Choose",
        links: [
          { href: "/gift-cards/digital", label: "Digital Gift Card", icon: <Sparkles className="w-4 h-4" />, description: "Delivered instantly to their inbox." },
          { href: "/corporate/gift-cards", label: "Corporate Cards", icon: <Building2 className="w-4 h-4" />, description: "Bulk gift cards for your entire team." },
          { href: "/gift-cards/schedule", label: "Scheduled Delivery", icon: <Clock className="w-4 h-4" />, description: "Buy now, send on their birthday." },
          { href: "/gift-cards/custom", label: "Custom Amount", icon: <Banknote className="w-4 h-4" />, description: "You decide the exact value." },
        ],
      },
      {
        title: "Use & Support",
        links: [
          { href: "/gift-cards/balance", label: "Check Balance", icon: <CreditCard className="w-4 h-4" />, description: "See how much magic you have left." },
          { href: "/gift-cards/redeem", label: "Redeem a Card", icon: <RefreshCw className="w-4 h-4" />, description: "Apply a gift card to your account." },
          { href: "/faq/gift-cards", label: "Gift Card FAQ", icon: <MessageCircle className="w-4 h-4" />, description: "Common questions answered." },
          { href: "/terms/gift-cards", label: "Terms & Conditions", icon: <ScrollText className="w-4 h-4" />, description: "The fine print, kept simple." },
        ],
      },
    ],
    featured: [
      {
        title: "Let them choose",
        description: "Send a beautifully designed digital gift card instantly or schedule it for their special day. No sizing guesses required.",
        image: "/hero/hero-flowers.webp",
        href: "/gift-cards",
        buttonText: "Buy Gift Card"
      },
    ],
  },
  {
    id: "inspiration",
    label: "Inspiration",
    sections: [
      {
        title: "The Gifting Guide",
        links: [
          { href: "/blog/trends", label: "2026 Gifting Trends", icon: <Star className="w-4 h-4" />, description: "What everyone is loving right now." },
          { href: "/blog/etiquette", label: "Gifting Etiquette", icon: <ScrollText className="w-4 h-4" />, description: "The unwritten rules of giving." },
          { href: "/blog/corporate-roi", label: "Corporate ROI", icon: <Activity className="w-4 h-4" />, description: "How gifting impacts client retention." },
        ],
      },
      {
        title: "Spotlight",
        links: [
          { href: "/makers", label: "Meet the Makers", icon: <Users className="w-4 h-4" />, description: "Stories behind our local artisans." },
          { href: "/sustainability", label: "Our Eco Promise", icon: <Leaf className="w-4 h-4" />, description: "How we're reducing our footprint." },
          { href: "/about", label: "The TouchGift Story", icon: <Heart className="w-4 h-4" />, description: "Why we started revolutionizing gifts." },
        ],
      }
    ],
    featured: [
      {
        title: "The TouchGift Magazine",
        description: "Dive into our editorial space for interviews, styling tips, and the art of modern gifting.",
        image: "/hero/hero-wine.webp",
        href: "/blog",
        buttonText: "Read the Mag"
      }
    ]
  }
];

export default function MegaMenu() {
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

  const activeData = MEGA_MENU_DATA.find((m) => m.id === activeMenu);

  return (
    <div ref={menuRef} className="relative" onMouseLeave={handleMouseLeave}>

      {/* NAV LINKS */}
      <nav className="flex items-center justify-center gap-10 py-3.5">
        {MEGA_MENU_DATA.map((item) => {
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
          className="absolute top-[calc(100%+4px)] left-0 z-50"
          style={{
            width: "min(900px, calc(100vw - 4rem))",
            animation: "slideDownFade 0.16s ease-out both",
          }}
        >
          <div className="absolute -top-2 left-0 right-0 h-2" />
          <div className="bg-white dark:bg-[#16162a] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.14),0_1px_0_rgba(155,27,90,0.07)] border border-gray-100 dark:border-white/10 overflow-hidden">
            <div className="grid grid-cols-12">

              {/* LINK COLUMNS */}
              <div className={`${activeData.featured ? "col-span-8" : "col-span-12"} grid divide-x divide-gray-100 dark:divide-white/8 ${
                activeData.sections.length === 1 ? "grid-cols-1"
                : activeData.sections.length === 2 ? "grid-cols-2"
                : "grid-cols-3"
              }`}>
                {activeData.sections.map((section) => (
                  <div key={section.title} className="p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-theme-body/50 mb-4 pb-2 border-b border-gray-100 dark:border-white/8">
                      {section.title}
                    </p>
                    <ul className="space-y-1.5">
                      {section.links.map((link) => (
                        <li key={link.href + link.label}>
                          <Link
                            href={link.href}
                            onClick={() => setActiveMenu(null)}
                            className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-brand/5 transition-all duration-200"
                          >
                            {link.icon && (
                              <span className="flex-shrink-0 w-8 h-8 mt-0.5 flex items-center justify-center rounded-lg bg-brand/6 text-brand/60 group-hover:bg-brand/12 group-hover:text-brand transition-all duration-200 [&>svg]:w-4 [&>svg]:h-4">
                                {link.icon}
                              </span>
                            )}
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[13px] font-bold text-theme-heading group-hover:text-brand transition-colors">
                                {link.label}
                              </span>
                              <span className="text-[11px] text-theme-body/60 underline decoration-theme-body/20 underline-offset-2">
                                {link.description || "Thoughtful choices, beautifully arranged"}
                              </span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* FEATURED CARD */}
              {activeData.featured && activeData.featured[0] && (
                <div className="col-span-4 relative overflow-hidden bg-gradient-to-br from-brand/7 via-brand/3 to-coral/5 dark:from-brand/15 dark:via-brand/8 dark:to-coral/10 p-6 flex flex-col">
                  <div className="absolute -top-10 -right-10 w-36 h-36 bg-brand/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-coral/15 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col h-full">
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-brand/60 mb-3">
                      <span className="w-4 h-px bg-brand/40" />
                      TouchGift Edit
                    </span>
                    <div className="w-full aspect-video mb-4 rounded-xl overflow-hidden shadow-lg ring-1 ring-black/5">
                      <Image
                        src={activeData.featured[0].image}
                        alt={activeData.featured[0].title}
                        width={260}
                        height={146}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="font-display font-bold text-[18px] text-theme-heading leading-snug mb-1.5">
                      {activeData.featured[0].title}
                    </p>
                    <p className="text-xs text-theme-body leading-relaxed mb-5 flex-1">
                      {activeData.featured[0].description}
                    </p>
                    <Link
                      href={activeData.featured[0].href}
                      onClick={() => setActiveMenu(null)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl text-xs font-bold hover:bg-brand-dark hover:shadow-[0_4px_16px_rgba(155,27,90,0.35)] hover:-translate-y-0.5 transition-all duration-200 self-start"
                    >
                      {activeData.featured[0].buttonText || "Explore"}
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </Link>
                  </div>
                </div>
              )}

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
