import Iyzipay from "iyzipay";
import type { SubscriptionPlan } from "@/types";

/**
 * iyzico yapılandırması.
 */
function getIyzicoClient() {
  return new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY ?? "",
    secretKey: process.env.IYZICO_SECRET_KEY ?? "",
    uri: process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com",
  });
}

/**
 * iyzico ile ödeme başlatır.
 */
export async function createPayment(params: {
  userId: string;
  email: string;
  plan: SubscriptionPlan;
  amount: number;
  callbackUrl: string;
}): Promise<{ paymentPageUrl: string }> {
  const iyzipay = getIyzicoClient();

  return new Promise((resolve, reject) => {
    const request = {
      locale: "tr",
      conversationId: params.userId,
      price: params.amount.toString(),
      paidPrice: params.amount.toString(),
      currency: "TRY" as const,
      basketId: `plan_${params.plan}_${Date.now()}`,
      paymentGroup: "PRODUCT" as const,
      callbackUrl: params.callbackUrl,
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: params.userId,
        email: params.email,
        name: "Market",
        surname: "User",
        identityNumber: "00000000000",
        registrationAddress: "Istanbul, Turkey",
        city: "Istanbul",
        country: "Turkey",
        ip: "127.0.0.1",
      },
      basketItems: [
        {
          id: `plan_${params.plan}`,
          name: `${params.plan} Plan`,
          category1: "Subscription",
          itemType: "VIRTUAL" as const,
          price: params.amount.toString(),
        },
      ],
    };

    iyzipay.checkoutFormInitialize.create(
      request,
      (err: Error | null, result: { checkoutFormContent: string }) => {
        if (err) return reject(err);
        resolve({ paymentPageUrl: result.checkoutFormContent });
      }
    );
  });
}
