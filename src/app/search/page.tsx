import { db } from "../../lib/db";
import Link from "next/link";
import { Users, Search as SearchIcon } from "lucide-react";
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
  const showTalent = !category || category === "TALENT";
  const showListings = !category || category === "EQUIPMENT" || category === "LOCATION";

  const [listings, talents] = await Promise.all([
    showListings
      ? db.listing.findMany({
          where: {
            visibility: "PUBLISHED",
            availability: "AVAILABLE",
            ...(query ? {
              OR: [{ title: { contains: query } }, { description: { contains: query } }]
            } : {}),
            ...(category && (category === "EQUIPMENT" || category === "LOCATION")
              ? { type: category as any }
              : {}),
            pricePerDay: { gte: minPrice, lte: maxPrice },
          },
          orderBy: { createdAt: "desc" }
        })
      : [],
    showTalent && query
      ? db.user.findMany({
          where: {
            isCreator: true,
            OR: [
              { name: { contains: query } },
              { creatorTitle: { contains: query } },
              { creatorBio: { contains: query } },
            ],
          },
          take: 6,
          orderBy: { createdAt: "desc" }
        })
      : [],
  ]);

  if (listings.length === 0 && talents.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
        <SearchIcon className="w-12 h-12 text-zinc-600 mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">No matches found</h3>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {listings.length > 0 && (
        <div>
          {talents.length > 0 && (
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-4">Equipment &amp; Locations</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Link href={`/listing/${listing.id}`} key={listing.id} className="group">
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300">
                  <div className="h-48 bg-zinc-800 relative">
                    {listing.imageUrl && <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{listing.type}</span>
                    <h3 className="text-lg font-bold truncate mt-1">{listing.title}</h3>
                    <p className="text-zinc-500 text-sm mt-1">{listing.pricePerDay} BHD/day</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {talents.length > 0 && (
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-4">Talent</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {talents.map((talent) => (
              <Link href={`/creator/${talent.id}`} key={talent.id} className="group">
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{talent.name || "Verified Creator"}</h3>
                      <p className="text-blue-400 text-xs font-medium">{talent.creatorTitle || "Professional"}</p>
                    </div>
                  </div>
                  <p className="text-zinc-500 text-sm line-clamp-2">{talent.creatorBio || "Video production professional."}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
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
        <div className="w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-2 flex gap-2">
          <SearchInput initialValue={query} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold mb-4">Categories</h3>
            <Link href="/search" className={`block p-2 hover:text-white ${!category ? 'text-amber-500 font-bold' : 'text-zinc-400'}`}>All</Link>
            <Link href="/search?category=EQUIPMENT" className={`block p-2 hover:text-white ${category === 'EQUIPMENT' ? 'text-amber-500 font-bold' : 'text-zinc-400'}`}>Equipment</Link>
            <Link href="/search?category=LOCATION" className={`block p-2 hover:text-white ${category === 'LOCATION' ? 'text-amber-500 font-bold' : 'text-zinc-400'}`}>Locations</Link>
            <Link href="/search?category=TALENT" className={`block p-2 hover:text-white ${category === 'TALENT' ? 'text-amber-500 font-bold' : 'text-zinc-400'}`}>Talent</Link>
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
