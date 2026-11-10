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
import { Button } from "@/app/(view)/components/ui/button";
import { Plus, Pencil, Loader2, Stethoscope } from "lucide-react";
import { AppointmentType } from "@/app/domain/enums/health/health.enums";
import { HealthAppointment } from "@/app/domain/entity/health/health.entities";
import {
  addAppointment,
  updateAppointment,
} from "@/app/infra/actions/health.actions";
import { numberInputValue } from "@/app/infra/lib/utils";

interface AppointmentFormDialogProps {
  initialAppointment?: HealthAppointment;
}

function toDateTimeLocal(date: Date): string {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  const hours = `${d.getHours()}`.padStart(2, "0");
  const minutes = `${d.getMinutes()}`.padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}T${hours}:${minutes}`;
}

const formSchema = z.object({
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
  type: z.nativeEnum(AppointmentType),
  date: z.string().min(1, "Informe a data"),
  doctorName: z.string().optional(),
  location: z.string().optional(),
  reminderDaysBefore: z.number().min(0, "Não pode ser negativo"),
  notes: z.string().optional(),
});

export default function AppointmentFormDialog({
  initialAppointment,
}: AppointmentFormDialogProps) {
  const isEdit = Boolean(initialAppointment);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialAppointment
      ? {
          title: initialAppointment.title,
          type: initialAppointment.type,
          date: toDateTimeLocal(initialAppointment.date),
          doctorName: initialAppointment.doctorName ?? "",
          location: initialAppointment.location ?? "",
          reminderDaysBefore: initialAppointment.reminderDaysBefore,
          notes: initialAppointment.notes ?? "",
        }
      : {
          title: "",
          type: AppointmentType.DOCTOR,
          date: "",
          doctorName: "",
          location: "",
          reminderDaysBefore: 1,
          notes: "",
        },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("type", values.type);
      formData.append("date", values.date);
      if (values.doctorName) formData.append("doctorName", values.doctorName);
      if (values.location) formData.append("location", values.location);
      formData.append(
        "reminderDaysBefore",
        values.reminderDaysBefore.toString(),
      );
      if (values.notes) formData.append("notes", values.notes);

      const result = initialAppointment
        ? await updateAppointment(initialAppointment.id, formData)
        : await addAppointment(formData);

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
            className="p-2 text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
            title="Editar compromisso"
          >
            <Pencil size={18} />
          </button>
        ) : (
          <Button className="bg-white text-black font-bold hover:bg-zinc-200">
            <Plus size={16} className="mr-2" />
            Nova Consulta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[480px] max-h-[90vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-500 flex items-center gap-2">
            <Stethoscope size={20} />
            {isEdit ? "Editar Compromisso" : "Novo Compromisso de Saúde"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 pt-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Dermatologista"
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
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
                      {Object.entries(AppointmentType).map(([key, value]) => (
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

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data e Hora</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
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
                name="doctorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissional (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Dr. Silva"
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
                name="reminderDaysBefore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avisar antes (dias)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        className="bg-black border-zinc-800 text-white h-11"
                        {...field}
                        onChange={(e) =>
                          field.onChange(numberInputValue(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription className="text-[10px] text-zinc-500">
                      Quantos dias antes alertar.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Clínica Central"
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Levar exames anteriores"
                      className="bg-black border-zinc-800 text-white min-h-[70px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
                  "AGENDAR"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
