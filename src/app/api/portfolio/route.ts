import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/clerk";

export async function GET() {
  try {
    const userId = await requireAuth();

    // TODO: Supabase'den portföy verilerini çek
    return NextResponse.json({
      success: true,
      data: {
        userId,
        portfolios: [],
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
      name: string;
      description?: string;
      currency?: string;
    };

    // TODO: Supabase'e portföy ekle
    return NextResponse.json({
      success: true,
      data: {
        id: crypto.randomUUID(),
        userId,
        name: body.name,
        description: body.description ?? null,
        currency: body.currency ?? "TRY",
        createdAt: new Date(),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Portföy oluşturulamadı." },
      { status: 500 }
    );
  }
}
