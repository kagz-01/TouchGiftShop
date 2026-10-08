"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, Download, Briefcase, Mail, ArrowRight, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-[#050304] text-white flex flex-col items-center justify-center px-4 relative overflow-hidden selection:bg-emerald-500/30 font-sans">
      
      {/* Ambient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-900/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-teal-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl w-full relative z-10 py-12">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(16,185,129,0.2)] relative">
            <div className="absolute inset-0 rounded-full border border-emerald-400/20 animate-ping opacity-20" />
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="font-display text-5xl font-bold mb-4 tracking-tight">Deployment Authorized</h1>
          <p className="text-white/50 text-lg font-medium tracking-wide">
            Your enterprise order of <span className="text-emerald-400 font-bold">{slugs.length}</span> secure gift links has been successfully provisioned.
          </p>
        </motion.div>

        {method === "links" ? (
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-50" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-white/5 gap-4">
              <div>
                <h3 className="font-display font-bold text-2xl mb-1 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-emerald-400" />
                  Magic Link Roster
                </h3>
                <p className="text-sm text-white/40">Secure distribution endpoints for your team.</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={handleCopyAll} className="flex-1 sm:flex-none px-5 py-3 bg-white/5 hover:bg-white/10 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-white/10">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/60" />}
                  {copied ? "Copied All" : "Copy to Clipboard"}
                </button>
                <button onClick={handleDownloadCSV} className="flex-1 sm:flex-none px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#050304] text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 h-[320px] overflow-y-auto space-y-1 font-mono text-sm custom-scrollbar relative">
              {slugs.map((slug, i) => (
                <div key={slug} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors group cursor-copy" onClick={() => {
                  navigator.clipboard?.writeText(`https://touchgift.shop/open/${slug}`);
                }}>
                  <span className="text-white/20 w-8 text-right font-bold text-xs">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-emerald-400/80 group-hover:text-emerald-400 transition-colors truncate">https://touchgift.shop/open/{slug}</span>
                  <Copy className="w-3 h-3 text-white/0 group-hover:text-white/30 ml-auto transition-colors" />
                </div>
              ))}
              
              {/* Fade out bottom overlay */}
              <div className="sticky bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            </div>
            
            <div className="mt-8 flex justify-center">
              <button onClick={() => router.push("/corporate")} className="text-sm font-bold text-white/40 hover:text-white flex items-center gap-2 transition-colors">
                Return to Enterprise Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/[0.02] border border-white/5 rounded-3xl p-12 backdrop-blur-xl shadow-2xl text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-50" />
            
            <div className="w-20 h-20 mx-auto bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-emerald-400/20 rounded-2xl blur-xl animate-pulse" />
              <Mail className="w-10 h-10 text-emerald-400 relative z-10" />
            </div>
            
            <h3 className="font-display font-bold text-3xl mb-4">Distribution Initiated</h3>
            <p className="text-white/50 mb-10 max-w-lg mx-auto leading-relaxed">
              The enterprise engine is automatically dispatching <span className="text-white font-bold">{slugs.length}</span> secure unboxing links to the roster provided in your CSV. 
              A comprehensive delivery report will be routed to your inbox shortly.
            </p>
            
            <button onClick={() => router.push("/corporate")} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#050304] rounded-xl font-bold transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_50px_rgba(16,185,129,0.4)] flex items-center gap-2 mx-auto">
              Access Enterprise Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
