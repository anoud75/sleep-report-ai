# Fix 12 Critical Bugs in Sleep Study Extraction Pipeline

## Overview

The AI extraction pipeline in `supabase/functions/process-sleep-study/index.ts` has 12 confirmed bugs causing null values, NaN outputs, wrong clinical summaries, and truncated AI responses. All bugs are verified against the current code.

## Bug Fixes (in priority order)

### Bug 1: Raw text truncation (Line 1257)

- Change `rawText.substring(0, 20000)` to `rawText.substring(0, 50000)` so the AI can see Body Position data (AHI Supine, Snoring, Leg Movement) which appears at the end of documents.

### Bug 2: AHI Lateral single-side fallback (Lines 1313-1318)

- Replace the current logic that requires BOTH ahiLeft AND ahiRight with logic that handles one side, both sides, or neither.
- Add the same AHI Lateral calculation to the Split-Night path (currently missing entirely) for both offCpap and onCpap phases.

### Bug 3: SWS undefined crash (Line 1306)

- Change `parsed.sleepArchitecture?.stage3Percent !== null` to `typeof parsed.sleepArchitecture?.stage3Percent === 'number'` to prevent `undefined + 0 = NaN`.

### Bug 4: max_tokens too low (Lines 1271 and 1039)

- Regular studies: Change `max_tokens: 2000` to `max_tokens: 4000` (line 1271).
- Split-Night studies: Change `max_tokens: 3000` to `max_tokens: 4000` (line 1039).

### Bug 5: Split-Night missing post-extraction calculations (after line 1091)

Add 4 missing calculations for BOTH offCpap and onCpap:

1. SWS = S3 + S4 (with typeof fix)
2. AHI Lateral with single-side fallback
3. O2 below 90% calculation
4. O2 below 95% calculation

Also add `calculations` sub-object to the Split-Night oxygenation schema in the prompt (lines 994-999 and 1016).

### Bug 6: O2 calculation conflict - prompt vs code (Lines 1158-1159, 1322-1340)

- Remove calculation instructions from the AI prompt; tell AI to extract raw REM/NREM minutes only.
- Change `timeBelow90Percent` and `timeBelow95Percent` in JSON schema to `"CALCULATED - do not extract"`.
- Make the code ALWAYS calculate O2 percentages from raw values (remove the `=== null` guard).

### Bug 7: Diagnostic AHI formatting (Line 646)

- Change `${ahi}` to `${ahi.toFixed(1)}` in the Diagnostic clinical summary.
- &nbsp;

### Bug 10: Duplicate ahiLateral field (Line 1246, Lines 1717-1725)

- Remove `ahiLateral` from the `additionalMetrics` section in the AI prompt JSON schema and the response assembly object.

### Bug 11: O2 TST zero bug (Lines 1325, 1335)

- Change `parsed.oxygenation?.calculations?.tst)` truthy check to `typeof ... === 'number' && ... > 0`.

### Bug 12: Split-Night prompt uses `/* same structure */` (Lines 1013-1018)

- Replace all `/* same structure */` and `/* same structure as offCpap */` comments with the actual full JSON schema for studyInfo, sleepArchitecture, respiratoryEvents, oxygenation, cardiacData, and additionalMetrics.

## Technical Details

### Files Modified

- `supabase/functions/process-sleep-study/index.ts` (all changes in this single file)

### What Is NOT Changed

- No changes to clinical logic, AASM constants, recommendation rules, mask labels, QA cross-validation system, or any other existing behavior outside the 12 specific bugs listed.

### Estimated Lines Changed

- Approximately 15 edit operations across the file, touching ~200 lines total.