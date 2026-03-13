(function (global) {
    "use strict";

    var statePkg = require("@codemirror/state");
    var viewPkg = require("@codemirror/view");
    var commandsPkg = require("@codemirror/commands");
    var languagePkg = require("@codemirror/language");
    var javascriptPkg = require("@codemirror/lang-javascript");
    var htmlPkg = require("@codemirror/lang-html");
    var xmlPkg = require("@codemirror/lang-xml");

    var EditorState = statePkg.EditorState;
    var EditorSelection = statePkg.EditorSelection;
    var Compartment = statePkg.Compartment;
    var EditorView = viewPkg.EditorView;
    var keymap = viewPkg.keymap;
    var lineNumbers = viewPkg.lineNumbers;
    var drawSelection = viewPkg.drawSelection;
    var history = commandsPkg.history;
    var defaultKeymap = commandsPkg.defaultKeymap;
    var historyKeymap = commandsPkg.historyKeymap;
    var indentWithTab = commandsPkg.indentWithTab;
    var indentUnit = languagePkg.indentUnit;
    var syntaxHighlighting = languagePkg.syntaxHighlighting;
    var defaultHighlightStyle = languagePkg.defaultHighlightStyle;

    var modeFactories = Object.create(null);
    var mimeModes = Object.create(null);

    function repeatSpace(count) {
        var value = "";
        for (var i = 0; i < count; i++) value += " ";
        return value;
    }

    function normalizeModeSpec(spec) {
        if (!spec) return "javascript";
        if (typeof spec == "string") return spec.toLowerCase();
        if (typeof spec == "object" && spec.name) return normalizeModeSpec(spec.name);
        return "javascript";
    }

    function registerMode(name, factory) {
        modeFactories[name.toLowerCase()] = factory;
    }

    function resolveModeExtension(spec) {
        var normalized = normalizeModeSpec(spec);
        var viaMime = mimeModes[normalized];
        if (viaMime) normalized = normalizeModeSpec(viaMime);

        var factory = modeFactories[normalized] || modeFactories.javascript;
        return factory ? factory(spec) : javascriptPkg.javascript();
    }

    function docPositionFromCursor(doc, cursor) {
        if (typeof cursor == "number") {
            if (cursor < 0) return 0;
            if (cursor > doc.length) return doc.length;
            return cursor;
        }

        if (!cursor) return 0;

        var line = typeof cursor.line == "number" ? cursor.line : 0;
        var ch = typeof cursor.ch == "number" ? cursor.ch : 0;
        var lineInfo = doc.line(line + 1);
        var position = lineInfo.from + ch;

        if (position < lineInfo.from) return lineInfo.from;
        if (position > lineInfo.to) return lineInfo.to;

        return position;
    }

    function CompatEditor(textarea, options) {
        var thiz = this;

        this.textarea = textarea;
        this.options = options || {};
        this.modeCompartment = new Compartment();
        this.indentCompartment = new Compartment();
        this.tabSizeCompartment = new Compartment();

        this.wrapper = document.createElement("div");
        this.wrapper.className = "CodeMirror" + (textarea.className ? (" " + textarea.className) : "");
        this.wrapper.style.width = "100%";
        this.wrapper.style.height = "100%";
        this.wrapper.style.flex = "1 1 auto";
        this.wrapper.style.minWidth = "0";
        this.wrapper.style.minHeight = "0";

        textarea.style.display = "none";
        textarea.parentNode.insertBefore(this.wrapper, textarea.nextSibling);

        this.view = new EditorView({
            state: EditorState.create({
                doc: textarea.value || "",
                extensions: [
                    EditorView.theme({
                        "&": {
                            height: "100%",
                            width: "100%",
                            backgroundColor: "#fff"
                        },
                        ".cm-scroller": {
                            overflow: "auto",
                            fontFamily: "inherit",
                            lineHeight: "inherit"
                        },
                        ".cm-content, .cm-gutter": {
                            minHeight: "100%"
                        },
                        ".cm-focused": {
                            outline: "none"
                        }
                    }),
                    this.modeCompartment.of(resolveModeExtension(this.options.mode)),
                    this.indentCompartment.of(indentUnit.of(repeatSpace(this.options.indentUnit || 2))),
                    this.tabSizeCompartment.of(EditorState.tabSize.of(this.options.indentUnit || 2)),
                    syntaxHighlighting(defaultHighlightStyle),
                    history(),
                    drawSelection(),
                    keymap.of([indentWithTab].concat(defaultKeymap, historyKeymap)),
                    EditorView.updateListener.of(function (update) {
                        if (update.docChanged) {
                            thiz.textarea.value = update.state.doc.toString();
                        }
                    })
                ].concat(this.options.lineNumbers ? [lineNumbers()] : [])
            }),
            parent: this.wrapper
        });

        textarea._codeMirror = this;
    }

    CompatEditor.prototype.focus = function () {
        this.view.focus();
    };

    CompatEditor.prototype.refresh = function () {
        this.view.requestMeasure();
    };

    CompatEditor.prototype.getValue = function () {
        return this.view.state.doc.toString();
    };

    CompatEditor.prototype.setValue = function (value) {
        var text = typeof value == "string" ? value : "";
        this.view.dispatch({
            changes: {
                from: 0,
                to: this.view.state.doc.length,
                insert: text
            }
        });
    };

    CompatEditor.prototype.setCursor = function (cursor) {
        var position = docPositionFromCursor(this.view.state.doc, cursor);

        this.view.dispatch({
            selection: EditorSelection.cursor(position),
            scrollIntoView: true
        });
        this.view.focus();
    };

    CompatEditor.prototype.toTextArea = function () {
        if (!this.view) return;

        this.textarea.value = this.getValue();
        this.view.destroy();
        this.view = null;

        if (this.wrapper.parentNode) {
            this.wrapper.parentNode.removeChild(this.wrapper);
        }

        this.textarea.style.display = "";
        delete this.textarea._codeMirror;
    };

    registerMode("javascript", function () {
        return javascriptPkg.javascript();
    });
    registerMode("application/javascript", modeFactories.javascript);
    registerMode("text/javascript", modeFactories.javascript);

    registerMode("xml", function () {
        return xmlPkg.xml();
    });
    registerMode("text/xml", modeFactories.xml);
    registerMode("application/xml", modeFactories.xml);

    registerMode("html", function () {
        return htmlPkg.html();
    });
    registerMode("text/html", modeFactories.html);
    registerMode("htmlmixed", modeFactories.html);

    mimeModes["text/javascript"] = "javascript";
    mimeModes["application/javascript"] = "javascript";
    mimeModes["text/xml"] = "xml";
    mimeModes["application/xml"] = "xml";
    mimeModes["text/html"] = "htmlmixed";

    global.CodeMirror = {
        Pass: { toString: function () { return "CodeMirror.Pass"; } },
        modes: modeFactories,
        mimeModes: mimeModes,
        defineMode: function (name, factory) {
            registerMode(name, function (config) {
                return factory ? factory({}, config || {}) : javascriptPkg.javascript();
            });
        },
        defineMIME: function (name, spec) {
            mimeModes[name.toLowerCase()] = spec;
        },
        fromTextArea: function (textarea, options) {
            return new CompatEditor(textarea, options);
        }
    };
})(window);
