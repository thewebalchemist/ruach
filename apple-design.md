# Design System Inspired by Apple

## 1. Visual Theme & Atmosphere
Apple's digital presence is an exercise in focused minimalism, where the product is the undisputed hero. The design system achieves this by pairing hyper-realistic product photography with a starkly simple and spacious layout. Typography, set exclusively in the bespoke "SF Pro" family, is large and legible, with body copy starting at a generous 17px. The color palette is rigorously controlled, relying almost entirely on a neutral scale of black, white, and off-white (`#f5f5f7`), punctuated by a single, vibrant "Action Blue" (`#0071e3`) for all primary calls-to-action.

The atmosphere is one of calm confidence and premium quality, enforced by the complete absence of decorative elements like gradients or UI shadows. Depth is communicated solely through typographic hierarchy and, in rare cases, high-z-index overlays for navigation. Motion is subtle and functional, with CSS transitions (`transition-duration: 320ms`) primarily used for the global navigation flyouts, ensuring a smooth user experience without distracting from the content. The signature visual element is the product-centric layout itself: enormous, perfectly lit hardware visuals against a sea of whitespace, creating a focused, gallery-like browsing experience.

**Key Characteristics:**
*   **Product-as-Hero:** Dominant, high-fidelity product photography is the central focus of every layout.
*   **San Francisco Typeface:** Exclusive use of `SF Pro Display` and `SF Pro Text` creates a crisp, highly legible, and brand-specific typographic identity.
*   **Extreme Minimalism:** The UI is flat, with no box-shadows, gradients, or extraneous decoration. Color is used sparingly and with purpose.
*   **Monochromatic Foundation:** The palette is built on black, white, and light gray (`#f5f5f7`), creating a neutral canvas for products and key actions.
*   **Action Blue Accent:** A single, vibrant blue (`#0071e3`) is used for all primary buttons and interactive accents, providing clear and consistent calls-to-action.
*   **Generous Whitespace:** Expansive padding and margins are used to frame content, reduce cognitive load, and create a sense of premium quality.
*   **Functional Animation:** Motion is limited to subtle CSS transitions and SVG animations, primarily to enhance the usability of navigation menus and interactive elements.

## 2. Color Palette & Roles
The palette is intentionally sparse, ensuring that user attention is directed towards products and key actions. It is defined by a neutral core, a single primary action color, and a specific blue for text links.

### Primary
*   **Action Blue (`#0071e3`)**: The sole color for primary call-to-action buttons like "Learn more" and "Buy".

### Interactive
*   **Link Blue (`#2997ff`)**: The standard color for inline text links.
*   **Link Blue (Darker) (`#0066cc`)**: A slightly darker, higher-contrast blue used for links, often in footers or on lighter gray backgrounds.

### Neutral Scale
*   **Black (`#000000`)**: Used for dark mode backgrounds and primary text on pure white backgrounds for maximum contrast.
*   **Near Black (`#1d1d1f`)**: The primary color for all heading and body text in the light theme. It's slightly softer than pure black.
*   **Text Inverse (`#ffffff`)**: Used for all text on dark backgrounds, such as the `#000000` hero sections.
*   **Text Inverse (Light) (`#f5f5f7`)**: A very light gray used for secondary text on dark backgrounds.

### Surface & Borders
*   **Off-White (`#f5f5f7`)**: The default background color for most of the page content.
*   **Light Gray (`#fafafc`)**: A slightly brighter white used for secondary backgrounds, such as the global navigation flyout menus.
*   **Divider Gray (`#d2d2d7`)**: Used for subtle horizontal rules and borders, primarily in the footer.

## 3. Typography Rules

### Font Family
The entire system is built on Apple's proprietary "San Francisco" typeface. `SF Pro Display` is used for large, impactful headlines, while `SF Pro Text` is used for subheadings and all body copy to ensure maximum legibility at smaller sizes.

*   **Primary Font Stack**: `"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`
*   **Display Font Stack**: `"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`
*   **Monospace**: `SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`

