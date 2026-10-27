"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X, Type, Image as ImageIcon, Download, Trash2, Bold,
  Italic, AlignCenter, AlignLeft, AlignRight, Layers,
} from "lucide-react";
import { fabric } from "fabric";

interface LiveCustomizerProps {
  baseImage: string;
  onClose: () => void;
  productName?: string;
  materialType?: "leather" | "metal" | "wood" | "glass" | "fabric" | "apparel" | "drinkware" | "umbrella" | "largeformat" | "default";
}

const FONTS = [
  { label: "Sans — Inter", value: "Inter, sans-serif" },
  { label: "Serif — Playfair", value: "'Playfair Display', serif" },
  { label: "Script — Dancing", value: "'Dancing Script', cursive" },
  { label: "Mono", value: "'Courier New', monospace" },
  { label: "Bold — Oswald", value: "'Oswald', sans-serif" },
];

const MATERIAL_EFFECTS: Record<string, { label: string; emoji: string; filters: any[] }> = {
  none:        { label: "Original",        emoji: "🎨", filters: [] },
  laser:       { label: "Laser Engrave",   emoji: "⚡", filters: [new (fabric.Image.filters as any).Grayscale(), new (fabric.Image.filters as any).Contrast({ contrast: 0.6 })] },
  deboss:      { label: "Leather Deboss",  emoji: "🟤", filters: [new (fabric.Image.filters as any).Sepia(), new (fabric.Image.filters as any).Contrast({ contrast: 0.3 })] },
  foil:        { label: "Gold Foil",       emoji: "✨", filters: [new (fabric.Image.filters as any).HueRotation({ rotation: 0.15 }), new (fabric.Image.filters as any).Brightness({ brightness: 0.2 })] },
  embroidery:  { label: "Embroidery",      emoji: "🧵", filters: [new (fabric.Image.filters as any).Contrast({ contrast: 0.4 }), new (fabric.Image.filters as any).Pixelate({ blocksize: 2 })] },
  screenprint: { label: "Screen Print",   emoji: "🖨️", filters: [new (fabric.Image.filters as any).Contrast({ contrast: 0.5 }), new (fabric.Image.filters as any).Saturation({ saturation: 0.3 })] },
  sublimation: { label: "Sublimation",     emoji: "🌈", filters: [new (fabric.Image.filters as any).Brightness({ brightness: 0.05 }), new (fabric.Image.filters as any).Saturation({ saturation: 0.5 })] },
  dtg:         { label: "DTG / Full Color",emoji: "🎯", filters: [] },
};

// Smart default effects per material type
const RECOMMENDED_EFFECTS: Record<string, string[]> = {
  metal:       ["laser", "foil", "none"],
  leather:     ["deboss", "foil", "laser"],
  wood:        ["laser", "none"],
  glass:       ["laser", "foil", "none"],
  apparel:     ["embroidery", "screenprint", "dtg", "none"],
  fabric:      ["screenprint", "embroidery", "sublimation", "none"],
  umbrella:    ["sublimation", "screenprint", "none"],
  drinkware:   ["sublimation", "laser", "none"],
  largeformat: ["sublimation", "screenprint", "dtg", "none"],
  default:     ["none", "laser", "screenprint", "embroidery", "deboss", "foil", "sublimation", "dtg"],
};

// Canvas aspect ratio per material (Tailwind class)
const CANVAS_ASPECT: Record<string, string> = {
  largeformat: "aspect-[16/9]",
  apparel:     "aspect-[3/4]",
  umbrella:    "aspect-square",
  drinkware:   "aspect-[3/4]",
  default:     "aspect-[4/3]",
};

// Whether the whole canvas is the design area (no constrained safe zone)
const FULL_BLEED_TYPES = new Set(["largeformat"]);

// Print locations for apparel
const PRINT_LOCATIONS: Record<string, { label: string; emoji: string }[]> = {
  apparel: [
    { label: "Left Chest",  emoji: "◀" },
    { label: "Full Front",  emoji: "⬛" },
    { label: "Full Back",   emoji: "⬛" },
    { label: "Sleeve",      emoji: "━" },
    { label: "Collar",      emoji: "〰️" },
  ],
  fabric: [
    { label: "Full Surface", emoji: "⬛" },
    { label: "Centre",       emoji: "◉" },
    { label: "Bottom Edge",  emoji: "▬" },
  ],
  largeformat: [
    { label: "Full Bleed",  emoji: "⬛" },
    { label: "Centre",      emoji: "◉" },
    { label: "Top-Left",    emoji: "↖" },
  ],
  umbrella: [
    { label: "1 Panel",     emoji: "△" },
    { label: "4 Panels",    emoji: "4△" },
    { label: "All 8 Panels",emoji: "8△" },
  ],
};

