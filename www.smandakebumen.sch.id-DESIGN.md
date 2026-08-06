# Design System Inspired by SMA Negeri 2 Kebumen

## 1. Visual Theme & Atmosphere

This design system embodies the institutional identity of a prestigious Indonesian secondary school with a warm, professional, and welcoming aesthetic. The visual language combines authoritative deep teals and forest greens with soft, welcoming pastels and gradients that evoke sunrise—symbolizing new beginnings and educational growth. The system prioritizes clarity, accessibility, and a sense of community pride, featuring generous whitespace and carefully considered hierarchies that guide users through institutional information with confidence. The palette transitions from cool institutional anchors to warm, aspirational gradients that reflect the school's forward-thinking mission.

**Key Characteristics:**
- Institutional authority paired with warm accessibility
- Sunset-to-sky gradient transitions in hero imagery
- Clean, readable typography hierarchy on light backgrounds
- Teal and forest green as trusted institutional anchors
- White space and breathing room between content sections
- Rounded corners emphasizing approachability
- Subtle shadows for depth without heaviness
- Secure, familiar navigation patterns

## 2. Color Palette & Roles

### Primary
- **Institutional Navy** (`#133E59`): Core brand color for headings, primary navigation, and deep content sections; establishes authority and institutional trust
- **Forest Green** (`#1A936F`): Primary interactive color for buttons, links, and call-to-action elements; conveys growth, stability, and forward momentum

### Accent Colors
- **Teal Accent** (`#147C5D`): Secondary interactive state and accent highlights; slightly deeper than Forest Green for visual distinction
- **Muted Teal** (`#5CA08E`): Tertiary accent for borders and softer interactive elements
- **Sky Blue** (`#00ACED`): Tertiary informational accent for secondary CTAs
- **Corporate Blue** (`#3B5998`): Reserved accent for occasional social or institutional contexts

### Interactive
- **Error/Danger** (`#CC0001`): Error states, validation failures, and critical alerts
- **Warm Pink** (`#FFC0CB`): Used sparingly for gradient overlays and soft visual transitions in hero sections
- **Coral Red** (`#E95950`): Warning and secondary alert states

### Neutral Scale
- **Pure White** (`#FFFFFF`): Primary background for content areas, cards, and main surfaces
- **Light Gray** (`#F3F3F3`): Secondary background for sections and subtle container distinction
- **Border Gray** (`#DDDDDD`): Thin borders between content sections and card edges
- **Pure Black** (`#000000`): Primary text color for body content and labels
- **Text Dark** (`#222222`): Alternate dark text for subtle differentiation
- **Deep Black** (`#111111`): Maximum contrast text in premium branded contexts

### Surface & Borders
- **White Surface** (`#FFFFFF`): Cards, input fields, and floating content containers
- **Light Background** (`#F3F3F3`): Section dividers and secondary surface areas
- **Border Stroke** (`#DDDDDD`): 1px borders on inputs and card edges

## 3. Typography Rules

### Font Family
**Primary:** Poppins (sans-serif) — versatile, friendly, and modern geometric sans-serif that balances institutional credibility with approachability
**Fallback Stack:** `Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### Hierarchy
| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|---|---|
| H1 / Display | Poppins | 30px | 700 | 34.5px | 0px | Hero titles and page headers |
| H2 / Section Title | Poppins | 26px | 700 | 29.9px | 0px | Major section headings |
| H3 / Subsection | Poppins | 18px | 700 | 20.7px | 0px | Card titles, subsections |
| H4 / Emphasis | Poppins | 16px | 700 | 18.4px | 0px | Labeled sections, form labels |
| Span / Highlight | Poppins | 22px | 600 | 25.3px | 0px | Emphasis text within copy |
| Body / Default | Poppins | 16px | 400 | 18.4px | 0px | Paragraph text, list items |
| Label / Small | Poppins | 14px | 400 | 16.1px | 0px | Form labels, captions |
| Link / Navigation | Poppins | 15px | 400 | 17.25px | 0px | Navigation links, inline links |
| Button / CTA | Poppins | 16px | 600 | 18.4px | 0px | Button text, CTAs |

### Principles
- **Hierarchy through weight, not size:** Consistent sizing with weight variation creates refined hierarchy
- **Generous line height:** 1.15–1.5× multipliers improve readability on institutional content
- **Poppins versatility:** Works equally well at large display sizes and small UI text
- **Institutional confidence:** Bold weights (600+) anchor headings and branded contexts
- **Accessibility-first:** Minimum 14px on labels and body text ensures legibility for all users

## 4. Component Stylings

### Buttons

**Primary Button (Solid Green)**
- Background: `#1A936F`
- Text Color: `#FFFFFF`
- Font Size: `16px`
- Font Weight: `500`
- Padding: `10px 16px`
- Border Radius: `5px`
- Border: `none`
- Box Shadow: `rgba(0, 0, 0, 0.25) 0px 10px 20px -10px`
- Line Height: `18.4px`
- Height: `38.4px`
- Hover: Darken background to `#147C5D`, increase shadow to `rgba(0, 0, 0, 0.35) 0px 10px 20px -10px`
- Active: Background `#0F6B4F`, shadow `rgba(0, 0, 0, 0.25) 0px 5px 10px -5px`
- Disabled: Background `#DDDDDD`, text `#999999`, no shadow

