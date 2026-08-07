"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

type MegaMenuSection = {
  title: string;
  links: Array<{ href: string; label: string; emoji?: string }>;
};

type MegaMenuCategory = {
  id: string;
  label: string;
  icon?: string;
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
    icon: "🤖",
    highlight: true,
    sections: [
      {
        title: "Smart Gifting",
        links: [
          { href: "/gift-finder", label: "T-Gifter AI", emoji: "💬" },
          { href: "/gift-quiz", label: "Gift Quiz (30 sec)", emoji: "🎯" },
          { href: "/?delivery=same-day", label: "Same-Day Delivery", emoji: "⚡" },
          { href: "/gift-cards", label: "Gift Cards", emoji: "💳" },
        ],
      },
      {
        title: "By Occasion",
        links: [
          { href: "/?category=birthdays", label: "Birthday", emoji: "🎂" },
          { href: "/?category=weddings", label: "Wedding", emoji: "💒" },
          { href: "/?category=anniversaries", label: "Anniversary", emoji: "💕" },
          { href: "/?category=baby", label: "New Baby", emoji: "👶" },
          { href: "/?category=graduation", label: "Graduation", emoji: "🎓" },
          { href: "/?category=condolences", label: "Condolences", emoji: "🕊️" },
          { href: "/?category=just-because", label: "Just Because", emoji: "💝" },
        ],
      },
      {
        title: "By Recipient",
        links: [
          { href: "/?audience=her", label: "For Her", emoji: "👩" },
          { href: "/?audience=him", label: "For Him", emoji: "👨" },
          { href: "/?audience=baby", label: "For Baby", emoji: "👶" },
          { href: "/?audience=parents", label: "For Parents", emoji: "👨‍👩‍👧" },
          { href: "/?audience=friend", label: "For Friends", emoji: "🤝" },
          { href: "/?audience=colleague", label: "For Colleagues", emoji: "💼" },
        ],
      },
      {
        title: "Collections",
        links: [
          { href: "/?category=hampers", label: "Hampers", emoji: "🧺" },
          { href: "/?category=flowers", label: "Flowers", emoji: "🌸" },
          { href: "/?category=personalised", label: "Personalised", emoji: "✨" },
          { href: "/?category=wellness", label: "Wellness & Self Care", emoji: "🧘" },
          { href: "/?category=home-decor", label: "Home & Living", emoji: "🏠" },
          { href: "/?category=tech", label: "Tech & Gadgets", emoji: "📱" },
          { href: "/?category=experiences", label: "Experiences", emoji: "🧖" },
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
    icon: "🧪",
    sections: [
      {
        title: "Build & Create",
        links: [
          { href: "/gift-lab", label: "Build a Hamper", emoji: "🧪" },
          { href: "/gift-lab/pool", label: "Group Gift (Pool)", emoji: "👥" },
        ],
      },
      {
        title: "Kenyan Traditions",
        links: [
          { href: "/?cultural=ruracio", label: "Ruracio Guide", emoji: "💍" },
          { href: "/?cultural=dowry", label: "Dowry (Mahari)", emoji: "🐄" },
          { href: "/?cultural=circumcision", label: "Circumcision", emoji: "🗡️" },
          { href: "/?cultural=christening", label: "Christening", emoji: "⛪" },
        ],
      },
      {
        title: "By Budget",
        links: [
          { href: "/?budget=under-5k", label: "Under KSh 5,000", emoji: "💰" },
          { href: "/?budget=under-10k", label: "Under KSh 10,000", emoji: "💰💰" },
          { href: "/?budget=under-20k", label: "Under KSh 20,000", emoji: "💰💰💰" },
          { href: "/?budget=premium", label: "Big Gestures (20k+)", emoji: "💎" },
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
    icon: "📋",
    sections: [
      {
        title: "My Lists",
        links: [
          { href: "/wishlist", label: "Wishlist", emoji: "💝" },
          { href: "/reminders", label: "Gift Reminders", emoji: "⏰" },
          { href: "/gift-cards", label: "My Gift Cards", emoji: "💳" },
        ],
      },
      {
        title: "Smart Features",
        links: [
          { href: "/?feature=taste-profile", label: "Taste Profiles", emoji: "🎯" },
          { href: "/?feature=smart-reorder", label: "Smart Reorder", emoji: "🔄" },
          { href: "/?feature=gift-history", label: "Gift History", emoji: "📜" },
        ],
      },
      {
        title: "My Orders",
        links: [
          { href: "/orders", label: "All Orders", emoji: "📦" },
          { href: "/track", label: "Track Delivery", emoji: "🚚" },
          { href: "/returns", label: "Returns & Refunds", emoji: "↩️" },
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
          { href: "/?category=birthdays", label: "Birthday", emoji: "🎂" },
          { href: "/?category=weddings", label: "Wedding", emoji: "💒" },
          { href: "/?category=anniversaries", label: "Anniversary", emoji: "💕" },
          { href: "/?category=graduation", label: "Graduation", emoji: "🎓" },
          { href: "/?category=baby", label: "New Baby", emoji: "👶" },
          { href: "/?category=housewarming", label: "Housewarming", emoji: "🏠" },
        ],
      },
      {
        title: "Sentiments",
        links: [
          { href: "/?category=thank-you", label: "Thank You", emoji: "🙏" },
          { href: "/?category=condolences", label: "Condolences", emoji: "🕊️" },
          { href: "/?category=get-well", label: "Get Well Soon", emoji: "🌸" },
          { href: "/?category=just-because", label: "Just Because", emoji: "💝" },
          { href: "/?category=apology", label: "Sorry / Apology", emoji: "💐" },
        ],
      },
      {
        title: "Kenyan Holidays",
        links: [
          { href: "/?holiday=madaraka", label: "Madaraka Day", emoji: "🇰🇪" },
          { href: "/?holiday=mashujaa", label: "Mashujaa Day", emoji: "🛡️" },
          { href: "/?holiday=jamhuri", label: "Jamhuri Day", emoji: "🇰🇪" },
          { href: "/?holiday=utamaduni", label: "Utamaduni Day", emoji: "🎭" },
          { href: "/?holiday=labour-day", label: "Labour Day", emoji: "⚒️" },
          { href: "/?holiday=womens-day", label: "Women's Day", emoji: "💪" },
        ],
      },
      {
        title: "International",
        links: [
          { href: "/?holiday=valentines", label: "Valentine's Day", emoji: "❤️" },
          { href: "/?holiday=mothers-day", label: "Mother's Day", emoji: "👩" },
          { href: "/?holiday=fathers-day", label: "Father's Day", emoji: "👨" },
          { href: "/?holiday=easter", label: "Easter", emoji: "🐣" },
          { href: "/?holiday=christmas", label: "Christmas", emoji: "🎄" },
          { href: "/?holiday=eid", label: "Eid al-Fitr / al-Adha", emoji: "🌙" },
        ],
      },
      {
        title: "By Community",
        links: [
          { href: "/?community=kikuyu", label: "Kikuyu", emoji: "🏔️" },
          { href: "/?community=luo", label: "Luo", emoji: "🐟" },
          { href: "/?community=kalenjin", label: "Kalenjin", emoji: "🏃" },
          { href: "/?community=maasai", label: "Maasai", emoji: "🦁" },
          { href: "/?community=coastal", label: "Coastal / Swahili", emoji: "🌊" },
          { href: "/?community=luhya", label: "Luhya", emoji: "🌽" },
          { href: "/?community=meru", label: "Meru", emoji: "⛰️" },
        ],
      },
      {
        title: "Life Moments",
        links: [
          { href: "/?cultural=ruracio", label: "Ruracio (Engagement)", emoji: "💍" },
          { href: "/?cultural=dowry", label: "Dowry (Mahari)", emoji: "🐄" },
          { href: "/?cultural=circumcision", label: "Circumcision", emoji: "🗡️" },
          { href: "/?cultural=christening", label: "Christening", emoji: "⛪" },
          { href: "/?cultural=funeral", label: "Funeral / Condolence", emoji: "🕊️" },
          { href: "/?cultural=graduation", label: "Graduation", emoji: "🎓" },
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
          { href: "/?category=hampers", label: "Hampers & Gift Sets", emoji: "🧺" },
          { href: "/?category=flowers", label: "Flowers & Bouquets", emoji: "🌸" },
          { href: "/?category=personalised", label: "Personalised", emoji: "✨" },
          { href: "/?category=chocolates", label: "Chocolates & Sweets", emoji: "🍫" },
        ],
      },
      {
        title: "Lifestyle",
        links: [
          { href: "/?category=wellness", label: "Wellness & Self Care", emoji: "🧘" },
          { href: "/?category=home-decor", label: "Home & Living", emoji: "🏠" },
          { href: "/?category=kitchen", label: "Kitchen & Dining", emoji: "🍳" },
          { href: "/?category=plants", label: "Plants & Planters", emoji: "🪴" },
          { href: "/?category=candles", label: "Candles & Diffusers", emoji: "🕯️" },
        ],
      },
      {
        title: "Interests",
        links: [
          { href: "/?category=fitness", label: "Fitness & Sports", emoji: "💪" },
          { href: "/?category=gaming", label: "Gaming", emoji: "🎮" },
          { href: "/?category=music", label: "Music", emoji: "🎵" },
          { href: "/?category=outdoor", label: "Outdoor & Adventure", emoji: "⛺" },
          { href: "/?category=tech", label: "Tech & Gadgets", emoji: "📱" },
          { href: "/?category=experiences", label: "Experiences", emoji: "🧖" },
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
          { href: "/corporate", label: "Overview", emoji: "🏢" },
          { href: "/corporate?tab=bulk", label: "Bulk Orders", emoji: "📦" },
          { href: "/corporate?tab=branded", label: "Branded Gifts", emoji: "🏷️" },
          { href: "/corporate?tab=clients", label: "Client Gifts", emoji: "🤝" },
          { href: "/corporate?tab=employees", label: "Employee Rewards", emoji: "🎉" },
        ],
      },
      {
        title: "By Occasion",
        links: [
          { href: "/corporate?occasion=end-year", label: "End of Year", emoji: "🎄" },
          { href: "/corporate?occasion=team-building", label: "Team Building", emoji: "🏋️" },
          { href: "/corporate?occasion=milestones", label: "Work Anniversaries", emoji: "🏆" },
          { href: "/corporate?occasion=onboarding", label: "New Hire Welcome", emoji: "👋" },
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
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${
              activeMenu === item.id
                ? "bg-brand/10 text-brand"
                : item.highlight
                ? "bg-brand/5 text-brand hover:bg-brand/10"
                : "text-brand-deep hover:bg-brand/5 hover:text-brand"
            }`}
          >
            {item.icon && <span className="text-base">{item.icon}</span>}
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
          className="absolute top-full left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-5xl mt-2 z-50"
        >
          <div className="bg-white rounded-2xl shadow-card-hover border border-surface-border overflow-hidden animate-pop">
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
                    <h4 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-4">
                      {section.title}
                    </h4>
                    <ul className="space-y-2.5">
                      {section.links.map((link) => (
                        <li key={link.href + link.label}>
                          <Link
                            href={link.href}
                            onClick={() => setActiveMenu(null)}
                            className="flex items-center gap-2 text-sm text-brand-deep/80 hover:text-brand transition-colors group"
                          >
                            {link.emoji && (
                              <span className="text-sm group-hover:scale-110 transition-transform">
                                {link.emoji}
                              </span>
                            )}
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
                  <div className="w-20 h-20 mb-4 rounded-2xl overflow-hidden bg-white shadow-soft p-2">
                    <Image
                      src={activeData.featured[0].image}
                      alt={activeData.featured[0].title}
                      width={80}
                      height={80}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <p className="font-display font-semibold text-sm mb-1">
                    {activeData.featured[0].title}
                  </p>
                  <p className="text-xs text-brand-muted mb-3 max-w-[200px]">
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
