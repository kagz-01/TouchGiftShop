// Practical occasion filters + narrative collections, side by side —
// per Section 3.7 of the implementation plan (layered, not either/or).
const PRACTICAL = ["Birthdays", "Anniversaries", "Weddings", "Condolences", "Corporate"];
const NARRATIVE = ["Apology", "Milestone", "Just Because"];

export default function OccasionFilter() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {[...PRACTICAL, ...NARRATIVE].map((label) => (
        <button
          key={label}
          className="whitespace-nowrap rounded-full border border-gray-300 px-4 py-1.5 text-sm"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
