"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { userRepository } from "@/app/infra/lib/user.repository";
import { receiptRepository } from "@/app/infra/lib/receipt.repository";
import { marketRepository } from "@/app/infra/lib/market.repository";
import { getReceiptProvider } from "@/app/infra/lib/receipts";
import {
  ReceiptProviderError,
  ReceiptProviderErrorCode,
} from "@/app/infra/lib/receipts/receipt-provider";
import {
  extractAccessKeyFromQrContent,
  getStateFromAccessKey,
  isValidAccessKey,
  normalizeProductName,
} from "@/app/infra/lib/receipts/normalize";
import {
  ParsedReceipt,
  ReceiptEntity,
  ReceiptItem,
} from "@/app/domain/entity/receipt/receipt.entity";
import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { Category } from "@/app/domain/enums/category/category";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import {
  MarketCategory,
  MarketUnit,
} from "@/app/domain/enums/market-category/market-category";
import { MarketItem } from "@/app/domain/entity/market/market-item.entity";
import { getDb } from "@/app/infra/lib/mongodb";
import logger from "@/app/infra/lib/logger";

const MARKET_ROUTES = [
  "/market/analysis",
  "/market/shopping-list",
  "/market/inventory",
  "/market/receipts",
] as const;

const PARSE_CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_PARSES_PER_HOUR = 30;

const parsedReceiptCache = new Map<
  string,
  { receipt: ParsedReceipt; expiresAt: number }
>();

interface ActionResult {
  success: boolean;
  error?: string;
  errorCode?: ReceiptProviderErrorCode;
}

export interface ParseReceiptResult extends ActionResult {
  receipt?: ParsedReceipt;
  existingReceiptId?: string;
}

export interface ImportReceiptInput {
  qrCodeUrl: string;
  accessKey: string;
  selectedItemIds: string[];
  categoryOverrides?: Record<string, string>;
  addToPantry: boolean;
  createInvoice: boolean;
}

export interface ImportReceiptResult extends ActionResult {
  receiptId?: string;
  alreadyImported?: boolean;
}

async function getUserContext() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await userRepository.findByEmail(session.user.email);
  if (!user || !user.houseId) return null;

  return user;
}

function cacheKey(houseId: string, accessKey: string): string {
  return `${houseId}:${accessKey}`;
}

function getCachedReceipt(
  houseId: string,
  accessKey: string,
): ParsedReceipt | null {
  const key = cacheKey(houseId, accessKey);
  const cached = parsedReceiptCache.get(key);
  if (!cached) return null;

  if (cached.expiresAt < Date.now()) {
    parsedReceiptCache.delete(key);
    return null;
  }

  return cached.receipt;
}

function cacheReceipt(houseId: string, receipt: ParsedReceipt): void {
  parsedReceiptCache.set(cacheKey(houseId, receipt.accessKey), {
    receipt,
    expiresAt: Date.now() + PARSE_CACHE_TTL_MS,
  });
}

function extractAccessKey(qrContent: string): string | null {
  const trimmed = qrContent.trim();
  const rawUrl = trimmed.startsWith("http")
    ? trimmed
    : `https://placeholder.local/?${trimmed.replace(/^\?/, "")}`;

  try {
    const url = new URL(rawUrl);
    const p = url.searchParams.get("p");
    if (p) {
      const key = p.split("|")[0].replace(/\D/g, "");
      if (isValidAccessKey(key)) return key;
    }

    const chNFe = url.searchParams.get("chNFe");
    if (chNFe) {
      const key = chNFe.replace(/\D/g, "");
      if (isValidAccessKey(key)) return key;
    }
  } catch {
    // Fall through to the generic extractor.
  }

  return extractAccessKeyFromQrContent(trimmed);
}

function revalidateMarket() {
  for (const route of MARKET_ROUTES) {
    revalidatePath(route);
  }
}

async function parseWithRateLimit(
  houseId: string,
  qrCodeUrl: string,
): Promise<ParsedReceipt> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const attempts = await receiptRepository.countAttemptsSince(
    houseId,
    oneHourAgo,
  );

  if (attempts >= MAX_PARSES_PER_HOUR) {
    throw new ReceiptProviderError(
      "UNAVAILABLE",
      "Muitas consultas de nota fiscal em pouco tempo. Tente novamente mais tarde.",
    );
  }

  await receiptRepository.recordAttempt(houseId);

  const accessKey = extractAccessKey(qrCodeUrl);
  if (!accessKey) {
    throw new ReceiptProviderError(
      "INVALID_QR",
      "Não foi possível identificar a chave de acesso no QR Code.",
    );
  }

  const state = getStateFromAccessKey(accessKey);
  const provider = state ? getReceiptProvider(state) : null;

  if (!provider) {
    throw new ReceiptProviderError(
      "UNSUPPORTED_STATE",
      `Ainda não importamos notas de ${state ?? "outro estado"}. No momento, apenas São Paulo é suportado.`,
    );
  }

  return provider.parse(qrCodeUrl);
}

