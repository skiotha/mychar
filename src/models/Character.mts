import type { ObjectId, IndexDescription, Collection, Db } from "mongodb";

export type Race = "Human" | "Elf" | "Dwarf" | "Orc";
export type Sex = "Male" | "Female" | "Other";

export const RACES: readonly Race[] = ["Human", "Elf", "Dwarf", "Orc"] as const;
export const SEXES: readonly Sex[] = ["Male", "Female", "Other"] as const;

export interface Character {
  _id?: ObjectId;
  userId: ObjectId;
  name: string;
  race: Race;
  sex: Sex;
  age: number;
  portraitPath?: string;
  className?: string;
  physicalDescription?: string;
  characterDescription?: string;
  biography?: string;
  skills?: string;
  placeOfOrigin?: string;
  acquaintances?: ObjectId[];
  acceptsHarm?: boolean;
  acceptsDeath?: boolean;
  acceptsRomance?: boolean;
  customCSS?: string;
  customHTML?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NewCharacter = Omit<Character, "_id" | "createdAt" | "updatedAt">;

export const characterValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: [
      "userId",
      "name",
      "race",
      "sex",
      "age",
      "createdAt",
      "updatedAt",
    ],
    additionalProperties: false,
    properties: {
      _id: { bsonType: "objectId" },
      userId: { bsonType: "objectId" },
      name: { bsonType: "string", minLength: 1, maxLength: 100 },
      race: { bsonType: "string", enum: [...RACES] },
      sex: { bsonType: "string", enum: [...SEXES] },
      age: { bsonType: "number", minimum: 1 },
      portraitPath: { bsonType: "string" },
      className: { bsonType: "string", maxLength: 50 },
      physicalDescription: { bsonType: "string", maxLength: 10000 },
      characterDescription: { bsonType: "string", maxLength: 10000 },
      biography: { bsonType: "string", maxLength: 10000 },
      skills: { bsonType: "string", maxLength: 10000 },
      placeOfOrigin: { bsonType: "string", maxLength: 100 },
      acquaintances: {
        bsonType: "array",
        items: { bsonType: "objectId" },
      },
      acceptsHarm: { bsonType: "bool" },
      acceptsDeath: { bsonType: "bool" },
      acceptsRomance: { bsonType: "bool" },
      customCSS: { bsonType: "string", maxLength: 50000 },
      customHTML: { bsonType: "string", maxLength: 50000 },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
    },
  },
} as const;

export const characterIndexes: IndexDescription[] = [
  { key: { userId: 1 } },
  { key: { name: 1 } },
];

export function characters(db: Db): Collection<Character> {
  return db.collection<Character>("characters");
}
