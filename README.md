# KKA Teacher Schedule & Smart Reminder

Personal teaching-schedule workspace for a Koding dan Kecerdasan Artifisial (KKA) teacher. Built as a static, client-side Progressive Web App (PWA) using HTML5, CSS3, Vanilla JavaScript ES Modules, IndexedDB, LocalStorage, Web Notifications, Service Worker, iCalendar export, and SheetJS.

> **Privacy by default:** Excel files and schedule records are processed and stored in the browser on the current device. The application does not upload them to a backend. Do not commit personal workbooks, JSON backups, or exported calendars to a public Git repository. The default teacher display name and teacher ID are present in `js/core/config.js`; because the source repository and GitHub Pages site may be public, change those defaults before publishing if you do not want the identity visible in the source.

## Included features

- Dashboard with today's teaching sessions, next-session countdown, upcoming agenda, weekly duration, and class summary.
- Schedule CRUD for one-time/date-specific events and explicitly recurring weekly events, including per-occurrence cancellation and rescheduling exceptions for recurring sessions.
- List, weekly timetable, and monthly calendar views.
- Excel import for `.xlsx` and `.xls`, multiple selected files and worksheets, header-row detection, column detection, manual column mapping, validation summary, and import preview.
- Strict import matching: teacher ID first when present, normalized teacher name when teacher ID is unavailable, and KKA subject validation. Ambiguous identity rows are not imported automatically.
- Exam schedule classification. Date-specific events retain their dates. Weekday-only data is not automatically treated as recurring unless the workbook explicitly indicates a weekly/recurring pattern. Exam records require a specific date.
- Duplicate detection and re-import handling (identical rows skipped; a matching class/date/type record with changed details updates the existing record).
- Configurable browser notifications and test notification. Reminder checks run while the application is open and its JavaScript context is active.
- `.ics` export for calendar applications, with timezone information and configurable `VALARM` reminders.
- JSON backup and restore, local schedule history, offline app-shell caching, and PWA installation support.
- Responsive desktop, tablet, and mobile layouts.

## Technology and deployment

This is a **static website**. It has no application backend, database server, API server, authentication server, serverless function, Firebase, or Supabase. GitHub Pages can host the project as static files.

SheetJS Community Edition `0.20.3` is loaded from the official SheetJS CDN for Excel parsing. The first Excel import needs network access so the browser can load the library. The service worker attempts to cache the CDN script after a successful load for later offline use; availability depends on browser cache behavior.

## Run locally

Because the project uses JavaScript ES modules and a service worker, open it from a local HTTP origin rather than using `file://`.

1. Open the project folder in Visual Studio Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.
4. Use the URL shown by Live Server (typically `http://127.0.0.1:5500`).

A local static HTTP server is only needed to serve the files; it does not add a backend to the app. Service workers and notifications require HTTPS in production; `localhost` is treated as a secure development origin by supported browsers.

## First-time setup

1. Open **Settings** and verify the teacher name and teacher ID. Defaults are `Raga Triagantara, S.Kom.` and `211032`.
2. Go to **Import Excel** and select one or more `.xlsx` / `.xls` files.
3. Review the detected worksheets and columns. Use **Pemetaan kolom** if a column was not detected correctly.
4. Review valid rows and invalid/ambiguous rows. Only rows with matching teacher identity, KKA subject, class, a valid date/explicit recurring pattern, and valid start/end times can be imported.
5. Select **Konfirmasi & simpan** to store the valid events in this browser's IndexedDB.
6. Configure reminders and request notification permission from the **Reminders** page.
7. Export `.ics` to a calendar account for cross-device calendar notifications.

## Excel matching and date rules

- Teacher ID is authoritative when the workbook contains an ID field. If it is absent, the parser compares normalized teacher names.
- KKA subject matching is mandatory. Rows for other subjects are excluded.
- Similar/ambiguous teacher names are shown for review and are not included automatically.
- Date-specific schedule rows retain their exact date.
- A row containing a weekday without a date becomes a recurring event only when the worksheet or its schedule-type data explicitly indicates a weekly/recurring/routine timetable. Otherwise it is flagged for review.
- Records recognized as exam schedules (for example STS, SAS, ASAS, PG, Essay, exam, or room-code information) must have an exact date and are not silently converted into recurring teaching sessions.
- The original workbook is never modified.

## Notifications and cross-device behavior

Browser notifications are permission-based. The local reminder engine checks upcoming events periodically while the app is open. **A backend-free PWA cannot guarantee a notification after the browser has been fully closed or the operating system has suspended the browser.** A service worker is not a general-purpose scheduled timer and this project does not claim otherwise.

For more dependable notifications across devices:

1. Export the required schedule as an `.ics` file from the **Reminders** page.
2. Import it into Google Calendar, Apple Calendar, or Microsoft Outlook.
3. Enable notifications in that calendar app/account on each device.
4. Re-export and re-import the `.ics` snapshot after changing the schedule. This is not automatic two-way synchronization.

