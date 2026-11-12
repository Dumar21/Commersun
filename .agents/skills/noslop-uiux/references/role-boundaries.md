# Design role boundaries

**Emoji ban (stub):** no emoji as UI visual elements (STRICT). Canonical rule, scope, and exemptions: [frontend enforcement](../../noslop-frontend/references/core/anti-slop-enforcement.md#5-anti-slop-enforcement) / `../../noslop-frontend/references/core/anti-slop.md § Emoji Slop`.

**Role separation:** This skill owns design judgment: intent discovery, information architecture, UX state meaning, typography/color/layout direction, product personality, brand vocabulary, anti-slop concept/taste judgment (is this direction generic, domain-wrong, or aesthetically derivative?), and design-system decisions. `noslop-frontend` owns implementation: HTML/CSS/components, responsive mechanics, accessibility wiring, runtime behavior, rendered tell detection, and rendered verification. After choosing the design direction here, load `noslop-frontend` for concrete implementation.

> **Role boundary (canonical — identical in `noslop-frontend`):**
> The agent's base workflow owns universal process, evidence, and safety rules. `noslop-uiux` owns
> design intent, direction, and concept judgment. `noslop-frontend` owns concrete frontend
> implementation and rendered tell enforcement. Anti-slop has three layers: base workflow =
> output/process hygiene, `noslop-uiux` = concept/taste judgment
> (is this direction generic or domain-wrong?), `noslop-frontend` = rendered implementation
> tell detection and removal (FE-AI-TELL-01).


## Rule class note

> **Rule class note (UX-STYLE-01):** Everything in this skill that expresses taste —
> product personalities, design-isms, preset tokens, aesthetic vocabulary — is
> `STYLE_SAMPLE` (defined in the Rule classes in `noslop-frontend/SKILL.md`): examples to draw from, never universal requirements. Objective UX
> correctness (state coverage, accessibility, readability) is owned by [frontend objective/style classification](../../noslop-frontend/references/core/design-intake.md#15-objective-gates-vs-style-samples) and stays STRICT/DEFAULT.
