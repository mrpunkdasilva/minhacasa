import { request as httpsRequest } from "node:https";
import { load } from "cheerio";
import {
  ParsedReceipt,
  ReceiptItem,
  ReceiptProviderId,
} from "@/app/domain/entity/receipt/receipt.entity";
import {
  categorizeProduct,
  getStateFromAccessKey,
  isValidAccessKey,
  normalizeProductName,
  parseBrazilianDateTime,
  parseLocaleNumber,
  toMoney,
  mapUnit,
} from "./normalize";
import { ReceiptProvider, ReceiptProviderError } from "./receipt-provider";

const PRODUCTION_HOST = "www.nfce.fazenda.sp.gov.br";
const HOMOLOGATION_HOST = "www.homologacao.nfce.fazenda.sp.gov.br";
const ALLOWED_HOSTS = new Set([PRODUCTION_HOST, HOMOLOGATION_HOST]);

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

const FETCH_TIMEOUT_MS = 25_000;
const MAX_REDIRECTS = 5;
const MIN_HTML_LENGTH = 2_000;

interface HtmlResponse {
  statusCode: number;
  body: string;
}

/**
 * SEFAZ SP sits behind an F5 ASM that rejects undici's (global fetch) TLS
 * fingerprint. Node's lower-level https client uses a ClientHello the portal
 * accepts, so we deliberately avoid fetch here.
 */
function fetchHtml(url: URL, redirects = 0): Promise<HtmlResponse> {
  return new Promise((resolve, reject) => {
    const request = httpsRequest(
      url,
      {
        method: "GET",
        headers: DEFAULT_HEADERS,
        timeout: FETCH_TIMEOUT_MS,
      },
      (response) => {
        const statusCode = response.statusCode ?? 0;
        const location = response.headers.location;

        if (
          statusCode >= 300 &&
          statusCode < 400 &&
          location &&
          redirects < MAX_REDIRECTS
        ) {
          response.resume();
          const nextUrl = new URL(location, url);

          if (!ALLOWED_HOSTS.has(nextUrl.hostname)) {
            reject(
              new ReceiptProviderError(
                "INVALID_QR",
                "A SEFAZ redirecionou a consulta para um endereço não permitido.",
              ),
            );
            return;
          }

          resolve(fetchHtml(nextUrl, redirects + 1));
          return;
        }

        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk: string) => {
          body += chunk;
        });
        response.on("end", () => resolve({ statusCode, body }));
        response.on("error", reject);
      },
    );

    request.on("timeout", () => {
      request.destroy(new Error("SEFAZ request timed out"));
    });
    request.on("error", reject);
    request.end();
  });
}

function normalizeQrUrl(input: string): URL {
  const trimmed = input.trim();

  const raw = trimmed.startsWith("http")
    ? trimmed
    : trimmed.includes("p=")
      ? `https://${PRODUCTION_HOST}/qrcode?${trimmed.replace(/^\?/, "")}`
      : `https://${PRODUCTION_HOST}/qrcode?p=${trimmed}`;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ReceiptProviderError(
      "INVALID_QR",
      "Não foi possível interpretar o QR Code do cupom.",
    );
  }

  if (!ALLOWED_HOSTS.has(url.hostname)) {
    throw new ReceiptProviderError(
      "INVALID_QR",
      "Este QR Code não pertence ao portal da SEFAZ de São Paulo.",
    );
  }

  const p = url.searchParams.get("p");
  if (!p) {
    throw new ReceiptProviderError(
      "INVALID_QR",
      "O QR Code não contém os dados da nota fiscal.",
    );
  }

  const accessKey = p.split("|")[0].replace(/\D/g, "");
  if (!isValidAccessKey(accessKey)) {
    throw new ReceiptProviderError(
      "INVALID_QR",
      "A chave de acesso do cupom é inválida.",
    );
  }

  const state = getStateFromAccessKey(accessKey);
  if (state !== "SP") {
    throw new ReceiptProviderError(
      "UNSUPPORTED_STATE",
      `Este cupom é de ${state ?? "outro estado"}; por enquanto importamos apenas notas de São Paulo.`,
    );
  }

  const host =
    url.hostname === HOMOLOGATION_HOST ? HOMOLOGATION_HOST : PRODUCTION_HOST;
  const canonical = new URL(
    `https://${host}/NFCeConsultaPublica/Paginas/ConsultaQRCode.aspx`,
  );
  canonical.searchParams.set("p", p);

  return canonical;
}

