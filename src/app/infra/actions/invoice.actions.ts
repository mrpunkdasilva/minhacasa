"use server";

import clientPromise from "@/app/infra/lib/mongodb";
import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createInvoice(data: Omit<InvoiceEntity, "uuid">) {
  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const invoice: InvoiceEntity = {
      ...data,
      uuid: crypto.randomUUID(),
    };

    const result = await db.collection("invoices").insertOne(invoice);

    if (!result.acknowledged) {
      throw new Error("Falha ao salvar a fatura no banco de dados.");
    }

    revalidatePath("/view/pages/invoices");
  } catch (error) {
    console.error("Erro ao criar fatura:", error);
    throw new Error("Erro interno ao processar sua solicitação.");
  }

  // Redirect after success outside try-catch to avoid catching redirect error
  redirect("/view/pages/invoices");
}

export async function getInvoices(): Promise<InvoiceEntity[]> {
  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const invoices = await db
      .collection("invoices")
      .find({})
      .sort({ dueDate: 1 })
      .toArray();

    return invoices.map((doc) => ({
      uuid: doc.uuid,
      name: doc.name,
      dueDate: new Date(doc.dueDate),
      price: doc.price,
      description: doc.description,
      category: doc.category,
      status: doc.status,
      isRecurring: doc.isRecurring,
    })) as InvoiceEntity[];
  } catch (error) {
    console.error("Erro ao buscar faturas:", error);
    return [];
  }
}
