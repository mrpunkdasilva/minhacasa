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
  if (!user || !user.houseId) return null;

  return user;
}

export async function createInvoice(
  data: Omit<InvoiceEntity, "id" | "houseId" | "ownerId" | "createdAt" | "updatedAt"> & {
    isPrivate?: boolean;
  },
) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  const { isPrivate, ...invoiceData } = data;

  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const now = new Date();
    const invoice: InvoiceEntity = {
      ...invoiceData,
      id: crypto.randomUUID(),
      houseId: user.houseId,
      ownerId: isPrivate ? user.id : undefined,
      createdAt: now,
      updatedAt: now,
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
        houseId: user.houseId,
        isArchived: { $ne: true },
        $or: [
          { ownerId: { $exists: false } },
          { ownerId: null },
          { ownerId: user.id },
        ],
      })
      .sort({ dueDate: 1 })
      .toArray();

    return invoices.map((doc) => ({
      id: doc.id,
      name: doc.name,
      dueDate: new Date(doc.dueDate),
      price: doc.price,
      description: doc.description,
      category: doc.category,
      status: doc.status,
      recurrence: doc.recurrence,
      isArchived: doc.isArchived || false,
      houseId: doc.houseId,
      ownerId: doc.ownerId,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    })) as InvoiceEntity[];
  } catch (error) {
    console.error("Erro ao buscar faturas:", error);
    return [];
  }
}

export async function getInvoiceById(
  id: string,
): Promise<InvoiceEntity | null> {
  const user = await getUserContext();
  if (!user) return null;

  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const doc = await db.collection("invoices").findOne({
      id,
      houseId: user.houseId,
      $or: [
        { ownerId: { $exists: false } },
        { ownerId: null },
        { ownerId: user.id },
      ],
    });

    if (!doc) return null;

    return {
      id: doc.id,
      name: doc.name,
      dueDate: new Date(doc.dueDate),
      price: doc.price,
      description: doc.description,
      category: doc.category,
      status: doc.status,
      recurrence: doc.recurrence,
      isArchived: doc.isArchived || false,
      houseId: doc.houseId,
      ownerId: doc.ownerId,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    } as InvoiceEntity;
  } catch (error) {
    console.error(`Erro ao buscar fatura ${id}:`, error);
    return null;
  }
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const result = await db
      .collection("invoices")
      .updateOne({ id, houseId: user.houseId }, { $set: { status, updatedAt: new Date() } });

    if (!result.acknowledged) {
      throw new Error("Falha ao atualizar o status da fatura.");
    }

    revalidatePath(`/view/pages/invoices/${id}`);
    revalidatePath("/view/pages/invoices");
    revalidatePath("/");
  } catch (error) {
    console.error(`Erro ao atualizar fatura ${id}:`, error);
    throw new Error("Erro ao atualizar o status da fatura.");
  }
}

export async function updateInvoice(
  id: string,
  data: Omit<InvoiceEntity, "id" | "houseId" | "ownerId" | "createdAt" | "updatedAt"> & {
    isPrivate?: boolean;
  },
) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  const { isPrivate, ...invoiceData } = data;

  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const result = await db.collection("invoices").updateOne(
      { id, houseId: user.houseId },
      {
        $set: {
          ...invoiceData,
          dueDate: new Date(invoiceData.dueDate),
          isArchived: false,
          ownerId: isPrivate ? user.id : null,
          updatedAt: new Date(),
        },
      },
    );

    if (!result.acknowledged) {
      throw new Error("Falha ao atualizar a fatura.");
    }

    revalidatePath(`/view/pages/invoices/${id}`);
    revalidatePath("/view/pages/invoices");
    revalidatePath("/");
  } catch (error) {
    console.error(`Erro ao atualizar fatura ${id}:`, error);
    throw new Error("Erro ao atualizar a fatura.");
  }

  redirect(`/view/pages/invoices/${id}`);
}

export async function archiveInvoice(id: string) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const result = await db
      .collection("invoices")
      .updateOne(
        { id, houseId: user.houseId },
        { $set: { isArchived: true, updatedAt: new Date() } },
      );

    if (!result.acknowledged) {
      throw new Error("Falha ao arquivar a fatura.");
    }

    revalidatePath("/view/pages/invoices");
    revalidatePath("/");
  } catch (error) {
    console.error(`Erro ao arquivar fatura ${id}:`, error);
    throw new Error("Erro ao arquivar a fatura.");
  }

  redirect("/view/pages/invoices");
}
