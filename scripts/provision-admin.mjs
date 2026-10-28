/**
 * One-time admin API key provisioning (single trusted user).
 *
 * Usage:
 *   node scripts/provision-admin.mjs --dry-run
 *   node scripts/provision-admin.mjs --local
 *   node scripts/provision-admin.mjs --remote   # only after approval
 *   node scripts/provision-admin.mjs --local --revoke <userId>
 *
 * Outputs plaintext key ONCE to scripts/generated-api-key.txt (gitignored).
 * Never commit that file. Deliver key to sister via secure channel.
 */

import crypto from "crypto";
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const remote = args.includes("--remote");
const revokeIdx = args.indexOf("--revoke");
const revokeId = revokeIdx >= 0 ? args[revokeIdx + 1] : null;
const descIdx = args.indexOf("--description");
const description =
  descIdx >= 0 ? args[descIdx + 1] : "Namrata Android Admin App";

function hashApiKey(key) {
  return crypto.createHash("sha256").update(key, "utf8").digest("hex");
}

function generateApiKey() {
  return crypto.randomBytes(24).toString("base64url");
}

function d1(command) {
  const flags = remote ? ["--remote"] : ["--local"];
  const full = ["wrangler", "d1", "execute", "namrata_boutique", ...flags, "--command", command];
  console.log(`$ npx ${full.join(" ")}`);
  if (dryRun) return { status: 0, stdout: "(dry-run)" };
  return spawnSync("npx", full, { cwd: ROOT, encoding: "utf8" });
}

async function main() {
  console.log(`\n🔐 Admin provisioning (${dryRun ? "DRY RUN" : "WRITE"} / ${remote ? "remote" : "local"})\n`);

  if (revokeId) {
    const sql = `UPDATE admin_users SET is_active = 0, revoked_at = '${new Date().toISOString()}' WHERE id = '${revokeId.replace(/'/g, "''")}';`;
    const r = d1(sql);
    if (!dryRun && r.status !== 0) {
      console.error(r.stderr || r.stdout);
      process.exit(1);
    }
    console.log(`Revoked user ${revokeId}`);
    return;
  }

  const apiKey = generateApiKey();
  const apiKeyHash = hashApiKey(apiKey);
  const apiKeyPrefix = apiKey.slice(0, 8);
  const userId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  console.log("Will create admin_users row:");
  console.log(`  id:          ${userId}`);
  console.log(`  description: ${description}`);
  console.log(`  prefix:      ${apiKeyPrefix}...`);
  console.log(`  hash:        ${apiKeyHash.slice(0, 16)}...`);

  const sql = `INSERT INTO admin_users (id, api_key_hash, api_key_prefix, description, is_active, created_at) VALUES ('${userId}', '${apiKeyHash}', '${apiKeyPrefix}', '${description.replace(/'/g, "''")}', 1, '${createdAt}');`;

  const r = d1(sql);
  if (!dryRun && r.status !== 0) {
    console.error(r.stderr || r.stdout);
    process.exit(1);
  }

  if (!dryRun) {
    const outFile = path.join(ROOT, "scripts/generated-api-key.txt");
    const metaFile = path.join(ROOT, "scripts/generated-admin-user.json");
    fs.writeFileSync(
      outFile,
      [
        "# KEEP SECRET — deliver to sister securely; do not commit",
        `# created: ${createdAt}`,
        `# userId: ${userId}`,
        `# prefix: ${apiKeyPrefix}`,
        apiKey,
        "",
      ].join("\n"),
      { mode: 0o600 }
    );
    fs.writeFileSync(
      metaFile,
      JSON.stringify({ userId, apiKeyPrefix, description, createdAt, apiKeyHash }, null, 2)
    );
    console.log("\n✅ Admin user created");
    console.log(`Plaintext key written to: scripts/generated-api-key.txt`);
    console.log("This is the only time the key is shown. Store in a password manager.");
    console.log("\n🔑 API KEY:\n");
    console.log(apiKey);
    console.log("");
  } else {
    console.log("\n✅ Dry run — no DB write. Example key format:");
    console.log(apiKey);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
