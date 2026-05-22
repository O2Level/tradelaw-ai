# AGENTS.md

This repository is governed by `docs/CODEX_MISSION.md`.

## Language

All user-facing replies must be written in Chinese by default unless the user explicitly asks for another language.
This includes progress updates, status messages, plan updates, tool-running explanations, final answers, and handoff notes.
English is allowed only for code, commands, file paths, API names, branch names, package names, quoted error messages, or text the user explicitly asks to keep in English.

## Current Execution Gate

Do not enter the formal TradeLaw AI MVP build loop until the GitHub repository remote is confirmed.

As of the current repository check:
- The working directory is `C:\Users\40621\Documents\Trade Law AI`.
- Local git has been initialized.
- The active branch is `feature/tradelaw-ai-mvp`.
- No GitHub remote is configured yet.
- GitHub CLI (`gh`) is not available in this environment.

## Agent Rules

1. Read `docs/CODEX_MISSION.md` before planning or coding.
2. Read `docs/ASSUMPTIONS.md` before making implementation decisions.
3. Follow `docs/EXECUTION_PLAN.md` for the staged execution approach.
4. Do not commit real API keys or secrets.
5. Do not claim GitHub push or PR readiness unless a remote exists and authentication is verified.
6. Before the MVP build loop starts, limit work to repository validation, planning, and documentation.
