# Design: Paper Mono

How the dashboard looks. **Read this before you build a page, a form or a feature flow.** When you are not sure, pick the plainer option.

Reference picture: [`docs/design/reference.png`](docs/design/reference.png) (the inspiration, an affiliate dashboard). We copy its **style**, not its content.

## The look in one line

A white sheet on a warm grey desk. One monospace font for everything. Solid black outlines, square corners. One hard black shadow on the most important thing. Calm, printed, a bit retro.

## 1. Tokens

All colors live in `src/app/globals.css` as CSS variables. **Never write a hex code in a component.** Use the Tailwind class.

### Our colors

| Token | Hex | Tailwind class | Use for |
|---|---|---|---|
| `--desk` | `#e7e3dd` | `bg-desk` | Page background, behind the sheet |
| `--sheet` | `#ffffff` | `bg-background` | The main canvas (the sheet) |
| `--tile` | `#f7f7f6` | `bg-tile` / `bg-card` / `bg-muted` | Cards, inputs, hover, active rail item |
| `--ink` | `#141414` | `text-ink` / `border-ink` | Text, outlines, main chart bars |
| `--ink-2` | `#5b5b58` | `text-muted-foreground` | Labels, second text |
| `--line` | `#e2e0dc` | `border-border` | Dividers, table rows, progress track |
| `--grid` | `#dcdcd8` | `stroke-grid` | Dashed chart grid |
| `--mustard` | `#dcc76a` | `bg-primary` | **The one main action** per view, progress fill |
| `--mustard-soft` | `#f1e9bd` | `bg-mustard-soft` | The key card, "some gaps / partly" |
| `--sky` | `#d3ebf1` | `bg-sky` | Second chart series (with hatch) |
| `--sky-ink` | `#6aa9b8` | `text-sky-ink` | Hatch lines on sky |
| `--pink` | `#f6c9c4` | `bg-pink` | "Big gaps / no", icon fill |
| `--up` | `#2f9e57` | `text-up` | Good trend, "checked" tick |
| `--down` | `#d6493f` | `text-destructive` | Bad trend, delete, errors |
| `--done` | `#8fd486` | `bg-done` | "Good fit / yes", 100% |
| `--gold` | `#c9a93a` | `text-gold` | IDs, dates, small meta |

Rules:
- **Mustard is the only loud color.** One mustard action per view.
- **Green and red mean up and down** (or good and bad). Never use them for decoration.
- Mostly white and black. If a screen looks colorful, remove color.

### Shape tokens

| Token | Value | Tailwind |
|---|---|---|
| Border | `1.5px solid var(--ink)` | `border-[1.5px] border-ink` |
| Hairline | `1px solid var(--line)` | `border-b` (default border color is `--line`) |
| Hard shadow | `4px 4px 0 var(--ink)` | `shadow-hard` |
| Radius | `2px` | every `rounded-*` class (they are all set to 2px). `rounded-full` only for avatars and dots. |

### Meaning colors (job-hunt data)

The same 4-step scale is used for **fit labels** and **match results**, so the colors always mean the same thing.

| Meaning | Fit label | Match result | Chip fill |
|---|---|---|---|
| Good | `good_fit` → Good fit | Yes | `bg-done` |
| Some | `some_gaps` → Some gaps | Partly | `bg-mustard-soft` |
| Bad | `big_gaps` → Big gaps | No | `bg-pink` |
| None yet | `not_matched` → Not matched | (no match) | `bg-background`, dashed border |

Other states:

| State | How it looks |
|---|---|
| **Checked** | Outline chip, ink border, green tick icon (`text-up`), text "Checked" |
| **Not checked** | Chip with a **dashed** ink border, text "Not checked". Dashed = not finished yet. |
| Must-have | Solid ink chip, white text, "MUST" |
| Nice-to-have | Outline chip, "NICE" |
| Skipped job | Outline chip "Skipped", whole row text in `text-muted-foreground` |
| Source `imported` / `manual` | Meta text, 11px, `text-gold` |

Always show the **word** too, never color alone.

## 2. Type

**Space Mono only**, weights 400 and 700. No second font, not even for headings. Hierarchy comes from size and bold.

