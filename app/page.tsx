import CountdownBanner from "@/components/home/CountdownBanner";
import OccasionFilter from "@/components/home/OccasionFilter";
import ProductGrid from "@/components/home/ProductGrid";

// Home tab — search-first discovery.
// Section 3 & 8.1 of the implementation plan: occasion filters + narrative
// collections (Apology, Milestone, Just Because), featured/seasonal picks,
// same-day delivery cutoff countdown.
export default async function HomePage() {
  // TODO: fetch featured products + active occasion collections from the API
  return (
    <div className="px-4 md:px-8 py-4 space-y-6">
      <CountdownBanner />
      <OccasionFilter />
      <ProductGrid />
    </div>
  );
}
