// Simple in-memory mock payment store for local development/testing only.
// Keys are trackingId strings, values are { status, receiptNumber?, amount? }
const store = new Map<string, { status: string; receiptNumber?: string; amount?: number }>();

export function setMockPayment(trackingId: string, payload: { status: string; receiptNumber?: string; amount?: number }) {
  store.set(trackingId, payload);
}

export function getMockPayment(trackingId: string) {
  return store.get(trackingId) ?? null;
}

export function deleteMockPayment(trackingId: string) {
  store.delete(trackingId);
}

export function listMockPayments() {
  return Array.from(store.entries()).map(([k, v]) => ({ trackingId: k, ...v }));
}
