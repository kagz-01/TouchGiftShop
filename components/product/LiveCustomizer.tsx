"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Rnd } from "react-rnd";

interface CustomLayer {
  id: string;
  type: "text" | "image" | "shape";
  content?: string;
  url?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: string;
}

interface LiveCustomizerProps {
  baseImage: string;
  onClose: () => void;
}

export default function LiveCustomizer({ baseImage, onClose }: LiveCustomizerProps) {
  const [layers, setLayers] = useState<CustomLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const addTextLayer = () => {
    const newLayer: CustomLayer = {
      id: `text-${Date.now()}`,
      type: "text",
      content: "Your Text Here",
      x: 50,
      y: 50,
      width: 200,
      height: 50,
      fontSize: 24,
      fontFamily: "Inter, sans-serif",
      color: "#ffffff",
    };
    setLayers([...layers, newLayer]);
    setSelectedId(newLayer.id);
  };

  const addShapeLayer = () => {
    const newLayer: CustomLayer = {
      id: `shape-${Date.now()}`,
      type: "shape",
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      backgroundColor: "#ffffff",
      borderRadius: "0%",
    };
    setLayers([...layers, newLayer]);
    setSelectedId(newLayer.id);
  };

  const addImageLayer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newLayer: CustomLayer = {
        id: `image-${Date.now()}`,
        type: "image",
        url: event.target?.result as string,
        x: 50,
        y: 50,
        width: 150,
        height: 150,
      };
      setLayers([...layers, newLayer]);
      setSelectedId(newLayer.id);
    };
    reader.readAsDataURL(file);
  };

  const updateLayer = (id: string, updates: Partial<CustomLayer>) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const removeLayer = (id: string) => {
    setLayers(layers.filter((l) => l.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-surface flex flex-col md:flex-row animate-fade-in">
      {/* Sidebar Toolbar */}
      <div className="w-full md:w-80 bg-white border-r border-surface-border flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-surface-border flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Customization Studio</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Add Tools */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={addTextLayer}
              className="flex flex-col items-center justify-center p-4 bg-surface rounded-xl border border-surface-border hover:border-brand hover:text-brand transition-colors gap-2"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-sm font-medium">Add Text</span>
            </button>
            <label className="flex flex-col items-center justify-center p-4 bg-surface rounded-xl border border-surface-border hover:border-brand hover:text-brand transition-colors gap-2 cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={addImageLayer} />
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Add Logo</span>
            </label>
            <button
              onClick={addShapeLayer}
              className="flex flex-col items-center justify-center p-4 bg-surface rounded-xl border border-surface-border hover:border-brand hover:text-brand transition-colors gap-2 col-span-2"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <span className="text-sm font-medium">Add Cover-up Shape</span>
            </button>
          </div>

          {/* Edit Selected Tool */}
          {selectedId && (
            <div className="space-y-4 pt-6 border-t border-surface-border animate-fade-in-up">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-brand-muted">Edit Layer</h3>
                <button
                  onClick={() => removeLayer(selectedId)}
                  className="text-red-500 text-sm hover:underline font-medium"
                >
                  Remove
                </button>
              </div>

              {layers.find((l) => l.id === selectedId)?.type === "text" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-brand-muted mb-1 block">Text Content</label>
                    <input
                      type="text"
                      value={layers.find((l) => l.id === selectedId)?.content}
                      onChange={(e) => updateLayer(selectedId, { content: e.target.value })}
                      className="w-full border border-surface-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-brand-muted mb-1 block">Color</label>
                      <input
                        type="color"
                        value={layers.find((l) => l.id === selectedId)?.color}
                        onChange={(e) => updateLayer(selectedId, { color: e.target.value })}
                        className="w-full h-9 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-brand-muted mb-1 block">Font</label>
                      <select
                        value={layers.find((l) => l.id === selectedId)?.fontFamily}
                        onChange={(e) => updateLayer(selectedId, { fontFamily: e.target.value })}
                        className="w-full border border-surface-border rounded-lg px-2 py-2 text-sm outline-none focus:border-brand"
                      >
                        <option value="Inter, sans-serif">Sans</option>
                        <option value="'Playfair Display', serif">Serif</option>
                        <option value="'Dancing Script', cursive">Cursive</option>
                        <option value="monospace">Mono</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {layers.find((l) => l.id === selectedId)?.type === "shape" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-brand-muted mb-1 block">Color</label>
                      <input
                        type="color"
                        value={layers.find((l) => l.id === selectedId)?.backgroundColor}
                        onChange={(e) => updateLayer(selectedId, { backgroundColor: e.target.value })}
                        className="w-full h-9 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-brand-muted mb-1 block">Shape</label>
                      <select
                        value={layers.find((l) => l.id === selectedId)?.borderRadius}
                        onChange={(e) => updateLayer(selectedId, { borderRadius: e.target.value })}
                        className="w-full border border-surface-border rounded-lg px-2 py-2 text-sm outline-none focus:border-brand"
                      >
                        <option value="0%">Square</option>
                        <option value="50%">Circle</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-surface-border bg-white mt-auto">
          <button onClick={onClose} className="w-full btn-brand py-3 rounded-xl shadow-button">
            Looks Good
          </button>
          <p className="text-xs text-brand-muted mt-3 text-center">
            * This is a visual preview. Final placement will be optimized by our experts.
          </p>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-surface-secondary flex items-center justify-center p-4 md:p-12 overflow-hidden relative" onClick={() => setSelectedId(null)}>
        <div 
          ref={containerRef}
          className="relative w-full max-w-2xl aspect-square md:aspect-[4/3] bg-white rounded-3xl shadow-card overflow-hidden"
          style={{ backgroundImage: `url(${baseImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          {layers.map((layer) => (
            <Rnd
              key={layer.id}
              bounds="parent"
              position={{ x: layer.x, y: layer.y }}
              size={{ width: layer.width, height: layer.height }}
              onDragStop={(e, d) => updateLayer(layer.id, { x: d.x, y: d.y })}
              onResizeStop={(e, direction, ref, delta, position) => {
                updateLayer(layer.id, {
                  width: parseInt(ref.style.width, 10),
                  height: parseInt(ref.style.height, 10),
                  ...position,
                });
              }}
              onClick={(e: any) => { e.stopPropagation(); setSelectedId(layer.id); }}
              className={cn(
                "group cursor-move flex items-center justify-center",
                selectedId === layer.id ? "ring-2 ring-brand ring-offset-2 border border-brand/20 bg-brand/5" : "hover:ring-2 hover:ring-brand/50 hover:ring-offset-2"
              )}
            >
              {layer.type === "text" ? (
                <div
                  style={{
                    color: layer.color,
                    fontFamily: layer.fontFamily,
                    fontSize: `${layer.height * 0.8}px`, // approximate scaling
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}
                  className="w-full h-full flex items-center justify-center select-none drop-shadow-md"
                >
                  {layer.content}
                </div>
              ) : layer.type === "image" ? (
                <div className="w-full h-full relative pointer-events-none">
                  <Image src={layer.url!} alt="Custom logo" fill className="object-contain drop-shadow-md" />
                </div>
              ) : (
                <div
                  className="w-full h-full pointer-events-none transition-all"
                  style={{
                    backgroundColor: layer.backgroundColor,
                    borderRadius: layer.borderRadius,
                  }}
                />
              )}
            </Rnd>
          ))}
          {layers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/50 text-white px-6 py-3 rounded-full font-medium backdrop-blur-md animate-pulse">
                Add text or logo to customize
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
