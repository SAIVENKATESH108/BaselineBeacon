# BaselineBeacon AI Agent Rules

Binding for every AI agent and human contributor working in this repository.
When this file conflicts with convenience, this file wins.

## 1. Product purpose

BaselineBeacon is a caregiver observation organizer. It helps a caregiver:

- Record a voice note or typed note.
- Convert the note into editable structured observations.
- Compare confirmed observations to a user-defined personal baseline.
- View repeated observations over time.
- Create a non-diagnostic summary for a healthcare conversation.

## 2. Medical safety boundary

This product is **not** a medical device, diagnosis tool, treatment tool, emergency
service, clinical decision-support system, or a replacement for professional medical
advice.

**The product must never:**

- Diagnose, infer, predict, or claim any disease or medical condition.
- Use labels such as UTI, infection, stroke, dehydration, dementia decline, depression,
  fall risk, or medication adherence — unless those words were explicitly typed by the
  user as their own context, in which case they are stored verbatim and never interpreted.
- Recommend a treatment, medication, dosage, or care action.
- Assign a health score, risk score, likelihood percentage, severity score, or clinical confidence.
- Say "safe," "unsafe," "urgent," "emergency," "normal," "abnormal," "detected," or "screened."
- Imply clinical validation, medical accuracy, or regulatory clearance.

**Allowed wording:**

- "Caregiver-reported observation"
- "Different from usual"
- "Reported more often in recent entries"
- "This summary may support a conversation with a qualified healthcare professional"
- "No observation was recorded"
- "Not enough information was recorded"

## 3. Extraction policy

AI extraction may only capture facts **explicitly present** in the caregiver's note.

If an item is not explicitly stated:

- Do not include it.
- Do not infer it.
- Do not use medical knowledge to fill gaps.
- Do not "flag" anything as concerning.

Every extracted item must include:

- Category (from the fixed enum)
- Value (verbatim or near-verbatim from the note)
- Exact supporting source quote
- Whether the caregiver has confirmed it

The caregiver must review and edit every AI extraction before it is saved.
`caregiverConfirmed` may only become `true` through an explicit caregiver action —
never programmatically, never by default, never by timeout.

**Prompt rules:** any prompt shipped in this repo must contain the prohibitions in §2
and must request source quotes. Prompt changes are subject to §6 review.

## 4. Trend policy

Trend insights must be deterministic and rule-based — plain code over confirmed data,
not model output.

An insight may be created only if:

- The same direction of difference appears in at least two confirmed entries, or
- The caregiver explicitly recorded a fall or incident as an entry.

Every trend insight must include the source observation IDs.

Never call an insight a diagnosis, risk, warning, severity rating, or clinical finding.
Never generate trend text with a language model; templates only.

## 5. Privacy policy

- Use only fictional demo data in the repository, screenshots, demo video, and public deployment.
- Never commit API keys, audio recordings, or personal health data.
- `.env` files are ignored; only `.env.example` is committed.
- Client-bundle variables (`VITE_*`) are public; never put secrets there.
- Audio storage must be optional and clearly disclosed; delete audio after transcription when it is no longer needed.
- Explain what is stored and why, in the product UI.

## 6. Development policy

Before modifying code, the agent must:

1. State the goal.
2. List files it will create or change.
3. Identify dependencies it will add.
4. Explain how it will test the change.
5. Wait for approval for non-trivial architectural changes.

After modifying code, the agent must:

1. Run the relevant type-check, lint, and test commands.
2. Report exact commands run and results.
3. Report changed files.
4. Identify any assumptions and unresolved issues.
5. Never claim a test passed if it was not executed.

Any change touching extraction prompts, trend logic, safety copy, or exports additionally
requires checking [SAFETY_AND_LIMITATIONS.md](SAFETY_AND_LIMITATIONS.md) and
[DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md) §Safety.

## 7. No invented facts

The agent must not invent:

- API capabilities, pricing, or rate limits
- Package APIs or model names
- Competitor claims
- Medical statistics or research citations
- File contents or test results

When uncertain, write:

> "Needs verification from official documentation."

## 8. Scope control

- Do not create source code, migrations, or install dependencies unless the task explicitly asks for it.
- Do not claim the project is clinically validated, medically accurate, or regulator-cleared — under any circumstances.
