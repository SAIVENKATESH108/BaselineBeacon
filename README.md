# BaselineBeacon

A privacy-first **caregiver observation organizer**.

BaselineBeacon helps a caregiver capture a voice note or typed observation, convert it
into **editable structured observations**, compare those observations with a
**user-defined personal baseline**, and view **non-diagnostic repeated changes over time** —
organized so the caregiver can prepare for a conversation with a qualified healthcare professional.

## What this is NOT

BaselineBeacon is **not** a medical device and is not:

- a diagnostic tool
- a treatment or medication recommender
- a disease, risk, severity, or emergency predictor
- a clinical decision-support system
- a replacement for professional medical advice, diagnosis, or care

The product **records and organizes what the caregiver reports**. It does not interpret
health conditions, and it does not generate clinical conclusions.

**This project has not been clinically validated.** No claim of clinical accuracy,
safety, or efficacy is made.

## Safety boundary (summary)

1. AI only extracts information **explicitly stated** in the caregiver's note.
2. Every extracted item must be **reviewed and confirmed by the caregiver** before it is saved.
3. Trends are **rule-based, deterministic**, and every trend links back to the confirmed entries that produced it.
4. No diagnosis, treatment recommendation, risk score, severity score, or emergency prediction — ever.

Full detail: [docs/SAFETY_AND_LIMITATIONS.md](docs/SAFETY_AND_LIMITATIONS.md)

## Features (planned)

- **Capture** — typed note or voice note (transcribed) for one observation entry.
- **Extract** — AI converts the note into structured candidate fields, each shown with its source quote.
- **Review gate** — caregiver edits, deletes, or confirms every field before saving. Nothing is saved unconfirmed.
- **Personal baseline** — caregiver defines what is "usual" for their care recipient, per category.
- **Trends** — deterministic, rule-based summaries of repeated differences vs. baseline, traceable to confirmed entries by ID.
- **Report** — a caregiver-facing, non-diagnostic summary to bring to a healthcare conversation.

## Repository documentation

| Document | Purpose |
|---|---|
| [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) | Scope, user stories, data model, feature requirements |
| [docs/AI_AGENT_RULES.md](docs/AI_AGENT_RULES.md) | Binding rules for AI agents and contributors working in this repo |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack, modules, data flow, where safety rules are enforced |
| [docs/SAFETY_AND_LIMITATIONS.md](docs/SAFETY_AND_LIMITATIONS.md) | Safety boundary, prohibited behaviors, known limitations |
| [docs/DEFINITION_OF_DONE.md](docs/DEFINITION_OF_DONE.md) | What "done" means for features, safety checks, and releases |

## Stack

- TypeScript, Vite
- React, Zustand (state), React Hook Form + Zod (forms/validation)  ← *see Verification Needed*
- Tailwind CSS, Lucide (icons), Recharts (charts), sonner (toasts)
- Supabase (auth + storage)
- Google Gemini (`@google/generative-ai`) for text extraction
- jsPDF (PDF export)

Exact versions: [`package.json`](package.json).

## Getting started

```bash
npm install
cp .env.example .env      # then fill in your values
npm run dev
```

Without a configured `VITE_GEMINI_API_KEY`, extraction falls back to a local mock
(see `src/lib/gemini.ts`) so the app remains demonstrable offline.

## Environment variables

See [`.env.example`](.env.example). Never commit `.env` or real keys.

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous (public) key |
| `VITE_GEMINI_API_KEY` | Google Gemini API key for extraction |

> **Note:** values prefixed `VITE_` are bundled into client-side code and are public
> to anyone using the app. Never place secrets or service-role keys here.

## Scripts

| Script | Command |
|---|---|
| Dev server | `npm run dev` |
| Type-check + build | `npm run build` |
| Preview build | `npm run preview` |

> No lint or test scripts are defined yet — see [docs/DEFINITION_OF_DONE.md](docs/DEFINITION_OF_DONE.md).

## Privacy

- Use only **fictional demo data** in the repository, screenshots, demos, and deployments.
- Never commit API keys, audio recordings, or personal health information.
- Audio storage (if implemented) must be optional, disclosed, and deletable.

Detail: [docs/AI_AGENT_RULES.md](docs/AI_AGENT_RULES.md) §5.

## Project status

Early-stage hackathon project. Planning and governance documents only at this phase.
Not clinically validated. Not a medical device.
