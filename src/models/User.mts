import type { ObjectId, Collection, Db, IndexDescription } from "mongodb";

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  bio?: string;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type NewUser = Pick<User, "username" | "email" | "passwordHash">;

export const userValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: [
      "username",
      "email",
      "passwordHash",
      "joinedAt",
      "createdAt",
      "updatedAt",
    ],
    additionalProperties: false,
    properties: {
      _id: { bsonType: "objectId" },
      username: { bsonType: "string", minLength: 3, maxLength: 16 },
      email: { bsonType: "string" },
      passwordHash: { bsonType: "string" },
      avatar: { bsonType: "string" },
      bio: { bsonType: "string", maxLength: 500 },
      joinedAt: { bsonType: "date" },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
    },
  },
} as const;

export const userIndexes: IndexDescription[] = [
  { key: { username: 1 }, unique: true },
  { key: { email: 1 }, unique: true },
];

export function users(db: Db): Collection<User> {
  return db.collection<User>("users");
}
