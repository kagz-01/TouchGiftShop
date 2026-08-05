"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function AccountPrefs() {
  const [anonymousDefault, setAnonymousDefault] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata ?? {};
      setAnonymousDefault(meta.anonymous_default ?? false);
    });
  }, []);

  async function toggleAnonymous() {
    const next = !anonymousDefault;
    setAnonymousDefault(next);
    setSaved(false);

    const supabase = createClient();
    await supabase.auth.updateUser({
      data: { anonymous_default: next },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section>
      <h2 className="font-medium mb-2">Preferences</h2>
      <div className="rounded-lg border border-gray-200 p-4 space-y-3">
        <label className="flex items-center justify-between text-sm cursor-pointer">
          <span>Default to Anonymous Mode on checkout</span>
          <button
            onClick={toggleAnonymous}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              anonymousDefault ? "bg-brand" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                anonymousDefault ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </label>
        {saved && (
          <p className="text-xs text-green-600">Saved</p>
        )}
      </div>
    </section>
  );
}