**Secondary Button (Outline Teal)**
- Background: `#FFFFFF`
- Text Color: `#1A936F`
- Font Size: `16px`
- Font Weight: `600`
- Padding: `8px 20px`
- Border Radius: `100px`
- Border: `2px solid #1A936F`
- Box Shadow: `rgba(0, 0, 0, 0.25) 0px 10px 20px -10px`
- Line Height: `18.4px`
- Height: `38.4px`
- Hover: Background `#F3F3F3`, border `#147C5D`, text `#147C5D`
- Active: Background `#E8F5F2`, border `#0F6B4F`
- Disabled: Border `#DDDDDD`, text `#DDDDDD`, no shadow

**Icon Button (Compact Square)**
- Background: `#1A936F`
- Text Color: `#FFFFFF`
- Width: `36.2px`
- Height: `38.4px`
- Padding: `10px`
- Border Radius: `5px`
- Font Size: `16px`
- Box Shadow: `rgba(0, 0, 0, 0.25) 0px 10px 20px -10px`
- Hover: Background `#147C5D`, shadow increased
- Active: Background `#0F6B4F`

### Cards & Containers

**Bordered Card (Content Card)**
- Background: `rgba(0, 0, 0, 0)`
- Border: `2px solid #1A936F`
- Border Radius: `10px`
- Padding: `10px`
- Box Shadow: `none`
- Width: `316px`
- Min Height: `303px`
- Hover: Border color to `#147C5D`, add subtle shadow `rgba(0, 0, 0, 0.1) 0px 4px 12px 0px`
- Text Color: `#000000`
- Font Size: `16px`

**Plain Card (Image Card)**
- Background: `rgba(0, 0, 0, 0)`
- Border: `none`
- Border Radius: `0px`
- Padding: `0px`
- Box Shadow: `none`
- Width: `316px`
- Height: `284px`
- Hover: Add shadow `rgba(0, 0, 0, 0.15) 0px 8px 16px 0px`

**White Content Container**
- Background: `#FFFFFF`
- Border: `1px solid #DDDDDD`
- Border Radius: `10px`
- Padding: `20px 24px`
- Box Shadow: `none`
- Text Color: `#000000`

### Inputs & Forms

**Text Input (Default)**
- Background: `#FFFFFF`
- Border: `1px solid #DDDDDD` (bottom border emphasized)
- Border Radius: `0px`
- Padding: `15px 0px`
- Font Size: `15px`
- Font Weight: `400`
- Text Color: `#133E59`
- Line Height: `17.25px`
- Focus: Border color to `#1A936F`, box shadow `0 1px 0 0 #1A936F`
- Placeholder: Color `#DDDDDD`
- Disabled: Background `#F3F3F3`, text color `#999999`

**Textarea Input**
- Background: `#FFFFFF`
- Border: `1px solid #DDDDDD` (bottom border emphasized)
- Border Radius: `0px`
- Padding: `15px 0px`
- Font Size: `15px`
- Font Weight: `400`
- Text Color: `#133E59`
- Line Height: `17.25px`
- Min Height: `140px`
- Focus: Border color to `#1A936F`, box shadow `0 1px 0 0 #1A936F`
- Resize: Vertical only

**Form Label**
- Font Size: `14px`
- Font Weight: `400`
- Text Color: `#133E59`
- Line Height: `16.1px`
- Margin Bottom: `8px`
- Display: Block

### Navigation

**Header Navigation**
- Background: `#FFFFFF`
- Text Color: `#000000`
- Font Size: `16px`
- Font Weight: `400`
- Padding: `0px`
- Box Shadow: `none`
- Link Color: `#133E59`
- Link Hover: Color `#1A936F`, font weight `500`
- Link Active: Color `#1A936F`, underline or border-bottom `2px solid #1A936F`

**Sidebar / Mobile Navigation**
- Background: `#FFFFFF`
- Border Right: `1px solid #DDDDDD`
- Text Color: `#000000`
- Link Color: `#133E59`
- Link Hover: Background `#F3F3F3`, color `#1A936F`
- Padding: `16px`

