import nodemailer from "nodemailer";

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

const STATUS_MESSAGES = {
  making: {
    subject: "🔨 Your Buttons & Leis order is being made!",
    body: (name, order) =>
      `Hi ${name}!\n\nGreat news — we've started working on your order! 🌺\n\nWe'll be in touch once it's ready.\n\n— Buttons & Leis\nbuttonsandleis@gmail.com`,
  },
  ready: {
    subject: "📦 Your Buttons & Leis order is ready!",
    body: (name, order) =>
      order.fulfillment === "pickup"
        ? `Hi ${name}!\n\nYour order is READY FOR PICKUP in the ${PICKUP_ZIP} area! 🎉\n\nWe will reach out to arrange a convenient pickup time and location.\n\n— Buttons & Leis\nbuttonsandleis@gmail.com`
        : `Hi ${name}!\n\nYour order has been SHIPPED via USPS! 📦🌺\n\nPlease allow a few days for delivery. We will follow up with any tracking information.\n\n— Buttons & Leis\nbuttonsandleis@gmail.com`,
  },
  delivered: {
    subject: "✅ Delivered — Thank you for your order!",
    body: (name, order) =>
      `Hi ${name}!\n\nWe hope you love your Buttons & Leis order! 🌺 Thank you for choosing us — we'd love to make something special for you again.\n\n— Buttons & Leis\nbuttonsandleis@gmail.com`,
  },
};

export default async (req) => {
  // Simple auth check using a shared secret
  const authHeader = req.headers.get("x-admin-secret");
  if (authHeader !== process.env.ADMIN_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { status, order } = await req.json();

  const msg = STATUS_MESSAGES[status];
  if (!msg) {
    return new Response(JSON.stringify({ sent: false, reason: "No email for this status" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const c = order.contact || {};
  const customerName = c.parentName || c.name || "there";
  const customerEmail = c.email;

  if (!customerEmail) {
    return new Response(JSON.stringify({ sent: false, reason: "No customer email" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const adminEmail = process.env.GMAIL_FROM;
  const transport = mailer();

  await transport.sendMail({
    from: `"Buttons & Leis" <${adminEmail}>`,
    to: customerEmail,
    subject: msg.subject,
    text: msg.body(customerName, order),
  });

  return new Response(JSON.stringify({ sent: true }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const config = { path: "/api/send-status-email" };
