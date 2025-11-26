import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Universal Text Extractor Pipeline - Raw text processing with regex fallback
async function extractSleepMetrics(rawText: string, apiKey: string) {
  console.log("=== UNIVERSAL EXTRACTION PIPELINE START ===");
  console.log("Raw text length:", rawText.length);
  
  // DEBUG: Show sample of raw text
  console.log("=== DEBUG: Raw text sample (first 1000 chars) ===");
  console.log(rawText.substring(0, 1000));
  
  // Extract TST first - needed for calculations
  let totalSleepTime: number | null = null;
  const tstMatch = rawText.match(/Total Sleep Time[:\s]+(\d+\.?\d*)\s*min/i) || 
                    rawText.match(/TST[:\s]+(\d+\.?\d*)\s*min/i) ||
                    rawText.match(/TST[:\s]+(\d+\.?\d*)/i);
  if (tstMatch) {
    totalSleepTime = parseFloat(tstMatch[1]);
    console.log("✅ Found TST:", totalSleepTime, "minutes");
  } else {
    console.log("⚠️ TST not found");
  }

  // IMPROVED REGEX FALLBACK - Extract values more robustly
  let regexResults = {
    desatIndex: null as number | null,
    hypopneaMean: null as number | null,
    under90REM: null as number | null,
    under90NREM: null as number | null,
    under95REM: null as number | null,
    under95NREM: null as number | null
  };

  console.log("=== DEBUG: Starting regex extraction ===");

  // Extract Desaturation Index - TOTAL column only (rightmost value)
  // Pattern: Desat Index (#/hour) WK REM NREM TOTAL
  // We want the TOTAL (4th number, rightmost)
  const desatMatch = rawText.match(/Desat(?:uration)?\s+Index\s*\(#\/hour\)[^\n]*?(\d+\.?\d*)\s*$/m) ||
                      rawText.match(/Desat(?:uration)?\s+Index\s*\(#\/hour\)[^\n]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i);
  if (desatMatch) {
    // If we matched 4 groups, take the last one (TOTAL)
    regexResults.desatIndex = desatMatch[4] ? parseFloat(desatMatch[4]) : parseFloat(desatMatch[1]);
    console.log("✅ Regex found Desat Index (TOTAL):", regexResults.desatIndex);
  } else {
    console.log("⚠️ Desat Index not found");
  }

  // Extract Hypopnea Mean Duration from "Mean (seconds)" row, HYP column
  const hypopneaMatch = rawText.match(/Mean\s*\(seconds\)[^\n]*?HYP[^\n]*?(\d+\.?\d*)/i) ||
                         rawText.match(/HYP[^\n]*?Mean[^\n]*?(\d+\.?\d*)\s*sec/i) ||
                         rawText.match(/Hypopnea[^\n]*?Mean\s*Duration[^\n]*?(\d+\.?\d*)/i);
  if (hypopneaMatch) {
    regexResults.hypopneaMean = parseFloat(hypopneaMatch[1]);
    console.log("✅ Regex found Hypopnea Mean:", regexResults.hypopneaMean);
  } else {
    console.log("⚠️ Hypopnea Mean not found");
  }

  // Extract Oxygen saturation values from Oximetry Distribution table
  // Pattern: <90 | % | REM (min) | NREM (min) | TOTAL
  // We need REM and NREM columns (2nd and 3rd values)
  const oxy90Match = rawText.match(/<\s*90[^\n]*?(\d+\.?\d*)[^\d]*(\d+\.?\d*)[^\d]*(\d+\.?\d*)/i);
  if (oxy90Match) {
    // First value is %, second is REM, third is NREM
    regexResults.under90REM = parseFloat(oxy90Match[2]);
    regexResults.under90NREM = parseFloat(oxy90Match[3]);
    console.log("✅ Regex found <90%: REM =", regexResults.under90REM, "NREM =", regexResults.under90NREM);
  } else {
    console.log("⚠️ <90% values not found");
  }

  const oxy95Match = rawText.match(/<\s*95[^\n]*?(\d+\.?\d*)[^\d]*(\d+\.?\d*)[^\d]*(\d+\.?\d*)/i);
  if (oxy95Match) {
    regexResults.under95REM = parseFloat(oxy95Match[2]);
    regexResults.under95NREM = parseFloat(oxy95Match[3]);
    console.log("✅ Regex found <95%: REM =", regexResults.under95REM, "NREM =", regexResults.under95NREM);
  } else {
    console.log("⚠️ <95% values not found");
  }

  console.log("=== DEBUG: Regex results ===", regexResults);

  // DETAILED AI PROMPT - Based on user's extraction rules
  const prompt = `## 🔍 CRITICAL EXTRACTION TASK

You are extracting specific metrics from a sleep study medical report. Follow these rules EXACTLY.

### 📋 EXTRACTION RULES

**1. Oximetry Distribution Table (Usually PAGE 6)**
Find the table with columns: | SpO2 Range | % | REM (min) | NREM (min) | TOTAL |

For "<90" row:
- Extract REM column value (in minutes)
- Extract NREM column value (in minutes)  
- Calculate: ((REM + NREM) / TST) * 100
- TST = ${totalSleepTime || 'FIND IN DOCUMENT'} minutes

For "<95" row:
- Extract REM column value (in minutes)
- Extract NREM column value (in minutes)
- Calculate: ((REM + NREM) / TST) * 100

**2. Respiratory Events Summary Table (Usually PAGE 4)**
Find the table with "Mean (seconds)" row
- Look for "HYP" column (Hypopnea)
- Extract the numeric value in seconds

**3. Oximetry Summary Table (Usually PAGE 6)**
Find "Desat Index (#/hour)" row (NOT "Desat Index (dur/hour)")
Table structure:
                        WK    REM   NREM  TOTAL
Desat Index (#/hour)   X.X   X.X   X.X   X.X  ← Extract TOTAL (rightmost value) ONLY

**CRITICAL**: 
- DO NOT return example values
- Extract ACTUAL values from the document
- If you cannot find a value, use null
- Return calculations separately

### 📤 REQUIRED OUTPUT FORMAT

Return ONLY this JSON structure with ACTUAL extracted values:

{
  "oxygenUnder90Percent": null,
  "oxygenUnder95Percent": null,
  "hypopneaMeanDuration": null,
  "desaturationIndex": null,
  "calculations": {
    "tst": null,
    "under90REM": null,
    "under90NREM": null,
    "under95REM": null,
    "under95NREM": null
  }
}

### 📄 DOCUMENT TEXT (First 15,000 characters):

${rawText.substring(0, 15000)}`;

  try {
    console.log("=== Sending to Lovable AI (Gemini) ===");
    console.log("Prompt length:", prompt.length);
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 800,
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
    console.log("=== AI Response ===");
    console.log(JSON.stringify(data, null, 2));
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid AI response structure");
    }

    let result = data.choices[0].message.content.trim();
    
    // Extract JSON from markdown if wrapped
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = jsonMatch[0];
    }
    
    result = result.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    const parsed = JSON.parse(result);
    console.log("=== Parsed AI Result ===", parsed);
    
    // Calculate percentages if AI provided raw values
    let oxygenUnder90Percent = parsed.oxygenUnder90Percent;
    let oxygenUnder95Percent = parsed.oxygenUnder95Percent;
    
    // If AI returned calculations but not percentages, calculate them
    if (!oxygenUnder90Percent && parsed.calculations?.under90REM && parsed.calculations?.under90NREM && parsed.calculations?.tst) {
      const tst = parsed.calculations.tst;
      const sum90 = parsed.calculations.under90REM + parsed.calculations.under90NREM;
      oxygenUnder90Percent = ((sum90 / tst) * 100).toFixed(2);
      console.log(`Calculated O2 <90%: (${parsed.calculations.under90REM} + ${parsed.calculations.under90NREM}) / ${tst} * 100 = ${oxygenUnder90Percent}%`);
    }
    
    if (!oxygenUnder95Percent && parsed.calculations?.under95REM && parsed.calculations?.under95NREM && parsed.calculations?.tst) {
      const tst = parsed.calculations.tst;
      const sum95 = parsed.calculations.under95REM + parsed.calculations.under95NREM;
      oxygenUnder95Percent = ((sum95 / tst) * 100).toFixed(2);
      console.log(`Calculated O2 <95%: (${parsed.calculations.under95REM} + ${parsed.calculations.under95NREM}) / ${tst} * 100 = ${oxygenUnder95Percent}%`);
    }
    
    // Merge AI results with regex fallback
    const merged = {
      oxygenUnder90Percent: oxygenUnder90Percent || (
        totalSleepTime && regexResults.under90REM !== null && regexResults.under90NREM !== null
          ? (((regexResults.under90REM + regexResults.under90NREM) / totalSleepTime) * 100).toFixed(2)
          : null
      ),
      oxygenUnder95Percent: oxygenUnder95Percent || (
        totalSleepTime && regexResults.under95REM !== null && regexResults.under95NREM !== null
          ? (((regexResults.under95REM + regexResults.under95NREM) / totalSleepTime) * 100).toFixed(2)
          : null
      ),
      hypopneaMeanDuration: parsed.hypopneaMeanDuration || regexResults.hypopneaMean,
      desaturationIndex: parsed.desaturationIndex || regexResults.desatIndex,
      calculations: {
        tst: parsed.calculations?.tst || totalSleepTime,
        under90REM: parsed.calculations?.under90REM || regexResults.under90REM,
        under90NREM: parsed.calculations?.under90NREM || regexResults.under90NREM,
        under95REM: parsed.calculations?.under95REM || regexResults.under95REM,
        under95NREM: parsed.calculations?.under95NREM || regexResults.under95NREM
      }
    };
    
    console.log("✅ Extraction successful (AI + Regex fallback):", merged);
    console.log("=== UNIVERSAL EXTRACTION PIPELINE END ===");
    
    return merged;
    
  } catch (error) {
    console.error("❌ AI Extraction error:", error);
    console.log("⚠️ Falling back to regex-only extraction");
    console.log("=== UNIVERSAL EXTRACTION PIPELINE END ===");
    
    // Return regex results on AI error
    return {
      oxygenUnder90Percent: totalSleepTime && regexResults.under90REM !== null && regexResults.under90NREM !== null
        ? (((regexResults.under90REM + regexResults.under90NREM) / totalSleepTime) * 100).toFixed(2)
        : null,
      oxygenUnder95Percent: totalSleepTime && regexResults.under95REM !== null && regexResults.under95NREM !== null
        ? (((regexResults.under95REM + regexResults.under95NREM) / totalSleepTime) * 100).toFixed(2)
        : null,
      hypopneaMeanDuration: regexResults.hypopneaMean,
      desaturationIndex: regexResults.desatIndex,
      calculations: {
        tst: totalSleepTime,
        under90REM: regexResults.under90REM,
        under90NREM: regexResults.under90NREM,
        under95REM: regexResults.under95REM,
        under95NREM: regexResults.under95NREM
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

    // Extract metrics using universal pipeline with regex fallback
    const metrics = await extractSleepMetrics(rawText || '', lovableApiKey);

    // Format final response
    const response = {
      extractedData: {
        patientName: "Patient Name",
        studyDate: new Date().toISOString().split('T')[0],
        studyType: studyType || "PSG",
        totalSleepTime: metrics.calculations?.tst || null,
        sleepEfficiency: null,
        sleepLatency: null,
        remLatency: null,
        arousalIndex: null,
        oxygenUnder90Percent: metrics.oxygenUnder90Percent,
        oxygenUnder95Percent: metrics.oxygenUnder95Percent,
        lowestO2: null,
        averageO2: null,
        hypopneaMeanDuration: metrics.hypopneaMeanDuration,
        desaturationIndex: metrics.desaturationIndex,
      },
      rawMetrics: metrics,
      extractionMethod: "universal-pipeline",
      timestamp: new Date().toISOString()
    };

    console.log("=== FINAL RESPONSE ===");
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