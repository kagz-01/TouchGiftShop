import { useEffect } from "react";
import Image from "next/image";
import { formatKsh, cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { X, ShoppingBag } from "lucide-react";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: Product, e: React.MouseEvent) => void;
  disabled?: boolean;
}

export default function QuickViewModal({ product, isOpen, onClose, onAdd, disabled }: QuickViewModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-300"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-brand-deep hover:bg-white hover:text-brand transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 relative aspect-square md:aspect-auto bg-blush/30">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🎁</div>
          )}
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-deep leading-tight mb-2 font-serif">
              {product.name}
            </h2>
            <p className="text-xl font-bold text-gold mb-6">{formatKsh(product.price)}</p>
            
            <div className="prose prose-sm text-brand-muted">
              <p>{product.description || "A beautiful addition to any gift hamper."}</p>
            </div>
            
            {(product as any).categories && (product as any).categories.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {(product as any).categories.map((c: any) => (
                  <span key={c.id} className="px-3 py-1 bg-surface rounded-full text-xs font-semibold text-brand-muted">
                    {c.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-surface-border">
            <button
              onClick={(e) => {
                onAdd(product, e);
                onClose();
              }}
              disabled={disabled}
              className={cn(
                "w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
                disabled
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-brand text-white hover:bg-brand-dark hover:shadow-lg active:scale-[0.98]"
              )}
            >
              <ShoppingBag className="w-5 h-5" />
              {disabled ? "Basket is Full (Max 8 items)" : "Add to Basket"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
