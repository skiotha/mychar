import { MongoClient, type Db, type IndexDescription } from "mongodb";
import config from "#config";
import { userValidator, userIndexes } from "./User.mjs";
import { commentIndexes, commentValidator } from "./Comment.mjs";
import { characterIndexes, characterValidator } from "./Character.mjs";

const { host, port, dbName } = config.dbParams;
const MONGO_URI = `mongodb://${host}:${port}`;

let client: MongoClient | null = null;
let db: Db | null = null;

/** Connect and return the database handle. Reuses existing connection. */
export async function connect(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(dbName);

  await ensureCollections(db);
  return db;
}

/** Graceful shutdown. */
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
