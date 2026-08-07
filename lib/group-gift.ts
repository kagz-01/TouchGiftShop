export type GroupGift = {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  targetAmount: number;
  organizer: string;
  organizerEmail: string;
  organizerPhone: string;
  recipients: Array<{
    name: string;
    email: string;
    phone?: string;
    amount: number;
    paid: boolean;
    message?: string;
    joinedAt: string;
  }>;
  status: "collecting" | "paid" | "delivered" | "cancelled";
  createdAt: string;
  expiresAt: string;
  inviteCode: string;
  personalMessage?: string;
};

const GROUP_GIFTS_KEY = "touchgift_group_gifts";

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function createGroupGift(
  product: { id: string; name: string; price: number },
  organizer: { name: string; email: string; phone?: string },
  targetAmount: number,
  personalMessage?: string
): GroupGift {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const groupGift: GroupGift = {
    id: `gg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    productId: product.id,
    productName: product.name,
    productPrice: product.price,
    targetAmount: targetAmount || product.price,
    organizer: organizer.name,
    organizerEmail: organizer.email,
    organizerPhone: organizer.phone || "",
    recipients: [
      {
        name: organizer.name,
        email: organizer.email,
        phone: organizer.phone,
        amount: Math.ceil(product.price / 3), // Organizer's initial share
        paid: false,
        message: personalMessage,
        joinedAt: now.toISOString(),
      },
    ],
    status: "collecting",
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    inviteCode: generateInviteCode(),
    personalMessage,
  };

  const gifts = getGroupGifts();
  gifts.push(groupGift);
  localStorage.setItem(GROUP_GIFTS_KEY, JSON.stringify(gifts));

  return groupGift;
}

export function getGroupGifts(): GroupGift[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(GROUP_GIFTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function joinGroupGift(
  inviteCode: string,
  contributor: { name: string; email: string; phone?: string },
  amount: number,
  message?: string
): { success: boolean; error?: string; groupGift?: GroupGift } {
  const gifts = getGroupGifts();
  const index = gifts.findIndex((g) => g.inviteCode === inviteCode);

  if (index === -1) return { success: false, error: "Group gift not found" };

  const gg = gifts[index];

  if (gg.status !== "collecting") {
    return { success: false, error: "This group gift is no longer collecting" };
  }

  if (new Date(gg.expiresAt) < new Date()) {
    return { success: false, error: "This group gift has expired" };
  }

  const alreadyJoined = gg.recipients.some(
    (r) => r.email.toLowerCase() === contributor.email.toLowerCase()
  );
  if (alreadyJoined) {
    return { success: false, error: "You have already joined this group gift" };
  }

  gg.recipients.push({
    name: contributor.name,
    email: contributor.email,
    phone: contributor.phone,
    amount,
    paid: false,
    message,
    joinedAt: new Date().toISOString(),
  });

  gifts[index] = gg;
  localStorage.setItem(GROUP_GIFTS_KEY, JSON.stringify(gifts));

  return { success: true, groupGift: gg };
}

export function getTotalCollected(groupGift: GroupGift): number {
  return groupGift.recipients.reduce((sum, r) => sum + r.amount, 0);
}

export function getRemainingAmount(groupGift: GroupGift): number {
  return Math.max(0, groupGift.targetAmount - getTotalCollected(groupGift));
}

export function getGroupGiftProgress(groupGift: GroupGift): number {
  return Math.min(100, Math.round((getTotalCollected(groupGift) / groupGift.targetAmount) * 100));
}

export function generateShareMessage(groupGift: GroupGift): string {
  const remaining = getRemainingAmount(groupGift);
  return `🎁 Join our group gift for ${groupGift.productName}!\n\nWe're raising ${groupGift.targetAmount.toLocaleString()} KSh. ${remaining > 0 ? `${remaining.toLocaleString()} KSh still needed.` : "Goal reached! 🎉"}\n\nUse code: ${groupGift.inviteCode}\n\nJoin here: ${typeof window !== "undefined" ? window.location.origin : ""}/group-gift/${groupGift.inviteCode}`;
}
