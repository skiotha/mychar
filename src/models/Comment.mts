import type { Collection, Db, IndexDescription, ObjectId } from "mongodb";

export interface Comment {
  _id?: ObjectId;
  characterId: ObjectId;
  userId: ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NewComment = Pick<Comment, "characterId" | "userId" | "content">;

export const commentValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["characterId", "userId", "content", "createdAt", "updatedAt"],
    additionalProperties: false,
    properties: {
      _id: { bsonType: "objectId" },
      characterId: { bsonType: "objectId" },
      userId: { bsonType: "objectId" },
      content: { bsonType: "string", minLength: 1 },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
    },
  },
} as const;

export const commentIndexes: IndexDescription[] = [
  { key: { characterId: 1 } },
  { key: { userId: 1 } },
];

export function comments(db: Db): Collection<Comment> {
  return db.collection<Comment>("comments");
}
