function ReactUIManager() {
}

ReactUIManager.MANIFEST_PATH = require("path").join(__dirname, "react-ui-manifest.json");
ReactUIManager.DEFAULT_WIDTH = 520;
ReactUIManager.DEFAULT_HEIGHT = 320;

ReactUIManager.CURATED_COMPONENTS = {
    Accordion: true,
    Avatar: true,
    Badge: true,
    BlogGridSection: true,
    Button: true,
    Card: true,
    CardGridSection: true,
    ContactForm: true,
    CTASection: true,
    FeatureSection: true,
    Footer: true,
    FormCheckbox: true,
    FormField: true,
    FormInput: true,
    FormSelect: true,
    FormTextarea: true,
    Grid: true,
    Heading: true,
    HeroSection: true,
    IconButton: true,
    Input: true,
    Navbar: true,
    NavigationMenu: true,
    Section: true,
    Stack: true,
    SubmitButton: true,
    Tabs: true,
    TestimonialSection: true,
    Text: true,
    Textarea: true,
    Tooltip: true
};

ReactUIManager.PRESET_DIMENSIONS = {
    Accordion: {width: 560, height: 320},
    Card: {width: 520, height: 320},
    ContactForm: {width: 560, height: 380},
    CTASection: {width: 640, height: 340},
    FeatureSection: {width: 620, height: 360},
    FormField: {width: 500, height: 230},
    HeroSection: {width: 680, height: 360},
    NavigationMenu: {width: 620, height: 280},
    Tabs: {width: 560, height: 320},
    TestimonialSection: {width: 640, height: 340}
};

ReactUIManager._e = function () {
    return React.createElement.apply(React, arguments);
};

ReactUIManager._escapeHtml = function (text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
};

ReactUIManager._fallbackMarkup = function (spec) {
    var title = ReactUIManager._escapeHtml(spec.name || spec.componentName || "Component");
    return [
        '<div style="height:100%;display:flex;align-items:center;justify-content:center;font-family:sans-serif;">',
            '<div style="padding:8px 12px;border:1px solid #d1d5db;border-radius:8px;background:#f8fafc;color:#0f172a;">',
                title,
            '</div>',
        '</div>'
    ].join("");
};

ReactUIManager._renderComponentMarkup = function (spec) {
    try {
        var component = WtasnorgUI[spec.componentName];
        var cType = typeof component;
        var isRenderable = cType === "function" || (cType === "object" && component && component.$$typeof);
        if (!isRenderable) {
            throw new Error("Component export not found");
        }

        if (spec.template && ReactUIManager.templateRenderers[spec.template]) {
            return ReactDOMServer.renderToStaticMarkup(ReactUIManager.templateRenderers[spec.template](spec));
        }

        var props = ReactUIManager._clonePreset(spec.props || {});
        var children = (typeof spec.children !== "undefined") ? spec.children : spec.name;

        var tree = ReactUIManager._e(
            "div",
            {
                style: {
                    width: "100%",
                    height: "100%",
                    boxSizing: "border-box",
                    padding: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden"
                }
            },
            ReactUIManager._e(component, props, children)
        );

        return ReactDOMServer.renderToStaticMarkup(tree);
    } catch (error) {
        return ReactUIManager._fallbackMarkup(spec);
    }
};

ReactUIManager._clonePreset = function (value) {
    if (value == null) return value;
    if (Array.isArray(value)) {
        return value.map(function (item) { return ReactUIManager._clonePreset(item); });
    }
    if (typeof value === "object") {
        var result = {};
        for (var k in value) {
            result[k] = ReactUIManager._clonePreset(value[k]);
        }
        return result;
    }
    return value;
};

ReactUIManager._isCurated = function (name) {
    return !!ReactUIManager.CURATED_COMPONENTS[name];
};

