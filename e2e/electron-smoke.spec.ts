import { test } from '@playwright/test';
import { closePencil, launchPencil } from './helpers/pencil';

test("launches Pencil main window", async () => {
    const { electronApp } = await launchPencil();

    try {
    } finally {
        await closePencil(electronApp, undefined);
    }
});
