import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/clerk";
import {
  analyzeNewsWithAI,
  type NewsAnalysisInput,
} from "@/lib/ai/analyze-news";

export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = (await request.json()) as NewsAnalysisInput;

    // Doğrulama
    if (!body.newsText || typeof body.newsText !== "string") {
      return NextResponse.json(
        { success: false, error: "Haber metni gereklidir." },
        { status: 400 }
      );
    }

    if (body.newsText.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Haber metni en az 10 karakter olmalıdır.",
        },
        { status: 400 }
      );
    }

    const result = await analyzeNewsWithAI({
      newsText: body.newsText,
      politicianName: body.politicianName,
      relatedStocks: body.relatedStocks,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Haber analizi oluşturulamadı.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
