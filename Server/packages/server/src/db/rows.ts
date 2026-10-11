// Small helpers that turn SQLite values into API values and back.
// SQLite has no true/false and no lists: yes/no is 0/1, lists are JSON text.

// The time now, in the database format: "2026-10-11T14:30:00Z" (UTC, no milliseconds).
export function now(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function toBool(value: number): boolean {
  return value === 1;
}

export function fromBool(value: boolean): number {
  return value ? 1 : 0;
}

// JSON text from the database -> a real list or object. NULL stays the fallback.
export function fromJson<T>(text: string | null, fallback: T): T {
  return text === null ? fallback : (JSON.parse(text) as T);
}

export function toJson(value: unknown): string {
  return JSON.stringify(value);
}

// node:sqlite refuses `undefined`, so a missing value is saved as NULL.
export function orNull<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}

// A value node:sqlite can save. (Only connection.ts imports node:sqlite, so we name it here.)
export type SqlValue = string | number | null;

// Any API value -> a value for SQLite: true/false -> 1/0, lists and objects -> JSON text.
export function toSqlValue(value: unknown): SqlValue {
  if (value === null) return null;
  if (typeof value === "boolean") return fromBool(value);
  if (typeof value === "string" || typeof value === "number") return value;
  return toJson(value);
}
