import { readdirSync, statSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHOPS_DIR = join(ROOT, "public", "shops");
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

const shops = listShops();
const out = join(ROOT, "public", "index.json");
writeFileSync(out, JSON.stringify(shops, null, 2) + "\n");
console.log(`build-shops-index: wrote ${shops.length} shops → public/index.json`);
