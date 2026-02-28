import { db } from "../../lib/db";
import Link from "next/link";
import { MapPin, Star, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const listings = await db.listing.findMany({
    where: {
      type: "LOCATION",
      visibility: "PUBLISHED",
      availability: "AVAILABLE"
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-4">Prime Locations.</h1>
            <p className="text-zinc-400 text-lg max-w-xl">From helipads to industrial warehouses, scout your next set here.</p>
          </div>
          <Link href="/search?category=LOCATION" className="group flex items-center gap-2 text-emerald-500 font-bold">
            View All in Marketplace <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((item) => (
            <Link href={`/listing/${item.id}`} key={item.id} className="group">
              <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-emerald-500/30 transition-all duration-500">
                <div className="h-64 bg-zinc-800 relative overflow-hidden">
                  {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-emerald-500 transition-colors">{item.title}</h3>
                  <div className="flex items-center gap-1 text-zinc-500 text-sm mb-6">
                    <MapPin className="w-3 h-3" /> Bahrain
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t border-white/5">
                    <span className="text-white text-xl font-bold">{item.pricePerDay} <span className="text-zinc-500 text-sm font-normal">BHD / day</span></span>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
