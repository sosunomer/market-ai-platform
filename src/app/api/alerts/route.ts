import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/clerk";

export async function GET() {
  try {
    const userId = await requireAuth();

    // TODO: Supabase'den uyarıları çek
    return NextResponse.json({
      success: true,
      data: {
        userId,
        alerts: [],
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Kimlik doğrulama gerekli." },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireAuth();
    const body = (await request.json()) as {
      symbol: string;
      type: string;
      condition: string;
      targetValue: number;
      channels: string[];
    };

    // TODO: Supabase'e uyarı ekle
    return NextResponse.json({
      success: true,
      data: {
        id: crypto.randomUUID(),
        userId,
        ...body,
        status: "active",
        createdAt: new Date(),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Uyarı oluşturulamadı." },
      { status: 500 }
    );
  }
}
