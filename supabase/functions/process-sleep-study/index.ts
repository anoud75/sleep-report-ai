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
    const maxContentLength = 8000;
    const truncatedContent = fileContent.length > maxContentLength 
      ? fileContent.substring(0, maxContentLength) + "\n\n[Content truncated...]"
      : fileContent;

    const prompt = `You are a medical AI specialist analyzing sleep study reports. Extract specific numerical values and data from this sleep study report.

CRITICAL: Look for these EXACT patterns and extract the numerical values:

Sleep Timing:
- Look for "Lights Off:" or "Light off:" or similar → extract time
- Look for "Lights On:" or "Light on:" or similar → extract time
- Look for "Time in Bed" → extract minutes
- Look for "Total Sleep Time" or "TST" → extract minutes

Sleep Quality:
- Look for "Sleep Latency" → extract minutes
- Look for "REM Latency" → extract minutes  
- Look for "Sleep Efficiency" → extract percentage

Sleep Stages (look for percentages):
- Look for "Stage 1" or "N1" → extract percentage
- Look for "Stage 2" or "N2" → extract percentage
- Look for "Slow Wave Sleep" or "Stage 3" or "N3" → extract percentage
- Look for "REM Sleep" or "REM" → extract percentage

Respiratory Events (look for rates per hour):
- Look for "AHI" or "Apnea-Hypopnea Index" → extract value
- Look for "Central Apnea Index" → extract value
- Look for "Obstructive Apnea Index" → extract value
- Look for "Mixed Apnea Index" → extract value
- Look for "Hypopnea Index" → extract value

Other Metrics:
- Look for "Desaturation Index" → extract value
- Look for "Arousal Index" → extract value
- Look for "Snoring" → extract percentage
- Look for "Lowest O2" or "Nadir" → extract percentage
- Look for "Average O2" → extract percentage

Study Type: ${studyType}

FILE CONTENT TO ANALYZE:
${truncatedContent}

Return ONLY valid JSON in this exact format. If a value is not found, use "---":
{
  "lightOff": "value",
  "lightOn": "value",
  "timeInBed": "value",
  "totalSleepTime": "value",
  "cpapBpapO2": "---",
  "sleepLatency": "value",
  "remLatency": "value",
  "sleepEfficiency": "value",
  "stage1": "value",
  "stage2": "value",
  "slowWave": "value",
  "rem": "value",
  "ahiNremRem": "value",
  "ahiSupineLateral": "---",
  "centralApneaIndex": "value",
  "obstructiveApneaIndex": "value",
  "mixedApneaIndex": "value",
  "hypopneaIndex": "value",
  "hypopneaMeanDuration": "---",
  "heartRateNremRem": "---",
  "desaturationIndex": "value",
  "timeO2Below90": "---",
  "timeO2Below95": "---",
  "lowestO2AverageO2": "value",
  "arousalIndex": "value",
  "snoring": "value",
  "legMovementIndex": "---",
  "summary": "Brief clinical interpretation of the findings"
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
            content: 'You are a medical AI expert specializing in sleep study analysis. Extract exact values from reports. Return only valid JSON with no additional text or markdown.' 
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