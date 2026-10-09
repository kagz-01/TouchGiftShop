"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Type, Image as ImageIcon, Download, Square, Circle } from "lucide-react";
import { fabric } from "fabric";

interface LiveCustomizerProps {
  baseImage: string;
  onClose: () => void;
}

export default function LiveCustomizer({ baseImage, onClose }: LiveCustomizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [saving, setSaving] = useState(false);
  const [bulkNames, setBulkNames] = useState("");

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

    // Set responsive background image
    fabric.Image.fromURL(
      baseImage,
      (img) => {
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

    // Draw safe zone for engraving constraints
    const safeZoneWidth = Math.min(containerWidth * 0.5, 300);
    const safeZoneHeight = Math.min(containerHeight * 0.5, 300);
    const safeZone = new fabric.Rect({
      left: containerWidth / 2,
      top: containerHeight / 2,
      originX: "center",
      originY: "center",
      width: safeZoneWidth,
      height: safeZoneHeight,
      fill: "transparent",
      stroke: "#FF4500",
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      name: "safeZone" // to identify it later
    });
    
    initCanvas.add(safeZone);

    // Constraint Logic: Prevent dragging outside safe zone
    initCanvas.on("object:moving", (e) => {
      const obj = e.target;
      if (!obj || obj.name === "safeZone") return;
      
      obj.setCoords();
      const objBounds = obj.getBoundingRect();
      const safeBounds = safeZone.getBoundingRect();

      // Basic clamping
      if (objBounds.left < safeBounds.left) {
        obj.left! += safeBounds.left - objBounds.left;
      }
      if (objBounds.top < safeBounds.top) {
        obj.top! += safeBounds.top - objBounds.top;
      }
      
      obj.setCoords();
      const updatedBounds = obj.getBoundingRect();
      
      if (updatedBounds.left + updatedBounds.width > safeBounds.left + safeBounds.width) {
        obj.left! -= (updatedBounds.left + updatedBounds.width) - (safeBounds.left + safeBounds.width);
      }
      if (updatedBounds.top + updatedBounds.height > safeBounds.top + safeBounds.height) {
        obj.top! -= (updatedBounds.top + updatedBounds.height) - (safeBounds.top + safeBounds.height);
      }
    });

    // Event listeners for selection
    initCanvas.on("selection:created", (e) => setSelectedObject(e.selected?.[0] || null));
    initCanvas.on("selection:updated", (e) => setSelectedObject(e.selected?.[0] || null));
    initCanvas.on("selection:cleared", () => setSelectedObject(null));

    setCanvas(initCanvas);

    const handleResize = () => {
      if (!containerRef.current) return;
      // Basic resize handler - in production we'd recalculate scales
      initCanvas.setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
      initCanvas.renderAll();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      initCanvas.dispose();
    };
  }, [baseImage]);

  // Handle keyboard deletes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && canvas) {
        const activeObject = canvas.getActiveObject();
        if (activeObject && !(activeObject as any).isEditing) {
          canvas.remove(activeObject);
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canvas]);

  const addText = () => {
    if (!canvas) return;
    const text = new fabric.IText("Your Name Here", {
      left: canvas.width! / 2,
      top: canvas.width! / 2,
      originX: "center",
      originY: "center",
      fontFamily: "Inter",
      fill: "#000000",
      fontSize: 32,
      fontWeight: "600",
      transparentCorners: false,
      cornerColor: "#000000",
      cornerStyle: "circle",
      borderColor: "#000000",
      cursorWidth: 1,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const addLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      fabric.Image.fromURL(dataUrl, (img) => {
        // scale down if too big
        if (img.width! > 300) {
          img.scaleToWidth(300);
        }
        img.set({
          left: canvas.width! / 2,
          top: canvas.height! / 2,
          originX: "center",
          originY: "center",
          transparentCorners: false,
          cornerColor: "#000000",
          cornerStyle: "circle",
          borderColor: "#000000",
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!canvas) return;
    setSaving(true);
    
    try {
      canvas.discardActiveObject();
      const safeZoneObj = canvas.getObjects().find(o => o.name === "safeZone");
      if (safeZoneObj) safeZoneObj.set("opacity", 0);
      canvas.renderAll();
      
      const dataUrl = canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2, // High-res export
      });
      if (safeZoneObj) safeZoneObj.set("opacity", 1);

      // Upload logic
      const res = await fetch("/api/customizations/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });

      const { url, error } = await res.json();
      if (!res.ok) throw new Error(error ?? "Upload failed");

      // Build summary
      const objects = canvas.getObjects();
      const texts = objects.filter(o => o.type === "i-text" || o.type === "text").map((o: any) => o.text).filter(Boolean);
      const hasLogo = objects.some(o => o.type === "image");
      
      const summaryParts: string[] = [];
      if (texts.length > 0) summaryParts.push(texts.join(" | "));
      if (hasLogo) summaryParts.push("(Includes Custom Logo)");
      let calculatedQuantity = 1;
      if (bulkNames.trim()) {
        const names = bulkNames.split("\\n").filter(n => n.trim());
        summaryParts.push(`(Bulk Names: ${names.join(", ")})`);
        calculatedQuantity = Math.max(1, names.length);
      }
      const textSummary = summaryParts.join(" | ");

      window.dispatchEvent(
        new CustomEvent("customizationSaved", {
          detail: { imageUrl: url, text: textSummary, quantity: calculatedQuantity },
        })
      );
      onClose();
    } catch (err) {
      console.error("Save failed:", err);
      // Fallback
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

  const updateSelectedColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !selectedObject) return;
    selectedObject.set("fill", e.target.value);
    canvas.renderAll();
    setSelectedObject({ ...selectedObject } as any); // trigger re-render
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-surface dark:bg-[#101015] flex flex-col md:flex-row animate-fade-in">
      {/* Sidebar Toolbar */}
      <div className="w-full md:w-80 bg-white dark:bg-[#1A1A22] border-r border-surface-border dark:border-white/10 flex flex-col shadow-xl z-10 flex-shrink-0">
        <div className="p-6 border-b border-surface-border dark:border-white/10 flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Customization Studio</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface dark:hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Add Tools */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={addText}
              className="flex flex-col items-center justify-center p-4 bg-surface dark:bg-white/5 rounded-xl border border-surface-border dark:border-white/10 hover:border-brand hover:text-brand dark:hover:border-brand transition-colors gap-2"
            >
              <Type className="w-6 h-6" />
              <span className="text-sm font-medium">Add Text</span>
            </button>
            <label className="flex flex-col items-center justify-center p-4 bg-surface dark:bg-white/5 rounded-xl border border-surface-border dark:border-white/10 hover:border-brand hover:text-brand dark:hover:border-brand transition-colors gap-2 cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={addLogo} />
              <ImageIcon className="w-6 h-6" />
              <span className="text-sm font-medium">Add Logo</span>
            </label>
          </div>

          {/* Bulk Names Input */}
          <div className="space-y-2 pt-4 border-t border-surface-border dark:border-white/10">
            <h3 className="font-semibold text-sm text-brand-muted">Bulk Names (Corporate Orders)</h3>
            <p className="text-xs text-brand-muted/70">Paste a list of names (one per line). We will apply the same logo to all.</p>
            <textarea 
              value={bulkNames}
              onChange={(e) => setBulkNames(e.target.value)}
              placeholder="John Doe\\nJane Smith\\nMichael Scott"
              className="w-full h-24 p-3 bg-surface dark:bg-white/5 border border-surface-border dark:border-white/10 rounded-xl text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none resize-none transition-all"
            />
          </div>

          {/* Properties Panel */}
          {selectedObject && (
            <div className="space-y-4 pt-6 border-t border-surface-border dark:border-white/10 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-brand-muted">Properties</h3>
                <button
                  onClick={() => {
                    canvas?.remove(selectedObject);
                    canvas?.discardActiveObject();
                    canvas?.renderAll();
                  }}
                  className="text-red-500 text-sm hover:underline font-medium"
                >
                  Remove
                </button>
              </div>

              {selectedObject.type === "i-text" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-brand-muted mb-1 block">Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={(selectedObject.fill as string) || "#000000"}
                        onChange={updateSelectedColor}
                        className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <span className="text-sm font-medium uppercase">{selectedObject.fill as string}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-brand-muted mb-1 block">Font</label>
                    <select
                      value={(selectedObject as fabric.IText).fontFamily}
                      onChange={(e) => {
                        (selectedObject as fabric.IText).set("fontFamily", e.target.value);
                        canvas?.renderAll();
                      }}
                      className="w-full border border-surface-border dark:border-white/15 dark:bg-[#1A1A22] dark:text-white dark:[color-scheme:dark] rounded-lg px-2 py-2 text-sm outline-none focus:border-brand"
                    >
                      <option value="Inter">Sans (Inter)</option>
                      <option value="'Playfair Display', serif">Serif (Playfair)</option>
                      <option value="'Dancing Script', cursive">Cursive</option>
                      <option value="monospace">Mono</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedObject.type === "image" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-brand-muted mb-1 block">Material Effect</label>
                    <button
                      onClick={() => {
                        const img = selectedObject as fabric.Image;
                        if (!img.filters || img.filters.length === 0) {
                           img.filters = [
                             new fabric.Image.filters.Grayscale(),
                             new fabric.Image.filters.Contrast({ contrast: 0.5 })
                           ];
                        } else {
                           img.filters = [];
                        }
                        img.applyFilters();
                        canvas?.renderAll();
                      }}
                      className="w-full py-2 bg-surface dark:bg-white/5 border border-surface-border dark:border-white/10 rounded-lg text-sm font-medium hover:border-brand transition-colors"
                    >
                      Toggle Laser Engrave / Deboss
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-surface-border dark:border-white/10 bg-white dark:bg-[#1A1A22] mt-auto">
          <button
            onClick={handleSave}
            disabled={saving || (canvas?.getObjects().length === 0)}
            className="w-full btn-brand py-3 rounded-xl shadow-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving design...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Save & Preview
              </>
            )}
          </button>
          <p className="text-xs text-brand-muted mt-3 text-center">
            * Drag items to position. Double click text to edit. Use Delete key to remove.
          </p>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        className="flex-1 bg-surface-secondary dark:bg-[#0D0D12] flex items-center justify-center p-4 md:p-8 overflow-hidden relative"
      >
        <div 
          ref={containerRef}
          className="relative w-full max-w-3xl aspect-square md:aspect-[4/3] bg-white shadow-card overflow-hidden rounded-2xl"
        >
          <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
      </div>
    </div>,
    document.body
  );
}
