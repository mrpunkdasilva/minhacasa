"use server";

import clientPromise from "@/app/infra/lib/mongodb";
import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
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

  redirect("/view/pages/invoices");
}

export async function getInvoices(): Promise<InvoiceEntity[]> {
  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const invoices = await db
      .collection("invoices")
      .find({ isArchived: { $ne: true } })
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
      isArchived: doc.isArchived || false,
    })) as InvoiceEntity[];
  } catch (error) {
    console.error("Erro ao buscar faturas:", error);
    return [];
  }
}

export async function getInvoiceByUuid(
  uuid: string,
): Promise<InvoiceEntity | null> {
  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const doc = await db.collection("invoices").findOne({ uuid });

    if (!doc) return null;

    return {
      uuid: doc.uuid,
      name: doc.name,
      dueDate: new Date(doc.dueDate),
      price: doc.price,
      description: doc.description,
      category: doc.category,
      status: doc.status,
      isRecurring: doc.isRecurring,
      isArchived: doc.isArchived || false,
    } as InvoiceEntity;
  } catch (error) {
    console.error(`Erro ao buscar fatura ${uuid}:`, error);
    return null;
  }
}

export async function updateInvoiceStatus(uuid: string, status: InvoiceStatus) {
  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const result = await db
      .collection("invoices")
      .updateOne({ uuid }, { $set: { status } });

    if (!result.acknowledged) {
      throw new Error("Falha ao atualizar o status da fatura.");
    }

    revalidatePath(`/view/pages/invoices/${uuid}`);
    revalidatePath("/view/pages/invoices");
    revalidatePath("/");
  } catch (error) {
    console.error(`Erro ao atualizar fatura ${uuid}:`, error);
    throw new Error("Erro ao atualizar o status da fatura.");
  }
}

export async function updateInvoice(
  uuid: string,
  data: Omit<InvoiceEntity, "uuid">,
) {
  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const result = await db.collection("invoices").updateOne(
      { uuid },
      {
        $set: { ...data, dueDate: new Date(data.dueDate), isArchived: false },
      },
    );

    if (!result.acknowledged) {
      throw new Error("Falha ao atualizar a fatura.");
    }

    revalidatePath(`/view/pages/invoices/${uuid}`);
    revalidatePath("/view/pages/invoices");
    revalidatePath("/");
  } catch (error) {
    console.error(`Erro ao atualizar fatura ${uuid}:`, error);
    throw new Error("Erro ao atualizar a fatura.");
  }

  redirect(`/view/pages/invoices/${uuid}`);
}

export async function archiveInvoice(uuid: string) {
  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const result = await db
      .collection("invoices")
      .updateOne({ uuid }, { $set: { isArchived: true } });

    if (!result.acknowledged) {
      throw new Error("Falha ao arquivar a fatura.");
    }

    revalidatePath("/view/pages/invoices");
    revalidatePath("/");
  } catch (error) {
    console.error(`Erro ao arquivar fatura ${uuid}:`, error);
    throw new Error("Erro ao arquivar a fatura.");
  }

  redirect("/view/pages/invoices");
}
