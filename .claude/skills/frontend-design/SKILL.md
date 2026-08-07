---
name: frontend-design
description: >-
  Design-system rules for building any UI in this project: an 8px spacing grid,
  a fixed modular type scale, and semantic colour tokens. Use whenever writing
  or reviewing components, pages, Tailwind classes, or CSS — anytime you set a
  margin, padding, gap, font size, or colour. Enforces tokens over ad-hoc
  values: never invent a random hex, a one-off pixel value, or an off-scale
  font size.
---

# Frontend Design System

The rule for every UI decision: **pull from a token, never invent a value.**
If a spacing, size, or colour you need is not on one of the scales below, that
is a signal to reconsider — not to hardcode a new number. Add to the scale
deliberately, in the config, with a reason.

Three scales govern everything: **spacing (8px grid)**, **type**, and
**colour**. They live in `tailwind.config.ts` under `theme.extend` and in CSS
custom properties in `src/app/globals.css`. Prefer the Tailwind token (`p-4`,
`text-lg`, `bg-surface`) in markup; reach for the raw CSS variable only in
custom CSS.

---

## 1. Spacing — the 8px grid

**All spacing is a multiple of 8px.** Margins, padding, gaps, and layout
offsets snap to this grid so vertical and horizontal rhythm stay consistent
across every component. 4px is the *only* permitted half-step, reserved for
tight optical adjustments (icon-to-label gaps, borders, hairline insets) — use
it sparingly and never for layout structure.

| Token   | px  | rem     | Typical use                          |
| ------- | --- | ------- | ------------------------------------ |
| `0.5`   | 4   | 0.25rem | Half-step: icon gaps, fine tuning    |
| `1`     | 8   | 0.5rem  | Tight gaps inside a component        |
| `2`     | 16  | 1rem    | Default gap between related elements |
| `3`     | 24  | 1.5rem  | Padding inside cards / buttons       |
| `4`     | 32  | 2rem    | Section padding, card spacing        |
| `6`     | 48  | 3rem    | Gap between distinct groups          |
| `8`     | 64  | 4rem    | Major layout blocks                  |
| `12`    | 96  | 6rem    | Page section rhythm                  |
| `16`    | 128 | 8rem    | Hero / large vertical breaks         |

Tailwind's default spacing scale is already an 8px grid (`4` = 1rem = 16px,
each step = 4px), so **use the built-in classes** — `p-2`, `gap-4`, `mt-8` —
and simply stay on even-numbered steps (plus `*-0.5` for the 4px half-step).

**Do**

```tsx
<div className="p-4 flex flex-col gap-2">   {/* 32px pad, 16px gaps */}
<section className="py-12 px-4">            {/* 96px vertical rhythm */}
```

**Don't**

```tsx
<div className="p-[13px] mt-[7px]">          {/* off-grid magic numbers */}
<div style={{ padding: "18px" }}>            {/* not a multiple of 8 */}
```

---

## 2. Type — a real modular scale

Type sizes come from a **modular scale**, not arbitrary pixel picks. Base is
16px (`1rem`) at ratio **1.25 (major third)**, rounded to clean values. Each
size ships with a deliberate `line-height` and `letter-spacing` — never set a
font size without its paired line-height.

| Token       | size        | line-height | tracking  | Use                    |
| ----------- | ----------- | ----------- | --------- | ---------------------- |
| `text-xs`   | 12px / .75  | 1.5         | 0         | Captions, labels       |
| `text-sm`   | 14px / .875 | 1.5         | 0         | Secondary / helper     |
| `text-base` | 16px / 1    | 1.6         | 0         | Body copy (default)    |
| `text-lg`   | 20px / 1.25 | 1.5         | 0         | Lead paragraphs        |
| `text-xl`   | 25px / 1.5625 | 1.4       | -0.01em   | Small headings (h4/h3) |
| `text-2xl`  | 31px / 1.95 | 1.3         | -0.015em  | Section headings (h2)  |
| `text-3xl`  | 39px / 2.44 | 1.2         | -0.02em   | Page headings (h1)     |
| `text-4xl`  | 49px / 3.05 | 1.1         | -0.02em   | Display / hero         |
| `text-5xl`  | 61px / 3.8  | 1.05        | -0.025em  | Large display          |

Rules of thumb:
- **Body text is `text-base`.** Don't drop below `text-sm` for readable copy.
- **Larger size ⇒ tighter line-height and tracking.** Headings are set tight;
  body is set loose (1.5–1.6) for readability.
