const { test } = require("@playwright/test");
const { closePencil, launchPencil } = require("./helpers/pencil");

test("launches Pencil main window", async () => {
    const { electronApp } = await launchPencil();

    try {
    } finally {
        await closePencil(electronApp);
    }
});
