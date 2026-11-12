---
name: noslop-frontend
description: >-
  noslopdesign frontend: build, redesign or fix web pages and app screens so they do not look AI-made.
  Use for SaaS homepages, landing pages, marketing sites, product pages, dashboards, admin and CRUD
  screens, mobile layouts and UI bug fixes (HTML/CSS, React, Next.js, Svelte, Astro, Tailwind, React
  Native/Expo). Covers layout, typography, color, motion, assets, accessibility and a real-browser check
  before delivery, and pulls in noslop-uiux on its own when the brief is vague. Triggers: make a SaaS
  homepage, make it look good, redesign, landing page, dashboard, responsive, anti-slop, AI-looking UI,
  홈페이지 만들어줘, 멋있게, 랜딩페이지, 대시보드, 반응형, 디자인 수정, 프론트엔드, UI 작업.
---

# noslop-frontend

Build the page. This skill owns HTML/CSS/component code, responsive behavior, accessibility wiring,
assets, motion and the rendered check that the result does not read as an average AI page.

Design judgment lives in [noslop-uiux](../noslop-uiux/SKILL.md). Load it first when the brief is
vague ("멋있게", "modern", "make it look good", no references) or when the surface is new and
brand-visible, such as a homepage or landing page. For "make a SaaS homepage look great" that means:
run its Design Read, lock one direction, then come back here to build.

## How a build runs

1. Size the work (below) and route it with the Frontend Routing table.
2. Vague or brand-visible brief: run [noslop-uiux](../noslop-uiux/SKILL.md) intent discovery and Design Read before code.
3. Load the references the table below names for this work, nothing more.
4. Build with real content and real assets; no placeholder gradients or icon-card filler.
5. Run `scripts/sloplint.mjs` on the changed files, then render in a real browser at mobile, tablet and desktop widths and run the anti-slop checks.
6. Fix what the screenshots show, then report what was checked and how.

## Modes

Name a mode after the skill to narrow the job. Without one, the skill builds or fixes what you asked for.

| Mode | Does |
|---|---|
| `build` (default) | Size, route, direction, build, browser check, fix |
| `redesign <path>` | Rebuild an existing page in a new system; keep its content and wiring (`sloplint --inventory` before, `--kept` after) |
| `polish <path>` | Remove the tells only; keep layout and system |
| `audit <path>` | Report only: sloplint, interface guidelines, pre-flight. No edits |
| `critique <path>` | Design review of hierarchy, clarity and fit to the job; hand direction changes to noslop-uiux |
| `bolder` / `quieter` | Push contrast, scale and color up or down inside the current direction |
| `harden <path>` | Error, empty, loading, long-content, i18n and offline states |