- **Weight, not size, for most emphasis.** Reach for `font-medium` /
  `font-semibold` before jumping a size step.
- Only two or three sizes should appear on a typical screen. A page using six
  different sizes is a scale-discipline failure.

---

## 3. Colour — semantic tokens only

**Never write a raw hex in a component.** Colour is referenced by *role*
(`bg-surface`, `text-muted`, `border-subtle`), not by value (`#0a0a0a`). This
keeps light/dark theming and re-branding to a single edit in the config.

Two layers:

1. **Primitive palette** — the raw ramps (`neutral-50 … neutral-950`,
   `brand-500`, etc.). Defined once. **Not used directly in markup.**
2. **Semantic tokens** — role names that *point at* primitives. This is what
   components use.

### Semantic tokens

| Token             | Role                                    |
| ----------------- | --------------------------------------- |
| `background`      | App/page background                     |
| `surface`         | Cards, panels, raised elements          |
| `surface-muted`   | Subtle fills, hover states              |
| `foreground`      | Primary text                            |
| `muted`           | Secondary / helper text                 |
| `subtle`          | Borders, dividers, disabled text        |
| `primary`         | Brand actions, links, focus             |
| `primary-fg`      | Text/icon on a `primary` fill           |
| `success` / `warning` / `danger` | Status + their `-fg` pairs   |

### Wiring it up

Define primitives and map semantics as CSS variables (so light/dark swap in one
place), then expose them to Tailwind.

`src/app/globals.css`
```css
:root {
  /* primitives — raw ramp, never referenced in markup */
  --neutral-0:   #ffffff;
  --neutral-50:  #f7f7f8;
  --neutral-200: #e5e5e7;
  --neutral-500: #71717a;
  --neutral-900: #18181b;
  --neutral-950: #0a0a0a;
  --brand-500:   #4f46e5;
  --brand-600:   #4338ca;

  /* semantic tokens — this is the API components use */
  --color-background:    var(--neutral-0);
  --color-surface:       var(--neutral-50);
  --color-surface-muted: var(--neutral-200);
  --color-foreground:    var(--neutral-900);
  --color-muted:         var(--neutral-500);
  --color-subtle:        var(--neutral-200);
  --color-primary:       var(--brand-600);
  --color-primary-fg:    var(--neutral-0);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-background:    var(--neutral-950);
    --color-surface:       var(--neutral-900);
    --color-surface-muted: var(--neutral-900);
    --color-foreground:    var(--neutral-50);
    --color-muted:         var(--neutral-500);
    --color-subtle:        var(--neutral-900);
    --color-primary:       var(--brand-500);
    --color-primary-fg:    var(--neutral-0);
  }
}
```

`tailwind.config.ts`
```ts
theme: {
  extend: {
    colors: {
      background:      "var(--color-background)",
      surface:         "var(--color-surface)",
      "surface-muted": "var(--color-surface-muted)",
      foreground:      "var(--color-foreground)",
      muted:           "var(--color-muted)",
      subtle:          "var(--color-subtle)",
      primary: {
        DEFAULT: "var(--color-primary)",
        fg:      "var(--color-primary-fg)",
      },
    },
  },
}
```

**Do**

```tsx
<article className="bg-surface text-foreground border border-subtle rounded-lg p-4">
  <h3 className="text-xl font-semibold">Title</h3>
  <p className="text-base text-muted mt-2">Supporting copy.</p>
  <button className="mt-4 bg-primary text-primary-fg px-3 py-2 rounded-md">
    Action
  </button>
</article>
```

**Don't**

```tsx
<div className="bg-[#f7f7f8] text-[#18181b]">     {/* raw hex in markup */}
<div style={{ color: "rgb(113,113,122)" }}>       {/* one-off colour */}
<div className="bg-gray-100 text-slate-800">      {/* Tailwind default palette
                                                     bypasses the token layer */}
```

---

## Checklist before shipping a component

- [ ] Every spacing value is an 8px multiple (or a deliberate 4px half-step).
- [ ] No `p-[13px]`, `mt-[7px]`, or inline off-grid pixel values.
- [ ] Every font size is a scale token with its paired line-height.
- [ ] No more than ~3 type sizes on the screen; emphasis via weight first.
- [ ] Every colour is a semantic token (`bg-surface`, `text-muted`, …).
- [ ] Zero raw hex / rgb in markup, and no bare Tailwind default colours
      (`gray-*`, `slate-*`) that skip the token layer.
- [ ] New scale values were added to the config with intent — not inlined.