| Role | Size / weight | Tailwind |
|---|---|---|
| Big number (stat) | 28px / 700, tabular | `text-[28px] font-bold tabular-nums leading-tight` |
| Page title (top bar) | 17px / 700 | `text-[17px] font-bold` |
| Section title | 17px / 700 | `text-[17px] font-bold` |
| Card / dialog title | 13px / 700 | `text-[13px] font-bold` |
| Body | 13px / 400 | `text-[13px]` (the body default) |
| Label, table header | 12px / 400, ink-2 | `text-xs text-muted-foreground` |
| Meta, IDs, dates | 11px / 400, gold | `text-[11px] text-gold` |
| Chart axis | 10px / 400, ink-2 | set in the chart |

All numbers in tables and cards use `tabular-nums`, so columns line up.

## 3. Shape rules (these make the style)

1. **Outlines.** Cards, buttons, inputs, selects and dialogs get a 1.5px ink border.
2. **Square corners.** 2px at most. Only avatars and dots are round.
3. **One hard shadow per view.** `shadow-hard` goes on the main action **or** the key card. Never on both, never on rows. A dialog or sheet counts as its own view.
4. **Dividers, not boxes.** Page sections are split by a 1px `--line` rule. Don't wrap every section in a card.
5. **Charts.** Dashed light grid. Main series = solid ink bars. Second series = sky with hatch and a thin ink outline. Tooltip = white box, thin ink border, no shadow.
6. **Hatch.** `bg-hatch` (see setup) for second-series fills and legend dots.
7. **Icons.** Lucide, `strokeWidth={1.4}`, 16–20px. At most one soft fill per icon (`--mustard-soft`, `--sky`, `--done` or `--pink`).
8. **White space.** 24px padding inside sections (16px on phones). 12–14px gaps between cards.

## 4. The app shell

