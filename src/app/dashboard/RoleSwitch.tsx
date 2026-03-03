"use client";

import { useTransition } from "react";
import { ArrowRightLeft } from "lucide-react";
import { toggleUserRole } from "./actions";
import { useRouter } from "next/navigation";

interface RoleSwitchProps {
  isProvider: boolean;
}

export default function RoleSwitch({ isProvider }: RoleSwitchProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggleRole = async () => {
    startTransition(async () => {
      const result = await toggleUserRole();
      if (result.success) {
        // Force a hard refresh and go back to overview tab to clear searchParams
        window.location.href = "/dashboard?tab=overview";
      } else if (result.error) {
        alert(result.error);
      }
    });
  };

  return (
    <button
      onClick={handleToggleRole}
      disabled={isPending}
      className="w-full py-3 rounded-xl border border-white/10 text-sm font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <ArrowRightLeft className="w-4 h-4" />
          Switch to {isProvider ? "Consumer" : "Provider"}
        </>
      )}
    </button>
  );
}
