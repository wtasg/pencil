const {
    buildManifest,
    createComponentManifestEntries,
    isLikelyComponentExport
} = require("../app/scripts/generate-react-ui-manifest");

describe("React UI manifest generation", () => {
    test("detects function and forwardRef-like component exports", () => {
        const forwardRefLike = { $$typeof: Symbol.for("react.forward_ref") };
        const plainObject = { a: 1 };

        expect(isLikelyComponentExport("Button", () => null)).toBe(true);
        expect(isLikelyComponentExport("Card", forwardRefLike)).toBe(true);

        expect(isLikelyComponentExport("button", () => null)).toBe(false);
        expect(isLikelyComponentExport("useDisclosure", () => null)).toBe(false);
        expect(isLikelyComponentExport("buttonVariants", () => null)).toBe(false);
        expect(isLikelyComponentExport("Avatar", plainObject)).toBe(false);
    });

    test("builds stable component entries from exports", () => {
        const exportsMap = {
            Accordion: { $$typeof: Symbol.for("react.forward_ref") },
            Button: { $$typeof: Symbol.for("react.forward_ref") },
            cn: () => "",
            useDisclosure: () => ({})
        };

        const entries = createComponentManifestEntries(exportsMap);

        expect(entries.length).toBe(2);
        expect(entries.map((item) => item.name)).toEqual(["Accordion", "Button"]);
        expect(entries[0]).toMatchObject({
            id: "wtasnorg.ui.accordion",
            componentName: "Accordion",
            width: 280,
            height: 160
        });
        expect(entries[1]).toMatchObject({
            id: "wtasnorg.ui.button",
            componentName: "Button"
        });
    });

    test("buildManifest includes metadata and component count", () => {
        const exportsMap = {
            Badge: { $$typeof: Symbol.for("react.forward_ref") },
            Button: { $$typeof: Symbol.for("react.forward_ref") }
        };

        const manifest = buildManifest(exportsMap);

        expect(manifest.packageName).toBe("@wtasnorg/ui");
        expect(Array.isArray(manifest.components)).toBe(true);
        expect(manifest.componentCount).toBe(2);
        expect(typeof manifest.generatedAt).toBe("string");
        expect(manifest.components.map((item) => item.name)).toEqual(["Badge", "Button"]);
    });
});
