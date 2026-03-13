const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function copyDir(src, dest) {
    ensureDir(dest);
    fs.cpSync(src, dest, { recursive: true, force: true });
}

function copyFile(src, dest) {
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
}

function exists(p) {
    return fs.existsSync(p);
}

function packageVersion(packageName) {
    const packageJsonPath = path.join(nodeModules, packageName, "package.json");
    return JSON.parse(fs.readFileSync(packageJsonPath, "utf8")).version;
}

function sha256(filePath) {
    const hash = crypto.createHash("sha256");
    hash.update(fs.readFileSync(filePath));
    return hash.digest("hex");
}

function manifestEntry(absPath, packageName) {
    return {
        path: path.relative(appRoot, absPath).replace(/\\/g, "/"),
        package: packageName,
        sha256: sha256(absPath)
    };
}

const appRoot = path.resolve(__dirname, "..");
const nodeModules = path.join(appRoot, "node_modules");

const sources = {
    bootstrapCss: path.join(nodeModules, "bootstrap", "dist", "css", "bootstrap.min.css"),
    codemirrorCss: path.join(nodeModules, "codemirror", "lib", "codemirror.css"),
    codemirrorJs: path.join(nodeModules, "codemirror", "lib", "codemirror.js"),
    codemirrorHtmlMixed: path.join(nodeModules, "codemirror", "mode", "htmlmixed", "htmlmixed.js"),
    codemirrorJavascript: path.join(nodeModules, "codemirror", "mode", "javascript", "javascript.js"),
    codemirrorXml: path.join(nodeModules, "codemirror", "mode", "xml", "xml.js"),
    faCss: path.join(nodeModules, "font-awesome", "css", "font-awesome.min.css"),
    faLess: path.join(nodeModules, "font-awesome", "less"),
    faFonts: path.join(nodeModules, "font-awesome", "fonts"),
    mdiCss: path.join(nodeModules, "@mdi", "font", "css", "materialdesignicons.min.css"),
    mdiFonts: path.join(nodeModules, "@mdi", "font", "fonts")
};

for (const [name, src] of Object.entries(sources)) {
    if (!exists(src)) {
        throw new Error(`Missing source for ${name}: ${src}. Run npm install in app/ first.`);
    }
}

const targets = {
    bootstrapRoot: path.join(appRoot, "lib", "bootstrap"),
    bootstrapCss: path.join(appRoot, "lib", "bootstrap", "bootstrap.min.css"),
    codemirrorCss: path.join(appRoot, "lib", "codemirror", "codemirror.css"),
    codemirrorJs: path.join(appRoot, "lib", "codemirror", "codemirror.js"),
    codemirrorHtmlMixed: path.join(appRoot, "lib", "codemirror", "htmlmixed.js"),
    codemirrorJavascript: path.join(appRoot, "lib", "codemirror", "javascript.js"),
    codemirrorXml: path.join(appRoot, "lib", "codemirror", "xml.js"),
    faCss: path.join(appRoot, "lib", "font-awesome-4.4.0", "css", "font-awesome.min.css"),
    faLess: path.join(appRoot, "lib", "font-awesome-4.4.0", "less"),
    faFonts: path.join(appRoot, "lib", "font-awesome-4.4.0", "fonts"),
    mdiCss: path.join(appRoot, "lib", "mdi", "css", "materialdesignicons.min.css"),
    mdiFonts: path.join(appRoot, "lib", "mdi", "fonts")
};

fs.rmSync(targets.bootstrapRoot, { recursive: true, force: true });
copyFile(sources.bootstrapCss, targets.bootstrapCss);
copyFile(sources.codemirrorCss, targets.codemirrorCss);
copyFile(sources.codemirrorJs, targets.codemirrorJs);
copyFile(sources.codemirrorHtmlMixed, targets.codemirrorHtmlMixed);
copyFile(sources.codemirrorJavascript, targets.codemirrorJavascript);
copyFile(sources.codemirrorXml, targets.codemirrorXml);
copyFile(sources.faCss, targets.faCss);
copyDir(sources.faLess, targets.faLess);
copyDir(sources.faFonts, targets.faFonts);
copyFile(sources.mdiCss, targets.mdiCss);
copyDir(sources.mdiFonts, targets.mdiFonts);

const manifest = {
    packages: {
        bootstrap: { version: packageVersion("bootstrap") },
        codemirror: { version: packageVersion("codemirror") },
        "font-awesome": { version: packageVersion("font-awesome") },
        "@mdi/font": { version: packageVersion(path.join("@mdi", "font")) }
    },
    files: [
        manifestEntry(targets.bootstrapCss, "bootstrap"),
        manifestEntry(targets.codemirrorCss, "codemirror"),
        manifestEntry(targets.codemirrorJs, "codemirror"),
        manifestEntry(targets.codemirrorHtmlMixed, "codemirror"),
        manifestEntry(targets.codemirrorJavascript, "codemirror"),
        manifestEntry(targets.codemirrorXml, "codemirror"),
        manifestEntry(targets.faCss, "font-awesome"),
        manifestEntry(targets.mdiCss, "@mdi/font"),
        manifestEntry(path.join(targets.mdiFonts, "materialdesignicons-webfont.eot"), "@mdi/font"),
        manifestEntry(path.join(targets.mdiFonts, "materialdesignicons-webfont.ttf"), "@mdi/font"),
        manifestEntry(path.join(targets.mdiFonts, "materialdesignicons-webfont.woff"), "@mdi/font"),
        manifestEntry(path.join(targets.mdiFonts, "materialdesignicons-webfont.woff2"), "@mdi/font")
    ].sort((left, right) => left.path.localeCompare(right.path))
};

const vendorManifestPath = path.join(appRoot, "lib", "vendor-manifest.json");
fs.writeFileSync(vendorManifestPath, JSON.stringify(manifest, null, 2) + "\n");

console.log("Synced vendor libraries from node_modules to app/lib:");
console.log(`- bootstrap css -> ${path.relative(appRoot, targets.bootstrapCss)}`);
console.log(`- codemirror css -> ${path.relative(appRoot, targets.codemirrorCss)}`);
console.log(`- codemirror js -> ${path.relative(appRoot, targets.codemirrorJs)}`);
console.log(`- codemirror htmlmixed mode -> ${path.relative(appRoot, targets.codemirrorHtmlMixed)}`);
console.log(`- codemirror javascript mode -> ${path.relative(appRoot, targets.codemirrorJavascript)}`);
console.log(`- codemirror xml mode -> ${path.relative(appRoot, targets.codemirrorXml)}`);
console.log(`- font-awesome css -> ${path.relative(appRoot, targets.faCss)}`);
console.log(`- font-awesome less -> ${path.relative(appRoot, targets.faLess)}`);
console.log(`- font-awesome fonts -> ${path.relative(appRoot, targets.faFonts)}`);
console.log(`- mdi css -> ${path.relative(appRoot, targets.mdiCss)}`);
console.log(`- mdi fonts -> ${path.relative(appRoot, targets.mdiFonts)}`);
console.log(`- vendor manifest -> ${path.relative(appRoot, vendorManifestPath)}`);
