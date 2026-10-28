/**
 * Primary category → chooser options for the mobile bottom bar.
 *
 * Arrangement: tapping a category chip in ShopBottomBar drops down this list
 * ("All Fragrances" / "For Him" / "For Her" / …); the category applies only
 * when an option is chosen. Categories with no entry filter instantly on tap.
 *
 * `group` splits options into sections (drinks → Alcoholic / Non-Alcoholic);
 * grouped categories render section headers in the sheet, ungrouped ones a
 * flat list. Values feed the existing `subcat` / `tag` params understood by
 * ProductGrid and GET /api/products (tags first, then name/description ILIKE
 * match), so word-based slugs are safe even before stock uses them as tags.
 *
 * Adding a new category later = add one entry here.
 *
 * NOTE: desktop still renders its own sub-pills (drinks/perfumes/corporate)
 * in ProductGridClient — keep values in sync when extending this registry.
 */
export type SubFilterDef = {
  label: string;
  param: "subcat" | "tag";
  value: string;
  group?: string;
};

export const SUBFILTER_REGISTRY: Record<string, SubFilterDef[]> = {
  perfumes: [
    { label: "For Him", param: "tag", value: "men" },
    { label: "For Her", param: "tag", value: "women" },
    { label: "Unisex", param: "tag", value: "unisex" },
    { label: "Arabic", param: "tag", value: "arabic" },
    { label: "Niche", param: "tag", value: "niche" },
    { label: "EDP", param: "tag", value: "edp" },
    { label: "EDT", param: "tag", value: "edt" },
    { label: "Gift Sets", param: "tag", value: "gift-set" },
  ],
  drinks: [
    { label: "Wines", param: "subcat", value: "wine", group: "Alcoholic" },
    { label: "Whiskies", param: "subcat", value: "whisky", group: "Alcoholic" },
    { label: "Vodka", param: "subcat", value: "vodka", group: "Alcoholic" },
    { label: "Gin", param: "subcat", value: "gin", group: "Alcoholic" },
    { label: "Rum", param: "subcat", value: "rum", group: "Alcoholic" },
    { label: "Champagne & Sparkling", param: "subcat", value: "champagne", group: "Alcoholic" },
    { label: "Brandy & Cognac", param: "subcat", value: "brandy", group: "Alcoholic" },
    { label: "Tequila", param: "subcat", value: "tequila", group: "Alcoholic" },
    { label: "Liqueurs", param: "subcat", value: "liqueur", group: "Alcoholic" },
    { label: "Ciders", param: "subcat", value: "cider", group: "Alcoholic" },
    { label: "Spirits", param: "subcat", value: "spirit", group: "Alcoholic" },
    { label: "Non-Alcoholic Drinks", param: "subcat", value: "non-alcoholic", group: "Non-Alcoholic" },
    { label: "Juices", param: "subcat", value: "juice", group: "Non-Alcoholic" },
    { label: "Tea & Coffee", param: "subcat", value: "tea", group: "Non-Alcoholic" },
    { label: "Sodas", param: "subcat", value: "soda", group: "Non-Alcoholic" },
  ],
  flowers: [
    { label: "Roses", param: "subcat", value: "rose" },
    { label: "Lilies", param: "subcat", value: "lily" },
    { label: "Tulips", param: "subcat", value: "tulip" },
    { label: "Bouquets", param: "subcat", value: "bouquet" },
    { label: "Dried Flowers", param: "subcat", value: "dried" },
  ],
  "gift-sets": [
    { label: "Hampers", param: "subcat", value: "hamper" },
    { label: "Gift Boxes", param: "subcat", value: "box" },
    { label: "Luxury Sets", param: "subcat", value: "luxury" },
  ],
  fruits: [
    { label: "Fruit Hampers", param: "subcat", value: "hamper" },
    { label: "Dried Fruits", param: "subcat", value: "dried" },
    { label: "Exotic Fruits", param: "subcat", value: "exotic" },
  ],
  apparel: [
    { label: "T-Shirts", param: "subcat", value: "t-shirt" },
    { label: "Hoodies", param: "subcat", value: "hoodie" },
    { label: "Socks", param: "subcat", value: "sock" },
    { label: "Caps", param: "subcat", value: "cap" },
  ],
  drinkware: [
    { label: "Mugs", param: "subcat", value: "mug" },
    { label: "Bottles", param: "subcat", value: "bottle" },
    { label: "Flasks", param: "subcat", value: "flask" },
    { label: "Travel Cups", param: "subcat", value: "cup" },
    { label: "Tumblers", param: "subcat", value: "tumbler" },
  ],
  "stationery-office": [
    { label: "Notebooks", param: "subcat", value: "notebook" },
    { label: "Pens", param: "subcat", value: "pen" },
    { label: "Diaries", param: "subcat", value: "diary" },
    { label: "Desk Accessories", param: "subcat", value: "desk" },
  ],
  "awards-trophies": [
    { label: "Trophies", param: "subcat", value: "trophy" },
    { label: "Medals", param: "subcat", value: "medal" },
    { label: "Plaques", param: "subcat", value: "plaque" },
  ],
  accessories: [
    { label: "Wallets", param: "subcat", value: "wallet" },
    { label: "Belts", param: "subcat", value: "belt" },
    { label: "Sunglasses", param: "subcat", value: "sunglass" },
    { label: "Keychains", param: "subcat", value: "keychain" },
    { label: "Cufflinks", param: "subcat", value: "cufflink" },
  ],
  bags: [
    { label: "Backpacks", param: "subcat", value: "backpack" },
    { label: "Tote Bags", param: "subcat", value: "tote" },
    { label: "Duffel Bags", param: "subcat", value: "duffel" },
    { label: "Handbags", param: "subcat", value: "handbag" },
    { label: "Laptop Bags", param: "subcat", value: "laptop" },
  ],
  clocks: [
    { label: "Wall Clocks", param: "subcat", value: "wall" },
    { label: "Wristwatches", param: "subcat", value: "watch" },
    { label: "Desk Clocks", param: "subcat", value: "desk" },
  ],
  "tech-gadgets": [
    { label: "Headphones", param: "subcat", value: "headphone" },
    { label: "Power Banks", param: "subcat", value: "power bank" },
    { label: "Speakers", param: "subcat", value: "speaker" },
    { label: "Smart Watches", param: "subcat", value: "smart" },
  ],
  corporate: [
    { label: "Gift Sets & Hampers", param: "subcat", value: "hamper" },
    { label: "Awards & Plaques", param: "subcat", value: "award" },
    { label: "Drinkware", param: "subcat", value: "mug" },
    { label: "Stationery", param: "subcat", value: "notebook" },
    { label: "Tech & Gadgets", param: "subcat", value: "tech" },
    { label: "Bags", param: "subcat", value: "bag" },
  ],
};

export function getSubFilters(slug?: string | null): SubFilterDef[] {
  return (slug && SUBFILTER_REGISTRY[slug]) || [];
}

/** Group consecutive options by `group` (undefined = ungrouped block). */
export function groupSubFilters(
  filters: SubFilterDef[]
): Array<{ name?: string; items: SubFilterDef[] }> {
  const groups: Array<{ name?: string; items: SubFilterDef[] }> = [];
  for (const f of filters) {
    const last = groups[groups.length - 1];
    if (last && last.name === f.group) last.items.push(f);
    else groups.push({ name: f.group, items: [f] });
  }
  return groups;
}
