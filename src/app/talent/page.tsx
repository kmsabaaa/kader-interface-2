import { db } from "../../lib/db";
import Link from "next/link";
import { Search as SearchIcon, MapPin, Star, Award, Video, PlayCircle, Users } from "lucide-react";

export default async function TalentPage() {
  // FETCH HUMANS: Grab all users who have toggled "Become a Creator", including their specific services
  const creators = await db.user.findMany({
    where: { 
      isCreator: true 
    },
    include: {
      services: true // Pulls in their specific rates (e.g. Drone Pilot - 150 BHD)
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans pt-28 pb-24 cursor-none selection:bg-amber-500/30">
      
      {/* Cinematic Talent Hero */}
      <div className="max-w-350 mx-auto px-6 mb-16 relative">
        <div className="absolute top-0 right-10 w-[40vw] h-[40vw] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-bold tracking-wider mb-6">
            <Award className="w-4 h-4" /> Kader Verified Roster
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.1]">
            Hire the Middle East's <br/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-200 to-amber-600">
              Elite Creators.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 font-light mb-8 max-w-2xl">
            From award-winning Directors of Photography to licensed Drone Pilots.
          </p>

          {/* Role-Specific Search */}
          <form action="/search" method="GET" className="w-full max-w-2xl bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl cursor-none">
            <div className="flex-1 flex items-center bg-black/40 rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-white/5 focus-within:border-amber-500/50 transition-colors cursor-none">
              <SearchIcon className="w-4 sm:w-5 h-4 sm:h-5 text-zinc-400 mr-2 sm:mr-3 shrink-0" />
              <input type="text" name="q" placeholder="e.g. Video Editor..." className="bg-transparent w-full text-white placeholder:text-zinc-500 outline-none text-xs sm:text-sm md:text-base cursor-none" />
              <input type="hidden" name="category" value="talent" />
            </div>
            <button type="submit" className="bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl px-4 sm:px-8 py-2 sm:py-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-none text-sm sm:text-base">
              Find
            </button>
          </form>
        </div>
      </div>

      {/* Dynamic Talent Grid */}
      <div className="max-w-350 mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" /> Available Creators
          </h2>
          <span className="text-zinc-500 text-sm">{creators.length} profiles found</span>
        </div>

        {creators.length === 0 ? (
          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 sm:p-16 flex flex-col items-center justify-center text-center border-dashed">
            <Award className="w-12 sm:w-16 h-12 sm:h-16 text-zinc-600 mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-white">No talent available</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creators.map((creator) => {
              // Calculate their starting rate based on their listed services
              const startingRate = creator.services.length > 0 
                ? Math.min(...creator.services.map(s => s.pricePerDay))
                : 0;

              return (
                <Link href={`/creator/${creator.id}`} key={creator.id} className="group block cursor-none">
                  <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(245,158,11,0.1)] h-full flex flex-col">
                    
                    {/* Human-Centric Image Layout */}
                    <div className="h-64 w-full bg-zinc-800 relative overflow-hidden">
                      {/* For now we use a cinematic placeholder until Uploadthing is active */}
                      <img src="https://images.unsplash.com/photo-1603366615917-1fa6dad5c4fa?q=80&w=2070&auto=format&fit=crop" alt={creator.creatorTitle || "Creator"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60" />
                      
                      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent"></div>
                      
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20">
                          <PlayCircle className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1 truncate">{creator.creatorTitle || "Verified Creator"}</h3>
                        <div className="flex items-center gap-3 text-xs font-medium">
                          <span className="flex items-center gap-1 text-amber-400"><Star className="w-3 h-3 fill-amber-400" /> 5.0</span>
                          <span className="text-zinc-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> Bahrain</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5 grow flex flex-col justify-between">
                      <p className="text-zinc-400 text-sm mb-5 line-clamp-3">
                        {creator.creatorBio || "No biography provided."}
                      </p>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <div>
                          <span className="text-zinc-500 text-xs block mb-0.5">Starts at</span>
                          <span className="text-white font-bold text-lg">{startingRate}</span>
                          <span className="text-zinc-500 text-sm font-normal"> BHD/day</span>
                        </div>
                        <span className="text-amber-500 font-bold text-sm flex items-center gap-1 group-hover:text-amber-400 transition-colors">
                          View Roster <span className="text-lg leading-none">→</span>
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