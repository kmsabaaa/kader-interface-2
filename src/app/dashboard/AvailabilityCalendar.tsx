"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Package, MapPin } from "lucide-react";

interface Booking {
  id: string;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
  listing: { title: string; type: string } | null;
  service: { title: string } | null;
  project: { title: string };
}

interface AvailabilityCalendarProps {
  bookings: Booking[];
}

const MS_PER_DAY = 1000 * 3600 * 24;
const CALENDAR_LOCALE = "en-BH";

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: "bg-amber-500/80",
  ACCEPTED: "bg-emerald-500/80",
  ESCROW_FUNDED: "bg-blue-500/80",
  COMPLETED: "bg-zinc-500/80",
  CANCELLED: "bg-red-500/80",
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function AvailabilityCalendar({ bookings }: AvailabilityCalendarProps) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Build a map of day → bookings
  const dayBookings: Record<number, Booking[]> = {};
  bookings.forEach(booking => {
    if (!booking.startDate || !booking.endDate) return;
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const cursor = new Date(start);
    while (cursor <= end) {
      if (cursor.getFullYear() === year && cursor.getMonth() === month) {
        const d = cursor.getDate();
        if (!dayBookings[d]) dayBookings[d] = [];
        dayBookings[d].push(booking);
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  // Upcoming bookings list
  const upcoming = bookings
    .filter(b => b.startDate && new Date(b.startDate) >= today && b.status !== "CANCELLED")
    .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())
    .slice(0, 5);

  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const todayDate = today.getDate();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* CALENDAR GRID */}
        <div className="xl:col-span-2 bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white">
              {MONTH_NAMES[month]} {year}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors text-zinc-400 hover:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[10px] font-black text-zinc-600 uppercase tracking-widest py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const bks = dayBookings[day] || [];
              const isToday = isCurrentMonth && day === todayDate;
              return (
                <div
                  key={day}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-start pt-1.5 transition-all ${
                    bks.length > 0
                      ? "bg-amber-500/10 border border-amber-500/20"
                      : "hover:bg-white/5"
                  } ${isToday ? "ring-2 ring-amber-500 ring-offset-1 ring-offset-[#030303]" : ""}`}
                >
                  <span className={`text-xs font-bold ${isToday ? "text-amber-400" : bks.length > 0 ? "text-white" : "text-zinc-500"}`}>
                    {day}
                  </span>
                  {bks.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 justify-center mt-0.5 px-0.5">
                      {bks.slice(0, 3).map((b, i) => (
                        <span
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[b.status] || "bg-zinc-500"}`}
                          title={b.listing?.title || b.service?.title || ""}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-white/5">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* UPCOMING BOOKINGS LIST */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" /> Upcoming
          </h3>
          {upcoming.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-600 text-sm font-medium">No upcoming bookings</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map(b => {
                const start = new Date(b.startDate!);
                const end = new Date(b.endDate!);
                const days = Math.ceil((end.getTime() - start.getTime()) / (MS_PER_DAY)) || 1;
                const title = b.listing?.title || b.service?.title || "Booking";
                const icon = b.listing?.type === "LOCATION" ? MapPin : Package;
                const IconComp = icon;
                return (
                  <div key={b.id} className="flex gap-4 p-4 bg-black/30 rounded-2xl border border-white/5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${STATUS_COLORS[b.status] || "bg-zinc-800"}`}>
                      <IconComp className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{title}</p>
                      <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                        {start.toLocaleDateString(CALENDAR_LOCALE, { month: "short", day: "numeric" })}
                        {" — "}
                        {end.toLocaleDateString(CALENDAR_LOCALE, { month: "short", day: "numeric" })}
                        {" · "}{days} {days === 1 ? "day" : "days"}
                      </p>
                      <p className="text-[10px] text-zinc-600 truncate mt-0.5">{b.project.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ALL BOOKINGS TABLE */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-bold">All Scheduled Bookings</h3>
        </div>
        {bookings.length === 0 ? (
          <div className="p-12 text-center text-zinc-600">No bookings yet.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {bookings
              .filter(b => b.startDate)
              .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())
              .map(b => {
                const start = new Date(b.startDate!);
                const end = new Date(b.endDate!);
                const title = b.listing?.title || b.service?.title || "Booking";
                const colorClass = STATUS_COLORS[b.status] || "bg-zinc-500/80";
                return (
                  <div key={b.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${colorClass}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">{title}</p>
                      <p className="text-xs text-zinc-500">{b.project.title}</p>
                    </div>
                    <div className="text-xs text-zinc-400 font-medium shrink-0">
                      {start.toLocaleDateString()} – {end.toLocaleDateString()}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${colorClass} text-white shrink-0`}>
                      {b.status}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
