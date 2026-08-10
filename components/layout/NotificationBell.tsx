"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell({ user }: { user: any }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      })
      .catch(console.error);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id?: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      
      setNotifications(prev => prev.map(n => {
        if (id) {
          return n.id === id ? { ...n, is_read: true } : n;
        }
        return { ...n, is_read: true };
      }));
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  if (!user) return null;

  return (
    <div className="group relative flex flex-col items-center justify-center" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className={cn(
          "relative w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200",
          isOpen ? "bg-brand/10 text-brand" : "text-brand-muted hover:text-brand hover:bg-brand/5"
        )}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {!isOpen && (
        <span className="absolute top-full mt-1.5 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded shadow-sm opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 whitespace-nowrap">
          Notifications & Reminders
        </span>
      )}

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-surface-border overflow-hidden z-50 animate-pop">
          <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface">
            <h3 className="font-bold text-brand-deep">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAsRead();
                }}
                className="text-xs font-semibold text-brand hover:text-brand-dark flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-brand-muted text-sm flex flex-col items-center">
                <Bell className="w-8 h-8 mb-2 opacity-20" />
                No new notifications.
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((n) => (
                  <div 
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={cn(
                      "p-4 border-b border-surface-border cursor-pointer hover:bg-brand/5 transition-colors text-left",
                      !n.is_read ? "bg-brand/[0.02]" : "opacity-75"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={cn("text-sm font-semibold mb-1", !n.is_read ? "text-brand-deep" : "text-brand-muted")}>
                        {n.title}
                      </h4>
                      {!n.is_read && <span className="w-2 h-2 bg-brand rounded-full flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-brand-muted line-clamp-2">{n.message}</p>
                    <span className="text-[10px] text-brand-muted/70 mt-2 block font-medium uppercase tracking-wider">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-2 border-t border-surface-border bg-surface text-center">
            <Link 
              href="/reminders" 
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-brand-muted hover:text-brand transition-colors block py-1"
            >
              View Scheduled Reminders
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