export async function parseReceiptQrCode(
  qrCodeUrl: string,
): Promise<ParseReceiptResult> {
  const user = await getUserContext();
  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  if (!qrCodeUrl || qrCodeUrl.length > 4096) {
    return {
      success: false,
      error: "QR Code inválido.",
      errorCode: "INVALID_QR",
    };
  }

  try {
    const accessKey = extractAccessKey(qrCodeUrl);
    if (!accessKey) {
      return {
        success: false,
        error: "Não foi possível identificar a chave de acesso no QR Code.",
        errorCode: "INVALID_QR",
      };
    }

    const existing = await receiptRepository.findByAccessKey(
      user.houseId,
      accessKey,
    );
    if (existing) {
      return {
        success: true,
        existingReceiptId: existing.id,
      };
    }

    const cached = getCachedReceipt(user.houseId, accessKey);
    const receipt =
      cached ?? (await parseWithRateLimit(user.houseId, qrCodeUrl));
    cacheReceipt(user.houseId, receipt);

    return { success: true, receipt };
  } catch (error) {
    if (error instanceof ReceiptProviderError) {
      logger.warn(
        { error, userId: user.id, code: error.code },
        "Receipt parse failed",
      );
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
      };
    }

    logger.error({ error, userId: user.id }, "Unexpected receipt parse error");
    return {
      success: false,
      error: "Não foi possível ler a nota fiscal. Tente novamente.",
      errorCode: "PARSE_FAILED",
    };
  }
}

interface PantryGroup {
  description: string;
  productKey: string;
  category: MarketCategory;
  unit: MarketUnit;
  quantity: number;
  totalAmount: number;
}

function groupItemsForPantry(items: ReceiptItem[]): PantryGroup[] {
  const groups = new Map<string, PantryGroup>();

  for (const item of items) {
    const key = `${item.productKey}::${item.unit}`;
    const group = groups.get(key);

    if (group) {
      group.quantity += item.quantity;
      group.totalAmount += item.totalPrice.amount;
      continue;
    }

    groups.set(key, {
      description: item.description,
      productKey: item.productKey,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      totalAmount: item.totalPrice.amount,
    });
  }

  return Array.from(groups.values());
}

