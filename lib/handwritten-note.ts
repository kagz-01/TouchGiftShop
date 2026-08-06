/* ══════════════════════════════════════════════════════════
   Handwritten Note Generator
   - AI generates heartfelt text
   - Converts to handwritten font image
   - Or generates actual handwritten-style image via AI
   ══════════════════════════════════════════════════════════ */

export type NoteStyle = "handwritten" | "elegant" | "playful" | "classic";
export type NoteOutput = {
  text: string;
  imageUrl?: string;
  style: NoteStyle;
};

/* ─── Handwritten font mapping ─── */
const FONT_MAP: Record<NoteStyle, string> = {
  handwritten: "'Caveat', cursive",
  elegant: "'Dancing Script', cursive",
  playful: "'Patrick Hand', cursive",
  classic: "'Great Vibes', cursive",
};

/* ─── Generate heartfelt note text using AI ─── */
export async function generateNoteText(context: {
  recipient: string;
  relationship: string;
  occasion: string;
  tone?: "heartfelt" | "funny" | "formal" | "romantic" | "professional";
  language?: "en" | "sw" | "sheng";
  customMessage?: string;
}): Promise<string> {
  const tonePrompts: Record<string, string> = {
    heartfelt: "Write a heartfelt, genuine message. Be warm and sincere.",
    funny: "Write a funny, light-hearted message with humor.",
    formal: "Write a professional, warm but formal message.",
    romantic: "Write a romantic, loving message.",
    professional: "Write a professional thank-you message for a business context.",
  };

  const langMap: Record<string, string> = {
    en: "in English",
    sw: "in Kiswahili",
    sheng: "in Kenyan Sheng (mix of English and Swahili)",
  };

  const prompt = `${tonePrompts[context.tone || "heartfelt"]}

Context:
- Recipient: ${context.recipient}
- Relationship: ${context.relationship}
- Occasion: ${context.occasion}
- Language: ${langMap[context.language || "en"]}
${context.customMessage ? `- Additional context: ${context.customMessage}` : ""}

Write ONLY the note message itself. No quotes, no "Dear [Name]" — just the message body. Keep it to 2-4 sentences. Make it feel personal and genuine, like it was written by someone who truly cares.`;

  try {
    // Try Grok first (best for creative writing)
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.9,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.choices[0].message.content.trim();
    }
  } catch { /* fallback */ }

  // Fallback to OpenAI
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.9,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.choices[0].message.content.trim();
    }
  } catch { /* fallback */ }

  return getDefaultNote(context.occasion, context.language);
}

/* ─── Generate handwritten-style image ─── */
export async function generateNoteImage(text: string, style: NoteStyle = "handwritten"): Promise<string> {
  // Method 1: Generate via OpenAI DALL-E
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `A beautiful handwritten note on cream textured paper with elegant handwriting that reads: "${text}". The handwriting should look natural and personal, with slight imperfections that make it feel authentic. Soft warm lighting, close-up shot of the note.`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.data[0].url;
    }
  } catch { /* fallback */ }

  // Method 2: Generate HTML-to-image client-side (fallback)
  return "";
}

/* ─── Convert text to handwritten HTML (for client-side rendering) ─── */
export function renderHandwrittenNote(text: string, style: NoteStyle = "handwritten"): string {
  const font = FONT_MAP[style];
  return `
    <div style="
      font-family: ${font};
      font-size: 24px;
      line-height: 1.8;
      color: #2D2D2D;
      padding: 40px;
      background: linear-gradient(135deg, #FDF8F4 0%, #FFF5F0 100%);
      border-radius: 12px;
      max-width: 400px;
      position: relative;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    ">
      <div style="
        position: absolute;
        top: 15px;
        left: 15px;
        right: 15px;
        bottom: 15px;
        border: 1px solid rgba(155, 27, 90, 0.1);
        border-radius: 8px;
        pointer-events: none;
      "></div>
      <p style="margin: 0; white-space: pre-wrap;">${text}</p>
      <div style="
        margin-top: 30px;
        text-align: right;
        font-size: 16px;
        color: #9B1B5A;
      ">
        — with love ♥
      </div>
    </div>
  `;
}

/* ─── Default notes by occasion ─── */
function getDefaultNote(occasion: string, language?: string): string {
  const defaults: Record<string, Record<string, string>> = {
    birthday: {
      en: "Wishing you a day filled with love, laughter, and all the things that make you happiest. Happy Birthday!",
      sw: "Nakutakia siku yenye upendo na furaha. Furaha ya siku yako ya kuzaliwa!",
      sheng: "Happy Birthday! May this year bring you nothing but good vibes and blessings. Enjoy your day! 🎂",
    },
    anniversary: {
      en: "Every love story is beautiful, but ours is my favorite. Here's to another year of making memories together.",
      sw: "Kila hadithi ya upendo ni nzuri, lakini yetu ndio pendwa zaidi. Kwenu miaka mingine ya kukumbuka pamoja.",
      sheng: "Another year, another chapter. Here's to us and all the memories we've made. Love you always! ❤️",
    },
    wedding: {
      en: "May your love grow stronger with each passing year. Wishing you a lifetime of happiness together.",
      sw: "Mupendo wenu ukue kila mwaka. Nakutakia maisha yenye furaha pamoja.",
      sheng: "Congrats on tying the knot! Wishing you nothing but love and good times ahead. 🎉",
    },
    thankyou: {
      en: "Thank you for everything you do. Your kindness and generosity mean more than words can express.",
      sw: "Asante kwa kila unachofanya. Ukarimu wako unazidi maneno.",
      sheng: "Just wanted to say asante sana. You're truly one of a kind. 🙏",
    },
    default: {
      en: "Thinking of you and hoping this brings a smile to your face. You deserve all the good things.",
      sw: "Nakukumbuka na natumaini hii itakufanya umecheka. Unastahili kila kitu kizuri.",
      sheng: "Just thinking about you and wanted to send some love your way. You're amazing! 💕",
    },
  };

  const occasionKey = occasion.toLowerCase().includes("birth") ? "birthday"
    : occasion.toLowerCase().includes("anniv") ? "announcement"
    : occasion.toLowerCase().includes("wed") ? "wedding"
    : occasion.toLowerCase().includes("thank") ? "thankyou"
    : "default";

  const langDefaults = defaults[occasionKey] || defaults.default;
  return langDefaults[language || "en"] || langDefaults.en;
}

/* ─── Note style options for UI ─── */
export const NOTE_STYLES = [
  { id: "handwritten" as NoteStyle, label: "Handwritten", icon: "✍️", desc: "Natural, personal handwriting" },
  { id: "elegant" as NoteStyle, label: "Elegant", icon: "📜", desc: "Graceful calligraphy style" },
  { id: "playful" as NoteStyle, label: "Playful", icon: "🎨", desc: "Fun, casual handwriting" },
  { id: "classic" as NoteStyle, label: "Classic", icon: "🖋️", desc: "Timeless, sophisticated script" },
];
