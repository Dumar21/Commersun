---
name: noslop-uiux
description: >-
  noslopdesign UI/UX: decide what a page or product should look and feel like before any code. Use when
  the brief is vague (make it clean, modern, premium, 깔끔하게, 모던하게, 감성적으로, Notion 느낌,
  Linear처럼), for design direction and visual concepts, design systems and palettes, typography,
  layout and navigation choices, onboarding, empty, loading and error states, logos, favicons, OG
  images and brand identity. noslop-frontend loads this skill on its own for vague or brand-visible
  briefs; call it directly for direction, critique or a design system without building the page.
---

# noslop-uiux

Decide the direction. This skill owns intent discovery, Design Read, concept exploration, information
architecture, UX state meaning, typography, color and layout direction, product personality and brand
identity. [noslop-frontend](../noslop-frontend/SKILL.md) builds what this skill decides.

Activates by change surface when:
- User's design direction is vague ("깔끔하게", "모던하게", "just make it look good")
- Building onboarding, empty state, error state, or loading state UI
- User references a product aesthetic ("Notion 느낌", "Linear처럼")
- Starting a new design system or generating a color palette
- Choosing layout patterns or navigation architecture
- Setting up favicons, product logos, or brand identity elements
- Handling logo dark mode variants, OG images, or social sharing meta

Read this before style-specific references when the user cannot articulate a clear design direction.
For rendered anti-slop tell detection and implementation-level banned patterns, defer to `noslop-frontend/references/core/anti-slop.md`, especially the 2026 gradient budget and one-note theme bans. This skill owns concept/taste-level anti-slop judgment (is this direction generic or domain-wrong?).

Work sizes (C0 to C4) and rule classes (STRICT, DEFAULT, HEURISTIC, STYLE_SAMPLE, ESCALATE) are defined in [noslop-frontend](../noslop-frontend/SKILL.md#work-size).

If the project has a `DESIGN.md`, read it first and treat it as the brief. Once a direction is locked,
write or update `DESIGN.md` at the project root per [DESIGN.md protocol](references/design-md.md), so later
runs and other agents build the same design.

Concept mockups use [ima2-gen](https://github.com/lidge-ai/ima2-gen) when it is installed. Where the
references say `$imagegen`, read it as the agent's own image tool: Codex `$imagegen`, or any image
generation tool or MCP server in Claude Code and other agents.

Look up product references on the web only after you have candidate URLs; do not browse blind.

## Modular References

| Condition | Reference |
|---|---|
| Every design task: role boundary, rule classes and implementation handoff | [Role boundaries](references/role-boundaries.md) |
| User-facing decision points | [Lazy-user gate](references/lazy-user-gate.md) |
| Vague design direction or no brief | [Intent discovery](references/intent-discovery.md) |
| New pages/components/layouts: before frontend code | [Design Read](references/design-read.md) |
| Concept generation before implementation | [Concept procedure](references/concept-exploration.md) |
| After concept lock: production assets | [Asset handoff](references/asset-handoff.md) |
| Choosing iconography during Design Read | [Icon strategy](references/icon-strategy.md) |
| Styles, product references, typography, palette, states, IA, branding, Korean UI or pre-delivery checks | [Topic index](references/topic-index.md) |

## UX State Contract (UX-STATE-01)

For onboarding, empty, loading, error, or progressive-disclosure work, the body must answer the state meaning before styling. Deep patterns live in `references/ux-states.md`.

- Onboarding teaches the first meaningful action, not the whole product.
- Empty explains why the state exists and names the next action.
- Loading chooses skeleton for known structure, spinner/progress for short unknown waits, and avoids fake completion.
- Error exposes retry, recovery, or escalation; never dead-end the user.
- Progressive disclosure names what stays hidden, why it stays hidden, and where it becomes available.

## IA Chooser (UX-IA-01)

Default navigation architecture by work shape; read `references/responsive-nav.md` for responsive details.

| Work shape | Default IA |
|------------|------------|
| Dense desktop repeated work | Sidebar + command palette |
| Medium sectioned work | Tabs or segmented navigation |
| Mobile-primary consumer flow | Bottom nav, sheet, or thumb-zone actions |
| Wizard/auth/setup | Stepper or stacked linear flow |

## 2.5 Visual Concept Exploration (UX-CONCEPT-GEN-01, DEFAULT)

Before implementing a C2+ expressive or brand-visible surface, read the [concept procedure](references/concept-exploration.md).
