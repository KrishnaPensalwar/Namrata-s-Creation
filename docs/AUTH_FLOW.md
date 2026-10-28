# Single-user API key auth (Android admin)

Private APK distribution is a **usability** choice, not API security. Write endpoints always require a server-verified key.

## Design

- One trusted user (sister)
- No public registration
- No roles UI / multi-admin dashboard
- Bearer API key → SHA-256 hash stored in D1 `admin_users`
- Plaintext key never stored server-side
- Authorization centralized in Worker (`src/middleware/auth.ts`)

## Provision (you)

```bash
npm run provision:admin:dry-run
npm run provision:admin
```

Outputs:

- Plaintext key → `scripts/generated-api-key.txt` (gitignored)
- Metadata → `scripts/generated-admin-user.json` (gitignored; hash only)

Deliver key via secure channel (password manager share / in person). Never commit. Never put in website JS.

## Android app (minimal unlock)

1. First launch: single “Enter access key” screen
2. Validate non-empty
3. Store in **Android Keystore** / EncryptedSharedPreferences
4. Send `Authorization: Bearer <key>` on every admin request
5. No account management UI beyond “replace key” / logout (clears local key)

## Server verification

1. Parse Bearer token
2. SHA-256 hash
3. `SELECT id FROM admin_users WHERE api_key_hash = ? AND is_active = 1`
4. Update `last_used_at`
5. 401 if missing/invalid/revoked

## Revoke / rotate

```bash
node scripts/provision-admin.mjs --local --revoke <userId>
node scripts/provision-admin.mjs --local   # new key
```

Sister updates key in app. Old key stops working immediately.

## What we intentionally do not build

- OAuth / Cognito / Auth0 (can wrap later behind same middleware)
- Multi-user roles
- Public signup
- Permanent secret baked into APK source as only protection
