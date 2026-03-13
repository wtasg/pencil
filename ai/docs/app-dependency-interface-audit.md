# App Dependency Upgrade Audit

## Scope

- File: app/package.json
- Goal: upgrade remaining outdated dependencies, verify usage, note interfaces, add shims if needed.

## Upgraded Dependencies

- adm-zip: `^0.4.16` -> `^0.5.16`
- archiver: `^3.1.1` -> `^7.0.1`
- electron-log: `^2.2.17` -> `^5.4.3`
- less: `~3.8.1` -> `~4.6.3`
- tmp: `0.0.33` -> `^0.2.5`
- electron (devDependency): `^35.7.5` -> `^41.0.2`

## Usage Map and Interfaces

### @electron/remote

- Used in:
  - app/tools/capture-services.js
  - app/tools/screenshot-renderer.js
  - app/pencil-core/common/util.js
  - app/pencil-core/common/pencil.js
- Interface used:
  - `require('@electron/remote').app`
  - `{ app, BrowserWindow }` from `@electron/remote`

### adm-zip

- Used in:
  - app/pencil-core/privateCollection/privateCollectionManager.js
  - app/pencil-core/definition/collectionManager.js
  - app/pencil-core/common/EpzHandler.js
- Interface used:
  - `new admZip(filePath)`
  - `zip.extractAllToAsync(targetDir, overwrite, callback)`

### archiver

- Used in:
  - app/views/tools/StencilGeneratorDialog.js
  - app/pencil-core/privateCollection/privateCollectionManager.js
  - app/pencil-core/common/util.js
- Interface used:
  - `const archive = archiver('zip')`
  - `archive.pipe(output)`
  - `archive.directory(srcDir, '/', {})`
  - `archive.finalize()`

### electron-log

- Used in:
  - app/updater.js
- Interface used:
  - `const log = require('electron-log')`
  - `log.transports.file.level = 'info'`
  - `autoUpdater.logger = log`

### less

- Used in:
  - app/lib/widget/Common.js
- Interface used:
  - `const less = require('less')`
  - (indirect compile/render flow in widget CSS processing)

### lodash

- Used in:
  - app/app.js
- Interface used:
  - module imported as `_`

### md5

- Used in:
  - app/pencil-core/common/controller.js
- Interface used:
  - `md5(id)`

### moment

- Used in:
  - app/app.js
  - app/views/editors/image-editor/ExternalImageEditorDialog.js
  - app/views/StartUpDocumentView.js
  - app/views/tools/StencilCollectionBuilder.js
- Interface used:
  - `moment(stat.mtime).fromNow()`
  - `moment().format('YYYY-MM-DD[T]HH:mm:ss.SSSZZ')`

### nugget

- Used in:
  - app/pencil-core/definition/collectionManager.js
  - app/pencil-core/definition/collectionRepository.js
- Interface used:
  - `nugget(url, options, callback)`
  - callback receives array of `errors`

### perfect-freehand

- Used in:
  - app/app.js
- Interface used:
  - module imported as `freehand`

### tmp

- Used in many app modules.
- Interface used:
  - `tmp.setGracefulCleanup()`
  - `tmp.dirSync({ keep: false, unsafeCleanup: true })`
  - `tmp.fileSync({ postfix, keep })`
  - `tmp.tmpNameSync({ postfix })`
  - `tmp.file({ prefix, postfix }, callback)`

### electron

- Used broadly in app runtime.
- Interface used includes:
  - `app`, `protocol`, `shell`, `BrowserWindow`, `ipcMain`, `ipcRenderer`, `desktopCapturer`, `globalShortcut`

### electron-updater

- Used in:
  - app/updater.js
- Interface used:
  - `{ autoUpdater } = require('electron-updater')`
  - `autoUpdater.signals.updateDownloaded(...)`
  - `autoUpdater.checkForUpdates()`

## Dependencies with No Direct Source Import

- archive-type
- decompress
- decompress-targz
- easy-zip2 (only in commented legacy code)
- @electron/rebuild (dev tool)
- electron-builder (dev tool)

These may still be needed transitively, by packaging workflows, or by commented/legacy paths.

## Shim Assessment

- Existing compatibility shims retained:
  - app/lib/q-shim.js
  - app/lib/jimp-shim.js
- Additional shims needed for this upgrade set: none.

## Verification

- `npm outdated` in app: `{}` (no remaining outdated dependencies)
- Tests: 12 passed, 0 failed.
- App startup: confirmed by user as successful.

---

# Dead Code and Unused Dependency Cleanup

## Date: 2026-03-13

## Methodology

1. Ran a full Python-based source scan (excluding `node_modules`, `archive/`) to find exact `require()` call sites for every package listed in `package.json`.
2. Compared against loaded files referenced from `app.xhtml` and `index.js`.
3. Confirmed dead source files have zero callers across the entire codebase.
4. Wrote `tests/dead-code.test.js` as a regression guard **before** deleting anything — tests were first run while files still existed (expected failures), confirming correct wiring.
5. Deleted files and removed packages; re-ran full suite to confirm green.

## Packages Removed

| Package | Was version | Evidence of no use |
|---|---|---|
| `archive-type` | `^4.0.0` | Zero `require()` in any `.js` file in app source |
| `decompress` | `^4.2.1` | Zero `require()` in any `.js` file in app source |
| `decompress-targz` | `^4.1.1` | Zero `require()`; `EpgzHandler` uses native `tar` CLI via `child_process` |
| `easy-zip2` | `^3.1.0` | Only occurrence was inside a `/* ... */` block comment in `EpzHandler.js`; code was never active |

Removing these 4 packages also eliminated 56 transitive packages from `node_modules`.

## Source Files Deleted

All of the following had zero callers and were not referenced by any script loader or `require()`:

| File | Reason dead |
|---|---|
| `pencil-core/common/controller_old.js` | Never loaded or required anywhere |
| `pencil-core/common/androidSupports.js` | Never loaded or required anywhere |
| `pencil-core/n-patch/9patch_backup.js` | Never loaded or required anywhere |
| `pencil-core/common/nsDragAndDrop.js` | Original Firefox/XUL version; live code uses `nsDragAndDrop2.js` (loaded from `app.xhtml:22`) |
| `pencil-core/common/pdf.js` | Never loaded or required; not the same as the live `jspdf.min.js` |
| `pencil-core/common/colorDroppers.js` | Never loaded or required anywhere |

## Dead Code Removed from Live Files

### `app/pencil-core/common/EpzHandler.js`

Removed the `/* ... */` comment block containing the old `EpzHandler.prototype.saveDocument` implementation that imported `easy-zip2`. The block was already commented out and predates the current `archiver`-based save path.

### `app/pencil-core/common/util.js`

Removed `Util.writeDirToZip`. This function used `Components.interfaces.nsIZipWriter` — a Firefox/XUL-only API unavailable in Electron. It was self-recursive with no external callers.

## app/archive/ Directory

The entire `app/archive/` directory contains the original Firefox XUL extension source (~40 files). Confirmed: no live app source file references it. **Not deleted automatically** — left for a deliberate `git rm -r app/archive/` if desired, as it represents a larger historical change.

## Regression Guard Test

Added `tests/dead-code.test.js` which asserts:

- Each removed package is not `require()`-d in app source.
- Each deleted file does not exist on disk.
- No live app source file references the `archive/` directory.

## Verification

- Node modules removed: 56 packages uninstalled
- Tests: **13 suites, 100 tests, all passing** (up from 12 suites / 89 tests before this session)
