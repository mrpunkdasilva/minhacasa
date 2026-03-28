"use server";

import clientPromise from "@/app/infra/lib/mongodb";
import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { userRepository } from "@/app/infra/lib/user.repository";

async function getUserContext() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await userRepository.findByEmail(session.user.email);
  if (!user || !user.houseUuid) return null;

  return user;
}

export async function createInvoice(data: Omit<InvoiceEntity, "uuid" | "houseUuid" | "ownerUuid"> & { isPrivate?: boolean }) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  const { isPrivate, ...invoiceData } = data;

  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const invoice: InvoiceEntity = {
      ...invoiceData,
      uuid: crypto.randomUUID(),
      houseUuid: user.houseUuid,
      ownerUuid: isPrivate ? user.uuid : undefined,
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
  const user = await getUserContext();
  if (!user) return [];

  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    // Filter by house, but only show private ones if they belong to the current user
    const invoices = await db
      .collection("invoices")
      .find({ 
        houseUuid: user.houseUuid,
        isArchived: { $ne: true },
        $or: [
          { ownerUuid: { $exists: false } },
          { ownerUuid: null },
          { ownerUuid: user.uuid }
        ]
      })
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
      recurrence: doc.recurrence,
      isArchived: doc.isArchived || false,
      houseUuid: doc.houseUuid,
      ownerUuid: doc.ownerUuid,
    })) as InvoiceEntity[];
  } catch (error) {
    console.error("Erro ao buscar faturas:", error);
    return [];
  }
}

export async function getInvoiceByUuid(
  uuid: string,
): Promise<InvoiceEntity | null> {
  const user = await getUserContext();
  if (!user) return null;

  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const doc = await db.collection("invoices").findOne({ 
      uuid,
      houseUuid: user.houseUuid,
      $or: [
        { ownerUuid: { $exists: false } },
        { ownerUuid: null },
        { ownerUuid: user.uuid }
      ]
    });

    if (!doc) return null;

    return {
      uuid: doc.uuid,
      name: doc.name,
      dueDate: new Date(doc.dueDate),
      price: doc.price,
      description: doc.description,
      category: doc.category,
      status: doc.status,
      recurrence: doc.recurrence,
      isArchived: doc.isArchived || false,
      houseUuid: doc.houseUuid,
      ownerUuid: doc.ownerUuid,
    } as InvoiceEntity;
  } catch (error) {
    console.error(`Erro ao buscar fatura ${uuid}:`, error);
    return null;
  }
}

export async function updateInvoiceStatus(uuid: string, status: InvoiceStatus) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const result = await db
      .collection("invoices")
      .updateOne({ uuid, houseUuid: user.houseUuid }, { $set: { status } });

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
  data: Omit<InvoiceEntity, "uuid" | "houseUuid" | "ownerUuid"> & { isPrivate?: boolean }
) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  const { isPrivate, ...invoiceData } = data;

  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const result = await db.collection("invoices").updateOne(
      { uuid, houseUuid: user.houseUuid },
      {
        $set: { 
          ...invoiceData, 
          dueDate: new Date(invoiceData.dueDate), 
          isArchived: false,
          ownerUuid: isPrivate ? user.uuid : null
        },
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
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const result = await db
      .collection("invoices")
      .updateOne({ uuid, houseUuid: user.houseUuid }, { $set: { isArchived: true } });

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
