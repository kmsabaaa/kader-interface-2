import { db } from "../../../lib/db";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Film, Calendar, CreditCard, Clock, CheckCircle2, ChevronRight, Camera, Briefcase, ArrowLeft, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import RemoveResourceButton from "./RemoveResourceButton";

const STATUS_CONFIG: Record<string, { label: string; color: string; glow: string }> = {
  REQUESTED:            { label: "Awaiting Approval", color: "bg-amber-500/20 text-amber-400 border-amber-500/30",   glow: "shadow-amber-500/10" },
  ACCEPTED:             { label: "Approved",          color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", glow: "shadow-emerald-500/10" },
  ESCROW_FUNDED:        { label: "Funded",            color: "bg-blue-500/20 text-blue-400 border-blue-500/30",       glow: "shadow-blue-500/10" },
  HANDOVER_CONFIRMED:   { label: "Handed Over",       color: "bg-purple-500/20 text-purple-400 border-purple-500/30", glow: "shadow-purple-500/10" },
  RETURNED_BY_CONSUMER: { label: "Returned",          color: "bg-sky-500/20 text-sky-400 border-sky-500/30",          glow: "shadow-sky-500/10" },
  CONDITION_VERIFIED:   { label: "Verified",          color: "bg-teal-500/20 text-teal-400 border-teal-500/30",       glow: "shadow-teal-500/10" },
  COMPLETED:            { label: "Completed",         color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", glow: "shadow-emerald-500/10" },
  CANCELLED:            { label: "Cancelled",         color: "bg-red-500/20 text-red-400 border-red-500/30",           glow: "shadow-red-500/10" },
  DISPUTED:             { label: "Disputed",          color: "bg-orange-500/20 text-orange-400 border-orange-500/30", glow: "shadow-orange-500/10" },
};

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { userId } = await auth();
  if (!userId) redirect("/");

  const project = await db.project.findUnique({
    where: { id: resolvedParams.id },
    include: {
      user: { select: { clerkId: true } },
      resources: {
        include: { listing: true, service: true },
        orderBy: { createdAt: "desc" },
      }
    }
  });

  if (!project) return notFound();

  const isOwner = project.user.clerkId === userId;

  const totalSpent = project.resources
    .filter(r => r.status !== "CANCELLED")
    .reduce((sum, r) => sum + r.totalCost, 0);

  const activeResources = project.resources.filter(r => r.status !== "CANCELLED");
  const pendingCount = project.resources.filter(r => r.status === "REQUESTED").length;
  const confirmedCount = project.resources.filter(r => ["ACCEPTED", "ESCROW_FUNDED", "COMPLETED"].includes(r.status)).length;

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* AMBIENT GLOW */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[30vw] rounded-full bg-blue-600/5 blur-[150px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-10">
          <Link href="/dashboard?tab=projects" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <ChevronRight className="w-4 h-4 text-zinc-700" />
          <span className="text-zinc-300 font-medium">{project.title}</span>
        </div>

        {/* HERO HEADER */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-5">
                <Film className="w-3 h-3" /> {project.status}
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 leading-none">{project.title}</h1>
              {project.description && (
                <p className="text-zinc-400 text-lg max-w-2xl font-light">{project.description}</p>
              )}
            </div>

            {/* STATS ROW */}
            <div className="flex flex-wrap gap-4 shrink-0">
              <div className="bg-zinc-900/60 border border-white/5 rounded-2xl px-6 py-4 text-center min-w-[100px]">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Budget</p>
                <p className="text-2xl font-black text-amber-400">{project.budget.toFixed(0)}</p>
                <p className="text-[10px] text-zinc-600 font-bold uppercase">BHD</p>
              </div>
              <div className="bg-zinc-900/60 border border-white/5 rounded-2xl px-6 py-4 text-center min-w-[100px]">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Spent</p>
                <p className="text-2xl font-black text-white">{totalSpent.toFixed(0)}</p>
                <p className="text-[10px] text-zinc-600 font-bold uppercase">BHD</p>
              </div>
              <div className="bg-zinc-900/60 border border-white/5 rounded-2xl px-6 py-4 text-center min-w-[100px]">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Resources</p>
                <p className="text-2xl font-black text-white">{activeResources.length}</p>
                <p className="text-[10px] text-zinc-600 font-bold uppercase">Items</p>
              </div>
            </div>
          </div>

          {/* Budget progress bar */}
          {project.budget > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                <span>Budget Utilization</span>
                <span className={totalSpent > project.budget ? "text-red-400" : "text-emerald-400"}>
                  {((totalSpent / project.budget) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${totalSpent > project.budget ? "bg-red-500" : "bg-gradient-to-r from-amber-500 to-amber-400"}`}
                  style={{ width: `${Math.min((totalSpent / project.budget) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* QUICK STATUS STRIP */}
        {(pendingCount > 0 || confirmedCount > 0) && (
          <div className="flex gap-4 mb-10 flex-wrap">
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-bold">
                <Clock className="w-3.5 h-3.5" />
                {pendingCount} pending approval
              </div>
            )}
            {confirmedCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {confirmedCount} confirmed
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Kader Escrow Protected
            </div>
          </div>
        )}

        {/* RESOURCE LIST */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-2xl font-bold">Call Sheet</h2>
            <span className="px-2.5 py-0.5 bg-white/5 rounded-full text-xs text-zinc-500 font-bold border border-white/5">
              {project.resources.length} items
            </span>
          </div>

          {project.resources.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl bg-zinc-900/20">
              <Film className="w-14 h-14 text-zinc-700 mx-auto mb-5" />
              <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-sm mb-4">No resources booked yet</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/equipment" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-bold text-sm transition-colors">
                  Browse Equipment →
                </Link>
                <Link href="/locations" className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 font-bold text-sm transition-colors">
                  Scout Locations →
                </Link>
                <Link href="/talent" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold text-sm transition-colors">
                  Hire Talent →
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {project.resources.map((resource) => {
                const item = resource.listing || resource.service;
                if (!item) return null;
                const isListing = !!resource.listing;
                const cfg = STATUS_CONFIG[resource.status] || STATUS_CONFIG["REQUESTED"];
                const canRemove = isOwner && !["COMPLETED", "ESCROW_FUNDED"].includes(resource.status);

                return (
                  <div
                    key={resource.id}
                    className={`group bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all duration-300 ${resource.status === "CANCELLED" ? "opacity-50" : ""}`}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6">
                      {/* Thumbnail */}
                      <div className="w-20 h-20 bg-zinc-800 rounded-2xl overflow-hidden relative border border-white/10 shrink-0">
                        {resource.listing?.imageUrl ? (
                          <Image src={resource.listing.imageUrl} alt={item.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            {isListing ? <Camera className="w-8 h-8" /> : <Briefcase className="w-8 h-8" />}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                              {resource.startDate && resource.endDate && (
                                <span className="flex items-center gap-1.5 font-medium">
                                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                  {new Date(resource.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                  {" — "}
                                  {new Date(resource.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                              )}
                              {resource.totalCost > 0 && (
                                <span className="flex items-center gap-1.5 font-medium">
                                  <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-emerald-400 font-bold">{resource.totalCost.toFixed(2)} BHD</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter border ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            {canRemove && <RemoveResourceButton itemId={resource.id} />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA Row */}
        <div className="mt-12 pt-10 border-t border-white/5 flex flex-wrap gap-4">
          <Link href="/equipment" className="px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 font-bold text-sm hover:bg-amber-500/20 transition-colors">
            + Book Equipment
          </Link>
          <Link href="/locations" className="px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 font-bold text-sm hover:bg-emerald-500/20 transition-colors">
            + Scout Location
          </Link>
          <Link href="/talent" className="px-5 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 font-bold text-sm hover:bg-blue-500/20 transition-colors">
            + Hire Talent
          </Link>
        </div>
      </div>
    </div>
  );
}
