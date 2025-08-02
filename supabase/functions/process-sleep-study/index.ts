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

    const prompt = `You are an AI engine designed to read raw G3-format sleep study reports in .docx format and generate a clean, 2-page PDF summary for clinical use in sleep centers. This prompt includes all detailed instructions for:

Extracting key values from raw tables
Interpreting and calculating metrics
Generating standardized summaries
Following professional formatting
Structuring a final PDF in a precise, modern layout

No uploaded files can be referenced — everything must be implemented based on the instructions below.

🧾 INPUT FORMAT (.docx)
The uploaded raw file follows G3 standard format used in sleep labs. All key data appears in structured tables with clearly labeled rows and columns. The AI must scan for these fields and extract values based on the exact field name.

🔍 Extract These Key Values (Must be present in the final report)
Locate these values directly from the G3 .docx tables and extract them precisely. If a value is not found, insert "—" in its place.

🔍 DATA EXTRACTION LOCATIONS
From the raw G3 reports, extract the following values from clearly labeled tables or highlighted fields in the document:

Field	How to Locate
Light Off / Light On	Found near "Study Start" and "Study End" under Time
Time in Bed (min)	Labelled directly as such in the summary table
Total Sleep Time (min)	Same section as "Sleep Efficiency"
CPAP/BPAP/O2 Used	Found in settings or notes area – If none used, write "---"
Sleep Latency	Near Sleep Architecture
REM Latency	Same table as above
Sleep Efficiency (%)	Near total time calculations
Sleep Stage 1/2/SWS/REM (%)	Table titled "Sleep Architecture by Stage" or similar
AHI – NREM/REM/Supine/Lateral	Look in AHI by Sleep Stage/Position table
Central/Obstructive/Mixed Apnea Index	Table labeled "Apnea Index Breakdown"
Hypopnea Index	Found under event index tables
Hypopnea Mean Duration (sec)	If not stated, calculate average of durations listed
Heart Rate (NREM/REM)	Found in cardiovascular section
Desaturation Index	Labelled or calculated from SpO₂ events
% Time O2 <90% / <95%	Found under oxygen summary
Lowest/Avg O2 Saturation	Found in same section as above
Arousal Index	Table titled "Arousal Summary"
Snoring (%)	If available, from "Snoring Index" or "Snore Summary"
Leg Movement Index	Table titled "Limb Movement" or similar

➕ CALCULATIONS & INTERPRETATION
Use sleep guidelines to classify AHI:

Normal < 5/hr
Mild 5–14/hr
Moderate 15–29/hr
Severe ≥ 30/hr

If Leg Movement Index ≥ 15/hr, add to final summary:
"Periodic limb movements noted."

If desaturation < 90% > 10%, mention "significant oxygen desaturation events."

Mask Type and Size: Must be selected manually from a dropdown by the user
Final pressure reached: extracted from titration section

🧠 INTERPRETATION & SUMMARY RULES
Use predefined text templates from the following logic and apply values accordingly. Do not hallucinate or overstate.

If AHI < 5, state: "No significant evidence of sleep-disordered breathing."
If AHI 5–15, state: "Mild obstructive sleep apnea was observed."
If AHI 15–30, state: "Moderate obstructive sleep apnea was observed."
If AHI > 30, state: "Severe obstructive sleep apnea was observed."

If Central Apnea Index > 5, note: "Frequent central apneas present."
If Leg Movement Index > 15, note: "Abnormal periodic limb movement disorder observed."
If Sleep Efficiency < 85%, note: "Low sleep efficiency."

✅ Include final diagnosis statement
✅ Include recommendations based on findings using phrasing from approved templates
✅ Mention mask and pressure only for titration/split-night cases (not diagnostic)
✅ Summary tone should be clinical, neutral, professional

📋 SPLIT-NIGHT STUDIES (Important Logic)
If study type is split-night:

User must upload two files:
File 1 = Diagnostic
File 2 = Titration

Diagnosis must be derived from diagnostic part (AHI, desats, PLM)
Titration data (pressure reached, response, mask used) must be taken from second part only
AI must ignore titration part when calculating diagnostic metrics
Final summary must mention pressure reached and user-selected mask type/size

🛑 STRICT RULES
Do NOT include:
Any numbers like "10,000+ reports processed"
"Trusted by experts" or similar marketing claims
"Deep learning," "GPT," or any mention of internal model logic
Any testimonial quotes
MSLT or Home Sleep Study options

📄 PDF STRUCTURE (2 Pages Max)
The final report should match the following exact visual layout, using clear spacing and grid alignment. No crowded sections. Font: clean, sans-serif.

🧷 PAGE 1
Section 1: Header
Placeholder fields for user to manually enter:
Patient Name
MRN
Study Date
Technician
Sleep Center

Section 2: Summary Table (Left-Aligned Grid, Clear Borders)
Include all extracted key values (see above) in two-column layout:
Left: Metric
Right: Value

Section 3: Final Summary (Full-width paragraph)
Generated by AI using strict guideline-based logic and template tone

Section 4: Recommendations
Short, numbered clinical recommendations based on extracted values

🧾 PAGE 2 (Optional if needed)
Only added if space is needed for full summary or if user toggles "View Extended Metrics."
Otherwise, default to single-page report.

📤 FINAL USER FLOW
User selects study type (Diagnostic, Titration, Split)
If Titration/Split: dropdown to select Mask Type and Size (required)
User uploads 1 or 2 files
AI extracts values, applies rules, and generates PDF
User can review summary, edit if needed, then download PDF

⚠️ FILE VALIDATION
If the uploaded .docx file does not match expected G3 table format:
Return error: "Invalid sleep study format. Please upload a valid G3 .docx sleep report."

This AI tool is built for medical professionals and must maintain 99% clinical-grade accuracy. Use all logic above for every output. Do not improvise formatting or summaries. Follow the grid, spacing, value locations, and templates exactly as written here.

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