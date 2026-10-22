import type { Experience, Project, Skill, SkillProof, SkillWithYears } from "@jobhunt/shared";

// The years of a skill are counted, never saved (docs/DATABASE.md, part 9).
// Only a checked proof that points to a checked job or project counts.
// Education and certificates prove a skill, but they give no years.

// Months since year 0, both ends included.
type Span = { from: number; to: number };

// "2022" starts in January and ends in December. "2022-03" and "2022-03-15" are March.
const month = (date: string, yearOnly: number) =>
  Number(date.slice(0, 4)) * 12 + (date.length > 4 ? Number(date.slice(5, 7)) - 1 : yearOnly);
const firstMonth = (date: string) => month(date, 0);
const lastMonth = (date: string) => month(date, 11);

// Overlapping time counts once.
function countMonths(spans: Span[]): number {
  let months = 0;
  let countedUntil = -Infinity;
  for (const { from, to } of [...spans].sort((a, b) => a.from - b.from)) {
    const start = Math.max(from, countedUntil + 1);
    if (to >= start) months += to - start + 1;
    countedUntil = Math.max(countedUntil, to);
  }
  return months;
}

// One decimal, rounded down: a fact is never rounded up. 31 months = 2.5 years.
const toYears = (months: number) => Math.floor((months * 10) / 12) / 10;

export function addSkillYears(
  skills: Skill[],
  proofs: SkillProof[],
  experiences: Experience[],
  projects: Project[],
  today = new Date(),
): SkillWithYears[] {
  const now = today.getUTCFullYear() * 12 + today.getUTCMonth();
  // Time after today doesn't count yet.
  const upToNow = (from: number, to: number): Span | undefined =>
    from > now ? undefined : { from, to: Math.min(to, now) };

  // A job with no end date is still going, so it counts until today.
  const jobSpans = new Map(
    experiences
      .filter((e) => e.checked)
      .map((e) => [e.id, upToNow(firstMonth(e.start_date), e.end_date ? lastMonth(e.end_date) : now)]),
  );
  // A project with no end date counts only its start month: it may have stopped long ago.
  // A project with no start date can't be counted.
  const projectSpans = new Map(
    projects.flatMap((p) =>
      p.checked && p.start_date
        ? [[p.id, upToNow(firstMonth(p.start_date), p.end_date ? lastMonth(p.end_date) : firstMonth(p.start_date))] as const]
        : [],
    ),
  );

  const spansBySkill = new Map<number, { all: Span[]; work: Span[] }>();
  for (const proof of proofs) {
    if (!proof.checked) continue;
    const job = proof.experience_id !== null ? jobSpans.get(proof.experience_id) : undefined;
    const span = job ?? (proof.project_id !== null ? projectSpans.get(proof.project_id) : undefined);
    if (!span) continue;

    const spans = spansBySkill.get(proof.skill_id) ?? { all: [], work: [] };
    spans.all.push(span);
    if (job) spans.work.push(job);
    spansBySkill.set(proof.skill_id, spans);
  }

  return skills.map((skill) => {
    const spans = spansBySkill.get(skill.id);
    return {
      ...skill,
      years: toYears(countMonths(spans?.all ?? [])),
      work_years: toYears(countMonths(spans?.work ?? [])),
    };
  });
}
