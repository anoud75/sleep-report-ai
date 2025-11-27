import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate Clinical Summary based on templates
function generateClinicalSummary(data: any, studyType: string, clinicalData: any): string {
  const ahi = data.respiratoryEvents?.ahiOverall || 0;
  const tst = data.studyInfo?.totalSleepTime || 0;
  const hours = Math.floor(tst / 60);
  const minutes = Math.round(tst % 60);
  const age = data.patientInfo?.age || '---';
  const gender = data.patientInfo?.gender === 'F' ? 'female' : 'male';
  const lowestO2 = data.oxygenation?.lowestSpO2;
  
  // Determine severity
  let severity = '';
  if (ahi >= 30) severity = 'Severe';
  else if (ahi >= 15) severity = 'Moderate';
  else if (ahi >= 5) severity = 'Mild';
  else severity = 'Normal';
  
  // Determine desaturation level
  const timeBelow90 = parseFloat(data.oxygenation?.timeBelow90Percent) || 0;
  const desatLevel = timeBelow90 > 5 ? 'significant' : 'minimal';
  
  // Check sleep stage progression
  const hasAllStages = (data.sleepArchitecture?.remPercent || 0) > 0 && 
                       (data.sleepArchitecture?.slowWaveSleepPercent || 0) > 0;
  
  if (severity === 'Normal') {
    return `In summary based on the performed study, there was no evidence of sleep disordered breathing or any other significant respiratory disturbances during sleep.${hasAllStages ? ' The patient progressed into all sleep stages.' : ''}`;
  }
  
  // Check if repeated study
  const isRepeated = clinicalData?.isRepeatedStudy === true;
  const repeatedPrefix = isRepeated ? 'repeated ' : '';
  
  // For Split-Night study
  if (studyType === 'Split-Night') {
    return `This ${repeatedPrefix}split night sleep study shows evidence of "${severity} Obstructive Sleep Apnea". In the pre-PAP period, the patient had a total sleep time of ${hours} hours and ${minutes} minutes with an AHI of ${ahi} events per hour associated with ${desatLevel} desaturation${lowestO2 ? ` (Lowest SpO2: ${lowestO2}%)` : ''} and repetitive sleep interruption.${hasAllStages ? ' The patient progressed into all sleep stages.' : ' The patient did not progress into slow wave sleep during the entire study.'}`;
  }
  
  // For Diagnostic study
  return `This ${repeatedPrefix}overnight sleep study shows evidence of "${severity} Obstructive Sleep Apnea". The patient had a total sleep time of ${hours} hours and ${minutes} minutes with an AHI of ${ahi} events per hour associated with ${desatLevel} desaturation${lowestO2 ? ` (Lowest SpO2: ${lowestO2}%)` : ''} and repetitive sleep interruption.${hasAllStages ? ' The patient progressed into all sleep stages.' : ' The patient did not progress into slow wave sleep.'}`;
}

// Generate Recommendations based on AHI and other factors
function generateRecommendations(data: any, studyType: string, clinicalData: any): string[] {
  const recommendations: string[] = [];
  const ahi = data.respiratoryEvents?.ahiOverall || 0;
  const ahiSupine = data.respiratoryEvents?.ahiSupine || 0;
  const ahiLateral = data.respiratoryEvents?.ahiLateral || 0;
  const timeBelow90 = parseFloat(data.oxygenation?.timeBelow90Percent) || 0;
  
  // Main treatment recommendation based on AHI
  if (ahi >= 30) {
    recommendations.push("CPAP therapy is strongly recommended for treatment of severe OSA.");
  } else if (ahi >= 15) {
    recommendations.push("CPAP therapy is recommended for treatment of moderate OSA.");
  } else if (ahi >= 5) {
    recommendations.push("Consider positional therapy, weight management, and lifestyle modifications for mild OSA.");
  }
  
  // Positional therapy recommendation
  if (ahiSupine && ahiLateral && ahiSupine > ahiLateral * 2) {
    recommendations.push("Positional therapy may be beneficial given significant positional component.");
  }
  
  // Oxygen supplementation
  if (timeBelow90 > 5) {
    recommendations.push("Supplemental oxygen may be considered given significant desaturation during sleep.");
  }
  
  // For titration studies
  if (studyType === 'Titration' || studyType === 'Split-Night') {
    if (clinicalData?.cpapPressure) {
      recommendations.push(`Continue CPAP therapy at ${clinicalData.cpapPressure} cmH2O as prescribed.`);
    }
    if (clinicalData?.bpapUsed) {
      recommendations.push(`Continue BPAP therapy at IPAP ${clinicalData.ipapPressure} / EPAP ${clinicalData.epapPressure} cmH2O.`);
    }
  }
  
  // Follow-up
  if (ahi >= 5) {
    recommendations.push("Follow-up sleep study recommended after therapy initiation to assess efficacy.");
  }
  
  return recommendations;
}

