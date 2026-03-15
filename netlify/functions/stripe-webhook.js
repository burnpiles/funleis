import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

// ── HELPERS ───────────────────────────────────────────────────────────────────
const PICKUP_ZIP = "98391";

function mailer() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_FROM,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

function fmtMoney(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function fulfillmentLabel(fulfillment) {
  return fulfillment === "pickup"
    ? `📍 Local Pickup (${PICKUP_ZIP})`
    : "🚚 USPS Shipping";
}

function orderSummaryText(order) {
  const d = order.design || {};
  const c = order.contact || {};
  const lines = [
    `Type: ${order.type === "lei" ? "Lei" : "Button"} Order`,
    `Fulfillment: ${fulfillmentLabel(order.fulfillment)}`,
    `Status: ${order.status}`,
    `Total: $${(order.total || 0).toFixed(2)}`,
    ``,
    `── Contact ──`,
    `Name: ${c.parentName || c.name || "—"}`,
    `Email: ${c.email || "—"}`,
    `Phone: ${c.phone || "—"}`,
  ];
  if (order.type === "lei") {
    lines.push(`Recipient: ${c.recipientName || "—"}`);
  }
  if (c.shippingAddress) {
    lines.push(`Address: ${c.shippingAddress}`);
  }
  if (c.notes) {
    lines.push(`Notes: ${c.notes}`);
  }
  lines.push(``, `── Design ──`);
  if (order.type === "lei") {
    lines.push(`Lei Type: ${d.leiTier || "—"}`);
    lines.push(`Colors: ${(d.colors || []).join(", ") || "—"}`);
    if (d.occasion) lines.push(`Occasion: ${d.occasion}`);
    if (d.customText) lines.push(`Custom Text: "${d.customText}"`);
    if (d.wantsButton) lines.push(`Button Add-on: "${d.buttonText}"`);
  } else {
    lines.push(`Button Text: "${d.buttonText || "—"}"`);
    lines.push(`Quantity: ${d.quantity || 1}`);
  }
  lines.push(``, `Order ID: ${order.id}`);
  lines.push(`Submitted: ${new Date(order.submitted_at || order.submittedAt).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} PT`);
  return lines.join("\n");
}

// ── SEND EMAILS ───────────────────────────────────────────────────────────────
async function sendPaymentConfirmedEmails(order, customerEmail) {
  const transport = mailer();
  const adminEmail = process.env.GMAIL_FROM;
  const isPaid = order.status === "paid";
  const isFailed = order.status === "payment_failed";
  const isAbandoned = order.status === "payment_abandoned";

  const fulfillLabel = fulfillmentLabel(order.fulfillment);
  const c = order.contact || {};
  const customerName = c.parentName || c.name || "Customer";

  // ── Admin email ──
  let adminSubject, adminBody;
  if (isPaid) {
    adminSubject = `💰 New Paid Order — ${c.recipientName || customerName} (${order.type})`;
    adminBody = `A payment was confirmed on buttonsandleis.com!\n\n${orderSummaryText(order)}\n\nView orders: https://buttonsandleis.com/#admin`;
  } else if (isFailed) {
    adminSubject = `🚨 Payment Failed — ${customerName} (${order.type})`;
    adminBody = `A payment attempt FAILED on buttonsandleis.com.\n\n${orderSummaryText(order)}\n\nYou may want to follow up with the customer.\n\nView orders: https://buttonsandleis.com/#admin`;
  } else if (isAbandoned) {
    adminSubject = `⚠️ Abandoned Cart — ${customerName} (${order.type})`;
    adminBody = `A customer started checkout but did NOT complete payment.\n\n${orderSummaryText(order)}\n\nYou may want to follow up with the customer.\n\nView orders: https://buttonsandleis.com/#admin`;
  }

  if (adminSubject && adminEmail) {
    await transport.sendMail({
      from: `"Buttons & Leis" <${adminEmail}>`,
      to: adminEmail,
      subject: adminSubject,
      text: adminBody,
    }).catch(err => console.error("Admin email error:", err));
  }

  // ── Customer confirmation email (only for successful payment) ──
  if (isPaid && customerEmail) {
    let customerBody;
    if (order.fulfillment === "pickup") {
      customerBody = `Hi ${customerName}!\n\nYour payment was received — thank you! 🌺\n\nYour order is confirmed for LOCAL PICKUP in the ${PICKUP_ZIP} area. We will reach out to you at ${customerEmail} with pickup details once your order is ready.\n\n${orderSummaryText(order)}\n\n— Buttons & Leis\nbuttonsandleis@gmail.com`;
    } else {
      customerBody = `Hi ${customerName}!\n\nYour payment was received — thank you! 🌺\n\nYour order is confirmed and will ship via USPS to the address provided. We will reach out to you at ${customerEmail} with tracking information once shipped.\n\n${orderSummaryText(order)}\n\n— Buttons & Leis\nbuttonsandleis@gmail.com`;
    }
    await transport.sendMail({
      from: `"Buttons & Leis" <${adminEmail}>`,
      to: customerEmail,
      subject: `✅ Your Buttons & Leis order is confirmed!`,
      text: customerBody,
    }).catch(err => console.error("Customer email error:", err));
  }
}

// ── WEBHOOK HANDLER ───────────────────────────────────────────────────────────
export default async (req) => {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const session = event.data.object;

  // Parse orderId and fulfillment from client_reference_id (format: "uuid__pickup" or "uuid__shipping")
  const ref = session.client_reference_id || "";
  const [orderId, fulfillment] = ref.includes("__") ? ref.split("__") : [ref, "shipping"];

  if (!orderId) {
    console.log("No client_reference_id in session, skipping.");
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  let newStatus, paidAt;
  if (event.type === "checkout.session.completed") {
    newStatus = "paid";
    paidAt = new Date().toISOString();
  } else if (event.type === "checkout.session.expired") {
    newStatus = "payment_abandoned";
  } else if (event.type === "payment_intent.payment_failed") {
    newStatus = "payment_failed";
  } else {
    // Unhandled event type
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Update order in Supabase
  const updatePayload = {
    status: newStatus,
    fulfillment: fulfillment || "shipping",
    ...(paidAt ? { paid_at: paidAt } : {}),
    ...(event.type === "checkout.session.completed" ? { stripe_session_id: session.id } : {}),
  };

  const { data: order, error } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    console.error("Supabase update error:", error);
  }

  // Send emails
  if (order) {
    const customerEmail =
      session.customer_details?.email ||
      order.contact?.email ||
      null;
    await sendPaymentConfirmedEmails(order, customerEmail);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const config = { path: "/api/stripe-webhook" };