ReactUIManager._decorateSpec = function (spec) {
    var clone = ReactUIManager._clonePreset(spec) || {};
    var dim = ReactUIManager.PRESET_DIMENSIONS[clone.componentName || clone.name] || null;

    if (!clone.width) {
        clone.width = dim ? dim.width : ReactUIManager.DEFAULT_WIDTH;
    } else if (dim && clone.width <= 280) {
        clone.width = dim.width;
    }

    if (!clone.height) {
        clone.height = dim ? dim.height : ReactUIManager.DEFAULT_HEIGHT;
    } else if (dim && clone.height <= 160) {
        clone.height = dim.height;
    }

    if (clone.componentName === "Input") {
        clone.props = clone.props || {};
        if (!clone.props.placeholder) clone.props.placeholder = "you@example.com";
    } else if (clone.componentName === "Textarea") {
        clone.props = clone.props || {};
        if (!clone.props.placeholder) clone.props.placeholder = "Write your message";
        if (!clone.props.rows) clone.props.rows = 4;
    }

    if (clone.componentName === "Card") {
        clone.template = "card";
    } else if (clone.componentName === "Accordion") {
        clone.template = "accordion";
    } else if (clone.componentName === "Tabs") {
        clone.template = "tabs";
    } else if (clone.componentName === "Tooltip") {
        clone.template = "tooltip";
    } else if (clone.componentName === "FormField") {
        clone.template = "formfield";
    } else if (clone.componentName === "NavigationMenu") {
        clone.template = "navigation";
    }

    return clone;
};

ReactUIManager._buildRuntimeSpecs = function () {
    return Object.keys(WtasnorgUI)
        .sort()
        .filter(function (name) {
            var value = WtasnorgUI[name];
            var type = typeof value;
            var isFunctionComponent = type === "function";
            var isReactObjectComponent =
                type === "object" && value && value.$$typeof && String(value.$$typeof).indexOf("react.") >= 0;
            if (!isFunctionComponent && !isReactObjectComponent) return false;
            if (!/^[A-Z]/.test(name)) return false;
            if (/^(use|cn$)/.test(name)) return false;
            if (/variants?/i.test(name)) return false;
            if (/Style$/.test(name)) return false;
            if (!ReactUIManager._isCurated(name)) return false;
            return true;
        })
        .map(function (name) {
            return ReactUIManager._decorateSpec({
                id: "wtasnorg.ui." + name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
                name: name,
                componentName: name,
                props: {},
                children: name
            });
        });
};

ReactUIManager._loadManifestSpecs = function () {
    try {
        var localFs = require("fs");
        if (!localFs.existsSync(ReactUIManager.MANIFEST_PATH)) return null;
        var raw = localFs.readFileSync(ReactUIManager.MANIFEST_PATH, "utf8");
        var manifest = JSON.parse(raw);
        if (!manifest || !Array.isArray(manifest.components)) return null;

        return manifest.components
            .filter(function (item) {
                return item && item.componentName && ReactUIManager._isCurated(item.componentName);
            })
            .map(function (item) {
                return ReactUIManager._decorateSpec(item);
            });
    } catch (error) {
        return null;
    }
};

ReactUIManager.getCollectionName = function () {
    return "React UI";
};

ReactUIManager.getSpecs = function () {
    var fromManifest = ReactUIManager._loadManifestSpecs();
    if (fromManifest && fromManifest.length > 0) {
        return fromManifest.slice(0);
    }
    return ReactUIManager._buildRuntimeSpecs();
};

ReactUIManager.toSVG = function (spec) {
    var markup = ReactUIManager._renderComponentMarkup(spec);
    var width = spec.width || ReactUIManager.DEFAULT_WIDTH;
    var height = spec.height || ReactUIManager.DEFAULT_HEIGHT;

    var wrappedMarkup = [
        '<div xmlns="http://www.w3.org/1999/xhtml" style="',
            'width:100%;height:100%;box-sizing:border-box;overflow:hidden;',
            'display:flex;align-items:stretch;justify-content:stretch;',
            'font-family:Inter, Segoe UI, sans-serif;',
        '">',
            '<div style="width:100%;height:100%;box-sizing:border-box;overflow:hidden;">',
                markup,
            '</div>',
        '</div>'
    ].join("");

    return [
        '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="none">',
            '<rect x="0" y="0" width="' + width + '" height="' + height + '" fill="#ffffff" />',
            '<foreignObject x="0" y="0" width="' + width + '" height="' + height + '">',
                wrappedMarkup,
            '</foreignObject>',
        '</svg>'
    ].join("");
};

ReactUIManager.toDataUri = function (svg) {
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
};

var React = require("react");
var ReactDOMServer = require("react-dom/server");
var WtasnorgUI = require("@wtasnorg/ui");

