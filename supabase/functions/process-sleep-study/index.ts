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

    const prompt = `🧠 PURPOSE OF THE TOOL:
You are an AI sleep study report generator. Your task is to:
- Read raw .docx sleep study reports exported from G3 systems
- Extract and calculate key clinical metrics
- Generate a professional, clinical-grade sleep report
- Write clear, structured diagnostic summaries based on extracted data

📁 UPLOAD LOGIC & VALIDATION:
- Only accept .docx files exported from G3 sleep systems
- Extract diagnostic interpretation for all study types
- For Split-Night studies: Use diagnostic data from first file, treatment data from second file

🧮 DATA EXTRACTION (All values found in structured tables):
Extract the following metrics exactly as they appear in the document:

🛏️ SLEEP PARAMETERS:
- Light Off: Time the recording starts (e.g., "22:15")
- Light On: Time the recording ends (e.g., "06:30") 
- Time in Bed (min): Total recording time
- Total Sleep Time (min): Actual sleep duration
- Sleep Latency (min): Time to fall asleep
- REM Latency (min): Time to first REM
- Sleep Efficiency (%): TST/TIB ratio

🧠 SLEEP ARCHITECTURE:
- Sleep Stage 1 (%)
- Sleep Stage 2 (%)
- Slow Wave Sleep (SWS, %)
- REM Sleep (%)

😴 RESPIRATORY DATA:
- AHI overall: Main apnea-hypopnea index
- AHI NREM/REM: Separate values for each sleep stage
- AHI Supine/Lateral: Position-specific values (if available)
- Central Apnea Index (/hr)
- Obstructive Apnea Index (/hr)
- Mixed Apnea Index (/hr)
- Hypopnea Index (/hr)
- Hypopnea Mean Duration (sec)

💓 CARDIAC & OXYGENATION:
- Heart Rate (NREM/REM): Both values
- Oxygen Desaturation Index (/hr)
- % Time SpO2 < 90%
- % Time SpO2 < 95%
- Lowest O2 Saturation (%)
- Average O2 Saturation (%)

⚡ AROUSALS & MOVEMENT:
- Arousal Index (/hr)
- Snoring (% time)
- Leg Movement Index (/hr)
- If PLM index > 15/hr → note presence of Periodic Limb Movements (PLMS)

🧠 INTERPRETATION RULES:
Follow AASM guidelines:

AHI Classification:
- Normal: < 5/hr
- Mild OSA: 5–14/hr  
- Moderate OSA: 15–29/hr
- Severe OSA: ≥ 30/hr

PLMS:
- If Leg Movement Index > 15/hr, include: "There were periodic limb movements during sleep."

Study Type: ${studyType}

FILE CONTENT TO ANALYZE:
${truncatedContent}

🚫 CRITICAL EXTRACTION RULES:
1. Extract EXACT values as they appear in the document
2. Do NOT estimate or calculate missing values
3. Use "---" for any values not found
4. Look for structured tables with clear metric labels
5. Follow medical terminology exactly

Return ONLY valid JSON with these exact field names:
{
  "lightOff": "exact time value",
  "lightOn": "exact time value", 
  "timeInBed": "exact number in minutes",
  "totalSleepTime": "exact number in minutes",
  "sleepLatency": "exact number in minutes",
  "remLatency": "exact number in minutes",
  "sleepEfficiency": "exact percentage number",
  "stage1": "exact percentage",
  "stage2": "exact percentage", 
  "slowWave": "exact percentage",
  "rem": "exact percentage",
  "ahiOverall": "main AHI value",
  "ahiNremRem": "NREM/REM format or main value if not split",
  "ahiSupineLateral": "supine/lateral format if available, else use main AHI",
  "centralApneaIndex": "exact value or ---",
  "obstructiveApneaIndex": "exact value or ---",
  "mixedApneaIndex": "exact value or ---", 
  "hypopneaIndex": "exact value or ---",
  "hypopneaMeanDuration": "duration in seconds or ---",
  "heartRateNremRem": {"NREM": "value", "REM": "value"} or "single value if not split",
  "desaturationIndex": "exact value",
  "timeO2Below90": "percentage",
  "timeO2Below95": "percentage",
  "lowestO2": "percentage value",
  "averageO2": "percentage value",
  "arousalIndex": "exact value",
  "snoring": "percentage",
  "legMovementIndex": "exact value",
  "cpapBpapO2": "any CPAP/BPAP settings mentioned or ---",
  "summary": "Generate professional clinical summary following this structure: 'This [study type] study revealed [severity classification] with an AHI of [X]/hr. Total sleep time was [X] minutes with a sleep efficiency of [X]%. Sleep architecture showed [brief stage distribution]. Oxygen desaturation index was [X]/hr with [X]% of sleep time below 90% saturation. Arousal index was [X]/hr. [Add PLMS note if leg movement index >15]. [Add treatment summary if applicable].' Use proper medical terminology and OSA severity classification based on AHI values."
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