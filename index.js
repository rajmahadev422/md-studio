const download = `<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3v8M5 8l3 3 3-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 13h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        <span class="lbl">Download</span>
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ══ MARKED ══
const renderer = new marked.Renderer();
renderer.code = (code, lang) => {
  const hl =
    lang && hljs.getLanguage(lang)
      ? hljs.highlight(code, { language: lang }).value
      : hljs.highlightAuto(code).value;
  return `<pre><code class="hljs">${hl}</code></pre>`;
};
marked.setOptions({ renderer, breaks: true, gfm: true });

// ══ MATH (KaTeX) ══
// Supports \( … \), \[ … \], $$ … $$, $ … $ — and the doubled-backslash forms \\( … \\), \\[ … \\].
// Code blocks and inline code are skipped so their contents are never touched.
const MATH_RE =
  /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`)|\$\$([\s\S]+?)\$\$|\\{1,2}\[([\s\S]+?)\\{1,2}\]|\\{1,2}\(([\s\S]+?)\\{1,2}\)|(?<![\\$\w])\$(?![\s$])((?:\\.|[^$\\\n])+?)(?<![\s\\])\$(?![\d\w])/g;

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function renderMarkdown(src) {
  const store = [];
  const tok = (tex, display) => {
    let out;
    try {
      out = katex.renderToString(tex.trim(), {
        displayMode: display,
        throwOnError: false,
        strict: "ignore",
        output: "htmlAndMathml",
      });
    } catch (e) {
      out = `<code class="katex-error">${escapeHtml(tex)}</code>`;
    }
    store.push(display ? `<div class="math-display">${out}</div>` : out);
    return `@@M${display ? "D" : "I"}${store.length - 1}@@`;
  };
  const text = src.replace(MATH_RE, (m, code, d1, d2, i1, i2) => {
    if (code) return code;
    if (d1 !== undefined) return "\n\n" + tok(d1, true) + "\n\n";
    if (d2 !== undefined) return "\n\n" + tok(d2, true) + "\n\n";
    return tok(i1 !== undefined ? i1 : i2, false);
  });
  const html = marked
    .parse(text)
    .replace(/<p>\s*(@@MD\d+@@)\s*<\/p>/g, "$1");
  return html.replace(/@@M[DI](\d+)@@/g, (_, i) => store[+i]);
}

// ══ STATE ══
let currentMode = "convert";
let currentTheme = localStorage.getItem("mdstudio-theme") || "light";

// ══ SAMPLE ══
const SAMPLE = `# Welcome to md·studio

Transform **Markdown** or plain text into beautiful documents — then export as PDF, Markdown, plain text, or a standalone HTML page.

---

## Features

- 🌗 **Light & dark mode** — toggle in the top-right corner
- ↔️ **Resizable panels** — drag the divider between Source and Preview
- 📁 **Drag & drop** a \`.md\` or \`.txt\` file onto the editor
- ⬇️ **Four export formats** — PDF, .md, .txt, .html
- ✏️ **Write mode** — distraction-free editor with toolbar
- ∑ **Math equations** — LaTeX via KaTeX, e.g. \\(x^2 + y^2 = r^2\\)

---

## Write Mode

Switch to **Write** mode (top-left tabs) for a focused editor with a formatting toolbar.

- **Ctrl+B** — Bold
- **Ctrl+I** — Italic
- **Ctrl+K** — Insert link

---

## Markdown Showcase

### Code

\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet('World')); // Hello, World!
\`\`\`

### Blockquote

> "Simplicity is the ultimate sophistication."
> — Leonardo da Vinci

### Table

| Export   | Format | Notes                  |
|----------|--------|------------------------|
| PDF      | .pdf   | Print-ready, styled    |
| Markdown | .md    | Raw source             |
| Text     | .txt   | Plain text             |
| HTML     | .html  | Self-contained page    |

### Inline

**Bold**, *italic*, ~~strikethrough~~, \`inline code\`.

### Math

Inline: the economic order quantity is \\(EOQ=\\sqrt{\\frac{2C_oA}{C_iP^2}}\\), where \\(C_o\\) is the ordering cost and \\(A\\) the annual demand.

Display, with \\[ … \\] or $$ … $$:

\\[ \\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i \\]

$$\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}$$

---

*Happy writing!*
`;

// ══ THEME ══
function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("mdstudio-theme", theme);
  document.getElementById("hlTheme").href =
    theme === "dark"
      ? "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
      : "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css";
}

function toggleTheme() {
  applyTheme(currentTheme === "light" ? "dark" : "light");
}