// Convert patient comment keys to readable text
function convertPatientComments(selectedComments: string[]): string[] {
  const commentMap: { [key: string]: string } = {
    'sleeping_better_center': 'Patient reports sleeping better in the center compared to home.',
    'no_difference': 'Patient reports no difference in sleep quality between the center and home.',
    'sleeping_better_home': 'Patient reports sleeping better at home.',
    'improved_with_cpap': 'Patient reports improved sleep in the center with CPAP and will discuss continuation at home with the physician.',
    'willing_cpap_home': 'Patient reports improved sleep in the center and expresses willingness to initiate CPAP therapy at home.',
    'better_without_cpap': 'Patient reports better sleep without CPAP.',
    'undecided_cpap': 'Patient remains undecided regarding the use of CPAP at home.',
    'no_comment': 'No comment provided'
  };
  
  return selectedComments.map(key => commentMap[key] || key);
}

// Universal extraction for ALL sleep study metrics
async function extractSleepMetrics(rawText: string, apiKey: string, studyType: string) {
  console.log("=== COMPREHENSIVE EXTRACTION PIPELINE START ===");
  console.log("Raw text length:", rawText.length);
  console.log("Study Type:", studyType);
  
  // DEBUG: Show raw text sample
  console.log("=== DEBUG: Raw text sample (first 2000 chars) ===");
  console.log(rawText.substring(0, 2000));

  // For Split-Night studies, extract two separate datasets
  if (studyType === 'Split-Night') {
    console.log("=== SPLIT-NIGHT DATA SEPARATION ===");
    
    // Parse the incoming text to find both sections
    const diagnosticMarker = '=== OFF CPAP (DIAGNOSTIC PORTION) ===';
    const therapeuticMarker = '=== ON CPAP (THERAPEUTIC PORTION) ===';
    
    const diagnosticStart = rawText.indexOf(diagnosticMarker);
    const therapeuticStart = rawText.indexOf(therapeuticMarker);
    
    let diagnosticText = '';
    let therapeuticText = '';
    
    if (diagnosticStart !== -1 && therapeuticStart !== -1) {
      // Both markers found - extract each section
      diagnosticText = rawText.substring(diagnosticStart + diagnosticMarker.length, therapeuticStart).trim();
      therapeuticText = rawText.substring(therapeuticStart + therapeuticMarker.length).trim();
      
      console.log("✅ Both portions found with markers");
      console.log("Diagnostic text length:", diagnosticText.length);
      console.log("Therapeutic text length:", therapeuticText.length);
    } else {
      // Fallback: try to split by old markers
      console.log("⚠️ New markers not found, trying old markers");
      const oldDiagMarker = 'DIAGNOSTIC PORTION:';
      const oldTherapMarker = 'THERAPEUTIC PORTION:';
      
      const oldDiagStart = rawText.indexOf(oldDiagMarker);
      const oldTherapStart = rawText.indexOf(oldTherapMarker);
      
      if (oldDiagStart !== -1 && oldTherapStart !== -1) {
        diagnosticText = rawText.substring(oldDiagStart + oldDiagMarker.length, oldTherapStart).trim();
        therapeuticText = rawText.substring(oldTherapStart + oldTherapMarker.length).trim();
        console.log("✅ Found old format markers");
      } else {
        // Last resort: split in half
        console.log("⚠️ No markers found, splitting in half");
        const midPoint = Math.floor(rawText.length / 2);
        diagnosticText = rawText.substring(0, midPoint);
        therapeuticText = rawText.substring(midPoint);
      }
      
      console.log("Diagnostic text length:", diagnosticText.length);
      console.log("Therapeutic text length:", therapeuticText.length);
    }
    
    // Show samples for debugging
    console.log("=== DIAGNOSTIC SAMPLE (first 500 chars) ===");
    console.log(diagnosticText.substring(0, 500));
    console.log("=== THERAPEUTIC SAMPLE (first 500 chars) ===");
    console.log(therapeuticText.substring(0, 500));
    
    const prompt = `You are a medical-grade AI assistant extracting comprehensive sleep study data from a Split-Night study report.

## 🔍 SPLIT-NIGHT EXTRACTION RULES

**CRITICAL**: This is a Split-Night study with TWO distinct periods:
1. **OFF CPAP (Diagnostic)** - First part of the night (NO THERAPY)
2. **ON CPAP (Therapeutic)** - Second part of the night (WITH CPAP THERAPY)

You must extract TWO complete sets of data, one for each period.

### Extract for BOTH periods:
- Light Off/On times
- Time in Bed (minutes)
- Total Sleep Time (minutes)
- Sleep Latency & REM Latency
- Sleep Efficiency (%)
- Sleep Architecture: S1%, S2%, S3%, REM%, REM Cycles
- AHI Overall, AHI NREM/REM, AHI Supine/Lateral
- Central/Obstructive/Mixed Apnea Index
- Hypopnea Index & Mean Duration
- Heart Rate NREM/REM
- Desaturation Index
- O2 < 90%, O2 < 95%
- Lowest O2, Average O2
- Arousal Index
- Snoring %
- Leg Movement Index

### Additional for ON CPAP period:
- CPAP Pressure (e.g., "8 cmH2O")

## 📤 REQUIRED JSON OUTPUT

{
  "isSplitNight": true,
  "offCpap": {
    "studyInfo": {
      "lightsOff": "string or null",
      "lightsOn": "string or null",
      "timeInBed": "number or null",
      "totalSleepTime": "number or null",
      "sleepLatency": "number or null",
      "remLatency": "number or null"
    },
    "sleepArchitecture": {
      "sleepEfficiency": "number or null",
      "stage1Percent": "number or null",
      "stage2Percent": "number or null",
      "stage3Percent": "number or null",
      "remPercent": "number or null",
      "remCycles": "number or null"
    },
    "respiratoryEvents": {
      "ahiOverall": "number or null",
      "ahiNrem": "number or null",
      "ahiRem": "number or null",
      "ahiSupine": "number or null",
      "ahiLateral": "number or null",
      "centralApneaIndex": "number or null",
      "obstructiveApneaIndex": "number or null",
      "mixedApneaIndex": "number or null",
      "hypopneaIndex": "number or null",
      "meanHypopneaDuration": "number or null"
    },
    "oxygenation": {
      "lowestSpO2": "number or null",
      "averageSpO2": "number or null",
      "desaturationIndex": "number or null",
      "timeBelow90Percent": "number or null",
      "timeBelow95Percent": "number or null"
    },
    "cardiacData": {
      "meanHeartRateNrem": "number or null",
      "meanHeartRateRem": "number or null"
    },
    "additionalMetrics": {
      "arousalIndex": "number or null",
      "snoringPercent": "number or null",
      "legMovementIndex": "number or null"
    }
  },
  "onCpap": {
    "cpapPressure": "string or null (e.g., '8 cmH2O')",
    "studyInfo": { /* same structure as offCpap */ },
    "sleepArchitecture": { /* same structure */ },
    "respiratoryEvents": { /* same structure */ },
    "oxygenation": { /* same structure */ },
    "cardiacData": { /* same structure */ },
    "additionalMetrics": { /* same structure */ }
  }
}

### 📄 OFF CPAP (DIAGNOSTIC) DATA:
${diagnosticText.substring(0, 25000)}

### 📄 ON CPAP (THERAPEUTIC) DATA:
${therapeuticText.substring(0, 25000)}`;

    try {
      console.log("=== Sending Split-Night request to AI ===");
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          max_tokens: 3000,
          messages: [{ 
            role: 'user', 
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`AI API failed: ${response.status}`);
      }

      const data = await response.json();
      let result = data.choices[0].message.content.trim();
      
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = jsonMatch[0];
      }
      result = result.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      const parsed = JSON.parse(result);
      console.log("✅ Split-Night extraction successful");
      
      return parsed;
      
    } catch (error) {
      console.error("❌ Split-Night AI Extraction error:", error);
      return {
        isSplitNight: true,
        offCpap: getEmptyDataStructure(),
        onCpap: { cpapPressure: null, ...getEmptyDataStructure() }
      };
    }
  }

  // COMPREHENSIVE MEDICAL-GRADE AI PROMPT for regular studies
  const prompt = `You are a medical-grade AI assistant extracting comprehensive sleep study data from a medical report.

## 🔍 EXTRACTION RULES (Extract ALL available data)

### PAGE 1: Patient & Basic Sleep Data
- **Patient Name**: "Recording identification" → "Patient name" line
- **First Name**: Line below patient name  
- **Age**: "Patient age" line
- **Gender**: "Sex" field
- **Light Off Time**: "Times" section → "Light off (LO)" row
- **Light On Time**: "Times" section → "Light on (LON)" row
- **TIB**: "Durations" → "TIB" row (minutes)
- **TST**: "Durations" → "TST" row (minutes)
- **Sleep Onset Latency**: "Latencies" table → "Sleep onset" row, "From Light off (min)" column
- **REM Latency**: "Latencies" table → "REM" row, "From Sleep onset (min)" column

### PAGE 2: Sleep Architecture (USE TST (%) COLUMN - 5th COLUMN)
**CRITICAL TABLE STRUCTURE**:
              Episodes  Duration  TIB%   SPT%   TST%
              (# of)    (min)     (%)    (%)    (%) ← USE THIS COLUMN ONLY
S1            15        9.0       2.3    2.5    3.0 ← Extract 3.0
S2            31        229.5     59.8   64.6   76.2 ← Extract 76.2
S3            4         42.0      10.9   11.8   14.0 ← Extract 14.0
REM           2         20.5      5.3    5.8    6.8 ← Extract 6.8

- **Sleep Efficiency**: "General" block → "Sleep efficiency 1" (%)
- **Stage 1 %**: "S1" row → **TST (%)** column (5th column, NOT TIB or SPT)
- **Stage 2 %**: "S2" row → **TST (%)** column (5th column)
- **Stage 3 %**: "S3" row → **TST (%)** column (5th column)
- **REM %**: "REM" row → **TST (%)** column (5th column)
- **REM Cycles**: Count of REM episodes in "SLEEP DATA 3" section

### PAGE 4: Respiratory Events
- **CA Index**: "Index (#/h TST)" row → "CA" column
- **OA Index**: Same row → "OA" column
- **MA Index**: Same row → "MA" column
- **HYP Index**: Same row → "HYP" column
- **Hypopnea Mean Duration**: "Mean (seconds)" row → "HYP" column
- **AHI REM**: RDI row → "REM #/h (REM)" column
- **AHI NREM**: RDI row → "NREM #/h (NREM)" column
- **AHI Overall**: RDI row → "TST #/h (sleep)" column

### PAGE 5: Heart Rate
- **REM Mean HR**: "HEART RATE SUMMARY" → "Mean HR (BPM)" row → "REM" column
- **NREM Mean HR**: Same row → "NREM" column

### PAGE 6: Oxygenation & Arousal
- **Oxygen <90%**: Oximetry Distribution "<90" row → Extract REM & NREM (minutes), Calculate: ((REM + NREM) * 100) / TST
- **Oxygen <95%**: "<95" row → Extract REM & NREM (minutes), Calculate: ((REM + NREM) * 100) / TST
- **Lowest SpO2**: Oximetry Summary → "Minimum (%)" or "Lowest" value
- **Average SpO2**: "Average (%)" row → Main value
- **Desaturation Index**: "Desat Index (#/hour)" row → TOTAL column (rightmost number ONLY)
- **Arousal Index**: Extract from "Arousal index" line

### PAGE 7: Body Position - AHI by Position
**CRITICAL**: Extract AHI values from Body Position table → "Index (#/h)" or "AHI" column
- **AHI Supine**: "S" or "S/SL" row → "Index (#/h)" column
- **AHI Left**: "L" row → "Index (#/h)" column  
- **AHI Right**: "R" row → "Index (#/h)" column
- **Supine Position Index**: "S/SL" row → "Index (#/h)" column (positional index)
- **Left Position Index**: "L" row → "Index (#/h)" column (positional index)
- **Right Position Index**: "R" row → "Index (#/h)" column (positional index)
- **Snoring Duration & %**: "Total duration with snoring"
- **Leg Movement Index**: "Leg movements" → "Index" column

## 📤 REQUIRED JSON OUTPUT

{
  "patientInfo": {
    "name": "string or null",
    "firstName": "string or null",
    "age": "number or null",
    "gender": "string or null"
  },
  "studyInfo": {
    "studyType": "${studyType}",
    "lightsOff": "string or null",
    "lightsOn": "string or null",
    "timeInBed": "number (minutes) or null",
    "totalSleepTime": "number (minutes) or null",
    "sleepLatency": "number (minutes) or null",
    "remLatency": "number (minutes) or null"
  },
  "sleepArchitecture": {
    "sleepEfficiency": "number (percentage) or null",
    "stage1Percent": "number or null (from TST % column)",
    "stage2Percent": "number or null (from TST % column)",
    "stage3Percent": "number or null (from TST % column)",
    "stage4Percent": "number or null (from TST % column, usually 0)",
    "remPercent": "number or null (from TST % column)",
    "remCycles": "number or null"
  },
  "respiratoryEvents": {
    "ahiOverall": "number or null",
    "ahiNrem": "number or null",
    "ahiRem": "number or null",
    "ahiSupine": "number or null (from Body Position table S/SL row)",
    "ahiLeft": "number or null (from Body Position table L row)",
    "ahiRight": "number or null (from Body Position table R row)",
    "centralApneaIndex": "number or null",
    "obstructiveApneaIndex": "number or null",
    "mixedApneaIndex": "number or null",
    "hypopneaIndex": "number or null",
    "meanHypopneaDuration": "number (seconds) or null"
  },
  "oxygenation": {
    "lowestSpO2": "number or null (from Oximetry Minimum %)",
    "averageSpO2": "number or null",
    "desaturationIndex": "number or null",
    "timeBelow90Percent": "number (percentage) or null",
    "timeBelow95Percent": "number (percentage) or null",
    "calculations": {
      "tst": "number or null",
      "under90REM": "number or null",
      "under90NREM": "number or null",
      "under95REM": "number or null",
      "under95NREM": "number or null"
    }
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
    "supinePositionIndex": "number or null",
    "ahiLateral": "number or null"
  }
}

**CRITICAL**: 
- Extract ACTUAL values from document
- Use null for missing data
- DO NOT use example values
- Perform calculations as specified

### 📄 DOCUMENT TEXT:
${rawText.substring(0, 20000)}`;

  try {
    console.log("=== Sending to Lovable AI (Comprehensive Extraction) ===");
    console.log("Prompt length:", prompt.length);
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 2000,
        messages: [{ 
          role: 'user', 
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ AI API Error:", response.status, errorText);
      throw new Error(`AI API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("=== AI Response (Full Extraction) ===");
    console.log(JSON.stringify(data, null, 2));
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid AI response structure");
    }

    let result = data.choices[0].message.content.trim();
    
    // Extract JSON from markdown
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = jsonMatch[0];
    }
    result = result.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    const parsed = JSON.parse(result);
    console.log("=== Parsed Comprehensive Result ===", JSON.stringify(parsed, null, 2));
    
    // Calculate Slow Wave Sleep (SWS) = S3 + S4
    if (parsed.sleepArchitecture?.stage3Percent !== null) {
      const s4 = parsed.sleepArchitecture?.stage4Percent || 0;
      parsed.sleepArchitecture.slowWaveSleepPercent = parseFloat((parsed.sleepArchitecture.stage3Percent + s4).toFixed(1));
      console.log(`✅ Calculated SWS: ${parsed.sleepArchitecture.stage3Percent} + ${s4} = ${parsed.sleepArchitecture.slowWaveSleepPercent}%`);
    }
    
    // Calculate AHI Lateral = (AHI Left + AHI Right) / 2
    if (!parsed.respiratoryEvents?.ahiLateral && 
        typeof parsed.respiratoryEvents?.ahiLeft === 'number' && 
        typeof parsed.respiratoryEvents?.ahiRight === 'number') {
      parsed.respiratoryEvents.ahiLateral = parseFloat(((parsed.respiratoryEvents.ahiLeft + parsed.respiratoryEvents.ahiRight) / 2).toFixed(2));
      console.log(`✅ Calculated AHI Lateral: (${parsed.respiratoryEvents.ahiLeft} + ${parsed.respiratoryEvents.ahiRight}) / 2 = ${parsed.respiratoryEvents.ahiLateral}`);
    }
    
    // FIX: JavaScript Zero Bug - Check for number type instead of truthy value
    // Calculate O2 percentages if AI provided raw values
    if (parsed.oxygenation?.timeBelow90Percent === null && 
        typeof parsed.oxygenation?.calculations?.under90REM === 'number' && 
        typeof parsed.oxygenation?.calculations?.under90NREM === 'number' && 
        parsed.oxygenation?.calculations?.tst) {
      const tst = parsed.oxygenation.calculations.tst;
      const sum90 = parsed.oxygenation.calculations.under90REM + parsed.oxygenation.calculations.under90NREM;
      parsed.oxygenation.timeBelow90Percent = parseFloat(((sum90 / tst) * 100).toFixed(2));
      console.log(`✅ Calculated O2 <90%: (${parsed.oxygenation.calculations.under90REM} + ${parsed.oxygenation.calculations.under90NREM}) / ${tst} * 100 = ${parsed.oxygenation.timeBelow90Percent}%`);
    }
    
    if (parsed.oxygenation?.timeBelow95Percent === null && 
        typeof parsed.oxygenation?.calculations?.under95REM === 'number' && 
        typeof parsed.oxygenation?.calculations?.under95NREM === 'number' && 
        parsed.oxygenation?.calculations?.tst) {
      const tst = parsed.oxygenation.calculations.tst;
      const sum95 = parsed.oxygenation.calculations.under95REM + parsed.oxygenation.calculations.under95NREM;
      parsed.oxygenation.timeBelow95Percent = parseFloat(((sum95 / tst) * 100).toFixed(2));
      console.log(`✅ Calculated O2 <95%: (${parsed.oxygenation.calculations.under95REM} + ${parsed.oxygenation.calculations.under95NREM}) / ${tst} * 100 = ${parsed.oxygenation.timeBelow95Percent}%`);
    }
    
    console.log("✅ Comprehensive extraction successful");
    console.log("=== COMPREHENSIVE EXTRACTION PIPELINE END ===");
    
    return parsed;
    
  } catch (error) {
    console.error("❌ Comprehensive AI Extraction error:", error);
    console.log("=== COMPREHENSIVE EXTRACTION PIPELINE END ===");
    
    // Return minimal structure on error
    return {
      patientInfo: { name: null, firstName: null, age: null, gender: null },
      studyInfo: {
        studyType,
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
        stage4Percent: null,
        slowWaveSleepPercent: null,
        remPercent: null,
        remCycles: null
      },
      respiratoryEvents: {
        ahiOverall: null,
        ahiNrem: null,
        ahiRem: null,
        ahiSupine: null,
        ahiLeft: null,
        ahiRight: null,
        ahiLateral: null,
        centralApneaIndex: null,
        obstructiveApneaIndex: null,
        mixedApneaIndex: null,
        hypopneaIndex: null,
        meanHypopneaDuration: null
      },
      oxygenation: {
        lowestSpO2: null,
        averageSpO2: null,
        desaturationIndex: null,
        timeBelow90Percent: null,
        timeBelow95Percent: null,
        calculations: {
          tst: null,
          under90REM: null,
          under90NREM: null,
          under95REM: null,
          under95NREM: null
        }
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
        supinePositionIndex: null,
        ahiLateral: null
      }
    };
  }
}

// Helper function to get empty data structure
function getEmptyDataStructure() {
  return {
    studyInfo: {
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
      slowWaveSleepPercent: null,
      remPercent: null,
      remCycles: null
    },
    respiratoryEvents: {
      ahiOverall: null,
      ahiNrem: null,
      ahiRem: null,
      ahiSupine: null,
      ahiLateral: null,
      centralApneaIndex: null,
      obstructiveApneaIndex: null,
      mixedApneaIndex: null,
      hypopneaIndex: null,
      meanHypopneaDuration: null
    },
    oxygenation: {
      lowestSpO2: null,
      averageSpO2: null,
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
      snoringPercent: null,
      legMovementIndex: null
    }
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rawText, studyType, clinicalData, patientComments } = await req.json();
    
    console.log("=== REQUEST RECEIVED ===");
    console.log("Study Type:", studyType);
    console.log("Raw text length:", rawText?.length || 0);
    console.log("Clinical Data received:", !!clinicalData);
    console.log("Patient Comments received:", patientComments?.length || 0);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Extract ALL metrics using comprehensive pipeline
    const extractedData = await extractSleepMetrics(rawText || '', lovableApiKey, studyType);

    // Handle Split-Night response differently
    if (extractedData.isSplitNight) {
      const clinicalSummary = generateClinicalSummary(extractedData.offCpap, studyType, clinicalData);
      const recommendations = generateRecommendations(extractedData.onCpap, studyType, clinicalData);
      
      // Convert patient comment keys to readable text
      const convertedComments = clinicalData?.selectedComments 
        ? convertPatientComments(clinicalData.selectedComments) 
        : [];
      
      const response = {
        isSplitNight: true,
        studyType,
        offCpap: extractedData.offCpap,
        onCpap: extractedData.onCpap,
        clinicalSummary,
        recommendations,
        patientComments: patientComments || convertedComments,
        clinicalData: clinicalData || {},
        extractionMethod: "split-night-comprehensive",
        timestamp: new Date().toISOString()
      };

      console.log("=== SPLIT-NIGHT RESPONSE ===");
      console.log(JSON.stringify(response, null, 2));

      return new Response(
        JSON.stringify(response),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Generate Clinical Summary and Recommendations for regular studies
    const clinicalSummary = generateClinicalSummary(extractedData, studyType, clinicalData);
    const recommendations = generateRecommendations(extractedData, studyType, clinicalData);

    // Format comprehensive response with ALL extracted data
    const response = {
      patientInfo: extractedData.patientInfo || {
        name: null,
        firstName: null,
        age: null,
        gender: null
      },
      studyInfo: extractedData.studyInfo || {
        studyType,
        lightsOff: null,
        lightsOn: null,
        timeInBed: null,
        totalSleepTime: null,
        sleepLatency: null,
        remLatency: null
      },
      sleepArchitecture: extractedData.sleepArchitecture || {
        sleepEfficiency: null,
        stage1Percent: null,
        stage2Percent: null,
        stage3Percent: null,
        stage4Percent: null,
        slowWaveSleepPercent: null,
        remPercent: null,
        remCycles: null
      },
      respiratoryEvents: extractedData.respiratoryEvents || {
        ahiOverall: null,
        ahiNrem: null,
        ahiRem: null,
        ahiSupine: null,
        ahiLeft: null,
        ahiRight: null,
        ahiLateral: null,
        centralApneaIndex: null,
        obstructiveApneaIndex: null,
        mixedApneaIndex: null,
        hypopneaIndex: null,
        meanHypopneaDuration: null
      },
      oxygenation: extractedData.oxygenation || {
        lowestSpO2: null,
        averageSpO2: null,
        desaturationIndex: null,
        timeBelow90Percent: null,
        timeBelow95Percent: null,
        calculations: {
          tst: null,
          under90REM: null,
          under90NREM: null,
          under95REM: null,
          under95NREM: null
        }
      },
      cardiacData: extractedData.cardiacData || {
        meanHeartRateNrem: null,
        meanHeartRateRem: null
      },
      additionalMetrics: extractedData.additionalMetrics || {
        arousalIndex: null,
        snoringMinutes: null,
        snoringPercent: null,
        legMovementIndex: null,
        leftPositionIndex: null,
        rightPositionIndex: null,
        supinePositionIndex: null,
        ahiLateral: null
      },
      clinicalSummary,
      recommendations,
      patientComments: patientComments || (clinicalData?.selectedComments ? convertPatientComments(clinicalData.selectedComments) : []),
      extractionMethod: "comprehensive-medical-grade",
      timestamp: new Date().toISOString()
    };

    console.log("=== FINAL COMPREHENSIVE RESPONSE ===");
    console.log(JSON.stringify(response, null, 2));

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        extractedData: null 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});