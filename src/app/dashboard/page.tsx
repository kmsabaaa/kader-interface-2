export const dynamic = "force-dynamic";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Film, Bookmark, Briefcase, Calendar, Search, UserCircle, ShieldCheck, TrendingUp } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { db } from "../../lib/db";
import RoleSwitch from "./RoleSwitch";
import ProfileSettings from "./ProfileSettings";
import InventoryHub from "./InventoryHub";
import QuickActions from "./QuickActions";
import ProjectsHub from "./ProjectsHub";
import AvailabilityCalendar from "./AvailabilityCalendar";
import AnalyticsHub from "./AnalyticsHub";
import AddTestFunds from "./AddTestFunds";

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

  // ── Calendar Data (provider only) ──────────────────────────────────────────
  let calendarBookings: any[] = [];
  if (isProvider) {
    calendarBookings = await db.callSheetItem.findMany({
      where: {
        OR: [
          { listing: { userId: dbUser.id } },
          { service: { userId: dbUser.id } }
        ],
        startDate: { not: null },
      },
      include: {
        listing: { select: { title: true, type: true } },
        service: { select: { title: true } },
        project: { select: { title: true } },
      },
      orderBy: { startDate: "asc" },
    });
  }

  // ── Analytics Data (provider only) ────────────────────────────────────────
  const PROVIDER_REVENUE_SHARE = 0.9; // 10% platform fee
  let analyticsData = {
    totalEarnings: 0,
    totalBookings: 0,
    acceptedBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    listingCount: dbUser.listings?.length || 0,
    serviceCount: dbUser.services?.length || 0,
    reviewCount: 0,
    averageRating: 0,
    earningsByMonth: [] as { month: string; amount: number }[],
    topListings: [] as { title: string; bookingCount: number; earnings: number }[],
  };

  if (isProvider) {
    const allBookings = await db.callSheetItem.findMany({
      where: {
        OR: [
          { listing: { userId: dbUser.id } },
          { service: { userId: dbUser.id } }
        ],
      },
      include: {
        listing: { select: { title: true, pricePerDay: true } },
        service: { select: { title: true, pricePerDay: true } },
      },
    });

    analyticsData.totalBookings = allBookings.length;
    analyticsData.acceptedBookings = allBookings.filter(b => b.status === "ACCEPTED" || b.status === "ESCROW_FUNDED").length;
    analyticsData.pendingBookings = allBookings.filter(b => b.status === "REQUESTED").length;
    analyticsData.completedBookings = allBookings.filter(b => b.status === "COMPLETED").length;

    // Earnings from completed + accepted bookings
    const earnableBookings = allBookings.filter(b =>
      b.status === "ACCEPTED" || b.status === "ESCROW_FUNDED" || b.status === "COMPLETED"
    );
    earnableBookings.forEach(b => {
      analyticsData.totalEarnings += b.totalCost * PROVIDER_REVENUE_SHARE;
    });

    // Earnings by month (last 6 months)
    const now = new Date();
    const months: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleDateString("en-US", { month: "short" });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const monthEarnings = earnableBookings
        .filter(b => b.createdAt >= monthStart && b.createdAt <= monthEnd)
        .reduce((sum, b) => sum + b.totalCost * PROVIDER_REVENUE_SHARE, 0);
      months.push({ month: monthLabel, amount: monthEarnings });
    }
    analyticsData.earningsByMonth = months;

    // Top listings by booking count
    const listingBookingMap: Record<string, { title: string; count: number; earnings: number }> = {};
    earnableBookings.forEach(b => {
      const key = b.listingId || b.serviceId || "unknown";
      const title = b.listing?.title || b.service?.title || "Unknown";
      if (!listingBookingMap[key]) listingBookingMap[key] = { title, count: 0, earnings: 0 };
      listingBookingMap[key].count += 1;
      listingBookingMap[key].earnings += b.totalCost * PROVIDER_REVENUE_SHARE;
    });
    analyticsData.topListings = Object.values(listingBookingMap)
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5)
      .map(v => ({ title: v.title, bookingCount: v.count, earnings: v.earnings }));

    // Reviews
    const reviews = await db.review.findMany({
      where: { listing: { userId: dbUser.id } },
    });
    analyticsData.reviewCount = reviews.length;
    if (reviews.length > 0) {
      analyticsData.averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    }
  }

  const getTabClass = (tabName: string) => {
    const isActive = currentTab === tabName;
    return isActive
      ? "flex items-center gap-3 px-4 py-3 bg-amber-500 text-black rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20"
      : "flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors";
  };

  const ALL_TABS = ["settings", "inventory", "projects", "saved", "calendar", "analytics", "admin"];

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
                <Link href="/dashboard?tab=analytics" className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold ${currentTab === 'analytics' ? 'bg-amber-500 text-black' : 'text-zinc-500 bg-white/5'}`}>Analytics</Link>
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
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-black text-xl">K</div>
            <span className="text-xl font-bold tracking-tighter text-white">Mission Control</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 flex flex-col gap-1.5 pb-6 overflow-y-auto">
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
              <Link href="/dashboard?tab=analytics" className={getTabClass("analytics")}><TrendingUp className="w-5 h-5" /> Analytics</Link>
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
          {currentTab === "settings" && <ProfileSettings user={dbUser} isProvider={isProvider} />}
          {currentTab === "inventory" && <InventoryHub listings={dbUser.listings || []} />}
          {currentTab === "projects" && <ProjectsHub projects={dbUser.projects || []} />}
          {currentTab === "saved" && (
            <div className="py-24 text-center border border-dashed border-white/10 rounded-[2.5rem]">
               <Bookmark className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
               <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Your library is currently empty</p>
            </div>
          )}
          {currentTab === "calendar" && isProvider && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-8">Booking Schedule</h1>
              <AvailabilityCalendar bookings={calendarBookings} />
            </div>
          )}
          {currentTab === "analytics" && isProvider && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-8">Analytics</h1>
              <AnalyticsHub data={analyticsData} />
            </div>
          )}
          {currentTab === "admin" && isAdmin && <div className="py-24 text-center border border-dashed border-blue-500/20 rounded-[2.5rem]">Kader HQ Engine Loading...</div>}
          
          {/* DEFAULT / OVERVIEW */}
          {(currentTab === "overview" || !ALL_TABS.includes(currentTab)) && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
               <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">Welcome, {user?.firstName}.</h1>
               <QuickActions isProvider={isProvider} />
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group">
                     <h3 className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em] mb-3">{isProvider ? "MARKET INVENTORY" : "LIVE PRODUCTIONS"}</h3>
                     <p className="text-5xl md:text-6xl font-black">{isProvider ? (dbUser.listings?.length || 0) : (dbUser.projects?.length || 0)}</p>
                  </div>
                  <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group">
                     <h3 className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em] mb-3">ESCROW BALANCE</h3>
                     <p className="text-5xl md:text-6xl font-black text-emerald-400">{dbUser.walletBalance.toFixed(2)} <span className="text-sm text-zinc-600 font-bold uppercase tracking-tighter">BHD</span></p>
                     <AddTestFunds currentBalance={dbUser.walletBalance} />
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
