import { NextRequest, NextResponse } from "next/server";
import { generateNoteText, generateNoteImage, type NoteStyle } from "@/lib/handwritten-note";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    mode, // "generate" | "custom" | "image"
    text,
    recipient,
    relationship,
    occasion,
    tone,
    language,
    style = "handwritten",
    customMessage,
  } = body;

  // Generate AI note text
  if (mode === "generate") {
    const noteText = await generateNoteText({
      recipient: recipient || "someone special",
      relationship: relationship || "friend",
      occasion: occasion || "just because",
      tone: tone || "heartfelt",
      language: language || "en",
      customMessage,
    });

    return NextResponse.json({ text: noteText, style });
  }

  // User provided their own text
  if (mode === "custom") {
    if (!text || text.length > 300) {
      return NextResponse.json({ error: "Text must be 1-300 characters" }, { status: 400 });
    }
    return NextResponse.json({ text, style });
  }

  // Generate handwritten image from text
  if (mode === "image") {
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const imageUrl = await generateNoteImage(text, style as NoteStyle);
    return NextResponse.json({ imageUrl, text, style });
  }

  return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
}
