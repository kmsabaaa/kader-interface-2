import { db } from "../../../lib/db";
import { notFound } from "next/navigation";
import { Star, MapPin, Instagram, Linkedin, Globe, Play, Camera, Briefcase, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import ReviewForm from "../../components/ReviewForm";
import HireTalentModal from "./HireTalentModal";

export default async function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { userId } = await auth();
  const creator = await db.user.findUnique({
    where: { id: resolvedParams.id },
    include: {
      listings: { where: { visibility: "PUBLISHED" } },
      services: true,
      reviews: { include: { author: { select: { name: true, profileImage: true } } }, orderBy: { createdAt: "desc" } }
    }
  });

  if (!creator || !creator.isCreator) return notFound();

  const avgRating = creator.reviews.length > 0
    ? (creator.reviews.reduce((sum, r) => sum + r.rating, 0) / creator.reviews.length).toFixed(1)
    : null;

  // Check if current user has already reviewed this creator, and fetch their projects
  let dbUserId: string | null = null;
  let hasReviewed = false;
  let userProjects: { id: string; title: string }[] = [];
  if (userId) {
    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      include: { projects: { where: { status: { not: "ARCHIVED" } }, select: { id: true, title: true } } }
    });
    if (dbUser) {
      dbUserId = dbUser.id;
      userProjects = dbUser.projects;
      const existing = await db.review.findFirst({
        where: { targetUserId: creator.id, authorId: dbUser.id },
      });
      hasReviewed = !!existing;
    }
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white pb-20 selection:bg-amber-500/30">
      {/* AMBIENT GLOW */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[40vw] rounded-full bg-amber-600/5 blur-[150px] pointer-events-none z-0" />
      
      <div className="relative z-10">
        {/* CINEMATIC HERO — full bleed with profile anchored at bottom */}
        <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-[#0d0d0d] to-[#030303]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,_rgba(245,158,11,0.06)_0%,_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_30%,_rgba(59,130,246,0.04)_0%,_transparent_60%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030303]" />

          {/* Bottom-anchored profile info */}
          <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-6">
              {/* Avatar */}
              <div className="w-28 h-28 md:w-40 md:h-40 rounded-3xl border-4 border-amber-500 bg-zinc-900 overflow-hidden shrink-0 shadow-[0_0_40px_rgba(245,158,11,0.3)] relative">
                {creator.profileImage ? (
                  <Image src={creator.profileImage} alt={creator.name || ""} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black text-zinc-700 bg-zinc-800">
                    {creator.name?.[0] || "C"}
                  </div>
                )}
              </div>
              {/* Name + title */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">{creator.name || "Kader Creator"}</h1>
                  <span className="px-3 py-1 bg-amber-500 text-black text-xs font-black rounded-full uppercase tracking-tighter shadow-[0_0_15px_rgba(245,158,11,0.5)]">Verified Pro</span>
                </div>
                <p className="text-xl md:text-2xl text-amber-400 font-medium mb-3">{creator.creatorTitle}</p>
                <div className="flex flex-wrap gap-5 text-zinc-400 text-sm font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-zinc-600" /> {creator.location || "Middle East"}</span>
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {avgRating ? `${avgRating} (${creator.reviews.length})` : "New · No reviews yet"}
                  </span>
                </div>
              </div>
              {/* Social links */}
              <div className="flex gap-2 pb-1 shrink-0">
                {creator.instagram && <a href={creator.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-amber-500 hover:text-black rounded-xl transition-all border border-white/10 hover:border-amber-500"><Instagram className="w-5 h-5" /></a>}
                {creator.linkedin && <a href={creator.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-amber-500 hover:text-black rounded-xl transition-all border border-white/10 hover:border-amber-500"><Linkedin className="w-5 h-5" /></a>}
                {creator.website && <a href={creator.website} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-amber-500 hover:text-black rounded-xl transition-all border border-white/10 hover:border-amber-500"><Globe className="w-5 h-5" /></a>}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-7xl mx-auto px-6 md:px-10 pt-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LEFT: BIO & SHOWREEL */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Play className="w-6 h-6 text-amber-500" /> Directing / Cinematic Reel</h2>
              <div className="aspect-video w-full bg-zinc-900 rounded-3xl border border-white/10 overflow-hidden relative group">
                {creator.showreelUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 group-hover:bg-black/40 transition-colors">
                    <a href={creator.showreelUrl} target="_blank" className="px-8 py-4 bg-amber-500 text-black font-black rounded-2xl flex items-center gap-3 transform group-hover:scale-105 transition-transform">
                       <Play className="w-6 h-6 fill-black" /> Watch Showreel
                    </a>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-600 font-medium italic">Reel private or pending upload.</div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">About the Creator</h2>
              <p className="text-zinc-400 text-lg leading-relaxed whitespace-pre-wrap font-light">{creator.creatorBio}</p>
            </div>

            {/* REVIEWS SECTION */}
            <div>
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-bold">What Directors Say</h2>
                 {userId && dbUserId !== creator.id && !hasReviewed && (
                   <ReviewForm targetUserId={creator.id} label="Leave a Review" />
                 )}
               </div>
               {creator.reviews.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {creator.reviews.map(rev => (
                     <div key={rev.id} className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6">
                       <div className="flex items-center justify-between mb-3">
                         <div className="flex gap-1">
                           {[1,2,3,4,5].map(s => (
                             <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`} />
                           ))}
                         </div>
                         <span className="text-[10px] text-zinc-600">{new Date(rev.createdAt).toLocaleDateString()}</span>
                       </div>
                       {rev.comment && <p className="text-zinc-300 italic mb-4 font-light text-sm">&quot;{rev.comment}&quot;</p>}
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                           {rev.author.name?.[0] || "?"}
                         </div>
                         <span className="text-xs font-bold text-zinc-500">{rev.author.name || "Anonymous Director"}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="py-12 text-center border border-dashed border-white/10 rounded-3xl text-zinc-600 font-bold uppercase tracking-widest">No reviews yet</div>
               )}
            </div>
          </div>

          {/* RIGHT: INVENTORY / GEAR */}
          <div className="space-y-8">
             {userId ? (
               <HireTalentModal
                 creatorId={creator.id}
                 creatorName={creator.name || "this talent"}
                 services={creator.services.map(s => ({ id: s.id, title: s.title, pricePerDay: s.pricePerDay }))}
                 projects={userProjects}
               />
             ) : (
               <Link
                 href="/sign-in"
                 className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(245,158,11,0.2)] active:scale-[0.98] transition-all"
               >
                 <Mail className="w-5 h-5" /> Sign in to Hire
               </Link>
             )}

             <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Camera className="w-5 h-5 text-blue-500" /> Equipment Vault</h3>
                <div className="space-y-4">
                  {creator.listings.length > 0 ? (
                    creator.listings.map(item => (
                      <Link href={`/listing/${item.id}`} key={item.id} className="block group">
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-blue-500/50 transition-all flex items-center gap-4">
                          <div className="w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                            {item.imageUrl && <Image src={item.imageUrl} alt={item.title} width={48} height={48} className="object-cover" />}
                          </div>
                          <div className="grow">
                            <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{item.title}</p>
                            <p className="text-xs text-zinc-500 font-bold">{item.pricePerDay} BHD / day</p>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-zinc-600 italic text-sm">No gear listed yet.</p>
                  )}
                </div>
             </div>

             <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Briefcase className="w-5 h-5 text-emerald-500" /> Professional Services</h3>
                <div className="space-y-4">
                  {creator.services.length > 0 ? (
                    creator.services.map(svc => (
                      <div key={svc.id} className="p-4 border border-white/5 rounded-2xl">
                         <p className="text-sm font-bold text-white mb-1">{svc.title}</p>
                         <p className="text-emerald-500 text-xs font-black">{svc.pricePerDay} BHD / day</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-600 italic text-sm">No standalone services.</p>
                  )}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  </div>
  );
}
