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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/app/(view)/components/ui/form";
import { Input } from "@/app/(view)/components/ui/input";
import { Textarea } from "@/app/(view)/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/(view)/components/ui/select";
import { Checkbox } from "@/app/(view)/components/ui/checkbox";
import { Button } from "@/app/(view)/components/ui/button";
import { Plus, Pencil, Loader2, Pill } from "lucide-react";
import {
  MedicationSubject,
  MedicationType,
  DosageUnit,
} from "@/app/domain/enums/health/health.enums";
import { Medication } from "@/app/domain/entity/health/health.entities";
import {
  addMedication,
  updateMedication,
} from "@/app/infra/actions/health.actions";
import { numberInputValue } from "@/app/infra/lib/utils";
import { toDateKey } from "./health-utils";

interface MedicationFormDialogProps {
  initialMedication?: Medication;
  pets?: { id: string; name: string }[];
  houseMembers?: { id: string; name: string }[];
  triggerClassName?: string;
}

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

function formatClock(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length === 0) return "";
  if (digits.length === 1) return digits;
  if (digits.length === 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

const formSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    subject: z.nativeEnum(MedicationSubject),
    subjectName: z.string().optional(),
    type: z.nativeEnum(MedicationType),
    dosage: z.number().min(0, "Dosagem não pode ser negativa"),
    dosageUnit: z.nativeEnum(DosageUnit),
    startTime: z
      .string()
      .regex(timePattern, "Hora inicial inválida. Use HH:MM."),
    intervalHours: z
      .string()
      .regex(/^\d+(\.\d+)?$/, "Intervalo inválido. Use horas, ex: 8 ou 6.5.")
      .refine((value) => {
        const hours = parseFloat(value);
        return hours >= 0.5 && hours <= 168;
      }, "Intervalo deve ficar entre 0,5 e 168 horas"),
    startDate: z.string().min(1, "Informe a data de início"),
    endDate: z.string().optional(),
    instructions: z.string().optional(),
    stockCurrent: z.string().optional(),
    stockMin: z.string().optional(),
    expirationDate: z.string().optional(),
    active: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (
      values.subject !== MedicationSubject.GENERAL &&
      !values.subjectName?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subjectName"],
        message: "Informe para quem é o medicamento.",
      });
    }
  });

