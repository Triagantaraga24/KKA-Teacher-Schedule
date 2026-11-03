# Changelog

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
