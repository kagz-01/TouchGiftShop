"use client";

import { useState } from "react";
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

const MOCK_EVENTS: CalendarEvent[] = [
  { id: "1", title: "Sarah's Birthday", recipientName: "Sarah Wanjiku", date: "2026-09-01", type: "birthday", status: "pending_pool", giftBudget: 5000, department: "Design", autoOrder: true },
  { id: "2", title: "James's Work Anniversary", recipientName: "James Ochieng", date: "2026-09-05", type: "anniversary", status: "scheduled", giftBudget: 3000, department: "Engineering", autoOrder: true },
  { id: "3", title: "Team Building Friday", recipientName: "All Staff", date: "2026-09-12", type: "custom", status: "scheduled", giftBudget: 1500, department: "All", autoOrder: false },
  { id: "4", title: "Amina's Birthday", recipientName: "Amina Hassan", date: "2026-09-15", type: "birthday", status: "scheduled", giftBudget: 4000, department: "Marketing", autoOrder: true },
  { id: "5", title: "Team Celebration", recipientName: "Engineering Team", date: "2026-09-20", type: "holiday", status: "scheduled", giftBudget: 2000, department: "Engineering", autoOrder: false },
  { id: "6", title: "David's Work Anniversary", recipientName: "David Mutua", date: "2026-09-25", type: "anniversary", status: "scheduled", giftBudget: 3000, department: "Sales", autoOrder: true },
  { id: "7", title: "Company Anniversary", recipientName: "Everyone", date: "2026-10-01", type: "holiday", status: "scheduled", giftBudget: 2500, department: "All", autoOrder: false },
  { id: "8", title: "Grace's Birthday", recipientName: "Grace Njeri", date: "2026-10-08", type: "birthday", status: "scheduled", giftBudget: 3500, department: "HR", autoOrder: true },
];

