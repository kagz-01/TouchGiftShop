/* ══════════════════════════════════════════════════════════
   LibreTranslate Integration
   Translate any language → English/Swahili/Sheng
   for the AI Gift Chat
   ══════════════════════════════════════════════════════════ */

const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || "https://libretranslate.com";

/* ─── Detect language using LibreTranslate ─── */
export async function detectLanguage(text: string): Promise<string | null> {
  try {
    const res = await fetch(`${LIBRETRANSLATE_URL}/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null; // API key required or other error
    // Returns array of { language: "fr", confidence: 0.9 }
    return data?.[0]?.language || null;
  } catch {
    return null;
  }
}

/* ─── Translate text to target language ─── */
export async function translate(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  if (sourceLang === targetLang) return text;

  try {
    const res = await fetch(`${LIBRETRANSLATE_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
      }),
    });

    if (!res.ok) return text;
    const data = await res.json();
    if (data.error) return text; // API key required
    return data?.translatedText || text;
  } catch {
    return text;
  }
}

/* ─── Supported languages for UI display ─── */
export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "sw", label: "Kiswahili", flag: "🇰🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "so", label: "Soomaali", flag: "🇸🇴" },
  { code: "am", label: "አማርኛ", flag: "🇪🇹" },
  { code: "ha", label: "Hausa", flag: "🇳🇬" },
  { code: "yo", label: "Yorùbá", flag: "🇳🇬" },
];

/* ─── Map common language codes to our internal codes ─── */
export function mapToInternalLang(code: string): "en" | "sw" | "sheng" {
  if (code === "sw") return "sw";
  // Everything else defaults to English for AI processing
  // AI will respond in the user's language via translation
  return "en";
}

/* ─── Check if text is likely in a supported language ─── */
const NATIVE_PATTERNS = {
  en: /\b(the|is|are|what|how|gift|for|my|help|find|send|give|want|need)\b/i,
  sw: /\b(kuna|gani|nisaidie|tafuta|penda|sawa|asante|karibu|hujambo|niko|wewe|poa)\b/i,
  sheng: /\b(niko|wewe|mi|poa|sawa|manzi|bro|ndio|hapo|sasa|maze|raha|chill|bana|sijui)\b/i,
};

export function isNativeLanguage(text: string): boolean {
  for (const [, pattern] of Object.entries(NATIVE_PATTERNS)) {
    if (pattern.test(text)) return true;
  }
  return false;
}

/* ══════════════════════════════════════════════════════════
   FULL TRANSLATION PIPELINE
   1. Detect user's language
   2. If not en/sw/sheng, translate input → English
   3. Process with AI
   4. Translate AI response → user's language
   ══════════════════════════════════════════════════════════ */
export async function translateForChat(
  message: string,
  detectedLang?: string
): Promise<{
  translatedMessage: string;
  userLanguage: string;
  needsTranslation: boolean;
}> {
  // If language is already supported natively, no translation needed
  if (!detectedLang) {
    detectedLang = await detectLanguage(message) || "en";
  }

  const isNative = isNativeLanguage(message);
  const isSupportedNative = ["en", "sw"].includes(detectedLang);

  if (isNative || isSupportedNative) {
    return {
      translatedMessage: message,
      userLanguage: detectedLang === "sw" ? "sw" : "en",
      needsTranslation: false,
    };
  }

  // If translation service unavailable, treat as English
  const translated = await translate(message, detectedLang, "en").catch(() => message);
  const didTranslate = translated !== message;

  return {
    translatedMessage: didTranslate ? translated : message,
    userLanguage: didTranslate ? detectedLang : "en",
    needsTranslation: didTranslate,
  };
}

export async function translateFromChat(
  response: string,
  userLanguage: string
): Promise<string> {
  if (userLanguage === "en" || userLanguage === "sw") return response;
  return translate(response, "en", userLanguage);
}
