# Stridey

Running app for general runners. Android first, iOS later.

## Status
- Design phase: in progress (6/12 onboarding screens complete)
- Code scaffold: not yet started

## Stack
- React Native + Expo + TypeScript
- Supabase backend
- Android primary, iOS secondary

## Project structure
- `docs/` — project documentation, decisions log, database schema
- `design/exports/` — canonical PDF exports from Claude Design (one per screen)
- `design/references/` — competitor screenshots used as design references
- (app code arrives when Expo scaffolds)

## Repo discipline
- One commit per completed design screen (or code step)
- Push to remote before starting the next step
- Commit messages follow: `design(screen-N): short description` or `feat: ...`, `fix: ...`, `docs: ...`
