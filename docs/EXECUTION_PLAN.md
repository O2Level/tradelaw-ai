# Execution Plan

## Current Phase: MVP Build Loop Approved

The GitHub repository remote has been confirmed and the MVP build loop is approved. Work must continue on `feature/tradelaw-ai-mvp`.

Current repository facts:
1. Working directory: `C:\Users\40621\Documents\Trade Law AI`.
2. Remote: `origin https://github.com/O2Level/tradelaw-ai.git`.
3. Branch: `feature/tradelaw-ai-mvp`.
4. Remote tracking branch: `origin/feature/tradelaw-ai-mvp`.
5. Git push currently uses proxy `http://127.0.0.1:7890`.
6. `docs/product/TradeLawAI-plan.docx` is parseable, so `PLAN_EXTRACT.md` is not required.

## Execution Guardrails

1. Do not commit real API keys, tokens, cookies, or sensitive local configuration.
2. Do not read, copy, or commit contents from `~/.openclaw/openclaw.json`; only record that OpenClaw config exists locally.
3. Product AI configuration must only flow through `.env` and `.env.example`.
4. If OpenClaw is unavailable, continue with the local rules engine.
5. Do not add CRM, credit database, sanctions list, or real chat-platform integrations.
6. Keep the five core loops first: order creation, material import, risk scan, human review, report export.

## Planned Build Loop After Gate Opens

Round 0: Read the plan package, inventory the repository, confirm local and GitHub state, create or confirm the feature branch, and finalize the implementation plan.

Round 1: Scaffold the project, database, ORM, base layout, and CI.

Round 2: Implement data models for orders, materials, rules, risks, reviews, evidence, reports, and audit logs.

Round 3: Implement at least 25 seed rules and the local rules engine, including `R-PAY-001`.

Round 4: Implement field extraction and stable text material import.

Round 5: Implement order space, risk scanning, and risk report pages.

Round 6: Implement human review, audit logs, and evidence timeline.

Round 7: Implement four real PDF report exports.

Round 8: Implement three demo cases and one-click import.

Round 9: Implement the OpenClaw provider adapter with local rules fallback.

Round 10: Add unit tests, E2E tests, CI, and QA scripts.

Round 11: Polish UI, compliance copy, screenshots, and delivery docs.

Round 12: Run final acceptance, fix failures, prepare or create the GitHub PR, and write final handoff.

## Required Quality Gates Per Build Round

When the build loop begins, each round must run:

```bash
npm run lint
npm run test
npm run build
```

After Round 8, each round must also run:

```bash
npm run e2e
npm run qa
```

Failures must be fixed before moving to the next round. Passing status must not be claimed without fresh command output.
