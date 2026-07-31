/**
 * Markdown → 印刷用HTML（依存なし）
 * 使い方: node scripts/md-to-print-html.mjs
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, "docs", "KenSapo取扱説明書.md");
const out = path.join(root, "docs", "print", "取扱説明書.html");

let md = fs.readFileSync(src, "utf8");
md = md.replace(/!\[([^\]]*)\]\(\.\/manual-images\/([^)]+)\)/g, (_m, alt, file) => {
  return `<figure class="shot"><div class="shot-ph">【画像】${file}<br/><span>${alt || ""}</span></div></figure>`;
});

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const lines = md.split(/\r?\n/);
const html = [];
let inUl = false;
let inOl = false;
let inTable = false;

function closeLists() {
  if (inUl) {
    html.push("</ul>");
    inUl = false;
  }
  if (inOl) {
    html.push("</ol>");
    inOl = false;
  }
}
function closeTable() {
  if (inTable) {
    html.push("</tbody></table>");
    inTable = false;
  }
}

for (const raw of lines) {
  const line = raw;
  if (line.startsWith("<figure")) {
    closeLists();
    closeTable();
    html.push(line);
    continue;
  }
  if (/^\|/.test(line)) {
    closeLists();
    if (/^\|\s*-+/.test(line)) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (!inTable) {
      html.push("<table><tbody>");
      inTable = true;
      html.push(
        "<tr>" +
          cells.map((c) => `<th>${escapeHtml(c)}</th>`).join("") +
          "</tr>"
      );
    } else {
      html.push(
        "<tr>" +
          cells.map((c) => `<td>${escapeHtml(c)}</td>`).join("") +
          "</tr>"
      );
    }
    continue;
  } else {
    closeTable();
  }

  if (/^#\s+/.test(line)) {
    closeLists();
    html.push(`<h1>${escapeHtml(line.replace(/^#\s+/, ""))}</h1>`);
    continue;
  }
  if (/^##\s+/.test(line)) {
    closeLists();
    html.push(`<h2>${escapeHtml(line.replace(/^##\s+/, ""))}</h2>`);
    continue;
  }
  if (/^###\s+/.test(line)) {
    closeLists();
    html.push(`<h3>${escapeHtml(line.replace(/^###\s+/, ""))}</h3>`);
    continue;
  }
  if (/^---+$/.test(line.trim())) {
    closeLists();
    html.push("<hr />");
    continue;
  }
  if (/^[-*]\s+/.test(line)) {
    if (inOl) {
      html.push("</ol>");
      inOl = false;
    }
    if (!inUl) {
      html.push("<ul>");
      inUl = true;
    }
    let item = line.replace(/^[-*]\s+/, "");
    item = item.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html.push(`<li>${item}</li>`);
    continue;
  }
  if (/^\d+\.\s+/.test(line)) {
    if (inUl) {
      html.push("</ul>");
      inUl = false;
    }
    if (!inOl) {
      html.push("<ol>");
      inOl = true;
    }
    let item = line.replace(/^\d+\.\s+/, "");
    item = item.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html.push(`<li>${item}</li>`);
    continue;
  }
  if (!line.trim()) {
    closeLists();
    continue;
  }
  closeLists();
  let p = escapeHtml(line);
  p = p.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // undo escape inside strong - we escaped first then replace won't work on escaped
  // redo: process bold before escape for plain paragraphs
  p = line
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  if (line.trim() === "注意" || line.startsWith("注意")) {
    html.push(`<div class="note"><strong>${p}</strong></div>`);
  } else {
    html.push(`<p>${p}</p>`);
  }
}
closeLists();
closeTable();

const page = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>KenSapo 取扱説明書</title>
  <link rel="stylesheet" href="./print.css" />
  <style>
    .shot { margin: 12pt 0; }
    .shot-ph {
      border: 2px dashed #9ca3af;
      background: #f9fafb;
      min-height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: #4b5563;
      font-size: 10pt;
      padding: 12pt;
      border-radius: 8px;
    }
    hr { border: 0; border-top: 1px solid #d1d5db; margin: 18pt 0; }
  </style>
</head>
<body>
  <div class="toolbar">
    <button type="button" onclick="window.print()">PDFに保存 / 印刷</button>
    <a class="secondary" href="./index.html">印刷用一覧へ</a>
  </div>
  ${html.join("\n")}
</body>
</html>
`;

fs.writeFileSync(out, page, "utf8");
console.log("wrote", out);