// ══ RESIZER ══
(function () {
  const resizer = document.getElementById("resizer");
  const left = document.getElementById("panelLeft");
  const wrap = document.getElementById("convertView");
  let dragging = false,
    startX = 0,
    startW = 0;

  function onStart(x) {
    dragging = true;
    startX = x;
    startW = left.getBoundingClientRect().width;
    resizer.classList.add("dragging");
    document.body.classList.add("resizing");
  }

  function onMove(x) {
    if (!dragging) return;
    const total = wrap.getBoundingClientRect().width;
    const rw = resizer.getBoundingClientRect().width;
    const min = 100,
      max = total - rw - min;
    const w = Math.max(min, Math.min(max, startW + (x - startX)));
    left.style.flex = `0 0 ${w}px`;
  }

  function onEnd() {
    if (!dragging) return;
    dragging = false;
    resizer.classList.remove("dragging");
    document.body.classList.remove("resizing");
  }

  resizer.addEventListener("mousedown", (e) => {
    e.preventDefault();
    onStart(e.clientX);
  });
  document.addEventListener("mousemove", (e) => onMove(e.clientX));
  document.addEventListener("mouseup", onEnd);

  resizer.addEventListener("touchstart", (e) => onStart(e.touches[0].clientX), {
    passive: true,
  });
  document.addEventListener("touchmove", (e) => onMove(e.touches[0].clientX), {
    passive: true,
  });
  document.addEventListener("touchend", onEnd);
})();

// ══ MODE ══
function switchMode(mode) {
  currentMode = mode;
  document
    .getElementById("tabConvert")
    .classList.toggle("active", mode === "convert");
  document
    .getElementById("tabWrite")
    .classList.toggle("active", mode === "write");
  document.getElementById("convertView").style.display =
    mode === "convert" ? "flex" : "none";
  document.getElementById("writeView").style.display =
    mode === "write" ? "flex" : "none";
  if (mode === "write") {
    const src = document.getElementById("mdInput").value;
    if (!document.getElementById("writeInput").value && src)
      document.getElementById("writeInput").value = src;
    updateWriteStats();
    document.getElementById("writeInput").focus();
  } else {
    const w = document.getElementById("writeInput").value;
    if (w) {
      document.getElementById("mdInput").value = w;
      renderPreview();
    }
  }
}

// ══ RENDER ══
function onSourceInput() {
  renderPreview();
}

function renderPreview() {
  const md = document.getElementById("mdInput").value;
  const prev = document.getElementById("preview");
  const empty = document.getElementById("emptyState");
  const words = md.trim() ? md.trim().split(/\s+/).length : 0;
  document.getElementById("charCount").textContent =
    `${md.length.toLocaleString()} chars · ${words.toLocaleString()} words`;
  document.getElementById("readTime").textContent =
    words > 0 ? `~${Math.max(1, Math.round(words / 200))} min read` : "";
  if (!md.trim()) {
    prev.style.display = "none";
    empty.style.display = "flex";
    prev.innerHTML = "";
    return;
  }
  empty.style.display = "none";
  prev.style.display = "block";
  prev.innerHTML = renderMarkdown(md);
}

// ══ WRITE ══
function onWriteInput() {
  updateWriteStats();
}

function updateWriteStats() {
  const v = document.getElementById("writeInput").value;
  const w = v.trim() ? v.trim().split(/\s+/).length : 0;
  document.getElementById("wfChars").textContent =
    v.length.toLocaleString() + " chars";
  document.getElementById("wfWords").textContent =
    w.toLocaleString() + " words";
  document.getElementById("wfLines").textContent =
    (v ? v.split("\n").length : 0).toLocaleString() + " lines";
  document.getElementById("wfRead").textContent =
    `~${Math.max(1, Math.round(w / 200))} min read`;
}

function syncWriteToConvert() {
  document.getElementById("mdInput").value =
    document.getElementById("writeInput").value;
  renderPreview();
  switchMode("convert");
  showToast("Synced to preview ✓");
}

// ══ TOOLBAR ══
function wta() {
  return document.getElementById("writeInput");
}

function fmt(type) {
  const ta = wta(),
    s = ta.selectionStart,
    e = ta.selectionEnd,
    sel = ta.value.slice(s, e);
  const m = {
    bold: ["**", "**"],
    italic: ["*", "*"],
    strike: ["~~", "~~"],
    code: ["`", "`"],
  };
  const [o, c] = m[type];
  ta.setRangeText(o + (sel || "text") + c, s, e, sel ? "select" : "end");
  if (!sel) {
    ta.selectionStart = s + o.length;
    ta.selectionEnd = s + o.length + 4;
  }
  ta.focus();
  onWriteInput();
}

