import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Universal extraction for ALL sleep study metrics
async function extractSleepMetrics(rawText: string, apiKey: string, studyType: string) {
  console.log("=== COMPREHENSIVE EXTRACTION PIPELINE START ===");
  console.log("Raw text length:", rawText.length);
  console.log("Study Type:", studyType);
  
  // DEBUG: Show raw text sample
  console.log("=== DEBUG: Raw text sample (first 2000 chars) ===");
  console.log(rawText.substring(0, 2000));

  // COMPREHENSIVE MEDICAL-GRADE AI PROMPT
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

### PAGE 2: Sleep Architecture
- **Sleep Efficiency**: "General" block → "Sleep efficiency 1" (%)
- **REM Duration & %**: "Sleep Stages Distribution" table → "REM" row
- **S1 Episodes & %**: "S1" row
- **S2 Episodes**: "S2" row
- **S3 Episodes & %**: "S3" row (slow wave sleep)
- **REM Cycles**: "SLEEP DATA 3" section count

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
- **Average SpO2**: "Average (%)" row
- **Desaturation Index**: "Desat Index (#/hour)" row → TOTAL column (rightmost number ONLY)
- **Arousal Index**: Extract from "Arousal index" line

### PAGE 7: Movement & Position
- **Snoring Duration & %**: "Total duration with snoring"
- **Leg Movement Index**: "Leg movements" → "Index" column
- **Left Position Index**: "L" row → "Index (#/h)" column
- **Right Position Index**: "R" row → "Index (#/h)" column
- **Supine Position Index**: "S/SL" row → "Index (#/h)" column
- **AHI Lateral**: Calculate (Right + Left) / 2 if both exist

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
    "centralApneaIndex": "number or null",
    "obstructiveApneaIndex": "number or null",
    "mixedApneaIndex": "number or null",
    "hypopneaIndex": "number or null",
    "meanHypopneaDuration": "number (seconds) or null"
  },
  "oxygenation": {
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
    
    // Calculate AHI Lateral if position indices exist
    if (!parsed.additionalMetrics?.ahiLateral && 
        typeof parsed.additionalMetrics?.leftPositionIndex === 'number' && 
        typeof parsed.additionalMetrics?.rightPositionIndex === 'number') {
      parsed.additionalMetrics.ahiLateral = parseFloat(((parsed.additionalMetrics.leftPositionIndex + parsed.additionalMetrics.rightPositionIndex) / 2).toFixed(2));
      console.log(`✅ Calculated AHI Lateral: (${parsed.additionalMetrics.leftPositionIndex} + ${parsed.additionalMetrics.rightPositionIndex}) / 2 = ${parsed.additionalMetrics.ahiLateral}`);
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
        remPercent: null,
        remCycles: null
      },
      respiratoryEvents: {
        ahiOverall: null,
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rawText, studyType } = await req.json();
    
    console.log("=== REQUEST RECEIVED ===");
    console.log("Study Type:", studyType);
    console.log("Raw text length:", rawText?.length || 0);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Extract ALL metrics using comprehensive pipeline
    const extractedData = await extractSleepMetrics(rawText || '', lovableApiKey, studyType);

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
        remPercent: null,
        remCycles: null
      },
      respiratoryEvents: extractedData.respiratoryEvents || {
        ahiOverall: null,
        ahiNrem: null,
        ahiRem: null,
        centralApneaIndex: null,
        obstructiveApneaIndex: null,
        mixedApneaIndex: null,
        hypopneaIndex: null,
        meanHypopneaDuration: null
      },
      oxygenation: extractedData.oxygenation || {
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