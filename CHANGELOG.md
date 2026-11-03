# Changelog

## v1.5.0 — UI theme and translation refinement

- Hardened light/dark theme coverage for navigation, verification options, modal portals, settings/import panels, form controls, data tables, calendar/week views, alerts, badges, and toast notifications.
- Added theme-aware native date/time controls, browser color-scheme metadata, and consistent focus/hover surfaces.
- Expanded Indonesian/English UI vocabulary, including mobile navigation labels and common dynamic status text.
- Corrected translation direction handling for English-authored labels and improved switching between languages after dynamic content is rendered.
- Localized calendar weekday names according to the active interface language.
- Updated service-worker cache version to v1.5.0.

v1.4.0 — Theme consistency & complete bilingual UI
- Added a final theme-normalization layer for dashboard KPI cards, forms, dropdowns, tables, calendars, weekly columns, import validation panels, modals, toasts, empty states, and other dynamic surfaces.
- Added explicit theme tokens for surfaces, inputs, borders, hover states, focus rings, overlays, and scrollbars in light and dark modes.
- Improved contrast for disabled controls, muted labels, inline legacy styles, and semantic status components.
- Expanded Indonesian/English translations for import validation, backup/restore, notification permissions, settings, activity messages, and dynamic status text.
- Corrected translation direction for English-authored UI strings so English labels are not accidentally translated while English is selected.
- Translated calendar and mini-weekday abbreviations using the active interface locale.
- Updated PWA cache version to v1.4.0.

## v1.0.1 — Mobile UI and icon sizing

- Reworked responsive spacing, page headings, action buttons, forms, schedule cards, calendar layout, weekly timetable, and modal behavior for narrow screens.
- Added safe-area-aware spacing for fixed mobile navigation and modal footers.
- Fixed the calendar view's inline two-column width rule so it collapses correctly on tablet and mobile screens.
- Standardized inline SVG icons to a 16×16 px base size with explicit component-specific sizes.
- Updated the Service Worker cache version so installed PWAs fetch the revised UI assets.


## v1.1.0 — Daily Verification, Themes & Language
- Added date-specific JP 1 verification for Monday, Wednesday, and Friday (Upacara, GSS, Pramuka, Literasi, or no special activity).
- Verification is stored locally per date with a change history; it does not silently shift or cancel lessons.
- Added light/dark theme toggle with system preference as the default and system changes followed while in system mode.
- Added Indonesian/English language selector and local UI translation dictionary.
- Added collapsible desktop sidebar with persisted preference.
- Updated Service Worker cache version.
