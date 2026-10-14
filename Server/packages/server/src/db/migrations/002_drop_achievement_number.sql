-- Achievements lose the "number" column: the number is already in the text
-- (like "Cut API time by 40%"), so it was written twice. Decided on 2026-10-14.
-- The CV "number check" (docs/DATABASE.md, part 8) works on claims, not on this column.
ALTER TABLE achievements DROP COLUMN number;
