import { Suspense } from "react";
import RiderLocationClient from "./RiderLocationClient";

export default function RiderLocationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RiderLocationClient />
    </Suspense>
  );
}
