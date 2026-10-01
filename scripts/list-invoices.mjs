import fs from "node:fs";
import { MongoClient } from "mongodb";

const loadEnv = () => {
  for (const file of [".env.local", ".env"]) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const match = line.match(/^([A-Z_]+)=(.*)$/);
      if (match && process.env[match[1]] === undefined) {
        process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  }
};

loadEnv();

const DB_NAME = process.env.MONGODB_DB || "minhacasa";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

async function listInvoices() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("Conectando ao MongoDB...");
    await client.connect();

    const db = client.db(DB_NAME);
    console.log(`✓ Conectado ao banco '${DB_NAME}'\n`);

    const invoices = await db.collection("invoices").find({}).toArray();

    console.log(`Total de ${invoices.length} fatura(s) encontrada(s):\n`);
    invoices.forEach((inv, index) => {
      console.log(`[${index + 1}] ID: ${inv.id}`);
      console.log(`    Nome: ${inv.name}`);
      console.log(`    Status: ${inv.status}`);
      console.log(
        `    Vencimento: ${new Date(inv.dueDate).toLocaleDateString("pt-BR")}`,
      );
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
