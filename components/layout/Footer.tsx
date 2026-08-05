import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-auto">
      <div className="px-4 md:px-8 py-8 space-y-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div>
            <p className="text-sm font-medium mb-1">On-time delivery or it&apos;s free</p>
            <p className="text-xs text-brand-muted">
              We guarantee same-day delivery in Nairobi if you order before 2pm.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Photo proof before dispatch</p>
            <p className="text-xs text-brand-muted">
              See a photo of the finished package before it leaves our warehouse.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Your identity stays private</p>
            <p className="text-xs text-brand-muted">
              Anonymous Mode hides your name and the price from the recipient.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brand-muted">
          <div className="flex gap-4">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <Link href="/gift-lab" className="hover:text-gray-900">Gift Lab</Link>
            <Link href="/orders" className="hover:text-gray-900">Orders</Link>
          </div>
          <a
            href="https://wa.me/254700000000"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900"
          >
            WhatsApp Support
          </a>
          <span>&copy; {new Date().getFullYear()} TouchGift</span>
        </div>
      </div>
    </footer>
  );
}
