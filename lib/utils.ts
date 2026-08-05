export function formatKsh(amount: number): string {
  return `KSh ${amount.toLocaleString("en-KE")}`;
}

export function isSameDayCutoffPassed(cutoffHour = 14): boolean {
  return new Date().getHours() >= cutoffHour;
}
