# Electron Packaging & Rebuild Strategy

## Current Tools

| Tool | Purpose | Status |
|------|---------|--------|
| electron-builder | Packaging app into distributables | Active (14k stars) |
| electron-rebuild | Rebuild native modules for Electron | Deprecated → use @electron/rebuild |

## Alternatives

### 1. electron-forge (Official Recommendation)
- **Status**: Officially "blessed" by Electron team
- **Pros**:
  - Active development
  - Plugin-centric (more flexible)
  - Better macOS code signing support
  - Built-in templates
- **Cons**:
  - Less stars than electron-builder (6k vs 14k)
  - Different configuration style
- **Migration**: Would require rewriting build config

### 2. electron-packager + electron-installer-*
- **Status**: Low-level, maintained by Electron team
- **Pros**:
  - Minimal dependencies
  - More control
- **Cons**:
  - Need separate installers (electron-installer-deb, electron-installer-rpm, etc.)
  - More manual work

### 3. Stay with electron-builder
- **Status**: Still active (last update March 2026)
- **Pros**:
  - All-in-one solution
  - More features out of the box
  - Better Linux packaging
- **Cons**:
  - Vulnerabilities in dependencies (tar)
  - Less active than before

## Recommended Strategy

### Option A: Stay with electron-builder (Current)
- Keep electron-builder@26
- Add `@electron/rebuild` to replace `electron-rebuild`
- This removes tar vulnerability chain

### Option B: Migrate to electron-forge
- Full migration effort
- Better long-term support
- Recommended for new projects

## Action Items

To eliminate remaining vulnerabilities:

```bash
# Replace electron-rebuild with @electron/rebuild
yarn remove electron-rebuild
yarn add @electron/rebuild --dev
```

This removes the `node-gyp` → `tar` vulnerability chain.

## For Reference
- electron-builder: https://github.com/electron-userland/electron-builder
- electron-forge: https://github.com/electron-forge/electron-forge
- @electron/rebuild: https://github.com/electron/rebuild
