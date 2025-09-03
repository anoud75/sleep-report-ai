import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Format oxygen percentage to show exact values
const formatOxygenPercentage = (percentage) => {
  // If both REM + NREM are blank → Output: "None"
  if (percentage === null || percentage === undefined) {
    return "None";
  }
  
  // Always show exact percentage with 1 decimal place
  return `${percentage.toFixed(1)}%`;
};

// Mask types and sizes for clinical data reference
const maskTypes = [
  { value: 'resmed_airfit_f20', label: 'Resmed AirFit F20 Full Face mask' },
  { value: 'resmed_airfit_n20', label: 'Resmed AirFit N20 Nasal mask' },
  { value: 'resmed_airfit_n30', label: 'Resmed AirFit N30 Nasal Pillows' },
  { value: 'resmed_airfit_f10', label: 'Resmed AirFit F10 Full Face mask' },
  { value: 'nonvented_resmed_full_face', label: 'NONVENTED RESMED FULL FACE MASK' },
  { value: 'amara_gel_full_face', label: 'AMARA GEL FULL FACE MASK' },
  { value: 'amara_full_face', label: 'AMARA FULL FACE MASK' },
  { value: 'amara_view_full_face', label: 'AMARA VIEW FULL FACE MASK' },
  { value: 'comfort_gel_blue_full_face', label: 'COMFORT GEL BLUE FULL FACE' },
  { value: 'comfortgel_nasal', label: 'COMFORTGEL NASAL MASK' },
  { value: 'dreamwear_full_face', label: 'DREAMWEAR FULL FACE MASK' },
  { value: 'dreamwear_gel_nasal_pillow', label: 'DREAMWEAR GEL NASAL PILLOW' },
  { value: 'dreamwear_nasal', label: 'DREAMWEAR NASAL MASK' },
  { value: 'true_blue_nasal', label: 'TRUE BLUE NASAL MASK' },
  { value: 'wisp_minimal_nasal', label: 'WISP MINIMAL CONTACT NASAL MASK' }
];

