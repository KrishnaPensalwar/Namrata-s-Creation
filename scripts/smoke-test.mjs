/**
 * Smoke tests against local Worker (wrangler dev must be running).
 * Usage: npm run test:api
 */

const BASE = process.env.API_BASE || "http://localhost:8787";

async function check(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    return true;
  } catch (err) {
    console.error(`❌ ${name}:`, err.message);
    return false;
  }
}

async function json(path, opts) {
  const res = await fetch(BASE + path, opts);
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

async function main() {
  console.log(`Smoke tests → ${BASE}\n`);
  let ok = 0;
  let fail = 0;

  const run = async (name, fn) => {
    if (await check(name, fn)) ok++;
    else fail++;
  };

  await run("GET /health", async () => {
    const { res, body } = await json("/health");
    if (!res.ok || !body.success) throw new Error(JSON.stringify(body));
  });

  await run("GET /api/v1/content", async () => {
    const { res, body } = await json("/api/v1/content");
    if (!res.ok || !body.success) throw new Error(JSON.stringify(body));
    if (!body.data?.brand) throw new Error("missing brand — seed DB first");
  });

  await run("GET /api/v1/products", async () => {
    const { res, body } = await json("/api/v1/products");
    if (!res.ok || !body.success) throw new Error(JSON.stringify(body));
    if (!Array.isArray(body.data)) throw new Error("expected array");
  });

  await run("GET /api/v1/gallery", async () => {
    const { res, body } = await json("/api/v1/gallery");
    if (!res.ok || !body.success) throw new Error(JSON.stringify(body));
  });

  await run("Admin without auth → 401", async () => {
    const { res, body } = await json("/api/v1/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "x" }),
    });
    if (res.status !== 401) throw new Error(`expected 401 got ${res.status} ${JSON.stringify(body)}`);
  });

  await run("Admin with bad key → 401", async () => {
    const { res } = await json("/api/v1/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer not-a-real-key",
      },
      body: JSON.stringify({ title: "x" }),
    });
    if (res.status !== 401) throw new Error(`expected 401 got ${res.status}`);
  });

  console.log(`\n${ok} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  console.error("\nIs wrangler dev running? Start with: npm run dev");
  process.exit(1);
});