```
┌ desk (warm grey) ─────────────────────────────────────────┐
│ ┌ sheet (white, 1px --line border) ─────────────────────┐ │
│ │ rail │ top bar: page title ............ actions  (SH) │ │
│ │ 52px ├────────────────────────────────────────────────┤ │
│ │  ▣   │ section                                       │ │
│ │  ◎   ├────────────────────────────────────────────────┤ │
│ │  ✓ 3 │ section                                       │ │
│ │  ▤   │                                               │ │
│ └──────┴────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

- **Desk:** `body` is `bg-desk`, with ~24px space around the sheet on desktop. On phones the sheet fills the screen (no desk, no space).
- **Sheet:** `bg-background`, 1px `--line` border, no shadow. Optional: two paper sheets behind it, slightly turned (see the reference). Only on desktop.
- **Rail (sidebar):** our own narrow rail (`components/layout/app-rail.tsx`), 52px. A 1px `--line` divider on the right. Labels show as tooltips. Not the shadcn Sidebar: it is fixed to the window edge, so it can't sit inside the sheet.
  - Logo on top: a small mustard square with an ink border and `JH` in bold.
  - Items: Home (`LayoutDashboard`, mustard-soft fill), Profile (`UserRound`, sky), Review (`ClipboardCheck`, done), Jobs (`BriefcaseBusiness`, pink).
  - Active item: `bg-tile` across the full rail width. No color change on the icon.
  - Review count: a small square ink badge with white 10px text on the icon's top right. Hide it when the count is 0.
  - On phones the rail becomes a shadcn Sheet menu (a top row with the logo and a menu button). There the count sits after the "Review" label.
- **Top bar:** 1px `--line` rule below it, 16px × 24px padding.
  - Left: page title (17px bold). On the Job page: `Jobs / <title>` with `Jobs` as a link.
  - Right: the page actions (mustard one last), then a round avatar with my initials (34px, ink border, `bg-mustard-soft`).
  - No search box in v1 (there is no search API yet).
- No dark mode. The style is light only (`color-scheme: light`).

## 5. Components

These are the shadcn pieces in `src/components/ui/`, restyled once so pages don't need extra classes. Small style changes in `ui/` are OK (see its README).

| Piece | Paper Mono style |
|---|---|
| **Button `default`** | The main action. Mustard, 1.5px ink border, bold, `shadow-hard`. Hover: move up-left 1px. Press: `translate(4px,4px)` and no shadow (it "presses into" the shadow). Only one per view. |
| Button `outline` | White, 1.5px ink border. Hover `bg-tile`. Most buttons are this one. |
| Button `secondary` | `bg-tile`, 1.5px ink border. |
| Button `ghost` | No border. Hover `bg-tile`. For row actions like Edit. |
| Button `destructive` | White, 1.5px ink border, `text-destructive`. Hover: light red fill. Never mustard. |
| Icon button | 36×36, 1px `--line` border (`outline` + `size="icon-lg"`). |
| Select / dropdown trigger | Like `outline`, with a small chevron. |
| Native select (forms) | `NativeSelect`: like Input (`bg-tile`, 1.5px ink border), with a small chevron. |
| Checkbox | 1.5px ink border, `bg-tile`; checked = mustard with an ink tick. |
| **Card (stat card)** | `bg-tile`, 1.5px ink border. Label (12px) → big number (28px bold) → trend line (11px, `TrendingUp` green or `TrendingDown` red). The **key card** uses `bg-mustard-soft` + `shadow-hard`. |
| Input, Textarea | `bg-tile`, 1.5px ink border. Focus: 2px ink outline, 2px offset. Error: `--down` border and a 12px red message under it. |
| Field / Label | Label 12px ink-2 above the input. Help text 11px ink-2. |
| **Table** | Header text 12px ink-2, regular weight. A **1.5px ink rule under the header**. 1px `--line` rules between rows and columns. Row hover `bg-tile`. No outer box. On phones the table scrolls sideways inside its section. |
| Badge (chip) | Square, 1px ink border, 11px text, uppercase is OK for short words. Fill from the meaning table. |
| Progress bar | 7px flat track in `--line`, mustard fill, `--done` at 100%. Number to the right. |
| Tabs | Line style: text tabs, the active one gets a 2px ink line under it. No pill background. |
| Dialog / AlertDialog / Sheet | White, 1.5px ink border, no blur shadow. The backdrop is a light ink tint, never blurred. Title 13px bold. Footer on a 1px `--line` rule, buttons right-aligned, the confirm button last. |
| Dropdown menu, Select popup | White, 1px ink border, no shadow. |
| Tooltip | Ink box, white 11–12px text, square. |
| Toast (Sonner) | White, ink border, square, always light. Success: green tick icon. Error: red icon. Short text. |
| Skeleton | `bg-tile` blocks with a 1px `--line` border. No shimmer gradient (a slow opacity pulse is fine). |
| Avatar | Round, 1px ink border, a soft tint fill, 2 initials in bold 10px. |

## 6. Page recipes (v1)

Each page = top bar + sections split by 1px rules. Section head: title (17px bold) on the left, small controls on the right, 20px gap to the content.

| Page | Sections | Main action / key card |
|---|---|---|
| **Home** `/` | 1. Stat cards in a 2×2 grid (left) + fit label chart (right). 2. Top 5 missing skills as a table with a progress bar (how many jobs need it). | **Key card:** "Waiting for check" (`bg-mustard-soft` + shadow), the whole card links to `/review`. No mustard button. |
| **Profile** `/profile` | 1. Profile block: name, headline, contact, links, summary, with an `outline` Edit button. 2. Tabs, one per item kind. Each tab: a Data Table with a Checked / Not checked chip per row. | **Mustard:** "Add <kind>" in the active tab's head. Edit / Delete are `ghost` in the row. |
| **Review** `/review` | One section per group (for example, one job with its achievements). Each item: its text, a source meta line, then Check / Fix / Skip for now. | **No mustard on the list** (Check repeats on every row, so it is `outline` with a green tick icon). "Check all in this group" is `outline` in the group head. In the Fix dialog, **mustard = "Save and check"**. |
| **Jobs** `/jobs` | One section: filters (fit label select, "Show skipped" switch) above the Data Table (title, company, fit chip, date in gold). | No mustard (jobs come in through Claude). No shadow needed. |
| **Job** `/jobs/[id]` | 1. Summary: fit label key card + job fields. 2. Requirements table: MUST / NICE chip, match chip (Yes / Partly / No), proof. 3. Full job text, read-only, in a `bg-tile` box with 1px `--line` border. | **Key card:** the fit label card (`shadow-hard`, filled with its fit color). Skip / Un-skip is `outline`. In the Skip dialog, mustard = "Skip job". |

### Charts

- Fit label chart on Home: one bar per label. Each bar is filled with its **meaning color** and has a 1px ink outline. Labels under the bars, counts on top.
- A chart over time (later): ink bars for the main number, hatched sky bars for the second one.
- Grid: `<CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />`. Axis text 10px ink-2. No chart animation.
- Hatch in Recharts: add a `<pattern>` in `<defs>` and use `fill="url(#hatch)"`:

```tsx
<defs>
  <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="6" height="6" fill="var(--sky)" />
    <line x1="0" y1="0" x2="0" y2="6" stroke="var(--sky-ink)" strokeWidth="1" />
  </pattern>
