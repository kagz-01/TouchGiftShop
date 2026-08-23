"use client";

import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X, Eye } from "lucide-react";

interface BrandStudioProps {
  companyName: string;
  onLogoChange: (logo: string | null) => void;
  onBrandColorChange: (color: string) => void;
  logo: string | null;
  brandColor: string;
}

export default function BrandStudio({
  companyName,
  onLogoChange,
  onBrandColorChange,
  logo,
  brandColor,
}: BrandStudioProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewMode, setPreviewMode] = useState<"card" | "packaging" | "sticker">("card");

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onLogoChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const brandColors = [
    { name: "Brand Purple", value: "#9B1B5A" },
    { name: "Gold", value: "#D4A853" },
    { name: "Coral", value: "#FF6B6B" },
    { name: "Emerald", value: "#10B981" },
    { name: "Ocean", value: "#3B82F6" },
    { name: "Slate", value: "#475569" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display italic text-xl font-bold mb-2 text-theme-heading">Brand Studio</h3>
        <p className="text-theme-muted text-sm">Upload your logo and choose brand colors. Preview how they look on gifts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload & controls */}
        <div className="space-y-5">
          {/* Logo upload */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              dragOver
                ? "border-brand bg-brand/5"
                : logo
                ? "border-success bg-success/5"
                : "border-surface-border hover:border-brand/30"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            {logo ? (
              <div className="space-y-3">
                <div className="w-20 h-20 mx-auto bg-white rounded-xl shadow-sm border border-surface-border flex items-center justify-center overflow-hidden">
                  <img src={logo} alt="Company logo" className="max-w-full max-h-full object-contain p-2" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-success">Logo uploaded</p>
                  <p className="text-xs text-theme-muted">Click to replace</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onLogoChange(null); }}
                  className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1 mx-auto"
                >
                  <X className="w-3 h-3" /> Remove logo
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto bg-brand/10 shape-premium-card flex items-center justify-center">
                  {dragOver ? (
                    <Upload className="w-6 h-6 text-brand" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-brand-muted" />
                  )}
                </div>
                <p className="text-sm font-semibold text-theme-heading">
                  {dragOver ? "Drop your logo here" : "Upload company logo"}
                </p>
                <p className="text-xs text-theme-muted">
                  PNG, JPG, or SVG. Max 2MB. Recommended: 400×400px
                </p>
              </div>
            )}
          </div>

          {/* Brand color picker */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-theme-heading">Brand Color</label>
            <div className="flex flex-wrap gap-2">
              {brandColors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => onBrandColorChange(c.value)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    brandColor === c.value
                      ? "border-theme-heading scale-110 shadow-lg"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
              <label className="w-10 h-10 rounded-full border-2 border-dashed border-surface-border flex items-center justify-center cursor-pointer hover:border-brand/30 transition-all">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => onBrandColorChange(e.target.value)}
                  className="sr-only"
                />
                <span className="text-xs text-theme-muted">+</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Live preview */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-theme-muted" />
            <span className="text-sm font-semibold text-theme-heading">Live Preview</span>
          </div>

          {/* Preview mode tabs */}
          <div className="flex gap-2">
            {(["card", "packaging", "sticker"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode)}
                className={`px-3 py-1.5 text-xs font-medium shape-premium-button transition-all ${
                  previewMode === mode
                    ? "bg-brand text-white"
                    : "card-theme border border-surface-border text-theme-muted"
                }`}
              >
                {mode === "card" ? "Gift Card" : mode === "packaging" ? "Packaging" : "Sticker"}
              </button>
            ))}
          </div>

          {/* Preview card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-surface-border shadow-lg overflow-hidden">
            {previewMode === "card" && (
              <div className="p-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 text-center">
                  {logo ? (
                    <img src={logo} alt="Logo" className="w-16 h-16 mx-auto mb-3 object-contain" />
                  ) : (
                    <div
                      className="w-16 h-16 mx-auto mb-3 shape-premium-card flex items-center justify-center text-white text-xl font-bold"
                      style={{ backgroundColor: brandColor }}
                    >
                      {companyName ? companyName.charAt(0).toUpperCase() : "T"}
                    </div>
                  )}
                  <p className="text-sm font-bold text-gray-800 dark:text-white mb-1">
                    {companyName || "Your Company"}
                  </p>
                  <div className="h-px my-3" style={{ backgroundColor: brandColor, opacity: 0.3 }} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    &ldquo;Thank you for being part of our journey.&rdquo;
                  </p>
                </div>
              </div>
            )}

            {previewMode === "packaging" && (
              <div className="p-6">
                <div
                  className="relative rounded-xl p-8 text-center"
                  style={{ backgroundColor: brandColor }}
                >
                  {logo && (
                    <img src={logo} alt="Logo" className="w-14 h-14 mx-auto mb-2 object-contain brightness-0 invert" />
                  )}
                  <p className="text-white font-bold text-sm">
                    {companyName || "Your Company"}
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <div className="h-px flex-1 bg-white/30" />
                    <span className="text-white/60 text-[10px] uppercase tracking-widest">with care</span>
                    <div className="h-px flex-1 bg-white/30" />
                  </div>
                </div>
              </div>
            )}

            {previewMode === "sticker" && (
              <div className="p-6 flex items-center justify-center">
                <div
                  className="w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-lg"
                  style={{ backgroundColor: brandColor }}
                >
                  {logo ? (
                    <img src={logo} alt="Logo" className="w-10 h-10 mb-1 object-contain brightness-0 invert" />
                  ) : (
                    <span className="text-white text-2xl font-bold mb-1">
                      {companyName ? companyName.charAt(0).toUpperCase() : "T"}
                    </span>
                  )}
                  <span className="text-white text-[9px] font-semibold uppercase tracking-wider">
                    {companyName || "TouchGift"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
