const fs = require("fs");
const { test, expect } = require("@playwright/test");
const {
    closePencil,
    createNewDocument,
    getSelectedCount,
    getShapeBox,
    getShapeCount,
    insertTaggedShape,
    launchPencil,
    makeTempDocumentPath,
    stubDialogs,
    suppressAppDialogs
} = require("./helpers/pencil");

test("creates a new document and initial page", async () => {
    const { electronApp, page } = await launchPencil();

    try {
        await suppressAppDialogs(page);
        await createNewDocument(page);

        await expect
            .poll(async () => page.evaluate(() => Pencil.controller.doc.pages[0].name), {
                timeout: 15_000
            })
            .toMatch(/Untitled Page/i);
    } finally {
        await closePencil(electronApp, page);
    }
});

test("supports selection and copy paste on the canvas", async () => {
    const { electronApp, page } = await launchPencil();

    try {
        await suppressAppDialogs(page);
        await createNewDocument(page);
        await insertTaggedShape(page, "shape-a", { x: 120, y: 120 });
        await insertTaggedShape(page, "shape-b", { x: 240, y: 240 });

        await expect.poll(async () => getShapeCount(page), { timeout: 15_000 }).toBe(2);

        await page.evaluate(() => {
            Pencil.activeCanvas.selectAll();
            Pencil.activeCanvas.doCopy();
            Pencil.activeCanvas.doPaste();
        });

        await expect.poll(async () => getSelectedCount(page), { timeout: 15_000 }).toBe(2);
        await expect.poll(async () => getShapeCount(page), { timeout: 15_000 }).toBe(4);
    } finally {
        await closePencil(electronApp, page);
    }
});

test("supports moving a shape on the canvas", async () => {
    const { electronApp, page } = await launchPencil();

    try {
        await suppressAppDialogs(page);
        await createNewDocument(page);
        await insertTaggedShape(page, "drag-shape", { x: 160, y: 160 });

        const before = await getShapeBox(page, "drag-shape");
        await page.evaluate(() => {
            const shape = document.querySelector('[data-e2e-shape="drag-shape"]');
            const box = shape.getBBox();
            const canvas = Pencil.activeCanvas;
            const event = {
                clientX: box.x + box.width / 2,
                clientY: box.y + box.height / 2,
                originalTarget: shape
            };

            canvas.selectShape(shape);
            canvas.startFakeMove(event);
            canvas.currentController.moveBy(80, 50, false, true);
            canvas.finishMoving(event);
        });

        await expect
            .poll(async () => {
                const after = await getShapeBox(page, "drag-shape");
                return after ? { dx: after.x - before.x, dy: after.y - before.y } : null;
            }, { timeout: 15_000 })
            .toMatchObject({ dx: expect.any(Number), dy: expect.any(Number) });

        const after = await getShapeBox(page, "drag-shape");
        expect(Math.abs(after.x - before.x) + Math.abs(after.y - before.y)).toBeGreaterThan(10);
    } finally {
        await closePencil(electronApp, page);
    }
});

test("saves and reloads a document through Electron dialogs", async () => {
    const { electronApp, page } = await launchPencil();
    const savePath = makeTempDocumentPath("save-load.e2e.epgz");

    try {
        await suppressAppDialogs(page);
        await stubDialogs(page, { savePath, openPath: savePath });
        await createNewDocument(page);
        await insertTaggedShape(page, "saved-shape", { x: 180, y: 180 });

        await page.evaluate(() => UICommandManager.getCommand("saveDocumentCommand").run());

        await expect
            .poll(() => fs.existsSync(savePath), { timeout: 30_000 })
            .toBe(true);

        await expect
            .poll(async () => page.evaluate(() => Pencil.controller.documentPath), {
                timeout: 30_000
            })
            .toBe(savePath);

        await page.evaluate(() => UICommandManager.getCommand("newDocumentCommand").run());
        await expect.poll(async () => getShapeCount(page), { timeout: 15_000 }).toBe(0);

        await page.evaluate(() => UICommandManager.getCommand("openDocumentCommand").run());

        await expect
            .poll(async () => page.evaluate(() => Pencil.controller.documentPath), {
                timeout: 30_000
            })
            .toBe(savePath);
        await expect.poll(async () => getShapeCount(page), { timeout: 30_000 }).toBe(1);
    } finally {
        await closePencil(electronApp, page);
    }
});
