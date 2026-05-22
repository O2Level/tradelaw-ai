# Assumptions

## Repository State Assumptions

1. The current working directory is `C:\Users\40621\Documents\Trade Law AI`.
2. This directory was not a Git repository when checked at the start of setup.
3. A local Git repository has been initialized here so the requested planning files can be tracked.
4. The active branch is `feature/tradelaw-ai-mvp`.
5. No GitHub remote is configured yet, so this directory is not confirmed as the intended GitHub clone.
6. Until a GitHub remote is configured and push access is verified, this repository must remain in documentation and planning mode only.

## Tooling Assumptions

1. `node`, `npm`, `python`, and `git` are available locally.
2. `gh` is not available in the current shell, so GitHub CLI authentication and PR creation cannot currently be verified through `gh`.
3. The GitHub connector may be available through Codex tooling, but no repository full name has been confirmed yet.
4. Superpowers skill files are available under the local Codex plugin cache; the `superpowers` command was not found and `sp help` did not return a usable Superpowers CLI help page in this shell.

## Product Planning Assumptions

1. The MVP should prioritize a real local rules engine and database-backed workflow before optional AI enhancement.
2. The product build should use TypeScript, Next.js, SQLite, Prisma, Vitest, and Playwright unless the confirmed GitHub repository already contains a different stack.
3. The formal MVP build loop must not begin until the GitHub source-of-truth location is confirmed.