function fmtLine(type) {
  const ta = wta(),
    s = ta.selectionStart,
    val = ta.value;
  const ls = val.lastIndexOf("\n", s - 1) + 1,
    le = val.indexOf("\n", s),
    end = le === -1 ? val.length : le;
  const line = val.slice(ls, end);
  const pre = {
    h1: "# ",
    h2: "## ",
    h3: "### ",
    ul: "- ",
    ol: "1. ",
    blockquote: "> ",
  }[type];
  if (line.startsWith(pre))
    ta.setRangeText(line.slice(pre.length), ls, end, "end");
  else
    ta.setRangeText(
      pre + line.replace(/^(#{1,6} |- |\d+\. |> )/, ""),
      ls,
      end,
      "end",
    );
  ta.focus();
  onWriteInput();
}

function fmtBlock(type) {
  const ta = wta(),
    s = ta.selectionStart,
    e = ta.selectionEnd,
    sel = ta.value.slice(s, e);
  if (type === "code")
    ta.setRangeText(
      "\n```\n" + (sel || "// code here") + "\n```\n",
      s,
      e,
      "end",
    );
  else if (type === "hr") ta.setRangeText("\n\n---\n\n", s, e, "end");
  ta.focus();
  onWriteInput();
}

function fmtMath(display) {
  const ta = wta(),
    s = ta.selectionStart,
    e = ta.selectionEnd,
    sel = ta.value.slice(s, e);
  ta.setRangeText(
    display
      ? "\n\\[\n" + (sel || "E = mc^2") + "\n\\]\n"
      : "\\(" + (sel || "x^2") + "\\)",
    s,
    e,
    "end",
  );
  ta.focus();
  onWriteInput();
}

function fmtLink() {
  const ta = wta(),
    s = ta.selectionStart,
    e = ta.selectionEnd;
  ta.setRangeText(
    `[${ta.value.slice(s, e) || "link text"}](https://example.com)`,
    s,
    e,
    "end",
  );
  ta.focus();
  onWriteInput();
}

function fmtImage() {
  const ta = wta(),
    s = ta.selectionStart,
    e = ta.selectionEnd;
  ta.setRangeText("![alt text](https://example.com/image.png)", s, e, "end");
  ta.focus();
  onWriteInput();
}

document.getElementById("writeInput").addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === "b") {
      e.preventDefault();
      fmt("bold");
    }
    if (e.key === "i") {
      e.preventDefault();
      fmt("italic");
    }
    if (e.key === "k") {
      e.preventDefault();
      fmtLink();
    }
  }
});

["mdInput", "writeInput"].forEach((id) => {
  document.getElementById(id).addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.target,
        s = ta.selectionStart;
      ta.setRangeText("  ", s, ta.selectionEnd, "end");
    }
  });
});

// ══ FILE LOADING ══
function handleFileInput(ev) {
  const f = ev.target.files[0];
  if (f) readFile(f);
  ev.target.value = "";
}

function readFile(file) {
  if (!file.name.match(/\.(md|txt|markdown|text)$/i)) {
    showToast("Use a .md or .txt file");
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    const c = ev.target.result;
    document.getElementById("mdInput").value = c;
    document.getElementById("writeInput").value = c;
    document.getElementById("filenameInput").value = file.name.replace(
      /\.(md|txt|markdown|text)$/i,
      "",
    );
    renderPreview();
    updateWriteStats();
    showToast("Loaded: " + file.name + " ✓");
  };
  reader.readAsText(file);
}

// ══ DRAG & DROP ══
const dz = document.getElementById("dropZone"),
  dov = document.getElementById("dropOverlay");
dz.addEventListener("dragenter", (e) => {
  e.preventDefault();
  dov.classList.add("active");
});
dz.addEventListener("dragover", (e) => {
  e.preventDefault();
  dov.classList.add("active");
});
dz.addEventListener("dragleave", (e) => {
  if (!dz.contains(e.relatedTarget)) dov.classList.remove("active");
});
dz.addEventListener("drop", (e) => {
  e.preventDefault();
  dov.classList.remove("active");
  const f = e.dataTransfer.files[0];
  if (f) readFile(f);
});
document.addEventListener("dragover", (e) => e.preventDefault());
document.addEventListener("drop", (e) => {
  e.preventDefault();
  const f = e.dataTransfer.files[0];
  if (f) readFile(f);
});

// ══ DOWNLOAD ══
function fname(ext) {
  return (
    (document.getElementById("filenameInput").value.trim() || "document") +
    "." +
    ext
  );
}
function getSource() {
  return (
    currentMode === "write"
      ? document.getElementById("writeInput")
      : document.getElementById("mdInput")
  ).value;
}

