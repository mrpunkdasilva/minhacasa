"use server";

import clientPromise from "@/app/infra/lib/mongodb";
import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { userRepository } from "@/app/infra/lib/user.repository";
import logger from "@/app/infra/lib/logger";

async function getUserContext() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await userRepository.findByEmail(session.user.email);
  if (!user || !user.houseId) return null;

  return user;
}

export async function createIncome(
  data: Omit<IncomeEntity, "id" | "houseId" | "ownerId" | "createdAt" | "updatedAt"> & {
    isPrivate?: boolean;
  },
) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  const { isPrivate, ...incomeData } = data;

  try {
    logger.info({ userId: user.id, houseId: user.houseId, incomeName: incomeData.name }, "Creating new income");
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const now = new Date();
    const income: IncomeEntity = {
      ...incomeData,
      id: crypto.randomUUID(),
      houseId: user.houseId,
      ownerId: isPrivate ? user.id : undefined,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("incomes").insertOne(income);

    if (!result.acknowledged) {
      throw new Error("Falha ao salvar a entrada no banco de dados.");
    }

    revalidatePath("/incomes");
    revalidatePath("/invoices/analytics");
  } catch (error) {
    logger.error({ error, userId: user.id }, "Error creating income");
    throw new Error("Erro interno ao processar sua solicitação.");
  }

  redirect("/incomes");
}

export async function getIncomes(): Promise<IncomeEntity[]> {
  const user = await getUserContext();
  if (!user) return [];

  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const incomes = await db
      .collection("incomes")
      .find({
        houseId: user.houseId,
        $or: [
          { ownerId: { $exists: false } },
          { ownerId: null },
          { ownerId: user.id },
        ],
      })
      .sort({ date: -1 })
      .toArray();

    return incomes.map((doc) => ({
      id: doc.id,
      name: doc.name,
      date: new Date(doc.date),
      amount: doc.amount,
      description: doc.description,
      category: doc.category,
      recurrence: doc.recurrence,
      houseId: doc.houseId,
      ownerId: doc.ownerId,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    })) as IncomeEntity[];
  } catch (error) {
    logger.error({ error, userId: user?.id }, "Error fetching incomes");
    return [];
  }
}

export async function getIncomeById(id: string): Promise<IncomeEntity | null> {
  const user = await getUserContext();
  if (!user) return null;

  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const doc = await db.collection("incomes").findOne({
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
      date: new Date(doc.date),
      amount: doc.amount,
      description: doc.description,
      category: doc.category,
      recurrence: doc.recurrence,
      houseId: doc.houseId,
      ownerId: doc.ownerId,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    } as IncomeEntity;
  } catch (error) {
    logger.error({ error, incomeId: id, userId: user.id }, "Error fetching income by id");
    return null;
  }
}

export async function updateIncome(
  id: string,
  data: Omit<IncomeEntity, "id" | "houseId" | "ownerId" | "createdAt" | "updatedAt"> & {
    isPrivate?: boolean;
  },
) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  const { isPrivate, ...incomeData } = data;

  try {
    logger.info({ incomeId: id, userId: user.id }, "Updating income");
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const result = await db.collection("incomes").updateOne(
      { id, houseId: user.houseId },
      {
        $set: {
          ...incomeData,
          date: new Date(incomeData.date),
          ownerId: isPrivate ? user.id : null,
          updatedAt: new Date(),
        },
      },
    );

    if (!result.acknowledged) {
      throw new Error("Falha ao atualizar a entrada.");
    }

    revalidatePath("/incomes");
    revalidatePath("/invoices/analytics");
  } catch (error) {
    logger.error({ error, incomeId: id, userId: user.id }, "Error updating income");
    throw new Error("Erro ao atualizar a entrada.");
  }

  redirect("/incomes");
}

export async function deleteIncome(id: string) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  try {
    logger.info({ incomeId: id, userId: user.id }, "Deleting income");
    const client = await clientPromise;
    const db = client.db("minhacasa");

    const result = await db
      .collection("incomes")
      .deleteOne({ id, houseId: user.houseId });

    if (!result.acknowledged) {
      throw new Error("Falha ao excluir a entrada.");
    }

    revalidatePath("/incomes");
    revalidatePath("/invoices/analytics");
  } catch (error) {
    logger.error({ error, incomeId: id, userId: user.id }, "Error deleting income");
    throw new Error("Erro ao excluir a entrada.");
  }

  redirect("/incomes");
}
