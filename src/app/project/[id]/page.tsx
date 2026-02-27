import { db } from "../../../lib/db";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Film, Wallet, Clock, CheckCircle, XCircle, Users } from "lucide-react";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { userId } = await auth();
  if (!userId) redirect("/");

  const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/");

  // Fetch the Project AND all of its requested Gear/Locations AND Services
  const project = await db.project.findUnique({
    where: { id: resolvedParams.id },
    include: {
      resources: {
        include: {
          listing: true, // If it's a camera/location
          service: true  // If it's a human talent
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!project || project.userId !== dbUser.id) return notFound();

  // TYPESCRIPT FIX: Safely calculate math checking both listings and services
  const totalSpent = project.resources
    .filter((req) => req.status === "APPROVED")
    .reduce((sum, req) => {
      // It's either a listing price OR a service price OR 0
      const price = req.listing?.pricePerDay || req.service?.pricePerDay || 0;
      // Multiply by actual rental days, defaulting to 1
      let days = 1;
      if (req.startDate && req.endDate) {
        const diff = new Date(req.endDate).getTime() - new Date(req.startDate).getTime();
        const computed = Math.ceil(diff / (1000 * 3600 * 24));
        if (computed > 0) days = computed;
      }
      return sum + price * days;
    }, 0);

  const budgetRemaining = project.budget - totalSpent;

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans pt-28 pb-24 cursor-none selection:bg-amber-500/30">
      <div className="max-w-300 mx-auto px-6">
        
        {/* Navigation & Header */}
        <div className="mb-10">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-amber-500 transition-colors mb-6 cursor-none font-medium text-sm">
            <ChevronLeft className="w-4 h-4" /> Back to Mission Control
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Film className="w-6 h-6 text-amber-500" />
                <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
                  {project.status}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">{project.title}</h1>
              <p className="text-zinc-400 mt-2 text-lg">{project.description}</p>
            </div>
          </div>
        </div>

        {/* Financial Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Total Budget
            </h3>
            <p className="text-3xl font-bold text-white">{project.budget.toFixed(2)} <span className="text-lg text-zinc-500">BHD</span></p>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
            <h3 className="text-emerald-500 text-sm font-bold uppercase tracking-wider mb-2">Approved Spent</h3>
            <p className="text-3xl font-bold text-emerald-400">{totalSpent.toFixed(2)} <span className="text-lg text-emerald-600/50">BHD</span></p>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
            <h3 className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-2">Budget Remaining</h3>
            <p className="text-3xl font-bold text-amber-400">{budgetRemaining.toFixed(2)} <span className="text-lg text-amber-600/50">BHD</span></p>
          </div>
        </div>

        {/* Digital Call Sheet (Requested Resources) */}
        <div>
          <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4">Equipment & Crew Call Sheet</h2>
          
          {project.resources.length === 0 ? (
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-12 flex flex-col items-center text-center border-dashed">
              <p className="text-zinc-400 mb-4">Your call sheet is completely empty.</p>
              <Link href="/search">
                <button className="bg-white/10 hover:bg-amber-500 hover:text-black text-white font-bold rounded-xl px-6 py-3 transition-colors cursor-none">
                  Search Marketplace
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {project.resources.map((req) => {
                const isApproved = req.status === "APPROVED";
                const isDeclined = req.status === "DECLINED";
                const isPending = req.status === "PENDING";
                
                // TYPESCRIPT FIX: Dynamically pull data whether it's a listing or a service
                const itemName = req.listing?.title || req.service?.title || "Unknown Resource";
                const itemPrice = req.listing?.pricePerDay || req.service?.pricePerDay || 0;
                const itemImage = req.listing?.imageUrl || null;
                const itemLink = req.listing ? `/listing/${req.listing.id}` : "#"; 
                
                return (
                  <div key={req.id} className="bg-black/50 border border-white/5 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-white/10 transition-colors">
                    
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                        {itemImage ? (
                          <img src={itemImage} className="w-full h-full object-cover" alt="gear" />
                        ) : (
                          <Users className="w-6 h-6 text-zinc-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                          {itemName}
                        </h4>
                        <p className="text-sm text-zinc-400">{itemPrice} BHD / day</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                      {isPending && (
                        <span className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg text-sm font-bold">
                          <Clock className="w-4 h-4" /> Awaiting Approval
                        </span>
                      )}
                      {isApproved && (
                        <span className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-sm font-bold">
                          <CheckCircle className="w-4 h-4" /> Secured & Approved
                        </span>
                      )}
                      {isDeclined && (
                        <span className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-sm font-bold">
                          <XCircle className="w-4 h-4" /> Declined by Owner
                        </span>
                      )}
                      {req.listing && (
                        <Link href={itemLink} className="text-sm font-bold text-zinc-500 hover:text-white transition-colors cursor-none underline underline-offset-4">
                          View Page
                        </Link>
                      )}
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}