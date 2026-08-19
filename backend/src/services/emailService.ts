import { Resend } from "resend";
import { env } from "../config/env";
import { OrderStatus } from "@prisma/client";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export const sendStatusNotification = async (
  email: string,
  orderNumber: string,
  status: OrderStatus,
  details?: string,
) => {
  if (!resend) {
    console.warn(
      `Resend API key missing. Mock sending email to ${email} for order ${orderNumber} - Status: ${status}`,
    );
    return;
  }

  const subjectMap: Record<OrderStatus, string> = {
    CREATED: `Order ${orderNumber} Created`,
    CONFIRMED: `Order ${orderNumber} Confirmed`,
    ASSIGNED: `Agent Assigned to Order ${orderNumber}`,
    PICKED_UP: `Order ${orderNumber} Picked Up`,
    IN_TRANSIT: `Order ${orderNumber} In Transit`,
    OUT_FOR_DELIVERY: `Order ${orderNumber} Out for Delivery`,
    DELIVERED: `Order ${orderNumber} Delivered Successfully`,
    FAILED: `Delivery Attempt Failed for Order ${orderNumber}`,
    RESCHEDULED: `Order ${orderNumber} Rescheduled`,
  };

  const subject = subjectMap[status] || `Order ${orderNumber} Update`;
  let html = `<p>Your order <strong>${orderNumber}</strong> has been updated to <strong>${status}</strong>.</p>`;

  if (details) {
    html += `<p>Details: ${details}</p>`;
  }

  try {
    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL || "ParcelOS <onboarding@resend.dev>",
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email notification:", error);
  }
};
