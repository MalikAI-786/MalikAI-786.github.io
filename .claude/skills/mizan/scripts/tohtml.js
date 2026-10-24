// docx -> OneNote-pasteable HTML: inline styles only (OneNote drops <style> blocks on paste).
const mammoth = require(require('fs').existsSync(process.cwd()+'/node_modules/mammoth') ? process.cwd()+'/node_modules/mammoth' : 'mammoth'); const fs = require('fs');
(async () => {
  const [inp, out, title] = process.argv.slice(2);
  let h = (await mammoth.convertToHtml({ path: inp })).value;
  h = h.replace(/<table>/g, '<table style="border-collapse:collapse;width:100%;margin:6px 0 14px">')
       .replace(/<td>/g, '<td style="border:1px solid #bbb;padding:5px 8px;vertical-align:top;font-family:Calibri,Arial;font-size:11pt">')
       .replace(/<h2>/g, '<h2 style="font-family:Georgia,serif;font-size:15pt;margin:18px 0 6px">')
       .replace(/<p>/g, '<p style="font-family:Calibri,Arial;font-size:11pt;margin:3px 0">');
  const page = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="max-width:860px;margin:16px auto;padding:0 14px;color:#1e1b18;background:#fff">
<div style="background:#fff4ec;border-left:4px solid #E0662E;padding:10px 12px;margin-bottom:14px;font-family:Calibri,Arial;font-size:10.5pt">
<b>To put this in OneNote:</b> tap/click anywhere on this page → Select All (Ctrl+A / ⌘A) → Copy → open a new OneNote page → Paste. Tables and ☐ boxes come across.</div>
${h}</body></html>`;
  fs.writeFileSync(out, page); console.log(out);
})();
