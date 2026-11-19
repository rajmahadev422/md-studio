# md·studio

A zero-dependency, single-file Markdown editor and converter. Open `index.html` in any browser — no server, no install, no build step.

---

## Features

| Feature | Details |
| --- | --- |
| **Live Preview** | Side-by-side render updates as you type |
| **Write Mode** | Distraction-free editor with a formatting toolbar |
| **Light / Dark Mode** | Toggle in the header; preference saved to `localStorage` |
| **Resizable Panels** | Drag the divider between Source and Preview |
| **Drag & Drop** | Drop a `.md` or `.txt` file directly onto the editor |
| **File Upload** | Upload button accepts `.md`, `.txt`, `.markdown` |
| **Four Export Formats** | PDF, Markdown (`.md`), Plain Text (`.txt`), HTML page |
| **Image Support** | Images render in the preview, HTML export and printed PDF |
| **Math Equations** | LaTeX rendered with KaTeX: `\(…\)`, `\\(…\\)`, `\[…\]`, `$$…$$`, `$…$` |
| **Syntax Highlighting** | Fenced code blocks highlighted with Highlight.js |
| **Keyboard Shortcuts** | `Ctrl+B`, `Ctrl+I`, `Ctrl+K` in Write mode |

---

## Getting Started

No installation required. Just open the file:

```bash
# Clone or download the project
git clone https://github.com/yourname/md-studio.git

# Open in your browser
open index.html
# or double-click the file in your file manager
```

That's it. The file works from `file://` — no local server needed.

---

## Usage

### Convert Mode

The default view. Paste or type Markdown (or plain text) in the **Source** panel on the left. The **Preview** panel on the right renders it live.

- **Drag the divider** between the two panels to resize them.
- **Drop a file** anywhere on the Source panel to load it.
- **Drag & drop** or use the **Upload** button for `.md` / `.txt` files.

### Write Mode

Click the **Write** tab in the header to switch to a full-screen focused editor.

**Toolbar buttons:**

| Button | Action |
| --- | --- |
| **B** | Bold — wraps selection in `**` |
| *I* | Italic — wraps selection in `*` |
| ~~S~~ | Strikethrough — wraps in `~~` |
| `` `x` `` | Inline code |
| H1 / H2 / H3 | Heading prefix (click again to remove) |
| List icons | Bullet / numbered list prefix |
| Blockquote | `>` prefix |
| `</>` | Fenced code block |
| `—` | Horizontal rule |
| 🔗 | Insert link |
| 🖼 | Insert image placeholder |
| → Preview | Sync to Convert view and switch back |

**Keyboard shortcuts:**

| Shortcut | Action |
| --- | --- |
| `Ctrl + B` | Bold |
| `Ctrl + I` | Italic |
| `Ctrl + K` | Insert link |
| `Tab` | Insert 2 spaces |

### Downloading

Click **Download** in the header to open the export menu:

- **PDF** — opens the browser print dialog with a print-styled A4 layout; choose **Save as PDF** as the destination. Text and equations stay selectable and sharp.
- **Markdown** (`.md`) — raw source as-is.
- **Plain Text** (`.txt`) — raw source as-is.
- **HTML Page** (`.html`) — a fully self-contained styled HTML file you can share or host anywhere.

Set the output filename in the filename field (next to the file icon) before downloading.

---

## Supported Markdown

Standard [CommonMark](https://commonmark.org/) plus GitHub Flavored Markdown (GFM) extensions:

- Headings (`#` through `######`)
- **Bold**, *italic*, ~~strikethrough~~
- Ordered and unordered lists (with nesting)
- Blockquotes
- Fenced code blocks with language-specific syntax highlighting
- Inline code
- Links and images
- Tables
- Horizontal rules
- Math: inline `\(x^2\)` or `$x^2$`, display `\[ … \]` or `$$ … $$` (the doubled-backslash form `\\( … \\)` also works; math inside code spans/blocks is left alone)
- Hard line breaks

---

## How PDF Export Works

PDF export uses the browser's own print engine (`window.print()`), so there is no PDF library and no image fetching. Images, KaTeX equations and highlighted code print exactly as they appear in the preview, and the file name field is used as the default PDF name.

---

## Dependencies

All loaded from CDN — no `npm install` required.

| Library | Version | Purpose |
| --- | --- | --- |
| [marked](https://marked.js.org/) | 9.1.6 | Markdown → HTML parser |
| [highlight.js](https://highlightjs.org/) | 11.9.0 | Syntax highlighting |
| [KaTeX](https://katex.org/) | 0.16.9 | Math typesetting |
| [Google Fonts](https://fonts.google.com/) | — | Source Serif 4, Instrument Sans, JetBrains Mono |

---

## Project Structure

```plaintext
md-studio/
└── index.html    # The entire application — HTML, CSS, and JS in one file
└── index.js
└── style.css 
```

Everything is self-contained in `index.html`. There are no build tools, no config files, and no external assets beyond the CDN links.

---

## Browser Support

Works in all modern browsers. Requires:

- `FileReader` API (for file upload)
- CSS custom properties

> Internet Explorer is not supported.

---

## License

MIT — do whatever you want with it.
