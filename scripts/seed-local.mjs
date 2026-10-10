/**
 * Seeds the LOCAL development database with one house and one user.
 *
 * The local `minhacasa` database starts empty, so there is nothing to log in
 * with until something is seeded. This never touches a remote cluster: it
 * refuses to run against anything that is not a local MongoDB.
 *
 * Usage: node scripts/seed-local.mjs [--password <senha>]
 */
import fs from "node:fs";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

for (const file of [".env.local", ".env"]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGODB_DB || "minhacasa";

const LOCAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "mongodb",
]);
const host = (() => {
  try {
    return new URL(
      MONGODB_URI.replace(/^mongodb\+srv:/, "https:").replace(
        /^mongodb:/,
        "http:",
      ),
    ).hostname;
  } catch {
    return "";
  }
})();

if (!LOCAL_HOSTS.has(host)) {
  console.error(
    `Recusando executar: "${host || MONGODB_URI}" nao e um Mongo local. ` +
      "Este script existe apenas para desenvolvimento local.",
  );
  process.exit(1);
}

const passwordIndex = process.argv.indexOf("--password");
const PASSWORD =
  passwordIndex > -1 ? process.argv[passwordIndex + 1] : "dev123456";
const EMAIL = process.env.SEED_EMAIL || "dev@minhacasa.local";
const NAME = process.env.SEED_NAME || "Morador Dev";

const now = new Date();
const houseId = crypto.randomUUID();
const userId = crypto.randomUUID();

const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
await client.connect();
const db = client.db(DB_NAME);

try {
  const existing = await db.collection("users").findOne({ email: EMAIL });
  if (existing) {
    console.log(
      `Usuario ${EMAIL} ja existe no banco "${DB_NAME}". Nada a fazer.`,
    );
  } else {
    const password = await bcrypt.hash(PASSWORD, 10);

    await db.collection("houses").insertOne({
      id: houseId,
      name: "Casa Dev",
      inviteCode: "CASA-LOCAL",
      createdById: userId,
      createdAt: now,
      updatedAt: now,
    });

    await db.collection("users").insertOne({
      id: userId,
      name: NAME,
      email: EMAIL,
      password,
      houseId,
      avatarUrl: null,
      createdAt: now,
      updatedAt: now,
    });

    console.log(`Seed concluido no banco local "${DB_NAME}":`);
    console.log(`  email    : ${EMAIL}`);
    console.log(`  senha    : ${PASSWORD}`);
    console.log(`  houseId  : ${houseId}`);
  }
} finally {
  await client.close();
}
