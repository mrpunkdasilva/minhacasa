"use client";

import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/(view)/components/ui/dialog";
import { Button } from "@/app/(view)/components/ui/button";

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  variant?: "error" | "success";
}

export function MessageDialog({
  open,
  onOpenChange,
  title,
  message,
  variant = "error",
}: MessageDialogProps) {
  const Icon = variant === "error" ? AlertTriangle : CheckCircle2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-white">
            <Icon
              size={20}
              className={
                variant === "error" ? "text-rose-500" : "text-emerald-500"
              }
            />
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-400">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Excluir",
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-white">
            <AlertTriangle size={20} className="text-rose-500" />
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-zinc-400">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm()}
            disabled={loading}
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold"
          >
            {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
