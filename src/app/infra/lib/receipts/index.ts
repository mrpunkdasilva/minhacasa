import { ReceiptProvider } from "./receipt-provider";
import { SpSefazProvider } from "./sp-sefaz.provider";

const providers: ReceiptProvider[] = [new SpSefazProvider()];

export function getReceiptProvider(state: string): ReceiptProvider | null {
  return providers.find((provider) => provider.supports(state)) ?? null;
}

export { ReceiptProviderError } from "./receipt-provider";
export type {
  ReceiptProvider,
  ReceiptProviderErrorCode,
} from "./receipt-provider";
