import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token: string;
      status: string;
    };

    // TODO: iyzico ödeme sonucunu doğrula ve işle
    console.log("iyzico webhook alındı:", body.token);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "iyzico webhook işlenemedi." },
      { status: 500 }
    );
  }
}
