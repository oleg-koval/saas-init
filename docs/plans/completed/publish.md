# npm publish CI for saas-init

## model: claude-haiku-4-5-20251001

3 tasks. Run in order.

---

## task-001: ci-workflow

Create `.github/workflows/ci.yml` — runs on every push and PR to main:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: ['*']

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Test
        run: npm test

  anti-slop:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: anti-slop
        uses: peakoss/anti-slop@v0.2.1
```

Verify: file exists, valid YAML.

---

## task-002: publish-workflow

Create `.github/workflows/publish.yml` — triggers only on version tags (`v*`).
Runs tests first, then publishes to npm. Uses `NPM_TOKEN` secret.

```yaml
name: Publish

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    name: Publish to npm
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Test
        run: npm test

      - name: Publish
        run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Verify: file exists, valid YAML.

---

## task-003: git-commit

1. Check if `.gitignore` exists. Ensure `dist/` and `node_modules/` are ignored.

2. Stage and commit all new workflow files:
   ```
   git add .github/ .gitignore
   git commit -m "ci: add CI test workflow and npm publish on tag"
   ```

Verify: `git status` clean, `git log --oneline -3` shows the commit.
