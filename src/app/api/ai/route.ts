import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/clerk";
import { chat } from "@/lib/ai/claude";

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = (await request.json()) as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!body.messages || body.messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Mesaj listesi boş olamaz." },
        { status: 400 }
      );
    }

    const response = await chat(body.messages);

    return NextResponse.json({
      success: true,
      data: {
        role: "assistant" as const,
        content: response,
        createdAt: new Date(),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "AI yanıtı oluşturulamadı." },
      { status: 500 }
    );
  }
}
