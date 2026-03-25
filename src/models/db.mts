import { MongoClient, type Db, type IndexDescription } from "mongodb";
import config from "#config";
import { userValidator, userIndexes } from "./User.mts";
import { commentIndexes, commentValidator } from "./Comment.mts";
import { characterIndexes, characterValidator } from "./Character.mts";

const { host, port, dbName } = config.dbParams;
const MONGO_URI = `mongodb://${host}:${port}`;

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connect(): Promise<void> {
  if (db) return;

  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(dbName);

  await ensureCollections(db);
}

export function getDb(): Db {
  if (!db) throw new Error("Database not connected. Call connect() first.");
  return db;
}

export async function disconnect(): Promise<void> {
  await client?.close();
  client = null;
  db = null;
}

// ─── Collection Setup ────────────────────────────────────────

interface CollectionSpec {
  name: string;
  validator: Record<string, unknown>;
  indexes: IndexDescription[];
}

const collections: CollectionSpec[] = [
  { name: "users", validator: userValidator, indexes: userIndexes },
  { name: "comments", validator: commentValidator, indexes: commentIndexes },
  {
    name: "characters",
    validator: characterValidator,
    indexes: characterIndexes,
  },
];

async function ensureCollections(db: Db): Promise<void> {
  const existing = new Set(
    (await db.listCollections().toArray()).map((c) => c.name),
  );

  for (const spec of collections) {
    if (existing.has(spec.name)) {
      // Update validator on existing collection
      await db.command({ collMod: spec.name, validator: spec.validator });
    } else {
      await db.createCollection(spec.name, { validator: spec.validator });
    }

    if (spec.indexes.length > 0) {
      await db.collection(spec.name).createIndexes(spec.indexes);
    }
  }
}
