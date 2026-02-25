
# Revert O2 Percentage Extraction to AI-First with Code Fallback

## Overview
Revert Bug 6 changes so the AI extracts `timeBelow90Percent` and `timeBelow95Percent` directly, with server-side calculation as a fallback only when AI returns null.

## Changes (single file: `supabase/functions/process-sleep-study/index.ts`)

### 1. Restore JSON schema fields (4 locations)
Change `"CALCULATED - do not extract"` back to `"number or null"` for both `timeBelow90Percent` and `timeBelow95Percent` at:
- Line 1003-1004 (Split-Night offCpap oxygenation schema)
- Line 1060-1061 (Split-Night onCpap oxygenation schema)
- Line 1339-1340 (Regular study oxygenation schema)

### 2. Restore AI extraction instructions (lines 1273-1274)
Change the current instructions that say "do NOT calculate the percentage yourself" to:
```
- **Oxygen <90%**: Oximetry Distribution "<90" row -> percentage of total sleep time with SpO2 below 90%
- **Oxygen <95%**: Oximetry Distribution "<95" row -> percentage of total sleep time with SpO2 below 95%
```

### 3. Make regular study O2 code a fallback only (lines 1445-1464)
Add null/undefined guards so the calculation only runs when the AI didn't extract the value:
- Wrap the O2 <90% block (lines 1445-1454) with `if (parsed.oxygenation?.timeBelow90Percent === null || parsed.oxygenation?.timeBelow90Percent === undefined)`
- Wrap the O2 <95% block (lines 1456-1464) with `if (parsed.oxygenation?.timeBelow95Percent === null || parsed.oxygenation?.timeBelow95Percent === undefined)`

### 4. Make Split-Night O2 code a fallback only (lines 1182-1202)
Same pattern -- wrap O2 <90% and <95% calculations for each phase with null/undefined guards so they only fire when AI returned null.

## What is NOT changed
- Everything else remains exactly as-is: SWS, AHI Lateral, max_tokens, raw text limit, clinical summaries, QA system, etc.
