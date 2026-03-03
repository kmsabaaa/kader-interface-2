import { db } from "../../lib/db";
import Link from "next/link";
import { MapPin, Star, ArrowRight, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const listings = await db.listing.findMany({
    where: {
      type: "LOCATION",
      visibility: "PUBLISHED",
      availability: "AVAILABLE"
    },
    include: { locationProfile: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-[#030303] text-white">

      {/* CINEMATIC HERO */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute -top-[20%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-emerald-600/8 blur-[120px] pointer-events-none" />
        <div className="absolute top-[40%] left-0 w-[30vw] h-[30vw] rounded-full bg-blue-600/6 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-6">
                <MapPin className="w-3 h-3" /> {listings.length} Exclusive Sets
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 leading-none">
                Prime<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-600">
                  Locations.
                </span>
              </h1>
              <p className="text-zinc-400 text-xl max-w-xl font-light">
                From rooftop helipads to industrial warehouses — scout your next cinematic set.
              </p>
            </div>
            <div className="flex flex-col gap-4 items-start md:items-end">
              <Link href="/search?category=LOCATION" className="group flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-3 rounded-xl transition-all">
                Full Marketplace <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <div className="flex gap-3 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Permit Ready</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Bahrain</span>
              </div>
            </div>
          </div>

          {/* GRID */}
          {listings.length === 0 ? (
            <div className="py-32 text-center border border-dashed border-white/10 rounded-3xl">
              <MapPin className="w-16 h-16 text-zinc-700 mx-auto mb-6" />
              <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-sm">No locations listed yet</p>
              <Link href="/dashboard" className="mt-6 inline-block text-emerald-500 hover:text-emerald-400 font-bold text-sm transition-colors">
                List your location →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => (
                <Link href={`/listing/${item.id}`} key={item.id} className="group">
                  <div className="relative bg-zinc-900/60 border border-white/5 rounded-3xl overflow-hidden hover:border-emerald-500/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                    {/* Image */}
                    <div className="h-64 bg-zinc-800 relative overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700">
                          <MapPin className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      {/* Price badge */}
                      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-sm font-black text-emerald-400">
                        {item.pricePerDay} BHD/day
                      </div>
                      {/* Location type badge */}
                      {item.locationProfile?.typeOfLocation && (
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-xs font-bold text-zinc-300 capitalize">
                          {item.locationProfile.typeOfLocation}
                        </div>
                      )}
                      {/* Title overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{item.title}</h3>
                        <div className="flex items-center gap-1.5 text-zinc-400 text-sm mt-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                          {item.locationProfile?.address || "Bahrain"}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 flex items-center justify-between border-t border-white/5">
                      <div className="flex items-center gap-3 text-xs font-bold text-zinc-500">
                        {item.locationProfile?.sqftArea && (
                          <span className="uppercase tracking-wider">{item.locationProfile.sqftArea} sqft</span>
                        )}
                        {item.locationProfile?.permitStatus && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                            item.locationProfile.permitStatus.toLowerCase().includes("approved")
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}>
                            {item.locationProfile.permitStatus}
                          </span>
                        )}
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-black text-zinc-400 transition-all">
                        <ArrowRight className="w-4 h-4" />
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
