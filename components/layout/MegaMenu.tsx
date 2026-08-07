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
  highlight?: boolean;
  sections: MegaMenuSection[];
  featured?: {
    title: string;
    image: string;
    href: string;
    price?: string;
  }[];
  image?: string;
};

const MEGA_MENU_DATA: MegaMenuCategory[] = [
  {
    id: "hampers",
    label: "Hampers",
    sections: [
      {
        title: "Who's it For",
        links: [
          { href: "/?category=hampers", label: "Hampers for Her", emoji: "👩" },
          { href: "/?category=hampers", label: "Hampers for Him", emoji: "👨" },
          { href: "/?category=hampers", label: "New Mum & Baby", emoji: "👶" },
          { href: "/corporate", label: "Corporate Hampers", emoji: "🏢" },
        ],
      },
      {
        title: "By Type",
        links: [
          { href: "/?category=hampers", label: "Tea & Coffee Hampers", emoji: "☕" },
          { href: "/?category=hampers", label: "Chocolate Hampers", emoji: "🍫" },
          { href: "/?category=hampers", label: "Flower Hampers", emoji: "💐" },
          { href: "/?category=hampers", label: "Self Care Hampers", emoji: "🧴" },
        ],
      },
      {
        title: "Shop By Budget",
        links: [
          { href: "/?budget=under-5k", label: "Below KSh 5,000" },
          { href: "/?budget=under-10k", label: "Below KSh 10,000" },
          { href: "/?budget=under-20k", label: "Below KSh 20,000" },
          { href: "/?budget=premium", label: "Big Gestures" },
        ],
      },
    ],
    featured: [
      { title: "Corporate Hampers", image: "/logo.webp", href: "/corporate", price: "From KSh 1,500" },
    ],
  },
  {
    id: "her",
    label: "For Her",
    sections: [
      {
        title: "Who is She?",
        links: [
          { href: "/?category=her", label: "Gifts for Girlfriends", emoji: "💕" },
          { href: "/?category=her", label: "Gifts for Wives", emoji: "💍" },
          { href: "/?category=her", label: "Gifts for Mum", emoji: "👩‍👧" },
          { href: "/?category=her", label: "Gifts for Sisters", emoji: "👯" },
          { href: "/?category=her", label: "Gifts for Grandma", emoji: "👵" },
          { href: "/?category=her", label: "Gifts for Friends", emoji: "🤝" },
        ],
      },
      {
        title: "By Category",
        links: [
          { href: "/?category=flowers", label: "Flowers & Bouquets", emoji: "🌸" },
          { href: "/?category=chocolates", label: "Chocolates & Sweets", emoji: "🍫" },
          { href: "/?category=jewellery", label: "Jewellery & Watches", emoji: "💎" },
          { href: "/?category=personalised", label: "Personalised Gifts", emoji: "✨" },
          { href: "/?category=spa", label: "Spa & Self Care", emoji: "🧖" },
        ],
      },
    ],
  },
  {
    id: "him",
    label: "For Him",
    sections: [
      {
        title: "Who is He?",
        links: [
          { href: "/?category=him", label: "Gifts for Boyfriends", emoji: "💑" },
          { href: "/?category=him", label: "Gifts for Husbands", emoji: "💍" },
          { href: "/?category=him", label: "Gifts for Dads", emoji: "👨‍👧" },
          { href: "/?category=him", label: "Gifts for Grandpa", emoji: "👴" },
        ],
      },
      {
        title: "By Interest",
        links: [
          { href: "/?category=drinks", label: "Drinks & Bar", emoji: "🥃" },
          { href: "/?category=gadgets", label: "Tech & Gadgets", emoji: "📱" },
          { href: "/?category=grooming", label: "Grooming & Wellness", emoji: "🧴" },
          { href: "/?category=stationery", label: "Desk & Stationery", emoji: "🖊️" },
          { href: "/?category=sports", label: "Sports & Outdoors", emoji: "⚽" },
        ],
      },
    ],
  },
  {
    id: "occasions",
    label: "Occasions",
    highlight: true,
    sections: [
      {
        title: "Celebrations",
        links: [
          { href: "/?category=birthdays", label: "Birthday", emoji: "🎂" },
          { href: "/?category=anniversaries", label: "Anniversary", emoji: "💕" },
          { href: "/?category=weddings", label: "Wedding", emoji: "💒" },
          { href: "/?category=graduation", label: "Graduation", emoji: "🎓" },
          { href: "/?category=baby", label: "New Baby", emoji: "👶" },
        ],
      },
      {
        title: "Sentiments",
        links: [
          { href: "/?category=thank-you", label: "Thank You", emoji: "🙏" },
          { href: "/?category=apology", label: "Apology", emoji: "💐" },
          { href: "/?category=condolences", label: "Sympathy & Condolences", emoji: "🕊️" },
          { href: "/?category=get-well", label: "Get Well Soon", emoji: "🌸" },
          { href: "/?category=just-because", label: "Just Because", emoji: "💝" },
        ],
      },
    ],
  },
  {
    id: "more",
    label: "More Ideas",
    sections: [
      {
        title: "Popular",
        links: [
          { href: "/gift-quiz", label: "Gift Finder Quiz", emoji: "🎯" },
          { href: "/gift-finder", label: "AI Gift Finder", emoji: "🤖" },
          { href: "/gift-lab", label: "Build a Hamper", emoji: "🧪" },
          { href: "/gift-lab/pool", label: "Pool a Gift", emoji: "👥" },
          { href: "/gift-cards", label: "Gift Cards", emoji: "💳" },
          { href: "/reminders", label: "Gift Reminders", emoji: "⏰" },
        ],
      },
      {
        title: "Collections",
        links: [
          { href: "/?category=personalised", label: "Personalised", emoji: "✨" },
          { href: "/?category=flowers", label: "Flowers", emoji: "🌸" },
          { href: "/?category=beverages", label: "Beverages", emoji: "🍷" },
          { href: "/?category=plants", label: "Plants", emoji: "🪴" },
          { href: "/?category=fitness", label: "Fitness", emoji: "💪" },
          { href: "/?category=gaming", label: "Gaming", emoji: "🎮" },
          { href: "/?category=music", label: "Music", emoji: "🎵" },
          { href: "/?category=outdoor", label: "Outdoor", emoji: "⛺" },
          { href: "/?category=home-decor", label: "Home Decor", emoji: "🏠" },
          { href: "/?category=kitchen", label: "Kitchen", emoji: "🍳" },
        ],
      },
      {
        title: "By Type",
        links: [
          { href: "/?category=food-treats", label: "Food & Treats", emoji: "🍫" },
          { href: "/?category=books-media", label: "Books & Media", emoji: "📚" },
          { href: "/?category=experience-gifts", label: "Experiences", emoji: "🧘" },
          { href: "/?category=subscriptions", label: "Subscriptions", emoji: "📦" },
          { href: "/?category=pet-gifts", label: "Pet Gifts", emoji: "🐾" },
          { href: "/?category=candles", label: "Candles & Diffusers", emoji: "🕯️" },
        ],
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

  const activeData = MEGA_MENU_DATA.find((m) => m.id === activeMenu);

  return (
    <div ref={menuRef} className="relative">
      {/* Nav triggers */}
      <nav className="flex items-center gap-1">
        {MEGA_MENU_DATA.map((item) => (
          <button
            key={item.id}
            onMouseEnter={() => handleMouseEnter(item.id)}
            onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative ${
              activeMenu === item.id
                ? "bg-brand/10 text-brand"
                : item.highlight
                ? "text-coral hover:bg-coral/10"
                : "text-brand-deep hover:bg-brand/5 hover:text-brand"
            }`}
          >
            {item.label}
            {item.highlight && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-coral rounded-full animate-pulse-soft" />
            )}
          </button>
        ))}
      </nav>

      {/* Mega panel */}
      {activeData && (
        <div
          onMouseEnter={() => handleMouseEnter(activeData.id)}
          onMouseLeave={handleMouseLeave}
          className="absolute top-full left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-5xl mt-2 z-50"
        >
          <div className="bg-white rounded-2xl shadow-card-hover border border-surface-border overflow-hidden animate-pop">
            <div className="grid grid-cols-12 gap-0">
              {/* Main columns */}
              <div className={`${activeData.featured ? 'col-span-8' : 'col-span-12'} grid ${activeData.sections.length === 1 ? 'grid-cols-1' : activeData.sections.length === 2 ? 'grid-cols-2' : activeData.sections.length === 3 ? 'grid-cols-3' : 'grid-cols-4'} gap-0`}>
                {activeData.sections.map((section) => (
                  <div key={section.title} className="p-6 border-r border-surface-border last:border-r-0">
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
                            {link.emoji && <span className="text-sm group-hover:scale-110 transition-transform">{link.emoji}</span>}
                            <span>{link.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Featured product */}
              {activeData.featured && activeData.featured[0] && (
                <div className="col-span-4 bg-gradient-warm p-6 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 mb-4 rounded-full overflow-hidden bg-white shadow-soft">
                    <Image
                      src={activeData.featured[0].image}
                      alt={activeData.featured[0].title}
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  </div>
                  <p className="font-display font-semibold text-sm text-center mb-1">{activeData.featured[0].title}</p>
                  {activeData.featured[0].price && (
                    <p className="text-brand text-xs font-semibold mb-3">{activeData.featured[0].price}</p>
                  )}
                  <Link
                    href={activeData.featured[0].href}
                    onClick={() => setActiveMenu(null)}
                    className="px-4 py-2 bg-brand text-white rounded-xl text-xs font-semibold hover:bg-brand-dark transition-colors"
                  >
                    Explore →
                  </Link>
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-surface-border">
              <Link
                href="/gift-finder"
                onClick={() => setActiveMenu(null)}
                className="text-xs text-brand font-semibold hover:text-brand-dark transition-colors flex items-center gap-1"
              >
                🤖 Can&apos;t decide? Ask T-Gifter — our AI Gift Finder
              </Link>
              <Link
                href="/corporate"
                onClick={() => setActiveMenu(null)}
                className="text-xs text-brand-muted hover:text-brand transition-colors"
              >
                Corporate Gifting →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
