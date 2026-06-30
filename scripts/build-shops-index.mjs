// Build-time shop discovery.
//
// Browsers can't list a directory, so the app can't know which shop folders
// exist under public/shops/ on its own. This script scans that folder for any
// subdirectory containing a shop.json and writes the list to public/index.json,
// which the app fetches at startup.
//
// It runs automatically before `dev` and `build` (see package.json), so adding
// a new shop is just: drop a folder with a shop.json (+ optional banner.png /
// logo.png / icons), commit, and the next build (e.g. on Vercel) regenerates
// the index. No code changes needed.
//
// The "example" folder is a template/documentation only and is skipped.
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
