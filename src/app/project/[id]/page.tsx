import { db } from "../../../lib/db";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Film, Calendar, CreditCard, Clock, CheckCircle2, ChevronRight, Camera, Briefcase, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { userId } = await auth();
  if (!userId) redirect("/");

  const project = await db.project.findUnique({
    where: { id: resolvedParams.id },
    include: {
      resources: {
        include: { listing: true, service: true }
      }
    }
  });

  if (!project) return notFound();

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
          <Link href="/dashboard" className="hover:text-amber-500 transition-colors">Dashboard</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-zinc-300">{project.title}</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-4">{project.title}</h1>
            <p className="text-zinc-400 text-lg">{project.description || "No description provided."}</p>
          </div>
          <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest block mb-1">Total Budget</span>
            <span className="text-2xl font-bold text-amber-500">{project.budget} BHD</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Film className="w-6 h-6 text-blue-500" /> Attached Resources</h2>
            <div className="space-y-4">
              {project.resources.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl">
                  <p className="text-zinc-600 font-bold uppercase tracking-widest text-sm">No resources added yet</p>
                </div>
              ) : (
                project.resources.map((resource) => {
                   const item = resource.listing || resource.service;
                   if (!item) return null;
                   
                   return (
                    <div key={resource.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-zinc-800 rounded-xl overflow-hidden relative border border-white/10">
                          {resource.listing?.imageUrl ? (
                            <Image src={resource.listing.imageUrl} alt={item.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                               {resource.listing ? <Camera className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{item.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-zinc-500 mt-1 font-medium">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {resource.startDate?.toLocaleDateString() || 'TBD'}</span>
                            <span className="flex items-center gap-1"><CreditCard className="w-4 h-4" /> {resource.totalCost} BHD</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-tighter shadow-sm ${
                        resource.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400" :
                        resource.status === "ESCROW_FUNDED" ? "bg-blue-500/20 text-blue-400" :
                        "bg-amber-500/20 text-amber-400"
                      }`}>
                        {resource.status.replace('_', ' ')}
                      </div>
                    </div>
                   );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
