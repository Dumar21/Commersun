# Frontend role boundaries

> **Role separation:** For design judgment — typography/color/layout direction, UX decision
> gates, product personalities, or vague visual briefs — load `noslop-uiux` first. This
> skill implements the chosen direction; `noslop-uiux` makes the design decisions.
> Implementation anti-slop tell detection and enforcement stays here (concrete rendered tells
> in UI); design-level concept/taste judgment lives in `noslop-uiux`.

> **Role boundary (canonical — identical in `noslop-uiux`):**
> The agent's base workflow owns universal process, evidence, and safety rules. `noslop-uiux` owns
> design intent, direction, and concept judgment. `noslop-frontend` owns concrete frontend
> implementation and rendered tell enforcement. Anti-slop has three layers: base workflow =
> output/process hygiene, `noslop-uiux` = concept/taste judgment
> (is this direction generic or domain-wrong?), `noslop-frontend` = rendered implementation
> tell detection and removal (FE-AI-TELL-01).