export default function LiveCustomizer({
  baseImage,
  onClose,
  productName = "Product",
  materialType = "default",
}: LiveCustomizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bulkNames, setBulkNames] = useState("");
  const [activeTab, setActiveTab] = useState<"add" | "props" | "bulk">("add");
  const [materialEffect, setMaterialEffect] = useState("none");
  const [safeZone, setSafeZone] = useState<fabric.Rect | null>(null);
  const [mounted, setMounted] = useState(false);
  const [printLocation, setPrintLocation] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    // Load Google Fonts dynamically
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Playfair+Display:wght@400;700&family=Oswald:wght@400;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: containerWidth,
      height: containerHeight,
      preserveObjectStacking: true,
      selection: true,
    });

    // Background image (may be missing for some products — the canvas stays
    // usable either way: the safe zone goes in first so it is never blank).
    if (baseImage) {
      fabric.Image.fromURL(
        baseImage,
        (img) => {
          if (!img) {
            console.warn("[LiveCustomizer] product image failed to load:", baseImage);
            return;
          }
          const scale = Math.min(
            containerWidth / (img.width || 1),
            containerHeight / (img.height || 1)
          );
          img.set({
            originX: "center",
            originY: "center",
            left: containerWidth / 2,
            top: containerHeight / 2,
            scaleX: scale,
            scaleY: scale,
          });
          initCanvas.setBackgroundImage(img, initCanvas.renderAll.bind(initCanvas));
        },
        { crossOrigin: "anonymous" }
      );
    }

    // Safe zone — full bleed for large format, constrained for everything else
    const isFullBleed = FULL_BLEED_TYPES.has(materialType);
    const szW = isFullBleed ? containerWidth * 0.96 : Math.min(containerWidth * 0.55, 320);
    const szH = isFullBleed ? containerHeight * 0.96 : Math.min(containerHeight * 0.55, 320);
    const safeZoneLabel = isFullBleed ? "✦ Full Design Area" : "✦ Print / Engrave Area";
    const sz = new fabric.Rect({
      left: containerWidth / 2,
      top: containerHeight / 2,
      originX: "center",
      originY: "center",
      width: szW,
      height: szH,
      fill: isFullBleed ? "transparent" : "rgba(155,27,90,0.04)",
      stroke: "#9B1B5A",
      strokeWidth: isFullBleed ? 1 : 2,
      strokeDashArray: isFullBleed ? [3, 3] : [6, 4],
      selectable: false,
      evented: false,
      name: "safeZone",
    });
    initCanvas.add(sz);
    setSafeZone(sz);

    // Safe zone label
    const label = new fabric.Text(safeZoneLabel, {
      left: containerWidth / 2 - szW / 2 + 4,
      top: containerHeight / 2 - szH / 2 - 18,
      fontSize: 11,
      fill: "#9B1B5A",
      fontFamily: "Inter, sans-serif",
      selectable: false,
      evented: false,
      name: "safeZoneLabel",
      opacity: 0.7,
    });
    initCanvas.add(label);

    setCanvas(initCanvas);

    initCanvas.on("object:moving", (e) => {
      const obj = e.target;
      if (!obj || obj.name === "safeZone" || obj.name === "safeZoneLabel") return;
      obj.setCoords();
      const ob = obj.getBoundingRect();
      const sb = sz.getBoundingRect();
      if (ob.left < sb.left) obj.left! += sb.left - ob.left;
      if (ob.top < sb.top) obj.top! += sb.top - ob.top;
      obj.setCoords();
      const ub = obj.getBoundingRect();
      if (ub.left + ub.width > sb.left + sb.width) obj.left! -= (ub.left + ub.width) - (sb.left + sb.width);
      if (ub.top + ub.height > sb.top + sb.height) obj.top! -= (ub.top + ub.height) - (sb.top + sb.height);
    });

    initCanvas.on("selection:created", (e) => { setSelectedObject(e.selected?.[0] || null); setActiveTab("props"); });
    initCanvas.on("selection:updated", (e) => { setSelectedObject(e.selected?.[0] || null); setActiveTab("props"); });
    initCanvas.on("selection:cleared", () => { setSelectedObject(null); setActiveTab("add"); });

    setCanvas(initCanvas);

    const handleResize = () => {
      if (!containerRef.current) return;
      initCanvas.setDimensions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
      initCanvas.renderAll();
    };
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); initCanvas.dispose(); };
  }, [baseImage]);

  // Keyboard delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && canvas) {
        const active = canvas.getActiveObject();
        if (active && !(active as any).isEditing && active.name !== "safeZone" && active.name !== "safeZoneLabel") {
          canvas.remove(active);
          canvas.discardActiveObject();
          canvas.renderAll();
          setSelectedObject(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canvas]);

  const addText = () => {
    if (!canvas || !safeZone) return;
    const sb = safeZone.getBoundingRect();
    const text = new fabric.IText("Your Name", {
      left: sb.left + sb.width / 2,
      top: sb.top + sb.height / 2,
      originX: "center",
      originY: "center",
      fontFamily: "Inter, sans-serif",
      fill: "#1a1a1a",
      fontSize: 28,
      fontWeight: "600",
      transparentCorners: false,
      cornerColor: "#9B1B5A",
      cornerStyle: "circle",
      borderColor: "#9B1B5A",
      cursorWidth: 1,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    setActiveTab("props");
  };

  const addLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !safeZone) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const isSvg = file.type === "image/svg+xml";

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;

      if (isSvg) {
        fabric.loadSVGFromString(dataUrl, (objects, options) => {
          const group = fabric.util.groupSVGElements(objects, options);
          const sb = safeZone.getBoundingRect();
          const maxW = Math.min(sb.width * 0.7, 200);
          if ((group.width || 0) > maxW) group.scaleToWidth(maxW);
          group.set({
            left: sb.left + sb.width / 2,
            top: sb.top + sb.height / 2,
            originX: "center",
            originY: "center",
            transparentCorners: false,
            cornerColor: "#9B1B5A",
            cornerStyle: "circle",
            borderColor: "#9B1B5A",
          });
          canvas.add(group);
          canvas.setActiveObject(group);
          canvas.renderAll();
          setActiveTab("props");
        });
      } else {
        fabric.Image.fromURL(dataUrl, (img) => {
          const sb = safeZone.getBoundingRect();
          const maxW = Math.min(sb.width * 0.7, 220);
          if ((img.width || 0) > maxW) img.scaleToWidth(maxW);
          img.set({
            left: sb.left + sb.width / 2,
            top: sb.top + sb.height / 2,
            originX: "center",
            originY: "center",
            transparentCorners: false,
            cornerColor: "#9B1B5A",
            cornerStyle: "circle",
            borderColor: "#9B1B5A",
          });
           // Auto-apply the first recommended effect for this material
          const firstEffect = RECOMMENDED_EFFECTS[materialType]?.[0] ?? "none";
          if (firstEffect !== "none" && MATERIAL_EFFECTS[firstEffect]) {
            img.filters = MATERIAL_EFFECTS[firstEffect].filters;
            img.applyFilters();
            setMaterialEffect(firstEffect);
          }
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
          setActiveTab("props");
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const applyMaterialEffect = (effectKey: string) => {
    if (!canvas || !selectedObject || selectedObject.type !== "image") return;
    const img = selectedObject as fabric.Image;
    const effect = MATERIAL_EFFECTS[effectKey];
    img.filters = effect.filters;
    img.applyFilters();
    canvas.renderAll();
    setMaterialEffect(effectKey);
  };

  const handleSave = async () => {
    if (!canvas) return;
    setSaving(true);
    try {
      canvas.discardActiveObject();
      // Hide safe zone for export
      canvas.getObjects().forEach((o) => {
        if (o.name === "safeZone" || o.name === "safeZoneLabel") o.set("opacity", 0);
      });
      canvas.renderAll();

      const dataUrl = canvas.toDataURL({ format: "png", quality: 1, multiplier: 2 });

      // Restore safe zone
      canvas.getObjects().forEach((o) => {
        if (o.name === "safeZone" || o.name === "safeZoneLabel") o.set("opacity", o.name === "safeZone" ? 1 : 0.7);
      });
      canvas.renderAll();

      // Build fulfillment payload
      const objects = canvas.getObjects().filter(
        (o) => o.name !== "safeZone" && o.name !== "safeZoneLabel"
      );
      const textElements = objects
        .filter((o) => o.type === "i-text" || o.type === "text")
        .map((o: any) => ({
          text: o.text,
          font: o.fontFamily,
          size: Math.round(o.fontSize * (o.scaleX || 1)),
          color: o.fill,
          x: Math.round(o.left),
          y: Math.round(o.top),
          bold: o.fontWeight === "bold" || o.fontWeight === "700",
          italic: o.fontStyle === "italic",
        }));
      const hasLogo = objects.some((o) => o.type === "image" || o.type === "group");

      // Upload to Supabase storage
      const res = await fetch("/api/customizations/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const { url, error } = await res.json();
      if (!res.ok) throw new Error(error ?? "Upload failed");

      // Build text summary
      const texts = textElements.map((t) => t.text).filter(Boolean);
      const summaryParts: string[] = [];
      if (texts.length > 0) summaryParts.push(texts.join(" | "));
      if (hasLogo) summaryParts.push("(Custom Logo)");

      let calculatedQuantity = 1;
      const names = bulkNames.trim()
        ? bulkNames.split("\n").map((n) => n.trim()).filter(Boolean)
        : [];
      if (names.length > 0) {
        summaryParts.push(`Bulk: ${names.slice(0, 3).join(", ")}${names.length > 3 ? ` +${names.length - 3} more` : ""}`);
        calculatedQuantity = names.length;
      }

      // Dispatch saved event to AddToCartButton listener
      window.dispatchEvent(
        new CustomEvent("customizationSaved", {
          detail: {
            imageUrl: url,
            text: summaryParts.join(" · "),
            quantity: calculatedQuantity,
            fulfillmentPayload: {
              product_name: productName,
              customization_type: MATERIAL_EFFECTS[materialEffect]?.label ?? "Print",
              print_location: printLocation || undefined,
              text_elements: textElements,
              has_logo: hasLogo,
              bulk_names: names,
              preview_url: url,
            },
          },
        })
      );
      setSaved(true);
      setTimeout(onClose, 800);
    } catch (err) {
      console.error("Save failed:", err);
      window.dispatchEvent(
        new CustomEvent("customizationSaved", {
          detail: { imageUrl: null, text: "Customization attached" },
        })
      );
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const removeSelected = () => {
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedObject(null);
  };

  const iText = selectedObject?.type === "i-text" || selectedObject?.type === "text"
    ? (selectedObject as fabric.IText)
    : null;
  const isImage = selectedObject?.type === "image" || selectedObject?.type === "group";

  const userObjects = canvas?.getObjects().filter(
    (o) => o.name !== "safeZone" && o.name !== "safeZoneLabel"
  ) ?? [];

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-white dark:bg-[#0D0D12] flex flex-col md:flex-row">
      {/* ── SIDEBAR ── */}
      <div className="w-full md:w-[320px] lg:w-[360px] bg-white dark:bg-[#151519] border-r border-black/8 dark:border-white/10 flex flex-col shadow-xl z-10 flex-shrink-0">

        {/* Header */}
        <div className="px-6 py-4 border-b border-black/8 dark:border-white/10 flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-brand/5 to-transparent">
          <div>
            <h2 className="font-display font-bold text-base text-brand-deep dark:text-white">Customization Studio</h2>
            <p className="text-[11px] text-brand-muted mt-0.5 truncate max-w-[200px]">{productName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-brand-muted" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-black/8 dark:border-white/10 flex-shrink-0">
          {(["add", "props", "bulk"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? "text-brand border-b-2 border-brand bg-brand/3"
                  : "text-brand-muted hover:text-brand-deep"
              }`}
            >
              {tab === "add" ? "✦ Add" : tab === "props" ? "✦ Style" : "✦ Bulk"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* ADD TAB */}
          {activeTab === "add" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={addText}
                  className="flex flex-col items-center justify-center p-4 bg-brand/5 rounded-2xl border-2 border-brand/20 hover:border-brand hover:bg-brand/10 transition-all gap-2 group"
                >
                  <Type className="w-6 h-6 text-brand group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-brand-deep dark:text-white">Add Text</span>
                </button>
                <label className="flex flex-col items-center justify-center p-4 bg-brand/5 rounded-2xl border-2 border-brand/20 hover:border-brand hover:bg-brand/10 transition-all gap-2 group cursor-pointer">
                  <input type="file" accept="image/*,.svg" className="hidden" onChange={addLogo} />
                  <ImageIcon className="w-6 h-6 text-brand group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-brand-deep dark:text-white">Upload Logo</span>
                  <span className="text-[10px] text-brand-muted">PNG, JPG, SVG</span>
                </label>
              </div>

              <div className="bg-brand/4 border border-brand/15 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-bold text-brand-deep dark:text-white uppercase tracking-wide">💡 Tips</p>
                <ul className="text-[11px] text-brand-muted space-y-1">
                  <li>• Double-click text to edit it directly</li>
                  <li>• Drag to reposition · use corners to resize</li>
                  <li>• Press <kbd className="px-1.5 py-0.5 bg-black/10 rounded text-[10px]">Delete</kbd> to remove selected</li>
                  <li>• Stay inside the dashed engravable area</li>
                </ul>
              </div>

              {/* Layer count */}
              {userObjects.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-brand-muted">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{userObjects.length} element{userObjects.length !== 1 ? "s" : ""} on canvas</span>
                </div>
              )}
            </div>
          )}

          {/* PROPS TAB */}
          {activeTab === "props" && (
            <div className="space-y-5">
              {!selectedObject && (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">👆</div>
                  <p className="text-sm text-brand-muted">Select an element on the canvas to style it</p>
                </div>
              )}

              {/* TEXT PROPERTIES */}
              {iText && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">Text Style</p>
                    <button onClick={removeSelected} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="text-[11px] font-semibold text-brand-muted block mb-2">Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={(iText.fill as string) || "#000000"}
                        onChange={(e) => { iText.set("fill", e.target.value); canvas?.renderAll(); setSelectedObject({ ...iText } as any); }}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-black/10 p-0.5 bg-transparent"
                      />
                      <div className="flex gap-2">
                        {["#1a1a1a", "#ffffff", "#9B1B5A", "#FFD700", "#2563eb"].map((c) => (
                          <button
                            key={c}
                            onClick={() => { iText.set("fill", c); canvas?.renderAll(); setSelectedObject({ ...iText } as any); }}
                            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                            style={{ backgroundColor: c, borderColor: iText.fill === c ? "#9B1B5A" : "transparent" }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Font */}
                  <div>
                    <label className="text-[11px] font-semibold text-brand-muted block mb-2">Font</label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {FONTS.map((f) => (
                        <button
                          key={f.value}
                          onClick={() => { iText.set("fontFamily", f.value); canvas?.renderAll(); }}
                          className={`text-left px-3 py-2 rounded-xl border text-sm transition-all ${
                            iText.fontFamily === f.value
                              ? "border-brand bg-brand/5 text-brand font-semibold"
                              : "border-black/10 dark:border-white/10 hover:border-brand/40 text-brand-deep dark:text-white"
                          }`}
                          style={{ fontFamily: f.value }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Style toggles */}
                  <div>
                    <label className="text-[11px] font-semibold text-brand-muted block mb-2">Style</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { iText.set("fontWeight", iText.fontWeight === "bold" ? "normal" : "bold"); canvas?.renderAll(); }}
                        className={`p-2 rounded-lg border transition-colors ${iText.fontWeight === "bold" ? "border-brand bg-brand/10 text-brand" : "border-black/10 dark:border-white/10"}`}
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { iText.set("fontStyle", iText.fontStyle === "italic" ? "normal" : "italic"); canvas?.renderAll(); }}
                        className={`p-2 rounded-lg border transition-colors ${iText.fontStyle === "italic" ? "border-brand bg-brand/10 text-brand" : "border-black/10 dark:border-white/10"}`}
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      {[
                        { icon: <AlignLeft className="w-4 h-4" />, val: "left" },
                        { icon: <AlignCenter className="w-4 h-4" />, val: "center" },
                        { icon: <AlignRight className="w-4 h-4" />, val: "right" },
                      ].map(({ icon, val }) => (
                        <button
                          key={val}
                          onClick={() => { iText.set("textAlign", val); canvas?.renderAll(); }}
                          className={`p-2 rounded-lg border transition-colors ${iText.textAlign === val ? "border-brand bg-brand/10 text-brand" : "border-black/10 dark:border-white/10"}`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font size */}
                  <div>
                    <label className="text-[11px] font-semibold text-brand-muted block mb-2">Size — {Math.round(iText.fontSize || 28)}pt</label>
                    <input
                      type="range"
                      min={10}
                      max={120}
                      step={2}
                      value={iText.fontSize || 28}
                      onChange={(e) => { iText.set("fontSize", Number(e.target.value)); canvas?.renderAll(); }}
                      className="w-full accent-brand"
                    />
                  </div>
                </div>
              )}

              {/* IMAGE / LOGO PROPERTIES */}
              {isImage && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">Logo / Image</p>
                    <button onClick={removeSelected} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-brand-muted block mb-2">
                      Branding Method
                    </label>
                    {/* Recommended for this material */}
                    {materialType !== "default" && (
                      <p className="text-[10px] text-brand-muted/70 mb-2">
                        ✦ Recommended for{" "}
                        <span className="capitalize font-semibold text-brand">{materialType}</span>
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      {(RECOMMENDED_EFFECTS[materialType] ?? RECOMMENDED_EFFECTS.default).map((key) => {
                        const effect = MATERIAL_EFFECTS[key];
                        if (!effect) return null;
                        return (
                          <button
                            key={key}
                            onClick={() => applyMaterialEffect(key)}
                            className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                              materialEffect === key
                                ? "border-brand bg-brand/10 text-brand"
                                : "border-black/10 dark:border-white/10 hover:border-brand/40 text-brand-deep dark:text-white"
                            }`}
                          >
                            <span>{effect.emoji}</span>
                            <span>{effect.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Print Location Selector */}
                  {PRINT_LOCATIONS[materialType] && (
                    <div>
                      <label className="text-[11px] font-semibold text-brand-muted block mb-2">Print Location</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {PRINT_LOCATIONS[materialType].map((loc) => (
                          <button
                            key={loc.label}
                            onClick={() => setPrintLocation(loc.label)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                              printLocation === loc.label
                                ? "border-brand bg-brand/10 text-brand"
                                : "border-black/10 dark:border-white/10 hover:border-brand/40 text-brand-deep dark:text-white"
                            }`}
                          >
                            <span className="text-base leading-none">{loc.emoji}</span>
                            <span>{loc.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* BULK TAB */}
          {activeTab === "bulk" && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4">
                <p className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-1">🏢 Corporate Bulk Orders</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  Enter one name per line. The same logo/design will be applied to all — each item will have its own unique name engraved.
                </p>
              </div>
              <div>
                <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wide block mb-2">
                  Names List ({bulkNames.split("\n").filter((n) => n.trim()).length} names)
                </label>
                <textarea
                  value={bulkNames}
                  onChange={(e) => setBulkNames(e.target.value)}
                  placeholder={"John Doe\nJane Smith\nMichael Scott\nDwight Schrute"}
                  rows={8}
                  className="w-full p-3 bg-surface dark:bg-white/5 border border-surface-border dark:border-white/10 rounded-xl text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none resize-none transition-all font-mono"
                />
              </div>
              <div className="bg-brand/5 border border-brand/15 rounded-xl p-3">
                <p className="text-xs text-brand-muted">
                  💡 You can also upload a <strong>.txt file</strong> with names, or copy-paste from Excel. Each line = one item.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-5 border-t border-black/8 dark:border-white/10 bg-white dark:bg-[#151519] flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={saving || userObjects.length === 0 || saved}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              saved
                ? "bg-emerald-500 text-white"
                : userObjects.length === 0
                ? "bg-black/10 text-black/40 cursor-not-allowed"
                : "bg-brand text-white hover:bg-brand-dark shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            }`}
          >
            {saved ? (
              <> ✓ Design Saved! Closing… </>
            ) : saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving high-res design…
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Save Design & Preview
                {bulkNames.trim() && ` (${bulkNames.split("\n").filter((n) => n.trim()).length} items)`}
              </>
            )}
          </button>
          {userObjects.length === 0 && (
            <p className="text-[11px] text-brand-muted text-center mt-2">Add text or a logo to save your design</p>
          )}
        </div>
      </div>

      {/* ── CANVAS AREA ── */}
      <div className="flex-1 bg-[#F7F5F8] dark:bg-[#08080C] flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {/* Zoom hint */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[11px] px-3 py-1.5 rounded-full backdrop-blur-sm z-10 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse inline-block" />
          Double-click text to edit · Drag to move · Scroll to zoom
        </div>

        <div
          ref={containerRef}
          className={`relative w-full max-w-3xl bg-white shadow-2xl overflow-hidden rounded-3xl border border-black/5 ${
            CANVAS_ASPECT[materialType] ?? CANVAS_ASPECT.default
          }`}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
      </div>
    </div>,
    document.body
  );
}
