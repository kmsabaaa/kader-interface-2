export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { db } from "../../../lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, XCircle, Clock, Package, User as UserIcon, Calendar, ArrowRight, Wallet } from "lucide-react";
import { updateRequestStatus } from "./actions";

export default async function ProviderDashboard() {
  const { userId } = await auth();
  if (!userId) return notFound();

  // 1. Fetch our user record
  const dbUser = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      listings: { select: { id: true, title: true, imageUrl: true, pricePerDay: true } },
      services: { select: { id: true, title: true, pricePerDay: true } }
    }
  });

  if (!dbUser) return notFound();

  // 2. Fetch all INCOMING requests for this user's gear/talent
  const incomingRequests = await db.callSheetItem.findMany({
    where: {
      OR: [
        { listing: { userId: dbUser.id } },
        { service: { userId: dbUser.id } }
      ]
    },
    include: {
      project: {
        include: { user: { select: { id: true, clerkId: true } } }
      },
      listing: { select: { title: true, imageUrl: true, pricePerDay: true } },
      service: { select: { title: true, pricePerDay: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  // Organize by status
  const pending = incomingRequests.filter(r => r.status === "REQUESTED");
  const approved = incomingRequests.filter(r => r.status === "ACCEPTED");

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">Provider Hub</h1>
            <p className="text-zinc-500 font-medium">Manage incoming requests for your Gear, Locations, and Talent.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard" className="px-5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/5 transition-colors cursor-none">
              Mission Control
            </Link>
            <div className="px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-bold text-amber-500">Earnings: -- BHD</span>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT: PENDING REQUESTS (Actionable) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-bold">Awaiting Your Approval ({pending.length})</h2>
            </div>

            {pending.length === 0 ? (
              <div className="bg-zinc-900/40 border border-dashed border-white/10 rounded-3xl p-12 text-center">
                <Package className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 font-medium">No active gear requests. Once someone rents your kit, it'll show up here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map((req) => (
                  <div key={req.id} className="group bg-zinc-900/60 border border-white/10 rounded-3xl p-6 hover:border-amber-500/30 transition-all">
                    <div className="flex flex-col md:flex-row gap-6">
                      
                      {/* Image / Thumbnail */}
                      <div className="w-24 h-24 bg-zinc-800 rounded-2xl overflow-hidden shrink-0 border border-white/5">
                        {req.listing?.imageUrl ? (
                          <Image src={req.listing.imageUrl} alt="Gear" width={96} height={96} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="text-zinc-600" /></div>
                        )}
                      </div>

                      {/* Info & Meta */}
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">{req.listing?.title || req.service?.title}</h3>
                          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Pending Decision</span>
                        </div>
                        <p className="text-sm text-zinc-400 font-medium flex items-center gap-2">
                          <ArrowRight className="w-3 h-3" /> Project: <span className="text-white">{req.project.title}</span>
                        </p>
                        <div className="flex items-center gap-4 text-xs font-bold text-zinc-500">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {req.startDate?.toLocaleDateString()} - {req.endDate?.toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> Creator: ID_{req.project.user.id.slice(-4)}</span>
                        </div>
                      </div>

                      {/* APPROVE / DENY ACTIONS */}
                      <div className="flex md:flex-col gap-2 shrink-0 justify-center">
                        <form action={async () => {
                          "use server";
                          await updateRequestStatus(req.id, "ACCEPTED");
                        }}>
                          <button className="w-full bg-emerald-500 text-black font-black text-xs px-4 py-2 rounded-lg hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 cursor-none">
                            <CheckCircle className="w-4 h-4" /> Approve
                          </button>
                        </form>
                        <form action={async () => {
                          "use server";
                          await updateRequestStatus(req.id, "CANCELLED");
                        }}>
                          <button className="w-full bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-xs px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 cursor-none">
                            <XCircle className="w-4 h-4" /> Deny
                          </button>
                        </form>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: CONFIRMED ORDERS & CALENDAR */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <h2 className="text-2xl font-bold">Upcoming Orders</h2>
            </div>
            
            <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6 space-y-6">
              {approved.length === 0 ? (
                <p className="text-zinc-600 text-sm italic py-4 text-center">No confirmed bookings yet.</p>
              ) : (
                approved.map(req => (
                  <div key={req.id} className="flex items-center gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white line-clamp-1">{req.listing?.title || req.service?.title}</p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase">{req.startDate?.toLocaleDateString()} — {req.endDate?.toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6">
              <h4 className="font-black text-amber-500 text-xs uppercase tracking-widest mb-3">Escrow Reminder</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">Payments are secured in the Kader vault the moment you click "Approve". Funds are released 24 hours after the shoot ends.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
