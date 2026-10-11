-- 001_profile.sql: the profile tables (docs/DATABASE.md, part 5).
-- migrate.ts runs this inside a transaction. No BEGIN / COMMIT here.

-- About me. Always exactly 1 row (id = 1).
CREATE TABLE profile (
  id          INTEGER PRIMARY KEY CHECK (id = 1),
  name        TEXT NOT NULL,
  headline    TEXT,
  email       TEXT,
  phone       TEXT,
  city        TEXT,
  country     TEXT CHECK (country IS NULL OR length(country) = 2),
  summary     TEXT,
  links       TEXT CHECK (links IS NULL OR json_valid(links)),
  checked     INTEGER NOT NULL DEFAULT 0 CHECK (checked IN (0, 1)),
  checked_at  TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK ((checked = 0 AND checked_at IS NULL) OR (checked = 1 AND checked_at IS NOT NULL))
) STRICT;

-- My jobs.
CREATE TABLE experiences (
  id          INTEGER PRIMARY KEY,
  company     TEXT NOT NULL,
  position    TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('full-time', 'part-time', 'intern', 'freelance', 'volunteer')),
  city        TEXT,
  remote      INTEGER NOT NULL DEFAULT 0 CHECK (remote IN (0, 1)),
  start_date  TEXT NOT NULL,
  end_date    TEXT,
  summary     TEXT,
  source      TEXT NOT NULL CHECK (source IN ('imported', 'manual')),
  checked     INTEGER NOT NULL DEFAULT 0 CHECK (checked IN (0, 1)),
  checked_at  TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK ((checked = 0 AND checked_at IS NULL) OR (checked = 1 AND checked_at IS NOT NULL))
) STRICT;

-- Portfolio.
CREATE TABLE projects (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  role        TEXT,
  description TEXT,
  links       TEXT CHECK (links IS NULL OR json_valid(links)),
  start_date  TEXT,
  end_date    TEXT,
  source      TEXT NOT NULL CHECK (source IN ('imported', 'manual')),
  checked     INTEGER NOT NULL DEFAULT 0 CHECK (checked IN (0, 1)),
  checked_at  TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK ((checked = 0 AND checked_at IS NULL) OR (checked = 1 AND checked_at IS NOT NULL))
) STRICT;

CREATE TABLE education (
  id          INTEGER PRIMARY KEY,
  school      TEXT NOT NULL,
  degree      TEXT NOT NULL,
  field       TEXT,
  start_date  TEXT,
  end_date    TEXT,
  grade       TEXT,
  source      TEXT NOT NULL CHECK (source IN ('imported', 'manual')),
  checked     INTEGER NOT NULL DEFAULT 0 CHECK (checked IN (0, 1)),
  checked_at  TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK ((checked = 0 AND checked_at IS NULL) OR (checked = 1 AND checked_at IS NOT NULL))
) STRICT;

CREATE TABLE certificates (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  issuer      TEXT NOT NULL,
  date        TEXT NOT NULL,
  expires     TEXT,
  link        TEXT,
  source      TEXT NOT NULL CHECK (source IN ('imported', 'manual')),
  checked     INTEGER NOT NULL DEFAULT 0 CHECK (checked IN (0, 1)),
  checked_at  TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK ((checked = 0 AND checked_at IS NULL) OR (checked = 1 AND checked_at IS NOT NULL))
) STRICT;

-- "Node.js" and "node.js" are the same skill (COLLATE NOCASE).
CREATE TABLE skills (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE COLLATE NOCASE,
  other_names TEXT CHECK (other_names IS NULL OR json_valid(other_names)),
  category    TEXT NOT NULL CHECK (category IN ('language', 'framework', 'tool', 'soft skill')),
  level       TEXT NOT NULL CHECK (level IN ('beginner', 'good', 'expert')),
  source      TEXT NOT NULL CHECK (source IN ('imported', 'manual')),
  checked     INTEGER NOT NULL DEFAULT 0 CHECK (checked IN (0, 1)),
  checked_at  TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK ((checked = 0 AND checked_at IS NULL) OR (checked = 1 AND checked_at IS NOT NULL))
) STRICT;

-- Languages I speak.
CREATE TABLE languages (
  id          INTEGER PRIMARY KEY,
  language    TEXT NOT NULL UNIQUE COLLATE NOCASE,
  level       TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native')),
  source      TEXT NOT NULL CHECK (source IN ('imported', 'manual')),
  checked     INTEGER NOT NULL DEFAULT 0 CHECK (checked IN (0, 1)),
  checked_at  TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK ((checked = 0 AND checked_at IS NULL) OR (checked = 1 AND checked_at IS NOT NULL))
) STRICT;

-- What I did, in a job OR a project (exactly one of the two).
CREATE TABLE achievements (
  id            INTEGER PRIMARY KEY,
  experience_id INTEGER REFERENCES experiences (id) ON DELETE CASCADE,
  project_id    INTEGER REFERENCES projects (id) ON DELETE CASCADE,
  text          TEXT NOT NULL,
  number        TEXT,
  position      INTEGER NOT NULL,
  source        TEXT NOT NULL CHECK (source IN ('imported', 'manual')),
  checked       INTEGER NOT NULL DEFAULT 0 CHECK (checked IN (0, 1)),
  checked_at    TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK ((experience_id IS NOT NULL) + (project_id IS NOT NULL) = 1),
  CHECK ((checked = 0 AND checked_at IS NULL) OR (checked = 1 AND checked_at IS NOT NULL))
) STRICT;

CREATE INDEX achievements_experience_id ON achievements (experience_id);
CREATE INDEX achievements_project_id    ON achievements (project_id);

-- Which item proves a skill (exactly one of the four).
CREATE TABLE skill_proofs (
  id             INTEGER PRIMARY KEY,
  skill_id       INTEGER NOT NULL REFERENCES skills (id) ON DELETE CASCADE,
  experience_id  INTEGER REFERENCES experiences (id) ON DELETE CASCADE,
  project_id     INTEGER REFERENCES projects (id) ON DELETE CASCADE,
  education_id   INTEGER REFERENCES education (id) ON DELETE CASCADE,
  certificate_id INTEGER REFERENCES certificates (id) ON DELETE CASCADE,
  source         TEXT NOT NULL CHECK (source IN ('imported', 'manual')),
  checked        INTEGER NOT NULL DEFAULT 0 CHECK (checked IN (0, 1)),
  checked_at     TEXT,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK (
    (experience_id IS NOT NULL) + (project_id IS NOT NULL) +
    (education_id IS NOT NULL) + (certificate_id IS NOT NULL) = 1
  ),
  CHECK ((checked = 0 AND checked_at IS NULL) OR (checked = 1 AND checked_at IS NOT NULL))
) STRICT;

CREATE INDEX skill_proofs_skill_id ON skill_proofs (skill_id);
-- One index per kind: it makes lookups fast AND stops the same proof being saved twice.
CREATE UNIQUE INDEX skill_proofs_experience  ON skill_proofs (experience_id, skill_id)  WHERE experience_id IS NOT NULL;
CREATE UNIQUE INDEX skill_proofs_project     ON skill_proofs (project_id, skill_id)     WHERE project_id IS NOT NULL;
CREATE UNIQUE INDEX skill_proofs_education   ON skill_proofs (education_id, skill_id)   WHERE education_id IS NOT NULL;
CREATE UNIQUE INDEX skill_proofs_certificate ON skill_proofs (certificate_id, skill_id) WHERE certificate_id IS NOT NULL;
