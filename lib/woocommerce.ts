/**
 * WooCommerce REST API client.
 *
 * WooCommerce here is a private data-entry backend only — staff add/edit
 * products in wp-admin exactly like normal. Nothing about checkout, orders,
 * or payments touches WooCommerce; those stay on the TouchGift/Supabase
 * side (see lib/mpesa.ts, app/api/orders).
 *
 * Docs: https://woocommerce.github.io/woocommerce-rest-api-docs/
 */

const WC_URL = process.env.WOOCOMMERCE_URL!;
const AUTH = Buffer.from(
  `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
).toString("base64");

async function wcFetch(path: string) {
  const res = await fetch(`${WC_URL}/wp-json/wc/v3/${path}`, {
    headers: { Authorization: `Basic ${AUTH}` },
  });
  if (!res.ok) {
    throw new Error(`WooCommerce API error (${path}): ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export interface WcCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WcProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  images: { src: string }[];
  stock_status: "instock" | "outofstock" | "onbackorder";
  categories: WcCategory[];
}

/** Fetches all products, paginating through WooCommerce's 100-per-page cap. */
export async function fetchAllWcProducts(): Promise<WcProduct[]> {
  const all: WcProduct[] = [];
  let page = 1;
  while (true) {
    const batch: WcProduct[] = await wcFetch(
      `products?per_page=100&page=${page}&status=publish`
    );
    if (batch.length === 0) break;
    all.push(...batch);
    page++;
  }
  return all;
}

export async function fetchWcProduct(id: number): Promise<WcProduct> {
  return wcFetch(`products/${id}`);
}
