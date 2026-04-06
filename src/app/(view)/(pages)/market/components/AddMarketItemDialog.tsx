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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/(view)/components/ui/select";
import { Button } from "@/app/(view)/components/ui/button";
import { Checkbox } from "@/app/(view)/components/ui/checkbox";
import { Plus, Loader2, ShoppingCart, Archive, DollarSign } from "lucide-react";
import {
  MarketCategory,
  MarketUnit,
  MarketPriority,
} from "@/app/domain/enums/market-category/market-category";
import { addMarketItem } from "@/app/infra/actions/market.actions";

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  category: z.nativeEnum(MarketCategory),
  quantity: z.string().transform((val) => parseFloat(val)),
  unit: z.nativeEnum(MarketUnit),
  priority: z.nativeEnum(MarketPriority),
  lastPrice: z.string().transform((val) => parseFloat(val || "0")),
  shouldMoveToInventory: z.boolean().default(true),
  location: z.enum(["shopping", "inventory"]).default("shopping"),
});

export default function AddMarketItemDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: MarketCategory.GROCERY,
      quantity: "1" as any,
      unit: MarketUnit.UN,
      priority: MarketPriority.MEDIUM,
      lastPrice: "0" as any,
      shouldMoveToInventory: true,
      location: "shopping",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("category", values.category);
    formData.append("quantity", values.quantity.toString());
    formData.append("unit", values.unit);
    formData.append("priority", values.priority);
    formData.append("lastPrice", values.lastPrice.toString());
    formData.append("shouldMoveToInventory", values.shouldMoveToInventory.toString());
    formData.append("isShoppingListItem", (values.location === "shopping").toString());

    try {
      await addMarketItem(formData);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const priorityColors = {
    [MarketPriority.LOW]: "text-zinc-400",
    [MarketPriority.MEDIUM]: "text-emerald-500",
    [MarketPriority.HIGH]: "text-amber-500",
    [MarketPriority.URGENT]: "text-rose-500",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold">
          <Plus size={16} className="mr-2" />
          Novo Item
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[425px] max-h-[90vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-500 flex items-center gap-2">
            <ShoppingCart size={20} /> Adicionar ao Mercado
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Item</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Arroz, Sabão em Pó..."
                      className="bg-black border-zinc-800 text-white h-12"
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
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        className="bg-black border-zinc-800 text-white h-12"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-black border-zinc-800 text-white h-12">
                          <SelectValue placeholder="Unid." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        {Object.entries(MarketUnit).map(([key, value]) => (
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

            <FormField
              control={form.control}
              name="lastPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço Unitário (Estimado)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        className="bg-black border-zinc-800 text-white h-12 pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-[10px] text-zinc-500">
                    Opcional. Ajuda a calcular o total da sua compra.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-black border-zinc-800 text-white h-12 text-xs">
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[200px]">
                        {Object.entries(MarketCategory).map(([key, value]) => (
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
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={`bg-black border-zinc-800 h-12 font-bold ${priorityColors[field.value as MarketPriority]}`}>
                          <SelectValue placeholder="Prioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        {Object.entries(MarketPriority).map(([key, value]) => (
                          <SelectItem key={key} value={value} className="font-bold">
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

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Onde salvar primeiro?</FormLabel>
                  <FormControl>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => field.onChange("shopping")}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                          field.value === "shopping"
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            : "bg-black border-zinc-800 text-zinc-500"
                        }`}
                      >
                        <ShoppingCart size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Lista</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange("inventory")}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                          field.value === "inventory"
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            : "bg-black border-zinc-800 text-zinc-500"
                        }`}
                      >
                        <Archive size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Despensa</span>
                      </button>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("location") === "shopping" && (
              <FormField
                control={form.control}
                name="shouldMoveToInventory"
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
                        Mover para Despensa ao comprar?
                      </FormLabel>
                      <FormDescription className="text-[10px] text-zinc-500">
                        Se marcado, o item irá para a sua despensa assim que você der "check" na lista.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-12 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    SALVANDO...
                  </>
                ) : (
                  "ADICIONAR AO MERCADO"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
