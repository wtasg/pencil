# Promise to Async/Await Migration

## Current State

| Pattern | Count |
|---------|-------|
| `.then()` | 45 |
| `.catch()` | ~20 |
| `.finally()` | 3 |
| `new Promise()` | 15 |
| `QP.Promise()` | 3 |
| `async/await` | 0 |

## Migration Strategy

### Phase 1: Core/Foundation Layer - IN PROGRESS

Priority: HIGH - These are foundational modules used by many others

| File | Remaining | Status |
|------|-----------|--------|
| collectionManager.js | 0 | ✅ Migrated |
| collectionRepository.js | 0 | ✅ Migrated |
| capture-services.js | 0 | ✅ Migrated |
| EpzHandler.js | 0 | ✅ Migrated |
| EpgzHandler.js | 0 | ✅ Migrated |
| EpHandler.js | 0 | ✅ Migrated |

### Phase 2: UI/Widget Layer - IN PROGRESS

Priority: MEDIUM - These use promises for UI operations

| File | Remaining | Status |
|------|-----------|--------|
| Common.js | 0 | ✅ Migrated |
| CollectionResourceBrowserDialog.js | 0 | ✅ Migrated |
| CollectionRepoBrowserView.js | 0 | ✅ Migrated |
| ExportDialog.js | 0 | ✅ Migrated |

### Phase 3: Editor/Canvas Layer

Priority: MEDIUM - Canvas and editor operations

| File | Remaining | Status |
|------|-----------|--------|
| controller.js | 0 | ✅ Migrated |
| DocumentHandler.js | 0 | ✅ Migrated |
| imageData.js | 0 | ✅ Migrated |
| renderer.js | 0 | ✅ Migrated |

### Phase 4: Utilities/External

Priority: LOW - Helpers and external integrations

| File | Remaining | Status |
|------|-----------|--------|
| FontLoader.js | 0 | ✅ Migrated |
| FontLoaderUtil.js | 0 | ✅ Migrated |
| webPrinter.js | 0 | ✅ Migrated |
| SettingDialog.js | 0 | ✅ Migrated |
| FontDetailDialog.js | 0 | ✅ Migrated |
| color-picker-window.js | 0 | ✅ Migrated |

## Tests Written

### Phase 1 Tests (51 tests passing)

| Test File | Tests | Status |
|-----------|-------|--------|
| tests/collectionManager.test.js | 14 | ✅ Pass |
| tests/capture-services.test.js | 10 | ✅ Pass |
| tests/handlers.test.js | 14 | ✅ Pass |
| tests/q.test.js | 10 | ✅ Pass |
| tests/jimp.test.js | 5 | ✅ Pass |
| tests/config.test.js | 4 | ✅ Pass |
| tests/search.test.js | 4 | ✅ Pass |
| tests/security.test.js | 2 | ✅ Pass |
| **Total** | **51** | ✅ Pass |

## Migration Patterns

### Pattern 1: QP.Promise → async function

```javascript
// Before
return QP.Promise(function(resolve, reject) {
    asyncOperation(function(err, result) {
        if (err) reject(err);
        else resolve(result);
    });
});

// After
async function operation() {
    return await asyncOperation();
}
```

### Pattern 2: .then chain → async/await

```javascript
// Before
func1().then(a => func2(a)).then(b => func3(b));

// After
async function main() {
    const a = await func1();
    const b = await func2(a);
    return await func3(b);
}
```

### Pattern 3: new Promise → async function

```javascript
// Before
return new Promise(function(resolve, reject) {
    fs.readFile(path, function(err, data) {
        if (err) reject(err);
        else resolve(data);
    });
});

// After
async function read() {
    return await fs.promises.readFile(path);
}
```

## Guidelines

1. **Test after each file** - Don't migrate entire phase at once
2. **Keep backward compatible** - Export both sync and async versions if needed
3. **Use try/catch** - Replace .catch() with try/catch blocks
4. **Handle parallel** - Use Promise.all() → await Promise.all()

## Testing

Run tests after each phase:

```bash
yarn test
yarn start
```

## Status

- [x] Phase 1: Tests written
- [x] Phase 1: Migration
  - [x] collectionManager.js
  - [x] collectionRepository.js
  - [x] capture-services.js
  - [x] EpzHandler.js
  - [x] EpgzHandler.js
  - [x] EpHandler.js
- [x] Phase 2: Tests written
  - [x] Common.js
  - [x] CollectionResourceBrowserDialog.js
  - [x] CollectionRepoBrowserView.js
  - [x] ExportDialog.js
- [x] Phase 3: Migration
  - [x] controller.js
  - [x] DocumentHandler.js
  - [x] imageData.js
  - [x] renderer.js
- [x] Phase 4: Migration
  - [x] FontLoader.js
  - [x] FontLoaderUtil.js
  - [x] webPrinter.js
  - [x] SettingDialog.js
  - [x] FontDetailDialog.js
  - [x] color-picker-window.js
