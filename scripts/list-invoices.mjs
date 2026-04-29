import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

async function listInvoices() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("Conectando ao MongoDB...");
    await client.connect();

    const db = client.db("minhacasa");
    console.log("✓ Conectado ao banco 'minhacasa'\n");

    const invoices = await db.collection("invoices").find({}).toArray();

    console.log(`Total de ${invoices.length} fatura(s) encontrada(s):\n`);
    invoices.forEach((inv, index) => {
      console.log(`[${index + 1}] ID: ${inv.id}`);
      console.log(`    Nome: ${inv.name}`);
      console.log(`    Status: ${inv.status}`);
      console.log(`    Vencimento: ${new Date(inv.dueDate).toLocaleDateString("pt-BR")}`);
      console.log(`    Valor: R$ ${inv.price.amount}`);
      console.log("");
    });

  } catch (error) {
    console.error("Erro:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

listInvoices();

