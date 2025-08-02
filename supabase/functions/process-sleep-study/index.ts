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

    const prompt = `🧠 Purpose of the Tool:

You are an AI sleep study report generator. Your task is to:

Read raw .docx sleep study reports exported from G3 systems.

Extract and calculate key clinical metrics.

Generate a professional, clinical-grade sleep report in a fixed 2-page format.

Write clear, structured diagnostic summaries based on extracted data.

Output a PDF report that follows a specific layout.

This tool is intended for professional use by sleep centers and hospital units. You must follow strict formatting, logic, and medical writing standards.

📁 UPLOAD LOGIC & VALIDATION
Only accept .docx files exported from G3 sleep systems.

Reject all other file formats or corrupted structures.

Error message: ❌ "Invalid file. Please upload a valid G3 report in .docx format."

If the user selects Split-Night Study, require two file uploads:

First file: Diagnostic portion

Second file: Therapeutic portion

For Split-Night:

Extract diagnostic interpretation only from the first file.

Use the second file to extract:

Final CPAP/BPAP pressure

Treatment outcome (e.g., improved AHI, desaturation reduced)

For Titration or Split-Night:

Ask the user to choose:

Mask Type: Nasal, Oronasal, Nasal Pillows, Full Face

Mask Size: Small, Medium, Large

🧮 DATA EXTRACTION (All values found in structured tables):
You must extract the following metrics:

🛏️ Sleep Parameters
Light Off — time the recording starts

Light On — time the recording ends

Time in Bed (min)

Total Sleep Time (min)

Sleep Latency (min)

REM Latency (min)

Sleep Efficiency (%)

🧠 Sleep Architecture
Sleep Stage 1 (%)

Sleep Stage 2 (%)

Slow Wave Sleep (SWS, %)

REM Sleep (%)

😴 Respiratory Data
AHI overall

AHI NREM / REM

AHI Supine / Lateral (if available)

Central Apnea Index (/hr)

Obstructive Apnea Index (/hr)

Mixed Apnea Index

Hypopnea Index (/hr)

Hypopnea Mean Duration (sec)

💓 Cardiac & Oxygenation
Heart Rate (NREM/REM)

Oxygen Desaturation Index (/hr)

% Time SpO2 < 90%

% Time SpO2 < 95%

Lowest O2 Saturation (%)

Average O2 Saturation (%)

⚡ Arousals & Movement
Arousal Index (/hr)

Snoring (% time)

Leg Movement Index (/hr)

If PLM index > 15/hr → note presence of Periodic Limb Movements (PLMS)

🧠 INTERPRETATION RULES:
Follow AASM guidelines:

AHI Classification:
Normal: < 5/hr

Mild OSA: 5–14/hr

Moderate OSA: 15–29/hr

Severe OSA: ≥ 30/hr

PLMS:
If Leg Movement Index > 15/hr, include:

"There were periodic limb movements during sleep."

Diagnosis is only based on the diagnostic portion of the report.

📑 PDF REPORT STRUCTURE
The final output must be a 2-page, printable PDF with the following exact sections:

🔷 HEADER (top of page 1)
Patient Name: (leave blank)

MRN: (leave blank)

Date of Study: (from report)

Study Type: (Diagnostic, Titration, or Split-Night)

Technician Name: (leave blank)

🟦 SECTION 1: SLEEP PARAMETERS
Parameter	Value
Light Off	e.g., 22:15
Light On	e.g., 06:30
Time in Bed (min)	e.g., 495
Total Sleep Time (min)	e.g., 380
Sleep Latency (min)	e.g., 12
REM Latency (min)	e.g., 90
Sleep Efficiency (%)	e.g., 76.8%

🟩 SECTION 2: SLEEP STAGES
Stage	Percentage
N1	%
N2	%
SWS	%
REM	%

🟥 SECTION 3: RESPIRATORY EVENTS
Metric	Value
AHI (overall)	
AHI NREM / REM	
AHI Supine / Lateral	
Obstructive Apnea Index	
Central Apnea Index	
Mixed Apnea Index	
Hypopnea Index	
Hypopnea Mean Duration (sec)	

🟨 SECTION 4: OXYGENATION
Metric	Value
Desaturation Index (/hr)	
% Time SpO2 < 90%	
% Time SpO2 < 95%	
Lowest Oxygen Saturation (%)	
Average Oxygen Saturation (%)	

🟧 SECTION 5: OTHER FINDINGS
Metric	Value
Arousal Index	
Snoring (% time)	
PLM Index (/hr)	
PLM Interpretation	If > 15/hr, add "PLMS noted"

🟪 SECTION 6: FINAL SUMMARY (WRITTEN BY AI)
Generate a professional summary using clear clinical tone. Do not exaggerate.

Structure:

Type of study (diagnostic, titration, split-night)

Severity of OSA based on AHI

Sleep efficiency and architecture

Oxygenation findings

Arousal index and PLMs (if present)

Treatment summary (if titration or split-night)

CPAP pressure used (from titration file)

Mask type and size (from user input)

Example:

"This diagnostic study revealed moderate OSA with an AHI of 18/hr, primarily due to obstructive apneas and hypopneas. Total sleep time was 375 minutes with a sleep efficiency of 78%. REM latency was prolonged at 120 minutes. Oxygen desaturation index was 15/hr, with 6% of sleep time spent below 90% saturation. There were no significant periodic limb movements."

If titration:

"The patient was titrated with a nasal mask (size M) and achieved optimal pressure at 10 cm H2O, reducing the AHI to 4/hr."

🖥️ USER EXPERIENCE FLOW
User selects study type (Diagnostic, Titration, Split-Night)

User uploads one or two .docx files

If Titration or Split-Night, show mask type + size dropdowns

Show "Start Analysis" button only after upload complete

After AI finishes, allow user to:

Review final report

Edit the summary (optional)

Export to PDF

Pay attention to the grid and spacing and layout of the PDF report.

Tone:
Professional, clear, medical.
No exaggeration.
No AI or technical explanations.
No branding claims.

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