import { db } from "../../lib/db";
import Link from "next/link";
import { Users, Search as SearchIcon, Camera, MapPin, Star, ArrowRight, Sparkles, Filter } from "lucide-react";
import SearchInput from "../components/search/SearchInput";
import { Suspense } from "react";
import Image from "next/image";

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-80 bg-zinc-900/50 rounded-3xl border border-white/5" />
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
      <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl bg-zinc-900/20 flex flex-col items-center">
        <SearchIcon className="w-14 h-14 text-zinc-700 mb-5" />
        <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
        <p className="text-zinc-500 text-sm">Try adjusting your search or browsing a category</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {listings.length > 0 && (
        <div>
          {talents.length > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <Camera className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Equipment &amp; Locations</h2>
              <span className="px-2 py-0.5 bg-white/5 rounded-full text-[10px] text-zinc-600 font-bold">{listings.length}</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {listings.map((listing) => (
              <Link href={`/listing/${listing.id}`} key={listing.id} className="group">
                <div className="relative bg-zinc-900/60 border border-white/5 rounded-3xl overflow-hidden hover:border-amber-500/40 transition-all duration-400 hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
                  <div className="h-48 bg-zinc-800 relative overflow-hidden">
                    {listing.imageUrl ? (
                      <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        {listing.type === "LOCATION" ? <MapPin className="w-10 h-10" /> : <Camera className="w-10 h-10" />}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${
                        listing.type === "LOCATION"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      }`}>
                        {listing.type}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-xs font-black text-white">
                      {listing.pricePerDay} BHD/day
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors truncate mb-1">{listing.title}</h3>
                    <p className="text-zinc-500 text-xs line-clamp-1">{listing.description || "Available for rental."}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" /> 4.9
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {talents.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Talent</h2>
            <span className="px-2 py-0.5 bg-white/5 rounded-full text-[10px] text-zinc-600 font-bold">{talents.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {talents.map((talent) => (
              <Link href={`/creator/${talent.id}`} key={talent.id} className="group">
                <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-6 hover:border-blue-500/40 transition-all duration-400 hover:-translate-y-0.5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center overflow-hidden shrink-0">
                      {talent.profileImage ? (
                        <Image src={talent.profileImage} alt={talent.name || ""} width={56} height={56} className="object-cover w-full h-full" />
                      ) : (
                        <Users className="w-6 h-6 text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors truncate">{talent.name || "Verified Creator"}</h3>
                      <p className="text-blue-400 text-xs font-medium truncate">{talent.creatorTitle || "Professional"}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest shrink-0">Pro</span>
                  </div>
                  <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed">{talent.creatorBio || "Video production professional."}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" /> 5.0
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
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

  const CATEGORIES = [
    { label: "All", value: "", color: "amber" },
    { label: "Equipment", value: "EQUIPMENT", color: "amber" },
    { label: "Locations", value: "LOCATION", color: "emerald" },
    { label: "Talent", value: "TALENT", color: "blue" },
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-28 pb-20">
      {/* SEARCH HERO */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-bold tracking-widest uppercase mb-4">
            <Sparkles className="w-3 h-3 text-amber-400" /> Kader Marketplace
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">Find Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">Production Pieces.</span>
          </h1>
        </div>

        {/* SEARCH BAR */}
        <div className="w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-2 flex gap-2 hover:border-amber-500/30 transition-colors shadow-2xl shadow-black/50">
          <SearchInput initialValue={query} />
        </div>

        {/* CATEGORY PILLS */}
        <div className="flex gap-3 mt-6 flex-wrap">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={cat.value ? `/search?category=${cat.value}${query ? `&q=${query}` : ""}` : `/search${query ? `?q=${query}` : ""}`}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                category === cat.value
                  ? cat.color === "emerald"
                    ? "bg-emerald-500 text-black border-emerald-500"
                    : cat.color === "blue"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-amber-500 text-black border-amber-500"
                  : "bg-white/5 text-zinc-400 border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <Suspense key={query + category} fallback={<SearchSkeleton />}>
          <ResultsGrid query={query} category={category} minPrice={minPrice} maxPrice={maxPrice} />
        </Suspense>
      </div>
    </div>
  );
}
