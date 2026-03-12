# CSS Colors Documentation

## Overview
This file documents all color values used in the Pencil application CSS and where they are defined.

## Color Sources Summary

| File | Description |
|------|-------------|
| `app/css/variables.less` | Main app color variables |
| `app/lib/bootstrap/variables.less` | Bootstrap framework colors |
| `app/css/theme.css` | Theme styles (buttons, inputs, scrollbars) |
| `app/views/ApplicationPane.xhtml` | Main layout colors |
| `app/css/canvas.css` | Canvas/editor colors |

---

## 1. App Color Variables (`app/css/variables.less`)

Main application-specific colors used throughout the app.

```less
@primary_color: #03a9f4;        // Primary accent (light blue)
@selected_bg: #3E7DB5;          // Selected item background
@selected_fg: #FFFFFF;          // Selected item text
@card_shadow: rgba(0, 0, 0, 0.2);
@app_bg: #E5E5E5;               // Main background (light gray)
@popup_bg: lighten(@app_bg, 3%);
@popup_border: darken(@app_bg, 5%);
@toolbar_spacing: 0.4em;
@selected_button_bg: #c6e4ff;
@pane_bg: #dae9f7;              // Panel background (light blue)
@toolbar_gap: 0.4em;
```

---

## 2. Bootstrap Variables (`app/lib/bootstrap/variables.less`)

Bootstrap framework colors. These affect all Bootstrap components.

### Gray Scale
```less
@gray-base: #000;
@gray-darker: #222;
@gray-dark: #333;
@gray: #555;
@gray-light: #777;
@gray-lighter: #eee;
```

### Brand Colors
```less
@brand-primary: #337ab7;
@brand-success: #5cb85c;
@brand-info: #5bc0de;
@brand-warning: #f0ad4e;
@brand-danger: #d9534f;
```

### Body & Text
```less
@body-bg: #fff;
@text-color: #333333;
@link-color: #337ab7;
```

### Buttons
```less
@btn-default-color: #333;
@btn-default-bg: #fff;
@btn-default-border: #ccc;
```

### Inputs
```less
@input-bg: #fff;
@input-border: #ccc;
@input-color: #333;
@input-border-focus: #66afe9;
@input-placeholder-color: #999;
```

### Navbar
```less
@navbar-default-bg: #f8f8f8;
@navbar-default-color: #777;
@navbar-default-link-color: #777;
@navbar-inverse-bg: #222;
```

### Other Components
```less
@dropdown-bg: #fff;
@modal-content-bg: #fff;
@panel-bg: #fff;
@table-bg: #fff;
@pagination-bg: #fff;
@tooltip-bg: #000;
@popover-bg: #fff;
```

---

## 3. Theme CSS (`app/css/theme.css`)

Direct CSS rules for basic elements.

### Buttons
```css
button {
    background: #FEFEFE;
    color: #000000DD;
}
button:hover {
    background: #dbeeff;
}
button[selected='true'],
button[checked='true'] {
    background: #c6e4ff;
}
```

### Inputs
```css
input[type="text"],
input[type="number"],
textarea {
    background: #FFF;
    border: 1px solid #CCC;
    color: #000;
}
```

### Icons
```css
icon {
    opacity: 0.54;
}
```

### Scrollbar
```css
::-webkit-scrollbar-track { background: #DDD; }
::-webkit-scrollbar-thumb { background: #00000022; }
```

---

## 4. ApplicationPane (`app/views/ApplicationPane.xhtml`)

Main application layout colors.

```less
@contentHeader { background: @app_bg; }
@contentBody { background: darken(@app_bg, 10%); }
@logoBox { padding-right: 3em; }
@appName { color: darken(saturate(#da8500, 20%), 0%); }  // Orange
```

---

## 5. Canvas (`app/css/canvas.css`)

Canvas/editor area colors.

```less
.Canvas {
    background: #FFF;
    border: solid 1px #AAA;
    box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.2);
}
*[pencil-canvas='true'] > box {
    background-color: #666;
}
```

---

## 6. XHTML Inline Styles

Many views have inline colors. Key files:

- `app/views/common/Tree.xhtml`
- `app/views/common/TabPane.xhtml`
- `app/views/editors/ColorSelector.xhtml`
- `app/views/editors/DataTable.xhtml`
- `app/views/tools/OpenClipartPane.xhtml`

---

## How to Modify Colors

### For Dark Theme
To enable dark theme, modify these files in order:

1. **Bootstrap variables** (`app/lib/bootstrap/variables.less`):
   - `@body-bg: #333333;`
   - `@text-color: #ffffff;`
   - `@brand-primary: #1565C0;`

2. **App variables** (`app/css/variables.less`):
   - `@app_bg: #333333;`
   - `@pane_bg: #444444;`

3. **Theme CSS** (`app/css/theme.css`):
   - Update button, input, scrollbar colors

4. **XHTML files** - Update inline styles as needed

### Priority Order
1. Inline styles in XHTML (highest priority)
2. theme.css
3. variables.less (lowest priority)
