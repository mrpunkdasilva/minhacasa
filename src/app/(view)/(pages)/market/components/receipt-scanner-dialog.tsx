"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ClipboardPaste,
  ExternalLink,
  Loader2,
  QrCode,
  Receipt,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/(view)/components/ui/dialog";
import { Button } from "@/app/(view)/components/ui/button";
import { Input } from "@/app/(view)/components/ui/input";
import { Checkbox } from "@/app/(view)/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/(view)/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/(view)/components/ui/tabs";
import { MarketCategory } from "@/app/domain/enums/market-category/market-category";
import { ParsedReceipt } from "@/app/domain/entity/receipt/receipt.entity";
import {
  importReceipt,
  parseReceiptQrCode,
} from "@/app/infra/actions/receipt.actions";

type ScannerStatus =
  | "idle"
  | "scanning"
  | "parsing"
  | "review"
  | "importing"
  | "done";

interface ImportReceiptButtonProps {
  label?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value: Date | string): string {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ImportReceiptButton({
  label = "Importar cupom",
  className,
  variant = "outline",
  size = "sm",
}: ImportReceiptButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <QrCode size={16} />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-emerald-500 flex items-center gap-2">
            <Receipt size={20} /> Importar nota fiscal
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Escaneie o QR Code do cupom paulista, envie uma foto ou cole o link
            completo do QR Code.
          </DialogDescription>
        </DialogHeader>
        <ReceiptScanner />
      </DialogContent>
    </Dialog>
  );
}

function ReceiptScanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [tab, setTab] = useState("camera");
  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [categoryOverrides, setCategoryOverrides] = useState<
    Record<string, string>
  >({});
  const [addToPantry, setAddToPantry] = useState(true);
  const [createInvoice, setCreateInvoice] = useState(false);
  const [existingReceiptId, setExistingReceiptId] = useState<string | null>(
    null,
  );
  const [importedReceiptId, setImportedReceiptId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
    };
  }, []);

  const stopCamera = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
  };

  const handleParse = async (value: string) => {
    if (!value.trim()) return;

    stopCamera();
    setError(null);
    setExistingReceiptId(null);
    setStatus("parsing");

    const result = await parseReceiptQrCode(value);

    if (!result.success) {
      setError(result.error ?? "Não foi possível ler a nota fiscal.");
      setStatus("idle");
      return;
    }

    if (result.existingReceiptId) {
      setExistingReceiptId(result.existingReceiptId);
      setStatus("idle");
      return;
    }

    if (!result.receipt) {
      setError("A nota foi lida, mas não retornou dados.");
      setStatus("idle");
      return;
    }

    setParsed(result.receipt);
    setSelectedIds(result.receipt.items.map((item) => item.id));
    setCategoryOverrides(
      Object.fromEntries(
        result.receipt.items.map((item) => [item.id, item.category]),
      ),
    );
    setStatus("review");
  };

  const startCamera = async () => {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        "A câmera não está disponível. Use o envio de imagem ou cole o link do QR Code.",
      );
      return;
    }

    try {
      setStatus("scanning");
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();

      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        (result) => {
          if (result) {
            stopCamera();
            void handleParse(result.getText());
          }
        },
      );

      controlsRef.current = controls;
    } catch (cameraError) {
      console.error(cameraError);
      setStatus("idle");
      setError(
        "Não foi possível abrir a câmera. Verifique a permissão ou use outra opção.",
      );
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setStatus("parsing");
    const objectUrl = URL.createObjectURL(file);

    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      const result = await reader.decodeFromImageUrl(objectUrl);
      await handleParse(result.getText());
    } catch (uploadError) {
      console.error(uploadError);
      setError(
        "Não encontramos um QR Code legível nessa imagem. Tente uma foto mais nítida.",
      );
      setStatus("idle");
    } finally {
      URL.revokeObjectURL(objectUrl);
      event.target.value = "";
    }
  };

  const toggleItem = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  };

  const toggleAll = () => {
    if (!parsed) return;
    setSelectedIds((current) =>
      current.length === parsed.items.length
        ? []
        : parsed.items.map((item) => item.id),
    );
  };

  const handleImport = async () => {
    if (!parsed) return;

    setError(null);
    setStatus("importing");

    const result = await importReceipt({
      qrCodeUrl: parsed.qrCodeUrl,
      accessKey: parsed.accessKey,
      selectedItemIds: selectedIds,
      categoryOverrides,
      addToPantry,
      createInvoice,
    });

    if (!result.success) {
      setError(result.error ?? "Não foi possível salvar a nota.");
      setStatus("review");
      return;
    }

    setImportedReceiptId(result.receiptId ?? null);
    setStatus("done");
    router.refresh();
  };

  const reset = () => {
    stopCamera();
    setStatus("idle");
    setError(null);
    setParsed(null);
    setSelectedIds([]);
    setCategoryOverrides({});
    setExistingReceiptId(null);
    setImportedReceiptId(null);
    setManualUrl("");
  };

  if (status === "done") {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <CheckCircle2 className="text-emerald-500" size={48} />
        <div>
          <p className="text-lg font-bold text-white">Nota importada!</p>
          <p className="text-zinc-500 text-sm mt-1">
            Os dados já estão disponíveis para análise
            {addToPantry ? " e os itens foram atualizados na despensa" : ""}.
          </p>
        </div>
        <div className="flex gap-2">
          {importedReceiptId && (
            <DialogClose asChild>
              <Button asChild className="bg-emerald-500 text-black font-bold">
                <Link href={`/market/receipts/${importedReceiptId}`}>
                  Ver nota <ExternalLink size={14} />
                </Link>
              </Button>
            </DialogClose>
          )}
          <Button variant="outline" onClick={reset}>
            Importar outra
          </Button>
        </div>
      </div>
    );
  }

  if ((status === "review" || status === "importing") && parsed) {
    const allSelected = selectedIds.length === parsed.items.length;

    return (
      <div className="flex flex-col gap-4 min-h-0">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-sm font-bold text-white">{parsed.storeName}</p>
          <p className="text-[11px] text-zinc-500 mt-1">
            {formatDate(parsed.issuedAt)} • {parsed.itemCount} itens •{" "}
            {formatCurrency(parsed.totalAmount.amount)}
          </p>
          {parsed.paymentMethod && (
            <p className="text-[11px] text-zinc-500">
              Pagamento: {parsed.paymentMethod}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500">
          <button
            type="button"
            onClick={toggleAll}
            className="hover:text-emerald-500 transition-colors font-bold uppercase tracking-wider"
          >
            {allSelected ? "Desmarcar todos" : "Selecionar todos"}
          </button>
          <span>
            {selectedIds.length} de {parsed.items.length} selecionados
          </span>
        </div>

        <div className="max-h-[38vh] overflow-y-auto pr-1 space-y-2">
          {parsed.items.map((item) => {
            const selected = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                  selected
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-zinc-800 bg-zinc-900/30 opacity-60"
                }`}
              >
                <Checkbox
                  checked={selected}
                  onCheckedChange={() => toggleItem(item.id)}
                  className="mt-0.5 border-zinc-700 data-checked:border-emerald-500 data-checked:bg-emerald-500"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    {item.description}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {item.quantity} {item.rawUnit} ×{" "}
                    {formatCurrency(item.unitPrice.amount)} ={" "}
                    {formatCurrency(item.totalPrice.amount)}
                    {item.storeCode ? ` • código ${item.storeCode}` : ""}
                  </p>
                </div>
                <div className="w-36 shrink-0">
                  <Select
                    value={categoryOverrides[item.id] ?? item.category}
                    onValueChange={(value) =>
                      setCategoryOverrides((current) => ({
                        ...current,
                        [item.id]: value,
                      }))
                    }
                  >
                    <SelectTrigger className="bg-black border-zinc-800 h-8 text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[220px]">
                      {Object.entries(MarketCategory).map(([key, value]) => (
                        <SelectItem key={key} value={value} className="text-xs">
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
          <label className="flex items-center gap-2 text-xs text-zinc-300">
            <Checkbox
              checked={addToPantry}
              onCheckedChange={(value) => setAddToPantry(value === true)}
              className="border-zinc-700 data-checked:border-emerald-500 data-checked:bg-emerald-500"
            />
            Adicionar itens selecionados à despensa
          </label>
          <label className="flex items-center gap-2 text-xs text-zinc-300">
            <Checkbox
              checked={createInvoice}
              onCheckedChange={(value) => setCreateInvoice(value === true)}
              className="border-zinc-700 data-checked:border-emerald-500 data-checked:bg-emerald-500"
            />
            Lançar o total como fatura paga (Mercado)
          </label>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={reset}
            disabled={status === "importing"}
            className="flex-1"
          >
            Voltar
          </Button>
          <Button
            onClick={handleImport}
            disabled={status === "importing"}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
          >
            {status === "importing" ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Salvando...
              </>
            ) : (
              "Salvar nota"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {existingReceiptId && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>
            Esta nota já foi importada.{" "}
            <DialogClose asChild>
              <Link
                href={`/market/receipts/${existingReceiptId}`}
                className="underline font-bold"
              >
                Ver nota existente
              </Link>
            </DialogClose>
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-zinc-900 border border-zinc-800 w-full grid grid-cols-3 h-9">
          <TabsTrigger
            value="camera"
            className="text-[11px] data-active:bg-zinc-800 data-active:text-emerald-500"
          >
            <Camera size={14} /> Câmera
          </TabsTrigger>
          <TabsTrigger
            value="upload"
            className="text-[11px] data-active:bg-zinc-800 data-active:text-emerald-500"
          >
            <Upload size={14} /> Imagem
          </TabsTrigger>
          <TabsTrigger
            value="paste"
            className="text-[11px] data-active:bg-zinc-800 data-active:text-emerald-500"
          >
            <ClipboardPaste size={14} /> Link
          </TabsTrigger>
        </TabsList>

        <TabsContent value="camera" className="pt-3">
          <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-black aspect-video flex items-center justify-center">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              muted
              playsInline
            />
            {status !== "scanning" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70">
                <QrCode size={40} className="text-zinc-600" />
                <p className="text-xs text-zinc-500 text-center px-6">
                  Aponte a câmera para o QR Code do cupom fiscal.
                </p>
              </div>
            )}
            {status === "scanning" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-40 w-40 rounded-xl border-2 border-emerald-500/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
              </div>
            )}
          </div>
          <div className="pt-3">
            {status === "scanning" ? (
              <Button variant="outline" onClick={stopCamera} className="w-full">
                Parar câmera
              </Button>
            ) : (
              <Button
                onClick={startCamera}
                disabled={status === "parsing"}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
              >
                {status === "parsing" ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Lendo nota...
                  </>
                ) : (
                  <>
                    <Camera size={16} /> Abrir câmera
                  </>
                )}
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="pt-3">
          <label className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-10 cursor-pointer hover:border-emerald-500/40 transition-colors">
            <Upload size={32} className="text-zinc-600" />
            <div className="text-center">
              <p className="text-sm font-bold text-white">
                Enviar foto do QR Code
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                PNG, JPG ou imagem do cupom
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={status === "parsing"}
            />
          </label>
          {status === "parsing" && (
            <p className="flex items-center justify-center gap-2 text-xs text-emerald-500 mt-3">
              <Loader2 className="animate-spin" size={14} /> Lendo nota...
            </p>
          )}
        </TabsContent>

        <TabsContent value="paste" className="pt-3 space-y-3">
          <Input
            value={manualUrl}
            onChange={(event) => setManualUrl(event.target.value)}
            placeholder="Cole a URL completa do QR Code do cupom"
            className="bg-black border-zinc-800 h-12 text-xs"
          />
          <Button
            onClick={() => handleParse(manualUrl)}
            disabled={status === "parsing" || !manualUrl.trim()}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
          >
            {status === "parsing" ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Lendo nota...
              </>
            ) : (
              "Ler nota fiscal"
            )}
          </Button>
          <p className="text-[10px] text-zinc-600 text-center">
            Por segurança, aceitamos apenas links do portal da SEFAZ de São
            Paulo.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