const maskSizes = [
  { value: 'petite', label: 'PETITE' },
  { value: 'small', label: 'SMALL' },
  { value: 'medium_small', label: 'MEDIUM/SMALL' },
  { value: 'medium', label: 'MEDIUM' },
  { value: 'medium_wide', label: 'MEDIUM/WIDE' },
  { value: 'large', label: 'LARGE' },
  { value: 'x_large', label: 'X LARGE' }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate content type
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Invalid content type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestBody = await req.json();
    const { fileContent, studyType, clinicalData } = requestBody;

    // Input validation
    if (!fileContent || typeof fileContent !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid file content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!studyType || typeof studyType !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid study type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate study type
    const validStudyTypes = ['Diagnostic', 'Titration', 'Split-Night'];
    if (!validStudyTypes.includes(studyType)) {
      return new Response(JSON.stringify({ error: 'Invalid study type. Must be Diagnostic, Titration, or Split-Night' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize file content
    const sanitizedContent = fileContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Truncate file content if too long to avoid token limits
    const maxContentLength = 35000; // Significantly increased to capture oximetry data
    const truncatedContent = sanitizedContent.length > maxContentLength 
      ? sanitizedContent.substring(0, maxContentLength) + "\n\n[Content truncated...]"
      : sanitizedContent;

    console.log('Processing file content length:', sanitizedContent.length);
    console.log('Truncated content preview (last 1000 chars):', truncatedContent.slice(-1000));
    
    // Also check if content contains oximetry keywords
    const hasOximetryKeywords = sanitizedContent.toLowerCase().includes('oximetry') || 
                                sanitizedContent.toLowerCase().includes('spo2') || 
                                sanitizedContent.toLowerCase().includes('oxygen saturation');
    console.log('Content contains oximetry keywords:', hasOximetryKeywords);

    const MEDICAL_GRADE_PROMPT = `You are a medical-grade AI sleep study assistant. Your task is to extract and summarize **key clinical metrics** from uploaded sleep study files and generate a **clean, modern, and medically accurate** summary based on approved formats and logic.

## 🔍 PRECISE PAGE-BY-PAGE EXTRACTION RULES

### 📄 PAGE 1: Patient Information & Basic Sleep Data

**Patient Information Section (Top-Left):**
- **Patient Name**: Look in "Recording identification" section, line labeled "Patient name", extract value after the colon
- **First Name**: Directly below patient name, line labeled "First name", extract value after the colon  
- **Age**: Line labeled "Patient age", extract value after the colon in patient demographics block

**Sleep Data Section - Times Block (Middle-Left):**
- **Light Off Time**: In "SLEEP DATA 1" section under "Times", row labeled "Light off (LO)", extract from right column
- **Light On Time**: Same "Times" block, row labeled "Light on (LON)", extract from right column (may have "[Recording end]" annotation)

**Durations Section (Middle-Left, below Times):**
- **TIB (Time in Bed)**: In "Durations" block, row labeled "TIB", extract value after colon (explanation: "Light off -> Light on")
- **TST (Total Sleep Time)**: Same "Durations" block, row labeled "TST", extract value after colon (explanation: "REM + NREM + MVT (during SPT)")

**Latencies Section (Bottom of page):**
- **Sleep Onset Latency**: In "Latencies" table at bottom, "Sleep onset" row, under "From Light off (min)" column
- **REM Latency**: Same "Latencies" table, "REM" row, under "From Sleep onset (min)" column

### 📄 PAGE 2: Sleep Architecture & Efficiency

**General Section (Top-Left):**
- **Sleep Efficiency**: In "General" block, row labeled "Sleep efficiency 1", extract value after colon (includes "%" symbol)

**Sleep Stages Distribution Table (Middle Section):**
- **REM Duration**: In "Sleep Stages Distribution" table, "REM" row, under "duration (min)" column
- **REM TST Percentage**: Same "REM" row, under "TST (%)" column (may have handwritten annotation "N24")
- **S1 Episodes**: In "S1" row, under "Episodes (# of)" column
- **S1 TST Percentage**: Same "S1" row, under "TST (%)" column (may have handwritten annotation "N2t")
- **S2 Episodes**: In "S2" row, under "Episodes (# of)" column
- **S3 Episodes**: In "S3" row (may have handwritten note "slow wave sleep"), under "Episodes (# of)" column
- **S3 TST Percentage**: Same "S3" row, under "TST (%)" column (may have handwritten annotation "N3t")

**Sleep Data 3 Section (Bottom):**
- **REM Cycles**: In "SLEEP DATA 3" section, next to "REM Cycles" label as standalone number
- **REM 1**: In REM cycles table, "REM 1" row, under "Tot" column
- **REM 2**: In "REM 2" row, under "Tot" column

### 📄 PAGE 3: No data required

### 📄 PAGE 4: Respiratory Events

**Respiratory Events Summary - Total Sleep Time Section (Bottom Half):**
- **Central Apnea Index (CA)**: In "Index (#/h TST)" row under "CA" column
- **Obstructive Apnea Index (OA)**: Same row, under "OA" column
- **Mixed Apnea Index (MA)**: Same row, under "MA" column
- **Hypopnea Index (HYP)**: Same row, under "HYP" column
- **Mean Hypopnea Duration**: In "Mean (seconds)" row under "HYP" column

**CALCULATION REQUIRED:**
- **Mean Hypopnea Duration**: (CA + OA + MA + HYP) / 4

**Respiratory Disturbance Index Section (Bottom):**
- **AHI REM**: In RDI row, under "REM #/h (REM)" column
- **AHI NREM**: Same RDI row, under "NREM #/h (NREM)" column
- **AHI Overall (TST)**: Same RDI row, under "TST #/h (sleep)" column

### 📄 PAGE 5: Heart Rate Data

**Heart Rate Summary Section (Bottom Half):**
- **REM Duration**: In "HEART RATE SUMMARY" table, "Duration (min)" row under "REM" column
- **REM Mean HR (BPM)**: Same table, "Mean HR (BPM)" row under "REM" column
- **NREM Duration**: In "Duration (min)" row under "NREM" column
- **NREM Mean HR (BPM)**: In "Mean HR (BPM)" row under "NREM" column

### 📄 PAGE 6: Oxygenation & Arousal Data

**Oximetry Distribution Section (Top Half):**
- **<90 SpO2% Wake**: In "Oximetry Distribution" table, "<90" row under "Wake" column
- **<95 SpO2% Wake**: Same table, "<95" row under "Wake" column
- **Non-REM <85**: In "<85" row under "Non-REM" column
- **Non-REM <90**: In "<90" row under "Non-REM" column
- **REM <90**: In "<90" row under "REM" column
- **REM <95**: In "<95" row under "REM" column

**CALCULATIONS REQUIRED FOR OXYGEN SATURATION PERCENTAGES:**
- **Oxygen < 90%**: Extract REM and NREM values from "<90" row, then calculate: ((REM + NREM) * 100) / Total Sleep Time
- **Oxygen < 95%**: Extract REM and NREM values from "<95" row, then calculate: ((REM + NREM) * 100) / Total Sleep Time

**Oximetry Summary Table (Middle Section):**
- **Average SpO2**: In "Average (%)" row under "WK" column
- **Total NREM**: In "NREM" column showing value
- **Number of Desaturations Total**: In "Number of desaturations" row under "TOTAL" column
- **Desaturation Index (#/hour) Total**: In "Desat Index (#/hour)" row under "TOTAL" column - CRITICAL: Extract ONLY the TOTAL column value (last number in row)

**Respiratory Event O2 Min Levels Section:**
- **Mean SpO2 Min Levels**: Extract percentage value (may have handwritten annotations like "significant", "<88", "minimal 74-88")

**Arousal Summary Section (Bottom):**
- **Arousal Index**: Extract value next to "Arousal index" (format: "X.X/h(sleep)")

### 📄 PAGE 7: Movement & Position Data

**Snoring Summary Section (Top):**
- **Snoring Duration**: In "Total duration with snoring" line, extract "X min" value
- **Snoring Percentage**: Same line, extract "X % of sleep" value

**Leg Movements Summary Section (Middle):**
- **Leg Movement Index**: In "Leg movements" row, under "Index" column

**Body Position Summary Section (Bottom):**
- **Left Position Index**: In "L" row, under "Index (#/h)" column
- **Right Position Index**: In "R" row, under "Index (#/h)" column  
- **Supine Position Index**: In "S/SL" combined row, under "Index (#/h)" column

**CALCULATION REQUIRED:**
- **AHI Lateral**: If both L and R position data exist: (Right + Left) / 2

## 💨 CPAP/BPAP PRESSURE & MASK DETAILS

Extract from **titration** or **split therapeutic part**:
- Pressure Type: CPAP or BPAP
- Starting Pressure
- Max Pressure Reached
- Was Pressure Effective? (based on AHI drop, oxygenation improvement)

## 🧮 CALCULATIONS & INTERPRETATIONS

### 🩺 AHI Classification
- AHI < 5 → Normal Study
- 5–15 → Mild OSA
- 15–30 → Moderate OSA
- >30 → Severe OSA

### 💡 Sleep Efficiency
- ≥85% → Normal
- <85% → Reduced

### 🫁 Oxygen Desaturation
- Avg SpO2 90–94% → Mild
- 85–89% → Moderate
- <85% → Severe
- If % time with SpO₂ <90% >5% of TST → "Critical desaturation"

### 📊 Custom Calculations
- **AHI Lateral =** (Right + Left) / 2
- **O2 <90% =** Extract REM and NREM values from Oximetry Distribution table "<90" row, then calculate: ((REM + NREM) * 100) / Total Sleep Time
- **O2 <95% =** Extract REM and NREM values from Oximetry Distribution table "<95" row, then calculate: ((REM + NREM) * 100) / Total Sleep Time
- **Mean Hypopnea Duration =** If values exist → (CA + OA + MA + HYP) / 4

## 📋 CLINICAL SUMMARY GENERATION - STRUCTURED LOGIC

### A. 📅 STUDY TYPE & TIMING (OVERNIGHT vs DAYTIME)
Use AM/PM to determine:
- Start time between 5 PM – 9 AM → "overnight sleep study"
- Start time between 9 AM – 5 PM → "daytime sleep study"

Generate: "This (overnight/daytime) (split-night / therapeutic / repeated) sleep study shows evidence of (diagnosis)."

### B. 🛌 TOTAL SLEEP TIME CONVERSION
Convert minutes to hours/minutes:
- hours = minutes // 60
- remaining minutes = minutes % 60
Example: 262 min → 4 hours and 22 minutes

### C. 😴 AHI CLASSIFICATION (Apnea-Hypopnea Index)
- AHI < 5 → Normal
- 5 ≤ AHI < 15 → Mild OSA
- 15 ≤ AHI < 30 → Moderate OSA
- AHI ≥ 30 → Severe OSA

Add: "…with an AHI of [X] events/hr, consistent with (mild/moderate/severe) Obstructive Sleep Apnea…"

### D. 🫁 CPAP / BPAP INTERVENTION
If CPAP used:
"Conventional CPAP was (applied / attempted / refused). Titration was (acceptable / unacceptable). At CPAP pressure of [X] cmH2O, respiratory events were (eliminated / improved / persisted)."

If CPAP failed and BPAP applied:
"Titration was escalated to BPAP at [IPAP]/[EPAP] cmH2O where respiratory events were eliminated."

### E. 😷 MASK AND ACCESSORIES DETAILS
If CPAP/BPAP applied, and study is therapeutic or split-night:
"CPAP was delivered via [Mask Type – Size], with (headgear / chin strap) used."
Example: "CPAP was delivered via ResMed AirFit F20 Full Face Mask – Medium, with headgear and chin strap."

### F. 🧪 CO2 MONITORING (OPTIONAL)
If values present:
"EtCO2 was monitored and values showed: – mmHg while awake, – mmHg in NREM, and – mmHg in REM."
"TcCO2 values showed: – mmHg while awake, – mmHg in NREM, – mmHg in REM."

### G. 💊 MEDICATION (OPTIONAL)
"Tab. Zolpidem __ mg was given at __ PM per doctor's order. Sleep latency was __ minutes."
"Tab. Sinemet __ mg was given at __ PM."
"Patient refused to take Sinemet." (if applicable)

### H. 🦵 LEG MOVEMENTS AND RLS
PLM Index ≥15/hr (adult) → PLM present
PLM Index <15/hr → PLM not clinically significant

If PLM index ≥ 15/hr:
"Frequent leg movements were noted during sleep meeting PLM criteria, with an index of [XX], suggesting Periodic Limb Movements (PLMs)."

If RLS (leg movement while awake):
"Frequent leg movements were observed while awake, suggesting the possibility of Restless Legs Syndrome (RLS)."

### I. 🔉 SNORING
If snoring present: "Snoring was noted."
(Do not say "routine snoring" and do not mention snoring if absent.)

### J. 🧠 SLEEP ARCHITECTURE
"The patient progressed into (all sleep stages / missed REM / missed N3 / did not reach any stages)."

### K. 🗣 PATIENT COMMENT (OPTIONAL)
Include if provided. Example:
"Patient reported sleeping better in the center and is willing to use CPAP at home."

### L. 🔚 CLOSING STATEMENT LOGIC
Only include "Otherwise, no unusual events were noted during the study." 
IF all of the following are absent: Snoring, PLM, RLS

Combinations:
- ❌ No snoring, no PLMs, no RLS → "Otherwise, no unusual events were noted during the study."
- ✅ Snoring only → "Snoring was noted. Otherwise, no unusual events were noted during the study."
- ✅ PLMs only → "Frequent leg movements were noted during sleep meeting PLM criteria, with an index of [XX], suggesting PLMs. Otherwise, no unusual events were noted during the study."
- ✅ RLS + PLMs → "Frequent leg movements were observed while awake, suggesting RLS. Frequent leg movements were also noted during sleep meeting PLM criteria, with an index of [XX], suggesting PLMs."
- ✅ Snoring + PLMs → "Snoring was noted. Frequent leg movements were also noted during sleep meeting PLM criteria, with an index of [XX], suggesting PLMs."
- ✅ Snoring + RLS + PLMs → "Snoring was noted. Frequent leg movements were observed while awake, suggesting RLS. Frequent leg movements were also noted during sleep meeting PLM criteria, with an index of [XX], suggesting PLMs."

### EXAMPLE OUTPUT:
"This overnight split sleep study shows evidence of Severe Obstructive Sleep Apnea. The patient had a total sleep time of 4 hours and 56 minutes with an AHI of 70.7 events per hour associated with minimal desaturations and repetitive sleep interruptions. Conventional CPAP was applied and titration was done. At CPAP pressure of 10 cmH2O, respiratory events were eliminated on supine REM sleep. He progressed into all sleep stages.

EtCO2 was monitored and values showed: 31–46 mmHg while awake, 30–47 mmHg in NREM, and 30–48 mmHg in REM sleep. TcCO2 values showed: 60–64 mmHg while awake and 60–63 mmHg in NREM sleep.

Otherwise, no unusual events were noted during the study."

CRITICAL: Return ONLY valid JSON. Extract exact values when available. Use null for missing data.

Study Type: ${studyType}

${clinicalData ? `ADDITIONAL CLINICAL DATA PROVIDED BY USER:
Mask Configuration: ${clinicalData.maskType ? maskTypes.find(t => t.value === clinicalData.maskType)?.label : 'Not specified'} - ${clinicalData.maskSize ? maskSizes.find(s => s.value === clinicalData.maskSize)?.label : 'Not specified'}
Accessories: ${[clinicalData.hasHeadgear && 'Headgear', clinicalData.hasChinstrap && 'Chinstrap'].filter(Boolean).join(', ') || 'None'}
${clinicalData.bpapUsed ? `BPAP Pressure: IPAP ${clinicalData.ipapPressure} cmH2O / EPAP ${clinicalData.epapPressure} cmH2O` : 
  clinicalData.cpapPressure ? `CPAP Pressure: ${clinicalData.cpapPressure} cmH2O` : 'Pressure not specified'}
${clinicalData.etco2?.awake || clinicalData.etco2?.nrem || clinicalData.etco2?.rem ? 
  `EtCO2 Values: Awake ${clinicalData.etco2.awake || 'N/A'} mmHg, NREM ${clinicalData.etco2.nrem || 'N/A'} mmHg, REM ${clinicalData.etco2.rem || 'N/A'} mmHg` : ''}
${clinicalData.tcco2?.awake || clinicalData.tcco2?.nrem || clinicalData.tcco2?.rem ? 
  `TcCO2 Values: Awake ${clinicalData.tcco2.awake || 'N/A'} mmHg, NREM ${clinicalData.tcco2.nrem || 'N/A'} mmHg, REM ${clinicalData.tcco2.rem || 'N/A'} mmHg` : ''}
${clinicalData.medication ? `Medication: ${clinicalData.medication}` : ''}

IMPORTANT: Incorporate this user-provided clinical data into your analysis and clinical summary. Use these values for mask details, pressure settings, CO2 monitoring, and medication information in your clinical summary.` : ''}

FILE CONTENT TO ANALYZE:
${truncatedContent}

Expected JSON structure:
{
  "patientInfo": {
    "name": "string or null",
    "firstName": "string or null",
    "age": "number or null",
    "gender": "string or null"
  },
  "studyInfo": {
    "studyType": "diagnostic|titration|split_night",
    "studyDate": "string or null",
    "startTime": "string or null",
    "lightsOff": "string or null",
    "lightsOn": "string or null",
    "timeInBed": "number (minutes) or null",
    "totalSleepTime": "number (minutes) or null",
    "sleepLatency": "number (minutes) or null",
    "remLatency": "number (minutes) or null"
  },
  "sleepArchitecture": {
    "sleepEfficiency": "number (percentage) or null",
    "stage1Percent": "number or null",
    "stage2Percent": "number or null",
    "stage3Percent": "number or null",
    "remPercent": "number or null",
    "remCycles": {
      "count": "number or null",
      "startTimes": "array of strings or null",
      "durations": "array of numbers or null"
    }
  },
  "respiratoryEvents": {
    "ahiOverall": "number or null",
    "ahiSupine": "number or null",
    "ahiLateral": "number or null",
    "ahiLeft": "number or null",
    "ahiRight": "number or null",
    "ahiNrem": "number or null",
    "ahiRem": "number or null",
    "centralApneaIndex": "number or null",
    "obstructiveApneaIndex": "number or null",
    "mixedApneaIndex": "number or null",
    "hypopneaIndex": "number or null",
    "meanHypopneaDuration": "number (seconds) or null"
  },
  "oxygenation": {
    "averageSpO2": "number or null",
    "averageSpO2Nrem": "number or null",
    "averageSpO2Rem": "number or null",
    "lowestSpO2": "number or null",
    "desaturationIndex": "number or null",
    "timeBelow90Percent": "number (percentage) or null",
    "timeBelow95Percent": "number (percentage) or null"
  },
  "cardiacData": {
    "meanHeartRateNrem": "number or null",
    "meanHeartRateRem": "number or null"
  },
  "additionalMetrics": {
    "arousalIndex": "number or null",
    "snoringMinutes": "number or null",
    "snoringPercent": "number or null",
    "legMovementIndex": "number or null",
    "leftPositionIndex": "number or null",
    "rightPositionIndex": "number or null",
    "supinePositionIndex": "number or null"
  },
  "titrationData": {
    "pressureType": "string or null",
    "startingPressure": "number or null",
    "maxPressure": "number or null",
    "effectivePressure": "number or null",
    "pressureEffective": "boolean or null"
  },
  "clinicalSummary": "Auto-generated clinical interpretation following the medical structure above",
  "ahiClassification": "Normal Study|Mild OSA|Moderate OSA|Severe OSA",
  "sleepEfficiencyStatus": "Normal|Reduced",
  "oxygenationSeverity": "Normal|Mild|Moderate|Severe|Critical desaturation"
}`;

  // Separate focused extraction for desaturation index
  const extractDesaturationIndex = async (truncatedContent, openAIApiKey) => {
    const desatPrompt = `Extract the Total Desaturation Index from this sleep study report.

PRECISE LOCATION:
1. Find the "OXIMETRY SUMMARY" section
2. Look for a table with these exact rows (in order):
   - Average (%)
   - Number of desaturations
   - Desat Index (#/hour)  ← TARGET ROW
   - Desat Index (dur/hour) ← SKIP THIS

3. From "Desat Index (#/hour)" row, extract the TOTAL column value

EXAMPLE:
If you see: "Desat Index (#/hour)    1.4   8.8   1.9   2.8"
Extract: 2.8

Return only the numerical value or "NOT_FOUND" if the row doesn't exist.

DOCUMENT: ${truncatedContent}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'Extract the exact numerical value from the specified table row. Return only the number or "NOT_FOUND".'
          },
          { role: 'user', content: desatPrompt }
        ],
        temperature: 0,
        max_tokens: 50,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const result = data.choices[0].message.content.trim();
      
      console.log('Desaturation Index extraction result:', result);
      
      if (result === "NOT_FOUND") {
        return null;
      }
      
      const value = parseFloat(result);
      return isNaN(value) ? null : value;
    }
    
    return null;
  };

  console.log('Sending request to OpenAI...');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are a medical AI expert specializing in sleep study analysis. Your task is to extract exact numerical values from sleep study reports. Search thoroughly through the entire document for each requested metric. Extract ONLY the exact values as they appear in the document - do not estimate or interpolate. Return only valid JSON with actual extracted values.' 
          },
          { role: 'user', content: MEDICAL_GRADE_PROMPT }
        ],
        temperature: 0,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let analysisResult = data.choices[0].message.content;
    
    // Clean up the response - remove markdown code blocks if present
    if (analysisResult.includes('```json')) {
      analysisResult = analysisResult.replace(/```json\s*/, '').replace(/```\s*$/, '');
    }
    if (analysisResult.includes('```')) {
      analysisResult = analysisResult.replace(/```\s*/, '').replace(/```\s*$/, '');
    }
    
    console.log('Cleaned analysis result:', analysisResult);

    // Try to parse the JSON response from OpenAI
    let extractedData;
    try {
      extractedData = JSON.parse(analysisResult);
      
      // Post-process to add custom calculations
      if (extractedData) {
        // Calculate oxygen saturation percentages if we have the data
        // Need to extract REM and NREM values from Oximetry Distribution table and calculate percentages
        
        // Enhanced prompt to get raw Oximetry Distribution values for calculation
        if (extractedData.studyInfo?.totalSleepTime) {
          console.log('=== OXIMETRY EXTRACTION DEBUG ===');
          console.log('Looking for oximetry data in content...');
          
          // Find and log the oximetry section specifically
          const oximetrySection = truncatedContent.substring(
            Math.max(0, truncatedContent.toLowerCase().indexOf('oximetry') - 500),
            Math.min(truncatedContent.length, truncatedContent.toLowerCase().indexOf('oximetry') + 2000)
          );
          console.log('Oximetry section found:', oximetrySection.substring(0, 1000));
          
          const debugOxygenPrompt = `You are a medical data extraction specialist. Extract oxygen saturation data step-by-step with full debugging output.

STEP 1: Find TST (Total Sleep Time)
Look for: "TST : XXX.X min" 
Extract the number only.

STEP 2: Find Oximetry Distribution Table
Look for the section titled "Oximetry Distribution" or "OXIMETRY SUMMARY"

STEP 3: Extract <90% Row Data
Find the row that contains "<90" or "&lt;90"
Extract 4 values in order: Wake, REM, Non-REM, Total (all in minutes)

STEP 4: Extract <95% Row Data  
Find the row that contains "<95" or "&lt;95"
Extract 4 values in order: Wake, REM, Non-REM, Total (all in minutes)

STEP 5: Extract Desaturation Index (#/hour) - PRECISE EXTRACTION

PRECISE LOCATION INSTRUCTIONS:
1. FIND THE OXIMETRY TABLE: Look for "OXIMETRY SUMMARY" section
2. IDENTIFY THE CORRECT ROW: Find EXACTLY "Desat Index (#/hour)" - not "Desat Index (dur/hour)"
3. EXTRACT THE TOTAL VALUE: Take the 4th number (TOTAL column) from that specific row

OXIMETRY TABLE STRUCTURE:
                        WK    REM   NREM  TOTAL
Fail duration (min)     X.X   X.X   X.X   X.X
Average (%)             XX    XX    XX    XX  
Number of desaturations  X     X     X     X
Desat Index (#/hour)    X.X   X.X   X.X   X.X  ← EXTRACT THIS TOTAL
Desat Index (dur/hour)  X.X   X.X   X.X   X.X  ← NOT THIS ONE
Desat max (%)           X     X     X     X

EXTRACTION EXAMPLES:
- "Desat Index (#/hour)    0.6   0.0   0.2   1.3" → Extract: 1.3
- "Desat Index (#/hour)    1.4   8.8   1.9   2.8" → Extract: 2.8

COMMON MISTAKES TO AVOID:
❌ Don't extract from "Desat Index (dur/hour)" - this is duration, not frequency
❌ Don't extract from "Number of desaturations" - this is count, not rate
❌ Don't extract individual WK, REM, or NREM values - only TOTAL

VALIDATION: Must be from "Desat Index (#/hour)" row, TOTAL column, typically 0-50 range

Show your work in this format:
Found row: "exact text here"
Values: WK=X.X, REM=X.X, NREM=X.X, TOTAL=X.X
Extract: X.X

STEP 6: Perform Calculations
Calculate:
- % Time O2 < 90% = ((REM<90 + NonREM<90) / TST) × 100
- % Time O2 < 95% = ((REM<95 + NonREM<95) / TST) × 100

Return this EXACT JSON format:
{
  "debug": {
    "tstFound": "exact text where TST was found",
    "tstValue": number,
    "under90RowText": "exact text of <90 row",
    "under95RowText": "exact text of <95 row",
    "extractedUnder90": {
      "wake": number,
      "rem": number,
      "nonRem": number,
      "total": number
    },
    "extractedUnder95": {
      "wake": number,
      "rem": number,
      "nonRem": number,
      "total": number
    },
    "desatIndexText": "exact text containing desat index",
    "extractedDesatIndex": number
  },
  "calculations": {
    "under90Formula": "show the exact calculation",
    "under90Result": number,
    "under95Formula": "show the exact calculation", 
    "under95Result": number
  },
  "results": {
    "tst": number,
    "remUnder90Minutes": number,
    "nonRemUnder90Minutes": number,
    "remUnder95Minutes": number,
    "nonRemUnder95Minutes": number,
    "desaturationIndex": number,
    "percentTimeO2Under90": number,
    "percentTimeO2Under95": number
  }
}

DOCUMENT CONTENT:
${truncatedContent}`;

          console.log('Requesting additional oximetry data extraction...');
          
          const oximetryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4.1-2025-04-14',
              messages: [
                { 
                  role: 'system', 
                  content: 'You are a medical data extractor. Extract ONLY the exact numerical values from the specified table cells. Return only valid JSON.' 
                },
                { role: 'user', content: debugOxygenPrompt }
              ],
              temperature: 0,
              max_tokens: 500,
            }),
          });

          if (oximetryResponse.ok) {
            const oximetryData = await oximetryResponse.json();
            let oximetryResult = oximetryData.choices[0].message.content;
            
            // Clean JSON response
            if (oximetryResult.includes('```json')) {
              oximetryResult = oximetryResult.replace(/```json\s*/, '').replace(/```\s*$/, '');
            }
            if (oximetryResult.includes('```')) {
              oximetryResult = oximetryResult.replace(/```\s*/, '').replace(/```\s*$/, '');
            }
            
            try {
              const oximetryValues = JSON.parse(oximetryResult);
              console.log('Extracted raw oximetry values:', oximetryValues);
              
              // Get TST from extracted data (prioritize extracted value over input)
              const tst = oximetryValues.tst || extractedData.studyInfo.totalSleepTime;
              console.log(`Using TST for calculations: ${tst} minutes`);
              
              if (!tst || tst <= 0) {
                console.error('Invalid TST for oxygen calculations:', tst);
                return;
              }
              
              // Extract raw minutes values from table
              const remUnder90Minutes = oximetryValues.remUnder90Minutes || 0;
              const nonRemUnder90Minutes = oximetryValues.nonRemUnder90Minutes || 0;
              const remUnder95Minutes = oximetryValues.remUnder95Minutes || 0;
              const nonRemUnder95Minutes = oximetryValues.nonRemUnder95Minutes || 0;
              
              console.log('Raw extracted minutes:', {
                remUnder90Minutes,
                nonRemUnder90Minutes,
                remUnder95Minutes,
                nonRemUnder95Minutes
              });
              
              // Calculate % Time with O2 < 90%
              const totalUnder90Minutes = remUnder90Minutes + nonRemUnder90Minutes;
              const percentTimeUnder90 = (totalUnder90Minutes / tst) * 100;
              
              // Calculate % Time with O2 < 95%
              const totalUnder95Minutes = remUnder95Minutes + nonRemUnder95Minutes;
              const percentTimeUnder95 = (totalUnder95Minutes / tst) * 100;
              
              // Apply formatting rules from user's instructions
              extractedData.oxygenation.timeBelow90Percent = formatOxygenPercentage(percentTimeUnder90);
              extractedData.oxygenation.timeBelow95Percent = formatOxygenPercentage(percentTimeUnder95);
              
              // Add desaturation index if available from the specific extraction
              if (oximetryValues.results?.desaturationIndex !== undefined && oximetryValues.results?.desaturationIndex !== null) {
                extractedData.oxygenation.desaturationIndex = oximetryValues.results.desaturationIndex;
              } else if (oximetryValues.debug?.extractedDesatIndex !== undefined && oximetryValues.debug?.extractedDesatIndex !== null) {
                extractedData.oxygenation.desaturationIndex = oximetryValues.debug.extractedDesatIndex;
              }
              
              console.log(`Final O2 calculations:
                - <90%: (${remUnder90Minutes} + ${nonRemUnder90Minutes}) * 100 / ${tst} = ${extractedData.oxygenation.timeBelow90Percent}
                - <95%: (${remUnder95Minutes} + ${nonRemUnder95Minutes}) * 100 / ${tst} = ${extractedData.oxygenation.timeBelow95Percent}
                - Desaturation Index: ${extractedData.oxygenation.desaturationIndex}`);
              
            } catch (oximetryParseError) {
              console.error('Failed to parse oximetry extraction:', oximetryParseError);
            }
          }
        }
        
        // Calculate AHI Lateral if we have left and right values
        if (extractedData.respiratoryEvents?.ahiLeft && extractedData.respiratoryEvents?.ahiRight) {
          extractedData.respiratoryEvents.ahiLateral = Math.round(((extractedData.respiratoryEvents.ahiLeft + extractedData.respiratoryEvents.ahiRight) / 2) * 10) / 10;
        }
        
        // Calculate mean hypopnea duration if individual values exist
        const { centralApneaIndex, obstructiveApneaIndex, mixedApneaIndex, hypopneaIndex } = extractedData.respiratoryEvents || {};
        if (centralApneaIndex !== null && obstructiveApneaIndex !== null && mixedApneaIndex !== null && hypopneaIndex !== null) {
          extractedData.respiratoryEvents.meanHypopneaDuration = Math.round(((centralApneaIndex + obstructiveApneaIndex + mixedApneaIndex + hypopneaIndex) / 4) * 100) / 100;
        }
      }
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', parseError);
      console.error('Raw response:', analysisResult);
      // Fallback to structured empty data if parsing fails
      extractedData = {
        patientInfo: {
          name: null,
          firstName: null,
          age: null,
          gender: null
        },
        studyInfo: {
          studyType: studyType.toLowerCase().replace('-', '_'),
          studyDate: null,
          startTime: null,
          lightsOff: null,
          lightsOn: null,
          timeInBed: null,
          totalSleepTime: null,
          sleepLatency: null,
          remLatency: null
        },
        sleepArchitecture: {
          sleepEfficiency: null,
          stage1Percent: null,
          stage2Percent: null,
          stage3Percent: null,
          remPercent: null,
          remCycles: {
            count: null,
            startTimes: null,
            durations: null
          }
        },
        respiratoryEvents: {
          ahiOverall: null,
          ahiSupine: null,
          ahiLateral: null,
          ahiLeft: null,
          ahiRight: null,
          ahiNrem: null,
          ahiRem: null,
          centralApneaIndex: null,
          obstructiveApneaIndex: null,
          mixedApneaIndex: null,
          hypopneaIndex: null,
          meanHypopneaDuration: null
        },
        oxygenation: {
          averageSpO2: null,
          averageSpO2Nrem: null,
          averageSpO2Rem: null,
          lowestSpO2: null,
          desaturationIndex: null,
          timeBelow90Percent: null,
          timeBelow95Percent: null
        },
        cardiacData: {
          meanHeartRateNrem: null,
          meanHeartRateRem: null
        },
        additionalMetrics: {
          arousalIndex: null,
          snoringMinutes: null,
          snoringPercent: null,
          legMovementIndex: null,
          leftPositionIndex: null,
          rightPositionIndex: null,
          supinePositionIndex: null
        },
        titrationData: {
          pressureType: null,
          startingPressure: null,
          maxPressure: null,
          effectivePressure: null,
          pressureEffective: null
        },
        clinicalSummary: "Unable to parse sleep study report. Please check the file format.",
        ahiClassification: "Unable to determine",
        sleepEfficiencyStatus: "Unable to determine",
        oxygenationSeverity: "Unable to determine"
      };
    }

    // Return the extracted data with additional metadata
    const processedData = {
      ...extractedData,
      studyType: studyType
    };

    // Call the separate desaturation index extraction
    const desatIndex = await extractDesaturationIndex(truncatedContent, openAIApiKey);
    if (desatIndex !== null) {
      processedData.oxygenation.desaturationIndex = desatIndex;
      console.log('Updated desaturation index from focused extraction:', desatIndex);
    }

    console.log('Final processed data:', JSON.stringify(processedData, null, 2));

    return new Response(JSON.stringify(processedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in process-sleep-study function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to process sleep study report'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});