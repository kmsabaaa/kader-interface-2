import { db } from "../../lib/db";
import Link from "next/link";
import { Filter, SlidersHorizontal, Camera, MapPin, Star, X, Search as SearchIcon } from "lucide-react";
import SearchInput from "../components/search/SearchInput";

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

  const listings = await db.listing.findMany({
    where: {
      isAvailable: true,
      ...(query ? {
        OR: [ { title: { contains: query } }, { description: { contains: query } } ]
      } : {}),
      ...(category && (category === "EQUIPMENT" || category === "LOCATION") ? { type: category as any } : {}),
      pricePerDay: { gte: minPrice, lte: maxPrice },
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-amber-200 to-amber-600">
            Marketplace
          </h1>
          {(query || category) && (
            <Link href="/search" className="text-xs font-bold text-zinc-500 hover:text-white flex items-center gap-1 transition-colors uppercase tracking-widest">
              <X className="w-3 h-3" /> Clear All Filters
            </Link>
          )}
        </div>
        
        {/* STANDALONE SEARCH BAR (NO FORM, NO REDIRECTS) */}
        <div className="w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-2 flex gap-2">
          <SearchInput initialValue={query} />
          <div className="hidden md:flex items-center px-8 bg-amber-500 text-black rounded-xl text-sm font-bold">
            Search
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 shrink-0 space-y-8">
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Filter className="w-5 h-5 text-amber-500" /> Categories</h3>
            <div className="space-y-2">
              <Link href={`/search?category=EQUIPMENT${query ? `&q=${query}` : ""}`} className={`w-full flex items-center justify-between p-3 rounded-xl ${category === "EQUIPMENT" ? "bg-amber-500/10 text-amber-400" : "hover:bg-white/5 text-zinc-400"}`}>
                <span className="flex items-center gap-2"><Camera className="w-4 h-4" /> Equipment</span>
              </Link>
              <Link href={`/search?category=LOCATION${query ? `&q=${query}` : ""}`} className={`w-full flex items-center justify-between p-3 rounded-xl ${category === "LOCATION" ? "bg-emerald-500/10 text-emerald-400" : "hover:bg-white/5 text-zinc-400"}`}>
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Locations</span>
              </Link>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-zinc-400 text-sm">Found <span className="text-white font-bold">{listings.length}</span> results</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Link href={`/listing/${listing.id}`} key={listing.id} className="group border border-white/5 bg-zinc-900/50 rounded-2xl overflow-hidden p-4">
                {listing.title}
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
