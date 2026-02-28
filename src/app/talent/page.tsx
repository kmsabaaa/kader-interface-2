import { db } from "../../lib/db";
import Link from "next/link";
import { Users, Star, ArrowRight, Play } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TalentPage() {
  const talents = await db.user.findMany({
    where: {
      isCreator: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-4">Elite Talent.</h1>
            <p className="text-zinc-400 text-lg max-w-xl">Connect with specialized directors, cinematographers, and editors.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {talents.map((talent) => (
            <Link href={`/creator/${talent.id}`} key={talent.id} className="group">
              <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all duration-500">
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                      <Users className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{talent.name || "Verified Creator"}</h3>
                      <p className="text-blue-400 font-medium">{talent.creatorTitle || "Professional"}</p>
                    </div>
                  </div>
                  <p className="text-zinc-400 text-sm mb-8 line-clamp-3 leading-relaxed">
                    {talent.creatorBio || "A dedicated professional in the video production industry with a focus on cinematic excellence."}
                  </p>
                  <div className="flex justify-between items-center pt-6 border-t border-white/5">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-4 h-4 fill-amber-400" /> 5.0
                    </div>
                    <span className="text-zinc-500 text-sm font-bold flex items-center gap-2 group-hover:text-white transition-colors">
                      View Portfolio <ArrowRight className="w-4 h-4" />
                    </span>
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
