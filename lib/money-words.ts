const SMALL = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];

const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function under100(n: number): string {
  if (n < 20) return SMALL[n] ?? "Zero";
  const t = Math.floor(n / 10);
  const r = n % 10;
  return r ? `${TENS[t]} ${SMALL[r]}` : (TENS[t] ?? "");
}

function chunk(n: number): string {
  if (n < 100) return under100(n);
  const h = Math.floor(n / 100);
  const r = n % 100;
  const head = `${SMALL[h]} Hundred`;
  return r ? `${head} ${under100(r)}` : head;
}

function shillingsToWords(n: number): string {
  if (n === 0) return "Zero";
  const scales = [
    { v: 1_000_000_000, name: "Billion" },
    { v: 1_000_000, name: "Million" },
    { v: 1_000, name: "Thousand" },
  ];
  let rest = n;
  const parts: string[] = [];
  for (const s of scales) {
    if (rest >= s.v) {
      const q = Math.floor(rest / s.v);
      rest -= q * s.v;
      parts.push(`${chunk(q)} ${s.name}`);
    }
  }
  if (rest) {
    if (parts.length && rest < 100) parts.push(`and ${under100(rest)}`);
    else parts.push(chunk(rest));
  }
  return parts.join(" ");
}

/**
 * Turns an amount into formal legal Kenyan legal phrasing:
 * e.g. amountInWords(125000) -> "Kenya Shillings One Hundred Twenty-Five Thousand Only"
 */
export function amountInWords(amountKes: number): string {
  const neg = amountKes < 0;
  const abs = Math.abs(amountKes);
  const shillings = Math.floor(abs);
  const cents = Math.round((abs - shillings) * 100);
  let phrase = `Kenya Shillings ${shillingsToWords(shillings)}`;
  if (cents > 0) phrase += ` and ${under100(cents)} ${cents === 1 ? "Cent" : "Cents"}`;
  phrase += " Only";
  return neg ? `Negative ${phrase}` : phrase;
}

