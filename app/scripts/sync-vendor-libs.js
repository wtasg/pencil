const fs = require("fs");
const path = require("path");

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

const appRoot = path.resolve(__dirname, "..");
const nodeModules = path.join(appRoot, "node_modules");

const sources = {
    bootstrapLess: path.join(nodeModules, "bootstrap", "less"),
    codemirrorCss: path.join(nodeModules, "codemirror", "lib", "codemirror.css"),
    codemirrorJs: path.join(nodeModules, "codemirror", "lib", "codemirror.js"),
    codemirrorHtmlMixed: path.join(nodeModules, "codemirror", "mode", "htmlmixed", "htmlmixed.js"),
    codemirrorJavascript: path.join(nodeModules, "codemirror", "mode", "javascript", "javascript.js"),
    codemirrorXml: path.join(nodeModules, "codemirror", "mode", "xml", "xml.js"),
    faLess: path.join(nodeModules, "font-awesome", "less"),
    faFonts: path.join(nodeModules, "font-awesome", "fonts")
};

for (const [name, src] of Object.entries(sources)) {
    if (!exists(src)) {
        throw new Error(`Missing source for ${name}: ${src}. Run npm install in app/ first.`);
    }
}

const targets = {
    bootstrapLess: path.join(appRoot, "lib", "bootstrap"),
    codemirrorCss: path.join(appRoot, "lib", "codemirror", "codemirror.css"),
    codemirrorJs: path.join(appRoot, "lib", "codemirror", "codemirror.js"),
    codemirrorHtmlMixed: path.join(appRoot, "lib", "codemirror", "htmlmixed.js"),
    codemirrorJavascript: path.join(appRoot, "lib", "codemirror", "javascript.js"),
    codemirrorXml: path.join(appRoot, "lib", "codemirror", "xml.js"),
    faLess: path.join(appRoot, "lib", "font-awesome-4.4.0", "less"),
    faFonts: path.join(appRoot, "lib", "font-awesome-4.4.0", "fonts")
};

copyDir(sources.bootstrapLess, targets.bootstrapLess);
copyFile(sources.codemirrorCss, targets.codemirrorCss);
copyFile(sources.codemirrorJs, targets.codemirrorJs);
copyFile(sources.codemirrorHtmlMixed, targets.codemirrorHtmlMixed);
copyFile(sources.codemirrorJavascript, targets.codemirrorJavascript);
copyFile(sources.codemirrorXml, targets.codemirrorXml);
copyDir(sources.faLess, targets.faLess);
copyDir(sources.faFonts, targets.faFonts);

console.log("Synced vendor libraries from node_modules to app/lib:");
console.log(`- bootstrap less -> ${path.relative(appRoot, targets.bootstrapLess)}`);
console.log(`- codemirror css -> ${path.relative(appRoot, targets.codemirrorCss)}`);
console.log(`- codemirror js -> ${path.relative(appRoot, targets.codemirrorJs)}`);
console.log(`- codemirror htmlmixed mode -> ${path.relative(appRoot, targets.codemirrorHtmlMixed)}`);
console.log(`- codemirror javascript mode -> ${path.relative(appRoot, targets.codemirrorJavascript)}`);
console.log(`- codemirror xml mode -> ${path.relative(appRoot, targets.codemirrorXml)}`);
console.log(`- font-awesome less -> ${path.relative(appRoot, targets.faLess)}`);
console.log(`- font-awesome fonts -> ${path.relative(appRoot, targets.faFonts)}`);
