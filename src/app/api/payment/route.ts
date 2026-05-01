import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/clerk";

export async function POST(request: Request) {
  try {
    const userId = await requireAuth();
    const body = (await request.json()) as {
      provider: "stripe" | "iyzico";
      plan: string;
    };

    if (!body.provider || !body.plan) {
      return NextResponse.json(
        { success: false, error: "Provider ve plan gereklidir." },
        { status: 400 }
      );
    }

    // TODO: Stripe veya iyzico checkout oturumu oluştur
    return NextResponse.json({
      success: true,
      data: {
        userId,
        provider: body.provider,
        plan: body.plan,
        checkoutUrl: "#",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Ödeme işlemi başlatılamadı." },
      { status: 500 }
    );
  }
}
