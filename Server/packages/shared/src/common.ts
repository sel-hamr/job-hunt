import { z } from "zod";

// Building blocks used by every other shape. Rules: docs/SHARED.md, part 6.

export const IdSchema = z.number().int().positive();
export type Id = z.infer<typeof IdSchema>;

// CVs often show only the year or the month: "2022", "2022-03", "2022-03-15".
export const CvDateSchema = z
  .string()
  .regex(/^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/, "Use YYYY, YYYY-MM or YYYY-MM-DD");
export type CvDate = z.infer<typeof CvDateSchema>;

// A full day only: "2026-10-10".
export const DayDateSchema = z.iso.date();
export type DayDate = z.infer<typeof DayDateSchema>;

// UTC time, no milliseconds: "2026-10-10T14:30:00Z".
export const TimestampSchema = z.iso.datetime({ precision: 0 });
export type Timestamp = z.infer<typeof TimestampSchema>;

export const SOURCES = ["imported", "manual"] as const;
export const SourceSchema = z.enum(SOURCES);
export type Source = z.infer<typeof SourceSchema>;

// Added to every profile item. The server sets these, never the input.
export const CheckFieldsSchema = z.object({
  source: SourceSchema,
  checked: z.boolean(),
  checked_at: TimestampSchema.nullable(),
});
export type CheckFields = z.infer<typeof CheckFieldsSchema>;

export const LinkSchema = z.object({
  label: z.string().trim().min(1),
  url: z.url({ protocol: /^https?$/ }),
});
export type Link = z.infer<typeof LinkSchema>;

export const CountryCodeSchema = z.string().regex(/^[A-Z]{2}$/, "Use 2 capital letters, like MA");
export type CountryCode = z.infer<typeof CountryCodeSchema>;

export const CurrencyCodeSchema = z.string().regex(/^[A-Z]{3}$/, "Use 3 capital letters, like MAD");
export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;

// Query values arrive as text ("20"), so coerce them to numbers.
export const PageQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type PageQuery = z.infer<typeof PageQuerySchema>;
