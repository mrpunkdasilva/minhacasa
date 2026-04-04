"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  CircleNotch,
  ShieldCheck,
} from "@phosphor-icons/react";

import { cn } from "@/app/infra/lib/utils";
import { Button } from "@/app/(view)/components/ui/button";
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
import { Textarea } from "@/app/(view)/components/ui/textarea";
import { Calendar } from "@/app/(view)/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/(view)/components/ui/popover";
import { Checkbox } from "@/app/(view)/components/ui/checkbox";
import { Category } from "@/app/domain/enums/category/category";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import {
  createInvoice,
  updateInvoice,
} from "@/app/infra/actions/invoice.actions";
import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  price: z.number().positive({
    message: "O preço deve ser um valor positivo.",
  }),
  dueDate: z.date({
    message: "A data de vencimento é obrigatória.",
  }),
  description: z.string().optional(),
  category: z.nativeEnum(Category, {
    message: "Selecione uma categoria.",
  }),
  status: z.nativeEnum(InvoiceStatus, {
    message: "Selecione um status.",
  }),
  isRecurring: z.boolean(),
  isPrivate: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateInvoiceFormProps {
  initialData?: InvoiceEntity;
}

export function CreateInvoiceForm({ initialData }: CreateInvoiceFormProps) {
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!initialData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      price: initialData?.price?.amount || 0,
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : undefined,
      description: initialData?.description || "",
      category: (initialData?.category as Category) || undefined,
      isRecurring: initialData?.recurrence?.isRecurring || false,
      status: initialData?.status ?? InvoiceStatus.unpaid,
      isPrivate: !!initialData?.ownerId,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsPending(true);
    try {
      const payload = {
        name: values.name,
        price: { amount: values.price, currency: "BRL" as const },
        dueDate: values.dueDate,
        description: values.description || "",
        category: values.category,
        status: values.status,
        recurrence: { isRecurring: values.isRecurring },
        isPrivate: values.isPrivate,
      };

      if (isEditing && initialData) {
        await updateInvoice(initialData.id, payload);
      } else {
        await createInvoice(payload);
      }
    } catch (error) {
      console.error(error);
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-2xl mx-auto p-6 bg-card border border-border"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Fatura</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Internet, Aluguel..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Vencimento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Escolha uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(Category).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={InvoiceStatus.unpaid.toString()}>
                      Não Pago
                    </SelectItem>
                    <SelectItem value={InvoiceStatus.paid.toString()}>
                      Pago
                    </SelectItem>
                    <SelectItem value={InvoiceStatus.overdue.toString()}>
                      Atrasado
                    </SelectItem>
                    <SelectItem value={InvoiceStatus.scheduled.toString()}>
                      Agendado
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-none border border-border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Fatura Recorrente</FormLabel>
                    <FormDescription>
                      Marque se esta fatura se repete mensalmente.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-none border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-emerald-500 flex items-center gap-1">
                      <ShieldCheck size={14} /> Fatura Privada
                    </FormLabel>
                    <FormDescription className="text-zinc-500">
                      Apenas você poderá ver este lançamento.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes adicionais sobre a fatura..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <CircleNotch className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {isPending
            ? isEditing
              ? "Salvando..."
              : "Criando..."
            : isEditing
              ? "Salvar Alterações"
              : "Criar Fatura"}
        </Button>
      </form>
    </Form>
  );
}
