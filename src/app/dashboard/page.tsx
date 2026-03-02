import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Film, Bookmark, Briefcase, Calendar, CreditCard, Search, UserCircle, Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { db } from "../../lib/db";
import RoleSwitch from "./RoleSwitch";
import ProfileSettings from "./ProfileSettings";
import InventoryHub from "./InventoryHub";
import QuickActions from "./QuickActions";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const resolvedParams = await searchParams;
  const currentTab = resolvedParams?.tab || "overview";

  const { userId } = await auth();
  if (!userId) redirect("/");
  const user = await currentUser();

  const dbUser = await db.user.findUnique({
    where: { clerkId: userId },
    include: { listings: { where: { visibility: { not: "ARCHIVED" } } }, projects: true, services: true }
  });

  if (!dbUser) redirect("/");

  const isProvider = dbUser.role === "PROVIDER";

  const getTabClass = (tabName: string) => {
    return currentTab === tabName
      ? "flex items-center gap-3 px-4 py-3 bg-white/5 text-amber-500 rounded-xl font-bold border border-white/10"
      : "flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors";
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col md:flex-row selection:bg-amber-500/30">
      
      {/* MOBILE TOP BAR */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0a0a0a] sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center font-bold text-black text-sm">K</div>
          <span className="font-bold tracking-tight">Mission Control</span>
        </Link>
        <UserButton />
      </div>

      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 border-r border-white/5 bg-[#0a0a0a] flex-col shrink-0 h-screen sticky top-0">
        <Link href="/" className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-black text-xl">K</div>
          <span className="text-xl font-bold tracking-tight text-white">Mission Control</span>
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

          <div className="h-px w-full bg-white/5 my-4"></div>
          <Link href="/dashboard?tab=settings" className={getTabClass("settings")}><UserCircle className="w-5 h-5" /> Profile Hub</Link>
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <RoleSwitch isProvider={isProvider} />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <header className="hidden md:flex h-20 border-b border-white/5 px-8 items-center justify-between sticky top-0 z-10 bg-[#030303]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center bg-white/5 rounded-lg px-4 py-2 w-96 border border-white/5 focus-within:border-amber-500/50 transition-colors">
            <Search className="w-4 h-4 text-zinc-500 mr-2" />
            <input type="text" placeholder="Search resources..." className="bg-transparent text-sm w-full outline-none" />
          </div>
          <UserButton appearance={{ elements: { avatarBox: "w-10 h-10 border-2 border-amber-500/20" } }} />
        </header>

        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
          {/* TAB: OVERVIEW */}
          {currentTab === "overview" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="mb-10">
                 <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">Welcome, {user?.firstName || "Director"}.</h1>
                 <p className="text-zinc-500 font-medium">Here is your production workspace status.</p>
               </div>

               {/* QUICK ACTIONS FOR CREATORS */}
               <QuickActions isProvider={isProvider} />

               {/* METRICS GRID */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px]"></div>
                     <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">{isProvider ? "Active Inventory" : "Productions"}</h3>
                     <p className="text-5xl font-black">{isProvider ? (dbUser.listings.length + dbUser.services.length) : dbUser.projects.length}</p>
                  </div>
                  <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px]"></div>
                     <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Escrow Funds</h3>
                     <p className="text-5xl font-black text-emerald-400">0.00 <span className="text-sm text-zinc-600 font-bold uppercase tracking-tighter">BHD</span></p>
                  </div>
               </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {currentTab === "settings" && <ProfileSettings user={dbUser} />}

          {/* TAB: INVENTORY */}
          {currentTab === "inventory" && <InventoryHub listings={dbUser.listings} />}

          {/* MOBILE NAVIGATION BAR (REFINED) */}
          <div className="md:hidden grid grid-cols-3 gap-3 mt-8 pb-20">
             <Link href="/dashboard?tab=overview" className={`p-4 rounded-2xl border transition-all ${currentTab === 'overview' ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 border-white/10 text-zinc-400'} text-center font-black text-xs uppercase tracking-tighter`}>Overview</Link>
             <Link href="/dashboard?tab=settings" className={`p-4 rounded-2xl border transition-all ${currentTab === 'settings' ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 border-white/10 text-zinc-400'} text-center font-black text-xs uppercase tracking-tighter`}>Profile</Link>
             {isProvider && <Link href="/dashboard?tab=inventory" className={`p-4 rounded-2xl border transition-all ${currentTab === 'inventory' ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 border-white/10 text-zinc-400'} text-center font-black text-xs uppercase tracking-tighter`}>Inventory</Link>}
          </div>

          {/* FALLBACKS */}
          {["projects", "saved", "calendar", "billing"].includes(currentTab) && (
            <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl bg-white/2">
              <p className="text-zinc-600 font-black uppercase tracking-widest text-sm">Module in verification phase</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
