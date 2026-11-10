import {
  ParsedReceipt,
  ReceiptProviderId,
} from "@/app/domain/entity/receipt/receipt.entity";

export type ReceiptProviderErrorCode =
  | "INVALID_QR"
  | "UNSUPPORTED_STATE"
  | "UNAVAILABLE"
  | "NOT_FOUND"
  | "CANCELLED"
  | "PARSE_FAILED";

export class ReceiptProviderError extends Error {
  constructor(
    public readonly code: ReceiptProviderErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ReceiptProviderError";
  }
}

export interface ReceiptProvider {
  readonly id: ReceiptProviderId;
  supports(state: string): boolean;
  parse(qrCodeUrl: string): Promise<ParsedReceipt>;
}
