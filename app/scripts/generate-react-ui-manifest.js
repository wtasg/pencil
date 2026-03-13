const fs = require("fs");
const path = require("path");

const DEFAULT_WIDTH = 280;
const DEFAULT_HEIGHT = 160;

function isLikelyComponentExport(name, value) {
    if (!name || (!value && value !== 0)) return false;
    if (!/^[A-Z]/.test(name)) return false;

    const type = typeof value;
    const isFunctionComponent = type === "function";
    const isReactObjectComponent =
        type === "object" && value.$$typeof && String(value.$$typeof).indexOf("react.") >= 0;
    if (!isFunctionComponent && !isReactObjectComponent) return false;

    if (/^(use|cn$)/.test(name)) return false;
    if (/variants?/i.test(name)) return false;
    if (/Style$/.test(name)) return false;

    return true;
}

function createComponentManifestEntries(uiExports) {
    const entries = [];

    Object.keys(uiExports)
        .sort()
        .forEach((name) => {
            const value = uiExports[name];
            if (!isLikelyComponentExport(name, value)) return;

            entries.push({
                id: `wtasnorg.ui.${name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}`,
                name,
                componentName: name,
                width: DEFAULT_WIDTH,
                height: DEFAULT_HEIGHT,
                props: {},
                children: name
            });
        });

    return entries;
}

function buildManifest(uiExports) {
    const generatedAt = new Date().toISOString();
    const components = createComponentManifestEntries(uiExports);

    return {
        packageName: "@wtasnorg/ui",
        generatedAt,
        componentCount: components.length,
        components
    };
}

function writeManifest(manifest, outputPath) {
    const json = JSON.stringify(manifest, null, 2) + "\n";
    fs.writeFileSync(outputPath, json, "utf8");
}

function generate(outputPath) {
    const uiExports = require("@wtasnorg/ui");
    const manifest = buildManifest(uiExports);

    writeManifest(manifest, outputPath);

    return manifest;
}

if (require.main === module) {
    const outputPath = path.resolve(__dirname, "..", "pencil-core", "common", "react-ui-manifest.json");

    try {
        const manifest = generate(outputPath);
        console.log(
            `Generated React UI manifest with ${manifest.componentCount} components at ${outputPath}`
        );
    } catch (error) {
        console.error("Failed to generate React UI manifest:", error && error.message ? error.message : error);
        process.exit(1);
    }
}

module.exports = {
    buildManifest,
    createComponentManifestEntries,
    generate,
    isLikelyComponentExport,
    writeManifest
};
