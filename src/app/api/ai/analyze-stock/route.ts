import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/clerk";
import {
  analyzeStockWithAI,
  type StockAnalysisInput,
} from "@/lib/ai/analyze-stock";

export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = (await request.json()) as StockAnalysisInput;

    // Doğrulama
    if (!body.symbol || typeof body.symbol !== "string") {
      return NextResponse.json(
        { success: false, error: "Hisse sembolü gereklidir." },
        { status: 400 }
      );
    }

    if (typeof body.currentPrice !== "number" || body.currentPrice <= 0) {
      return NextResponse.json(
        { success: false, error: "Geçerli bir fiyat girilmelidir." },
        { status: 400 }
      );
    }

    const result = await analyzeStockWithAI({
      symbol: body.symbol,
      currentPrice: body.currentPrice,
      userAvgCost: body.userAvgCost,
      newsItems: body.newsItems,
      technicalData: body.technicalData,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Hisse analizi oluşturulamadı.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