async function mergeItemsIntoPantry(
  houseId: string,
  receiptId: string,
  issuedAt: Date,
  items: ReceiptItem[],
): Promise<void> {
  const groups = groupItemsForPantry(items);
  if (groups.length === 0) return;

  const existingItems = await marketRepository.findAllByHouseId(houseId);
  const byName = new Map<string, MarketItem>();

  for (const item of existingItems) {
    byName.set(item.normalizedName ?? normalizeProductName(item.name), item);
  }

  for (const group of groups) {
    const existing = byName.get(group.productKey);
    const unitPrice =
      group.quantity > 0 ? group.totalAmount / group.quantity : 0;
    const lastPrice = { amount: unitPrice, currency: "BRL" as const };

    if (existing) {
      const baseQuantity = existing.isInStock ? (existing.quantity ?? 0) : 0;

      await marketRepository.update(existing.id, {
        quantity: baseQuantity + group.quantity,
        unit: group.unit,
        category: group.category,
        isInStock: true,
        isBought: true,
        normalizedName: group.productKey,
        lastPrice,
        lastPurchasedAt: issuedAt,
        sourceReceiptId: receiptId,
        updatedAt: new Date(),
      });
      continue;
    }

    const newItem: MarketItem = {
      id: crypto.randomUUID(),
      houseId,
      name: group.description,
      normalizedName: group.productKey,
      category: group.category,
      quantity: group.quantity,
      unit: group.unit,
      minimumQuantity: 0,
      priority: undefined,
      isBought: true,
      isInStock: true,
      shouldMoveToInventory: false,
      lastPrice,
      lastPurchasedAt: issuedAt,
      sourceReceiptId: receiptId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await marketRepository.create(newItem);
    byName.set(group.productKey, newItem);
  }
}

async function createReceiptInvoice(
  houseId: string,
  receipt: ReceiptEntity,
): Promise<void> {
  const db = await getDb();
  const invoices = db.collection("invoices");

  const existing = await invoices.findOne({
    houseId,
    sourceReceiptId: receipt.id,
  });
  if (existing) return;

  const now = new Date();
  const storeName = receipt.storeName.slice(0, 120);
  const invoice: InvoiceEntity = {
    id: crypto.randomUUID(),
    name: `Compra - ${storeName}`,
    dueDate: receipt.issuedAt,
    price: receipt.totalAmount,
    description: `Nota fiscal ${receipt.accessKey} - ${receipt.itemCount} itens`,
    category: Category.MARKET,
    status: InvoiceStatus.paid,
    recurrence: { isRecurring: false },
    isArchived: false,
    houseId,
    sourceReceiptId: receipt.id,
    createdAt: now,
    updatedAt: now,
  };

  await invoices.insertOne(invoice);
}

function validCategoryOverride(value: string): MarketCategory | null {
  return Object.values(MarketCategory).includes(value as MarketCategory)
    ? (value as MarketCategory)
    : null;
}

export async function importReceipt(
  input: ImportReceiptInput,
): Promise<ImportReceiptResult> {
  const user = await getUserContext();
  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  if (!isValidAccessKey(input.accessKey)) {
    return {
      success: false,
      error: "Chave de acesso inválida.",
      errorCode: "INVALID_QR",
    };
  }

  try {
    const existing = await receiptRepository.findByAccessKey(
      user.houseId,
      input.accessKey,
    );
    if (existing) {
      return {
        success: true,
        receiptId: existing.id,
        alreadyImported: true,
      };
    }

    let parsed = getCachedReceipt(user.houseId, input.accessKey);

    if (!parsed) {
      parsed = await parseWithRateLimit(user.houseId, input.qrCodeUrl);
      cacheReceipt(user.houseId, parsed);
    }

    if (parsed.accessKey !== input.accessKey) {
      return {
        success: false,
        error: "A nota lida não corresponde à chave informada.",
        errorCode: "INVALID_QR",
      };
    }

    const selectedIds = new Set(input.selectedItemIds);
    const overrides = input.categoryOverrides ?? {};
    const items = parsed.items.map((item) => ({
      ...item,
      category: validCategoryOverride(overrides[item.id]) ?? item.category,
    }));

    const now = new Date();
    const receipt: ReceiptEntity = {
      id: crypto.randomUUID(),
      houseId: user.houseId,
      accessKey: parsed.accessKey,
      state: parsed.state,
      storeName: parsed.storeName,
      storeCnpj: parsed.storeCnpj,
      storeAddress: parsed.storeAddress,
      issuedAt: parsed.issuedAt,
      totalAmount: parsed.totalAmount,
      discount: parsed.discount,
      paymentMethod: parsed.paymentMethod,
      taxAmount: parsed.taxAmount,
      itemCount: parsed.itemCount,
      source: "qrcode",
      provider: parsed.provider,
      qrCodeUrl: parsed.qrCodeUrl,
      items,
      createdAt: now,
      updatedAt: now,
    };

    await receiptRepository.create(receipt);

    if (input.addToPantry) {
      const selectedItems = items.filter((item) => selectedIds.has(item.id));
      await mergeItemsIntoPantry(
        user.houseId,
        receipt.id,
        receipt.issuedAt,
        selectedItems,
      );
    }

    if (input.createInvoice) {
      await createReceiptInvoice(user.houseId, receipt);
      revalidatePath("/invoices");
      revalidatePath("/");
    }

    revalidateMarket();

    return { success: true, receiptId: receipt.id };
  } catch (error) {
    if (error instanceof ReceiptProviderError) {
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
      };
    }

    logger.error(
      { error, userId: user.id, accessKey: input.accessKey },
      "Error importing receipt",
    );
    return {
      success: false,
      error: "Não foi possível salvar a nota fiscal. Tente novamente.",
    };
  }
}

export async function getReceipts(): Promise<ReceiptEntity[]> {
  const user = await getUserContext();
  if (!user) return [];

  return receiptRepository.findAllByHouseId(user.houseId);
}

export async function getReceiptById(
  id: string,
): Promise<ReceiptEntity | null> {
  const user = await getUserContext();
  if (!user) return null;

  return receiptRepository.findById(id, user.houseId);
}

export async function deleteReceipt(id: string): Promise<ActionResult> {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  try {
    await receiptRepository.delete(id, user.houseId);
    revalidateMarket();
    return { success: true };
  } catch (error) {
    logger.error(
      { error, receiptId: id, userId: user.id },
      "Error deleting receipt",
    );
    return { success: false, error: "Erro ao excluir a nota fiscal." };
  }
}
