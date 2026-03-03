'use client';

import { useState, useTransition } from 'react';
import { FlaskConical } from 'lucide-react';
import { addTestFunds } from './actions';

export default function AddTestFunds({ currentBalance }: { currentBalance: number }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleAdd = () => {
    startTransition(async () => {
      setMessage(null);
      const result = await addTestFunds(100);
      if (result.success) {
        setMessage(`✓ Added 100 BHD — new balance: ${result.newBalance?.toFixed(2)} BHD`);
      } else {
        setMessage(`✗ ${result.error}`);
      }
    });
  };

  return (
    <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex flex-col gap-3">
      <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
        <FlaskConical className="w-3 h-3" /> Testing Allowance
      </p>
      <p className="text-xs text-zinc-500 leading-relaxed">
        Current balance: <strong className="text-white font-bold">{currentBalance.toFixed(2)} BHD</strong>. Press the button below to add 100 BHD test funds.
      </p>
      <button
        onClick={handleAdd}
        disabled={isPending}
        className="w-full py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Processing...' : '+ Add 100 BHD (Test)'}
      </button>
      {message && (
        <p className={`text-xs font-bold ${message.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
