import { db } from "../../lib/db";
import Link from "next/link";
import { Search as SearchIcon, Filter, SlidersHorizontal, Camera, MapPin, Users, Star, X } from "lucide-react";

export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string; category?: string; min?: string; max?: string }> 
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const category = resolvedParams.category?.toUpperCase() || "";
  const minPrice = parseFloat(resolvedParams.min || "0");
  const maxPrice = parseFloat(resolvedParams.max || "1000000");

  // 1. DYNAMIC DATABASE QUERY: Physically filter the Hostinger MySQL data
  const listings = await db.listing.findMany({
    where: {
      isAvailable: true,
      // Filter by Title or Description if a search query exists
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
      ],
      // Filter by Category (EQUIPMENT or LOCATION)
      ...(category ? { type: category } : {}),
      // Filter by Price Range
      pricePerDay: {
        gte: minPrice,
        lte: maxPrice,
      },
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans pt-28 pb-12 selection:bg-amber-500/30">
      
      {/* Search Header */}
      <div className="max-w-350 mx-auto px-6 mb-8">
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
        
        {/* Functional Search Bar */}
        <form action="/search" method="GET" className="w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl">
          <div className="flex-1 flex items-center bg-black/40 rounded-xl px-4 py-3 border border-white/5 focus-within:border-amber-500/50 transition-colors">
            <SearchIcon className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
            <input 
              type="text" 
              name="q" 
              defaultValue={query}
              placeholder="Search assets..." 
              className="bg-transparent w-full text-white placeholder:text-zinc-500 outline-none text-sm md:text-base" 
            />
          </div>
          <button type="submit" className="bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl px-8 py-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
            Update Results
          </button>
        </form>
      </div>

      <div className="max-w-350 mx-auto px-6 flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR: Category Routing */}
        <aside className="w-full lg:w-72 shrink-0 space-y-8">
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Filter className="w-5 h-5 text-amber-500" /> Categories</h3>
            <div className="space-y-2">
              <Link 
                href={`/search?category=equipment${query ? `&q=${query}` : ""}`}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${category === "EQUIPMENT" ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" : "hover:bg-white/5 text-zinc-400"}`}
              >
                <span className="flex items-center gap-2"><Camera className="w-4 h-4" /> Equipment</span>
              </Link>
              <Link 
                href={`/search?category=location${query ? `&q=${query}` : ""}`}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${category === "LOCATION" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "hover:bg-white/5 text-zinc-400"}`}
              >
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Locations</span>
              </Link>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-amber-500" /> Price Filter</h3>
            <form action="/search" method="GET" className="space-y-4">
              {query && <input type="hidden" name="q" value={query} />}
              {category && <input type="hidden" name="category" value={category} />}
              <div className="flex items-center gap-2">
                <input name="min" type="number" placeholder="Min" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50" />
                <input name="max" type="number" placeholder="Max" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50" />
              </div>
              <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg border border-white/5 transition-all">Apply Range</button>
            </form>
          </div>
        </aside>

        {/* DYNAMIC GRID */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-zinc-400 text-sm">Found <span className="text-white font-bold">{listings.length}</span> results for <span className="text-amber-500 italic">"{query || "All Assets"}"</span></p>
          </div>

          {listings.length === 0 ? (
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-16 flex flex-col items-center justify-center text-center border-dashed">
              <SearchIcon className="w-12 h-12 text-zinc-600 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No matches found</h3>
              <p className="text-zinc-400 max-w-md">Try adjusting your filters or searching for something else.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Link href={`/listing/${listing.id}`} key={listing.id} className="group">
                  <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1">
                    <div className="h-56 w-full bg-zinc-800 relative overflow-hidden">
                      {listing.imageUrl && <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                      <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 text-xs font-bold text-white uppercase tracking-wider">{listing.type}</div>
                      <div className="absolute top-3 right-3 px-2 py-1 bg-amber-500/20 backdrop-blur-md rounded-md border border-amber-500/30 text-xs font-bold text-amber-400 flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400" /> 4.9</div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{listing.title}</h3>
                      <p className="text-zinc-400 text-sm mb-5 line-clamp-2 min-h-10">{listing.description}</p>
                      <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <span className="text-white text-lg font-bold">{listing.pricePerDay} <span className="text-zinc-500 text-sm font-normal">BHD / day</span></span>
                        <button className="bg-white/10 hover:bg-amber-500 hover:text-black text-white font-bold rounded-lg px-4 py-2 transition-colors text-sm">View details</button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}