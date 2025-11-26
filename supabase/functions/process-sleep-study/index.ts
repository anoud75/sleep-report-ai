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
  
  // Extract TST first - needed for calculations
  let totalSleepTime: number | null = null;
  const tstMatch = rawText.match(/Total Sleep Time[:\s]+(\d+\.?\d*)\s*min/i) || 
                    rawText.match(/TST[:\s]+(\d+\.?\d*)\s*min/i) ||
                    rawText.match(/TST[:\s]+(\d+\.?\d*)/i);
  if (tstMatch) {
    totalSleepTime = parseFloat(tstMatch[1]);
    console.log("Found TST:", totalSleepTime, "minutes");
  }

  // Try regex extraction first as fallback
  let regexResults = {
    desatIndex: null as number | null,
    hypopneaMean: null as number | null,
    under90REM: null as number | null,
    under90NREM: null as number | null,
    under95REM: null as number | null,
    under95NREM: null as number | null
  };

  // Extract Desaturation Index
  const desatMatch = rawText.match(/Desat(?:uration)?\s+Index\s*\(#\/hour\)[:\s]+(\d+\.?\d*)/i);
  if (desatMatch) {
    regexResults.desatIndex = parseFloat(desatMatch[1]);
    console.log("Regex found Desat Index:", regexResults.desatIndex);
  }

  // Extract Hypopnea Mean Duration
  const hypopneaMatch = rawText.match(/Mean\s*\(seconds\)[^\n]*HYP[^\n]*?(\d+\.?\d*)/i) ||
                         rawText.match(/Hypopnea[^\n]*Mean[^\n]*?(\d+\.?\d*)\s*sec/i);
  if (hypopneaMatch) {
    regexResults.hypopneaMean = parseFloat(hypopneaMatch[1]);
    console.log("Regex found Hypopnea Mean:", regexResults.hypopneaMean);
  }

  // Extract Oxygen saturation values from Oximetry table
  // Looking for pattern like: <90 | value | REM | NREM | TOTAL
  const oxy90Match = rawText.match(/<\s*90[^\n]*\|\s*[\d.]+\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/i);
  if (oxy90Match) {
    regexResults.under90REM = parseFloat(oxy90Match[1]);
    regexResults.under90NREM = parseFloat(oxy90Match[2]);
    console.log("Regex found <90%:", regexResults.under90REM, regexResults.under90NREM);
  }

  const oxy95Match = rawText.match(/<\s*95[^\n]*\|\s*[\d.]+\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/i);
  if (oxy95Match) {
    regexResults.under95REM = parseFloat(oxy95Match[1]);
    regexResults.under95NREM = parseFloat(oxy95Match[2]);
    console.log("Regex found <95%:", regexResults.under95REM, regexResults.under95NREM);
  }

  const prompt = `Extract sleep study metrics from the raw text below. Return ONLY valid JSON.

REQUIRED OUTPUT:
{
  "oxygenUnder90Percent": "12.5",
  "oxygenUnder95Percent": "28.3", 
  "hypopneaMeanDuration": 18.7,
  "desaturationIndex": 5.2,
  "calculations": {
    "tst": ${totalSleepTime || 'null'},
    "under90REM": 8.2,
    "under90NREM": 15.3,
    "under95REM": 12.4,
    "under95NREM": 22.1
  }
}

EXTRACTION RULES:

1. % Time with O2 < 90%:
   - Find "Oximetry Distribution" section or table
   - Locate row with "<90" or "< 90%"
   - Extract REM and NREM values (minutes)
   - Formula: ((REM + NREM) / TST) * 100
   - TST = ${totalSleepTime || 'find in document'} minutes

2. % Time with O2 < 95%:
   - Same section, find row with "<95" or "< 95%"
   - Extract REM and NREM values (minutes)
   - Formula: ((REM + NREM) / TST) * 100

3. Hypopnea Mean Duration (seconds):
   - Find "Respiratory Events Summary" section
   - Look for "Mean (seconds)" row
   - Find "HYP" or "Hypopnea" column
   - Extract the numeric value

4. Desaturation Index (#/hour):
   - Find "Desat Index (#/hour)" or "Desaturation Index"
   - Extract the TOTAL value (not dur/hour)

RAW TEXT:
${rawText.substring(0, 5000)}`;

  try {
    console.log("Sending to Lovable AI (Gemini)...");
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 600,
        messages: [{ 
          role: 'user', 
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API Error:", response.status, errorText);
      throw new Error(`AI API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI Response:", JSON.stringify(data, null, 2));
    
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
    
    // Merge AI results with regex fallback
    const merged = {
      oxygenUnder90Percent: parsed.oxygenUnder90Percent || "0.0",
      oxygenUnder95Percent: parsed.oxygenUnder95Percent || "0.0",
      hypopneaMeanDuration: parsed.hypopneaMeanDuration || regexResults.hypopneaMean,
      desaturationIndex: parsed.desaturationIndex || regexResults.desatIndex,
      calculations: {
        tst: totalSleepTime,
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
    console.error("AI Extraction error:", error);
    console.log("Falling back to regex-only extraction");
    console.log("=== UNIVERSAL EXTRACTION PIPELINE END ===");
    
    // Return regex results on AI error
    return {
      oxygenUnder90Percent: totalSleepTime && regexResults.under90REM !== null && regexResults.under90NREM !== null
        ? (((regexResults.under90REM + regexResults.under90NREM) / totalSleepTime) * 100).toFixed(2)
        : "0.0",
      oxygenUnder95Percent: totalSleepTime && regexResults.under95REM !== null && regexResults.under95NREM !== null
        ? (((regexResults.under95REM + regexResults.under95NREM) / totalSleepTime) * 100).toFixed(2)
        : "0.0",
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