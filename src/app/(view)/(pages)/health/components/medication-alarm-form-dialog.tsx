"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/(view)/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/(view)/components/ui/form";
import { Input } from "@/app/(view)/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/(view)/components/ui/select";
import { Checkbox } from "@/app/(view)/components/ui/checkbox";
import { Button } from "@/app/(view)/components/ui/button";
import { Textarea } from "@/app/(view)/components/ui/textarea";
import { AlarmClock, Loader2, Pencil, Plus } from "lucide-react";
import { MedicationAlarm } from "@/app/domain/entity/health/health.entities";
import {
  addMedicationAlarm,
  updateMedicationAlarm,
} from "@/app/infra/actions/health.actions";
import { WEEKDAY_LABELS } from "./health-utils";
import { MessageDialog } from "./feedback-dialogs";

interface MedicationAlarmFormDialogProps {
  medications: { id: string; name: string }[];
  initialAlarm?: MedicationAlarm;
  triggerClassName?: string;
}

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const formSchema = z.object({
  medicationId: z.string().min(1, "Selecione um medicamento"),
  time: z.string().regex(timePattern, "Horário inválido. Use HH:MM."),
  daysOfWeek: z
    .array(z.number().int().min(0).max(6))
    .min(1, "Selecione ao menos um dia"),
  note: z.string().optional(),
  enabled: z.boolean(),
});

function formatClock(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export default function MedicationAlarmFormDialog({
  medications,
  initialAlarm,
  triggerClassName = "",
}: MedicationAlarmFormDialogProps) {
  const isEdit = Boolean(initialAlarm);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialAlarm
      ? {
          medicationId: initialAlarm.medicationId,
          time: initialAlarm.time,
          daysOfWeek: initialAlarm.daysOfWeek,
          note: initialAlarm.note ?? "",
          enabled: initialAlarm.enabled,
        }
      : {
          medicationId: "",
          time: "08:00",
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          note: "",
          enabled: true,
        },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("medicationId", values.medicationId);
      formData.append("time", values.time);
      values.daysOfWeek.forEach((day) =>
        formData.append("daysOfWeek", String(day)),
      );
      if (values.note?.trim()) formData.append("note", values.note);
      formData.append("enabled", String(values.enabled));

      const result = initialAlarm
        ? await updateMedicationAlarm(initialAlarm.id, formData)
        : await addMedicationAlarm(formData);

      if (result.success) {
        setOpen(false);
        if (!isEdit) form.reset();
      } else {
        setErrorMessage(result.error ?? "Erro ao salvar o alarme.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro ao processar sua solicitação.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {isEdit ? (
            <button
              className={`p-2 text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all ${triggerClassName}`}
              title="Editar alarme"
            >
              <Pencil size={18} />
            </button>
          ) : (
            <Button
              className={`bg-emerald-500 hover:bg-emerald-600 text-black font-bold ${triggerClassName}`}
            >
              <Plus size={16} className="mr-2" />
              Novo Alarme
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[480px] max-h-[90vh] overflow-y-auto no-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-500 flex items-center gap-2">
              <AlarmClock size={20} />
              {isEdit ? "Editar Alarme" : "Adicionar Alarme"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5 pt-4"
            >
              <FormField
                control={form.control}
                name="medicationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medicamento</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="bg-black border-zinc-800 text-white h-11">
                          <SelectValue placeholder="Escolha o medicamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        {medications.map((medication) => (
                          <SelectItem key={medication.id} value={medication.id}>
                            {medication.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {medications.length === 0 && (
                      <FormDescription className="text-[10px] text-zinc-500">
                        Cadastre um medicamento antes de criar alarmes.
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        maxLength={5}
                        placeholder="08:00"
                        className="bg-black border-zinc-800 text-white h-11 font-mono"
                        {...field}
                        onChange={(event) =>
                          field.onChange(formatClock(event.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="daysOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-2">
                      <FormLabel>Dias da semana</FormLabel>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => field.onChange([0, 1, 2, 3, 4, 5, 6])}
                          className="text-[10px] font-bold uppercase text-emerald-500 hover:text-emerald-400"
                        >
                          Todos
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange([1, 2, 3, 4, 5])}
                          className="text-[10px] font-bold uppercase text-zinc-500 hover:text-white"
                        >
                          Dias úteis
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5 pt-1">
                      {WEEKDAY_LABELS.map((label, day) => {
                        const checked = field.value.includes(day);
                        return (
                          <label
                            key={label}
                            className={`flex flex-col items-center gap-1.5 rounded-lg border px-1 py-2 text-[10px] font-bold cursor-pointer transition-colors ${
                              checked
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                : "border-zinc-800 bg-black/50 text-zinc-500"
                            }`}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) =>
                                field.onChange(
                                  value
                                    ? [...field.value, day].sort(
                                        (a, b) => a - b,
                                      )
                                    : field.value.filter(
                                        (item) => item !== day,
                                      ),
                                )
                              }
                              className="border-zinc-700 data-[state=checked]:bg-emerald-500"
                            />
                            {label}
                          </label>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observação (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Tomar com um copo de água"
                        className="bg-black border-zinc-800 text-white min-h-[70px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-zinc-800 p-4 bg-black/50">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-zinc-700 data-[state=checked]:bg-emerald-500"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium text-zinc-200">
                        Alarme ativo
                      </FormLabel>
                      <FormDescription className="text-[10px] text-zinc-500">
                        Desative para pausar sem excluir o alarme.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading || medications.length === 0}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-11 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      SALVANDO...
                    </>
                  ) : isEdit ? (
                    "SALVAR ALTERAÇÕES"
                  ) : (
                    "ADICIONAR ALARME"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <MessageDialog
        open={Boolean(errorMessage)}
        onOpenChange={(isOpen) => !isOpen && setErrorMessage(null)}
        title="Não foi possível salvar"
        message={errorMessage ?? ""}
      />
    </>
  );
}
