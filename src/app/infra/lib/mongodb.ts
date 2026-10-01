import { Db, Document, MongoClient, MongoClientOptions } from "mongodb";
import logger from "./logger";

if (!process.env.MONGODB_URI) {
  logger.error("MONGODB_URI is not defined");
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

/**
 * Canonical database name. Previously the connection string carried no database
 * segment, so `client.db()` silently resolved to the driver default ("test"),
 * splitting the data across two databases.
 */
export const DB_NAME = process.env.MONGODB_DB || "minhacasa";

const options: MongoClientOptions = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  retryReads: true,
  retryWrites: true,
};

const MAX_CONNECT_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 250;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let clientPromise: Promise<MongoClient> | null = null;

async function connect(): Promise<MongoClient> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_CONNECT_ATTEMPTS; attempt++) {
    try {
      const client = new MongoClient(uri, options);
      return await client.connect();
    } catch (error) {
      lastError = error;
      logger.warn(
        { attempt, maxAttempts: MAX_CONNECT_ATTEMPTS, error },
        "MongoDB connection failed",
      );

      if (attempt < MAX_CONNECT_ATTEMPTS) {
        await sleep(RETRY_BASE_DELAY_MS * attempt);
      }
    }
  }

  throw lastError;
}

/**
 * Returns a shared MongoClient, connecting on first use.
 *
 * A failed attempt is not cached: the cached promise is cleared so a later
 * call retries instead of replaying the rejection for the lifetime of the
 * process (a cold-start EPIPE previously poisoned every query in the
 * container until it was recycled).
 */
export function getClient(): Promise<MongoClient> {
  if (!clientPromise) {
    clientPromise = connect().catch((error) => {
      clientPromise = null;
      throw error;
    });
  }

  return clientPromise;
}

/**
 * Returns the canonical database. Use this instead of `client.db()`, which
 * falls back to the driver default when the URI has no database segment.
 */
export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(DB_NAME);
}

/**
 * Bridges a domain entity to the shape the driver requires.
 *
 * The driver constrains its schema generic to `Document` (an index signature),
 * but domain entities are plain interfaces kept free of any MongoDB import so
 * the domain layer stays independent of the infrastructure layer. Intersecting
 * the two satisfies the constraint and, unlike an `as any` cast, keeps field
 * types checked on filters, updates and inserts.
 */
export type Doc<T> = T & Document;

export default getClient;
