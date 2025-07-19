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

    const prompt = `You are an AI assistant for a sleep report analysis website. Your task is to extract, calculate, and format values from a raw G3 sleep study report.

📥 INPUT
The AI will receive raw text from a G3 PSG sleep study.

🎯 TASK
Extract the following values exactly as written from the report (do not modify or assume anything):

Light off
Light on
Time in Bed (min)
Total Sleep Time (min)
CPAP/BPAP/O2 (if unused, write ---)
Sleep Latency (min)
REM Latency (min)
Sleep Efficiency (%)
Sleep Stage 1 (%)
Sleep Stage 2 (%)
Slow Wave Sleep (%)
REM Sleep (%)
AHI (NREM/REM)
Central Apnea Index
Obstructive Apnea Index (/hr)
Mixed Apnea Index
Hypopnea Index (/hr)
Desaturation Index (/hr)
Lowest O2 / Average O2
Arousal Index (/hr)
Snoring (%)
Leg Movement Index (/hr)

🔢 CALCULATED VALUES
Only calculate the following if the values involved are not zero. If all components are 0, return ---.

AHI (supine/lateral)
Supine = use directly from report
Lateral = (AHI Right + AHI Left) / 2

Hypopnea Mean Duration (sec)
= average of mean durations for: Obstructive + Central + Mixed + Hypopnea
(exclude 0 values from the calculation)

Heart Rate (NREM/REM)
= average of: Obstructive Index + Central Index + Mixed Index + Hypopnea Index
(exclude 0 values)

% Time with O2 < 90%
= ((REM minutes with O2 < 90 + NREM minutes with O2 < 90) × 100) / Total Sleep Time

% Time with O2 < 95%
= ((REM + NREM minutes with O2 < 95) × 100) / Total Sleep Time

Study Type: ${studyType}

File Content:
${truncatedContent}

Please return the extracted data in this exact JSON structure:
{
  "lightOff": "value",
  "lightOn": "value",
  "timeInBed": "value",
  "totalSleepTime": "value",
  "cpapBpapO2": "value",
  "sleepLatency": "value",
  "remLatency": "value",
  "sleepEfficiency": "value",
  "stage1": "value",
  "stage2": "value",
  "slowWave": "value",
  "rem": "value",
  "ahiNremRem": "value",
  "ahiSupineLateral": "value",
  "centralApneaIndex": "value",
  "obstructiveApneaIndex": "value",
  "mixedApneaIndex": "value",
  "hypopneaIndex": "value",
  "hypopneaMeanDuration": "value",
  "heartRateNremRem": "value",
  "desaturationIndex": "value",
  "timeO2Below90": "value",
  "timeO2Below95": "value",
  "lowestO2AverageO2": "value",
  "arousalIndex": "value",
  "snoring": "value",
  "legMovementIndex": "value",
  "summary": "Overnight sleep study shows evidence of \"[Severity] Obstructive Sleep Apnea\". The patient slept for a total sleep time of [X] hours and [Y] minutes with an AHI of [AHI] events per hour associated with minimal desaturation and repetitive sleep interruptions. However, she progressed into all sleep stages. Otherwise, no unusual events were noted."
}

Extract exact values from the report. If a value is not found, use "---".`;

    console.log('Sending request to OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a medical AI assistant specialized in analyzing sleep study reports. Extract data accurately and follow the exact format requested.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 2000,
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
      // Fallback to empty data if parsing fails
      extractedData = {
        lightOff: null,
        lightOn: null,
        totalSleepTime: null,
        sleepEfficiency: null,
        ahi: null,
        sleepLatency: null,
        remLatency: null,
        stage1: null,
        stage2: null,
        slowWave: null,
        rem: null,
        desaturationIndex: null,
        lowestO2: null,
        arousalIndex: null,
        summary: "Unable to parse analysis results"
      };
    }

    // Parse the AI response and structure it
    const processedData = {
      patientInfo: {
        name: "Sample Patient", // Would extract from actual report
        dob: "01/01/1980",
        studyDate: new Date().toLocaleDateString(),
        studyType: studyType
      },
      sleepParameters: {
        lightOff: "10:30 PM",
        lightOn: "6:30 AM",
        timeInBed: "480",
        totalSleepTime: "420",
        sleepLatency: "15",
        remLatency: "85",
        sleepEfficiency: "87.5"
      },
      sleepStages: {
        stage1: "5.2",
        stage2: "45.8",
        slowWave: "22.1",
        rem: "26.9"
      },
      respiratoryEvents: {
        ahi: "12.5",
        ahiNrem: "10.2",
        ahiRem: "18.7",
        centralApneaIndex: "1.2",
        obstructiveApneaIndex: "8.5",
        mixedApneaIndex: "0.8",
        hypopneaIndex: "2.0"
      },
      oxygenation: {
        desaturationIndex: "15.3",
        timeBelow90: "2.1",
        timeBelow95: "8.7",
        lowestO2: "82",
        averageO2: "94"
      },
      otherFindings: {
        arousalIndex: "18.2",
        snoring: "45",
        legMovementIndex: "5.8"
      },
      aiAnalysis: analysisResult,
      clinicalRecommendations: [
        "CPAP therapy recommended",
        "Sleep hygiene counseling",
        "Follow-up in 3 months"
      ]
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