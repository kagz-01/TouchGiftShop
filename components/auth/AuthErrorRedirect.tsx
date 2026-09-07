"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Detects Supabase auth errors that land on the homepage (e.g. expired magic links)
 * and redirects to the login page with a friendly error message.
 */
export default function AuthErrorRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    const errorCode = searchParams.get("error_code");
    const errorDesc = searchParams.get("error_description");

    // Also check URL hash (Supabase sometimes puts errors in the hash fragment)
    const hash = window.location.hash;
    const hasHashError = hash.includes("error=");

    if (error || hasHashError) {
      let msg = "auth_failed";

      if (errorCode === "otp_expired" || hash.includes("otp_expired")) {
        msg = "magic_link_expired";
      } else if (errorCode === "access_denied" || hash.includes("access_denied")) {
        msg = "auth_failed";
      } else if (errorDesc) {
        msg = encodeURIComponent(errorDesc);
      }

      // Clean the URL and redirect to login with the error
      router.replace(`/login?error=${msg}`);
    }
  }, [searchParams, router]);

  return null;
}
