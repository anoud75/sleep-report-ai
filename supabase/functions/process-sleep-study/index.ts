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
    const maxContentLength = 12000;
    const truncatedContent = fileContent.length > maxContentLength 
      ? fileContent.substring(0, maxContentLength) + "\n\n[Content truncated...]"
      : fileContent;

    console.log('Processing file content length:', fileContent.length);

    const prompt = `You are a medical AI specialist analyzing sleep study reports. Extract specific numerical values and data from this sleep study report.

CRITICAL INSTRUCTIONS:
1. Search the ENTIRE document thoroughly for each value
2. Look for various formats, abbreviations, and terminology
3. Extract exact numerical values when found
4. Only use "---" if the value is genuinely not present anywhere in the document

SEARCH PATTERNS:

Sleep Timing:
- "Lights Off", "Light off", "LO:", "Bedtime" → extract time
- "Lights On", "Light on", "Final awakening", "Wake time" → extract time  
- "Time in Bed", "TIB", "Recording time" → extract minutes
- "Total Sleep Time", "TST", "Sleep time" → extract minutes

Sleep Quality:
- "Sleep Latency", "Sleep onset latency", "Latency to sleep" → extract minutes
- "REM Latency", "REM onset", "Time to REM" → extract minutes
- "Sleep Efficiency", "Efficiency" → extract percentage

Sleep Stages (look for percentages):
- "Stage 1", "N1", "NREM 1", "Light sleep" → extract percentage
- "Stage 2", "N2", "NREM 2" → extract percentage  
- "Slow Wave Sleep", "Stage 3", "N3", "SWS", "Deep Sleep" → extract percentage
- "REM Sleep", "REM", "Stage REM" → extract percentage

Respiratory Events (/hour):
- "AHI", "Apnea-Hypopnea Index", "Apnea Hypopnea Index" → extract value
- "Central Apnea Index", "CAI", "Central AI" → extract value
- "Obstructive Apnea Index", "OAI", "Obstructive AI" → extract value
- "Mixed Apnea Index", "MAI", "Mixed AI" → extract value
- "Hypopnea Index", "HI", "Hypopnea/hour" → extract value
- "Hypopnea Mean Duration", "Hypopnea duration", "Mean hypopnea duration", "Hypopnea length" → extract seconds

Oxygen & Heart Rate:
- "Desaturation Index", "ODI", "Oxygen Desaturation Index", "Desat Index" → extract value
- "Heart Rate NREM", "HR NREM", "Heart Rate REM", "HR REM", "NREM HR", "REM HR" → extract BPM
- "Time O2 < 90%", "Time below 90%", "% time SpO2 < 90%", "SpO2 <90%" → extract percentage
- "Time O2 < 95%", "Time below 95%", "% time SpO2 < 95%", "SpO2 <95%" → extract percentage  
- "Lowest O2", "Nadir SpO2", "Minimum O2", "Min SpO2" → extract percentage
- "Average O2", "Mean SpO2", "Average SpO2", "Avg SpO2" → extract percentage

Other Metrics:
- "Arousal Index", "AI", "Arousals/hour", "Arousal/hr" → extract value
- "Snoring", "Snore", "% snoring", "Snoring time" → extract percentage
- "Leg Movement Index", "PLM Index", "PLMI", "Periodic Limb Movement", "LM Index" → extract value

Study Type: ${studyType}

FILE CONTENT TO ANALYZE:
${truncatedContent}

IMPORTANT: Extract ACTUAL values from the document. Do not return placeholder text. Return ONLY valid JSON:

{
  "lightOff": "search and extract time",
  "lightOn": "search and extract time", 
  "timeInBed": "search and extract minutes",
  "totalSleepTime": "search and extract minutes",
  "cpapBpapO2": "search for CPAP/BiPAP data or use ---",
  "sleepLatency": "search and extract minutes",
  "remLatency": "search and extract minutes",
  "sleepEfficiency": "search and extract percentage",
  "stage1": "search and extract percentage",
  "stage2": "search and extract percentage", 
  "slowWave": "search and extract percentage",
  "rem": "search and extract percentage",
  "ahiNremRem": "search and extract AHI value",
  "ahiSupineLateral": "search for positional AHI or use ---",
  "centralApneaIndex": "search and extract value",
  "obstructiveApneaIndex": "search and extract value",
  "mixedApneaIndex": "search and extract value", 
  "hypopneaIndex": "search and extract value",
  "hypopneaMeanDuration": "SEARCH THOROUGHLY for hypopnea duration in seconds",
  "heartRateNremRem": "SEARCH THOROUGHLY for heart rate values",
  "desaturationIndex": "SEARCH THOROUGHLY for ODI or desaturation index",
  "timeO2Below90": "SEARCH THOROUGHLY for time with O2 < 90%",
  "timeO2Below95": "SEARCH THOROUGHLY for time with O2 < 95%",
  "lowestO2AverageO2": "SEARCH THOROUGHLY for lowest and average O2",
  "arousalIndex": "search and extract arousal index",
  "snoring": "search and extract snoring percentage",
  "legMovementIndex": "SEARCH THOROUGHLY for PLM or leg movement index",
  "summary": "Brief clinical interpretation of findings"
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
            content: 'You are a medical AI expert specializing in sleep study analysis. Your task is to extract exact numerical values from sleep study reports. Search thoroughly through the entire document for each requested metric. Return only valid JSON with actual extracted values, not placeholder text.' 
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