async function downloadFile(format) {
  closeDropdown();
  const src = getSource().trim();
  if (!src) {
    showToast("Nothing to download — add content first");
    return;
  }
  showDownload("Downloading…", true);
  if (format === "pdf") {
    await downloadPDF(src);
    showDownload(download, false);
    return;
  }
  if (format === "html") {
    await downloadHTML(src);
    showDownload(download, false);
    return;
  }
  const blob = new Blob([src], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fname(format);
  a.click();
  URL.revokeObjectURL(a.href);
  showToast(`Downloaded ${fname(format)} ✓`);
}

// ══ PDF (browser print) ══
async function downloadPDF(src) {
  let root = document.getElementById("printRoot");
  if (!root) {
    root = document.createElement("div");
    root.id = "printRoot";
    root.className = "prose";
    document.body.appendChild(root);
  }
  root.innerHTML = renderMarkdown(src);
  await Promise.all([
    document.fonts.ready,
    ...Array.from(root.querySelectorAll("img")).map((img) =>
      img.complete ? null : new Promise((r) => (img.onload = img.onerror = r)),
    ),
  ]);
  const prevTitle = document.title;
  document.title = fname("pdf").replace(/\.pdf$/, ""); // default file name in "Save as PDF"
  const restore = () => {
    document.title = prevTitle;
    root.innerHTML = "";
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);
  showToast("In the print dialog, choose “Save as PDF”");
  window.print();
}

function downloadHTML(src) {
  const title = document.getElementById("filenameInput").value || "Document";
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css"/><link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=JetBrains+Mono:wght@400&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet"/><style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'Source Serif 4',Georgia,serif;background:#fbfcfe;color:#172033;padding:3rem 1.5rem;line-height:1.8}.prose{max-width:680px;margin:0 auto}.prose h1,.prose h2,.prose h3,.prose h4{font-family:'Source Serif 4',serif;font-weight:700;letter-spacing:-0.02em;line-height:1.2;margin-top:1.8em;margin-bottom:0.5em}.prose h1{font-size:2rem}.prose h2{font-size:1.5rem}.prose h3{font-size:1.15rem}.prose p{margin-bottom:1.2em}.prose a{color:#2a52be}.prose strong{font-weight:600}.prose em{font-style:italic}.prose ul,.prose ol{padding-left:1.6em;margin-bottom:1.2em}.prose blockquote{border-left:3px solid #2a52be;padding:.65rem 1.1rem;margin:1.3em 0;background:#f1f4f8;border-radius:0 6px 6px 0;color:#66718a;font-style:italic}.prose code{font-family:'JetBrains Mono',monospace;font-size:.82em;background:#f1f4f8;border:1px solid #d8dee8;padding:.1em .4em;border-radius:4px}.prose pre{background:#0f1420;border-radius:10px;padding:1.15rem 1.35rem;overflow-x:auto;margin:1.3em 0}.prose pre code{background:none;border:none;padding:0;font-size:.79rem;color:#e3e8f2;line-height:1.7}.prose table{width:100%;border-collapse:collapse;margin:1.3em 0;font-size:.88rem}.prose thead{background:#f1f4f8}.prose th,.prose td{padding:.58rem .9rem;border:1px solid #d8dee8;text-align:left}.prose th{font-weight:600}.prose hr{border:none;border-top:1px solid #d8dee8;margin:2em 0}.prose img{max-width:100%;border-radius:8px;margin:1em 0}.math-display{margin:1.4em 0;overflow-x:auto;overflow-y:hidden}.math-display .katex-display{margin:0}</style></head><body><div class="prose">${renderMarkdown(src)}</div></body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fname("html");
  a.click();
  URL.revokeObjectURL(a.href);
  showToast(`Downloaded ${fname("html")} ✓`);
}

// ══ DROPDOWN ══
function toggleDropdown() {
  document.getElementById("dlMenu").classList.toggle("open");
}
function closeDropdown() {
  document.getElementById("dlMenu").classList.remove("open");
}
document.addEventListener("click", (e) => {
  if (!document.getElementById("dlDropdown").contains(e.target))
    closeDropdown();
});

// ══ MISC ══
function loadSample() {
  document.getElementById("mdInput").value = SAMPLE;
  document.getElementById("writeInput").value = SAMPLE;
  renderPreview();
  updateWriteStats();
  showToast("Sample loaded ✓");
}

let tt;
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(tt);
  tt = setTimeout(() => t.classList.remove("show"), 3000);
}

function showDownload(msg, d) {
  document.getElementById("download-btn").innerHTML = msg;
  document.getElementById("download-btn").disabled = d || false;
}

// ══ INIT ══
window.onload = () => {
  applyTheme(currentTheme);
  loadSample();
  showDownload(download, false);
};
