import { razorpay, verifyPaymentSignature } from "~/lib/razorpay.server";
import { db } from "~/lib/db.server";
import { wasteEvents } from "~/lib/schema.server";
import { getMoneyTypeKey } from "~/lib/utils";
import type { Route } from "./+types/burn-verify";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return Response.json(
      { error: "Missing payment details" },
      { status: 400 }
    );
  }

  // Verify signature
  const isValid = verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    console.error("Payment signature verification failed:", razorpay_order_id);
    return Response.json(
      { success: false, error: "Signature verification failed" },
      { status: 400 }
    );
  }

  // Fetch order to get notes (method, nickname, message) and amount
  try {
    const order = await razorpay.orders.fetch(razorpay_order_id);

    const amount = Number(order.amount) / 100; // paise → INR
    const method = getMoneyTypeKey(amount);
    const nickname =
      (order.notes as Record<string, string>)?.nickname || null;
    const message =
      (order.notes as Record<string, string>)?.message || null;

    // Insert waste event
    const result = db
      .insert(wasteEvents)
      .values({
        amount,
        method,
        nickname: nickname || null,
        message: message || null,
      })
      .returning({ id: wasteEvents.id })
      .get();

    return Response.json({ success: true, eventId: result.id });
  } catch (e) {
    console.error("Failed to process verified payment:", e);
    return Response.json(
      { success: false, error: "Failed to record waste event" },
      { status: 500 }
    );
  }
}
