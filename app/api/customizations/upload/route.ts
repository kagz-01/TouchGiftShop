import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    // image is a data URL like "data:image/png;base64,..."
    const base64 = image.split(",")[1];
    if (!base64) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    const buffer = Buffer.from(base64, "base64");
    const filename = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("customizations")
      .upload(filename, buffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      // If bucket doesn't exist, try to create it
      if (uploadError.message?.includes("Bucket not found")) {
        await supabaseAdmin.storage.createBucket("customizations", {
          public: true,
          fileSizeLimit: 5 * 1024 * 1024,
          allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
        });
        // Retry upload
        const { error: retryError } = await supabaseAdmin.storage
          .from("customizations")
          .upload(filename, buffer, {
            contentType: "image/png",
            upsert: false,
          });
        if (retryError) {
          return NextResponse.json({ error: retryError.message }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("customizations")
      .getPublicUrl(filename);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Upload failed" }, { status: 500 });
  }
}
