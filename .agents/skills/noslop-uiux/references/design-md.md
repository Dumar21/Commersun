# DESIGN.md — lock the direction in the project

After a direction is chosen (Design Read and, for brand-visible work, the concept pass), write it to
`DESIGN.md` at the project root. Later runs, other agents and other tools read it first and stay on
the same design instead of re-averaging. The format follows the DESIGN.md convention introduced by
Google Stitch and collected in [awesome-design-md](https://github.com/VoltAgent/awesome-design-md)
(MIT); separating durable product facts from visual direction is an idea from
[impeccable](https://github.com/pbakaus/impeccable) (Apache-2.0). Written for noslopdesign.

## When
- Before the first line of code on a new or redesigned surface at C3+.
- When the user approves a direction in conversation ("이 방향 좋아").
- Update it when a later round kills or mutates the direction (see `iterative-design.md` in noslop-frontend).

## Read first
If `DESIGN.md` already exists, treat it as the brief: follow it, and change it only when the user
asks for a new direction. If a `PRODUCT.md` or similar exists, read it for audience, job and voice;
do not copy product facts into DESIGN.md.

## Template

```markdown
# DESIGN.md — <product>

## Direction
One sentence: the idea only this product has, and the convention this design breaks on purpose.

## Audience and job
Who lands here and the one action the page or screen exists for.

## Type
Display: <family, weights, size scale>. Body: <family, size, line-height>. Numbers: tabular or not.
Korean/CJK: <stack and line-break rule>.

## Colour
Base: <neutral and hex>. Text: <hex>. Accent: <one hex and where it is spent>. Dark mode: <rule>.

## Layout
Grid, max width, spacing scale, radius scale, density (campaign, consumer, productivity, ops).

## Imagery and motion
What the pictures are (real product, photographs, diagrams), and the motion budget.

## Components
Buttons, inputs, cards, navigation: the few rules that differ from framework defaults.

## Never
The tells this product must not show (for example: purple gradients, icon tiles, eyebrow labels).
```

Keep it under about 120 lines. Concrete values beat adjectives: "#1F3B2D on #F4F1EA" says more than
"earthy and calm".