Example: `$noslop-frontend audit ./index.html`. The command vocabulary follows
[impeccable](https://github.com/pbakaus/impeccable) and [Hallmark](https://github.com/Nutlope/hallmark).

## Gates

Every finding falls in one of three tiers (after Hallmark's Floor/Reflex/Finish):

- **Floor** = STRICT. Never ships: blocked zoom, removed focus, placeholder content, emoji icons,
  broken phone layout, invented facts, contrast below WCAG AA.
- **Reflex** = DEFAULT. The defaults a model falls into: purple gradients, gradient text, Inter-only,
  buzzwords, vanity metrics, icon tiles, eyebrow labels. A build may keep one only with a stated
  reason, written in the file as `noslop-allow NS-RULE-ID: reason`.
- **Finish** = HEURISTIC. Craft detail that never blocks a ship.

[`scripts/sloplint.mjs`](scripts/sloplint.mjs) checks the static tells with no dependencies:
`node <skill>/scripts/sloplint.mjs <file-or-dir>`. Run it before the browser check and fix what it
reports; it does not replace looking at the screenshots.

## Work size

References use these sizes to decide depth. When two fit, take the larger.

| Size | Signals | Depth |
|---|---|---|
| C0 | Text or copy only, no behavior change | Edit and re-read |
| C1 | One file, local visual or behavior fix | Focused fix, check the changed screen |
| C2 | A conventional screen: form, table, list, detail, settings | Follow repo conventions, cover every state, smoke-test the flow |
| C3 | New or redesigned surface, shared components, broad visual change | Design Read first, full references, multi-width browser check |
| C4 | Auth, payments, deletion, permissions or release-critical UI | C3 plus negative paths and explicit sign-off |

Production means deployed to real users beyond the author. Prototypes, spikes and internal demos are not production.

## Rule classes

- STRICT: violation blocks completion (accessibility baseline, state coverage, truthful verification).
- DEFAULT: follow unless a stated, documented reason warrants deviation.
- HEURISTIC: judgment guide; deviation needs no rationale.
- STYLE_SAMPLE: an illustration to draw from, never a universal requirement.
- ESCALATE: stop and ask the user.

Size, naming, layout and style rules are DEFAULT or STYLE_SAMPLE unless the user or project binds them.

## Modular References

| Condition | Reference |
|---|---|
| Every frontend change: role boundary | [Role boundaries](references/core/role-boundaries.md) |
| Before designing or coding: surface defaults | [Routing defaults](references/core/routing-defaults.md) |
| C2 list/detail/form screens | [CRUD UI](references/core/crud-ui.md) |
| Marketing/visual surfaces or C3+: choose topic/locale references | [Core topic index](references/core/topic-index.md) |
| Framework implementation or configuration | [Stack index](references/stack-index.md) |
| Components, direction intake, dials or objective/style classification | [Design intake](references/core/design-intake.md) |
| Typography, color, layout, assets, icons or cutouts | [Implementation](references/core/implementation.md) |
| New/redesigned surfaces or visual audits | [Anti-slop enforcement](references/core/anti-slop-enforcement.md) |
| Performance, accessibility, forms, state, platform or errors | [Platform and runtime](references/core/platform-runtime.md) |
| API consumption, security UI or contract fixtures | [Backend contracts](references/core/backend-contracts.md) |
| Any render/executable frontend artifact | [Verification grounding](references/core/render-grounding.md) |
| Before shipping a production frontend surface at C2+ | [Full pre-flight](references/core/preflight-full.md) |
| Interaction and rendering details on any C2+ screen | [Interface guidelines](references/core/interface-guidelines.md) |

Start with `references/core/anti-slop.md`, `references/core/aesthetics.md`, `references/core/responsive-viewport.md`, and `references/core/visual-verification.md`. Add domain/locale/stack references only when relevant.
For C2 ordinary app screens (form/table/list/detail), `references/core/crud-ui.md` alone suffices; add the style references above for marketing/visual surfaces or C3+ work.

## 0. Frontend Routing

Before designing or coding, classify the work:

| Decision | Options | Why It Matters |
| --- | --- | --- |
| Product surface | landing, app, dashboard, AI tool, public service, education, game, creative | Sets density, typography scale, asset requirements |
| Locale | Korean-first, global/i18n, English-only | Sets CJK typography, copy, date/number formats |
| Density | campaign, consumer app, productivity, SaaS, ops, finance, developer console | Prevents landing-page composition inside repeated-work tools |
| Asset need | none, screenshot, product photo, diagram, chart, illustration, soft 3D, game asset | Prevents asset-free gradient/card UI |
| Soft 3D/character gate | not allowed, subtle, primary | Prevents generic cute 3D/mascot slop |
| Motion intensity | static, feedback-only, expressive, cinematic | Prevents cinematic motion in utility workflows |

## Done means checked (STRICT)

A frontend claim needs fresh evidence from this run.

| Claim | Requires | Not enough |
|---|---|---|
| It looks right | Screenshots at mobile, tablet and desktop widths, read and compared to the brief | The code alone |
| It works | The changed flow exercised in a browser, including loading, empty and error states | A passing build |
| Builds | Build or typecheck exit 0 | Lint alone |
| Bug fixed | The original symptom no longer reproduces | The edit alone |
| Accessible | Keyboard pass plus axe-core or equivalent | A screenshot |

Pre-flight gate: before shipping a production surface at C2+, run [Full pre-flight](references/core/preflight-full.md).

## Tools

The skill works with what the agent already has. Any browser tool (Playwright, Chrome DevTools or a
built-in browser) covers the rendered check. For generated images, concept mockups and motion video
the references use [ima2-gen](https://github.com/lidge-ai/ima2-gen) (`npm i -g ima2-gen`); any image
generator, such as Codex `$imagegen`, is the fallback.

Where the references say `$imagegen`, read it as the agent's own image tool: Codex `$imagegen`, or
any image generation tool or MCP server in Claude Code and other agents.
