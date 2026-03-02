# Guardrails (Signs)

> Lessons learned from failures. Read before acting.

## Core Signs

### Sign: Read Before Writing
- **Trigger**: Before modifying any file
- **Instruction**: Read the file first
- **Added after**: Core principle

### Sign: Test Before Commit
- **Trigger**: Before committing changes
- **Instruction**: Run required tests and verify outputs
- **Added after**: Core principle

---

## Learned Signs


### Sign: Differentiate Baseline Lint Noise
- **Trigger**: When `npm run lint` fails during story work
- **Instruction**: Separate pre-existing lint failures from story-impacting files and only fix lint issues in scope for the selected story
- **Added after**: Iteration 2 - repeated unrelated ESLint failures blocked clean lint gate

### Sign: Record Baseline Lint Repeat
- **Trigger**: When the same unrelated lint failures repeat in a later iteration
- **Instruction**: Append the repeated failure details to `.ralph/errors.log` and explicitly note whether current story files are unaffected
- **Added after**: Iteration 3 - baseline lint errors repeated with no overlap to US-003 files
