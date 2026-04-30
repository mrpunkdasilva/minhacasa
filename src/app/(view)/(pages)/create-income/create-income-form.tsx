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
import { IncomeCategory, IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { createIncome, updateIncome } from "@/app/infra/actions/income.actions";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  amount: z.number().positive({
    message: "O valor deve ser positivo.",
  }),
  date: z.date({
    message: "A data da entrada é obrigatória.",
  }),
  description: z.string().optional(),
  category: z.nativeEnum(IncomeCategory, {
    message: "Selecione uma categoria.",
  }),
  isRecurring: z.boolean(),
  isPrivate: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateIncomeFormProps {
  initialData?: IncomeEntity;
}

export function CreateIncomeForm({ initialData }: CreateIncomeFormProps) {
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!initialData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      amount: initialData?.amount?.amount || 0,
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      description: initialData?.description || "",
      category: (initialData?.category as IncomeCategory) || IncomeCategory.SALARY,
      isRecurring: initialData?.recurrence?.isRecurring || false,
      isPrivate: !!initialData?.ownerId,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsPending(true);
    try {
      const payload = {
        name: values.name,
        amount: { amount: values.amount, currency: "BRL" as const },
        date: values.date,
        description: values.description || "",
        category: values.category,
        recurrence: { isRecurring: values.isRecurring },
        isPrivate: values.isPrivate,
      };

      if (isEditing && initialData) {
        await updateIncome(initialData.id, payload);
      } else {
        await createIncome(payload);
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
        {/* ... form fields remain same ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Entrada</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Salário Mensal, Venda..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
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
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data da Entrada</FormLabel>
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
                    {Object.values(IncomeCategory).map((category) => (
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
                    <FormLabel>Entrada Recorrente</FormLabel>
                    <FormDescription>
                      Marque se esta receita se repete mensalmente.
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
                      <ShieldCheck size={14} /> Entrada Privada
                    </FormLabel>
                    <FormDescription className="text-zinc-500">
                      Apenas você poderá ver este lançamento.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes adicionais sobre a receita..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold" disabled={isPending}>
          {isPending ? (
            <CircleNotch className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {isPending 
            ? isEditing ? "Salvando..." : "Criando..." 
            : isEditing ? "Salvar Alterações" : "Criar Entrada"}
        </Button>
      </form>
    </Form>
  );
}
