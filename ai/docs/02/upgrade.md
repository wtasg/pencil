# Dependency Upgrade Guide

## Current State (2026-03-12)

### Vulnerabilities Summary
- **42 vulnerabilities** (4 low, 26 moderate, 10 high, 2 critical) → **18 vulnerabilities** (4 low, 5 moderate, 9 high, 0 critical)

### Package Versions (After Upgrades)

| Package | Before | After | Latest |
|---------|--------|-------|--------|
| electron | 16.0.0 | 28.3.3 | 41.0.0 |
| electron-builder | 23.3.3 | 24.13.3 | 26.8.1 |
| electron-rebuild | 1.11.0 | 3.2.9 | deprecated |
| jimp | 1.6.0 | 0.22.12 | latest |
| rimraf | 2.7.1 | 5.0.10 | latest |

## Root Cause Analysis

Most vulnerabilities come from transitive dependencies:
- `electron-builder` depends on vulnerable `tar`, `minimatch`, `builder-util`
- `electron-rebuild` depends on vulnerable `request`, `node-gyp`
- `jimp` 1.x depends on vulnerable `file-type`

## Upgrade Plan

### Phase 1: Quick Fixes (Done)
- [x] Replace deprecated `q` with native Promises (kept - not breaking)
- [x] Update jimp to stable version (0.22.x)
- [x] Upgrade electron-rebuild
- [x] Upgrade rimraf
- [x] Upgrade electron-builder to 24.x
- [x] Upgrade Electron to 28.x (LTS)

### Phase 2: Electron Upgrade (Breaking)
- [ ] Upgrade Electron to 35+ (requires code changes)
- [ ] Add preload script for contextIsolation
- [ ] Replace nodeIntegration with preload

## Breaking Changes to Handle

### Electron 28+ Changes
1. `enableRemoteModule` is deprecated - still works but warns
2. Need preload script for IPC communication (optional for now)

### Electron 35+ Changes
1. `nodeIntegration` removed
2. `enableRemoteModule` removed
3. Must use contextBridge in preload
4. Strict sandbox mode

## Testing
After each upgrade, run:
```bash
npm run start
```

Check for:
- App launches without errors
- Icons load correctly
- DevTools opens with start:dev
- No console errors
