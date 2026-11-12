# Iterative Design — LLM Limitations & Multi-Round Process

Why a single generation pass produces average design, and the round structure that gets past it.
Written for noslopdesign.

---

## The Convergence Problem

A model picks each design choice by likelihood, so every choice drifts toward what most pages already
do. The result is tidy and competent, and it looks like every other tidy, competent page.

### Where the drift comes from
- **It writes the page blind.** Markup and CSS are produced as text; nothing in that loop sees the
  rendered page or reacts to it.
- **Training rewards consistency.** Polish and completeness score well. A deliberate break from
  convention works against what the model was rewarded for.
- **It cannot sense tension.** Strong experimental work is a little uncomfortable on purpose. The
  model has no signal for how much discomfort is right.
- **Rules stand in for taste.** Judgments like "this feels corporate" or "this needs air" are
  approximated with heuristics, and heuristics settle on the mean.
- **It can produce variety but cannot rank it.** Ten different layouts are easy. Knowing which one is
  both surprising and correct is not.

### What follows from it
The user's direction and references are the design input, not a nice extra. The model does the
making; the user's taste, references and reactions decide where the work goes.

---

## The Multi-Round Process

**CRITICAL**: never run this as one pass (brief, design, done). One pass lands on the average.

Runnable mechanics live in `prototype-variants.md`: this file decides which directions to try and
how rounds proceed; that file owns `?variant=` routing, the switcher, verification and cleanup once a
winner is chosen.

### Round 1: Diverge
Produce 3-5 variants that differ in structure, not in color or font:
- a different spatial logic
- a different rhythm and composition
- a different dominant aesthetic
- each variant names the convention it is breaking

### Round 2: Kill
The user rules on each variant: keep or drop. No merging two variants into one, because a merge is
an average, and averages are what this process exists to escape.

Precedence: this keep-or-drop rule governs rounds after code exists. The pre-code concept stage is
owned by `../../../noslop-uiux/SKILL.md` UX-CONCEPT-GEN-01, whose mockup synthesis rule applies
there and does not conflict with this one.

### Round 3: Mutate
Inside the surviving direction, add deliberate breaks:
- a named design convention, violated on purpose
- the specific rule being broken and why
- the user chooses which breaks stay

### Round 4+: Repeat
Every cycle moves the work further from the center. The user's choices are the creative act; the
model generates the options.

---

## Working With the User

Ask the user to:
1. **Bring references from other fields.** A wine-list layout applied to a fintech dashboard says
   more than "make it experimental."
2. **Say what they dislike.** "No card grids" removes a default faster than "make it interesting."
3. **Plan for several rounds.** The first output is the most average one; each keep, drop and push
   moves it away from the middle.
4. **Drop safe options.** A variant that feels familiar is familiar. New directions feel wrong before
   they feel right.

---

## Upgrade Techniques Library

Moves that replace a generic pattern with a deliberate one. Use them to serve the chosen direction,
not as decoration.

### Typography
- **Variable-axis motion**: shift weight or width with scroll or hover.
- **Stroke-to-fill text**: display type enters as an outline and fills in.
- **Type as a mask**: large letters cut a window onto an image or video behind them.

### Layout
- **Asymmetric grids**: offsets, overlaps and edges that bleed off the viewport.
- **Generous negative space**: one element on a mostly empty field.
- **Stacking sections**: panels pin and stack as the page scrolls.
- **Split scroll**: two halves move in opposite directions.

### Surfaces
- **Real glass**: follow `liquid-glass.md` (recipes and gates); a blur with no edge refraction reads as fake.
- **Cursor-lit borders**: card edges brighten near the pointer.
- **Grain overlay**: a fixed, `pointer-events: none` noise layer that breaks flat digital color.
- **Tinted shadows**: shadows that carry the background hue instead of plain black.

### Motion
- Keep motion tied to meaning and within the budgets in `motion.md`; respect `prefers-reduced-motion`.

---

## When to Stop

Stop when the user keeps a direction without asking for another round, or when a round produces no
variant the user prefers over the current one. Then run the usual verification and pre-flight.
