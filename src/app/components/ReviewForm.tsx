"use client";

import { useState, useTransition } from "react";
import { Star, Send, CheckCircle, AlertCircle } from "lucide-react";
import { submitReview } from "../dashboard/actions";

interface ReviewFormProps {
  listingId?: string;
  targetUserId?: string;
  label?: string;
}

export default function ReviewForm({ listingId, targetUserId, label = "Leave a Review" }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    formData.set("rating", String(rating));
    if (listingId) formData.set("listingId", listingId);
    if (targetUserId) formData.set("targetUserId", targetUserId);

    startTransition(async () => {
      const res = await submitReview(formData);
      if (res?.error) {
        setStatus("error");
        setErrorMsg(res.error);
      } else {
        setStatus("success");
        setTimeout(() => {
          setIsOpen(false);
          setStatus("idle");
        }, 2000);
      }
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm font-bold text-amber-500 hover:text-amber-400 transition-colors px-4 py-2 border border-amber-500/20 rounded-xl bg-amber-500/5 hover:bg-amber-500/10"
      >
        <Star className="w-4 h-4 fill-amber-500" /> {label}
      </button>
    );
  }

  return (
    <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-white">{label}</h4>
        <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white text-xs font-medium">
          Cancel
        </button>
      </div>

      {status === "success" ? (
        <div className="flex items-center gap-3 text-emerald-400 py-4">
          <CheckCircle className="w-5 h-5" />
          <span className="font-bold">Review submitted!</span>
        </div>
      ) : (
        <form action={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= (hovered || rating) ? "fill-amber-400 text-amber-400" : "text-zinc-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
              Comment <span className="text-zinc-600 font-normal">(optional)</span>
            </label>
            <textarea
              name="comment"
              rows={3}
              placeholder="Share your experience..."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-none text-sm"
            />
          </div>

          {status === "error" && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-black border-t-amber-500 rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" /> Submit Review
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
