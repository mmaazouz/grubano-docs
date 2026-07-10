// Minimal static file server for the exported `out/` dir (preview only).
const http = require('http')
const fs = require('fs')
const path = require('path')
const ROOT = process.env.STATIC_ROOT || path.join(__dirname, '..', 'out')
const PORT = process.env.PORT || 4599
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.png': 'image/png', '.ico': 'image/x-icon', '.webp': 'image/webp',
}
http
  .createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0])
    let fp = path.join(ROOT, p)
    try {
      if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html')
      if (!fs.existsSync(fp)) fp = fp.endsWith('.html') ? fp : fp + '.html'
      if (!fs.existsSync(fp)) fp = path.join(ROOT, p, 'index.html')
      const data = fs.readFileSync(fp)
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(fp)] || 'application/octet-stream' })
      res.end(data)
    } catch {
      res.writeHead(404); res.end('404')
    }
  })
  .listen(PORT, () => console.log(`static-preview on http://localhost:${PORT}`))
