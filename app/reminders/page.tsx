"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Reminder {
  id: string;
  recipient_name: string;
  relationship: string | null;
  occasion_date: string;
  occasion_type: string | null;
  reminder_sent: boolean;
}

const OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Wedding",
  "Graduation",
  "Retirement",
  "Other",
];

function daysUntil(date: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    recipientName: "",
    relationship: "",
    occasionDate: "",
    occasionType: "",
  });

  useEffect(() => {
    fetch("/api/reminders")
      .then((r) => r.json())
      .then((data) => {
        setReminders(data.reminders ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientName: form.recipientName,
        relationship: form.relationship || undefined,
        occasionDate: form.occasionDate,
        occasionType: form.occasionType || undefined,
      }),
    });
    const data = await res.json();
    if (data.reminder) {
      setReminders((prev) => [...prev, data.reminder]);
      setForm({ recipientName: "", relationship: "", occasionDate: "", occasionType: "" });
      setShowForm(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/reminders?id=${id}`, { method: "DELETE" });
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }

  const upcoming = reminders.filter((r) => daysUntil(r.occasion_date) >= 0);
  const past = reminders.filter((r) => daysUntil(r.occasion_date) < 0);

  return (
    <div className="px-4 md:px-8 py-6 max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Reminders</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-brand underline"
        >
          {showForm ? "Cancel" : "+ Add date"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="rounded-lg border border-gray-200 p-4 space-y-3">
          <div>
            <label className="text-sm font-medium">Recipient name</label>
            <input
              required
              value={form.recipientName}
              onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
              placeholder="e.g. Grace"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Relationship</label>
            <input
              value={form.relationship}
              onChange={(e) => setForm({ ...form, relationship: e.target.value })}
              placeholder="e.g. Sister"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                required
                value={form.occasionDate}
                onChange={(e) => setForm({ ...form, occasionDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Occasion</label>
              <select
                value={form.occasionType}
                onChange={(e) => setForm({ ...form, occasionType: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
              >
                <option value="">Select...</option>
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-brand text-white py-2 text-sm font-medium"
          >
            Save reminder
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-brand-muted">Loading...</p>
      ) : reminders.length === 0 ? (
        <div className="text-center py-8 space-y-2">
          <p className="text-sm text-brand-muted">
            Save important dates and we&apos;ll remind you 5 days before with gift
            suggestions.
          </p>
          <p className="text-xs text-brand-muted">
            Partner&apos;s birthday, anniversary, parent&apos;s retirement...
          </p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium">Upcoming</h2>
              {upcoming.map((r) => {
                const days = daysUntil(r.occasion_date);
                return (
                  <div
                    key={r.id}
                    className="rounded-lg border border-gray-200 p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{r.recipient_name}</p>
                      <p className="text-xs text-brand-muted">
                        {r.occasion_type && `${r.occasion_type} • `}
                        {new Date(r.occasion_date).toLocaleDateString("en-KE", {
                          month: "short",
                          day: "numeric",
                        })}
                        {r.relationship && ` • ${r.relationship}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-medium ${
                          days <= 5 ? "text-orange-600" : "text-brand-muted"
                        }`}
                      >
                        {days === 0
                          ? "Today!"
                          : days === 1
                          ? "Tomorrow"
                          : `${days} days`}
                      </span>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-xs text-red-500"
                      >
                        delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {past.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-brand-muted">Past dates</h2>
              {past.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg border border-gray-100 p-3 flex items-center justify-between opacity-60"
                >
                  <div>
                    <p className="text-sm">{r.recipient_name}</p>
                    <p className="text-xs text-brand-muted">
                      {r.occasion_type && `${r.occasion_type} • `}
                      {new Date(r.occasion_date).toLocaleDateString("en-KE", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-xs text-red-500"
                  >
                    delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="border-t border-gray-200 pt-4">
        <h2 className="font-medium mb-2">Your wishlists</h2>
        <Link href="/wishlist/create" className="text-sm underline">
          Create a wishlist to share
        </Link>
      </div>
    </div>
  );
}