const TYPE_CONFIG = {
  birthday: { icon: <Cake className="w-4 h-4" />, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-500/10" },
  anniversary: { icon: <Trophy className="w-4 h-4" />, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10" },
  holiday: { icon: <PartyPopper className="w-4 h-4" />, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  custom: { icon: <Gift className="w-4 h-4" />, color: "text-brand", bg: "bg-brand/5" },
};

const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", color: "bg-brand/10 text-brand" },
  sent: { label: "Sent", color: "bg-blue-50 text-blue-500" },
  delivered: { label: "Delivered", color: "bg-success/10 text-success" },
  pending_pool: { label: "Pool Active", color: "bg-amber-50 text-amber-600" },
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CorporateCalendar() {
  const [currentMonth, setCurrentMonth] = useState(8); // September (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [view, setView] = useState<"calendar" | "list">("calendar");

  const events = MOCK_EVENTS;

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
    <div className="min-h-screen section-theme-a">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-surface-border">
        <div className="page-container-capped py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display italic text-2xl font-bold">Gifting Calendar</h1>
              <p className="text-theme-muted text-sm">Never miss an occasion. Schedule and automate corporate gifts.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView(view === "calendar" ? "list" : "calendar")}
                className="px-4 py-2 shape-premium-card text-sm font-medium border border-surface-border text-theme-muted hover:border-brand/30 transition-all"
              >
                {view === "calendar" ? "List View" : "Calendar View"}
              </button>
              <Link
                href="/corporate/calendar/add"
                className="px-4 py-2 bg-brand text-white shape-premium-card font-semibold text-sm hover:bg-brand-dark transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Event
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "This Month", value: events.filter((e) => { const d = new Date(e.date); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; }).length, icon: <Calendar className="w-5 h-5" />, color: "text-brand" },
              { label: "Upcoming", value: upcomingEvents.length, icon: <Clock className="w-5 h-5" />, color: "text-violet-500" },
              { label: "Auto-Order", value: events.filter((e) => e.autoOrder).length, icon: <Gift className="w-5 h-5" />, color: "text-success" },
              { label: "Total Budget", value: `KSh ${totalBudget.toLocaleString()}`, icon: <Bell className="w-5 h-5" />, color: "text-gold" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/80 backdrop-blur-sm shape-premium-card p-4 border border-surface-border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 shape-premium-card flex items-center justify-center bg-gray-50 dark:bg-white/5 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-theme-heading">{stat.value}</p>
                    <p className="text-xs text-theme-muted">{stat.label}</p>
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
              <div className="bg-white/80 backdrop-blur-sm shape-premium-card border border-surface-border shadow-sm">
                {/* Month nav */}
                <div className="flex items-center justify-between p-4 border-b border-surface-border">
                  <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 shape-premium-card transition-colors">
                    <ChevronLeft className="w-5 h-5 text-theme-muted" />
                  </button>
                  <h2 className="font-display italic text-lg font-bold text-theme-heading">
                    {MONTHS[currentMonth]} {currentYear}
                  </h2>
                  <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 shape-premium-card transition-colors">
                    <ChevronRight className="w-5 h-5 text-theme-muted" />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-surface-border">
                  {DAYS.map((day) => (
                    <div key={day} className="p-3 text-center text-xs font-semibold text-theme-muted">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-2 min-h-[80px] border-b border-r border-surface-border/50" />
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
                        className={`p-2 min-h-[80px] border-b border-r border-surface-border/50 cursor-pointer transition-all hover:bg-brand/5 ${
                          isSelected ? "bg-brand/10" : ""
                        }`}
                      >
                        <div className={`text-sm font-semibold mb-1 ${isToday ? "w-6 h-6 bg-brand text-white shape-premium-button flex items-center justify-center" : "text-theme-heading"}`}>
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
                            <div className="text-[10px] text-theme-muted">+{dayEvents.length - 2} more</div>
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
                        className="bg-white/80 backdrop-blur-sm shape-premium-card p-4 border border-surface-border shadow-sm flex items-center justify-between hover:shadow-card-hover transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 shape-premium-card flex items-center justify-center ${typeCfg.bg} ${typeCfg.color}`}>
                            {typeCfg.icon}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-theme-heading">{event.title}</p>
                            <p className="text-xs text-theme-muted">
                              {new Date(event.date).toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric" })} · {event.department}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-theme-heading">KSh {event.giftBudget.toLocaleString()}</p>
                            <p className="text-[10px] text-theme-muted">{event.autoOrder ? "Auto-order" : "Manual"}</p>
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
              <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm">
                <h3 className="text-sm font-semibold text-theme-heading mb-3">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-KE", { weekday: "long", month: "long", day: "numeric" })}
                </h3>
                {selectedEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedEvents.map((event) => {
                      const typeCfg = TYPE_CONFIG[event.type];
                      return (
                        <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                          <div className={`w-8 h-8 shape-premium-card flex items-center justify-center ${typeCfg.bg} ${typeCfg.color}`}>
                            {typeCfg.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-theme-heading truncate">{event.recipientName}</p>
                            <p className="text-xs text-theme-muted">KSh {event.giftBudget.toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-theme-muted">No events on this date.</p>
                )}
              </div>
            )}

            {/* Upcoming events */}
            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm">
              <h3 className="text-sm font-semibold text-theme-heading mb-3">Upcoming Events</h3>
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
                        <p className="text-sm font-semibold text-theme-heading truncate">{event.recipientName}</p>
                        <p className="text-xs text-theme-muted">
                          {daysUntil <= 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-brand">KSh {event.giftBudget.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-5 border border-surface-border shadow-sm">
              <h3 className="text-sm font-semibold text-theme-heading mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/corporate/calendar/add"
                  className="flex items-center gap-3 p-3 bg-brand/5 hover:bg-brand/10 shape-premium-card transition-colors text-sm font-medium text-brand"
                >
                  <Plus className="w-4 h-4" /> Add Birthday
                </Link>
                <Link
                  href="/corporate/pool/create"
                  className="flex items-center gap-3 p-3 bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 shape-premium-card transition-colors text-sm font-medium text-violet-600"
                >
                  <Users className="w-4 h-4" /> Create Gift Pool
                </Link>
                <Link
                  href="/corporate/build"
                  className="flex items-center gap-3 p-3 bg-gold/10 hover:bg-gold/20 shape-premium-card transition-colors text-sm font-medium text-gold"
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
