"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bot, MessageCircle, Target, Zap, CreditCard, Cake, Heart, HeartHandshake, Baby, GraduationCap, Feather, HeartPulse, User, Users, Briefcase, ShoppingBasket, Flower2, Sparkles, Activity, Home, Smartphone, Map, FlaskConical, Gem, Gift, Sword, Church, Banknote, Diamond, ClipboardList, Clock, RefreshCw, ScrollText, Package, Truck, Undo, Flag, Shield, Drama, Hammer, Dumbbell, Egg, Star, Leaf, Candy, Flame, Tag, Trophy, ChefHat, Gamepad2, Music, Tent, Building2 } from "lucide-react";


type MegaMenuSection = {
  title: string;
  links: Array<{ href: string; label: string; icon?: React.ReactNode }>;
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
  }[];
};

const MEGA_MENU_DATA: MegaMenuCategory[] = [
  {
    id: "find",
    label: "Find a Gift",
    icon: <Bot className="w-5 h-5 text-brand" />,
    highlight: true,
    sections: [
      {
        title: "Smart Gifting",
        links: [
          { href: "/gift-finder", label: "T-Gifter AI", icon: <MessageCircle className="w-4 h-4" /> },
          { href: "/gift-quiz", label: "Gift Quiz (30 sec)", icon: <Target className="w-4 h-4" /> },
          { href: "/shop?delivery=same-day", label: "Same-Day Delivery", icon: <Zap className="w-4 h-4" /> },
          { href: "/gift-cards", label: "Gift Cards", icon: <CreditCard className="w-4 h-4" /> },
        ],
      },
      {
        title: "By Occasion",
        links: [
          { href: "/shop?category=birthdays", label: "Birthday", icon: <Cake className="w-4 h-4" /> },
          { href: "/shop?category=weddings", label: "Wedding", icon: <Heart className="w-4 h-4" /> },
          { href: "/shop?category=anniversaries", label: "Anniversary", icon: <HeartHandshake className="w-4 h-4" /> },
          { href: "/shop?category=baby", label: "New Baby", icon: <Baby className="w-4 h-4" /> },
          { href: "/shop?category=graduation", label: "Graduation", icon: <GraduationCap className="w-4 h-4" /> },
          { href: "/shop?category=condolences", label: "Condolences", icon: <Feather className="w-4 h-4" /> },
          { href: "/shop?category=just-because", label: "Just Because", icon: <HeartPulse className="w-4 h-4" /> },
        ],
      },
      {
        title: "By Recipient",
        links: [
          { href: "/shop?audience=her", label: "For Her", icon: <User className="w-4 h-4" /> },
          { href: "/shop?audience=him", label: "For Him", icon: <User className="w-4 h-4" /> },
          { href: "/shop?audience=baby", label: "For Baby", icon: <Baby className="w-4 h-4" /> },
          { href: "/shop?audience=parents", label: "For Parents", icon: <Users className="w-4 h-4" /> },
          { href: "/shop?audience=friend", label: "For Friends", icon: <Users className="w-4 h-4" /> },
          { href: "/shop?audience=colleague", label: "For Colleagues", icon: <Briefcase className="w-4 h-4" /> },
        ],
      },
      {
        title: "Collections",
        links: [
          { href: "/shop?category=hampers", label: "Hampers", icon: <ShoppingBasket className="w-4 h-4" /> },
          { href: "/shop?category=flowers", label: "Flowers", icon: <Flower2 className="w-4 h-4" /> },
          { href: "/shop?category=personalised", label: "Personalised", icon: <Sparkles className="w-4 h-4" /> },
          { href: "/shop?category=wellness", label: "Wellness & Self Care", icon: <Activity className="w-4 h-4" /> },
          { href: "/shop?category=home-decor", label: "Home & Living", icon: <Home className="w-4 h-4" /> },
          { href: "/shop?category=tech", label: "Tech & Gadgets", icon: <Smartphone className="w-4 h-4" /> },
          { href: "/shop?category=experiences", label: "Experiences", icon: <Map className="w-4 h-4" /> },
        ],
      },
    ],
    featured: [
      {
        title: "Not sure what to send?",
        description: "Tell T-Gifter who it's for and your budget. AI finds the perfect gift in seconds.",
        image: "/logo.webp",
        href: "/gift-finder",
      },
    ],
  },
  {
    id: "lab",
    label: "Gift Lab",
    icon: <FlaskConical className="w-5 h-5 text-brand" />,
    sections: [
      {
        title: "Build & Create",
        links: [
          { href: "/gift-lab", label: "Build a Hamper", icon: <FlaskConical className="w-4 h-4" /> },
          { href: "/pool/create", label: "Group Gift (Pool)", icon: <Users className="w-4 h-4" /> },
        ],
      },
      {
        title: "Kenyan Traditions",
        links: [
          { href: "/shop?cultural=ruracio", label: "Ruracio Guide", icon: <Gem className="w-4 h-4" /> },
          { href: "/shop?cultural=dowry", label: "Dowry (Mahari)", icon: <Gift className="w-4 h-4" /> },
          { href: "/shop?cultural=circumcision", label: "Circumcision", icon: <Sword className="w-4 h-4" /> },
          { href: "/shop?cultural=christening", label: "Christening", icon: <Church className="w-4 h-4" /> },
        ],
      },
      {
        title: "By Budget",
        links: [
          { href: "/shop?budget=under-5k", label: "Under KSh 5,000", icon: <Banknote className="w-4 h-4" /> },
          { href: "/shop?budget=under-10k", label: "Under KSh 10,000", icon: <Banknote className="w-4 h-4" /> },
          { href: "/shop?budget=under-20k", label: "Under KSh 20,000", icon: <Banknote className="w-4 h-4" /> },
          { href: "/shop?budget=premium", label: "Big Gestures (20k+)", icon: <Diamond className="w-4 h-4" /> },
        ],
      },
    ],
    featured: [
      {
        title: "Build the Perfect Hamper",
        description: "Mix and match items, add a gift note, and we'll wrap it all together.",
        image: "/logo.webp",
        href: "/gift-lab",
      },
    ],
  },
  {
    id: "my-stuff",
    label: "My Stuff",
    icon: <ClipboardList className="w-5 h-5 text-brand" />,
    sections: [
      {
        title: "My Lists",
        links: [
          { href: "/wishlist", label: "Wishlist", icon: <HeartPulse className="w-4 h-4" /> },
          { href: "/reminders", label: "Gift Reminders", icon: <Clock className="w-4 h-4" /> },
          { href: "/gift-cards", label: "My Gift Cards", icon: <CreditCard className="w-4 h-4" /> },
        ],
      },
      {
        title: "Smart Features",
        links: [
          { href: "/gift-quiz", label: "Taste Profiles", icon: <Target className="w-4 h-4" /> },
          { href: "/orders", label: "Smart Reorder", icon: <RefreshCw className="w-4 h-4" /> },
          { href: "/orders", label: "Gift History", icon: <ScrollText className="w-4 h-4" /> },
        ],
      },
      {
        title: "My Orders",
        links: [
          { href: "/orders", label: "All Orders", icon: <Package className="w-4 h-4" /> },
          { href: "/track", label: "Track Delivery", icon: <Truck className="w-4 h-4" /> },
          { href: "/returns", label: "Returns & Refunds", icon: <Undo className="w-4 h-4" /> },
        ],
      },
    ],
  },
  {
    id: "occasions",
    label: "Occasions",
    sections: [
      {
        title: "Celebrations",
        links: [
          { href: "/shop?category=birthdays", label: "Birthday", icon: <Cake className="w-4 h-4" /> },
          { href: "/shop?category=weddings", label: "Wedding", icon: <Heart className="w-4 h-4" /> },
          { href: "/shop?category=anniversaries", label: "Anniversary", icon: <HeartHandshake className="w-4 h-4" /> },
          { href: "/shop?category=graduation", label: "Graduation", icon: <GraduationCap className="w-4 h-4" /> },
          { href: "/shop?category=baby", label: "New Baby", icon: <Baby className="w-4 h-4" /> },
          { href: "/shop?category=housewarming", label: "Housewarming", icon: <Home className="w-4 h-4" /> },
        ],
      },
      {
        title: "Sentiments",
        links: [
          { href: "/shop?category=thank-you", label: "Thank You", icon: <HeartHandshake className="w-4 h-4" /> },
          { href: "/shop?category=condolences", label: "Condolences", icon: <Feather className="w-4 h-4" /> },
          { href: "/shop?category=get-well", label: "Get Well Soon", icon: <Flower2 className="w-4 h-4" /> },
          { href: "/shop?category=just-because", label: "Just Because", icon: <HeartPulse className="w-4 h-4" /> },
          { href: "/shop?category=apology", label: "Sorry / Apology", icon: <Flower2 className="w-4 h-4" /> },
        ],
      },
      {
        title: "Kenyan Holidays",
        links: [
          { href: "/shop?holiday=madaraka", label: "Madaraka Day", icon: <Flag className="w-4 h-4" /> },
          { href: "/shop?holiday=mashujaa", label: "Mashujaa Day", icon: <Shield className="w-4 h-4" /> },
          { href: "/shop?holiday=jamhuri", label: "Jamhuri Day", icon: <Flag className="w-4 h-4" /> },
          { href: "/shop?holiday=utamaduni", label: "Utamaduni Day", icon: <Drama className="w-4 h-4" /> },
          { href: "/shop?holiday=labour-day", label: "Labour Day", icon: <Hammer className="w-4 h-4" /> },
          { href: "/shop?holiday=womens-day", label: "Women's Day", icon: <Dumbbell className="w-4 h-4" /> },
        ],
      },
      {
        title: "International",
        links: [
          { href: "/shop?holiday=valentines", label: "Valentine's Day", icon: <Heart className="w-4 h-4" /> },
          { href: "/shop?holiday=mothers-day", label: "Mother's Day", icon: <User className="w-4 h-4" /> },
          { href: "/shop?holiday=fathers-day", label: "Father's Day", icon: <User className="w-4 h-4" /> },
          { href: "/shop?holiday=easter", label: "Easter", icon: <Egg className="w-4 h-4" /> },
          { href: "/shop?holiday=christmas", label: "Christmas", icon: <Sparkles className="w-4 h-4" /> },
          { href: "/shop?holiday=eid", label: "Eid al-Fitr / al-Adha", icon: <Star className="w-4 h-4" /> },
        ],
      },
      {
        title: "By Community",
        links: [
          { href: "/shop?cultural=ruracio", label: "Ruracio (Engagement)", icon: <Gem className="w-4 h-4" /> },
          { href: "/shop?cultural=dowry", label: "Dowry (Mahari)", icon: <Gift className="w-4 h-4" /> },
          { href: "/shop?cultural=christening", label: "Christening", icon: <Church className="w-4 h-4" /> },
          { href: "/shop?cultural=funeral", label: "Funeral / Condolence", icon: <Feather className="w-4 h-4" /> },
          { href: "/shop?cultural=graduation", label: "Graduation", icon: <GraduationCap className="w-4 h-4" /> },
        ],
      },
    ],
  },
  {
    id: "collections",
    label: "Collections",
    sections: [
      {
        title: "Popular",
        links: [
          { href: "/shop?category=hampers", label: "Hampers & Gift Sets", icon: <ShoppingBasket className="w-4 h-4" /> },
          { href: "/shop?category=flowers", label: "Flowers & Bouquets", icon: <Flower2 className="w-4 h-4" /> },
          { href: "/shop?category=personalised", label: "Personalised", icon: <Sparkles className="w-4 h-4" /> },
          { href: "/shop?category=chocolates", label: "Chocolates & Sweets", icon: <Candy className="w-4 h-4" /> },
        ],
      },
      {
        title: "Lifestyle",
        links: [
          { href: "/shop?category=wellness", label: "Wellness & Self Care", icon: <Activity className="w-4 h-4" /> },
          { href: "/shop?category=home-decor", label: "Home & Living", icon: <Home className="w-4 h-4" /> },
          { href: "/shop?category=kitchen", label: "Kitchen & Dining", icon: <ChefHat className="w-4 h-4" /> },
          { href: "/shop?category=plants", label: "Plants & Planters", icon: <Leaf className="w-4 h-4" /> },
          { href: "/shop?category=candles", label: "Candles & Diffusers", icon: <Flame className="w-4 h-4" /> },
        ],
      },
      {
        title: "Interests",
        links: [
          { href: "/shop?category=fitness", label: "Fitness & Sports", icon: <Dumbbell className="w-4 h-4" /> },
          { href: "/shop?category=gaming", label: "Gaming", icon: <Gamepad2 className="w-4 h-4" /> },
          { href: "/shop?category=music", label: "Music", icon: <Music className="w-4 h-4" /> },
          { href: "/shop?category=outdoor", label: "Outdoor & Adventure", icon: <Tent className="w-4 h-4" /> },
          { href: "/shop?category=tech", label: "Tech & Gadgets", icon: <Smartphone className="w-4 h-4" /> },
          { href: "/shop?category=experiences", label: "Experiences", icon: <Map className="w-4 h-4" /> },
        ],
      },
    ],
  },
  {
    id: "corporate",
    label: "Corporate",
    sections: [
      {
        title: "Corporate Gifting",
        links: [
          { href: "/corporate", label: "Overview", icon: <Building2 className="w-4 h-4" /> },
          { href: "/corporate/build", label: "Bulk Orders", icon: <Package className="w-4 h-4" /> },
          { href: "/corporate/whitelabel", label: "Branded Gifts", icon: <Tag className="w-4 h-4" /> },
          { href: "/corporate/clients", label: "Client Gifts", icon: <Users className="w-4 h-4" /> },
          { href: "/corporate/milestones", label: "Employee Rewards", icon: <Trophy className="w-4 h-4" /> },
        ],
      },
      {
        title: "By Occasion",
        links: [
          { href: "/corporate/build", label: "End of Year", icon: <Sparkles className="w-4 h-4" /> },
          { href: "/corporate/pools", label: "Team Building", icon: <Users className="w-4 h-4" /> },
          { href: "/corporate/milestones", label: "Work Anniversaries", icon: <Trophy className="w-4 h-4" /> },
          { href: "/corporate/build", label: "New Hire Welcome", icon: <Heart className="w-4 h-4" /> },
        ],
      },
    ],
    featured: [
      {
        title: "Corporate Gifting Made Easy",
        description: "Bulk orders, custom branding, and dedicated account manager. From KSh 500/gift.",
        image: "/logo.webp",
        href: "/corporate",
      },
    ],
  },
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
    <div ref={menuRef} className="relative">
      <nav className="flex items-center gap-1">
        {MEGA_MENU_DATA.map((item) => (
          <button
            key={item.id}
            onMouseEnter={() => handleMouseEnter(item.id)}
            onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 relative ${
              activeMenu === item.id
                ? "bg-brand/10 text-brand"
                : item.highlight
                ? "bg-brand/5 text-brand hover:bg-brand/10"
                : "text-theme-heading hover:bg-brand/5 hover:text-brand"
            }`}
          >
            {item.icon && <span className="flex items-center">{item.icon}</span>}
            {item.label}
            {item.highlight && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-coral rounded-full animate-pulse-soft" />
            )}
          </button>
        ))}
      </nav>

      {activeData && (
        <div
          onMouseEnter={() => handleMouseEnter(activeData.id)}
          onMouseLeave={handleMouseLeave}
          className="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-5xl z-50 animate-slide-down origin-top"
        >
          <div className="card-theme shape-premium-card shadow-2xl border border-surface-border overflow-hidden">
            <div className="grid grid-cols-12 gap-0">
              <div
                className={`${
                  activeData.featured ? "col-span-8" : "col-span-12"
                } grid ${
                  activeData.sections.length === 1
                    ? "grid-cols-1"
                    : activeData.sections.length === 2
                    ? "grid-cols-2"
                    : activeData.sections.length === 3
                    ? "grid-cols-3"
                    : "grid-cols-4"
                } gap-0`}
              >
                {activeData.sections.map((section) => (
                  <div
                    key={section.title}
                    className="p-6 border-r border-surface-border last:border-r-0"
                  >
                    <h4 className="text-xs font-semibold text-theme-body uppercase tracking-wider mb-4">
                      {section.title}
                    </h4>
                    <ul className="space-y-2.5">
                      {section.links.map((link) => (
                        <li key={link.href + link.label}>
                          <Link
                            href={link.href}
                            onClick={() => setActiveMenu(null)}
                            className="flex items-center gap-2 text-sm text-theme-heading opacity-80 hover:opacity-100 hover:text-brand transition-all duration-300 hover:translate-x-1 group"
                          >
                            {link.icon && (<span className="opacity-70 group-hover:opacity-100 transition-opacity">{link.icon}</span>)}
                            <span>{link.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {activeData.featured && activeData.featured[0] && (
                <div className="col-span-4 bg-gradient-to-br from-brand/5 to-coral/5 p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 mb-4 shape-premium-card overflow-hidden bg-white shadow-soft p-2">
                    <Image
                      src={activeData.featured[0].image}
                      alt={activeData.featured[0].title}
                      width={80}
                      height={80}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <p className="font-display font-semibold text-sm mb-1 text-theme-heading">
                    {activeData.featured[0].title}
                  </p>
                  <p className="text-xs text-theme-body mb-3 max-w-[200px]">
                    {activeData.featured[0].description}
                  </p>
                  <Link
                    href={activeData.featured[0].href}
                    onClick={() => setActiveMenu(null)}
                    className="px-4 py-2 bg-brand text-white rounded-xl text-xs font-semibold hover:bg-brand-dark transition-colors"
                  >
                    Try Now →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
