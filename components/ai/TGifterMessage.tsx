"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "./TGifterChatWidget";
import ProductCard from "@/components/product/ProductCard";

export default function TGifterMessage({ message }: { message: ChatMessage }) {
  const isAI = message.role === "assistant";

  return (
    <div className={cn("flex w-full gap-3", isAI ? "justify-start" : "justify-end")}>
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
          <span className="text-sm">🤖</span>
        </div>
      )}

      <div className="flex flex-col gap-2 max-w-[85%]">
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm shadow-sm",
            isAI
              ? "bg-white border border-brand/10 text-brand-deep rounded-tl-sm"
              : "bg-brand text-white rounded-tr-sm"
          )}
        >
          {message.content.split('\n').map((line, i) => (
            <p key={i} className={i !== 0 ? "mt-2" : ""}>{line}</p>
          ))}
        </div>

        {/* If the message includes product data, render it */}
        {message.data?.type === "products" && message.data.products && (
          <div className="flex overflow-x-auto gap-4 py-2 pb-4 -mx-4 px-4 snap-x">
            {message.data.products.map((product: any) => (
              <div key={product.id} className="w-[200px] shrink-0 snap-start bg-white rounded-xl overflow-hidden shadow-sm border border-brand/10">
                {/* Simplified product card for chat */}
                <div className="aspect-[4/5] bg-surface relative">
                   <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <h4 className="font-display font-bold text-sm line-clamp-1">{product.name}</h4>
                  <p className="text-brand font-semibold text-xs mt-1">KSh {product.price}</p>
                  <a 
                    href={`/product/${product.slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-2 block w-full py-1.5 text-center bg-brand/10 hover:bg-brand/20 text-brand rounded-lg text-xs font-bold transition-colors"
                  >
                    View Gift
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