**Footer Navigation**
- Background: `#133E59`
- Text Color: `#FFFFFF`
- Font Size: `15px`
- Link Color: `#FFFFFF`
- Link Hover: Color `#1A936F`, underline
- Padding: `36px 20px`

## 5. Layout Principles

### Spacing System
The spacing system uses an 8px base unit, scaling through power-of-2 and harmonic multiples for consistent rhythm:
- **4px:** Micro-adjustments, button icon padding
- **8px:** Compact spacing between inline elements, form control margins
- **12px:** Small section gutters, list item spacing
- **16px:** Standard element spacing, card internal padding
- **20px:** Medium content margins, section separation
- **24px:** Large section padding, container gutters
- **32px:** Major section breaks
- **36px:** Footer and header padding
- **52px:** Between major content blocks
- **60px:** Page-level section separation
- **64px:** Large hero margins
- **72px:** Maximum breathing room between major sections

### Grid & Container
- **Max Content Width:** 1200px (typical container)
- **Gutter Width:** 24px (spacing between grid columns)
- **Column Count:** 12-column responsive grid
- **Section Padding:** 52px–72px vertical, 20px–36px horizontal (mobile to desktop)
- **Card Grid:** 3-column on desktop, 2-column tablet, 1-column mobile; 24px gap between cards

### Whitespace Philosophy
Generous whitespace creates hierarchy and breathing room. Sections are separated by 52–72px vertical margins, content within sections by 20–24px. This creates a clear visual rhythm that guides users through institutional information without feeling cramped. Whitespace around headings and CTAs emphasizes their importance and encourages interaction.

### Border Radius Scale
- **0px:** Form inputs, plain cards, data tables (sharp, utilitarian)
- **5px:** Buttons, small components, minimal rounding (friendly but structured)
- **8px:** Badges, small alerts (subtle softness)
- **10px:** Cards, containers, moderate components (balanced softness)
- **100px:** Pill-shaped buttons, fully rounded outline buttons (maximum friendliness)

### Border Widths
- **Thin: 1px** — Input bottom borders, card edges, subtle dividers, light visual separation
- **Medium: 2px** — Outline button borders, active states, emphasis on interactive elements and focus indicators

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| None / Base | No shadow, `box-shadow: none` | Flat cards, plain inputs, structural elements |
| Small | `rgb(0, 0, 0) 0px 0px 10px 0px` | Modal overlays, floating tooltips |
| Medium | `rgba(0, 0, 0, 0.25) 0px 10px 20px -10px` | Buttons, small cards on hover, input focus |
| Large | `rgba(0, 0, 0, 0.25) 0px 20px 40px -10px` | Elevated cards, prominent modals, dropdown menus |
| Extra Large | `rgba(0, 0, 0, 0.2) 4px 4px 20px 0px` | Header/navigation fixed positioning, z-stack peaks |

**Shadow Philosophy:**
Shadows follow a subtle, understated approach that avoids visual clutter. The system uses soft, offset shadows with high blur radius to suggest elevation without creating harsh contrast. Shadows increase with interactive state (hover, active) to provide feedback. Large modals and navigation use slightly more pronounced shadows to break them from the background. Opacity rarely exceeds 0.35 to maintain a refined aesthetic.

### Opacity Levels
- **50% (0.50):** Disabled elements, inactive states, overlay tints on images and gradients
- **0% (Transparent):** Card backgrounds, ghost elements, overlay separators
- **100% (1.0):** All solid backgrounds, text, interactive elements

### Z-index / Layering
- **Base: z-index 1** — Normal document flow elements
- **Base: z-index 2** — Slightly elevated cards, hover states
- **Base: z-index 3** — Dropdown menus, popovers
- **Base: z-index 4** — Sticky navigation, fixed headers
- **Base: z-index 5** — Modal backdrops
- **Base: z-index 6** — Modal dialogs
- **Base: z-index 7** — Tooltips, alerts above modals
- **Base: z-index 8** — Toast notifications, highest priority

## 7. Do's and Don'ts

### Do
- Use **Forest Green** (`#1A936F`) for all primary CTAs and interactive elements to establish clear affordance
- Maintain **minimum 44px height** on touch targets (buttons, links) for mobile accessibility
- Apply **52–72px vertical spacing** between major content sections to create breathing room
- Use **Poppins at 16px+ for body text** to ensure readability on all devices
- Center-align headings and CTAs in hero and featured sections to emphasize importance
- Add **2px solid green borders** to outline buttons for secondary actions
- Increase button shadow on hover to provide tactile feedback
- Use **white backgrounds** with dark text for maximum readability on institutional content
- Pair **Forest Green with white** in modals and overlays for contrast and clarity
- Apply `border-radius: 100px` to pill-shaped outline buttons for softer, friendlier CTAs

