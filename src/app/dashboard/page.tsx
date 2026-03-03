import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Film, Bookmark, Briefcase, Calendar, Wallet, CreditCard, Search, UserCircle, ShieldCheck } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { db } from "../../lib/db";
import RoleSwitch from "./RoleSwitch";
import ProfileSettings from "./ProfileSettings";
import InventoryHub from "./InventoryHub";
import QuickActions from "./QuickActions";
import ProjectsHub from "./ProjectsHub";

export default async function Dashboard(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParamsValue = await props.searchParams;
  const currentTab = searchParamsValue?.tab || "overview";

  const { userId } = await auth();
  if (!userId) redirect("/");
  const user = await currentUser();

  const dbUser = await db.user.findUnique({
    where: { clerkId: userId },
    include: { 
      listings: { where: { visibility: { not: "ARCHIVED" } } }, 
      projects: true, 
      services: true 
    }
  });

  if (!dbUser) redirect("/");

  const isProvider = dbUser.role === "PROVIDER";
  const isAdmin = userId === "user_3AISoqNWAgFtVmrDkNNht2tYeyB"; 

  const getTabClass = (tabName: string) => {
    const isActive = currentTab === tabName;
    return isActive
      ? "flex items-center gap-3 px-4 py-3 bg-amber-500 text-black rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20"
      : "flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors";
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col md:flex-row">
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0a0a0a] sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-black">K</div>
          <span className="font-bold tracking-tight">Mission Control</span>
        </Link>
        <div className="flex items-center gap-4">
          <RoleSwitch isProvider={isProvider} />
          <UserButton />
        </div>
      </div>
      
      {/* MOBILE TAB BAR */}
      <div className="md:hidden flex overflow-x-auto border-b border-white/5 bg-[#0a0a0a] sticky top-[65px] z-40 no-scrollbar">
         <nav className="flex px-4 py-2 gap-2">
            <Link href="/dashboard?tab=overview" className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold ${currentTab === 'overview' ? 'bg-amber-500 text-black' : 'text-zinc-500 bg-white/5'}`}>Overview</Link>
            {isProvider ? (
              <>
                <Link href="/dashboard?tab=inventory" className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold ${currentTab === 'inventory' ? 'bg-amber-500 text-black' : 'text-zinc-500 bg-white/5'}`}>Inventory</Link>
                <Link href="/dashboard?tab=calendar" className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold ${currentTab === 'calendar' ? 'bg-amber-500 text-black' : 'text-zinc-500 bg-white/5'}`}>Schedule</Link>
              </>
            ) : (
              <>
                <Link href="/dashboard?tab=projects" className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold ${currentTab === 'projects' ? 'bg-amber-500 text-black' : 'text-zinc-500 bg-white/5'}`}>Projects</Link>
                <Link href="/dashboard?tab=saved" className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold ${currentTab === 'saved' ? 'bg-amber-500 text-black' : 'text-zinc-500 bg-white/5'}`}>Saved</Link>
              </>
            )}
            <Link href="/dashboard?tab=settings" className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold ${currentTab === 'settings' ? 'bg-amber-500 text-black' : 'text-zinc-500 bg-white/5'}`}>Settings</Link>
         </nav>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-72 border-r border-white/5 bg-[#0a0a0a] flex-col shrink-0 h-screen sticky top-0 z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-black text-xl">K</div>
          <span className="text-xl font-bold tracking-tighter text-white">Mission Control</span>
        </div>
        <nav className="flex-1 px-4 flex flex-col gap-1.5 pb-6">
          <p className="px-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2 mt-4">Personal</p>
          <Link href="/dashboard?tab=overview" className={getTabClass("overview")}><LayoutGrid className="w-5 h-5" /> Overview</Link>
          {!isProvider ? (
            <>
              <Link href="/dashboard?tab=projects" className={getTabClass("projects")}><Film className="w-5 h-5" /> My Projects</Link>
              <Link href="/dashboard?tab=saved" className={getTabClass("saved")}><Bookmark className="w-5 h-5" /> Saved Items</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard?tab=inventory" className={getTabClass("inventory")}><Briefcase className="w-5 h-5" /> My Inventory</Link>
              <Link href="/dashboard?tab=calendar" className={getTabClass("calendar")}><Calendar className="w-5 h-5" /> Schedule</Link>
            </>
          )}
          <p className="px-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2 mt-8">Identity</p>
          <Link href="/dashboard?tab=settings" className={getTabClass("settings")}><UserCircle className="w-5 h-5" /> Profile Hub</Link>
          {isAdmin && (
            <>
              <p className="px-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2 mt-8 text-blue-500">Kader Admin</p>
              <Link href="/dashboard?tab=admin" className={getTabClass("admin")}><ShieldCheck className="w-5 h-5 text-blue-500" /> Control Center</Link>
            </>
          )}
        </nav>
        <div className="p-4 mt-auto border-t border-white/5">
          <RoleSwitch isProvider={isProvider} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen bg-[#030303]">
        {/* DESKTOP HEADER */}
        <header className="hidden md:flex h-24 border-b border-white/5 px-10 items-center justify-between sticky top-0 z-10 bg-[#030303]/90 backdrop-blur-xl shrink-0">
          <div className="flex items-center bg-white/5 rounded-2xl px-5 py-3 w-[450px] border border-white/5 focus-within:border-amber-500/30 transition-all duration-300">
            <Search className="w-4 h-4 text-zinc-500 mr-3" />
            <input type="text" placeholder="Search mission files..." className="bg-transparent text-sm w-full outline-none placeholder:text-zinc-600 font-medium" />
          </div>
          <UserButton appearance={{ elements: { avatarBox: "w-11 h-11 border-2 border-amber-500/30" } }} />
        </header>

        {/* CONTENT AREA */}
        <div className="p-6 md:p-12 max-w-7xl mx-auto w-full">
          {currentTab === "settings" && <ProfileSettings user={dbUser} />}
          {currentTab === "inventory" && <InventoryHub listings={dbUser.listings || []} />}
          {currentTab === "projects" && <ProjectsHub projects={dbUser.projects || []} />}
          {currentTab === "saved" && (
            <div className="py-24 text-center border border-dashed border-white/10 rounded-[2.5rem]">
               <Bookmark className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
               <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Your library is currently empty</p>
            </div>
          )}
          {currentTab === "calendar" && (
            <div className="py-24 text-center border border-dashed border-white/10 rounded-[2.5rem]">
               <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
               <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No upcoming shoots scheduled</p>
            </div>
          )}
          {currentTab === "admin" && isAdmin && <div className="py-24 text-center border border-dashed border-blue-500/20 rounded-[2.5rem]">Kader HQ Engine Loading...</div>}
          
          {/* DEFAULT / OVERVIEW */}
          {(currentTab === "overview" || !["settings", "inventory", "projects", "saved", "calendar", "admin"].includes(currentTab)) && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
               <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-12">Welcome, {user?.firstName}.</h1>
               <QuickActions isProvider={isProvider} />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group">
                     <h3 className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em] mb-3">{isProvider ? "MARKET INVENTORY" : "LIVE PRODUCTIONS"}</h3>
                     <p className="text-6xl font-black">{isProvider ? (dbUser.listings?.length || 0) : (dbUser.projects?.length || 0)}</p>
                  </div>
                  <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group">
                     <h3 className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em] mb-3">ESCROW BALANCE</h3>
                     <p className="text-6xl font-black text-emerald-400">0.00 <span className="text-sm text-zinc-600 font-bold uppercase tracking-tighter">BHD</span></p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
