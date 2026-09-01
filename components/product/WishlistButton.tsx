"use client";

import { useState, useEffect } from "react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";
const WISHLIST_SLUG_KEY = "touchgift_wishlist_slug";
const WISHLIST_NAME_KEY = "touchgift_wishlist_name";

interface WishlistButtonProps {
  productId: string;
  productName?: string;
  productPrice?: number;
  productImage?: string;
}

export default function WishlistButton({
  productId,
  productName,
  productPrice,
  productImage,
}: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<"choose" | "create" | "adding">("choose");
  const [ownerName, setOwnerName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  useEffect(() => {
    const slug = localStorage.getItem(WISHLIST_SLUG_KEY);
    if (slug) setShareUrl(`${SITE_URL}/wishlist/${slug}`);
  }, []);

  const handleClick = () => {
    const existingSlug = localStorage.getItem(WISHLIST_SLUG_KEY);
    if (existingSlug) {
      // Already have a wishlist, add directly
      addToExistingWishlist(existingSlug);
    } else {
      // Need to create/link a wishlist
      setShowModal(true);
      setStep("create");
    }
  };

  const addToExistingWishlist = async (slug: string) => {
    setLoading(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/wishlist/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        setWishlisted(true);
        const url = `${SITE_URL}/wishlist/${slug}`;
        setShareUrl(url);
        setFeedback("Added to your wishlist!");
        setShowModal(true);
        setStep("adding");
      } else {
        // Slug in storage is stale, clear it and prompt create
        localStorage.removeItem(WISHLIST_SLUG_KEY);
        localStorage.removeItem(WISHLIST_NAME_KEY);
        setShowModal(true);
        setStep("create");
      }
    } catch {
      setFeedback("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const createAndAdd = async () => {
    if (!ownerName.trim()) return;
    setLoading(true);
    setFeedback("");
    try {
      // 1. Create the wishlist
      const createRes = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerName: ownerName.trim(), occasion: occasion || undefined }),
      });
      if (!createRes.ok) throw new Error("Failed to create wishlist");
      const { wishlist } = await createRes.json();

      // 2. Save slug locally
      localStorage.setItem(WISHLIST_SLUG_KEY, wishlist.slug);
      localStorage.setItem(WISHLIST_NAME_KEY, ownerName.trim());

      // 3. Add this product
      await fetch(`/api/wishlist/${wishlist.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const url = `${SITE_URL}/wishlist/${wishlist.slug}`;
      setShareUrl(url);
      setWishlisted(true);
      setStep("adding");
    } catch {
      setFeedback("Could not create wishlist. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard?.writeText(shareUrl);
    } catch {
      const el = document.createElement("input");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    const name = localStorage.getItem(WISHLIST_NAME_KEY) || "my";
    const text = `Hey! Check out ${name}'s wishlist on TouchGift 🎁\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all ${
          wishlisted
            ? "bg-brand/10 text-brand border-2 border-brand/30"
            : "bg-white border-2 border-surface-border text-brand-muted hover:border-brand hover:text-brand"
        }`}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        ) : wishlisted ? (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            On your Wishlist ✓
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Add to My Wishlist
          </>
        )}
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-slide-up overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-blush p-6 text-center relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/50 rounded-full transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex justify-center mb-2">
                <svg className="w-10 h-10 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </div>
              {step === "create" && <h3 className="font-display font-bold text-lg">Create Your Wishlist</h3>}
              {step === "adding" && <h3 className="font-display font-bold text-lg">Added! Share your wishlist</h3>}
              {step === "create" && (
                <p className="text-sm text-brand-muted mt-1">
                  Save gifts you love and share with friends and family
                </p>
              )}
            </div>

            <div className="p-6 space-y-4">
              {step === "create" && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1 block">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Grace, Kevin, Amina..."
                      className="w-full border border-surface-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1 block">
                      Occasion <span className="font-normal text-brand-muted/60">(optional)</span>
                    </label>
                    <select
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                      className="w-full border border-surface-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand bg-white"
                    >
                      <option value="">No specific occasion</option>
                      <option value="birthday">🎂 Birthday</option>
                      <option value="wedding">💒 Wedding</option>
                      <option value="anniversary">💕 Anniversary</option>
                      <option value="baby">👶 Baby Shower</option>
                      <option value="graduation">🎓 Graduation</option>
                      <option value="christmas">🎄 Christmas</option>
                      <option value="just because">Just Because</option>
                    </select>
                  </div>
                  {feedback && (
                    <p className="text-xs text-red-500">{feedback}</p>
                  )}
                  <button
                    onClick={createAndAdd}
                    disabled={!ownerName.trim() || loading}
                    className="w-full btn-brand py-3 rounded-xl font-bold shadow-button disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Wishlist & Add Item"}
                  </button>
                </>
              )}

              {step === "adding" && (
                <>
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <div>
                      <p className="text-sm font-semibold text-green-800">Item added to your wishlist!</p>
                      {productName && <p className="text-xs text-green-600 mt-0.5 line-clamp-1">{productName}</p>}
                    </div>
                  </div>

                  {/* Share link display */}
                  <div>
                    <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
                      Your shareable link
                    </p>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-surface text-xs text-brand-muted px-3 py-3 rounded-xl border border-surface-border font-mono truncate">
                        {shareUrl}
                      </div>
                      <button
                        onClick={copyLink}
                        className="px-4 py-2 bg-brand text-white rounded-xl text-xs font-semibold shrink-0 hover:bg-brand-dark transition-colors"
                      >
                        {copied ? "Copied! ✓" : "Copy"}
                      </button>
                    </div>
                  </div>

                  {/* Share buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={shareWhatsApp}
                      className="flex items-center justify-center gap-2 py-3 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </button>
                    <a
                      href={`/wishlist/${shareUrl.split("/wishlist/")[1]}`}
                      className="flex items-center justify-center gap-2 py-3 bg-brand/5 text-brand hover:bg-brand/10 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View List
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
