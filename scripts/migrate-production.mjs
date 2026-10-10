import fs from "node:fs";
import path from "node:path";
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
const SOURCE_DB = process.env.MIGRATE_SOURCE_DB || "test";
const TARGET_DB = process.env.MONGODB_DB || "minhacasa";
const APPLY = process.argv.includes("--apply");
const BACKUP_ONLY = process.argv.includes("--backup-only");
const BACKUP_ROOT = path.join("scripts", ".backup");

/**
 * This project develops against a local MongoDB only. The script keeps its name
 * for history, but it must never be able to write to a remote cluster: a
 * mistaken run against Atlas would rewrite live data. Writes therefore require
 * a local host plus an explicit --allow-remote to opt out.
 */
const LOCAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "mongodb",
]);
const targetHost = (() => {
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
const isLocal = LOCAL_HOSTS.has(targetHost);

if (!isLocal && !process.argv.includes("--allow-remote")) {
  console.error(
    `Recusando executar: "${targetHost || MONGODB_URI}" nao e um Mongo local.\n` +
      "Este projeto usa apenas o Mongo local. Nenhum dado remoto sera lido ou escrito.\n" +
      "Se realmente for necessario, use --allow-remote de forma explicita.",
  );
  process.exit(1);
}

const COPY_COLLECTIONS = [
  "users",
  "houses",
  "pets",
  "pet_health_records",
  "pet_services",
  "pet_nutrition",
  "market_items",
  "wishlist_items",
];

const INVOICE_STATUS = ["unpaid", "paid", "overdue", "scheduled"];

const CATEGORY_MAP = {
  Food: "Alimentação",
  Market: "Mercado",
  Housing: "Moradia",
  Transport: "Transporte",
  Utilities: "Utilidades",
  Services: "Serviços",
  Entertainment: "Lazer",
  Education: "Educação",
  Health: "Saúde",
  Others: "Outros",
};

const conflicts = [];
const note = (collection, identifier, problem, detail) =>
  conflicts.push({ collection, identifier, problem, detail });

const docKey = (doc) => doc.id ?? doc.uuid ?? String(doc._id);

const bsonReplacer = (_key, value) =>
  value && value._bsontype === "ObjectId"
    ? { $oid: value.toHexString() }
    : value;

async function backup(client) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(BACKUP_ROOT, stamp);
  fs.mkdirSync(dir, { recursive: true });

  for (const dbName of [SOURCE_DB, TARGET_DB]) {
    const db = client.db(dbName);
    const collections = (await db.listCollections().toArray()).map(
      (c) => c.name,
    );
    for (const collection of collections) {
      const docs = await db.collection(collection).find({}).toArray();
      fs.writeFileSync(
        path.join(dir, `${dbName}.${collection}.json`),
        JSON.stringify(docs, bsonReplacer, 2),
      );
    }
  }

  console.log(`\n✓ Backup gravado em ${dir}`);
  return dir;
}

function normalizeUser(doc) {
  const set = {};
  if (!doc.id && doc.uuid) set.id = doc.uuid;
  if ((!doc.houseId || doc.houseId === "") && doc.houseUuid)
    set.houseId = doc.houseUuid;
  if (doc.houseId && doc.houseUuid && doc.houseId !== doc.houseUuid) {
    note("users", docKey(doc), "houseId e houseUuid divergem", {
      houseId: doc.houseId,
      houseUuid: doc.houseUuid,
      kept: doc.houseId,
    });
  }
  if (!doc.createdAt) set.createdAt = new Date();
  if (!doc.updatedAt) set.updatedAt = new Date();
  return set;
}

function normalizeHouse(doc) {
  const set = {};
  if (!doc.id && doc.uuid) set.id = doc.uuid;
  if (!doc.createdById && doc.createdByUuid)
    set.createdById = doc.createdByUuid;
  // Read the pending value too, otherwise a house we just fixed from
  // createdByUuid would still be reported as an unresolvable conflict.
  if (!doc.createdById && !set.createdById) {
    note("houses", docKey(doc), "createdById ausente e sem createdByUuid", {
      name: doc.name,
    });
  }
  if (!doc.createdAt) set.createdAt = new Date();
  if (!doc.updatedAt) set.updatedAt = new Date();
  return set;
}

function normalizeInvoice(doc) {
  const set = {};
  if (!doc.id && doc.uuid) set.id = doc.uuid;

  if (typeof doc.price === "number") {
    set.price = { amount: doc.price, currency: "BRL" };
  } else if (doc.price && typeof doc.price.amount !== "number") {
    note("invoices", docKey(doc), "price em formato desconhecido", {
      price: doc.price,
    });
  }

  if (typeof doc.status === "number") {
    set.status = INVOICE_STATUS[doc.status] ?? "unpaid";
  }

  if (typeof doc.category === "string") {
    const legacy = CATEGORY_MAP[doc.category];
    const alreadyCurrent = Object.values(CATEGORY_MAP).includes(doc.category);
    if (legacy) set.category = legacy;
    else if (!alreadyCurrent) {
      note("invoices", docKey(doc), "categoria desconhecida, mantida", {
        category: doc.category,
      });
    }
  }

  if (!doc.recurrence) {
    set.recurrence = { isRecurring: Boolean(doc.isRecurring) };
  }
  if (!doc.isArchived) set.isArchived = false;
  if (!doc.houseId) {
    note(
      "invoices",
      docKey(doc),
      "houseId ausente - fatura orfa, NAO atribuida",
      {
        name: doc.name,
      },
    );
  }
  if (!doc.createdAt) set.createdAt = new Date();
  if (!doc.updatedAt) set.updatedAt = new Date();
  return set;
}

function normalizeTimestamps(doc) {
  const set = {};
  if (!doc.createdAt) set.createdAt = new Date();
  if (!doc.updatedAt) set.updatedAt = new Date();
  return set;
}

const NORMALIZERS = {
  users: normalizeUser,
  houses: normalizeHouse,
  invoices: normalizeInvoice,
};

async function run() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  const source = client.db(SOURCE_DB);
  const target = client.db(TARGET_DB);

  console.log(`Origem:  ${SOURCE_DB}`);
  console.log(`Destino: ${TARGET_DB}`);
  console.log(
    `Modo:    ${APPLY ? "APPLY (escreve no banco)" : "DRY RUN (nada e escrito)"}`,
  );

  if (APPLY) {
    await backup(client);
  }
  if (BACKUP_ONLY) {
    await client.close();
    return;
  }

  const sourceCollections = (await source.listCollections().toArray()).map(
    (c) => c.name,
  );
  const targetCollections = (await target.listCollections().toArray()).map(
    (c) => c.name,
  );

  console.log(
    `\nOrigem  (${sourceCollections.length}): ${sourceCollections.join(", ") || "(vazio)"}`,
  );
  console.log(
    `Destino (${targetCollections.length}): ${targetCollections.join(", ") || "(vazio)"}`,
  );

  // --- Phase 1: copy collections that only exist in the source ---
  console.log("\n=== Fase 1: copiar colecoes ===");
  const copied = {};
  const pendingByCollection = {};
  for (const collection of COPY_COLLECTIONS) {
    if (!sourceCollections.includes(collection)) continue;

    const docs = await source.collection(collection).find({}).toArray();
    const existing = targetCollections.includes(collection)
      ? new Set(
          (await target.collection(collection).find({}).toArray()).map(docKey),
        )
      : new Set();

    const toInsert = docs.filter((doc) => !existing.has(docKey(doc)));
    copied[collection] = toInsert.length;
    pendingByCollection[collection] = toInsert;

    if (toInsert.length > 0) {
      console.log(
        `  ${collection}: ${toInsert.length} a copiar de ${docs.length}`,
      );
      if (APPLY) {
        await target
          .collection(collection)
          .insertMany(toInsert, { ordered: false });
      }
    } else {
      console.log(
        `  ${collection}: ja presente (${docs.length} docs, nada a fazer)`,
      );
    }
  }

  /**
   * Documents a collection will hold once this run finishes. On a dry run the
   * copy has not happened yet, so the pending documents must be added
   * in-memory; otherwise every report below would see an empty collection.
   */
  const effectiveDocs = async (collection) => {
    const existing = await target.collection(collection).find({}).toArray();
    if (APPLY) return existing;
    return [...existing, ...(pendingByCollection[collection] ?? [])];
  };

  // --- Phase 2: normalize every document in the target ---
  console.log("\n=== Fase 2: normalizar documentos ===");
  const after = new Set([
    ...(await target.listCollections().toArray()).map((c) => c.name),
    ...COPY_COLLECTIONS,
  ]);

  for (const collection of [...after].sort()) {
    const normalizer = NORMALIZERS[collection] ?? normalizeTimestamps;
    const pending = APPLY ? [] : (pendingByCollection[collection] ?? []);
    const docs = await effectiveDocs(collection);
    if (pending.length > 0) {
      console.log(
        `  ${collection}: (dry run) incluindo ${pending.length} docs que serao copiados`,
      );
    }

    let changed = 0;
    for (const doc of docs) {
      const set = normalizer(doc);
      if (Object.keys(set).length === 0) continue;
      changed += 1;
      const fields = Object.keys(set).join(", ");
      console.log(`  ${collection} [${docKey(doc)}] -> ${fields}`);
      if (APPLY) {
        await target
          .collection(collection)
          .updateOne({ _id: doc._id }, { $set: set });
      }
    }

    if (changed === 0)
      console.log(`  ${collection}: ja normalizado (${docs.length} docs)`);
  }

  // --- Report ---
  console.log("\n=== Conflitos que exigem decisao manual ===");
  if (conflicts.length === 0) {
    console.log("  nenhum");
  } else {
    for (const c of conflicts) {
      console.log(`  [${c.collection}] ${c.identifier}: ${c.problem}`);
      console.log(`      ${JSON.stringify(c.detail)}`);
    }
  }

  // --- Orphan report: houses and documents nobody points at ---
  console.log("\n=== Casas sem nenhuma referencia (candidatas a lixo) ===");
  const houseDocs = await effectiveDocs("houses");
  if (houseDocs.length > 0) {
    const referenced = new Set();
    for (const collection of [
      "users",
      "pets",
      "market_items",
      "wishlist_items",
      "invoices",
    ]) {
      const docs = await effectiveDocs(collection);
      for (const doc of docs) {
        for (const value of [doc.houseId, doc.houseUuid]) {
          if (value) referenced.add(value);
        }
      }
    }
    const orphans = houseDocs.filter((h) => !referenced.has(h.id ?? h.uuid));
    for (const h of orphans) {
      console.log(
        `  ${h.id ?? h.uuid}  nome="${h.name}"  convite=${h.inviteCode ?? "-"}`,
      );
    }
    if (orphans.length === 0) console.log("  nenhuma");
  } else {
    console.log("  (nenhuma casa encontrada)");
  }

  console.log(
    `\n${APPLY ? "Migracao aplicada." : "Dry run. Rode com --apply para gravar."}`,
  );
  await client.close();
}

run().catch((error) => {
  console.error("Erro:", error);
  process.exit(1);
});
