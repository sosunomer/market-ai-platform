import { NextResponse } from "next/server";

const FINNHUB_BASE = "https://finnhub.io/api/v1";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { success: false, error: "Symbol parametresi gereklidir." },
      { status: 400 }
    );
  }

  try {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Finnhub API key yapılandırılmamış." },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${FINNHUB_BASE}/quote?symbol=${symbol}&token=${apiKey}`,
      { next: { revalidate: 15 } }
    );

    const data = (await response.json()) as Record<string, number>;

    return NextResponse.json({
      success: true,
      data: {
        symbol,
        currentPrice: data.c,
        change: data.d,
        changePercent: data.dp,
        high: data.h,
        low: data.l,
        open: data.o,
        previousClose: data.pc,
        timestamp: data.t,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Hisse verisi alınamadı." },
      { status: 500 }
    );
  }
}
