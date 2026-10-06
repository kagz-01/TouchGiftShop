"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar, ChevronLeft, ChevronRight, Gift, Plus,
  Bell, Clock, Users, Cake, Trophy, Briefcase, PartyPopper,
  AlertCircle, Check, Settings, Trash2, Edit3
} from "lucide-react";

type CalendarEvent = {
  id: string;
  title: string;
  recipientName: string;
  date: string;
  type: "birthday" | "anniversary" | "holiday" | "custom";
  status: "scheduled" | "sent" | "delivered" | "pending_pool";
  giftBudget: number;
  department: string;
  autoOrder: boolean;
};

const TYPE_CONFIG = {
  birthday: { icon: <Cake className="w-4 h-4" />, color: "text-pink-400", bg: "bg-pink-500/10" },
  anniversary: { icon: <Trophy className="w-4 h-4" />, color: "text-violet-400", bg: "bg-violet-500/10" },
  holiday: { icon: <PartyPopper className="w-4 h-4" />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  custom: { icon: <Gift className="w-4 h-4" />, color: "text-violet-400", bg: "bg-violet-500/10" },
};

const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", color: "bg-violet-500/20 text-violet-400" },
  sent: { label: "Sent", color: "bg-blue-500/20 text-blue-400" },
  delivered: { label: "Delivered", color: "bg-emerald-500/20 text-emerald-400" },
  pending_pool: { label: "Pool Active", color: "bg-fuchsia-500/20 text-fuchsia-400" },
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CorporateCalendar() {
  const [currentMonth, setCurrentMonth] = useState(8); // September (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/corporate/calendar?month=${currentMonth + 1}&year=${currentYear}`);
        const data = await res.json();
        if (data.events) {
          setEvents(data.events.map((e: Record<string, unknown>) => ({
            id: e.id,
            title: e.title,
            recipientName: e.recipient_name,
            date: e.event_date,
            type: e.event_type,
            status: e.status,
            giftBudget: e.gift_budget || 0,
            department: e.department || "",
            autoOrder: e.auto_order,
          })));
        }
      } catch {
        // Use empty state on error
      }
    };
    fetchEvents();
  }, [currentMonth, currentYear]);

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  const selectedEvents = selectedDate ? events.filter((e) => e.date === selectedDate) : [];

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const totalBudget = events.reduce((sum, e) => sum + e.giftBudget, 0);

  return (
    <div className="min-h-screen bg-[#14080D] text-white">
      {/* Header */}
      <div className="bg-[#14080D]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="page-container-capped py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display italic text-2xl font-bold text-violet-400">Gifting Calendar</h1>
              <p className="text-white/60 text-sm">Never miss an occasion. Schedule and automate corporate gifts.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView(view === "calendar" ? "list" : "calendar")}
                className="px-4 py-2 shape-premium-card text-sm font-medium border border-white/10 text-white/50 hover:border-violet-400/30 hover:text-white transition-all"
              >
                {view === "calendar" ? "List View" : "Calendar View"}
              </button>
              <Link
                href="/corporate/calendar/add"
                className="px-4 py-2 bg-violet-500 text-white shape-premium-card font-semibold text-sm hover:bg-violet-600 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              >
                <Plus className="w-4 h-4" /> Add Event
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "This Month", value: events.filter((e) => { const d = new Date(e.date); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; }).length, icon: <Calendar className="w-5 h-5" />, color: "text-violet-400" },
              { label: "Upcoming", value: upcomingEvents.length, icon: <Clock className="w-5 h-5" />, color: "text-pink-400" },
              { label: "Auto-Order", value: events.filter((e) => e.autoOrder).length, icon: <Gift className="w-5 h-5" />, color: "text-emerald-400" },
              { label: "Total Budget", value: `KSh ${totalBudget.toLocaleString()}`, icon: <Bell className="w-5 h-5" />, color: "text-fuchsia-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur-md shape-premium-card p-4 border border-white/10 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 shape-premium-card flex items-center justify-center bg-white/5 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/60">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container-capped py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main: Calendar or List */}
          <div className="lg:col-span-2">
            {view === "calendar" ? (
              <div className="bg-white/5 backdrop-blur-md shape-premium-card border border-white/10 shadow-lg">
                {/* Month nav */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <button onClick={prevMonth} className="p-2 hover:bg-white/10 shape-premium-card transition-colors">
                    <ChevronLeft className="w-5 h-5 text-white/60" />
                  </button>
                  <h2 className="font-display italic text-lg font-bold text-white">
                    {MONTHS[currentMonth]} {currentYear}
                  </h2>
                  <button onClick={nextMonth} className="p-2 hover:bg-white/10 shape-premium-card transition-colors">
                    <ChevronRight className="w-5 h-5 text-white/60" />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-white/10 bg-black/20">
                  {DAYS.map((day) => (
                    <div key={day} className="p-3 text-center text-xs font-semibold text-white/50">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-2 min-h-[80px] border-b border-r border-white/5" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayEvents = getEventsForDate(day);
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isToday = new Date().toISOString().split("T")[0] === dateStr;
                    const isSelected = selectedDate === dateStr;

                    return (
                      <div
                        key={day}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`p-2 min-h-[80px] border-b border-r border-white/5 cursor-pointer transition-all hover:bg-white/5 ${
                          isSelected ? "bg-violet-500/10 shadow-[inset_0_0_10px_rgba(139,92,246,0.1)]" : ""
                        }`}
                      >
                        <div className={`text-sm font-semibold mb-1 ${isToday ? "w-6 h-6 bg-violet-500 text-white shape-premium-button flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.5)]" : "text-white/80"}`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => {
                            const cfg = TYPE_CONFIG[event.type];
                            return (
                              <div
                                key={event.id}
                                className={`text-[10px] px-1.5 py-0.5 rounded-sm truncate ${cfg.bg} ${cfg.color} font-medium`}
                              >
                                {event.recipientName}
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-[10px] text-white/40">+{dayEvents.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* List view */
              <div className="space-y-3">
                {events
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((event) => {
                    const typeCfg = TYPE_CONFIG[event.type];
                    const statusCfg = STATUS_CONFIG[event.status];
                    return (
                      <div
                        key={event.id}
                        className="bg-white/5 backdrop-blur-md shape-premium-card p-4 border border-white/10 shadow-lg flex items-center justify-between hover:border-violet-400/50 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 shape-premium-card flex items-center justify-center ${typeCfg.bg} ${typeCfg.color}`}>
                            {typeCfg.icon}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{event.title}</p>
                            <p className="text-xs text-white/60">
                              {new Date(event.date).toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric" })} · {event.department}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-white">KSh {event.giftBudget.toLocaleString()}</p>
                            <p className="text-[10px] text-white/60">{event.autoOrder ? "Auto-order" : "Manual"}</p>
                          </div>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold shape-premium-button ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Sidebar: Selected date events + Upcoming */}
          <div className="space-y-4">
            {/* Selected date */}
            {selectedDate && (
              <div className="bg-white/5 backdrop-blur-md shape-premium-card p-5 border border-white/10 shadow-lg">
                <h3 className="text-sm font-semibold text-white mb-3">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-KE", { weekday: "long", month: "long", day: "numeric" })}
                </h3>
                {selectedEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedEvents.map((event) => {
                      const typeCfg = TYPE_CONFIG[event.type];
                      return (
                        <div key={event.id} className="flex items-center gap-3 p-3 bg-black/30 border border-white/5 rounded-xl">
                          <div className={`w-8 h-8 shape-premium-card flex items-center justify-center ${typeCfg.bg} ${typeCfg.color}`}>
                            {typeCfg.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{event.recipientName}</p>
                            <p className="text-xs text-white/60">KSh {event.giftBudget.toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-white/40">No events on this date.</p>
                )}
              </div>
            )}

            {/* Upcoming events */}
            <div className="bg-white/5 backdrop-blur-md shape-premium-card p-5 border border-white/10 shadow-lg">
              <h3 className="text-sm font-semibold text-white mb-3">Upcoming Events</h3>
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const typeCfg = TYPE_CONFIG[event.type];
                  const daysUntil = Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={event.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 shape-premium-card flex items-center justify-center ${typeCfg.bg} ${typeCfg.color}`}>
                        {typeCfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{event.recipientName}</p>
                        <p className="text-xs text-white/60">
                          {daysUntil <= 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-violet-400">KSh {event.giftBudget.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white/5 backdrop-blur-md shape-premium-card p-5 border border-white/10 shadow-lg">
              <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/corporate/calendar/add"
                  className="flex items-center gap-3 p-3 bg-violet-400/10 hover:bg-violet-400/20 border border-transparent hover:border-violet-400/30 shape-premium-card transition-colors text-sm font-medium text-violet-400"
                >
                  <Plus className="w-4 h-4" /> Add Event
                </Link>
                <Link
                  href="/corporate/pool/create"
                  className="flex items-center gap-3 p-3 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-transparent hover:border-fuchsia-500/30 shape-premium-card transition-colors text-sm font-medium text-fuchsia-400"
                >
                  <Users className="w-4 h-4" /> Create Gift Pool
                </Link>
                <Link
                  href="/corporate/build"
                  className="flex items-center gap-3 p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-transparent hover:border-emerald-500/30 shape-premium-card transition-colors text-sm font-medium text-emerald-400"
                >
                  <Gift className="w-4 h-4" /> Build Hamper
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
