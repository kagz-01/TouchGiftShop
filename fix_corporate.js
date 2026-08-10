const fs = require('fs');

let file = fs.readFileSync('components/corporate/CorporateLanding.tsx', 'utf8');

// Add imports
file = file.replace(
  'import Link from "next/link";',
  'import Link from "next/link";\nimport { Candy, Coffee, Flame, Cake as CakeIcon, Package, Gift, Zap, Banknote, Palette, FileSpreadsheet, Trophy, HeartHandshake, Tent, TreePine, Hand, Heart, ClipboardList, CreditCard, Building2 } from "lucide-react";'
);

// Add max-w-7xl
file = file.replace(/className="w-full mx-auto px-4 md:px-8/g, 'className="w-full max-w-7xl mx-auto px-4 md:px-8');
file = file.replace(/className="relative z-10 w-full mx-auto px-4 md:px-8/g, 'className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8');

// Fix Hero emojis
file = file.replace('🏢 Corporate Gifting', '<Building2 className="w-4 h-4"/> Corporate Gifting');
file = file.replace('["🍫", "☕", "🕯️", "🧁", "📦", "🎀"]', '[<Candy key="1"/>, <Coffee key="2"/>, <Flame key="3"/>, <CakeIcon key="4"/>, <Package key="5"/>, <Gift key="6"/>]');
file = file.replace('<div className="text-6xl mb-4">🎁</div>', '<div className="text-6xl mb-4 text-brand"><Gift className="w-12 h-12" /></div>');

// Fix TrustBar
file = file.replace('icon: "⚡"', 'icon: <Zap className="w-8 h-8 mx-auto text-brand" />');
file = file.replace('icon: "💰"', 'icon: <Banknote className="w-8 h-8 mx-auto text-gold" />');
file = file.replace('icon: "🎨"', 'icon: <Palette className="w-8 h-8 mx-auto text-coral" />');
file = file.replace('icon: "📊"', 'icon: <FileSpreadsheet className="w-8 h-8 mx-auto text-success" />');

// Fix UseCases
file = file.replace('icon: "🏆"', 'icon: <Trophy className="w-6 h-6 text-white" />');
file = file.replace('icon: "🤝"', 'icon: <HeartHandshake className="w-6 h-6 text-white" />');
file = file.replace('icon: "🎪"', 'icon: <Tent className="w-6 h-6 text-white" />');
file = file.replace('icon: "🎄"', 'icon: <TreePine className="w-6 h-6 text-white" />');
file = file.replace('icon: "👋"', 'icon: <Hand className="w-6 h-6 text-white" />');
file = file.replace('icon: "🙏"', 'icon: <Heart className="w-6 h-6 text-white" />');

// Fix HowItWorks
file = file.replace('icon: "🎁"', 'icon: <Gift className="w-8 h-8" />');
file = file.replace('icon: "📋"', 'icon: <ClipboardList className="w-8 h-8" />');
file = file.replace('icon: "🎨"', 'icon: <Palette className="w-8 h-8" />');
file = file.replace('icon: "💳"', 'icon: <CreditCard className="w-8 h-8" />');
// Note: We need to avoid replacing the 'icon: "🎁"' in UseCases if it exists, but the replace string is specific enough. 
// Wait, 'icon: "🎨"' is in TrustBar AND HowItWorks, so we should make sure we replace the second one or use global replace carefully.

fs.writeFileSync('components/corporate/CorporateLanding.tsx', file);