### Hierarchy
| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Display | SF Pro Display | 56px | 600 | 1.1 | -0.01em | For major product names and hero titles. |
| H1 | SF Pro Display | 44px | 600 | 1.15 | -0.005em | Main section headings. |
| H2 | SF Pro Text | 28px | 600 | 1.2 | normal | Sub-section headings. |
| H3 | SF Pro Text | 21px | 600 | 1.3 | normal | Smaller headings, often used in cards. |
| Body | SF Pro Text | 17px | 400 | 1.45 | normal | The default size for all paragraph text. |
| Caption | SF Pro Text | 12px | 400 | 1.35 | normal | For legal disclaimers, footer links, and nav bar. |
| Button | SF Pro Text | 17px | 400 | 1.2 | normal | Standard button text. |

### Principles
*   **Legibility First**: The choice of `SF Pro Text` for body copy and a default size of `17px` prioritizes readability above all else.
*   **Strict Weight Discipline**: A simple two-weight system is used. `600` (Semibold) is exclusively for headings, and `400` (Regular) is for all other text. This creates a clear, unambiguous hierarchy.
*   **Generous Leading**: Line height is consistently generous (1.45 for body) to improve readability in long-form text and create an airy, uncluttered feel.
*   **Contextual Typeface**: The system intelligently switches between `SF Pro Display` for large-scale text and `SF Pro Text` for UI-scale text to leverage the specific optical sizing of each variant.

## 4. Component Stylings

### Buttons
Buttons are minimal and come in two primary styles: a solid blue primary action and a transparent secondary action. Both are typically pill-shaped.

#### Primary Button
Used for the most important action in a section.
```css
.button-primary {
  display: inline-block;
  background-color: #0071e3;
  color: #ffffff;
  font-family: "SF Pro Text", sans-serif;
  font-size: 17px;
  font-weight: 400;
  line-height: 1.2;
  text-align: center;
  padding: 12px 24px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.button-primary:hover {
  background-color: #0077ed; /* Derived from typical hover states */
}

.button-primary:disabled {
  background-color: #a1a1a6;
  cursor: not-allowed;
}
```


<details>
<summary>Secondary Button (Ghost)</summary>

Used for secondary actions, like "Buy" when "Learn More" is the primary action.
```css
.button-secondary {
  display: inline-block;
  background-color: transparent;
  color: #0071e3;
  font-family: "SF Pro Text", sans-serif;
  font-size: 17px;
  font-weight: 400;
  line-height: 1.2;
  text-align: center;
  padding: 11px 23px; /* 1px less to account for border */
  border: 1px solid #0071e3;
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.button-secondary:hover {
  background-color: #0071e3;
  color: #ffffff;
}

.button-secondary:disabled {
  color: #a1a1a6;
  border-color: #a1a1a6;
  cursor: not-allowed;
  background-color: transparent;
}
```

</details>
### Cards & Containers
Containers are simple, full-width sections or self-contained cards with generous padding and minimal styling.

#### Feature Card
Used for promotional content blocks like "Apple for College".
```css
.feature-card {
  background-color: #f5f5f7;
  border-radius: 11px;
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.feature-card-dark {
  background-color: #000000;
  color: #ffffff;
  border-radius: 11px;
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
```

### Inputs & Forms
Forms are not prominent on the homepage, but styles can be inferred from the overall aesthetic.

#### Text Input
```css
.form-input {
  font-family: "SF Pro Text", sans-serif;
  font-size: 17px;
  padding: 12px 16px;
  background-color: #ffffff;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  color: #1d1d1f;
  width: 100%;
}

.form-input::placeholder {
  color: #6e6e73;
}

.form-input:focus {
  outline: 2px solid #0071e3;
  outline-offset: 2px;
  border-color: transparent;
}
```


<details>
<summary>Form Label</summary>

```css
.form-label {
  display: block;
  font-family: "SF Pro Text", sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #1d1d1f;
  margin-bottom: 8px;
}
```

</details>
### Navigation

#### Top Navigation Bar
The global navigation is a thin strip at the top of the viewport.
```css
.global-nav {
  background-color: rgba(250, 250, 252, 0.7);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  width: 100%;
  height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 24px;
}
```


<details>
<summary>Navigation Link</summary>

Links within the navigation are small and unstyled until hovered.
```css
.nav-link {
  font-family: "SF Pro Text", sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #1d1d1f;
  text-decoration: none;
  padding: 8px 12px;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.nav-link:hover {
  opacity: 1;
}
```

