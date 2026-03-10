import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const PORT = process.env.PORT || 3000;
const ROOT = process.cwd();

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

function resolvePath(urlPath) {
  const cleanPath = urlPath === "/" ? "/index.html" : urlPath;
  const safePath = normalize(cleanPath).replace(/^(\.\.[/\\])+/, "");
  return join(ROOT, safePath);
}

const server = createServer(async (req, res) => {
  const targetPath = resolvePath(req.url || "/");

  try {
    const fileStat = await stat(targetPath);
    if (!fileStat.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
  } catch {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const extension = extname(targetPath);
  res.writeHead(200, {
    "Content-Type": MIME_TYPES[extension] || "application/octet-stream"
  });

  createReadStream(targetPath).pipe(res);
});

server.listen(PORT, () => {
  const indexPath = join(ROOT, "index.html");
  const readyMessage = existsSync(indexPath)
    ? `Snake game ready at http://localhost:${PORT}`
    : `Server listening on http://localhost:${PORT}`;
  console.log(readyMessage);
});