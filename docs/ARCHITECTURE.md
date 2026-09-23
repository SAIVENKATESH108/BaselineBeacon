# BaselineBeacon — Architecture

**Status:** proposed, derived from the existing scaffold. No application code is
specified or created by this document.

## 1. Stack

| Layer | Choice | Source |
|---|---|---|
| Language / build | TypeScript ~6.0.2, Vite ^8.3.0 | `package.json` |
| UI | React (via `react-router-dom`, `react-hook-form`) | `package.json` |
| State | Zustand (`src/store/`) | `package.json` |
| Validation | Zod + `@hookform/resolvers` | `package.json` |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) | `package.json` |
| Backend | Supabase (`@supabase/supabase-js`) — auth + storage | `package.json`, `src/lib/supabase.ts` |
| AI extraction | Google Gemini (`@google/generative-ai`) | `package.json`, `src/lib/gemini.ts` |
| Charts / export | Recharts, jsPDF + jspdf-autotable | `package.json`, `src/lib/pdfExport.ts` |
| Feedback | sonner | `package.json` |

## 2. High-level diagram

```
Caregiver
   │  voice / typed note
   ▼
┌─────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│  Capture (UI)    │───▶│  Extraction service   │───▶│  Review gate (UI)     │
│  edit transcript │    │  Gemini or local mock │    │  edit / delete /      │
└─────────────────┘    └──────────────────────┘    │  confirm each field   │
                                                   └──────────┬───────────┘
                                                              │ caregiverConfirmed = true
                                                              ▼
┌─────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│  Report / export │◀──│  Trend engine (rules)  │◀──│  Observation store    │
│  PDF / summary   │    │  deterministic code    │    │  confirmed entries    │
└─────────────────┘    └──────────────────────┘    └──────────────────────┘
                                   ▲                          │
                                   │                          ▼
                        ┌──────────────────────┐   ┌──────────────────────┐
                        │  Personal baseline    │   │  Supabase (opt.)      │
                        │  caregiver-authored   │   │  auth + storage       │
                        └──────────────────────┘   └──────────────────────┘
```

## 3. Module map (existing files)

| Path | Responsibility |
|---|---|
| `src/main.ts`, `index.html` | entry |
| `src/lib/gemini.ts` | extraction; mock fallback when no API key |
| `src/lib/supabase.ts` | Supabase client |
| `src/lib/validators.ts` | Zod schemas |
| `src/lib/pdfExport.ts` | PDF/report export |
| `src/lib/utils.ts` | helpers |
| `src/store/demoStore.ts` | demo-mode state |
| `src/hooks/useAuth.ts` | auth hook |
| `src/types/index.ts` | shared domain types |
| `docs/` | governance documents (this set) |

## 4. Data flow (six stages)

1. **Capture** — note entered; transcript (if voice) is editable by the caregiver.
2. **Extract** — `extractObservationFields(rawText, baseline)` returns draft fields,
   each with `caregiverConfirmed: false` and a source quote.
3. **Review gate** — UI requires explicit per-field caregiver action.
   *Nothing persists before this stage.*
4. **Persist** — only confirmed entries are written (Supabase, or local/demo store).
5. **Trend** — deterministic functions compare confirmed entries against the baseline;
   output is template text + source observation IDs.
6. **Report** — snapshot of confirmed entries + baseline; caregiver edits; export.

**Invariant:** stages 2 and 5 have no write access to confirmed data.

## 5. State management

- Zustand store holds: demo flag, current recipient, baseline, observations, loading states.
- Draft extraction output lives in transient state and must be cleared on cancel/navigation.
- Persistence boundary: an observation is written only via a helper that checks every
  field has `caregiverConfirmed === true`.

## 6. Environment & configuration

Defined in `.env.example`:

| Variable | Consumed by | Exposure |
|---|---|---|
| `VITE_SUPABASE_URL` | `src/lib/supabase.ts` | client bundle (public) |
| `VITE_SUPABASE_ANON_KEY` | `src/lib/supabase.ts` | client bundle (public) |
| `VITE_GEMINI_API_KEY` | `src/lib/gemini.ts` | client bundle — **see Verification Needed** |

No server or edge functions exist yet. Adding any server-side component changes this
document's threat model and requires Supabase RLS design first.

## 7. Where safety rules are enforced

| Rule | Enforcement point | Layer |
|---|---|---|
| Extract only stated facts | extraction prompt + post-parse filtering | `src/lib/gemini.ts` |
| Mandatory review | save-path confirmation check | store/persistence layer |
| Trends rule-based + traceable | trend engine templates + source ID list | new `src/lib/` trend module |
| No diagnosis/treatment wording | prompt, UI copy, report footer | all layers + docs |
| Fail safe on AI error | mock/manual fallback, never auto-save | `src/lib/gemini.ts` |

Rules enforced only in a prompt are **not** enforceable — each must also exist in code
or UI. This is a required property of any future implementation.

## 8. Extension points (not commitments)

- Transcription provider (see PRODUCT_SPEC §9.1).
- Optional audio storage in Supabase Storage, opt-in only.
- Server-side extraction proxy (would remove the client-side API key).

---

### Verification Needed

- **`VITE_GEMINI_API_KEY` exposure:** a client-bundled Gemini key is readable by any
  user of a public deployment. Verify current Google guidance on client-side key
  restrictions before any public deploy; prefer a server proxy. Check official
  Google AI / Gemini documentation.
- **`@google/generative-ai` package status and model ID:** confirm the supported SDK
  package and current model names from official Google documentation — model IDs and
  SDK packages change and must not be assumed.
- **Supabase auth/RLS/table design:** not yet specified; verify against official
  Supabase documentation before schema work.
- **React version:** `package.json` lists `react-router-dom` / `react-hook-form` but the
  direct `react`/`react-dom` dependency was not confirmed — verify with `npm ls react`
  before writing UI code.
