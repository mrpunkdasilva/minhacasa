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

async function cleanTestData() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("Conectando ao MongoDB...");
    await client.connect();

    const db = client.db(DB_NAME);
    console.log(`✓ Conectado ao banco '${DB_NAME}'\n`);

    console.log("Limpando dados de teste...\n");

    // Delete test invoices
    const invoicesResult = await db.collection("invoices").deleteMany({
      $or: [{ name: "asdasd" }, { name: { $regex: "^test", $options: "i" } }],
    });

    if (invoicesResult.deletedCount > 0) {
      console.log(
        `✓ ${invoicesResult.deletedCount} faturas de teste removidas`,
      );
    } else {
      console.log("✓ Nenhuma fatura de teste encontrada");
    }

    // Delete test markets
    const marketsResult = await db.collection("markets").deleteMany({
      $or: [{ name: { $regex: "^test", $options: "i" } }, { name: "asdasd" }],
    });

    if (marketsResult.deletedCount > 0) {
      console.log(
        `✓ ${marketsResult.deletedCount} itens de mercado de teste removidos`,
      );
    }

    // Delete test wishlist items
    const wishlistResult = await db.collection("wishlist_items").deleteMany({
      $or: [{ name: { $regex: "^test", $options: "i" } }, { name: "asdasd" }],
    });

    if (wishlistResult.deletedCount > 0) {
      console.log(
        `✓ ${wishlistResult.deletedCount} itens de wishlist de teste removidos`,
      );
    }

    console.log("\n✓ Limpeza concluída com sucesso!");
  } catch (error) {
    console.error("Erro ao limpar dados de teste:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

cleanTestData();
