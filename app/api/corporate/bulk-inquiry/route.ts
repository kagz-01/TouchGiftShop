import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const recipientSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().optional(),
  note: z.string().optional(),
});

const inquirySchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  contactPhone: z.string().min(1, "Contact phone is required"),
  contactEmail: z.string().email("Valid email required"),
  giftDescription: z.string().optional(),
  budget: z.string().optional(),
  deliveryDate: z.string().optional(),
  recipients: z.array(recipientSchema).min(1).max(2000),
  notes: z.string().optional(),
});

// Simple HTML email builder (no external template engine needed)
function buildEmailHtml(data: z.infer<typeof inquirySchema>, refCode: string): string {
  const rows = data.recipients
    .slice(0, 10)
    .map(
      (r, i) =>
        `<tr style="background:${i % 2 === 0 ? "#f9f7f4" : "#fff"}">
          <td style="padding:6px 12px;border:1px solid #e5e0d8">${r.name}</td>
          <td style="padding:6px 12px;border:1px solid #e5e0d8">${r.phone}</td>
          <td style="padding:6px 12px;border:1px solid #e5e0d8">${r.address || "—"}</td>
          <td style="padding:6px 12px;border:1px solid #e5e0d8">${r.note || "—"}</td>
        </tr>`
    )
    .join("");

  const more = data.recipients.length > 10
    ? `<p style="color:#9b1b5a;font-style:italic">…and ${data.recipients.length - 10} more recipients in full dataset</p>`
    : "";

  return `
<!DOCTYPE html>
<html>
<body style="font-family:Inter,sans-serif;background:#faf8f5;margin:0;padding:24px">
  <div style="max-width:680px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07)">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#9b1b5a,#d4af37);padding:32px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700">🎁 New Corporate Bulk Order</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">Ref: <strong>${refCode}</strong></p>
    </div>

    <!-- Body -->
    <div style="padding:32px">
      
      <h2 style="color:#14080d;font-size:18px;margin:0 0 16px">Company Details</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:8px;color:#666;width:40%">Company</td><td style="padding:8px;font-weight:600;color:#14080d">${data.companyName}</td></tr>
        <tr style="background:#faf8f5"><td style="padding:8px;color:#666">Contact</td><td style="padding:8px;font-weight:600;color:#14080d">${data.contactName}</td></tr>
        <tr><td style="padding:8px;color:#666">Phone</td><td style="padding:8px;font-weight:600;color:#14080d"><a href="tel:${data.contactPhone}" style="color:#9b1b5a">${data.contactPhone}</a></td></tr>
        <tr style="background:#faf8f5"><td style="padding:8px;color:#666">Email</td><td style="padding:8px;font-weight:600;color:#14080d"><a href="mailto:${data.contactEmail}" style="color:#9b1b5a">${data.contactEmail}</a></td></tr>
        <tr><td style="padding:8px;color:#666">Budget</td><td style="padding:8px;font-weight:600;color:#14080d">${data.budget || "Not specified"}</td></tr>
        <tr style="background:#faf8f5"><td style="padding:8px;color:#666">Delivery by</td><td style="padding:8px;font-weight:600;color:#14080d">${data.deliveryDate || "Flexible"}</td></tr>
        <tr><td style="padding:8px;color:#666">Total Recipients</td><td style="padding:8px;font-weight:700;color:#9b1b5a;font-size:18px">${data.recipients.length}</td></tr>
      </table>

      ${data.giftDescription ? `<div style="background:#faf8f5;border-left:4px solid #d4af37;padding:16px;border-radius:8px;margin-bottom:24px"><p style="margin:0;color:#14080d"><strong>Gift requested:</strong> ${data.giftDescription}</p></div>` : ""}
      
      ${data.notes ? `<div style="background:#faf8f5;border-left:4px solid #9b1b5a;padding:16px;border-radius:8px;margin-bottom:24px"><p style="margin:0;color:#14080d"><strong>Notes:</strong> ${data.notes}</p></div>` : ""}

      <h2 style="color:#14080d;font-size:18px;margin:0 0 12px">Recipients (preview)</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:8px">
        <thead>
          <tr style="background:#9b1b5a">
            <th style="padding:8px 12px;color:#fff;text-align:left;border:1px solid #7a1447">Name</th>
            <th style="padding:8px 12px;color:#fff;text-align:left;border:1px solid #7a1447">Phone</th>
            <th style="padding:8px 12px;color:#fff;text-align:left;border:1px solid #7a1447">Address</th>
            <th style="padding:8px 12px;color:#fff;text-align:left;border:1px solid #7a1447">Note</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      ${more}

      <!-- CTA -->
      <div style="margin-top:32px;text-align:center">
        <a href="https://wa.me/254142677898?text=Hi%21+I%27m+following+up+on+corporate+inquiry+${refCode}+from+${encodeURIComponent(data.companyName)}" 
           style="display:inline-block;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;padding:14px 32px;border-radius:100px;text-decoration:none;font-weight:700;font-size:15px">
          💬 Reply via WhatsApp
        </a>
        <p style="color:#999;font-size:12px;margin-top:12px">Or call: ${data.contactPhone}</p>
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#14080d;padding:20px;text-align:center">
      <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0">TouchGift Shop · touchgiftshop.co.ke · +254 142 677 898</p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = inquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const refCode = `CORP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // 1. Save to Supabase corporate_inquiries table
    const { data: inquiry, error: dbError } = await supabase
      .from("corporate_inquiries")
      .insert({
        ref_code: refCode,
        company_name: data.companyName,
        contact_name: data.contactName,
        contact_phone: data.contactPhone,
        contact_email: data.contactEmail,
        gift_description: data.giftDescription || null,
        budget: data.budget || null,
        delivery_date: data.deliveryDate || null,
        notes: data.notes || null,
        recipient_count: data.recipients.length,
        recipients: data.recipients,
        status: "new",
      })
      .select("id")
      .single();

    if (dbError) {
      // Table might not exist yet — still send notification, don't hard fail
      console.warn("corporate_inquiries insert error:", dbError.message);
    }

    // 2. Send email notification via Resend (if API key configured)
    const resendKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL || "hello@touchgiftshop.co.ke";

    if (resendKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      await resend.emails.send({
        from: "TouchGift Corporate <noreply@touchgiftshop.co.ke>",
        to: [notifyEmail],
        replyTo: data.contactEmail,
        subject: `🎁 New Corporate Inquiry: ${data.companyName} — ${data.recipients.length} recipients [${refCode}]`,
        html: buildEmailHtml(data, refCode),
      });

      // Also send confirmation email to the client
      await resend.emails.send({
        from: "TouchGift Shop <noreply@touchgiftshop.co.ke>",
        to: [data.contactEmail],
        subject: `We received your corporate gifting request [${refCode}]`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px">
            <h2 style="color:#9b1b5a">Thank you, ${data.contactName}! 🎁</h2>
            <p>We've received your corporate gifting request for <strong>${data.companyName}</strong> covering <strong>${data.recipients.length} recipients</strong>.</p>
            <p>Your reference code is: <strong style="color:#9b1b5a">${refCode}</strong></p>
            <p>Our team will reach out within <strong>2 business hours</strong> to discuss curation, pricing, and scheduling.</p>
            <p>For urgent matters, WhatsApp us directly:<br>
              <a href="https://wa.me/254142677898?text=Hi%21+Ref+${refCode}" style="color:#25D366;font-weight:700">+254 142 677 898</a>
            </p>
            <hr style="margin:24px 0;border:none;border-top:1px solid #e5e0d8">
            <p style="color:#999;font-size:12px">TouchGift Shop · touchgiftshop.co.ke</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      refCode,
      inquiryId: inquiry?.id || null,
      recipientCount: data.recipients.length,
      message: "Your inquiry has been submitted. Our team will contact you within 2 business hours.",
    });
  } catch (error) {
    console.error("Corporate inquiry error:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry. Please try WhatsApp." },
      { status: 500 }
    );
  }
}
