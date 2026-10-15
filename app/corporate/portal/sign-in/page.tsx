import PortalSignInForm from "@/components/corporate/portal/PortalSignInForm";

export default async function PortalSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  /* Only ever redirect within the portal. An open redirect here would turn the
     sign-in screen into a phishing page with our brand on it. */
  const target =
    typeof next === "string" && next.startsWith("/corporate/portal")
      ? next
      : "/corporate/portal";

  return <PortalSignInForm next={target} />;
}
