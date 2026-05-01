import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      type: string;
      data: Record<string, unknown>;
    };

    switch (body.type) {
      case "user.created":
        // TODO: Supabase'de kullanıcı profili oluştur
        break;
      case "user.updated":
        // TODO: Supabase'deki profili güncelle
        break;
      case "user.deleted":
        // TODO: Supabase'den kullanıcıyı sil
        break;
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Webhook işlenemedi." },
      { status: 500 }
    );
  }
}
