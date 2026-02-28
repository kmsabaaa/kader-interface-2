import { db } from "../../lib/db";
import Link from "next/link";
import { Filter, SlidersHorizontal, Camera, MapPin, Star, X, Search as SearchIcon } from "lucide-react";
import SearchInput from "../components/search/SearchInput";
import { Suspense } from "react";

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-80 bg-zinc-900/50 rounded-2xl border border-white/5" />
      ))}
    </div>
  );
}

async function ResultsGrid({ query, category, minPrice, maxPrice }: any) {
  const listings = await db.listing.findMany({
    where: {
      isAvailable: true,
      status: "PUBLISHED", // CRITICAL: Only show live items
      ...(query ? {
        OR: [ { title: { contains: query } }, { description: { contains: query } } ]
      } : {}),
      ...(category && (category === "EQUIPMENT" || category === "LOCATION") ? { type: category as any } : {}),
      pricePerDay: { gte: minPrice, lte: maxPrice },
    },
    orderBy: { createdAt: "desc" }
  });

  if (listings.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
        <SearchIcon className="w-12 h-12 text-zinc-600 mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">No matches found</h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <Link href={`/listing/${listing.id}`} key={listing.id} className="group">
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300">
             <div className="h-48 bg-zinc-800 relative">
               {listing.imageUrl && <img src={listing.imageUrl} className="w-full h-full object-cover" />}
             </div>
             <div className="p-5">
               <h3 className="text-lg font-bold truncate">{listing.title}</h3>
               <p className="text-zinc-500 text-sm mt-1">{listing.pricePerDay} BHD/day</p>
             </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string; category?: string; min?: string; max?: string }> 
}) {
  const resolvedParams = await searchParams;
  const query = (resolvedParams.q || "").trim();
  const category = (resolvedParams.category || "").trim().toUpperCase();
  const minPrice = parseFloat(resolvedParams.min || "0");
  const maxPrice = parseFloat(resolvedParams.max || "1000000");

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-black tracking-tighter">Marketplace</h1>
        </div>
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-2 flex gap-2">
          <SearchInput initialValue={query} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
             <h3 className="font-bold mb-4">Categories</h3>
             <Link href="/search?category=EQUIPMENT" className="block p-2 text-zinc-400 hover:text-white">Equipment</Link>
             <Link href="/search?category=LOCATION" className="block p-2 text-zinc-400 hover:text-white">Locations</Link>
          </div>
        </aside>
        
        <main className="flex-1">
          <Suspense key={query + category} fallback={<SearchSkeleton />}>
            <ResultsGrid query={query} category={category} minPrice={minPrice} maxPrice={maxPrice} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
