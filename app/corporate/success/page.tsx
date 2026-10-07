"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, Download, Briefcase, Mail } from "lucide-react";

export default function CorporateSuccessPage() {
  const router = useRouter();
  const [slugs, setSlugs] = useState<string[]>([]);
  const [method, setMethod] = useState<string>("links");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedSlugs = sessionStorage.getItem("bulk_gift_slugs");
    const storedMethod = sessionStorage.getItem("bulk_method");
    
    if (storedSlugs) {
      setSlugs(JSON.parse(storedSlugs));
    }
    if (storedMethod) {
      setMethod(storedMethod);
    }
  }, []);

  if (slugs.length === 0) {
    return (
      <div className="min-h-screen bg-[#050304] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  const linksText = slugs.map(s => `https://touchgift.shop/open/${s}`).join("\n");

  const handleCopyAll = () => {
    navigator.clipboard?.writeText(linksText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Magic Link\n" + slugs.map(s => `https://touchgift.shop/open/${s}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "touchgift_corporate_links.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#050304] text-white flex flex-col items-center justify-center px-4 relative overflow-hidden selection:bg-emerald-500/30">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full relative z-10 py-12">
        <div className="text-center mb-12 animate-in zoom-in fade-in duration-700">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-3">Order Confirmed!</h1>
          <p className="text-white/60 text-lg">Your corporate B2B order for {slugs.length} gifts has been processed.</p>
        </div>

        {method === "links" ? (
          <div className="bg-[#0C080A] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-bold text-xl mb-1">Your Magic Links</h3>
                <p className="text-sm text-white/50">Send these to your team via Slack, Teams, or Email.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopyAll} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied All" : "Copy All"}
                </button>
                <button onClick={handleDownloadCSV} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" /> CSV
                </button>
              </div>
            </div>

            <div className="bg-black/50 border border-white/5 rounded-2xl p-4 h-64 overflow-y-auto space-y-2 font-mono text-xs text-emerald-400/80">
              {slugs.map((slug, i) => (
                <div key={slug} className="flex gap-4 p-2 hover:bg-white/5 rounded">
                  <span className="text-white/30 w-6">{i + 1}.</span>
                  <span>https://touchgift.shop/open/{slug}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#0C080A] border border-white/10 rounded-3xl p-8 shadow-2xl text-center animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150">
            <Mail className="w-16 h-16 text-emerald-400 mx-auto mb-6 opacity-80" />
            <h3 className="font-bold text-2xl mb-2">Blast Initiated</h3>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              We are automatically dispatching the magic unboxing links to the {slugs.length} emails you provided in your CSV. 
              You will receive a delivery report in your inbox once the blast is complete.
            </p>
            <button onClick={() => router.push("/corporate")} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              Back to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
