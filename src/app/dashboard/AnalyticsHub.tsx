"use client";

import { TrendingUp, DollarSign, Package, Clock, CheckCircle, Star } from "lucide-react";

interface AnalyticsData {
  totalEarnings: number;
  totalBookings: number;
  acceptedBookings: number;
  pendingBookings: number;
  completedBookings: number;
  listingCount: number;
  serviceCount: number;
  reviewCount: number;
  averageRating: number;
  earningsByMonth: { month: string; amount: number }[];
  topListings: { title: string; bookingCount: number; earnings: number }[];
}

export default function AnalyticsHub({ data }: { data: AnalyticsData }) {
  const acceptanceRate = data.totalBookings > 0
    ? Math.round((data.acceptedBookings / data.totalBookings) * 100)
    : 0;

  const maxEarning = Math.max(...data.earningsByMonth.map(m => m.amount), 1);

  return (
    <div className="space-y-8">
      {/* KEY METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 blur-[30px] pointer-events-none" />
          <DollarSign className="w-5 h-5 text-emerald-400 mb-3" />
          <p className="text-2xl font-black text-emerald-400">{data.totalEarnings.toFixed(2)}</p>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Total Earnings (BHD)</p>
        </div>
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/20 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 blur-[30px] pointer-events-none" />
          <Package className="w-5 h-5 text-amber-400 mb-3" />
          <p className="text-2xl font-black text-white">{data.totalBookings}</p>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Total Bookings</p>
        </div>
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-blue-500/20 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 blur-[30px] pointer-events-none" />
          <TrendingUp className="w-5 h-5 text-blue-400 mb-3" />
          <p className="text-2xl font-black text-white">{acceptanceRate}%</p>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Acceptance Rate</p>
        </div>
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/20 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 blur-[30px] pointer-events-none" />
          <Star className="w-5 h-5 text-amber-400 mb-3" />
          <p className="text-2xl font-black text-amber-400">
            {data.reviewCount > 0 ? data.averageRating.toFixed(1) : "--"}
          </p>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">
            Avg Rating ({data.reviewCount} reviews)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* EARNINGS BY MONTH BAR CHART */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" /> Monthly Earnings
          </h3>
          {data.earningsByMonth.every(m => m.amount === 0) ? (
            <div className="flex items-center justify-center h-40 text-zinc-600 text-sm font-medium">
              No earnings data yet
            </div>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {data.earningsByMonth.map((m, i) => {
                const barHeight = maxEarning > 0 ? (m.amount / maxEarning) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group" title={`${m.month}: ${m.amount.toFixed(2)} BHD`}>
                    <span className="text-[9px] text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {m.amount > 0 ? m.amount.toFixed(0) : ""}
                    </span>
                    <div className="w-full relative" style={{ height: "120px" }}>
                      <div
                        className="absolute bottom-0 w-full bg-emerald-500/30 hover:bg-emerald-500/60 transition-all rounded-t-md border-t border-emerald-500/50"
                        style={{ height: `${Math.max(barHeight, m.amount > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase">{m.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* BOOKING STATUS BREAKDOWN */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" /> Booking Breakdown
          </h3>
          <div className="space-y-4">
            {[
              { label: "Pending", value: data.pendingBookings, total: data.totalBookings, color: "bg-amber-500" },
              { label: "Accepted", value: data.acceptedBookings, total: data.totalBookings, color: "bg-emerald-500" },
              { label: "Completed", value: data.completedBookings, total: data.totalBookings, color: "bg-blue-500" },
            ].map(({ label, value, total, color }) => {
              const pct = total > 0 ? (value / total) * 100 : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-zinc-400">{label}</span>
                    <span className="text-sm font-bold text-white">{value}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-600 font-bold uppercase tracking-wider mb-1">Active Listings</p>
              <p className="text-2xl font-black">{data.listingCount}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-600 font-bold uppercase tracking-wider mb-1">Active Services</p>
              <p className="text-2xl font-black">{data.serviceCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* TOP PERFORMING ASSETS */}
      {data.topListings.length > 0 && (
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" /> Top Performing Assets
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {data.topListings.map((listing, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <span className="text-2xl font-black text-zinc-700 w-8 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{listing.title}</p>
                  <p className="text-xs text-zinc-500">{listing.bookingCount} booking{listing.bookingCount !== 1 ? "s" : ""}</p>
                </div>
                <p className="text-sm font-black text-emerald-400 shrink-0">{listing.earnings.toFixed(2)} BHD</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.topListings.length === 0 && (
        <div className="py-16 text-center border border-dashed border-white/10 rounded-3xl">
          <TrendingUp className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-600 font-medium text-sm">Analytics will populate as you receive bookings</p>
        </div>
      )}
    </div>
  );
}
