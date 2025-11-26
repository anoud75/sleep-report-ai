import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Universal Text Extractor Pipeline - Simplified AI-based extraction
async function extractSleepMetrics(tables: string[][][], rawText: string, apiKey: string) {
  console.log("=== UNIVERSAL EXTRACTION PIPELINE START ===");
  console.log("Number of tables received:", tables.length);
  
  // Format tables as clean markdown for AI
  const formattedTables = tables.map((table, idx) => {
    if (table.length === 0) return '';
    
    const header = table[0].join(' | ');
    const separator = table[0].map(() => '---').join(' | ');
    const rows = table.slice(1).map(row => row.join(' | ')).join('\n');
    
    return `\n### Table ${idx + 1}\n${header}\n${separator}\n${rows}\n`;
  }).join('\n');

  // Extract TST from raw text for calculations
  let totalSleepTime = null;
  const tstMatch = rawText.match(/Total Sleep Time.*?(\d+\.?\d*)/i) || 
                    rawText.match(/TST.*?(\d+\.?\d*)/i);
  if (tstMatch) {
    totalSleepTime = parseFloat(tstMatch[1]);
    console.log("Found TST:", totalSleepTime, "minutes");
  }

  const prompt = `Extract sleep study metrics from structured tables below. Return ONLY valid JSON.

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
   - Find "Oximetry Distribution" table
   - Locate row: "<90" or "< 90%"
   - Extract REM and NREM columns (2nd and 3rd values)
   - Formula: ((REM + NREM) / TST) * 100
   - TST = ${totalSleepTime || 'find in document'} minutes

2. % Time with O2 < 95%:
   - Same table, row: "<95" or "< 95%"
   - Extract REM and NREM values
   - Formula: ((REM + NREM) / TST) * 100

3. Hypopnea Mean Duration:
   - Find "Respiratory Events Summary" table
   - Locate row: "Mean (seconds)" or "Mean Duration"
   - Find column: "Hyp" or "Hypopnea"
   - Extract the numeric value

4. Desaturation Index:
   - Same oximetry table
   - Find row: "Desat Index (#/hour)" (NOT dur/hour)
   - Extract TOTAL column (rightmost value)

TABLES:
${formattedTables}

RAW TEXT CONTEXT:
${rawText.substring(0, 3000)}`;

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
    console.log("✅ Extraction successful:", parsed);
    console.log("=== UNIVERSAL EXTRACTION PIPELINE END ===");
    
    return parsed;
    
  } catch (error) {
    console.error("Extraction error:", error);
    console.log("=== UNIVERSAL EXTRACTION PIPELINE END ===");
    
    // Return safe defaults on error
    return {
      oxygenUnder90Percent: "0.0",
      oxygenUnder95Percent: "0.0",
      hypopneaMeanDuration: null,
      desaturationIndex: null,
      calculations: null
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { htmlContent, rawText, tables, studyType } = await req.json();
    
    console.log("=== REQUEST RECEIVED ===");
    console.log("Study Type:", studyType);
    console.log("Tables count:", tables?.length || 0);
    console.log("Raw text length:", rawText?.length || 0);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Extract metrics using universal pipeline
    const metrics = await extractSleepMetrics(tables || [], rawText || '', lovableApiKey);

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