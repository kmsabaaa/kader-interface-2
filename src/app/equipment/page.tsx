import { db } from "../../lib/db";
import Link from "next/link";
import { Search as SearchIcon, Camera, Star, SlidersHorizontal, Zap, Video } from "lucide-react";

export default async function EquipmentPage() {
  // Fetch only listings categorized as "EQUIPMENT" from Hostinger MySQL
  const equipment = await db.listing.findMany({
    where: { 
      type: "EQUIPMENT",
      isAvailable: true 
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans pt-28 pb-24 cursor-none selection:bg-blue-500/30">
      
      {/* Cinematic Hardware Hero */}
      <div className="max-w-350 mx-auto px-6 mb-16 relative">
        <div className="absolute top-0 right-10 w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-sm font-bold tracking-wider mb-6">
            <Camera className="w-4 h-4" /> Cinema Grade Gear
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.1]">
            The Industry Standard. <br/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-300 to-blue-600">
              Ready to Roll.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 font-light mb-8 max-w-2xl">
            Rent high-end camera bodies, premium cine-lenses, and heavy-duty lighting packages.
          </p>

          {/* Equipment-Specific Search */}
          <form action="/search" method="GET" className="w-full max-w-2xl bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl cursor-none">
            <div className="flex-1 flex items-center bg-black/40 rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-white/5 focus-within:border-blue-500/50 transition-colors cursor-none">
              <SearchIcon className="w-4 sm:w-5 h-4 sm:h-5 text-zinc-400 mr-2 sm:mr-3 shrink-0" />
              <input type="text" name="q" placeholder="e.g. RED Komodo, Aputure 600d..." className="bg-transparent w-full text-white placeholder:text-zinc-500 outline-none text-xs sm:text-sm md:text-base cursor-none" />
              <input type="hidden" name="category" value="equipment" />
            </div>
            <button type="submit" className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold rounded-xl px-4 sm:px-8 py-2 sm:py-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-none text-sm sm:text-base">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Hardware Categories */}
      <div className="max-w-350 mx-auto px-6 mb-16 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 w-max">
          {["Camera Bodies", "Cine Lenses", "Lighting", "Grip & Support", "Audio", "Drones", "Monitors & Video Village"].map((cat) => (
            <button key={cat} className="px-6 py-3 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 font-medium hover:bg-white/10 hover:text-white transition-colors cursor-none whitespace-nowrap">
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Hardware Grid */}
      <div className="max-w-350 mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-blue-500" /> Available Inventory
          </h2>
          <span className="text-zinc-500 text-sm">{equipment.length} items found</span>
        </div>

        {equipment.length === 0 ? (
          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 sm:p-16 flex flex-col items-center justify-center text-center border-dashed">
            <Camera className="w-12 sm:w-16 h-12 sm:h-16 text-zinc-600 mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-white">No equipment available</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {equipment.map((item) => (
              <Link href={`/listing/${item.id}`} key={item.id} className="group block cursor-none">
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(59,130,246,0.1)] h-full flex flex-col">
                  
                  {/* Square Hardware Image Layout */}
                  <div className="h-56 w-full bg-zinc-800 relative overflow-hidden flex items-center justify-center p-4">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 rounded-lg" />
                    ) : (
                      <Camera size={48} className="text-zinc-600"/>
                    )}
                    
                    <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/20 text-xs font-bold text-white flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 5.0
                    </div>
                  </div>
                  
                  <div className="p-5 grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 truncate">{item.title}</h3>
                      <p className="text-zinc-400 text-sm mb-5 line-clamp-2 min-h-10">
                        {item.description}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <div>
                        <span className="text-white font-bold text-xl">{item.pricePerDay}</span>
                        <span className="text-zinc-500 text-sm font-normal"> BHD/day</span>
                      </div>
                      <span className="text-blue-500 font-bold text-sm flex items-center gap-1 group-hover:text-blue-400 transition-colors">
                        Specs <span className="text-lg leading-none">→</span>
                      </span>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}