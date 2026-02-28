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
      // Don't trigger if the value hasn't changed from what's already in the URL
      if (value === initialValue) return;

      const params = new URLSearchParams(searchParams.toString());
      
      // 1. Update the 'q' parameter
      if (value.trim()) {
        params.set('q', value.trim());
      } else {
        params.delete('q');
      }

      // 2. PRESERVE CONTEXT: We don't touch 'category', 'min', or 'max' 
      // they stay in the URL if they were already there.

      const queryString = params.toString();
      router.replace(queryString ? `/search?${queryString}` : '/search', { scroll: false });
    }, 400); // Slightly longer debounce for better multi-param stability

    return () => clearTimeout(timer);
  }, [value, router, searchParams, initialValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set('q', value.trim());
      } else {
        params.delete('q');
      }
      router.replace(`/search?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <div className="flex-1 flex items-center bg-black/40 rounded-xl px-4 py-3 border border-white/5 focus-within:border-amber-500/50 transition-colors">
      <SearchIcon className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search assets..."
        className="bg-transparent w-full text-white placeholder:text-zinc-500 outline-none text-sm md:text-base"
      />
    </div>
  );
}
