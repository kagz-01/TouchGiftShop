import HamperBuilder from "@/components/gift-lab/HamperBuilder";
import BackToHome from "@/components/ui/BackToHome";

export default function BuildHamperPage() {
  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="w-full mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl md:text-3xl font-bold">Build a Hamper</h1>
          <p className="text-sm text-brand-muted mt-1">
            Choose a box size, then pick products to fill it
          </p>
        </div>
        <div className="mb-4">
          <BackToHome />
        </div>
        <HamperBuilder />
      </div>
    </div>
  );
}
