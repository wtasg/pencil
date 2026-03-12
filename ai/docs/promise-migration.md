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

### Phase 1: Core/Foundation Layer (High Impact) - IN PROGRESS
Priority: HIGH - These are foundational modules used by many others

1. **collectionManager.js** (QP.Promise x2)
2. **collectionRepository.js** (QP.Promise x1)
3. **capture-services.js** (new Promise x2)
4. **EpzHandler.js**, **EpgzHandler.js**, **EpHandler.js**

### Phase 2: UI/Widget Layer - IN PROGRESS
Priority: MEDIUM - These use promises for UI operations

1. **Common.js** (new Promise x1, .then x2)
2. **CollectionResourceBrowserDialog.js** (new Promise x1, .then x1)
3. **CollectionRepoBrowserView.js** (.then, .catch, .finally)
4. **ExportDialog.js** (.then x2)

### Phase 3: Editor/Canvas Layer
Priority: MEDIUM - Canvas and editor operations

1. **controller.js** (.then x3)
2. **DocumentHandler.js** (.then x4)
3. **imageData.js** (.then x2)
4. **renderer.js** (.then, .catch)

### Phase 4: Utilities/External
Priority: LOW - Helpers and external integrations

1. **FontLoader.js**, **FontLoaderUtil.js**
2. **webPrinter.js**
3. **SettingDialog.js**, **FontDetailDialog.js**
4. **color-picker-window.js**

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
- [x] Phase 1: Migration in progress
  - [x] collectionManager.js (QP.Promise x2 → async/await)
  - [x] collectionRepository.js (QP.Promise x1 → async/await)
  - [x] capture-services.js (BaseCmdCaptureService.prototype.capture - simple pattern)
  - [ ] capture-services.js (ElectronScreenshotService.prototype.capture - complex, skip for now)
  - [ ] EpzHandler.js, EpgzHandler.js, EpHandler.js (complex patterns)
- [ ] Phase 2: Tests pending
- [ ] Phase 2: Migration pending
- [ ] Phase 3: Tests pending
- [ ] Phase 3: Migration pending
- [ ] Phase 4: Tests pending
- [ ] Phase 4: Migration pending
