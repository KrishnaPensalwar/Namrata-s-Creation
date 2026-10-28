/**
 * Content migration utility
 *
 * Modes:
 *   --dry-run     Print plan only
 *   --local       Apply seed SQL to local D1 (default)
 *   --remote      Apply seed SQL to remote D1 (requires credentials / approval)
 *   --upload-r2   Upload local assets to R2 and rewrite media.public_url
 *
 * Examples:
 *   node scripts/migrate-content.mjs --dry-run
 *   node scripts/migrate-content.mjs --local
 *   node scripts/migrate-content.mjs --local --upload-r2
 */

import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import {
  ROOT,
  loadContent,
  mediaIdForPath,
  objectKeyForPath,
} from "./lib/parse-content.mjs";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const remote = args.includes("--remote");
const uploadR2 = args.includes("--upload-r2");
const local = !remote;

function run(cmd, cmdArgs, opts = {}) {
  console.log(`$ ${cmd} ${cmdArgs.join(" ")}`);
  if (dryRun) return { status: 0, stdout: "", stderr: "" };
  return spawnSync(cmd, cmdArgs, { encoding: "utf8", stdio: "pipe", ...opts });
}

function collectImagePaths(content) {
  const paths = new Set();
  const add = (p) => p && paths.add(p.replace(/^\.\//, ""));
  (content.collections?.items || []).forEach((i) => add(i.img));
  (content.featured?.items || []).forEach((i) => add(i.img));
  (content.gallery?.items || []).forEach((i) => add(i.img));
  (content.hero?.images || []).forEach((i) => add(i.src));
  if (content.about?.portrait) add(content.about.portrait);
  return [...paths];
}

async function main() {
  console.log(`\n📦 Content migration (${dryRun ? "DRY RUN" : "WRITE"} / ${remote ? "remote" : "local"}${uploadR2 ? " + R2" : ""})\n`);

  // 1) Generate seed SQL
  const gen = run("node", ["scripts/generate-seed.mjs"], { cwd: ROOT });
  if (gen.status !== 0 && !dryRun) {
    console.error(gen.stderr || gen.stdout);
    // generate-seed exits 1 if missing images — still continue if SQL written
  }

  const seedFile = path.join(ROOT, "db/seed/0002_seed_from_content.sql");
  if (!fs.existsSync(seedFile) && !dryRun) {
    throw new Error("Seed file missing — generate-seed failed");
  }

  // 2) Apply schema + seed
  const dbFlag = remote ? "--remote" : "--local";
  const schema = path.join(ROOT, "db/migrations/0001_init_schema.sql");

  const applySchema = run(
    "npx",
    ["wrangler", "d1", "execute", "namrata_boutique", dbFlag, "--file", schema],
    { cwd: ROOT }
  );
  if (!dryRun && applySchema.status !== 0) {
    console.error(applySchema.stderr || applySchema.stdout);
    throw new Error("Schema apply failed");
  }

  const applySeed = run(
    "npx",
    ["wrangler", "d1", "execute", "namrata_boutique", dbFlag, "--file", seedFile],
    { cwd: ROOT }
  );
  if (!dryRun && applySeed.status !== 0) {
    console.error(applySeed.stderr || applySeed.stdout);
    throw new Error("Seed apply failed");
  }

  // 3) Optional R2 upload
  const content = loadContent();
  const images = collectImagePaths(content);
  const report = { uploaded: [], skipped: [], failed: [] };

  if (uploadR2) {
    for (const rel of images) {
      const abs = path.join(ROOT, rel);
      const key = objectKeyForPath(rel);
      const id = mediaIdForPath(rel);
      if (!fs.existsSync(abs)) {
        report.failed.push({ path: rel, error: "file not found" });
        continue;
      }
      const put = run(
        "npx",
        ["wrangler", "r2", "object", "put", `namrata-media/${key}`, "--file", abs, ...(local && !remote ? ["--local"] : [])],
        { cwd: ROOT }
      );
      if (!dryRun && put.status !== 0) {
        report.failed.push({ path: rel, error: put.stderr || put.stdout });
        continue;
      }
      report.uploaded.push({ path: rel, key, id });

      // Update public_url to Worker media route (CDN_URL filled later via env)
      const cdn = process.env.CDN_URL || "http://localhost:8787/media";
      const publicUrl = `${cdn.replace(/\/$/, "")}/${key}`;
      const sql = `UPDATE media SET object_key = '${key.replace(/'/g, "''")}', public_url = '${publicUrl.replace(/'/g, "''")}' WHERE id = '${id}';`;
      const upd = run(
        "npx",
        ["wrangler", "d1", "execute", "namrata_boutique", dbFlag, "--command", sql],
        { cwd: ROOT }
      );
      if (!dryRun && upd.status !== 0) {
        report.failed.push({ path: rel, error: "URL update failed: " + (upd.stderr || upd.stdout) });
      }
    }
  } else {
    report.skipped = images.map((p) => ({ path: p, reason: "local asset URLs (run --upload-r2 after R2 ready)" }));
  }

  const reportPath = path.join(ROOT, "scripts/migration-report.json");
  if (!dryRun) fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log("\n📊 Migration report");
  console.log(JSON.stringify({
    dryRun,
    remote,
    uploadR2,
    imageCount: images.length,
    uploaded: report.uploaded.length,
    skipped: report.skipped.length,
    failed: report.failed.length,
  }, null, 2));

  if (report.failed.length) {
    console.error("Failures:", report.failed);
    process.exitCode = 1;
  } else {
    console.log(dryRun ? "\n✅ Dry run complete" : "\n✅ Migration complete");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
