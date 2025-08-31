import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const { fileContent, studyType } = requestBody;

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
    const maxContentLength = 15000;
    const truncatedContent = sanitizedContent.length > maxContentLength 
      ? sanitizedContent.substring(0, maxContentLength) + "\n\n[Content truncated...]"
      : sanitizedContent;

    console.log('Processing file content length:', sanitizedContent.length);

    const MEDICAL_GRADE_PROMPT = `You are a medical-grade AI sleep study assistant. Your task is to extract and summarize **key clinical metrics** from uploaded sleep study files and generate a **clean, modern, and medically accurate** summary based on approved formats and logic.

## 🔍 PAGE-BY-PAGE EXTRACTION RULES

### 📄 Page 1: General Parameters
- Patient Name, First Name, Age
- Start Time, Light Off, Light On
- Time in Bed, Total Sleep Time
- Sleep Latency (from Light Off)
- REM Latency (from Sleep Onset)

### 📄 Page 2: Sleep Architecture
- Sleep Efficiency
- Sleep Stage %: S1, S2, S3, REM
- REM Cycles: start time, duration, %TST

### 📄 Page 4: Respiratory Summary
- Mean Hypopnea Duration (seconds)
- Index values:
  - CA (Central Apnea Index)
  - OA (Obstructive Apnea Index)
  - MA (Mixed Apnea Index)
  - HYP (Hypopnea Index)
- AHI by:
  - Supine, Lateral, NREM, REM, Overall

### 📄 Page 5: Heart Rate
- Mean HR in NREM and REM

### 📄 Page 6: Oxygenation
- SpO2 REM row
- SpO2 NREM row
- Average SpO2
- Desaturation Index
- Lowest SpO2
- Arousal Index

### 📄 Page 7: Additional Metrics
- Snoring (minutes and %)
- Leg Movement Index
- Body Position Indices:
  - L (Left)
  - R (Right)
  - S (Supine)

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
- **O2 <90% =** ((REM + NREM oxygen below 90%) * 100) / Total Sleep Time
- **O2 <95% =** ((REM + NREM oxygen below 95%) * 100) / Total Sleep Time
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