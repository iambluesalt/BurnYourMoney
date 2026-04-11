import { redirect } from "react-router";
import { verifyPaymentSignature } from "~/lib/razorpay.server";
import { insertBurnEvent } from "~/lib/queries.server";

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();

  const paymentId = String(formData.get("paymentId"));
  const orderId   = String(formData.get("orderId"));
  const signature = String(formData.get("signature"));
  const amount    = Number(formData.get("amount"));
  const method    = String(formData.get("method"));
  const nickname  = String(formData.get("nickname") ?? "").trim() || null;
  const message   = String(formData.get("message")  ?? "").trim() || null;

  const isValid = verifyPaymentSignature(orderId, paymentId, signature);
  if (!isValid) {
    throw new Response("Payment verification failed", { status: 400 });
  }

  const event = await insertBurnEvent({ amount, method, nickname, message });

  const params = new URLSearchParams({
    id:       String(event.id),
    amount:   String(event.amount),
    nickname: event.nickname ?? "",
    message:  event.message  ?? "",
    method:   event.method,
  });

  return redirect(`/burn/success?${params.toString()}`);
}

// Pure action route — no UI
export default function BurnVerify() {
  return null;
}
