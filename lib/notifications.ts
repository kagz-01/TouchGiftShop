import fetch from "node-fetch";

export async function sendEmail(to: string, subject: string, html: string, text?: string) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn("SendGrid not configured; skipping email to", to);
    return { success: false, reason: "sendgrid_not_configured" };
  }

  const body = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: from },
    subject,
    content: [
      { type: "text/plain", value: text || "" },
      { type: "text/html", value: html },
    ],
  };

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("SendGrid send failed:", res.status, txt);
    return { success: false, reason: "sendgrid_failed", status: res.status, detail: txt };
  }

  return { success: true };
}

export async function sendSms(to: string, message: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !from) {
    console.warn("Twilio SMS not configured; skipping SMS to", to);
    return { success: false, reason: "twilio_not_configured" };
  }

  const params = new URLSearchParams();
  params.append("To", to);
  params.append("From", from);
  params.append("Body", message);

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}` },
    body: params,
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Twilio SMS failed:", data);
    return { success: false, reason: "twilio_failed", detail: data };
  }

  return { success: true, sid: data.sid };
}

export async function sendWhatsApp(to: string, message: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+1415XXX
  if (!sid || !token || !from) {
    console.warn("Twilio WhatsApp not configured; skipping WhatsApp to", to);
    return { success: false, reason: "whatsapp_not_configured" };
  }

  const params = new URLSearchParams();
  params.append("To", `whatsapp:${to}`);
  params.append("From", from);
  params.append("Body", message);

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}` },
    body: params,
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Twilio WhatsApp failed:", data);
    return { success: false, reason: "twilio_whatsapp_failed", detail: data };
  }

  return { success: true, sid: data.sid };
}

export async function deliverGiftCard(options: {
  code: string;
  recipientPhone?: string | null;
  recipientEmail?: string | null;
  recipientName?: string | null;
  senderName?: string | null;
  alias?: string | null;
  message?: string | null;
  methods: string[]; // e.g. ["email","sms","whatsapp"]
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";
  const viewUrl = `${siteUrl}/gift-cards/view/${encodeURIComponent(options.code)}`;
  const fromLabel = options.senderName ? options.senderName : options.alias ? options.alias : "A friend";

  const text = `You've received a KSh gift card from ${fromLabel}!\n\nMessage: ${options.message || ""}\n\nOpen your card: ${viewUrl}`;
  const html = `<p>You've received a <strong>KSh gift card</strong> from ${fromLabel}!</p><p>${options.message || ""}</p><p><a href="${viewUrl}">Open your card</a></p>`;

  const results: Record<string, any> = {};

  for (const m of options.methods) {
    if (m === "email" && options.recipientEmail) {
      results.email = await sendEmail(options.recipientEmail, "You've received a TouchGift gift card", html, text);
    }
    if (m === "sms" && options.recipientPhone) {
      // Ensure phone is in +254 format
      const phone = options.recipientPhone.replace(/[^0-9+]/g, "");
      results.sms = await sendSms(phone, text);
    }
    if (m === "whatsapp" && options.recipientPhone) {
      const phone = options.recipientPhone.replace(/[^0-9+]/g, "");
      results.whatsapp = await sendWhatsApp(phone, text);
    }
  }

  return { success: true, results };
}