### Don't
- Don't mix institutional navy (`#133E59`) with coral red (`#E95950`) in the same composition without clear separation
- Don't use more than 2 font sizes in a single section (causes visual chaos)
- Don't apply shadows to more than 20% of page elements (reduces visual hierarchy)
- Don't set button padding below `8px` vertically or `16px` horizontally (mobile touch target failure)
- Don't use text colors other than `#000000`, `#FFFFFF`, or `#133E59` for body copy (breaks contrast)
- Don't apply border-radius greater than `10px` to cards (contradicts institutional aesthetic)
- Don't left-align CTAs in hero sections (reduces visual prominence)
- Don't use outline buttons for primary actions; reserve them for secondary interactions
- Don't apply opacity below 50% to disable states (insufficient contrast for accessibility)
- Don't create cards wider than `316px` without column spanning (breaks grid rhythm)

## 8. Responsive Behavior

### Breakpoints
| Breakpoint Name | Width | Key Changes |
|---|---|---|
| Mobile | 320px–767px | Single-column layout, 16px padding, 36px section spacing, icon-only navigation |
| Tablet | 768px–1023px | Two-column card grid, 24px padding, 52px section spacing, hybrid navigation |
| Desktop | 1024px+ | Three-column card grid, 36px padding, 72px section spacing, full horizontal navigation, hero image displayed |

### Touch Targets
- **Minimum height:** 44px for all clickable elements (buttons, links)
- **Minimum width:** 44px for standalone buttons
- **Touch padding:** 16px minimum around icon buttons
- **Link underline:** 2px or 4px focus border on mobile for clarity
- **Hover delay:** 200ms on mobile (avoid accidental hovers)

### Collapsing Strategy
- **Hero Section:** Full-screen on desktop, 60vh on tablet, 40vh on mobile; text overlays scale responsively
- **Card Grids:** 3 columns → 2 columns → 1 column; gap reduces from 24px to 16px on mobile
- **Navigation:** Horizontal menu on desktop, mobile hamburger menu below 768px
- **Images:** Max-width 100% with aspect-ratio locks; hero images scale down, thumbnails remain square
- **Typography:** Headings scale using `clamp()` (e.g., `clamp(18px, 5vw, 30px)`) for fluid hierarchy
- **Padding:** Horizontal padding reduces from 36px (desktop) to 20px (tablet) to 16px (mobile)
- **Modals:** Full-screen on mobile, max-width 600px on desktop with margin auto

## 9. Agent Prompt Guide

### Quick Color Reference
- **Primary CTA:** Forest Green (`#1A936F`)
- **Institutional Text & Headings:** Institutional Navy (`#133E59`)
- **Background:** Pure White (`#FFFFFF`)
- **Secondary Background:** Light Gray (`#F3F3F3`)
- **Borders:** Border Gray (`#DDDDDD`)
- **Body Text:** Pure Black (`#000000`)
- **Error States:** Error Red (`#CC0001`)
- **Secondary CTA:** Outline with Forest Green border on white background

### Iteration Guide
1. **Color Anchor:** All interactive primary elements use `#1A936F`; institutional hierarchy uses `#133E59` for headers and navigation
2. **Typography Foundation:** Poppins everywhere; H1 at 30px/700, body at 16px/400, buttons at 16px/600; line-height always 1.15–1.5× font size
3. **Spacing Rhythm:** Base unit is 8px; major sections separate at 52–72px; component padding uses 10px–20px; never below 8px for visual elements
4. **Button Contract:** Solid green (`#1A936F`) for primary, outline green on white for secondary, 38.4px height minimum, 5px radius on solid/icon buttons, 100px radius on pills
5. **Card Pattern:** 316px width, 2px green border (`#1A936F`), 10px radius, no shadow (add shadow on hover), 10px internal padding
6. **Form Input Simplicity:** Minimal styling, bottom border only (1px gray), 15px padding, 0px radius, focus state adds 1px bottom border in forest green
7. **Shadow Depth:** Use only 4 levels (none, small/modal, medium/button, large/card); apply only on interaction or elevation; max opacity 0.35
8. **Responsive Collapse:** Cards 3→2→1 columns, nav horizontal→hamburger, hero 60vh→40vh, padding 36px→20px→16px, all text uses `clamp()` for fluidity
9. **Accessibility Minimum:** 44px touch targets, 16px+ body text, 4.5:1 color contrast, focus indicators 2px solid in primary color, reduced motion respected