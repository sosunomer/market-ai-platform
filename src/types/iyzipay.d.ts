declare module "iyzipay" {
  interface IyzipayConfig {
    apiKey: string;
    secretKey: string;
    uri: string;
  }

  interface CheckoutFormInitialize {
    create(
      request: Record<string, unknown>,
      callback: (err: Error | null, result: { checkoutFormContent: string }) => void
    ): void;
  }

  class Iyzipay {
    constructor(config: IyzipayConfig);
    checkoutFormInitialize: CheckoutFormInitialize;
  }

  export = Iyzipay;
}