export default function MedicationFormDialog({
  initialMedication,
  pets = [],
  houseMembers = [],
  triggerClassName = "",
}: MedicationFormDialogProps) {
  const isEdit = Boolean(initialMedication);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [petId, setPetId] = useState<string>(initialMedication?.petId ?? "");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialMedication
      ? {
          name: initialMedication.name,
          subject: initialMedication.subject,
          subjectName: initialMedication.subjectName ?? "",
          type: initialMedication.type,
          dosage: initialMedication.dosage,
          dosageUnit: initialMedication.dosageUnit,
          startTime: initialMedication.startTime,
          intervalHours: String(initialMedication.intervalHours),
          startDate: toDateKey(initialMedication.startDate),
          endDate: initialMedication.endDate
            ? toDateKey(initialMedication.endDate)
            : "",
          instructions: initialMedication.instructions ?? "",
          stockCurrent: initialMedication.stock
            ? String(initialMedication.stock.current)
            : "",
          stockMin: initialMedication.stock
            ? String(initialMedication.stock.min)
            : "",
          expirationDate: initialMedication.expirationDate
            ? toDateKey(initialMedication.expirationDate)
            : "",
          active: initialMedication.active,
        }
      : {
          name: "",
          subject: MedicationSubject.GENERAL,
          subjectName: "",
          type: MedicationType.MEDICINE,
          dosage: 1,
          dosageUnit: DosageUnit.PILL,
          startTime: "08:00",
          intervalHours: "8",
          startDate: toDateKey(new Date()),
          endDate: "",
          instructions: "",
          stockCurrent: "",
          stockMin: "",
          expirationDate: "",
          active: true,
        },
  });

  const subject = form.watch("subject");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("subject", values.subject);
      formData.append(
        "subjectName",
        values.subject === MedicationSubject.PET
          ? (pets.find((pet) => pet.id === petId)?.name ??
              values.subjectName ??
              "")
          : (values.subjectName ?? ""),
      );
      formData.append(
        "petId",
        values.subject === MedicationSubject.PET ? petId : "",
      );
      formData.append("type", values.type);
      formData.append("dosage", values.dosage.toString());
      formData.append("dosageUnit", values.dosageUnit);
      formData.append("startTime", values.startTime);
      formData.append("intervalHours", values.intervalHours);
      formData.append("startDate", values.startDate);
      if (values.endDate) formData.append("endDate", values.endDate);
      if (values.instructions?.trim())
        formData.append("instructions", values.instructions);
      if (values.stockCurrent !== "" || values.stockMin !== "") {
        formData.append("stockCurrent", values.stockCurrent || "0");
        formData.append("stockMin", values.stockMin || "0");
      }
      if (values.expirationDate)
        formData.append("expirationDate", values.expirationDate);
      formData.append("active", String(values.active));

      const result = initialMedication
        ? await updateMedication(initialMedication.id, formData)
        : await addMedication(formData);

      if (result.success) {
        setOpen(false);
        if (!isEdit) form.reset();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <button
            className={`p-2 text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all ${triggerClassName}`}
            title="Editar medicamento"
          >
            <Pencil size={18} />
          </button>
        ) : (
          <Button
            className={`bg-emerald-500 hover:bg-emerald-600 text-black font-bold ${triggerClassName}`}
          >
            <Plus size={16} className="mr-2" />
            Novo Medicamento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[480px] max-h-[90vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-500 flex items-center gap-2">
            <Pill size={20} />
            {isEdit ? "Editar Medicamento" : "Adicionar Medicamento"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 pt-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Medicamento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Dipirona, Losartana..."
                      className="bg-black border-zinc-800 text-white h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Para quem?</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-black border-zinc-800 text-white h-11 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        {Object.entries(MedicationSubject).map(
                          ([key, value]) => (
                            <SelectItem key={key} value={value}>
                              {value}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {subject === MedicationSubject.HUMAN && (
                <FormField
                  control={form.control}
                  name="subjectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pessoa</FormLabel>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-black border-zinc-800 text-white h-11 text-xs">
                            <SelectValue
                              placeholder={
                                houseMembers.length
                                  ? "Escolha a pessoa"
                                  : "Nenhum membro na casa"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                          {houseMembers.map((member) => (
                            <SelectItem key={member.id} value={member.name}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {subject === MedicationSubject.PET && (
                <FormItem>
                  <FormLabel>Pet</FormLabel>
                  <Select value={petId} onValueChange={setPetId}>
                    <FormControl>
                      <SelectTrigger className="bg-black border-zinc-800 text-white h-11 text-xs">
                        <SelectValue
                          placeholder={
                            pets.length
                              ? "Escolha o pet"
                              : "Nenhum pet cadastrado"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      {pets.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id}>
                          {pet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {subject === MedicationSubject.PET && !petId && (
                    <p className="text-[10px] text-zinc-500">
                      Cadastre o pet antes na aba Pets.
                    </p>
                  )}
                </FormItem>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosagem</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        className="bg-black border-zinc-800 text-white h-11"
                        {...field}
                        onChange={(e) =>
                          field.onChange(numberInputValue(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dosageUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-black border-zinc-800 text-white h-11 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        {Object.entries(DosageUnit).map(([key, value]) => (
                          <SelectItem key={key} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Inicial</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        maxLength={5}
                        placeholder="08:00"
                        className="bg-black border-zinc-800 text-white h-11 font-mono"
                        {...field}
                        onChange={(e) =>
                          field.onChange(formatClock(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="intervalHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intervalo (h)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="decimal"
                        placeholder="8"
                        aria-invalid={!!form.formState.errors.intervalHours}
                        className="bg-black border-zinc-800 text-white h-11 font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[10px] text-zinc-500">
                      Ex: 8 (a cada 8h), 12 (2x ao dia), 24 (diário).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Início do Tratamento</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="bg-black border-zinc-800 text-white h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fim (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="bg-black border-zinc-800 text-white h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stockCurrent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qtd. em Estoque (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ex: 12"
                        className="bg-black border-zinc-800 text-white h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[10px] text-zinc-500">
                      Avisa quando ficar baixo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stockMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Mínimo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ex: 3"
                        className="bg-black border-zinc-800 text-white h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expirationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Validade (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="bg-black border-zinc-800 text-white h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-[10px] text-zinc-500">
                    Receba aviso quando estiver perto de vencer.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruções (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Tomar após as refeições"
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
              name="active"
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
                      Medicamento ativo
                    </FormLabel>
                    <FormDescription className="text-[10px] text-zinc-500">
                      Desative para pausar os lembretes sem apagar.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
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
                  "ADICIONAR MEDICAMENTO"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
