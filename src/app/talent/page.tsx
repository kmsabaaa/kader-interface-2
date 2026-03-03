import { db } from "../../lib/db";
import Link from "next/link";
import { Users, Star, ArrowRight, Play, Sparkles } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function TalentPage() {
  const talents = await db.user.findMany({
    where: {
      isCreator: true
    },
    include: {
      reviews: { select: { rating: true } },
      services: { select: { id: true } },
      listings: { where: { visibility: "PUBLISHED" }, select: { id: true } },
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-[#030303] text-white">

      {/* CINEMATIC HERO */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[40vw] rounded-full bg-blue-600/8 blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-6">
                <Sparkles className="w-3 h-3" /> {talents.length} Verified Professionals
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 leading-none">
                Elite<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-400 to-blue-600">
                  Talent.
                </span>
              </h1>
              <p className="text-zinc-400 text-xl max-w-xl font-light">
                Connect with specialized directors, cinematographers, drone pilots, and editors.
              </p>
            </div>
            <Link href="/search?category=TALENT" className="group flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-3 rounded-xl transition-all">
              Search Talent <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* TALENT GRID */}
          {talents.length === 0 ? (
            <div className="py-32 text-center border border-dashed border-white/10 rounded-3xl">
              <Users className="w-16 h-16 text-zinc-700 mx-auto mb-6" />
              <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-sm">No talent profiles yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {talents.map((talent) => {
                const avgRating = talent.reviews.length > 0
                  ? (talent.reviews.reduce((s, r) => s + r.rating, 0) / talent.reviews.length).toFixed(1)
                  : null;

                return (
                  <Link href={`/creator/${talent.id}`} key={talent.id} className="group">
                    <div className="relative bg-zinc-900/60 border border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                      {/* Profile image or gradient banner */}
                      <div className="h-36 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-zinc-900 to-zinc-900" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(59,130,246,0.15)_0%,_transparent_70%)]" />
                        {/* Floating reel icon */}
                        <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                          <Play className="w-5 h-5 text-blue-400" />
                        </div>
                      </div>

                      {/* Avatar overlapping the banner */}
                      <div className="px-6 pb-6">
                        <div className="flex items-end gap-4 -mt-10 mb-4">
                          <div className="w-20 h-20 rounded-2xl border-4 border-[#0a0a0a] bg-zinc-800 overflow-hidden shrink-0 relative shadow-xl">
                            {talent.profileImage ? (
                              <Image src={talent.profileImage} alt={talent.name || ""} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl font-black text-zinc-600">
                                {talent.name?.[0] || "K"}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {avgRating && (
                                <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                                  <Star className="w-3 h-3 fill-amber-400" /> {avgRating}
                                </div>
                              )}
                              <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                Verified Pro
                              </span>
                            </div>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1 mb-1">
                          {talent.name || "Verified Creator"}
                        </h3>
                        <p className="text-blue-400 text-sm font-medium mb-3">{talent.creatorTitle || "Professional"}</p>
                        <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed mb-5">
                          {talent.creatorBio || "A dedicated professional in the video production industry."}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="flex gap-4 text-xs font-bold text-zinc-600 uppercase tracking-widest">
                            {talent.services.length > 0 && (
                              <span>{talent.services.length} service{talent.services.length !== 1 ? "s" : ""}</span>
                            )}
                            {talent.listings.length > 0 && (
                              <span>{talent.listings.length} listing{talent.listings.length !== 1 ? "s" : ""}</span>
                            )}
                            {talent.reviews.length > 0 && (
                              <span>{talent.reviews.length} review{talent.reviews.length !== 1 ? "s" : ""}</span>
                            )}
                          </div>
                          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-500 text-zinc-400 group-hover:text-white transition-all">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
