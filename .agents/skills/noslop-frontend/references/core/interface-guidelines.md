# Interface Guidelines — the small decisions that make UI feel built

A checklist of interaction and rendering details that generated UI usually misses. Run it on any
screen at C2+ alongside `a11y-patterns.md` and `platform-runtime.md`. Written for noslopdesign;
the list is informed by Vercel's open [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines) (MIT).

## Input and focus
- Every flow works from the keyboard and follows the WAI-ARIA authoring patterns.
- Focus is always visible: style `:focus-visible`, never remove the ring without a replacement.
- Sticky headers, banners and overlays never cover the focused element (`scroll-margin-top`).
- Dialogs and menus trap focus while open and return it to the trigger when closed.
- Hit targets are at least 24px on desktop and 44px on touch, even when the glyph is smaller.
- Mobile inputs use at least 16px text so iOS does not zoom on focus; never disable zoom.
- Paste is never blocked. Inputs keep their value and focus through hydration.

## Feedback and state
- A loading button keeps its label and adds an indicator; it does not swap to "Loading…".
- Spinners and skeletons wait about 150-300 ms before showing and stay at least 300-500 ms, so fast
  responses do not flicker.
- State that someone might share or return to (filters, tabs, pagination) lives in the URL.
- Optimistic updates reconcile with the server and roll back or offer undo on failure.
- Destructive actions confirm or offer undo; never both silently.
- Errors sit next to the field that caused them and say how to fix it.

## Content and layout
- Menu items that open a further step end with an ellipsis ("Rename…").
- Numbers that change or line up in columns use `font-variant-numeric: tabular-nums`.
- Long words, names and URLs are tested: truncate, wrap or break deliberately.
- Empty, sparse, dense and error states are all designed, not only the happy path.
- Dates, times, numbers and currency use the user's locale.
- Use real quotes and ellipses (“ ” …) and non-breaking spaces between numbers and units.

## Motion and rendering
- Honour `prefers-reduced-motion`; animate `transform` and `opacity`, not layout properties.
- Animations can be interrupted and never block input.
- Set `color-scheme` and a matching `theme-color` so scrollbars and browser chrome follow the theme.
- Overscroll and scroll chaining are controlled on modals and side panels (`overscroll-behavior`).
- Images have explicit dimensions so nothing shifts when they load.
