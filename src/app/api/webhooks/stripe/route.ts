import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Stripe imzası eksik." },
        { status: 400 }
      );
    }

    // TODO: constructWebhookEvent ile doğrula ve işle
    console.log("Stripe webhook alındı:", body.substring(0, 100));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Stripe webhook işlenemedi." },
      { status: 500 }
    );
  }
}
