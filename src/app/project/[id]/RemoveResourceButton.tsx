"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { removeCallSheetItem } from "../../dashboard/actions";

export default function RemoveResourceButton({ itemId }: { itemId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleRemove = () => {
    if (!confirm("Remove this resource from the project? The booking request will be cancelled.")) return;
    startTransition(async () => {
      const result = await removeCallSheetItem(itemId);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div>
      {error && <p className="text-red-400 text-xs mb-1">{error}</p>}
      <button
        onClick={handleRemove}
        disabled={isPending}
        className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg hover:bg-red-500/5 border border-transparent hover:border-red-500/10"
      >
        <Trash2 className="w-3.5 h-3.5" />
        {isPending ? "Removing..." : "Remove"}
      </button>
    </div>
  );
}
