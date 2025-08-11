# ProManage SaaS — UI Style Guide (Minimal)

## 1) Color Tokens
- Neutral: #0B0F14 (text-strong), #1A1F24 (surfaces), #E8EDF2 (borders)
- Primary (accent): #3B82F6
- Secondary: #22C55E
- States: 
  - Success: #16A34A
  - Warning: #F59E0B
  - Error:   #EF4444

## 2) Typography
- Latin: Inter
- Arabic: IBM Plex Sans Arabic (or Noto Kufi Arabic)
- Base sizes: 14 / 16 / 20 / 24 / 32

## 3) Spacing Scale (px)
4, 8, 12, 16, 24, 32

## 4) Components
- Buttons: No uppercase, 8px radius, no heavy shadows
- Cards/Paper: 1px border using `divider`, subtle elevation
- Chips: 6px radius, compact label
- Tables: Row height 48 (comfortable), 40 (compact)

## 5) Interactions
- Hover: subtle background tint
- Focus: 2px outline, accessible
- Selected: light background (respect mode)

## 6) Layout Patterns
- Side Panel for Task Details
- Saved Views (filters + visible columns)
- Command Palette (⌘K / Ctrl+K)
- Density Toggle

## 7) Theming per Tenant
Store tokens per tenant: primary, secondary, logoUrl, default mode (light/dark), density.
Apply via `makeTheme({ brand, mode, rtl, density })`.
