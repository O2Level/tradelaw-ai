# Assumptions

## Repository State Assumptions

1. The current working directory is `C:\Users\40621\Documents\Trade Law AI`.
2. This directory was not a Git repository when checked at the start of setup.
3. A local Git repository has been initialized here so the requested planning files can be tracked.
4. The active branch is `feature/tradelaw-ai-mvp`.
5. The GitHub remote is `origin https://github.com/O2Level/tradelaw-ai.git`.
6. The feature branch has been pushed and tracks `origin/feature/tradelaw-ai-mvp`.
7. Local Git push currently depends on the Git proxy configuration `http://127.0.0.1:7890`.

## Tooling Assumptions

1. `node`, `npm`, `python`, and `git` are available locally.
2. `gh` is not available in the current shell, so GitHub CLI authentication and PR creation cannot currently be verified through `gh`.
3. The Codex GitHub connector can access `O2Level/tradelaw-ai`; local Git remains the source for commits and pushes unless local push is blocked.
4. Superpowers skill files are available under the local Codex plugin cache; the `superpowers` command was not found and `sp help` resolved to a PowerShell alias, not a usable Superpowers CLI.
5. When the Superpowers CLI is unavailable, this project will use the local Codex Superpowers skills and record the actual skills used in `docs/SUPERPOWERS_USAGE.md`.
6. `docs/product/TradeLawAI-plan.docx` is parseable, so `docs/product/PLAN_EXTRACT.md` is not needed.

## Product Planning Assumptions

1. The MVP should prioritize a real local rules engine and database-backed workflow before optional AI enhancement.
2. The product build should use TypeScript, Next.js, SQLite, Prisma, Vitest, and Playwright unless the confirmed GitHub repository already contains a different stack.
3. OpenClaw may be present on the local machine, but product code may only access AI configuration through `.env` variables: `AI_PROVIDER`, `OPENCLAW_BASE_URL`, `OPENCLAW_API_KEY`, and `OPENCLAW_MODEL`.
4. The project must not read, copy, commit, or summarize sensitive contents from `~/.openclaw/openclaw.json`; its existence can only be recorded as a local capability signal.
5. OpenClaw failure must not block the MVP. The local rules engine must complete core risk analysis without model access.
