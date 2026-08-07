"use client";

import { useState, useRef } from "react";
import StarRating from "./StarRating";

interface ReviewFormProps {
  productId: string;
  orderId?: string;
  existingReview?: {
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  productId,
  orderId,
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [body, setBody] = useState(existingReview?.body || "");
  const [reviewerName, setReviewerName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length + files.length > 5) {
      setError("Maximum 5 files allowed");
      return;
    }
    setFiles((prev) => [...prev, ...selected]);

    // Generate previews
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<{ url: string; mediaType: "image" | "video" }[]> => {
    const uploaded: { url: string; mediaType: "image" | "video" }[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/reviews/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await res.json();
      uploaded.push({ url: data.url, mediaType: data.mediaType });
    }

    return uploaded;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!reviewerName.trim() && !existingReview && !isAnonymous) {
      setError("Please enter your name or choose anonymous");
      return;
    }

    setSubmitting(true);

    try {
      let media: { url: string; mediaType: "image" | "video" }[] = [];

      if (files.length > 0) {
        setUploading(true);
        media = await uploadFiles();
        setUploading(false);
      }

      const url = existingReview
        ? `/api/reviews/${existingReview.id}`
        : "/api/reviews";

      const method = existingReview ? "PATCH" : "POST";

      const bodyPayload = existingReview
        ? { rating, title: title || undefined, body: body || undefined }
        : {
            productId,
            orderId,
            rating,
            title: title || undefined,
            body: body || undefined,
            reviewerName: reviewerName.trim() || "Anonymous",
            isAnonymous,
            media,
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block text-sm font-semibold text-brand-deep mb-2">
          Your rating
        </label>
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
      </div>

      {/* Name */}
      {!existingReview && (
        <div>
          <label className="block text-sm font-semibold text-brand-deep mb-2">
            Your name
          </label>
          <input
            type="text"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="e.g. Grace M."
            disabled={isAnonymous}
            className="w-full px-4 py-3 rounded-xl border border-surface-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            maxLength={100}
          />

          {/* Anonymous toggle */}
          <label className="flex items-center gap-3 mt-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => {
                  setIsAnonymous(e.target.checked);
                  if (e.target.checked) setReviewerName("");
                }}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-brand transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform" />
            </div>
            <span className="text-sm text-brand-muted group-hover:text-brand-deep transition-colors">
              Submit anonymously
            </span>
          </label>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-brand-deep mb-2">
          Review title <span className="font-normal text-brand-muted">(optional)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          className="w-full px-4 py-3 rounded-xl border border-surface-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
          maxLength={200}
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-semibold text-brand-deep mb-2">
          Your review <span className="font-normal text-brand-muted">(optional)</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell others about your experience..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-surface-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors resize-none"
          maxLength={2000}
        />
        <p className="text-xs text-brand-muted mt-1 text-right">
          {body.length}/2000
        </p>
      </div>

      {/* Photo/Video upload */}
      <div>
        <label className="block text-sm font-semibold text-brand-deep mb-2">
          Photos / Videos <span className="font-normal text-brand-muted">(max 5, 10MB each)</span>
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-surface-border hover:border-brand/30 rounded-xl p-6 text-center transition-colors"
        >
          <svg
            className="w-8 h-8 mx-auto mb-2 text-brand-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-brand-muted">
            Tap to add photos or videos
          </p>
        </button>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl border border-surface-border text-sm font-semibold text-brand-muted hover:bg-surface-secondary transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || uploading}
          className="flex-1 px-4 py-3 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading
            ? "Uploading photos..."
            : submitting
            ? "Submitting..."
            : existingReview
            ? "Update Review"
            : "Submit Review"}
        </button>
      </div>
    </form>
  );
}
