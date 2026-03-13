const { test, expect } = require("@playwright/test");
const { closePencil, createNewDocument, launchPencil, suppressAppDialogs } = require("./helpers/pencil");

test("loads dynamic React UI pane from generated manifest", async () => {
    const { electronApp, page } = await launchPencil();

    try {
        await suppressAppDialogs(page);

        const data = await page.evaluate(() => {
            const pane = Pencil.controller.applicationPane.reactComponentPane;
            const defs = pane && pane.shapeList ? Array.from(pane.shapeList.childNodes) : [];
            const firstDef = defs[0] && defs[0]._def ? defs[0]._def : null;
            return {
                title: pane ? pane.getTitle() : null,
                count: defs.length,
                firstName: firstDef ? firstDef.name : null,
                hasSVG: !!(firstDef && firstDef.svg && firstDef.svg.indexOf("<svg") >= 0)
            };
        });

        expect(data.title).toBe("React UI");
        expect(data.count).toBeGreaterThan(10);
        expect(data.firstName).toBeTruthy();
        expect(data.hasSVG).toBe(true);
    } finally {
        await closePencil(electronApp, page);
    }
});

test("inserts a React UI generated SVG into canvas", async () => {
    const { electronApp, page } = await launchPencil();

    try {
        await suppressAppDialogs(page);
        await createNewDocument(page);

        const result = await page.evaluate(() => {
            const pane = Pencil.controller.applicationPane.reactComponentPane;
            const defs = pane && pane.shapeList ? Array.from(pane.shapeList.childNodes) : [];
            const firstDef = defs[0] && defs[0]._def ? defs[0]._def : null;
            if (!firstDef || !firstDef.svg) {
                throw new Error("No React UI shape available");
            }

            const before = Array.from(Pencil.activeCanvas.drawingLayer.childNodes).filter(function (node) {
                return node.getAttributeNS && node.getAttributeNS(PencilNamespaces.p, "type") === "Shape";
            }).length;

            FileDragObserver.handleSVGData(firstDef.svg, Pencil.activeCanvas, { x: 260, y: 180 });

            const after = Array.from(Pencil.activeCanvas.drawingLayer.childNodes).filter(function (node) {
                return node.getAttributeNS && node.getAttributeNS(PencilNamespaces.p, "type") === "Shape";
            }).length;

            return { before, after };
        });

        expect(result.after).toBeGreaterThan(result.before);
    } finally {
        await closePencil(electronApp, page);
    }
});

test("refresh command rebuilds and reloads curated React components", async () => {
    const { electronApp, page } = await launchPencil();

    try {
        await suppressAppDialogs(page);

        const result = await page.evaluate(() => {
            var pane = Pencil.controller.applicationPane.reactComponentPane;
            var before = pane.shapeList.childNodes.length;

            UICommandManager.getCommand("refreshReactUIComponentsCommand").run();

            var after = pane.shapeList.childNodes.length;
            var names = Array.from(pane.shapeList.childNodes).slice(0, 8).map(function (node) {
                return node._def && node._def.name;
            });

            return {before, after, names};
        });

        expect(result.before).toBeGreaterThan(10);
        expect(result.after).toBeGreaterThan(10);
        expect(result.names.includes("Accordion")).toBe(true);
        expect(result.names.includes("AccordionItem")).toBe(false);
    } finally {
        await closePencil(electronApp, page);
    }
});
