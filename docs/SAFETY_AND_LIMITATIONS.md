# BaselineBeacon — Safety and Limitations

Read before implementing, demoing, or deploying anything in this repository.

## 1. What this product is

BaselineBeacon is a **caregiver observation organizer**: a notebook that structures
what a caregiver reports, compares it to a baseline the caregiver themselves defined,
and shows repeated differences in plain language.

## 2. What this product is not

It is **not** a medical device and is not intended to:

- Diagnose any condition, disease, or syndrome
- Recommend treatment, medication, dosage, or any care action
- Predict disease, risk, severity, deterioration, or emergencies
- Triage, alert, or decide when to seek care
- Support clinical decision-making
- Replace professional medical advice, diagnosis, or treatment

**This project has not been clinically validated.** No accuracy, safety, or efficacy
claim is made, and none may be implied in UI, prompts, docs, demos, or submissions.

## 3. Prohibited behaviors (hard rules)

The application, its prompts, and its output must never:

1. Name a disease, condition, or infection as a conclusion (user-typed terms are stored
   verbatim as the user's own words, never interpreted or echoed back as findings).
2. Assign any score: risk, severity, health, likelihood, confidence, or percentage.
3. Use "normal / abnormal", "safe / unsafe", "urgent / emergency", "detected", "screened".
4. Recommend, suggest, or imply any treatment, medication, or care action.
5. Predict future outcomes or label anything as deterioration or decline.
6. Save an AI-extracted item without explicit caregiver confirmation.
7. Present a trend without its contributing confirmed entry IDs.

## 4. AI limitations

- Extraction reflects **only what the caregiver wrote**. It adds no knowledge and no judgment.
- The model can mis-transcribe, mis-group, or omit content. Quotes let the caregiver catch this.
- The caregiver's review is the **control**, not a formality: the product must make
  editing/deleting easy, and must never bulk-confirm on the caregiver's behalf.
- Extraction failures must degrade to manual entry, never to guessed output.
- The baseline is provided as context to the model for comparison of stated values only;
  it does not make any output clinical.

## 5. Trend limitations

- Trends are computed by deterministic rules from **confirmed entries only**.
- Small samples produce misleading shapes; minimum-evidence rules (≥ 2 entries same
  direction) reduce but do not eliminate this.
- "Different from usual" means *different from the caregiver's own baseline description* —
  not medically abnormal, and possibly explained by environment, routine, or reporting changes.
- Trends describe recorded data, not the care recipient's health.

## 6. Privacy limitations

- `VITE_*` values ship in the client bundle: treat them as public. No secrets in `.env`
  entries prefixed `VITE_`.
- Audio, if stored, is sensitive; it must be opt-in, disclosed, and deletable.
- Repo, screenshots, and demos contain fictional data only.
- This is not a compliance certification; no HIPAA/GDPR/medical-device posture is claimed.

## 7. Required display text

**In the product UI (footer or persistent notice):**

> Caregiver-reported observations only. This app does not diagnose, recommend treatment,
> or predict health outcomes. It has not been clinically validated. For medical concerns,
> contact a qualified healthcare professional.

**On every exported report:**

> Summary of caregiver-reported observations, compared against a caregiver-defined
> baseline. Non-diagnostic. Not clinically validated. Does not replace professional
> medical advice.

**Escalation wording (if any "what should I do" moment is ever designed):**

> If you are worried about someone's safety or think this may be an emergency, contact
> your local emergency services or a qualified healthcare professional.

*This wording is a starting point, not legally reviewed language.*

## 8. Known limitations / failure modes

| # | Limitation / failure | Current handling |
|---|---|---|
| L1 | No API key / extraction error | Mock or manual entry; never auto-save |
| L2 | Mis-transcribed voice | Transcript editable before extraction |
| L3 | Wrong extraction | Per-field edit/delete before confirmation |
| L4 | Thin baseline / few entries | "Not enough information was recorded" |
| L5 | Baseline edited mid-stream | Confirmed entries unchanged; change not applied retroactively |
| L6 | Data loss / sync error | Fail safe: preserve draft, no partial silent writes |
| L7 | Caregiver treats output as medical advice | Persistent disclaimer (§7) |
| L8 | Client-side API key exposure | See ARCHITECTURE Verification Needed |

## 9. Safe demo checklist

- [ ] Data fictional; no real names or health details.
- [ ] Disclaimers (§7) visible in UI and export.
- [ ] No prohibited wording (§3) anywhere on screen or in export.
- [ ] Review gate demonstrated: edit/delete an extracted item live.
- [ ] Every trend shown displays its source entry IDs.
- [ ] Statement made explicitly: *"not clinically validated; not a medical device."*
