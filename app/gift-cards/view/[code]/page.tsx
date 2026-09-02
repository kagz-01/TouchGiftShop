import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import GiftCardRecipientView from "@/components/gift-cards/GiftCardRecipientView";

interface Props {
  params: { code: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const code = params.code.toUpperCase();
  const { data } = await supabaseAdmin
    .from("gift_cards")
    .select("recipient_name, initial_amount")
    .eq("code", code)
    .maybeSingle();

  if (!data) {
    return { title: "Gift Card Not Found · TouchGift" };
  }

  return {
    title: `🎁 A Gift Card for ${data.recipient_name} · TouchGift`,
    description: `Someone sent you a KSh ${data.initial_amount.toLocaleString()} TouchGift gift card. Open to reveal your code.`,
    openGraph: {
      title: `🎁 You've received a gift card!`,
      description: `A KSh ${data.initial_amount.toLocaleString()} TouchGift card is waiting for you.`,
    },
  };
}

export default async function GiftCardViewPage({ params }: Props) {
  const code = params.code.toUpperCase();

  const { data: card } = await supabaseAdmin
    .from("gift_cards")
    .select(
      "code, initial_amount, balance, status, expires_at, recipient_name, sender_name, message, style"
    )
    .eq("code", code)
    .maybeSingle();

  if (!card) notFound();

  // Don't expose pending or scheduled cards
  if (card.status === "pending_payment" || card.status === "scheduled") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">⏳</p>
          <h1 className="font-display text-2xl font-bold text-theme-heading mb-2">
            Almost ready…
          </h1>
          <p className="text-theme-muted text-sm">
            This gift card is being prepared. Check back shortly.
          </p>
        </div>
      </div>
    );
  }

  const isExpired =
    card.expires_at && new Date(card.expires_at) < new Date();

  return (
    <GiftCardRecipientView
      code={card.code}
      amount={card.initial_amount}
      balance={card.balance}
      recipientName={card.recipient_name}
      senderName={card.sender_name}
      message={card.message}
      style={card.style}
      expiresAt={card.expires_at}
      isExpired={!!isExpired}
    />
  );
}
