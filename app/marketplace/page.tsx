"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Building, Mail, Phone, CheckCircle2 } from "lucide-react";

export default function MarketplacePage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/corporate/marketplace/vendors")
      .then((r) => r.json())
      .then((d) => { setVendors(d.vendors ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = ["all", ...new Set(vendors.map((v) => v.category).filter(Boolean))];
  const filteredVendors = filter === "all" ? vendors : vendors.filter((v) => v.category === filter);

  return (
    <div className="min-h-screen section-theme-e">
      <div className="page-container-capped py-6 md:py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
        </div>

        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-deep">Gift Marketplace</h1>
          <p className="text-sm text-brand-muted mt-1">Curated gifts from Kenya&apos;s best vendors</p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === cat
                  ? "bg-brand text-white"
                  : "bg-white border border-black/8 text-brand-muted hover:border-brand/30"
              }`}
            >
              {cat === "all" ? "All Vendors" : cat}
            </button>
          ))}
        </div>

        {/* Vendors grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="text-center py-16">
            <Building className="w-12 h-12 text-brand/20 mx-auto mb-3" />
            <p className="font-semibold text-brand-deep">No vendors found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map((vendor) => (
              <div key={vendor.id} className="bg-white rounded-2xl border border-black/6 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-br from-brand/5 to-brand/10 p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                      {vendor.logo_url ? (
                        <img src={vendor.logo_url} alt={vendor.business_name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        "🏪"
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-deep text-sm">{vendor.business_name}</h3>
                      <p className="text-xs text-brand-muted">{vendor.category || "General"}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-xs text-brand-muted line-clamp-2">{vendor.description || "Quality gifts and products"}</p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-gold">★</span>
                      <span className="font-medium text-brand-deep">{vendor.avg_rating?.toFixed(1) || "New"}</span>
                    </div>
                    <span className="text-brand-muted">{vendor.total_sales || 0} sales</span>
                  </div>
                  <Link
                    href={`/marketplace/${vendor.id}`}
                    className="block w-full py-2 bg-brand/5 text-brand text-center rounded-xl text-sm font-medium hover:bg-brand/10 transition-colors"
                  >
                    View Products
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Corporate crossover */}
        <CorporateCrossoverBanner />
      </div>
    </div>
  );
}

function CorporateCrossoverBanner() {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  async function handleSubmit() {
    await fetch("/api/corporate-funnel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourcePage: "marketplace",
        action: "crossover_signup",
        email,
        companyName: company,
      }),
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-gradient-to-r from-brand/5 to-gold/5 rounded-2xl border border-brand/10 p-6 text-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <p className="font-semibold text-brand-deep">Thanks! We&apos;ll be in touch.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-brand/5 to-gold/5 rounded-2xl border border-brand/10 p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Building className="w-6 h-6 text-brand" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-brand-deep mb-1">Ordering for your team?</h3>
          <p className="text-sm text-brand-muted mb-3">
            TouchGift for Business — bulk orders, corporate accounts, and dedicated support.
          </p>
          {showForm ? (
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-black/8 rounded-xl text-sm"
              />
              <input
                placeholder="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-black/8 rounded-xl text-sm"
              />
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors"
              >
                Submit
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm font-semibold text-brand hover:underline"
            >
              Learn more about TouchGift for Business →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
