function ReactComponentPane() {
    BaseTemplatedWidget.call(this);
    var thiz = this;
    this.allDefs = [];

    this.shapeList.addEventListener("dragstart", function (event) {
        nsDragAndDrop.dragStart(event);
        var n = Dom.findUpwardForNodeWithData(Dom.getTarget(event), "_def");
        if (!n || !n._def) return;

        var def = n._def;
        event.dataTransfer.setData("image/svg+xml", def.svg);
        nsDragAndDrop.setData("image/svg+xml", def.svg);
        event.dataTransfer.setData("text/html", "");
        nsDragAndDrop.setData("text/html", "");
        event.dataTransfer.setDragImage(thiz.dndImage, 8, 8);
    });

    this.dndImage = new Image();
    this.dndImage.src = "css/bullet.png";

    this.bind("click", function () {
        this.refreshManifestAndReload();
    }, this.refreshButton);

    this.bind("keyup", function () {
        this.renderShapes();
    }, this.searchInput);

    UICommandManager.register({
        key: "refreshReactUIComponentsCommand",
        shortcut: "Ctrl+Shift+R",
        run: function () {
            if (Pencil.controller && Pencil.controller.applicationPane && Pencil.controller.applicationPane.reactComponentPane) {
                Pencil.controller.applicationPane.reactComponentPane.refreshManifestAndReload();
            }
        }
    });

    this.renderShapes();
}
__extend(BaseTemplatedWidget, ReactComponentPane);

ReactComponentPane.prototype.getTitle = function () {
    return ReactUIManager.getCollectionName();
};

ReactComponentPane.prototype.getIconName = function () {
    return "widgets";
};

ReactComponentPane.prototype.renderShapes = function () {
    Dom.empty(this.shapeList);

    var defs = ReactUIManager.getSpecs().map(function (spec) {
        var svg = ReactUIManager.toSVG(spec);
        return {
            id: spec.id,
            name: spec.name,
            svg: svg,
            iconData: ReactUIManager.toDataUri(svg)
        };
    });

    this.allDefs = defs;
    var term = (this.searchInput && this.searchInput.value) ? this.searchInput.value.toLowerCase().trim() : "";
    if (term) {
        defs = defs.filter(function (def) {
            return def.name.toLowerCase().indexOf(term) >= 0;
        });
    }

    for (var i = 0; i < defs.length; i++) {
        var def = defs[i];
        var node = Dom.newDOMElement({
            _name: "li",
            "type": "ShapeDef",
            "title": def.name,
            _children: [
                {
                    _name: "div",
                    "class": "Shape",
                    draggable: "true",
                    _children: [
                        {
                            _name: "div",
                            "class": "Icon",
                            _children: [
                                {
                                    _name: "img",
                                    src: def.iconData
                                }
                            ]
                        },
                        {
                            _name: "span",
                            _text: def.name
                        }
                    ]
                }
            ]
        });

        node._def = def;
        this.shapeList.appendChild(node);
    }
};

ReactComponentPane.prototype.refreshManifestAndReload = function () {
    try {
        var cp = require("child_process");
        var path = require("path");
        var appRoot = path.resolve(__dirname, "../..");
        var scriptPath = path.join(appRoot, "scripts", "generate-react-ui-manifest.js");

        cp.execFileSync(process.execPath, [scriptPath], {
            cwd: appRoot,
            stdio: "pipe"
        });

        this.renderShapes();
        NotificationPopup.show("React UI components refreshed from @wtasnorg/ui");
    } catch (error) {
        Console.dumpError(error);
        NotificationPopup.show("Unable to refresh React UI components");
    }
};
