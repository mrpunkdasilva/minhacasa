import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import fs from "node:fs";

for (const file of [".env.local", ".env"]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) {
      process.env[match[1]] ??= match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGODB_DB || "minhacasa";
const [email, newPassword] = process.argv.slice(2);

async function resetPassword() {
  if (!email || !newPassword) {
    console.error("Uso: node scripts/reset-password.mjs <email> <nova-senha>");
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error("A senha deve ter pelo menos 6 caracteres.");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const users = db.collection("users");

    const user = await users.findOne({ email });
    if (!user) {
      console.error(`Usuário não encontrado: ${email}`);
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await users.updateOne({ email }, { $set: { password: hashedPassword } });

    console.log(`✓ Senha atualizada para ${email} (banco "${DB_NAME}")`);
  } catch (error) {
    console.error("Erro:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

resetPassword();
