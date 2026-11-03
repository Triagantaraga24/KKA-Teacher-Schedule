# KKA Teacher Schedule — Performance Report v1.7.0

This release optimizes the initial-load path while preserving the application's existing features and its static, backend-free deployment model.

## Measured source-level changes

| Measurement | v1.6.0 | v1.7.0 | Change |
|---|---:|---:|---:|
| JavaScript modules needed for the first Dashboard route | 28 | 14 | 50% fewer modules (12 are in the static shell) |
| Initial JavaScript graph (raw source bytes) | 232,796 B | 160,556 B | 31.0% less source |
| Initial JavaScript graph (aggregate gzip estimate) | 59,448 B | 39,791 B | 33.1% less compressed source |
| Stylesheet requests declared by the HTML shell | 12 | 1 | 11 fewer requests |
| CSS transfer estimate (gzip, separate old files vs bundle) | 23,180 B | 19,512 B | 15.8% less compressed CSS |
| Service Worker install precache entries | 47 | 22 | 53.2% fewer entries |
| SheetJS requested by initial HTML | Yes | No | Loaded only on Excel import |

Gzip estimates are local compression estimates of source files, not measurements of the bytes delivered by GitHub Pages. Browser cache, hosting compression, protocol, and device affect actual transfer and timing.

## Implemented optimizations

1. **Route-level imports** — dashboard, schedule, weekly, calendar, reminders, import, history, and settings modules load when their route is opened.
2. **Lazy SheetJS** — the HTML shell no longer downloads SheetJS. `excel-parser.js` loads the library only when a workbook is analyzed. The Service Worker caches the CDN response after a successful first load when the browser exposes it to the worker.
3. **Single CSS request** — `css/app.css` preserves the established source order. Original modular CSS files remain available for editing. Run `node scripts/build-css.mjs` after changing a source stylesheet.
4. **Parallel local-data reads** — schedules and history are requested concurrently. The first route can render while IndexedDB reads are still in progress, then refresh once data is available.
5. **Deferred non-critical work** — reminder-engine imports and Service Worker registration start after the first route has rendered.
6. **Scoped translation observer** — mutation observation is limited to the page view, modal root, and toast region; batches are coalesced before translation.
7. **Smaller PWA install cache** — only shell resources are precached. Feature modules are cached as they are first requested.

## Offline behavior

- The application shell is available offline after the Service Worker has installed successfully.
- The application shell, Dashboard route, and JP 1 verification module are precached. Other route modules become available offline after those routes have been opened at least once while online.
- Excel import requires the SheetJS library. Open Import Excel once while online to allow its CDN script to be cached by a supporting browser/Service Worker. On a first-ever offline import, the library cannot be fetched.
- Schedules and preferences remain local in IndexedDB/LocalStorage; no account or server synchronization is introduced.

## Preserved capabilities

Responsive UI and larger comfort scale, Light/Dark/System themes, Indonesian/English translation, collapsible sidebar, Monday/Wednesday/Friday JP 1 verification, Excel import, schedule CRUD, calendar, reminders, ICS export, JSON backup/restore, and PWA installation remain in the project.

## Verification performed

- Syntax checked every JavaScript module, build helper, and Service Worker.
- Verified all local static and dynamic module import paths resolve.
- Verified all 22 Service Worker core asset paths exist.
- Parsed all modular CSS and the generated CSS bundle with a CSS parser.
- Verified `css/app.css` exactly matches the ordered source stylesheets.
- Verified the HTML shell has one stylesheet reference and no eager SheetJS script.
- Verified ZIP archive integrity after packaging.

A full automated browser interaction/Lighthouse run was not completed in this environment. Performance targets are therefore not reported as measured runtime results.