</defs>
<Bar dataKey="second" fill="url(#hatch)" stroke="var(--ink)" strokeWidth={1} />
```

## 7. Adding a page or a feature flow: the checklist

Do these steps, in order, every time. Write the answers in the feature's `README.md` before the code.

1. **Name the one job of the view.** One sentence: "On this page I ... ". If you need two sentences, it may be two views.
2. **Pick the one main action.** It becomes the mustard `default` button with the hard shadow. If the page only shows data, pick a **key card** instead, or nothing. Never both. Repeated row actions are never mustard.
3. **Sketch the sections.** Top bar title → sections split by 1px rules. Each section has a title and maybe small controls on the right. Don't box sections.
4. **Choose pieces from section 5.** Use an existing shadcn piece before you make a new one. New shared piece → `components/`, with its style written here.
5. **Map the data to meaning colors** (section 1). Fit, match, checked, skipped: use the existing chips. A new state gets a new row in the meaning table **first**.
6. **Design every state**, not just the full one:

   | State | Look |
   |---|---|
   | Loading | Skeletons with the same shape as the content |
   | Empty | One short line in ink-2 + an `outline` button or a link to the next step (for example: "No jobs yet. Paste a job in Claude to add one.") |
   | Error | An Alert with a 1.5px `--down` border, what went wrong in plain words, and a Retry button |
   | Saving | The button shows "Saving..." and is disabled |
   | Done | A Sonner toast, one short line |
   | Danger (delete, skip) | An AlertDialog: what will happen + `destructive` confirm |
   | Edit of a checked item | The note "This item will need a new check." above the Save button |

7. **Flows with steps** (for example Fix → Save → Check): keep each step in one view (one dialog or one sheet). Each step has one mustard button. Cancel is `outline` on the left of it. After the last step, close the view, show a toast, and refresh the page data.
8. **Phone width.** Test at 375px: sections stack, the table scrolls sideways, buttons stay at least 36px tall, no page scroll to the side.
9. **Keyboard and screen reader.** Every action works with Tab and Enter. Focus is a 2px ink outline with 2px offset. Icon-only buttons get an `aria-label`. Chips carry words, not only color. Text on mustard and tints is ink (dark), never white.
10. **Last look.** Compare the page with the reference picture and the "Avoid" list below. Count the shadows (max one) and the mustard buttons (max one).

## 8. Avoid

- Rounded cards, pill buttons, soft or blurred shadows, gradients, glass effects.
- A second font, or bright, saturated colors.
- The hard shadow on more than one thing per view. It stops meaning "important".
- A box around every section.
- Color as the only signal.
- Inventing data to fill a design. If a number is not in the API, it is not on the page.

## 9. Setup (one time)

**Done on 2026-10-13.** This part shows where the look lives in the code, so you can find it and keep it in sync with this file. Pages don't need any of it: they just use the classes above.

### `src/app/layout.tsx`: the font

Use `Space_Mono` from `next/font/google` instead of Geist:

```tsx
import { Space_Mono } from "next/font/google";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

