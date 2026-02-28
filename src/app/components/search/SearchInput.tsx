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
      
      // Update query or delete if empty
      if (value.trim()) {
        params.set('q', value.trim());
      } else {
        params.delete('q');
      }

      // Cleanup: Strip ALL empty parameters from the URL (including ghost 'location' or 'category')
      const keysToDelete: string[] = [];
      params.forEach((val, key) => {
        if (!val || val.trim() === '' || val === 'undefined') {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => params.delete(key));

      const queryString = params.toString();
      const finalPath = queryString ? `/search?${queryString}` : '/search';
      router.replace(finalPath, { scroll: false });
    }, 400);

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
