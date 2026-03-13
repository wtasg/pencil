const fs = require("fs");
const os = require("os");
const path = require("path");
const { test, expect } = require("@playwright/test");
const {
    closePencil,
    createNewDocument,
    getShapeCount,
    insertTaggedShape,
    launchPencil,
    suppressAppDialogs
} = require("./helpers/pencil");

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** Make a fresh temp dir for stencil output */
function makeTempStencilDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), "pencil-stencil-e2e-"));
}

/**
 * Inject a no-op Util.beginProgressJob into the renderer so that
 * StencilCollectionBuilder.buildImpl runs synchronously without opening a
 * ProgressiveJobDialog.
 */
async function stubProgressJob(page) {
    await page.evaluate(() => {
        Util.beginProgressJob = function (jobName, starter) {
            starter({
                onProgressUpdated: function () {},
                onTaskDone: function () {}
            });
        };
    });
}

// ---------------------------------------------------------------------------
// tests
// ---------------------------------------------------------------------------

test("configures a document as a stencil collection", async () => {
    const { electronApp, page } = await launchPencil();

    try {
        await suppressAppDialogs(page);
        await createNewDocument(page);

        const result = await page.evaluate(() => {
            var builder = new StencilCollectionBuilder(Pencil.controller);
            var options = builder.makeDefaultOptions();
            options.displayName = "E2E Config Collection";
            options.id = "e2e.configcollection";
            options.author = "e2e-test";
            options.url = "";
            options.description = "Configured by E2E test";

            builder.setCurrentDocumentOptions(options);

            var isConfigured = !!StencilCollectionBuilder.isDocumentConfiguredAsStencilCollection();
            var saved = StencilCollectionBuilder.getCurrentDocumentOptions();

            return {
                isConfigured,
                displayName: saved.displayName,
                id: saved.id,
                author: saved.author
            };
        });

        expect(result.isConfigured).toBe(true);
        expect(result.displayName).toBe("E2E Config Collection");
        expect(result.id).toBe("e2e.configcollection");
        expect(result.author).toBe("e2e-test");
    } finally {
        await closePencil(electronApp, page);
    }
});

test("builds a stencil Definition.xml from a document with shapes", async () => {
    const { electronApp, page } = await launchPencil();
    const outputDir = makeTempStencilDir();

    try {
        await suppressAppDialogs(page);
        await stubProgressJob(page);
        await createNewDocument(page);

        // Add a couple of shapes – each canvas page maps to one stencil shape entry
        await insertTaggedShape(page, "stencil-shape-1", { x: 80, y: 80 });
        await insertTaggedShape(page, "stencil-shape-2", { x: 200, y: 200 });

        await page.evaluate((outputDir) => {
            var builder = new StencilCollectionBuilder(Pencil.controller);
            var options = builder.makeDefaultOptions();
            options.displayName = "E2E Built Collection";
            options.id = "e2e.builtcollection";
            options.author = "e2e-test";
            options.url = "";
            options.description = "Built by E2E test";
            options.outputPath = outputDir;
            options.embedReferencedFonts = false;
            options.resourceSets = [];

            builder.setCurrentDocumentOptions(options);
            builder.buildImpl(options);
        }, outputDir);

        await expect
            .poll(() => fs.existsSync(path.join(outputDir, "Definition.xml")), { timeout: 30_000 })
            .toBe(true);

        const xml = fs.readFileSync(path.join(outputDir, "Definition.xml"), "utf8");
        expect(xml).toContain('id="e2e.builtcollection"');
        expect(xml).toContain('displayName="E2E Built Collection"');
    } finally {
        await closePencil(electronApp, page);
        try { fs.rmSync(outputDir, { recursive: true, force: true }); } catch (_) {}
    }
});

test("loads a stencil collection from disk and exposes its shapes", async () => {
    const { electronApp, page, repoRoot } = await launchPencil();
    const commonStencilDir = path.join(repoRoot, "app", "stencils", "Common");

    try {
        await suppressAppDialogs(page);
        await createNewDocument(page);

        const result = await page.evaluate((stencilDir) => {
            var prevCount = CollectionManager.shapeDefinition.collections.length;

            CollectionManager.loadAdHocCollection(stencilDir);

            var newCount = CollectionManager.shapeDefinition.collections.length;
            var collection = CollectionManager.adHocCollection;

            return {
                prevCount,
                newCount,
                collectionId: collection ? collection.id : null,
                shapeCount: collection ? Object.keys(collection.shapeDefs || {}).length : 0
            };
        }, commonStencilDir);

        expect(result.newCount).toBeGreaterThan(result.prevCount);
        expect(result.collectionId).toBeTruthy();
        expect(result.shapeCount).toBeGreaterThan(0);
    } finally {
        await closePencil(electronApp, page);
    }
});

test("inserts a shape from a loaded stencil collection onto the canvas", async () => {
    const { electronApp, page, repoRoot } = await launchPencil();
    const commonStencilDir = path.join(repoRoot, "app", "stencils", "Common");

    try {
        await suppressAppDialogs(page);
        await createNewDocument(page);

        const before = await getShapeCount(page);

        const result = await page.evaluate((stencilDir) => {
            CollectionManager.loadAdHocCollection(stencilDir);
            var collection = CollectionManager.adHocCollection;
            if (!collection) return { error: "No collection loaded" };

            var shapeKeys = Object.keys(collection.shapeDefs || {});
            if (!shapeKeys.length) return { error: "Collection has no shapes" };

            var def = collection.shapeDefs[shapeKeys[0]];
            if (!def || !def.contentNode) return { error: "Shape def has no content" };

            Pencil.activeCanvas.insertShape(def, { x: 150, y: 150 });

            return { shapeDefId: def.id, shapeDefName: def.displayName };
        }, commonStencilDir);

        expect(result.error).toBeUndefined();

        await expect
            .poll(async () => getShapeCount(page), { timeout: 15_000 })
            .toBe(before + 1);
    } finally {
        await closePencil(electronApp, page);
    }
});

test("removes stencil collection configuration from a document", async () => {
    const { electronApp, page } = await launchPencil();

    try {
        await suppressAppDialogs(page);
        await createNewDocument(page);

        const result = await page.evaluate(() => {
            var builder = new StencilCollectionBuilder(Pencil.controller);
            var options = builder.makeDefaultOptions();
            options.displayName = "Temp Collection";
            options.id = "e2e.temp";
            builder.setCurrentDocumentOptions(options);

            var before = !!StencilCollectionBuilder.isDocumentConfiguredAsStencilCollection();

            // Simulate the "Yes, remove" answer to the confirm dialog
            delete Pencil.controller.doc.properties.stencilBuilderOptions;

            var after = !!StencilCollectionBuilder.isDocumentConfiguredAsStencilCollection();

            return { before, after };
        });

        expect(result.before).toBe(true);
        expect(result.after).toBe(false);
    } finally {
        await closePencil(electronApp, page);
    }
});
