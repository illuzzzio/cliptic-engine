# Cliptic Engine — Theme Rules

## Brand Identity

Cliptic Engine is a **video-to-shorts conversion SaaS tool**. The visual identity should evoke speed, creativity, and cutting-edge tech — like scissors slicing through video timelines.

---

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--cliptic-black` | `#090909` | Primary background, deepest surfaces |
| `--cliptic-dark` | `#111111` | Card backgrounds, surface layers |
| `--cliptic-dark-2` | `#1a1a1a` | Elevated surfaces, modals |
| `--cliptic-border` | `#2a2a2a` | Borders, dividers |
| `--cliptic-red` | `#E63946` | Primary CTA, danger, energy accent |
| `--cliptic-red-glow` | `#E6394640` | Red shadow / glow effects |
| `--cliptic-green` | `#2DC653` | Success, active states, "go" actions |
| `--cliptic-green-glow` | `#2DC65340` | Green shadow / glow effects |
| `--cliptic-yellow` | `#FFD60A` | Highlights, stars, premium badge |
| `--cliptic-yellow-glow` | `#FFD60A40` | Yellow shadow / glow effects |
| `--cliptic-white` | `#F8F8F8` | Primary text |
| `--cliptic-muted` | `#6B6B6B` | Secondary / muted text |
| `--cliptic-subtle` | `#3a3a3a` | Placeholder, disabled text |

---

## Typography

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Display / Hero | `Inter` | 900 (Black) | Used for big hero headlines |
| Heading | `Inter` | 700 (Bold) | Section headings |
| Subheading | `Inter` | 600 (SemiBold) | Card titles, feature names |
| Body | `Inter` | 400 (Regular) | General paragraph text |
| Mono / Code | `Geist Mono` | 400 | Timestamps, code snippets |
| Logo | `Inter` | 900 | Gradient + 3D text-shadow |

---

## Logo Rules

- Logo text: **"Cliptic"** in 900-weight Inter
- Color: Gradient from `--cliptic-red` → `--cliptic-yellow` → `--cliptic-green`
- Engine badge: smaller `"ENGINE"` in letter-spaced caps, `--cliptic-muted`
- 3D effect: layered `text-shadow` creating depth with red, green, yellow offsets
- Icon: scissors/clip emoji or SVG placed before the wordmark
- Never use a white or light background behind the logo

---

## 3D Background Effects

- Use layered `radial-gradient` blobs (red, green, yellow) with very low opacity (`0.04–0.08`) for ambient glow
- A subtle animated grid using `repeating-linear-gradient` at `1px` lines, `5%` opacity
- Use `@keyframes` float animations on decorative blob elements
- Hero background: deep black with a single large red radial pulse in center-top
- Noise/grain texture via SVG `feTurbulence` as an overlay at `3%` opacity

---

## Component Styling Rules

### Buttons

| Variant | Background | Border | Text | Glow |
|---------|-----------|--------|------|------|
| Primary (CTA) | `--cliptic-red` | none | white | `--cliptic-red-glow` box-shadow |
| Secondary | transparent | `--cliptic-green` 1px | `--cliptic-green` | `--cliptic-green-glow` on hover |
| Ghost | transparent | `--cliptic-border` | `--cliptic-white` | none |
| Pricing (Popular) | `--cliptic-yellow` | none | black | `--cliptic-yellow-glow` |

### Cards

- Background: `--cliptic-dark` with `1px solid --cliptic-border`
- Border-radius: `16px`
- Hover: lift with `translateY(-4px)` + brighten border to relevant accent color
- Transition: `all 0.3s ease`
- Popular pricing card: yellow border + yellow glow

### Navigation / Header

- Background: `rgba(9, 9, 9, 0.85)` with `backdrop-filter: blur(20px)`
- Sticky top, `z-index: 50`
- Logo on left, nav links center, CTA button right
- Active link indicator: `--cliptic-red` underline or dot

### Feature Section

- Dark background alternating with gradient band
- Feature icons: colored in their respective accent color (red/green/yellow)
- 3-column grid on desktop, 1-column on mobile

### Pricing Section

- 3 tiers: Free, Pro (popular), Enterprise
- Popular badge: `--cliptic-yellow` with black text
- Checkmarks: `--cliptic-green`
- Separator line: `--cliptic-red` gradient

### Footer

- Deepest black `#060606`
- Logo top-left, links in columns, social icons bottom-right
- Thin `--cliptic-border` top border
- Copyright line: `--cliptic-muted`

---

## Animation Rules

| Effect | Duration | Easing |
|--------|----------|--------|
| Hover transitions | `0.2–0.3s` | `ease` |
| Float blobs | `6–10s` | `ease-in-out` infinite alternate |
| Fade-in on scroll | `0.6s` | `ease-out` |
| Glow pulse | `2s` | `ease-in-out` infinite |
| 3D card tilt | JS `mousemove` | `perspective(1000px) rotateX/Y` |
| Hero text shimmer | `3s` | linear infinite |

---

## Accessibility Rules

- All color combinations must meet **WCAG AA** contrast ratio (4.5:1 minimum)
- Use `aria-label` on icon-only buttons
- Focus rings: `2px solid --cliptic-yellow` outline with `2px offset`
- Respect `prefers-reduced-motion`: disable float and pulse animations

---

## Do's and Don'ts

### ✅ Do
- Use the tri-color (red, green, yellow) to signal different states (danger, success, highlight)
- Apply glow effects sparingly — max 1–2 glowing elements per viewport
- Keep backgrounds deep black; let accent colors breathe
- Use `border-image` gradients for premium dividers

### ❌ Don't
- Use white or light backgrounds anywhere
- Mix more than 3 accent colors on a single component
- Use flat/solid accent fills for large background areas
- Apply animations to more than 3 elements simultaneously
- Use generic blue/gray color schemes
