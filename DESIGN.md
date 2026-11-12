# DESIGN.md — Vento

## Direction
Vento is a practical point-of-sale and inventory tool: business activity should feel traceable, calm, and quick to scan rather than theatrical.

## Audience and job
Owners and staff use the app during daily retail work. Each screen should make the next operational task clear and preserve who changed what.

## Type
Display: Sora, semibold, compact sizes for page and section headings. Body: Manrope, 14–16px with readable line height. Numbers: tabular numerals for totals, quantities, and timestamps.

## Colour
Base: `#090D16` background, `#121824` surfaces, `#1A2234` raised surfaces. Text: `#F1F5F9`; muted: `#94A3B8`. Brand accents: indigo `#818CF8` for focus and primary actions, lime `#A3E635` for positive states. Use distinct labelled status colours only when they clarify operational meaning. Dark mode is the product default.

## Layout
Contained working surfaces, typically `max-w-7xl`, left-aligned headings, compact spacing, and clear separators. Operational lists become readable stacked rows on narrow screens; dense data may use tables on wide screens.

## Imagery and motion
Use imagery only when it represents a real product or task. Motion is brief feedback, never decoration or a dependency for understanding state.

## Components
Inputs and actions have visible boundaries, keyboard focus, and touch-friendly targets. Prefer native semantic controls for filters and disclosures. Actor, role, action, and outcome remain visible in audit records; colour never carries meaning alone.

## Never
No fake activity, hidden audit actors, decorative metric cards, neon gradients, emoji icons, hover-only controls, or unlabelled status colours.
