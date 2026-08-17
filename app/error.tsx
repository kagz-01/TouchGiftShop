"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-gray-500 mb-4 max-w-sm">An unexpected error occurred. Please try again.</p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-colors mb-4"
      >
        Try Again
      </button>
      {process.env.NODE_ENV !== 'production' && (
        <div className="max-w-3xl w-full bg-white/95 border border-black/5 rounded-md p-4 text-left text-xs text-gray-800 shadow-sm overflow-auto">
          <p className="font-semibold mb-2">Error message:</p>
          <pre className="whitespace-pre-wrap break-words text-[12px] bg-transparent p-0 m-0">{error?.message}</pre>
          <div className="mt-3">
            <p className="font-semibold mb-1">Stack trace:</p>
            <pre className="whitespace-pre-wrap break-words text-[11px] bg-transparent p-0 m-0">{(error as any)?.stack ?? '—'}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