ReactUIManager.templateRenderers = {
    card: function (spec) {
        return ReactUIManager._e(
            "div",
            {style: {width: "100%", height: "100%", display: "flex", alignItems: "stretch"}},
            ReactUIManager._e(
                WtasnorgUI.Card,
                {style: {width: "100%"}},
                ReactUIManager._e(
                    WtasnorgUI.CardHeader,
                    null,
                    ReactUIManager._e(WtasnorgUI.CardTitle, null, "Project Overview"),
                    ReactUIManager._e(WtasnorgUI.CardDescription, null, "Updated 2 minutes ago")
                ),
                ReactUIManager._e(
                    WtasnorgUI.CardContent,
                    null,
                    ReactUIManager._e("p", {style: {margin: 0}}, "Everything looks healthy.")
                ),
                ReactUIManager._e(
                    WtasnorgUI.CardFooter,
                    {style: {display: "flex", justifyContent: "flex-end"}},
                    ReactUIManager._e(WtasnorgUI.Button, null, "Open")
                )
            )
        );
    },
    accordion: function () {
        return ReactUIManager._e(
            WtasnorgUI.Accordion,
            {type: "single", defaultValue: "item-1", collapsible: true, style: {width: "100%"}},
            ReactUIManager._e(
                WtasnorgUI.AccordionItem,
                {value: "item-1"},
                ReactUIManager._e(WtasnorgUI.AccordionTrigger, null, "Shipping details"),
                ReactUIManager._e(WtasnorgUI.AccordionContent, null, "Orders ship in 2-3 business days.")
            )
        );
    },
    tabs: function () {
        return ReactUIManager._e(
            WtasnorgUI.Tabs,
            {defaultValue: "account", style: {width: "100%"}},
            ReactUIManager._e(
                WtasnorgUI.TabsList,
                null,
                ReactUIManager._e(WtasnorgUI.TabsTrigger, {value: "account"}, "Account"),
                ReactUIManager._e(WtasnorgUI.TabsTrigger, {value: "team"}, "Team")
            ),
            ReactUIManager._e(WtasnorgUI.TabsContent, {value: "account"}, "Manage your account settings"),
            ReactUIManager._e(WtasnorgUI.TabsContent, {value: "team"}, "Invite and manage team members")
        );
    },
    tooltip: function () {
        return ReactUIManager._e(
            WtasnorgUI.TooltipProvider,
            null,
            ReactUIManager._e(
                WtasnorgUI.Tooltip,
                null,
                ReactUIManager._e(WtasnorgUI.TooltipTrigger, {asChild: true}, ReactUIManager._e(WtasnorgUI.Button, null, "Hover me")),
                ReactUIManager._e(WtasnorgUI.TooltipContent, null, "Keyboard shortcut: K")
            )
        );
    },
    formfield: function () {
        return ReactUIManager._e(
            "div",
            {style: {width: "100%", display: "grid", gap: "8px"}},
            ReactUIManager._e(WtasnorgUI.FormLabel, null, "Email"),
            ReactUIManager._e(WtasnorgUI.Input, {placeholder: "you@example.com"}),
            ReactUIManager._e(WtasnorgUI.FormHint, null, "We never share your email.")
        );
    },
    navigation: function () {
        return ReactUIManager._e(
            WtasnorgUI.NavigationMenu,
            {style: {width: "100%"}},
            ReactUIManager._e(
                WtasnorgUI.NavigationMenuList,
                null,
                ReactUIManager._e(
                    WtasnorgUI.NavigationMenuItem,
                    null,
                    ReactUIManager._e(WtasnorgUI.NavigationMenuLink, null, "Home")
                ),
                ReactUIManager._e(
                    WtasnorgUI.NavigationMenuItem,
                    null,
                    ReactUIManager._e(WtasnorgUI.NavigationMenuLink, null, "Pricing")
                ),
                ReactUIManager._e(
                    WtasnorgUI.NavigationMenuItem,
                    null,
                    ReactUIManager._e(WtasnorgUI.NavigationMenuLink, null, "Docs")
                )
            )
        );
    }
};

if (typeof window !== "undefined") {
    window.ReactUIManager = ReactUIManager;
}
if (typeof module !== "undefined") {
    module.exports = ReactUIManager;
}
