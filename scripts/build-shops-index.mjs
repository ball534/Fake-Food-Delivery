import {
  readdirSync,
  statSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHOPS_DIR = join(ROOT, "public", "shops");
const CONTENT = join(ROOT, "public", "content.json");
const SKIP = new Set(["example"]);

function listShops() {
  if (!existsSync(SHOPS_DIR)) return [];
  return readdirSync(SHOPS_DIR)
    .filter((name) => !SKIP.has(name))
    .filter((name) => {
      const dir = join(SHOPS_DIR, name);
      return statSync(dir).isDirectory() && existsSync(join(dir, "shop.json"));
    })
    .sort();
}

// content.json holds both hand-authored content (greetings, deals) and the
// generated shop list. We read-merge-write so the `shops` array is refreshed
// without clobbering the authored sections.
let content = {};
if (existsSync(CONTENT)) {
  try {
    content = JSON.parse(readFileSync(CONTENT, "utf8"));
  } catch {
    content = {};
  }
}

const shops = listShops();
const { shops: _prev, ...rest } = content;
const out = { shops, ...rest };

writeFileSync(CONTENT, JSON.stringify(out, null, 2) + "\n");
console.log(
  `build-shops-index: wrote ${shops.length} shops → public/content.json`,
);
