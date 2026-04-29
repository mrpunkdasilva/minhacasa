import clientPromise from "@/app/infra/lib/mongodb";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import { Category } from "@/app/domain/enums/category/category";

const seedDatabase = async () => {
  const client = await clientPromise;
  const db = client.db("minhacasa");

  try {
    // Get the first house
    const house = await db.collection("houses").findOne({});
    if (!house) {
      console.log("Nenhuma casa encontrada. Execute a autenticação primeiro.");
      return;
    }

    // Clear existing test invoices (those with strange names)
    const result = await db.collection("invoices").deleteMany({
      $or: [
        { name: "asdasd" },
        { name: { $regex: "^test", $options: "i" } },
      ],
    });

    console.log(`${result.deletedCount} faturas de teste removidas`);

    // Create sample invoices with realistic data
    const now = new Date();
    const sampleInvoices = [
      {
        id: `inv-${crypto.randomUUID()}`,
        name: "Energia Elétrica",
        description: "Conta de luz do mês",
        category: Category.UTILITIES,
        price: { amount: 250.5, currency: "BRL" },
        dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 15),
        status: InvoiceStatus.unpaid,
        recurrence: { isRecurring: true },
        houseId: house._id.toString() || house.id,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `inv-${crypto.randomUUID()}`,
        name: "Internet",
        description: "Plano de internet fibra",
        category: Category.SERVICES,
        price: { amount: 99.9, currency: "BRL" },
        dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 10),
        status: InvoiceStatus.unpaid,
        recurrence: { isRecurring: true },
        houseId: house._id.toString() || house.id,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `inv-${crypto.randomUUID()}`,
        name: "Água",
        description: "Conta de água",
        category: Category.UTILITIES,
        price: { amount: 85.0, currency: "BRL" },
        dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 5),
        status: InvoiceStatus.unpaid,
        recurrence: { isRecurring: true },
        houseId: house._id.toString() || house.id,
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Check if invoices already exist
    const existingCount = await db
      .collection("invoices")
      .countDocuments({ houseId: house._id.toString() || house.id });

    if (existingCount === 0) {
      const insertResult = await db
        .collection("invoices")
        .insertMany(sampleInvoices);
      console.log(
        `✓ ${insertResult.insertedCount} faturas de exemplo adicionadas`,
      );
    } else {
      console.log("Faturas já existem, nenhuma nova criada.");
    }
  } catch (error) {
    console.error("Erro ao fazer seed do banco de dados:", error);
  }
};

seedDatabase();

