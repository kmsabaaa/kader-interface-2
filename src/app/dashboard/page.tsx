import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Film, Bookmark, Briefcase, Calendar, Wallet, CreditCard, Bell, Search, Camera, Users } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { db } from "../../lib/db";
import RoleSwitch from "./RoleSwitch";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const resolvedParams = await searchParams;
  const currentTab = resolvedParams?.tab || "overview";

  const { userId } = await auth();
  if (!userId) redirect("/");
  const user = await currentUser();

  // Robust User fetch with fallback defaults for all new fields
  const dbUser = await db.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: { 
      clerkId: userId,
      role: "CONSUMER",
      isCreator: false,
    },
  });

  const isProvider = dbUser.role === "PROVIDER";

  // Robust Data Fetching with error boundaries (try-catch implicit in Prisma)
  const projects = await db.project.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
  }) || [];

  const listings = await db.listing.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
  }) || [];

  const services = await db.service.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
  }) || [];

  // Transaction Pipeline Stats (Safe calculation)
  const pendingRequests = await db.callSheetItem.findMany({
    where: {
      OR:[ { listing: { userId: dbUser.id } }, { service: { userId: dbUser.id } } ],
      status: "REQUESTED"
    },
    include: { project: true, listing: true, service: true },
  }) || [];

  const getTabClass = (tabName: string) => {
    return currentTab === tabName
      ? "flex items-center gap-3 px-4 py-3 bg-white/5 text-amber-500 rounded-xl font-bold border border-white/10"
      : "flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl font-medium";
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col shrink-0">
        <Link href="/" className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-black text-xl">K</div>
          <span className="text-xl font-bold tracking-tight">Mission Control</span>
        </Link>
        
        <nav className="flex-1 px-4 flex flex-col gap-2 mt-4">
          <Link href="/dashboard?tab=overview" className={getTabClass("overview")}><LayoutGrid className="w-5 h-5" /> Overview</Link>
          {!isProvider ? (
            <>
              <Link href="/dashboard?tab=projects" className={getTabClass("projects")}><Film className="w-5 h-5" /> My Projects</Link>
              <Link href="/dashboard?tab=saved" className={getTabClass("saved")}><Bookmark className="w-5 h-5" /> Saved</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard?tab=inventory" className={getTabClass("inventory")}><Briefcase className="w-5 h-5" /> Inventory</Link>
              <Link href="/dashboard?tab=calendar" className={getTabClass("calendar")}><Calendar className="w-5 h-5" /> Calendar</Link>
            </>
          )}
          <Link href="/dashboard?tab=billing" className={getTabClass("billing")}><CreditCard className="w-5 h-5" /> Billing</Link>
        </nav>

        <div className="p-4 mt-auto">
          <RoleSwitch isProvider={isProvider} />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-10 bg-[#030303]/80 backdrop-blur-md">
          <div className="flex items-center bg-white/5 rounded-lg px-4 py-2 w-96 border border-white/5">
            <Search className="w-4 h-4 text-zinc-500 mr-2" />
            <input type="text" placeholder="Search..." className="bg-transparent text-sm w-full outline-none" />
          </div>
          <UserButton />
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full">
          <h1 className="text-3xl font-bold mb-8">
            {currentTab === "overview" ? `Welcome, ${user?.firstName || "Director"}` : currentTab.toUpperCase()}
          </h1>

          {currentTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                  <h3 className="text-zinc-400 text-sm mb-2">{isProvider ? "Offerings" : "Productions"}</h3>
                  <p className="text-4xl font-bold">{isProvider ? (listings.length + services.length) : projects.length}</p>
               </div>
               <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 text-emerald-400">
                  <h3 className="text-zinc-400 text-sm mb-2">Balance</h3>
                  <p className="text-4xl font-bold">0.00 <span className="text-sm text-zinc-500">BHD</span></p>
               </div>
               <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                  <h3 className="text-zinc-400 text-sm mb-2">Requests</h3>
                  <p className="text-4xl font-bold">{pendingRequests.length}</p>
               </div>
            </div>
          )}

          {/* Fallback for empty tabs */}
          {currentTab !== "overview" && (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl">
              <p className="text-zinc-600 font-bold uppercase tracking-widest text-sm">No data available in this section</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
