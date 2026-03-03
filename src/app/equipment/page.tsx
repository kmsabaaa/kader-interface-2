import { db } from "../../lib/db";
import Link from "next/link";
import { Camera, Star, ArrowRight, Zap, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EquipmentPage() {
  const listings = await db.listing.findMany({
    where: {
      type: "EQUIPMENT",
      visibility: "PUBLISHED",
      availability: "AVAILABLE"
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-[#030303] text-white">

      {/* CINEMATIC HERO */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute -top-[20%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-amber-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-[30%] right-0 w-[30vw] h-[30vw] rounded-full bg-blue-600/8 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-widest uppercase mb-6">
                <Zap className="w-3 h-3" /> {listings.length} Verified Assets
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 leading-none">
                Cinema<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
                  Gear.
                </span>
              </h1>
              <p className="text-zinc-400 text-xl max-w-xl font-light">
                Professional equipment rentals from verified providers across the region.
              </p>
            </div>
            <div className="flex flex-col gap-4 items-start md:items-end">
              <Link href="/search?category=EQUIPMENT" className="group flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-xl transition-all">
                Full Marketplace <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <div className="flex gap-3 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> All Verified</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Insured</span>
              </div>
            </div>
          </div>

          {/* GRID */}
          {listings.length === 0 ? (
            <div className="py-32 text-center border border-dashed border-white/10 rounded-3xl">
              <Camera className="w-16 h-16 text-zinc-700 mx-auto mb-6" />
              <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-sm">No equipment listed yet</p>
              <Link href="/dashboard" className="mt-6 inline-block text-amber-500 hover:text-amber-400 font-bold text-sm transition-colors">
                List your gear →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => (
                <Link href={`/listing/${item.id}`} key={item.id} className="group">
                  <div className="relative bg-zinc-900/60 border border-white/5 rounded-3xl overflow-hidden hover:border-amber-500/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                    {/* Image */}
                    <div className="h-56 bg-zinc-800 relative overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700">
                          <Camera className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      {/* Price Badge */}
                      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-sm font-black text-amber-400">
                        {item.pricePerDay} BHD/day
                      </div>
                      {/* Rating */}
                      <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-xs font-bold text-zinc-300">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-amber-400 transition-colors line-clamp-1">{item.title}</h3>
                      <p className="text-zinc-500 text-sm mb-5 line-clamp-2 leading-relaxed">{item.description || "Professional cinema-grade equipment available for rental."}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                          <Camera className="w-3.5 h-3.5 text-amber-500" /> Equipment
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 group-hover:text-black text-zinc-400 transition-all">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
