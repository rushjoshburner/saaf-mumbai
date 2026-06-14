---
name: Mumbai Civic Watch
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#444650'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#757682'
  outline-variant: '#c5c6d2'
  surface-tint: '#445ba0'
  primary: '#00164a'
  on-primary: '#ffffff'
  primary-container: '#0d2a6e'
  on-primary-container: '#7e94de'
  inverse-primary: '#b4c4ff'
  secondary: '#b5005d'
  on-secondary: '#ffffff'
  secondary-container: '#e20876'
  on-secondary-container: '#fffbff'
  tertiary: '#002018'
  on-tertiary: '#ffffff'
  tertiary-container: '#00372b'
  on-tertiary-container: '#59a590'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c4ff'
  on-primary-fixed: '#00174c'
  on-primary-fixed-variant: '#2b4387'
  secondary-fixed: '#ffd9e2'
  secondary-fixed-dim: '#ffb1c7'
  on-secondary-fixed: '#3f001c'
  on-secondary-fixed-variant: '#8e0048'
  tertiary-fixed: '#a4f2d9'
  tertiary-fixed-dim: '#89d5be'
  on-tertiary-fixed: '#002019'
  on-tertiary-fixed-variant: '#005141'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  headline-lg:
    fontFamily: Barlow Condensed
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Barlow Condensed
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Barlow Condensed
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Barlow Condensed
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 22px
  label-mono:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  map-label:
    fontFamily: Barlow Condensed
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  touch-target: 48px
  gutter: 16px
  margin-mobile: 16px
---

## Brand & Style

The design system is anchored in the concept of **Utilitarian Accountability**. It is a public-service framework built for the specific environmental and social context of Mumbai. The personality is authoritative, transparent, and resilient, eschewing the ephemeral polish of consumer SaaS for the durability of civic infrastructure.

### Design Principles
*   **Speed over Beauty:** Interface decisions prioritize time-to-action. Visual flourishes that do not aid in information retrieval are removed.
*   **Clarity over Decoration:** High-contrast boundaries and legible type scales ensure usability in harsh outdoor sunlight and high-stress reporting scenarios.
*   **Civic Trust:** The aesthetic draws from municipal signage, official ledgers, and transit maps to evoke a sense of permanent, institutional reliability.
*   **One-Handed Mobile First:** All critical actions are weighted toward the bottom 60% of the screen to accommodate commuters on crowded transit.

### Visual Style
The system utilizes a **Modern-Industrial** aesthetic. It combines the structured rigidity of a grid-based layout with high-impact, condensed typography reminiscent of newsprint and street signage. It uses flat surfaces and heavy strokes to define hierarchy rather than complex shadows or blurs.

## Colors

The palette is derived from Mumbai’s urban landscape—from the deep navy of the coastal authority to the high-visibility orange of infrastructure projects.

