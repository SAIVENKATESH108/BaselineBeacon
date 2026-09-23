# BaselineBeacon — Definition of Done

A feature is done only when every applicable box below is checked by the person who
built it, with the evidence named. No box → not done.

## 1. Global (applies to every change)

- [ ] `npm run build` (includes `tsc`) passes — command and output reported.
- [ ] No new dependency added without stating purpose + license in the PR/summary.
- [ ] No secrets, `.env`, audio, or real personal health data in any commit.
- [ ] Only fictional data in fixtures, seeds, screenshots, and demos.
- [ ] Changed files listed; assumptions and open issues stated.
- [ ] No test or lint result claimed unless actually executed.

## 2. Feature DoD

### F1 — Capture
- [ ] Typed note saved as `rawText` with the caregiver's timestamp.
- [ ] Voice transcript editable before extraction; raw audio handling per PRODUCT_SPEC §9.2.
- [ ] Audio discarded after transcription when no longer needed (or explicitly retained with disclosure).
- [ ] Works without an API key.

### F2 — Extract
- [ ] Every field carries an exact source quote from the note.
- [ ] No field exists that is not supported by its quote (spot-check on 3 notes, quoted).
- [ ] Failure path tested: bad key / network error → fallback, no crash, no auto-save.
- [ ] Prompt contains §2 prohibitions from AI_AGENT_RULES.md (prompt text shown).

### F3 — Review gate
- [ ] Save blocked until every field is confirmed or deleted (verified by test/manual run).
- [ ] `caregiverConfirmed` flips only on explicit caregiver action (no code path sets it otherwise — grep evidence).
- [ ] Edit and delete both reachable for each field in the UI.

### F4 — Personal baseline
- [ ] Labeled as caregiver-defined "usual", not a reference range (copy shown).
- [ ] Editing the baseline does not modify confirmed observations (verified).

### F5 — Trends
- [ ] Output is deterministic: same inputs → same output (run twice, compared).
- [ ] Minimum-evidence rule enforced (≥ 2 confirmed entries, same direction, or recorded incident).
- [ ] Each insight links its source observation IDs; click-through verified.
- [ ] Wording passes AI_AGENT_RULES §2 allowed/prohibited lists (word-by-word check).
- [ ] No language model generates trend text (code inspection).

### F6 — Report / export
- [ ] Built only from confirmed entries + baseline snapshot.
- [ ] Disclaimer from SAFETY_AND_LIMITATIONS §7 present on the export.
- [ ] Export preview inspected visually.

## 3. Safety DoD (hard gate — blocks merge/demo regardless of other checks)

- [ ] No diagnosis, treatment recommendation, or risk/severity/emergency prediction in
      UI, prompts, exports, or copy — searched for the §3 prohibited terms.
- [ ] No claim of clinical validation anywhere (grep: "validated", "clinically").
- [ ] Every trend statement traceable to confirmed entry IDs.
- [ ] Mandatory review gate intact for all save paths.
- [ ] Docs updated if behavior changed (§4).

## 4. Documentation DoD

- [ ] Changed behavior reflected in PRODUCT_SPEC.md / ARCHITECTURE.md as applicable.
- [ ] `.env.example` updated when a new variable is introduced (name + purpose comment).
- [ ] Safety-relevant changes reflected in SAFETY_AND_LIMITATIONS.md.
- [ ] Open items marked **Verification Needed** rather than answered from memory.

## 5. Release / demo DoD

- [ ] Safety DoD (§3) fully checked.
- [ ] Demo data fictional; demo checklist in SAFETY_AND_LIMITATIONS §9 completed.
- [ ] `npm run build` output is what will be shown/deployed.
- [ ] Disclaimers visible in first 10 seconds of any demo video.
- [ ] Explicit verbal statement: *not clinically validated; not a medical device.*
- [ ] Deployment environment variables reviewed — nothing secret with a `VITE_` prefix.

## 6. Explicit non-goals

These are **not** required — and must not be added:

- Diagnostic, predictive, or risk features of any kind
- Clinical accuracy metrics or sensitivity/specificity claims
- Regulatory, HIPAA, or GDPR compliance claims without real assessment
- Anything that weakens the review gate "for convenience"

---

### Verification Needed

- No lint or test script currently exists in `package.json` (`npm run lint`,
  `npm test` are undefined). Decide on tooling (e.g., ESLint, Vitest) before these
  checkboxes reference it; until then, boxes marked "test" require a named manual
  procedure instead.
