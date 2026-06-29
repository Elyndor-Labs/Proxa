# Contributing to Proxa

## Branch Strategy

```
main          ← production, fully protected
  └── dev     ← integration, 1 review required
        ├── feat/escrow-pda
        ├── feat/settlement-ix
        ├── fix/overflow-check
        └── chore/anchor-upgrade
```

### Rules

| Branch | PRs to | Reviews | CI required | Force push |
|---|---|---|---|---|
| `main` | — | 2 approvals | ✅ all checks | ❌ blocked |
| `dev` | `main` | 1 approval | ✅ all checks | ❌ blocked |
| `feat/*` | `dev` | 0 (review on PR) | ✅ build+lint | ✅ allowed |
| `fix/*` | `dev` | 0 | ✅ build+lint | ✅ allowed |
| `chore/*` | `dev` | 0 | ✅ lint | ✅ allowed |

### Branch Naming

```bash
feat/add-settlement-instruction
feat/web-bet-slip-component
fix/escrow-overflow-u64
chore/update-anchor-0.31
docs/oracle-integration-notes
```

## Workflow

```bash
# 1. Always branch from dev
git checkout dev && git pull
git checkout -b feat/your-feature

# 2. Commit with conventional commits
git commit -m "feat(programs): add settle_prop instruction"
git commit -m "fix(keeper): retry logic on rpc timeout"
git commit -m "chore: upgrade anchor to 0.31"

# 3. PR → dev, then dev → main for releases
```

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): short description
fix(scope): short description
chore: short description
docs: short description
test: short description
```

**Scopes:** `programs`, `sdk`, `web`, `keeper`, `scripts`

## PR Checklist

- [ ] Branches from `dev`, targets `dev` (or `main` for releases)
- [ ] Title follows conventional commits format
- [ ] Tests pass locally (`pnpm test`)
- [ ] Anchor programs: `anchor build` clean
- [ ] No `console.log` left in production code
- [ ] Updated relevant docs if architecture changed
