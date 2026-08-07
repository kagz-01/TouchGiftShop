import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import sharp from "sharp";

const BUCKET = "reviews";
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO = ["video/mp4", "video/webm"];

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
  }

  const isImage = ALLOWED_IMAGE.includes(file.type);
  const isVideo = ALLOWED_VIDEO.includes(file.type);

  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: "Unsupported file type. Use JPEG, PNG, WebP, MP4, or WebM." },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const input = Buffer.from(arrayBuffer);

  let uploadBuffer: Buffer;
  let contentType: string;
  let ext: string;

  if (isImage) {
    // Convert all images to WebP for storage efficiency
    uploadBuffer = await sharp(input).webp({ quality: 80 }).toBuffer();
    contentType = "image/webp";
    ext = "webp";
  } else {
    // Videos pass through as-is (already efficient codecs)
    uploadBuffer = input;
    contentType = file.type;
    ext = file.type === "video/mp4" ? "mp4" : "webm";
  }

  const filename = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filename, uploadBuffer, { contentType, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filename);

  return NextResponse.json({
    url: data.publicUrl,
    mediaType: isImage ? "image" : "video",
  });
}
