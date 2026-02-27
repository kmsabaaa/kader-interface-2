import { db } from "../../../lib/db";
import { notFound } from "next/navigation";
import { MapPin, Star, PlayCircle, Users, ChevronRight, ShieldCheck, Briefcase } from "lucide-react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import BookingWidget from "../../listing/[id]/BookingWidget"; // Reusing our smart widget!

export default async function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // 1. Fetch the Human Creator and their specific Services
  const creator = await db.user.findUnique({
    where: { id: resolvedParams.id, isCreator: true },
    include: { services: true }
  });

  if (!creator) return notFound();

  // 2. Fetch the logged-in Producer's active projects for the Booking Widget
  const { userId } = await auth();
  let projects: any[] =[];
  if (userId) {
    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (dbUser) {
      projects = await db.project.findMany({
        where: { userId: dbUser.id, status: "PLANNING" }, 
        orderBy: { createdAt: "desc" }
      });
    }
  }

  // 3. Helper to make YouTube/Vimeo links safely embeddable
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) return url.replace("youtu.be/", "youtube.com/embed/");
    // Use regex to correctly handle optional www. prefix on vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return null;
  };

  const embedUrl = getEmbedUrl(creator.showreelUrl || "");

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans pt-28 pb-24 cursor-none selection:bg-amber-500/30">
      <div className="max-w-300 mx-auto px-6">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium mb-6">
          <Link href="/talent" className="hover:text-amber-500 transition-colors cursor-none">Talent Roster</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-zinc-300">{creator.creatorTitle || "Verified Creator"}</span>
        </div>

        {/* Cinematic Showreel Header */}
        <div className="w-full h-[50vh] md:h-[60vh] bg-zinc-900 rounded-3xl overflow-hidden mb-10 relative border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
          {embedUrl ? (
            <iframe 
              src={`${embedUrl}?autoplay=1&muted=1&loop=1&background=1`} 
              className="w-full h-full object-cover scale-[1.1]" 
              allow="autoplay; fullscreen"
            />
          ) : (
            <img src="https://images.unsplash.com/photo-1603366615917-1fa6dad5c4fa?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-50" />
          )}
          
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"></div>
          
          {embedUrl && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <a href={creator.showreelUrl!} target="_blank" rel="noopener noreferrer" className="w-20 h-20 rounded-full bg-amber-500/80 backdrop-blur-md flex items-center justify-center border border-amber-400 hover:scale-110 transition-transform cursor-none">
                <PlayCircle className="w-10 h-10 text-black ml-1" />
              </a>
            </div>
          )}

          <div className="absolute bottom-8 left-8 right-8">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-2">{creator.creatorTitle}</h1>
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="px-3 py-1 bg-amber-500/20 backdrop-blur-md rounded-md border border-amber-500/30 text-amber-400 flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400" /> 5.0 Rating
              </span>
              <span className="text-zinc-300 flex items-center gap-1"><MapPin className="w-4 h-4" /> Available in Bahrain & GCC</span>
            </div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-12 relative">
          
          {/* LEFT: Bio & Services */}
          <div className="flex-1 space-y-10">
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Users className="w-6 h-6 text-amber-500" /> Professional Biography</h2>
              <p className="text-lg text-zinc-400 font-light leading-relaxed whitespace-pre-wrap">
                {creator.creatorBio || "This creator has not provided a biography yet."}
              </p>
            </div>

            <div className="h-px w-full bg-white/10"></div>

            {/* Render Their Specific Gigs/Services */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Briefcase className="w-6 h-6 text-amber-500" /> Available Services</h2>
              
              {creator.services.length === 0 ? (
                <p className="text-zinc-500 italic">No specific services listed. Contact for custom rates.</p>
              ) : (
                <div className="space-y-4">
                  {creator.services.map((service) => (
                    <div key={service.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-amber-500/30 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                          <p className="text-zinc-400 text-sm">{service.description}</p>
                        </div>
                        <div className="text-left md:text-right shrink-0">
                          <span className="text-2xl font-black text-amber-500 block mb-1">{service.pricePerDay} <span className="text-sm font-medium text-zinc-500">BHD/day</span></span>
                        </div>
                      </div>
                      
                      {/* INJECTING THE LIVE BOOKING WIDGET SPECIFICALLY FOR THIS SERVICE */}
                      <div className="mt-6 pt-6 border-t border-white/5">
                        <BookingWidget 
                          projects={projects} 
                          listingId={service.id} // Re-using listingId logic, but passing the service ID
                          pricePerDay={service.pricePerDay} 
                          userId={userId} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex gap-4 mt-10">
              <ShieldCheck className="w-8 h-8 text-amber-500 shrink-0" />
              <div>
                <h4 className="font-bold text-amber-500 mb-1">Kader Verified Talent</h4>
                <p className="text-zinc-400 text-sm">All identity documents and showreels have been physically verified by the Kader team. Escrow protection applies to all talent bookings.</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Empty sticky spacer (We put the booking widgets directly on the services!) */}
          <div className="w-full lg:w-75 shrink-0 hidden lg:block">
            <div className="sticky top-32 bg-black/50 border border-white/10 rounded-3xl p-6 text-center">
               <ShieldCheck className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
               <h4 className="text-white font-bold mb-2">Secure Booking</h4>
               <p className="text-sm text-zinc-500">Select dates on a specific service above to securely add this creator to your Call Sheet.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}