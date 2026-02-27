import { db } from "../../lib/db";
import Link from "next/link";
import { Search as SearchIcon, MapPin, Star, Map, Maximize, Zap, Sun } from "lucide-react";

export default async function LocationsPage() {
  // Fetch only listings categorized as "LOCATION", including their Tech Scout data
  const locations = await db.listing.findMany({
    where: { 
      type: "LOCATION",
      isAvailable: true 
    },
    include: {
      locationProfile: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans pt-28 pb-24 cursor-none selection:bg-emerald-500/30">
      
      {/* Cinematic Locations Hero */}
      <div className="max-w-350 mx-auto px-6 mb-16 relative">
        <div className="absolute top-0 right-10 w-[40vw] h-[40vw] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold tracking-wider mb-6">
            <Map className="w-4 h-4" /> Tech-Scouted Spaces
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.1]">
            Shoot in the Middle East's <br/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-200 to-emerald-600">
              Most Exclusive Spaces.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 font-light mb-8 max-w-2xl">
            From raw industrial warehouses to luxury skyscrapers.
          </p>

          {/* Location-Specific Search */}
          <form action="/search" method="GET" className="w-full max-w-2xl bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl cursor-none">
            <div className="flex-1 flex items-center bg-black/40 rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-white/5 focus-within:border-emerald-500/50 transition-colors cursor-none">
              <SearchIcon className="w-4 sm:w-5 h-4 sm:h-5 text-zinc-400 mr-2 sm:mr-3 shrink-0" />
              <input type="text" name="q" placeholder="e.g. Studio, Desert..." className="bg-transparent w-full text-white placeholder:text-zinc-500 outline-none text-xs sm:text-sm md:text-base cursor-none" />
              <input type="hidden" name="category" value="location" />
            </div>
            <div className="hidden sm:flex items-center bg-black/40 rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-white/5 focus-within:border-emerald-500/50 transition-colors cursor-none">
              <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-zinc-400 mr-2 shrink-0" />
              <input type="text" name="location" placeholder="Bahrain" className="bg-transparent w-20 sm:w-24 text-white placeholder:text-zinc-500 outline-none text-xs sm:text-sm md:text-base cursor-none" />
            </div>
            <button type="submit" className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold rounded-xl px-4 sm:px-8 py-2 sm:py-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-none text-sm sm:text-base">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Quick Category Pills */}
      <div className="max-w-350 mx-auto px-6 mb-16 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 w-max">
          {["Sound Stages", "Luxury Villas", "Corporate Offices", "Industrial", "Desert/Nature", "Rooftops", "Restaurants"].map((type) => (
            <button key={type} className="px-6 py-3 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 font-medium hover:bg-white/10 hover:text-white transition-colors cursor-none whitespace-nowrap">
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Locations Grid (Wider Aspect Ratio) */}
      <div className="max-w-350 mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="w-6 h-6 text-emerald-500" /> Scouted Locations
          </h2>
          <span className="text-zinc-500 text-sm">{locations.length} spaces found</span>
        </div>

        {locations.length === 0 ? (
          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 sm:p-16 flex flex-col items-center justify-center text-center border-dashed">
            <MapPin className="w-12 sm:w-16 h-12 sm:h-16 text-zinc-600 mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-white">No locations available</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {locations.map((loc) => {
              const profile = loc.locationProfile;
              
              return (
                <Link href={`/listing/${loc.id}`} key={loc.id} className="group block cursor-none">
                  <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)] h-full flex flex-col">
                    
                    {/* Architectural 16:9 Image Layout */}
                    <div className="h-72 w-full bg-zinc-800 relative overflow-hidden">
                      {loc.imageUrl ? (
                        <img src={loc.imageUrl} alt={loc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600"><MapPin size={48}/></div>
                      )}
                      
                      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent"></div>
                      
                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                        {profile?.typeOfLocation ? (
                          <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/20 text-xs font-bold text-white uppercase tracking-wider">
                            {profile.typeOfLocation}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/20 text-xs font-bold text-white uppercase tracking-wider">
                            LOCATION
                          </span>
                        )}
                        
                        <div className="flex flex-col items-end gap-2">
                          <span className="px-2 py-1 bg-amber-500/20 backdrop-blur-md rounded-md border border-amber-500/30 text-xs font-bold text-amber-400 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400" /> 4.9
                          </span>
                        </div>
                      </div>

                      {/* Bottom Image Info */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold text-white mb-2 truncate">{loc.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-300">
                          {profile?.address && (
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> {profile.address}</span>
                          )}
                          {profile?.sqftArea && (
                            <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5 text-blue-400" /> {profile.sqftArea}</span>
                          )}
                          {profile?.sunDirection && (
                            <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-amber-400" /> {profile.sunDirection}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 grow flex flex-col justify-between">
                      <p className="text-zinc-400 text-sm mb-6 line-clamp-2">
                        {loc.description}
                      </p>
                      
                      <div className="flex justify-between items-center pt-5 border-t border-white/5">
                        <div>
                          <span className="text-white font-bold text-xl">{loc.pricePerDay}</span>
                          <span className="text-zinc-500 text-sm font-normal"> BHD/day</span>
                        </div>
                        <span className="text-emerald-500 font-bold text-sm flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
                          View Scout Report <span className="text-lg leading-none">→</span>
                        </span>
                      </div>
                    </div>

                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}