</details>
### Links
Standard inline links are blue and only underlined on hover.

```css
a.text-link {
  color: #0066cc;
  text-decoration: none;
}

a.text-link:hover {
  text-decoration: underline;
}
```

### Badges
While not prominent on the homepage, a badge component would follow the system's simple, high-contrast style.

```css
.badge {
  display: inline-block;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
}

.badge-info {
  background-color: #0071e3;
  color: #ffffff;
}

.badge-success {
  /* Using --sk-enviro-green from CSS variables */
  background-color: rgb(0, 217, 89);
  color: #1d1d1f;
}
```

## 5. Layout Principles

### Spacing System
The system uses a consistent 4px base unit for all spacing, padding, and margins, creating a rhythmic and ordered layout.
*   **Base Unit**: 4px
*   **Scale**: 4, 8, 12, 16, 20, 24, 32, 40, 48px

**Usage Context:**
*   **4px**: Micro-spacing, inside complex components.
*   **8px**: Gaps between a label and an input, or text and an icon.
*   **12px**: Padding inside smaller buttons or navigation items.
*   **16px**: Standard padding within components like cards. Gap between elements in a stack.
*   **24px**: Gutter width in grids. Gap between distinct UI elements.
*   **32px**: Larger gaps between content sections.
*   **40px, 48px**: Vertical padding for major content sections to create ample breathing room.

### Grid & Container
_Note: container widths and column counts are not extracted from the source. The values below are reasonable defaults inferred from the visible layout density._
*   **Max Width**: 980px for the central content column.
*   **Columns**: 12-column grid.
*   **Gutter**: 24px.
*   **Section Padding**: 48px (vertical) and 24px (horizontal).

### Whitespace Philosophy
Whitespace is a primary design tool, used generously to create focus, improve legibility, and impart a feeling of quality and simplicity. Large, empty spaces around product imagery and text blocks ensure that each element is clearly framed and easy to parse. The layout never feels crowded.

### Border Radius Scale
The system employs a minimal set of radii for specific purposes.
*   **8px**: Subtle rounding for standard containers and inputs.
*   **11px**: A slightly larger radius for feature cards and content tiles.
*   **999px**: Used to create fully-rounded "pill" shapes for all buttons.

## 6. Depth & Elevation
Apple's design system is fundamentally flat. It avoids `box-shadow` for elevation. Depth is managed exclusively by `z-index` for layering global UI elements like navigation and modals over the main content. The measured z-index values show a clear separation between page content and high-level overlays.

| Level | Treatment | z-index | Use |
| :--- | :--- | :--- | :--- |
| Base Content | `z-index: 1-4` | 1-4 | Default layer for all text, images, and cards. |
| Active Elements | `z-index: 4` | 4 | Buttons and other interactive elements to ensure they are clickable. |
| Navigation | `z-index: auto` | auto | The main global navigation bar. |
| Curtain / Overlay | `z-index: 9998` | 9998 | Semi-transparent background overlay for open menus or modals. |
| Global Message | `z-index: 9999` | 9999 | Sitewide banners or announcements. |
| Modal / Flyout | `z-index: 10000` | 10000 | The highest level, for language switchers or navigation flyouts. |

### Shadow Philosophy
There is no shadow philosophy. The design is intentionally flat to maintain a clean, graphic, and uncluttered aesthetic. Elevation is not communicated through shadows. Instead, the focus is on clear typographic hierarchy and layout structure.

## 7. Do's and Don'ts

### Do's
*   Use `SF Pro Text` at `17px` and `400` weight for all body copy.
*   Set Primary Buttons with background `#0071e3` and `999px` border-radius.
*   Use `#1d1d1f` for primary text on `#f5f5f7` backgrounds for ideal contrast.
*   Apply `600` font-weight exclusively to headings like H1 (`44px`) and H2 (`28px`).
*   Use only the `4px` base spacing scale, like `24px` or `48px` for margins.
*   Ensure all interactive text links use `#0066cc`.
*   Reserve `#000000` for dark-themed backgrounds or text on `#ffffff`.
*   Use an `8px` or `11px` border-radius for subtle container corners.
*   Employ generous whitespace, with at least `48px` of padding for major sections.
*   Use the dark Feature Card with `#ffffff` text on `#000000` backgrounds.

