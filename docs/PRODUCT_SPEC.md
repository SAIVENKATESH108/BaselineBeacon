# BaselineBeacon — Product Specification

**Status:** draft · **Non-diagnostic product** · See [SAFETY_AND_LIMITATIONS.md](SAFETY_AND_LIMITATIONS.md)

## 1. Purpose

BaselineBeacon organizes caregiver observations. It turns a caregiver's voice or typed
note into structured, editable records, compares those records against a baseline the
**user themselves defined**, and shows repeated differences over time in plain,
non-diagnostic language.

## 2. Users

| User | Description |
|---|---|
| **Caregiver (primary)** | Records observations about a person they care for; reviews and confirms all extracted data; defines the baseline. |
| **Care recipient** | The person being observed. Not a direct user in v1. |
| **Healthcare professional** | Recipient of a caregiver-generated summary. Does not use the app in v1. |

## 3. Glossary

| Term | Meaning |
|---|---|
| **Observation entry** | One saved caregiver note plus its confirmed structured fields. |
| **Extracted field** | A candidate item produced by AI from the note. Unconfirmed until the caregiver confirms it. |
| **Personal baseline** | Caregiver-defined description of what is *usual* for a category. Not a medical reference range. |
| **Trend insight** | A deterministic, rule-based statement about repeated differences across confirmed entries, each linked to source entry IDs. |
| **Review gate** | The mandatory step where the caregiver edits/deletes/confirms every extracted field before saving. |
| **Demo mode** | Local, fictional sample data; no real people, no real health data. |

## 4. In-scope user stories

1. As a caregiver, I can type a note about what I observed today.
2. As a caregiver, I can dictate a voice note and receive a transcript for editing.
3. As a caregiver, I can see each AI-extracted item **next to the exact quote from my note** that supports it.
4. As a caregiver, I must confirm or edit every extracted item before anything is saved.
5. As a caregiver, I can define and update a personal baseline per category.
6. As a caregiver, I can see plain-language statements about repeated differences from my baseline, each linking to the confirmed entries behind it.
7. As a caregiver, I can export a non-diagnostic summary to bring to a conversation with a healthcare professional.
8. As a caregiver, I can switch to demo mode with fictional data.

## 5. Data model

> Proposed — aligns with `src/types/index.ts`. Schema is not implemented yet.

### CareRecipient
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| userId | string | owner caregiver |
| name | string | fictional in demos |
| dateOfBirth | string? | optional |
| relationship | string | caregiver's relationship |
| primaryConditions | string[]? | free text the caregiver entered; never interpreted |
| createdAt / updatedAt | string | ISO timestamps |

### BaselineEntry
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| careRecipientId | string | FK |
| category | enum | `sleep, appetite, mood, mobility, cognition, pain, hydration, bowel_bladder, social, medication, other` |
| field / value / unit | string | caregiver-authored description of "usual" |
| notes | string? | |
| capturedAt / updatedAt | string | |

### Observation
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| careRecipientId / caregiverId | string | FKs |
| rawText | string | original note |
| voiceTranscript | string? | transcript prior to editing |
| extractedFields | ExtractedField[] | only confirmed fields persist |
| severity | enum? | `routine \| noteworthy \| incident` — **caregiver-assigned label, not a clinical severity rating** |
| observedAt / createdAt | string | |
| isDemo | boolean | demo-data flag |

### ExtractedField
| Field | Type | Notes |
|---|---|---|
| category | enum | same as baseline |
| field | string | snake_case name |
| value / unit | string | verbatim/near-verbatim from the note |
| sourceQuote | string? | **required for AI-sourced fields** — supporting text from the note |
| caregiverConfirmed | boolean | must be `true` before persistence |
| differentFromBaseline | boolean? | computed, not inferred medically |
| notes | string? | |

### Report
Generated snapshot: date range, included observation IDs, baseline snapshot,
caregiver-editable markdown summary, optional time-limited share token.

## 6. Feature specifications

### F1 — Capture
- Accept typed text ≥ 1 character, or voice recording → transcript.
- Voice path: user can edit the transcript before extraction runs.
- Audio file is optional, disclosed, and deletable after transcription.

### F2 — Extract (AI)
- **Only** information explicitly present in the note may be extracted.
- Unsupported items → omitted, never inferred or filled from medical knowledge.
- Output limited to the fixed category set; each item carries a source quote.
- Failure or missing API key → local mock/no-op; extraction failure never blocks manual entry.

### F3 — Review gate (mandatory)
- Extraction output is a **draft**, never a saved record.
- Per field the caregiver can: edit, delete, or confirm.
- Save is blocked until every remaining field is explicitly confirmed or deleted.
- `caregiverConfirmed = true` is set only by the caregiver's action.

### F4 — Personal baseline
- Caregiver-authored, per category, editable at any time.
- Labeled as "your description of what is usual" — **not** a medical or population reference range.
- Changing the baseline does not retroactively alter confirmed observations.

### F5 — Trends (rule-based only)
- Deterministic functions over confirmed observations only.
- Minimum evidence: same direction of difference in ≥ 2 confirmed entries,
  or a caregiver-recorded incident entry.
- Output vocabulary limited to the allowed wording in [AI_AGENT_RULES.md](AI_AGENT_RULES.md) §2.
- Every insight displays its contributing observation IDs (traceability).
- Prohibited: scores, percentages, risk/severity language, urgency, predictions,
  disease names, "normal/abnormal", "detected".

### F6 — Report / export
- Composed of confirmed observations + baseline snapshot only.
- Every statement traceable to entry IDs; caregiver can edit before export.
- Fixed disclaimer footer (text in SAFETY_AND_LIMITATIONS.md §7).

## 7. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-1 | No diagnosis, treatment recommendation, or risk/severity/emergency prediction anywhere in UI, prompts, or exports. |
| NFR-2 | No personal health data or secrets in the repo; demo data fictional only. |
| NFR-3 | Every trend statement resolvable to confirmed entry IDs. |
| NFR-4 | Extraction must fail safe: on error, allow manual entry; never auto-save unreviewed output. |
| NFR-5 | Type-check (`tsc`) passes on main. |
| NFR-6 | Core flow usable with no `VITE_GEMINI_API_KEY` (mock path). |

## 8. Out of scope (v1)

- Any diagnostic, predictive, or risk feature.
- Treatment, medication, dosage, or care-action suggestions.
- Emergency detection or alerts; triage; "call your doctor" automation.
- Clinician dashboard or clinical documentation integration.
- Population norms, reference ranges, or "normal for age" comparisons.
- Sharing audio or notes with third parties beyond the caregiver's own export.
- Mobile-native apps; multi-tenant organizations.

## 9. Open questions

1. Voice transcription: browser Web Speech API, Supabase/edge function, or Gemini audio input? *(Verification Needed — see below)*
2. Is raw audio persisted, or only the transcript? Default proposal: **transcript only**, audio discarded.
3. Report share links: needed for v1, or local PDF export only?
4. Do `severity` labels need renaming (e.g., `entryType`) to avoid any clinical reading? *(proposal: rename — pending review)*

---

### Verification Needed

- **Category/type alignment:** confirm final enum against `src/types/index.ts` before any schema work.
- **Transcription capability:** confirm the chosen provider's supported audio formats, limits, and pricing from official docs before F1 voice work.
- **Supabase specifics** (auth method, RLS, table names): verify against official Supabase docs — not yet designed.
- **PDF/export wording:** disclaimer footer text needs a final legal/safety pass; this document does not provide legally reviewed language.
