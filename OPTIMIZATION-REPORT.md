# KKA Teacher Schedule v1.8.0 — Runtime Refactor

## Runtime changes
- Removed the duplicate initial full-page render. The app now shows a lightweight loading shell, hydrates schedule data, then renders the active route once.
- Dashboard startup no longer reads the entire audit history. The history page retrieves its own latest 150 records only when opened.
- IndexedDB schema upgraded to v2 with an `at` index on the history store. Existing version-1 data is preserved by the upgrade path.
- History retrieval uses a reverse cursor and stops after the requested limit instead of `getAll()` followed by sorting/slicing.
- Jakarta date/time `Intl.DateTimeFormat` is constructed once and reused rather than recreated for every clock update.
- Translation TreeWalker now translates nodes as it traverses instead of allocating an intermediate array for every subtree.
- Service Worker cache version advanced to v1.8.0 to prevent stale application shell assets.

## Preserved features
Vanilla JS PWA, local IndexedDB/LocalStorage, Excel import, KKA teacher filtering, schedules, calendar, reminders, daily JP 1 verification, dark/light/system theme, Indonesian/English UI, collapsible sidebar, ICS export, JSON backup/restore.

## Verification performed
- JavaScript syntax checks across all local JS modules.
- Local relative import target checks.
- CSS bundle rebuilt from source stylesheets.
- Service Worker core cache path checks.
- ZIP integrity test.

## Measurement caveat
No browser automation/Lighthouse runtime was available in this build environment. Therefore no measured FCP/LCP/TBT or device-specific speedup is claimed. The changes above remove identified unnecessary work, but actual timings must be measured after deployment on target devices and networks.