### Don'ts
*   Do not apply `box-shadow` to any UI elements like Cards or Buttons.
*   Never use a font weight other than `400` or `600` for UI text.
*   Avoid inventing spacing values; stick to the `4, 8, 12, 16...` scale.
*   Do not use any color other than `#0071e3` for primary CTA backgrounds.
*   Never set body text smaller than `17px` for legibility.
*   Don't use gradients in UI backgrounds; keep them flat `#f5f5f7` or `#000000`.
*   Avoid using `SF Pro Display` for text smaller than `28px`.
*   Do not underline links by default; only apply `text-decoration: underline` on hover.
*   Never use pure black (`#000000`) text on the standard `#f5f5f7` background.
*   Don't use a border-radius other than `8px`, `11px`, or `999px`.

## 8. Responsive Behavior
*Note: breakpoints below are based on measurements from the source CSS and reflect the site's actual media queries.*

### Measured Breakpoints
| Breakpoint Name | Width | Key Changes |
| :--- | :--- | :--- |
| Desktop | > 1068px | Full-width experience, multi-column layouts, visible navigation text links. |
| Tablet | 735px - 1068px | Content reflows into a more constrained central column. Grid may reduce to 2 columns. |
| Mobile | < 734px | Single-column layout. Global navigation collapses into a hamburger menu icon. Typography may scale down slightly. |

### Touch Targets
*   All buttons and interactive elements must have a minimum height of `44px`.
*   Ensure at least `8px` of space between tappable elements to prevent accidental presses.
*   Text links should have ample line-height (`1.45` on body text) to be easily tappable.

### Collapsing Strategy
*   **Navigation**: The primary text-based navigation collapses into a hamburger menu icon on mobile (`< 734px`). The Apple, search, and bag icons remain visible.
*   **Cards**: Multi-column card layouts (e.g., 2-up or 3-up) stack vertically into a single column on mobile.
*   **Typography**: Headline sizes are reduced on smaller screens. For example, a `56px` Display headline may become `40px`.
*   **Padding**: Section padding is reduced. `48px` vertical padding may become `32px` on mobile to conserve space.
*   **Buttons**: Buttons may span the full width of the container on mobile to provide a larger tap target.
*   **Grid**: The 12-column grid collapses to a simpler 4-column grid for mobile layouts, with most content spanning all 4 columns.

## 9. Agent Prompt Guide
This is a quick reference for an AI agent to build components and layouts consistent with the Apple design system.

### Quick Color Reference
*   **Primary Action**: `#0071e3` (Buttons)
*   **Text Link**: `#0066cc`
*   **Primary Text**: `#1d1d1f` (on light backgrounds)
*   **Inverse Text**: `#ffffff` or `#f5f5f7` (on dark backgrounds)
*   **Light Background**: `#f5f5f7`
*   **Dark Background**: `#000000`

### Iteration Guide
1.  **CTAs**: All primary buttons use background `#0071e3`, color `#ffffff`, and `border-radius: 999px`.
2.  **Typography**: Body text is `SF Pro Text`, `17px`, `400` weight, color `#1d1d1f`. Headings are `600` weight.
3.  **Spacing**: Use the `4px` scale for all margins and padding: `8, 16, 24, 32, 48px`.
4.  **Borders**: Use `border-radius: 8px` or `11px` for containers. No border unless it's a secondary button.
5.  **Cards**: Default card background is `#f5f5f7` with `11px` radius and `48px` vertical padding.
6.  **Button Height**: Ensure buttons have at least `12px` vertical padding for a minimum `44px` height.
7.  **Input States**: Focused inputs must have a `2px` solid outline in color `#0071e3`.
8.  **Shadows**: Never use `box-shadow` on any UI element. The design is flat.
9.  **Mobile Layout**: Below `734px`, switch to a single-column layout and collapse the main navigation.
10. **Contrast**: Always use `#1d1d1f` text on `#f5f5f7` backgrounds. Use `#f5f5f7` or `#ffffff` text on `#000000` backgrounds.