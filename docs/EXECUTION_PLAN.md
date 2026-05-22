# Execution Plan

## Current Phase: Repository Verification Gate

The product build loop is paused until the GitHub repository remote is confirmed.

Current priorities:
1. Confirm whether `C:\Users\40621\Documents\Trade Law AI` is the intended GitHub project directory.
2. Keep work limited to repository validation and planning documents if the directory is not a GitHub clone.
3. Maintain the required branch name: `feature/tradelaw-ai-mvp`.
4. Do not start large-scale product coding until a GitHub remote is configured and push readiness is verified.

## Gate To Start MVP Build

The formal MVP build loop may start only after all of the following are true:

1. `git remote -v` shows the intended GitHub repository.
2. The current branch is `feature/tradelaw-ai-mvp`.
3. Push access is verified either through Git credentials, GitHub CLI, or the GitHub connector.
4. `docs/product/TradeLawAI-plan.docx` remains present in the repository.

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