Each browser/device has its own IndexedDB and LocalStorage. Schedule records do not automatically synchronize between devices. Use **Settings → Ekspor backup JSON** and restore that file on another device to transfer the app's data.

## GitHub Pages deployment — full CLI (Windows PowerShell)

The steps below create a GitHub repository from the extracted project folder, push the `main` branch, configure GitHub Pages to publish from the repository root, and print the published URL. You need a GitHub account and permission to create repositories and manage Pages settings.

### 1. Install Git and GitHub CLI

Open **PowerShell** and run:

```powershell
winget install --id Git.Git -e
winget install --id GitHub.cli -e
```

Close and reopen PowerShell, then verify:

```powershell
git --version
gh --version
```

If `winget` is unavailable, install Git for Windows and GitHub CLI from their official installers, then reopen the terminal.

### 2. Authenticate GitHub CLI

```powershell
gh auth login --hostname github.com --git-protocol https --web
gh auth status
```

Follow the browser/device flow and authorize GitHub CLI. Use an account that has permission to create a repository and manage its Pages settings.

### 3. Extract the ZIP and open the project directory

Extract `KKA-Teacher-Schedule.zip`. Then change directory to the extracted folder. Example:

```powershell
cd "$HOME\Downloads\KKA-Teacher-Schedule"
```

Adjust the path to the folder where you extracted the ZIP. Confirm the entry file is present:

```powershell
Get-ChildItem
Test-Path .\index.html
```

`Test-Path` should return `True`.

### 4. Initialize Git and create the first commit

Run these commands **inside the project folder**:

```powershell
git init -b main
git add .
git status
git commit -m "Initial release: KKA Teacher Schedule PWA"
```

If Git asks for your author identity, configure it and retry the commit:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your-github-verified-email@example.com"
git commit -m "Initial release: KKA Teacher Schedule PWA"
```

Use the email associated with your GitHub account. Do not put passwords, access tokens, private workbook files, or backup JSON files into the repository.

### 5. Create the GitHub repository and push from the current folder

Choose **one** visibility option:

```powershell
# Public repository (works with GitHub Free Pages)
gh repo create KKA-Teacher-Schedule --public --source . --remote origin --push
```

Or, if your GitHub plan permits Pages for private repositories:

```powershell
gh repo create KKA-Teacher-Schedule --private --source . --remote origin --push
```

GitHub Pages sites are public on the internet. Making a repository private does not make a published Pages website private. Do not publish confidential content in the app files or repository.

Check the remote and pushed branch:

```powershell
git remote -v
git status -sb
gh repo view --web
```

### 6. Configure GitHub Pages from the CLI

The application is in the repository root and already has `index.html`. Configure Pages to deploy from `main` and `/` using the GitHub REST API through GitHub CLI:

```powershell
$repo = gh repo view --json nameWithOwner --jq .nameWithOwner
$pagesConfig = '{"build_type":"legacy","source":{"branch":"main","path":"/"}}'
$pagesConfig | gh api --method POST "repos/$repo/pages" --input -
```

If the API responds that the Pages site already exists (HTTP `409`), update its source instead:

```powershell
$pagesConfig | gh api --method PUT "repos/$repo/pages" --input -
```

Verify the Pages configuration and obtain the URL:

```powershell
gh api "repos/$repo/pages" --jq '{status: .status, url: .html_url, source: .source}'
```

If the API reports a permission error, confirm that `gh auth status` shows the intended account and that the account has repository administrator/Pages settings permission. If the repository is under an organization, its policy may restrict Pages.

### 7. Wait for the first Pages deployment and verify

```powershell
gh run list --repo $repo --limit 5
gh browse --repo $repo
```

The site URL for a project repository normally has this shape:

```text
https://GITHUB-USERNAME.github.io/KKA-Teacher-Schedule/
```

Open the `html_url` returned by the Pages API. GitHub notes that the first deployment can take several minutes. The actual URL returned by GitHub is authoritative.

### 8. Publish future updates using CLI

After editing files locally:

```powershell
git status
git add .
git commit -m "Update KKA schedule app"
git push origin main
```

GitHub Pages will publish the updated root files. Check the deployment status with:

```powershell
gh run list --repo $repo --limit 5
```

### 9. If the repository already exists

If you already created the GitHub repository and want to connect this local project, use the repository URL from `gh repo view` or GitHub. Example:

```powershell
git remote add origin https://github.com/GITHUB-USERNAME/KKA-Teacher-Schedule.git
git push -u origin main
```

If `origin` already exists, inspect it with `git remote -v` and update it if needed:

```powershell
git remote set-url origin https://github.com/GITHUB-USERNAME/KKA-Teacher-Schedule.git
git push -u origin main
```

### 10. Common CLI troubleshooting

- **`gh` is not recognized:** reopen PowerShell after installing GitHub CLI, then run `gh --version`.
- **Authentication failed:** run `gh auth login` again and check `gh auth status`.
- **Repository name already exists:** choose another unique name or connect to the existing repository using the previous section.
- **Pages API returns `404`:** verify the owner/repository name and that the first push completed.
- **Pages API returns `403`:** the authenticated user probably lacks admin/Pages settings permission or an organization policy blocks Pages.
- **Pages API returns `409`:** use the `PUT` update command in step 6.
- **Blank page or missing styles after deployment:** make sure the site is opened at the exact URL returned by the Pages API and that all project asset references remain relative (`./...`). Do not change the project links to root-absolute `/css/...` paths for a project site.
- **PWA install or notifications unavailable:** use HTTPS GitHub Pages, a supported browser, and explicitly grant notification permission. Local notifications remain subject to browser/OS background restrictions.

## Data and privacy checklist before publishing

- [ ] No source Excel timetable is inside the repository.
- [ ] No JSON backup or exported `.ics` file is inside the repository.
- [ ] No API tokens, passwords, private keys, or account credentials are committed.
- [ ] The default teacher name/ID in `js/core/config.js` are appropriate for public source, or have been changed.
- [ ] Only the application source code and public documentation are pushed.
- [ ] The user understands that the GitHub Pages website is publicly reachable.

## Project structure

```text
KKA-Teacher-Schedule/
├── index.html
├── manifest.webmanifest
├── sw.js
├── offline.html
├── README.md
├── .nojekyll
├── .gitignore
├── assets/
│   └── icons/
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── typography.css
│   ├── layout.css
│   ├── components.css
│   ├── dashboard.css
│   ├── calendar.css
│   ├── schedule.css
│   ├── responsive.css
│   └── print.css
└── js/
    ├── app.js
    ├── core/
    ├── components/
    ├── database/
    ├── modules/
    └── utils/
