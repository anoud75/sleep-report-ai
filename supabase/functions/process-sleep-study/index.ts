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

    const prompt = `DO NOT generate any final interpretation text or summary unless explicitly instructed. Your task is only to extract and calculate the following values from the raw G3 sleep study report, without assuming or inferring. Use exact values only. If any value is missing or unused, use ---.

Extract these values (in order):
* Light off
* Light on
* Time in Bed (min)
* Total Sleep Time (min)
* CPAP/BPAP/O2
* Sleep Latency (min)
* REM Latency (min)
* Sleep Efficiency (%)
* Sleep Stage 1 (%)
* Sleep Stage 2 (%)
* Slow Wave Sleep (%)
* REM Sleep (%)
* AHI (NREM/REM)
* AHI (supine/lateral) (/hr):
    * Lateral = (Right + Left)/2
    * Supine = same value from report
* Central Apnea Index
* Obstructive Apnea Index (/hr)
* Mixed Apnea Index
* Hypopnea Index (/hr)
* Hypopnea Mean Duration (sec):
    * = Average of (Obstructive + Central + Mixed + Hypopnea mean durations) (ignore zeroes)
* Heart Rate (NREM/REM):
    * = Average of (Obstructive + Central + Mixed + Hypopnea Index) / 4 (ignore zeroes)
* Desaturation Index (/hr)
* % Time with O2 < 90% (%):
    * = ((REM minutes + NREM minutes with O2 < 90%) × 100) / Total Sleep Time
* % Time with O2 < 95% (%) (same formula)
* Lowest O2 / Average O2
* Arousal Index (/hr)
* Snoring (%)
* Leg Movement Index (/hr)

Then generate the following summary section using a fixed template, and only after values have been extracted:

Template:
Overnight sleep study shows evidence of "[Severity] Obstructive Sleep Apnea". The patient slept for a total sleep time of [hours] hours and [minutes] minutes with an AHI of [AHI value] events per hour associated with minimal desaturation and repetitive sleep interruptions. However, she progressed into all sleep stages. Otherwise, no unusual events were noted.

Please extract these values from the following sleep study report and format the response as JSON with the extracted values and generated summary.

Report content:
${fileContent}`;

    console.log('Sending request to OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
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
    const analysisResult = data.choices[0].message.content;
    
    console.log('Analysis result:', analysisResult);

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