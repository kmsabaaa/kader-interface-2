'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';

export default function SearchInput({ initialValue }: { initialValue: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value === initialValue) return;

      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('q', value);
      } else {
        params.delete('q');
      }

      router.replace(\`/search?\${params.toString()}\`, { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [value, router, searchParams, initialValue]);

  return (
    <div className="flex-1 flex items-center bg-black/40 rounded-xl px-4 py-3 border border-white/5 focus-within:border-amber-500/50 transition-colors">
      <SearchIcon className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search assets..."
        className="bg-transparent w-full text-white placeholder:text-zinc-500 outline-none text-sm md:text-base"
      />
    </div>
  );
}
