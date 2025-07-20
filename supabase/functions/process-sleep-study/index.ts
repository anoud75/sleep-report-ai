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
    const { fileContent, studyType } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Truncate file content if too long to avoid token limits
    const maxContentLength = 15000;
    const truncatedContent = fileContent.length > maxContentLength 
      ? fileContent.substring(0, maxContentLength) + "\n\n[Content truncated...]"
      : fileContent;

    console.log('Processing file content length:', fileContent.length);

    const prompt = `You are a medical AI specialist analyzing G3 sleep study reports. Extract EXACT values from specific sections as detailed below.

🚫 CRITICAL RULES:
1. Do NOT rely on color highlighting - extract from document structure only
2. Only extract specific values listed below from their exact locations
3. Do NOT calculate or include any value that is 0
4. Extract EXACT numbers as they appear - do not estimate
5. Look for tabular format with "Events" and "Reports" columns

📍 EXTRACTION LOCATIONS & RULES:

SLEEP TIMING (from "Study Information" section):
- Light Off: Look for "Lights Off:" or "Light off" → extract time (e.g., "10:01 PM")
- Light On: Look for "Lights On:" or "Light on" → extract time (e.g., "4:25 AM")
- Time in Bed: Look for "Time in Bed" → extract minutes (e.g., "384.1")
- Total Sleep Time: Look for "Total Sleep Time" → extract minutes (e.g., "301")

SLEEP QUALITY:
- Sleep Latency: Extract from sleep latency field (e.g., "27.5")
- REM Latency: Extract from REM latency field (e.g., "279")
- Sleep Efficiency: Extract percentage (e.g., "78.4")

SLEEP STAGES (from "Sleep Stages" table):
- Sleep Stage 1 (%): Extract exact percentage (e.g., "3")
- Sleep Stage 2 (%): Extract exact percentage (e.g., "76.2")
- Slow Wave Sleep (%): Extract exact percentage (e.g., "14")
- REM Sleep (%): Extract exact percentage (e.g., "6.8")

RESPIRATORY EVENTS (from "Respiratory Events" table):
- AHI (NREM/REM): Extract the main AHI value (e.g., "23.7" from "23.7 (22.7/29.3)")
- AHI (Supine/Lateral): Extract supine value and lateral value (e.g., "25.2/15.35")
- Central Apnea Index: Extract exact value
- Obstructive Apnea Index: Extract exact value  
- Mixed Apnea Index: Extract exact value
- Hypopnea Index: Extract exact value
- Hypopnea Mean Duration: Extract duration in seconds

OXYGEN & HEART RATE:
- Heart Rate (NREM/REM): Extract both values (e.g., "58/59")
- Desaturation Index: Extract exact value (e.g., "2.8")
- % Time with O2 < 90%: Extract percentage (e.g., "0")
- % Time with O2 < 95%: Extract percentage (e.g., "0.36")
- Lowest O2/Average O2: Extract both values (e.g., "92%/97%")

OTHER METRICS:
- Arousal Index: Extract from arousal events section (e.g., "34.9")
- Snoring (%): Extract from snoring events (e.g., "2.7")
- Leg Movement Index: Extract from limb movements (e.g., "2.8")

CPAP/BPAP/O2: Look for any mention of CPAP, BPAP, or oxygen use. If not mentioned, use "---"

Study Type: ${studyType}

FILE CONTENT TO ANALYZE:
${truncatedContent}

RETURN EXACT VALUES AS FOUND IN THE DOCUMENT. Use the exact format shown in examples above.

Return ONLY valid JSON with these exact field names:
{
  "lightOff": "exact time value",
  "lightOn": "exact time value", 
  "timeInBed": "exact number",
  "totalSleepTime": "exact number",
  "cpapBpapO2": "search document or use ---",
  "sleepLatency": "exact number",
  "remLatency": "exact number (should be 279)",
  "sleepEfficiency": "exact percentage number",
  "stage1": "exact percentage (should be 3)",
  "stage2": "exact percentage (should be 76.2)", 
  "slowWave": "exact percentage (should be 14)",
  "rem": "exact percentage (should be 6.8)",
  "ahiNremRem": "main AHI value (should be 23.7)",
  "ahiSupineLateral": "supine/lateral format like 25.2/15.35",
  "centralApneaIndex": "exact value",
  "obstructiveApneaIndex": "exact value",
  "mixedApneaIndex": "exact value", 
  "hypopneaIndex": "exact value",
  "hypopneaMeanDuration": "duration in seconds (should be 17.55)",
  "heartRateNremRem": {"NREM": "58", "REM": "59"},
  "desaturationIndex": "exact value (should be 2.8)",
  "timeO2Below90": "percentage (should be 0)",
  "timeO2Below95": "percentage (should be 0.36)",
  "lowestO2AverageO2": {"lowest": "92", "average": "97"},
  "arousalIndex": "exact value (should be 34.9)",
  "snoring": "percentage (should be 2.7)",
  "legMovementIndex": "exact value (should be 2.8)",
  "summary": "Generate summary using this EXACT template: 'Overnight sleep study shows evidence of [Severity] Obstructive Sleep Apnea. The patient slept for a total sleep time of [X hours and Y minutes] with an AHI of [Z] events per hour associated with [minimal/significant] desaturation and repetitive sleep interruptions. However, she progressed into all sleep stages. Otherwise, no unusual events were noted.' Use these rules: AHI <5=Normal, 5-14.9=Mild, 15-29.9=Moderate, ≥30=Severe. Use 'significant' if lowest O2 <88% or Desaturation Index >15, else use 'minimal'. Convert total sleep time from minutes to hours+minutes format."
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
          { role: 'user', content: prompt }
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
      // Fallback to empty data if parsing fails
      extractedData = {
        lightOff: "---",
        lightOn: "---",
        timeInBed: "---",
        totalSleepTime: "---",
        cpapBpapO2: "---",
        sleepLatency: "---",
        remLatency: "---",
        sleepEfficiency: "---",
        stage1: "---",
        stage2: "---",
        slowWave: "---",
        rem: "---",
        ahiNremRem: "---",
        ahiSupineLateral: "---",
        centralApneaIndex: "---",
        obstructiveApneaIndex: "---",
        mixedApneaIndex: "---",
        hypopneaIndex: "---",
        hypopneaMeanDuration: "---",
        heartRateNremRem: "---",
        desaturationIndex: "---",
        timeO2Below90: "---",
        timeO2Below95: "---",
        lowestO2AverageO2: "---",
        arousalIndex: "---",
        snoring: "---",
        legMovementIndex: "---",
        summary: "Unable to parse sleep study report. Please check the file format."
      };
    }

    // Return the extracted data directly from AI analysis
    const processedData = {
      ...extractedData,
      patientInfo: {
        name: "Sleep Study Patient",
        dob: "N/A",
        studyDate: new Date().toLocaleDateString(),
        studyType: studyType
      },
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