### Core Palette
*   **Mumbai Navy (#0D2A6E):** Used for primary actions, headers, and institutional authority.
*   **Concrete (#E8E4DC):** The primary background color. It reduces glare compared to pure white and reinforces the civic "physicality" of the app.
*   **Rani Pink (#EB197D):** A high-visibility accent for urgent interactive elements and reporting triggers.

### Semantic Mapping
*   **Success (Coastal Teal):** Resolved issues, "Saaf" (Clean) status.
*   **Warning (Construction Orange):** Ongoing work, "Bandhkam," or impending civic alerts.
*   **Error (Best Red):** Critical failures, garbage overflows, or "Kachra" reports requiring immediate intervention.
*   **Info (Yellow):** General notices, bus/train timings, and non-critical data.

### Accessibility
All color combinations for text-on-background must maintain a minimum contrast ratio of 4.5:1 (WCAG AA). Use black text on the Concrete surface and white text on Mumbai Navy or Best Red backgrounds.

## Typography

This design system uses **Barlow Condensed** as the primary typeface. Its narrow width allows for maximum information density, ensuring long Mumbai ward names and local addresses do not truncate on small screens.

### Hierarchy Rules
1.  **Headlines:** Always uppercase. Use Heavy (800) for primary screens and Bold (700) for sub-sections.
2.  **Body Text:** Primarily Medium (500) weight to ensure legibility against the "Concrete" background.
3.  **Data & Labels:** Use a monospaced font (IBM Plex Mono) for timestamps, ward numbers, and GPS coordinates to emphasize the "official record" nature of the data.
4.  **Language Support:** While tokens define English, the system must accommodate Devanagari script (Marathi/Hindi) at 1.2x the line-height of the English counterparts to prevent clipping of diacritics.

## Layout & Spacing

The system follows a strict **4px baseline grid**.

### Grid & Layout
*   **Fluid Mobile Grid:** A 4-column fluid system for mobile devices with a 16px outer margin.
*   **Touch Targets:** All interactive elements (buttons, chips, checkboxes) must have a minimum physical tap area of 48x48px, regardless of their visual size, to account for one-handed use during transit.
*   **Vertical Rhythm:** Use 16px (md) for standard element spacing and 24px (lg) to separate distinct content blocks or cards.

### Mobile Optimization
Primary action buttons (e.g., "Report Issue") should be pinned to the bottom of the viewport or placed in the "Thumb Zone" (bottom-right for right-handed use) to facilitate rapid interaction.

## Elevation & Depth

To maintain the "Civic/Industrial" feel, this design system avoids soft ambient shadows. Depth is communicated through **Tonal Layering** and **High-Contrast Borders**.

### Layering Logic
1.  **Level 0 (Base):** Concrete (#E8E4DC) background.
2.  **Level 1 (Cards/Surfaces):** White (#FFFFFF) surfaces with a 2px solid Black (#111111) or Navy (#0D2A6E) border.
3.  **Level 2 (Modals/Overlays):** Elevated surfaces use a thick 4px "block shadow" (a solid offset fill, not a blur) in Black to indicate they are active and prioritized.
4.  **Map Overlays:** Use semi-transparent Navy (#0D2A6E at 90%) for floating UI elements over map views to ensure contrast against varied map tiles.

## Shapes

The shape language is **functional and pragmatic**. 

*   **Corners:** A subtle 4px (Soft) radius is applied to cards and buttons to prevent the UI from feeling overly aggressive while maintaining a serious, structured appearance.
*   **Reporting Stamps:** These are the exception; they use 0px (Sharp) corners and thick 2px borders to mimic the look of physical rubber stamps used in government offices.
*   **Icons:** Contained within square or circular bounding boxes depending on the action type (Square for reporting categories, Circle for navigational actions).

## Components

### Buttons
*   **Primary:** Solid Mumbai Navy background, White text, Uppercase Barlow Condensed. 2px black border for "pressed" state.
*   **Urgent (Report):** Solid Rani Pink background. Used sparingly for the main "New Report" trigger.

### Civic Reporting Chips
*   Used for status filtering (e.g., "Resolved," "Pending").
*   Styling: 1px border with the semantic color (e.g., Teal for resolved) and a 12px Mono label.

### The "Report Stamp"
*   A signature component for the design system. 
*   Displays the Category, Location, and "Days Open" in a high-contrast block. 
*   Color shifts based on status: Red for "Active," Teal for "Resolved."

### Input Fields
*   Stacked layout: Label (Mono) above the input.
*   Heavy 2px black bottom-border for the input area. No background fill. 
*   Active state: Border changes to Mumbai Navy with a 2px offset "focus" line.

### Iconography Style
*   **Weight:** 2px stroke weight for all icons.
*   **Visuals:** Practical and literal. (e.g., a "Kachra" icon is a literal trash bin, "Bandhkam" is a construction crane).
*   **Key Icons:** Camera (Report), Map Pin (Location), Megaphone (Alert), Shield (Safety), and Check-Circle (Resolved).

### Motion
*   **Duration:** 150ms for most interactions.
*   **Style:** Linear or slight "In-Out" ease. Avoid bouncy or playful springs. Transitions should feel like a mechanical switch being flipped.