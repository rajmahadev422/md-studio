# md·studio

[Live Link](https://rajmahadev422.github.io/md-studio/)

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
| **Image Support** | External image URLs embedded into PDF via CORS proxy fallback |
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

- **PDF** — print-ready A4 document with styled typography. External images are fetched and embedded automatically (with CORS proxy fallback).
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
- Hard line breaks

---

## How Images Work in PDF

PDF export uses `html2pdf.js` (which wraps `html2canvas`). Browsers block cross-origin canvas drawing, so a two-stage fetch is used before rendering:

1. **Direct `fetch()`** with CORS mode — works for image hosts that send `Access-Control-Allow-Origin: *`.
2. **CORS proxy fallback** via `api.allorigins.win` — handles most common CDNs and image hosts.
3. If both fail, a small warning placeholder replaces the image so the rest of the PDF still generates cleanly.

> **Note:** Some hosts (private servers, strict CDNs) will block both methods. In those cases, download the image and reference it as a base64 data URL or a local file path instead.

---

## Dependencies

All loaded from CDN — no `npm install` required.

| Library | Version | Purpose |
| --- | --- | --- |
| [marked](https://marked.js.org/) | 9.1.6 | Markdown → HTML parser |
| [highlight.js](https://highlightjs.org/) | 11.9.0 | Syntax highlighting |
| [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) | 0.10.1 | PDF generation |
| [Google Fonts](https://fonts.google.com/) | — | Fraunces, DM Sans, DM Mono |

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

- `fetch()` API (for image embedding in PDF)
- `FileReader` API (for file upload)
- CSS custom properties

> Internet Explorer is not supported.

---

## License

MIT — do whatever you want with it.
