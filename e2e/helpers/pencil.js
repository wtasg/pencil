const fs = require("fs");
const os = require("os");
const path = require("path");
const { expect } = require("@playwright/test");
const { _electron: electron } = require("playwright");

async function launchPencil() {
    const repoRoot = path.resolve(__dirname, "..", "..");
    const appEntry = path.join(repoRoot, "app");
    const electronApp = await electron.launch({
        cwd: repoRoot,
        args: [appEntry, "--no-sandbox"]
    });
    const page = await electronApp.firstWindow();

    await waitForReady(page);

    return { electronApp, page, repoRoot };
}

async function closePencil(electronApp, page) {
    if (page && !page.isClosed()) {
        try {
            await page.evaluate(() => {
                if (window.Pencil && Pencil.controller) {
                    Pencil.controller.modified = false;
                }
            });
        } catch (error) {
        }
    }

    try {
        await electronApp.evaluate(({ app }) => {
            app.exit(0);
        });
    } catch (error) {
    }
}

async function waitForReady(page) {
    await expect(page).toHaveTitle(/Pencil/i);
    await page.waitForSelector("#appView", { state: "attached" });

    await expect
        .poll(async () => page.evaluate(() => document.body.hasAttribute("loaded")), {
            timeout: 30_000
        })
        .toBe(true);

    await expect
        .poll(
            async () =>
                page.evaluate(
                    () => Object.keys(CollectionManager.shapeDefinition.shapeDefMap || {}).length
                ),
            { timeout: 30_000 }
        )
        .toBeGreaterThan(0);
}

async function createNewDocument(page) {
    await page.evaluate(() => UICommandManager.getCommand("newDocumentCommand").run());

    await expect
        .poll(async () => page.evaluate(() => !!Pencil.controller.activePage), {
            timeout: 30_000
        })
        .toBe(true);

    await expect
        .poll(async () => page.evaluate(() => Pencil.controller.doc.pages.length), {
            timeout: 30_000
        })
        .toBe(1);
}

async function insertTaggedShape(page, tag, point) {
    return page.evaluate(({ tag, point }) => {
        var defs = Object.values(CollectionManager.shapeDefinition.shapeDefMap || {});
        var def = defs.find(function (item) {
            return item && item.id && item.displayName && item.contentNode;
        });

        if (!def) {
            throw new Error("No usable shape definition found");
        }

        Pencil.activeCanvas.insertShape(def, point || { x: 120, y: 120 });

        var shapes = Array.from(Pencil.activeCanvas.drawingLayer.childNodes).filter(function (node) {
            return node.getAttributeNS && node.getAttributeNS(PencilNamespaces.p, "type") === "Shape";
        });
        var shape = shapes[shapes.length - 1];
        shape.setAttribute("data-e2e-shape", tag);

        return {
            defId: def.id,
            totalShapes: shapes.length,
            selected: Pencil.activeCanvas.getSelectedTargets().length
        };
    }, { tag, point: point || { x: 120, y: 120 } });
}

async function getShapeCount(page) {
    return page.evaluate(() => {
        return Array.from(Pencil.activeCanvas.drawingLayer.childNodes).filter(function (node) {
            return node.getAttributeNS && node.getAttributeNS(PencilNamespaces.p, "type") === "Shape";
        }).length;
    });
}

async function getSelectedCount(page) {
    return page.evaluate(() => Pencil.activeCanvas.getSelectedTargets().length);
}

async function getShapeBox(page, tag) {
    return page.evaluate((tag) => {
        var shape = document.querySelector('[data-e2e-shape="' + tag + '"]');
        if (!shape) return null;
        // getBoundingClientRect accounts for SVG transform matrices applied by moveBy
        var box = shape.getBoundingClientRect();
        return { x: box.x, y: box.y, width: box.width, height: box.height };
    }, tag);
}

async function stubDialogs(page, paths) {
    await page.evaluate((paths) => {
        var dialog = require("@electron/remote").dialog;

        dialog.showSaveDialog = async function () {
            return { filePath: paths.savePath, canceled: false };
        };
        dialog.showOpenDialog = async function () {
            return { filePaths: [paths.openPath || paths.savePath], canceled: false };
        };
    }, paths);
}

// Suppress all in-app Dialog modals (Dialog.confirm, Dialog.alert, Dialog.error).
// confirm → auto-calls the last action ("Discard changes" / safest no-save path).
// alert / error → auto-closes immediately.
async function suppressAppDialogs(page) {
    await page.evaluate(() => {
        Dialog.alert = function (message, extra, onClose) {
            if (onClose) try { onClose(); } catch (_) {}
        };
        Dialog.error = function (message, extra, onClose) {
            if (onClose) try { onClose(); } catch (_) {}
        };
        // Signature: question, extra, posTitle, onPos, negTitle, onNeg, extraTitle, onExtra
        // We always prefer the last "discard/cancel" path so tests don't accidentally save state.
        Dialog.confirm = function (question, extra, posTitle, onPos, negTitle, onNeg, extraTitle, onExtra) {
            if (typeof onExtra === "function") {
                try { onExtra(); } catch (_) {}
            } else if (typeof onNeg === "function") {
                try { onNeg(); } catch (_) {}
            }
        };
    });
}

function makeTempDocumentPath(name) {
    var tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pencil-e2e-"));
    return path.join(tempDir, name || "test-document.epgz");
}

module.exports = {
    closePencil,
    createNewDocument,
    getSelectedCount,
    getShapeBox,
    getShapeCount,
    insertTaggedShape,
    launchPencil,
    makeTempDocumentPath,
    stubDialogs,
    suppressAppDialogs,
    waitForReady
};