// <html lang="en" className={`${spaceMono.variable} h-full antialiased`}>
```

### `src/app/globals.css`: the theme

1. Delete the `.dark { ... }` block (light only). **Keep** the `@custom-variant dark` line: without it, the `dark:` classes in `ui/` follow the OS dark mode. We never add the `.dark` class, so they never apply.
2. Replace the `:root { ... }` block with:

```css
:root {
  color-scheme: light;

  /* Paper Mono palette */
  --desk: #e7e3dd;
  --sheet: #ffffff;
  --tile: #f7f7f6;
  --ink: #141414;
  --ink-2: #5b5b58;
  --line: #e2e0dc;
  --grid: #dcdcd8;
  --mustard: #dcc76a;
  --mustard-soft: #f1e9bd;
  --sky: #d3ebf1;
  --sky-ink: #6aa9b8;
  --pink: #f6c9c4;
  --up: #2f9e57;
  --down: #d6493f;
  --done: #8fd486;
  --gold: #c9a93a;

  /* shadcn names, pointed at the palette */
  --background: var(--sheet);
  --foreground: var(--ink);
  --card: var(--tile);
  --card-foreground: var(--ink);
  --popover: var(--sheet);
  --popover-foreground: var(--ink);
  --primary: var(--mustard);
  --primary-foreground: var(--ink);
  --secondary: var(--tile);
  --secondary-foreground: var(--ink);
  --muted: var(--tile);
  --muted-foreground: var(--ink-2);
  --accent: var(--tile);
  --accent-foreground: var(--ink);
  --destructive: var(--down);
  --border: var(--line);
  --input: var(--ink);
  --ring: var(--ink);
  --chart-1: var(--ink);
  --chart-2: var(--sky);
  --chart-3: var(--mustard);
  --chart-4: var(--done);
  --chart-5: var(--pink);
  --radius: 2px;
  --sidebar: var(--sheet);
  --sidebar-foreground: var(--ink);
  --sidebar-primary: var(--ink);
  --sidebar-primary-foreground: var(--sheet);
  --sidebar-accent: var(--tile);
  --sidebar-accent-foreground: var(--ink);
  --sidebar-border: var(--line);
  --sidebar-ring: var(--ink);
}
```

3. In `@theme inline { ... }`, change the fonts and radii, and add the new names:

```css
  --font-sans: var(--font-space-mono), ui-monospace, Menlo, monospace;
  --font-mono: var(--font-space-mono), ui-monospace, Menlo, monospace;
  --font-heading: var(--font-space-mono), ui-monospace, Menlo, monospace;

  /* every rounded-* is 2px; rounded-full stays round */
  --radius-sm: var(--radius);
  --radius-md: var(--radius);
  --radius-lg: var(--radius);
  --radius-xl: var(--radius);
  --radius-2xl: var(--radius);
  --radius-3xl: var(--radius);
  --radius-4xl: var(--radius);

  --color-desk: var(--desk);
  --color-tile: var(--tile);
  --color-ink: var(--ink);
  --color-grid: var(--grid);
  --color-mustard-soft: var(--mustard-soft);
  --color-sky: var(--sky);
  --color-sky-ink: var(--sky-ink);
  --color-pink: var(--pink);
  --color-up: var(--up);
  --color-done: var(--done);
  --color-gold: var(--gold);

  --shadow-hard: 4px 4px 0 var(--ink);
```

4. Replace the `@layer base { ... }` block with:

```css
@layer base {
  * {
    @apply border-border;
  }
  :focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
  }
  html {
    @apply font-sans;
  }
  body {
    @apply bg-desk text-foreground text-[13px] leading-[1.55];
  }
}

@utility bg-hatch {
  background:
    repeating-linear-gradient(135deg, var(--sky-ink) 0 1px, transparent 1px 6px),
    var(--sky);
}
```

### `src/components/ui/`: restyle once

| File | Change |
|---|---|
| `button.tsx` | `default`: add `border-[1.5px] border-ink font-bold shadow-hard hover:-translate-x-px hover:-translate-y-px active:translate-x-1 active:translate-y-1 active:shadow-none`, remove `hover:bg-primary/80`. `outline`, `secondary`, `destructive`: `border-[1.5px] border-ink`. `destructive`: `bg-background`. |
| `card.tsx` | `ring-1 ring-foreground/10` → `border-[1.5px] border-ink`. |
| `input.tsx`, `textarea.tsx`, `select.tsx` | `border` → `border-[1.5px]`, `bg-transparent` → `bg-tile`. Remove the `ring-3` focus (the base outline does it). |
| `badge.tsx` | `rounded-4xl` is now 2px already. `outline` variant: `border-ink`. |
| `table.tsx` | Header row: `border-b-[1.5px] border-ink`. Cells: `border-l` except the first. Header cells: `text-xs font-normal text-muted-foreground`. |
| `dialog.tsx`, `alert-dialog.tsx`, `sheet.tsx` | `ring-1 ring-foreground/10` → `border-[1.5px] border-ink`. Footer: `bg-background` instead of `bg-muted/50`. |
| `tabs.tsx` | Use `variant="line"` on `TabsList`. |
