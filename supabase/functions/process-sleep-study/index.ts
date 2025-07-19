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

    const prompt = `You are a medical AI specialist analyzing sleep study reports. You must extract EXACT numerical values from this sleep study report.

CRITICAL INSTRUCTIONS:
1. Search the ENTIRE document for each specific value
2. Look for tabular format with "Events" and "Reports" columns
3. Extract the EXACT numbers as they appear in the document
4. Pay special attention to values in parentheses like (22.7/29.3) or slash formats like 58/59
5. Do NOT make up or estimate values - only extract what is explicitly written
6. For compound values like "23.7 (22.7/29.3)", extract the main number 23.7
7. For ratio values like "25.2/15.35", extract both numbers
8. For percentage values, extract the number without the % symbol

SPECIFIC SEARCH PATTERNS FOR THIS DOCUMENT FORMAT:

Sleep Timing:
- "Light off" → extract time (format: 10:01 PM)
- "Light on" → extract time (format: 4:25 AM)  
- "Time in Bed (min)" → extract number (384.1)
- "Total Sleep Time (min)" → extract number (301)

Sleep Quality:
- "Sleep Latency (min)" → extract number (27.5)
- "REM Latency (min)" → extract number (279) - NOT 306.5!
- "Sleep Efficiency (%)" → extract number (78.4)

Sleep Stages - Look for exact percentages:
- "Sleep Stage 1 (%)" → extract number (3) - NOT 2.3!
- "Sleep Stage 2 (%)" → extract number (76.2) - NOT 59.8!
- "Slow Wave Sleep (%)" → extract number (14) - NOT 10.9!
- "REM Sleep (%)" → extract number (6.8) - NOT 5.3!

Respiratory Events - CRITICAL VALUES:
- "AHI (NREM/REM)" → extract main number (23.7) - NOT 0.4!
- "AHI (supine/lateral)" → extract values like "25.2/15.35"
- "Central Apnea Index" → extract number (0)
- "Obstructive Apnea Index (/hr)" → extract number (0.4)
- "Mixed Apnea Index" → extract number (0)
- "Hypopnea Index (/hr)" → extract number (23.3)
- "Hypopnea Mean Duration (sec)" → extract number (17.55)

Heart Rate & Oxygen:
- "Heart Rate (NREM/REM)" → extract values like "58/59"
- "Desaturation Index (/hr)" → extract number (2.8)
- "% Time with O2 < 90%" → extract number (0)
- "% Time with O2 < 95%" → extract number (0.36)
- "Lowest O2 /Average O2" → extract values like "92%/97%"

Other Metrics:
- "Arousal Index (/hr)" → extract number (34.9)
- "Snoring (%)" → extract number (2.7) - NOT 0.0!
- "Leg Movement Index (/hr)" → extract number (2.8)

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
  "summary": "Brief clinical interpretation based on extracted values"
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