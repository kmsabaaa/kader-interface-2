'use client';

import { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { toggleUserRole } from './actions';

interface RoleSwitchProps {
  isProvider: boolean;
}

export default function RoleSwitch({ isProvider }: RoleSwitchProps) {
  const [state, setState] = useState({ success: null, error: undefined } as any);
  const [isPending, setIsPending] = useState(false);

  const handleToggleRole = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const result = await toggleUserRole();
      setState(result);
    } catch (error) {
      setState({ 
        error: error instanceof Error ? error.message : 'An error occurred',
        success: undefined 
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleToggleRole} className="w-full">
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 rounded-xl border border-white/10 text-sm font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </>
        ) : (
          <>
            <ArrowRightLeft className="w-4 h-4" />
            Switch to {isProvider ? "Consumer" : "Provider"}
          </>
        )}
      </button>
    </form>
  );
}