function textOf(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function parseItems(html: string): ReceiptItem[] {
  const $ = load(html);
  const items: ReceiptItem[] = [];

  $("#tabResult tr").each((_, row) => {
    const $row = $(row);
    const $cell = $row.find("td").first();
    const description = textOf($cell.find(".txtTit").first().text());

    if (!description) return;

    const quantity = parseLocaleNumber(
      textOf(
        $cell
          .find(".Rqtd")
          .text()
          .replace(/Qtde\.?:/i, ""),
      ),
    );
    const rawUnit = textOf(
      $cell
        .find(".RUN")
        .text()
        .replace(/UN\s*:/i, ""),
    ).toUpperCase();
    const unitPriceText = textOf(
      $cell
        .find(".RvlUnit")
        .text()
        .replace(/Vl\.?\s*Unit\.?:/i, ""),
    );
    const totalPriceText = textOf($row.find("td.txtTit.noWrap .valor").text());

    const unitPrice = parseLocaleNumber(unitPriceText);
    const totalPrice =
      parseLocaleNumber(totalPriceText) || quantity * unitPrice;

    items.push({
      id: crypto.randomUUID(),
      description,
      storeCode:
        textOf($cell.find(".RCod").text()).match(
          /C[oó]digo:\s*([0-9]+)/i,
        )?.[1] ?? undefined,
      quantity,
      rawUnit: rawUnit || "UN",
      unit: mapUnit(rawUnit),
      unitPrice: toMoney(unitPrice),
      totalPrice: toMoney(totalPrice),
      category: categorizeProduct(description),
      productKey: normalizeProductName(description),
    });
  });

  return items;
}

interface ReceiptTotals {
  itemCount?: number;
  grossAmount?: number;
  discount?: number;
  paidAmount?: number;
  taxAmount?: number;
  paymentMethod?: string;
}

function parseTotals(html: string): ReceiptTotals {
  const $ = load(html);
  const totals: ReceiptTotals = {};

  $("#totalNota #linhaTotal").each((_, row) => {
    const $row = $(row);
    const label = textOf($row.find("label").first().text()).toLowerCase();
    const value = parseLocaleNumber(
      textOf($row.find(".totalNumb").first().text()),
    );

    if (label.includes("qtd") && label.includes("itens")) {
      totals.itemCount = value;
    } else if (label.includes("valor total")) {
      totals.grossAmount = value;
    } else if (label.includes("desconto")) {
      totals.discount = value;
    } else if (label.includes("valor a pagar")) {
      totals.paidAmount = value;
    } else if (label.includes("tributos")) {
      totals.taxAmount = value;
    } else if (label.includes("troco")) {
      return;
    } else if (!totals.paymentMethod) {
      const paymentLabel = textOf($row.find("label.tx").text());
      if (paymentLabel) {
        totals.paymentMethod = paymentLabel;
      }
    }
  });

  return totals;
}

function detectProblem(html: string): void {
  const $ = load(html);
  const notices = textOf($("#avisos").text()).toUpperCase();

  if (notices.includes("CANCELAD")) {
    throw new ReceiptProviderError(
      "CANCELLED",
      "Esta nota fiscal está cancelada e não pode ser importada.",
    );
  }
}

export class SpSefazProvider implements ReceiptProvider {
  readonly id: ReceiptProviderId = "sp-sefaz";

  supports(state: string): boolean {
    return state === "SP";
  }

  async parse(qrCodeUrl: string): Promise<ParsedReceipt> {
    const url = normalizeQrUrl(qrCodeUrl);
    const accessKey = url.searchParams
      .get("p")!
      .split("|")[0]
      .replace(/\D/g, "");

    let html: string;

    try {
      const response = await fetchHtml(url);

      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw new ReceiptProviderError(
          "UNAVAILABLE",
          "A SEFAZ de São Paulo não respondeu. Tente novamente em instantes.",
        );
      }

      html = response.body;
    } catch (error) {
      if (error instanceof ReceiptProviderError) throw error;
      throw new ReceiptProviderError(
        "UNAVAILABLE",
        "Não foi possível consultar a SEFAZ de São Paulo agora. Tente novamente em instantes.",
      );
    }

    if (html.length < MIN_HTML_LENGTH || html.includes("Request Rejected")) {
      throw new ReceiptProviderError(
        "UNAVAILABLE",
        "A SEFAZ recusou a consulta. Confira se o QR Code está completo e tente novamente.",
      );
    }

    detectProblem(html);

    const $ = load(html);
    const storeName = textOf($(".txtTopo").first().text());
    const headerTexts = $(".txtCenter .text")
      .map((_, element) => textOf($(element).text()))
      .get();

    const cnpjText = headerTexts.find((text) => text.includes("CNPJ"));
    const storeCnpj = cnpjText?.replace(/\D/g, "") || undefined;
    const storeAddress =
      headerTexts.find((text) => !text.includes("CNPJ")) || undefined;

    const items = parseItems(html);
    if (items.length === 0) {
      throw new ReceiptProviderError(
        "PARSE_FAILED",
        "A nota foi encontrada, mas nenhum item pôde ser lido. Tente novamente mais tarde.",
      );
    }

    const totals = parseTotals(html);
    const issuedAtText =
      $("#infos li")
        .text()
        .match(/Emiss[aã]o:\s*([0-9/]+\s+[0-9:]+)/i)?.[1] ?? "";
    const issuedAt = parseBrazilianDateTime(issuedAtText);
    if (!issuedAt) {
      throw new ReceiptProviderError(
        "PARSE_FAILED",
        "Não foi possível identificar a data de emissão da nota.",
      );
    }

    const paidAmount =
      totals.paidAmount ??
      totals.grossAmount ??
      items.reduce((sum, item) => sum + item.totalPrice.amount, 0);

    return {
      accessKey,
      state: "SP",
      storeName: storeName || "Mercado não identificado",
      storeCnpj,
      storeAddress,
      issuedAt,
      totalAmount: toMoney(paidAmount),
      discount:
        totals.discount !== undefined ? toMoney(totals.discount) : undefined,
      paymentMethod: totals.paymentMethod,
      taxAmount:
        totals.taxAmount !== undefined ? toMoney(totals.taxAmount) : undefined,
      itemCount: totals.itemCount ?? items.length,
      provider: this.id,
      qrCodeUrl: url.toString(),
      items,
    };
  }
}
