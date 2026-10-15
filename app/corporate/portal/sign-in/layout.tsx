import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in · TouchGift Client Portal",
  description: "Client portal access for TouchGift corporate accounts.",
  robots: { index: false, follow: false },
};

export default function PortalSignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
