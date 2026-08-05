import HamperBuilder from "@/components/gift-lab/HamperBuilder";

export default function BuildHamperPage() {
  return (
    <div className="px-4 md:px-8 py-6 space-y-4">
      <h1 className="text-xl font-semibold">Build a Hamper</h1>
      <HamperBuilder />
    </div>
  );
}