```

## Known limitations

- There is no backend, account login, or automatic database synchronization.
- Device notifications are best effort while the app is active; no closed-browser guarantee is possible without a push server or calendar-provider scheduling.
- The `.ics` export is a static snapshot, not a live subscribed calendar.
- Excel import requires the SheetJS script. If it cannot be loaded, the app shows an error rather than pretending the workbook was imported.
- Browser storage can be cleared by the user or browser. Keep periodic JSON backups.


## v1.1.0 interface features
- **Daily JP-1 verification:** on Mondays, Wednesdays, and Fridays, confirm Upacara, GSS, Pramuka, Literasi, or no special activity. The result is stored locally for that date. It does not automatically shift classes; only verified official alternative schedules or manual edits should change lesson times.
- **Theme:** defaults to the device/browser color scheme. Use the sun/moon button to switch manually between light and dark.
- **Language:** use the ID/EN selector in the top bar.
- **Sidebar:** use the collapse button on desktop; the preference is stored locally.

## Daily JP-1 verification details
The banner appears on Monday, Wednesday, and Friday based on Asia/Jakarta date. Select one of: no special activity, Upacara, GSS, Pramuka, or Literasi. Records are stored per date in local browser storage and included in JSON backup. The verification does not automatically shift, cancel, or rewrite lesson events; confirm the official alternative timetable before making schedule edits.

## Theme and language
First launch follows `prefers-color-scheme` (system light/dark). The theme button switches between explicit light and dark modes. The ID/EN selector stores the language locally. Sidebar collapse is a desktop preference and is also stored locally.


## v1.5.0 UI and translation update

- Light/dark mode now uses a consolidated token layer across navigation, all card/panel families, verification dialogs, dropdown/select controls, form fields, tables, calendar/week views, alerts, badges, and toast portals.
- System theme is resolved before first paint and the browser theme-color metadata follows it. Native date/time controls use the active color scheme.
- The Indonesian/English dictionary covers additional navigation, validation, import/export, storage, notification, theme, backup, and dynamic status messages.
- Added reciprocal translation tests for common labels and messages, including weekday names and dynamic counts.
- Personal names, class identities, and user notes remain unmodified.

## v1.6.0 — UI comfort scale
The v1.6.0 update improves readability and touch comfort across desktop, tablet, and mobile. It increases typography, spacing, navigation, cards, dashboard statistics, buttons, form controls, tables, calendar cells, modal dialogs, and notifications. The responsive layout remains fluid, and the final `css/ui-scale.css` layer works with both light and dark themes.

## Performance architecture (v1.8.0)
- Dashboard is rendered while local IndexedDB data is fetched in parallel.
- Schedule, weekly, calendar, reminders, import, history, and settings modules use route-level dynamic imports.
- SheetJS is downloaded only when the Excel import module actually reads a workbook.
- CSS is requested through one ordered bundle (`css/app.css`); individual stylesheets remain in `css/` as maintainable source files.
- Service Worker installation caches only the critical shell. Other same-origin feature modules are cached after first use.
- Offline availability of a page requires that page's module to have been opened at least once while online.

### Rebuilding the CSS bundle after editing styles
The application loads `css/app.css` as a single stylesheet to reduce requests. The original modular CSS files remain the editable sources. After changing any file in `css/`, run `node scripts/build-css.mjs` from the project root before committing. Node.js is used only for this optional local build step; the deployed application has no Node.js runtime or backend.
