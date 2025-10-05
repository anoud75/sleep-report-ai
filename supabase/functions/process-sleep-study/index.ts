import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Format oxygen percentage to show exact values
const formatOxygenPercentage = (percentage) => {
  // If both REM + NREM are blank → Output: "None"
  if (percentage === null || percentage === undefined) {
    return "None";
  }
  
  // Always show exact percentage with 1 decimal place
  return `${percentage.toFixed(1)}%`;
};

// Enhanced hypopnea mean duration extraction with multiple fallback patterns
function parseHypopneaMeanDuration(content: string): number | null {
  console.log('=== ENHANCED HYPOPNEA MEAN DURATION EXTRACTION START ===');
  
  try {
    // Section-aware extraction - look within relevant sections first
    const eventsSections = [
      /(?:REM\s+)?Events?\s*[\s\S]*?(?=(?:HEART\s+RATE|Oximetry|Body\s+Position|$))/i,
      /Respiratory\s+Events[\s\S]*?(?=(?:HEART\s+RATE|Oximetry|Body\s+Position|$))/i,
      /Hypopnea[\s\S]*?(?=(?:HEART\s+RATE|Oximetry|Body\s+Position|$))/i
    ];

    let relevantSection = content;
    for (const sectionPattern of eventsSections) {
      const sectionMatch = content.match(sectionPattern);
      if (sectionMatch) {
        relevantSection = sectionMatch[0];
        console.log('Found relevant section for hypopnea extraction:', sectionMatch[0].substring(0, 200) + '...');
        break;
      }
    }

    // Enhanced pattern collection with fallbacks
    const patterns = [
      // Pattern 1: Standard table format - Mean (seconds) row with Hyp column
      /Mean\s*\(seconds\)[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      
      // Pattern 2: Table format with different column counts
      /Mean.*?seconds.*?(?:\d+\.?\d*\s+){4}(\d+\.?\d*)/i,
      /Mean.*?seconds.*?(?:\d+\.?\d*\s+){3}(\d+\.?\d*)/i,
      /Mean.*?seconds.*?(?:\d+\.?\d*\s+){2}(\d+\.?\d*)/i,
      
      // Pattern 3: Direct hypopnea mean duration mentions
      /Hypopnea\s+Mean\s+Duration[:\s]*(\d+\.?\d*)\s*sec/i,
      /Mean\s+Hypopnea\s+Duration[:\s]*(\d+\.?\d*)\s*sec/i,
      /HYP.*?Mean.*?(\d+\.?\d*)\s*sec/i,
      
      // Pattern 4: Various spacing and formatting
      /hypopnea.*?duration[:\s]*(\d+\.?\d*)\s*sec/i,
      /hypopnea.*?mean[:\s]*(\d+\.?\d*)/i,
      /duration.*?hypopnea[:\s]*(\d+\.?\d*)/i,
      
      // Pattern 5: Table format looking for Hyp column specifically
      /(?:CA|OA|MA).*?HYP[\s\S]*?Mean.*?(?:\d+\.?\d*\s+)*(\d+\.?\d*)/i,
      
      // Pattern 6: Loose pattern for edge cases
      /mean[\s\S]{0,50}?(\d+\.?\d*)\s*sec[\s\S]{0,50}?hypopnea/i,
      /hypopnea[\s\S]{0,50}?(\d+\.?\d*)\s*sec/i
    ];

    // Try patterns in order of confidence
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = relevantSection.match(pattern);
      if (match) {
        const duration = parseFloat(match[match.length - 1]); // Get last captured group
        if (duration > 0 && duration < 300) { // Sanity check (0-300 seconds)
          console.log(`✅ Found hypopnea duration: ${duration} seconds using pattern ${i + 1}`);
          console.log('Matching text:', match[0].substring(0, 100) + '...');
          console.log('Confidence level:', i < 3 ? 'HIGH' : i < 6 ? 'MEDIUM' : 'LOW');
          console.log('=== ENHANCED HYPOPNEA MEAN DURATION EXTRACTION END ===');
          return duration;
        } else {
          console.log(`❌ Invalid duration value: ${duration} (out of range 0-300)`);
        }
      }
    }

    // If no match found, log partial matches for debugging
    console.log('🔍 Debugging: Looking for partial matches...');
    const debugPatterns = [
      /Mean.*?seconds/i,
      /hypopnea.*?duration/i,
      /HYP.*?Mean/i
    ];
    
    for (const debugPattern of debugPatterns) {
      const debugMatch = relevantSection.match(debugPattern);
      if (debugMatch) {
        console.log('Found partial match:', debugMatch[0]);
        const surroundingText = relevantSection.substring(
          Math.max(0, debugMatch.index! - 100),
          Math.min(relevantSection.length, debugMatch.index! + debugMatch[0].length + 100)
        );
        console.log('Context (±100 chars):', surroundingText);
      }
    }

    console.log('❌ No hypopnea mean duration found after enhanced extraction');
    console.log('=== ENHANCED HYPOPNEA MEAN DURATION EXTRACTION END ===');
    return null;

  } catch (error) {
    console.error('Error in enhanced hypopnea duration extraction:', error);
    console.log('=== ENHANCED HYPOPNEA MEAN DURATION EXTRACTION END ===');
    return null;
  }
}

// Enhanced desaturation index extraction with comprehensive fallback patterns
function parseDesaturationIndex(content: string): number | null {
  console.log('=== ENHANCED DESATURATION INDEX EXTRACTION START ===');
  
  try {
    // Section-aware extraction - look within oximetry sections first
    const oximetrySections = [
      /Oximetry\s*Distribution[\s\S]*?(?=(?:BODY\s*POSITION|Leg\s*Movements|Snoring|$))/i,
      /OXIMETRY\s*SUMMARY[\s\S]*?(?=(?:BODY\s*POSITION|Leg\s*Movements|Snoring|$))/i,
      /Oximetry[\s\S]*?(?=(?:BODY\s*POSITION|PAGE\s*7|$))/i,
      /Desaturation[\s\S]*?(?=(?:BODY\s*POSITION|Arousal|$))/i
    ];

    let relevantSection = content;
    for (const sectionPattern of oximetrySections) {
      const sectionMatch = content.match(sectionPattern);
      if (sectionMatch) {
        relevantSection = sectionMatch[0];
        console.log('Found oximetry section for desaturation extraction:', sectionMatch[0].substring(0, 200) + '...');
        break;
      }
    }

    // Enhanced pattern collection with multiple variations
    const patterns = [
      // Pattern 1: Standard table format - "Desat Index (#/hour)" with TOTAL column
      /Desat\s+Index\s*\(#\/hour\)[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      /Desat\s+Index\s*\(\#\/hr\)[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      
      // Pattern 2: Alternative spacing and formats
      /Desat.*?Index.*?#\/hour[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      /Desat.*?Index.*?\(#\/hr\)[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      /Desaturation\s+Index.*?#\/hour[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      
      // Pattern 3: Direct label formats
      /Desaturation\s+Index[:\s]*(\d+\.?\d*)\s*\/hr/i,
      /Desat\s+Index[:\s]*(\d+\.?\d*)\s*\/hr/i,
      /DI\s*\(\/hr\)[:\s]*(\d+\.?\d*)/i,
      /DI\s*\(#\/hour\)[:\s]*(\d+\.?\d*)/i,
      
      // Pattern 4: HTML/table formats
      /Desat\s+Index.*?hour.*?<td[^>]*>(\d+\.?\d*)<\/td>\s*<td[^>]*>(\d+\.?\d*)<\/td>\s*<td[^>]*>(\d+\.?\d*)<\/td>\s*<td[^>]*>(\d+\.?\d*)<\/td>/i,
      
      // Pattern 5: Loose patterns for edge cases
      /desaturation\s*index.*?(\d+\.?\d*)/i,
      /desat.*?index.*?(\d+\.?\d*)/i,
      /index.*?desaturation.*?(\d+\.?\d*)/i,
      
      // Pattern 6: Table format with "TOTAL" column identifier
      /Desat\s+Index[\s\S]*?TOTAL[\s\S]*?(\d+\.?\d*)/i,
      /desaturation[\s\S]{0,100}?Total[\s\S]{0,50}?(\d+\.?\d*)/i
    ];

    // Try patterns in order of confidence
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = relevantSection.match(pattern);
      if (match) {
        // For patterns with multiple groups, take the last number (TOTAL column)
        const index = parseFloat(match[match.length - 1]);
        if (index >= 0 && index < 1000) { // Sanity check (0-1000 events/hour)
          console.log(`✅ Found desaturation index: ${index} using pattern ${i + 1}`);
          console.log('Matching text:', match[0].substring(0, 100) + '...');
          console.log('Confidence level:', i < 4 ? 'HIGH' : i < 8 ? 'MEDIUM' : 'LOW');
          console.log('=== ENHANCED DESATURATION INDEX EXTRACTION END ===');
          return index;
        } else {
          console.log(`❌ Invalid desaturation index value: ${index} (out of range 0-1000)`);
        }
      }
    }

    // If no match found, log partial matches for debugging
    console.log('🔍 Debugging: Looking for desaturation-related partial matches...');
    const debugPatterns = [
      /Desat.*?Index/i,
      /desaturation.*?index/i,
      /#\/hour/i,
      /TOTAL.*?\d+\.?\d*/i
    ];
    
    for (const debugPattern of debugPatterns) {
      const debugMatch = relevantSection.match(debugPattern);
      if (debugMatch) {
        console.log('Found partial match:', debugMatch[0]);
        const surroundingText = relevantSection.substring(
          Math.max(0, debugMatch.index! - 100),
          Math.min(relevantSection.length, debugMatch.index! + debugMatch[0].length + 100)
        );
        console.log('Context (±100 chars):', surroundingText);
      }
    }

    console.log('❌ No desaturation index found after enhanced extraction');
    console.log('=== ENHANCED DESATURATION INDEX EXTRACTION END ===');
    return null;

  } catch (error) {
    console.error('Error in enhanced desaturation index extraction:', error);
    console.log('=== ENHANCED DESATURATION INDEX EXTRACTION END ===');
    return null;
  }
}

// Enhanced oxygen percentage extraction with flexible patterns and validation
function extractOxygenPercentagesWithValidation(content: string, totalSleepTime: number): { under90: string; under95: string } | null {
  console.log('=== ENHANCED OXYGEN PERCENTAGE EXTRACTION START ===');
  console.log('TST for calculations:', totalSleepTime);
  
  try {
    if (!totalSleepTime || totalSleepTime <= 0) {
      console.log('❌ Invalid TST for oxygen calculations');
      console.log('=== ENHANCED OXYGEN PERCENTAGE EXTRACTION END ===');
      return null;
    }

    // Section-aware extraction - look within oximetry sections first
    const oximetrySections = [
      /Oximetry\s*Distribution[\s\S]*?(?=(?:BODY\s*POSITION|Leg\s*Movements|Snoring|Arousal|$))/i,
      /OXIMETRY\s*SUMMARY[\s\S]*?(?=(?:BODY\s*POSITION|Leg\s*Movements|Snoring|Arousal|$))/i,
      /Oxygen\s*Saturation[\s\S]*?(?=(?:BODY\s*POSITION|Leg\s*Movements|Snoring|Arousal|$))/i,
      /SpO2[\s\S]*?(?=(?:BODY\s*POSITION|Leg\s*Movements|Snoring|Arousal|$))/i
    ];

    let relevantSection = content;
    for (const sectionPattern of oximetrySections) {
      const sectionMatch = content.match(sectionPattern);
      if (sectionMatch) {
        relevantSection = sectionMatch[0];
        console.log('Found oximetry section for oxygen extraction:', sectionMatch[0].substring(0, 200) + '...');
        break;
      }
    }

    // Enhanced patterns for <90% oxygen saturation with multiple variations
    const patterns90 = [
      // Standard table formats
      /<90[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      /&lt;90[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      /<\s*90[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      
      // Alternative formats
      /90\s*%[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      /below\s*90[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      /under\s*90[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      
      // Direct label formats
      /Time\s*<\s*90%[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      /%\s*Time\s*<\s*90[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      /<90%\s*time[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      
      // Loose patterns for edge cases
      /90[\s\S]{0,20}?%[\s\S]{0,50}?(\d+\.?\d*)\s+(\d+\.?\d*)/i
    ];

    // Enhanced patterns for <95% oxygen saturation
    const patterns95 = [
      // Standard table formats
      /<95[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      /&lt;95[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      /<\s*95[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      
      // Alternative formats
      /95\s*%[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      /below\s*95[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      /under\s*95[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      
      // Direct label formats
      /Time\s*<\s*95%[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      /%\s*Time\s*<\s*95[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      /<95%\s*time[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      
      // Loose patterns for edge cases
      /95[\s\S]{0,20}?%[\s\S]{0,50}?(\d+\.?\d*)\s+(\d+\.?\d*)/i
    ];

    let under90Data = null;
    let under95Data = null;

    // Extract <90% data with confidence tracking
    for (let i = 0; i < patterns90.length; i++) {
      const pattern = patterns90[i];
      const match = relevantSection.match(pattern);
      if (match) {
        // Assuming format: Wake, REM, Non-REM, Total (take REM and Non-REM)
        const remValue = parseFloat(match[2]) || 0;
        const nonRemValue = parseFloat(match[3]) || parseFloat(match[2]) || 0;
        
        under90Data = {
          rem: remValue,
          nonRem: nonRemValue
        };
        console.log(`✅ Found <90% data using pattern ${i + 1}:`, under90Data);
        console.log('Matching text:', match[0].substring(0, 100) + '...');
        break;
      }
    }

    // Extract <95% data with confidence tracking
    for (let i = 0; i < patterns95.length; i++) {
      const pattern = patterns95[i];
      const match = relevantSection.match(pattern);
      if (match) {
        const remValue = parseFloat(match[2]) || 0;
        const nonRemValue = parseFloat(match[3]) || parseFloat(match[2]) || 0;
        
        under95Data = {
          rem: remValue,
          nonRem: nonRemValue
        };
        console.log(`✅ Found <95% data using pattern ${i + 1}:`, under95Data);
        console.log('Matching text:', match[0].substring(0, 100) + '...');
        break;
      }
    }

    if (under90Data && under95Data) {
      const under90Total = under90Data.rem + under90Data.nonRem;
      const under95Total = under95Data.rem + under95Data.nonRem;
      
      const percent90 = Math.min(100, Math.max(0, (under90Total / totalSleepTime) * 100));
      const percent95 = Math.min(100, Math.max(0, (under95Total / totalSleepTime) * 100));
      
      console.log('Enhanced oxygen calculations:');
      console.log(`  TST: ${totalSleepTime} minutes`);
      console.log(`  <90% total: ${under90Total} min (REM: ${under90Data.rem}, NREM: ${under90Data.nonRem})`);
      console.log(`  <95% total: ${under95Total} min (REM: ${under95Data.rem}, NREM: ${under95Data.nonRem})`);
      console.log(`  Calculated percentages: <90%=${percent90.toFixed(1)}%, <95%=${percent95.toFixed(1)}%`);
      console.log('=== ENHANCED OXYGEN PERCENTAGE EXTRACTION END ===');
      
      return {
        under90: percent90.toFixed(1),
        under95: percent95.toFixed(1)
      };
    }

    // If no match found, log partial matches for debugging
    console.log('🔍 Debugging: Looking for oxygen-related partial matches...');
    const debugPatterns = [
      /<90/i,
      /<95/i,
      /oxygen/i,
      /SpO2/i,
      /saturation/i
    ];
    
    for (const debugPattern of debugPatterns) {
      const debugMatch = relevantSection.match(debugPattern);
      if (debugMatch) {
        console.log('Found partial match:', debugMatch[0]);
        const surroundingText = relevantSection.substring(
          Math.max(0, debugMatch.index! - 100),
          Math.min(relevantSection.length, debugMatch.index! + debugMatch[0].length + 100)
        );
        console.log('Context (±100 chars):', surroundingText);
      }
    }

    console.log('❌ Oxygen saturation data not found after enhanced extraction');
    console.log('=== ENHANCED OXYGEN PERCENTAGE EXTRACTION END ===');
    return null;

  } catch (error) {
    console.error('Error in enhanced oxygen percentage extraction:', error);
    console.log('=== ENHANCED OXYGEN PERCENTAGE EXTRACTION END ===');
    return null;
  }
}

// Comprehensive sleep metrics extraction using Lovable AI Gateway (Gemini) with robust fallbacks
async function extractSleepMetrics(content: string, apiKey: string): Promise<{
  oxygenUnder90Percent: string;
  oxygenUnder95Percent: string;
  hypopneaMeanDuration: number | null;
  desaturationIndex: number | null;
  calculations: any;
}> {
  console.log("=== COMPREHENSIVE SLEEP METRICS EXTRACTION START ===");
  console.log("Content length:", content.length);

  // Extract TST for oxygen calculations
  let totalSleepTime = null;
  const tstMatch = content.match(/TST\s*:?\s*(\d+\.?\d*)/i);
  if (tstMatch) {
    totalSleepTime = parseFloat(tstMatch[1]);
    console.log("Found TST:", totalSleepTime, "minutes");
  }
  
  const prompt = `Extract ONLY these 4 sleep study metrics. Return ONLY valid JSON, no explanations:

{
  "oxygenUnder90Percent": "X.X",
  "oxygenUnder95Percent": "X.X", 
  "hypopneaMeanDuration": X.X,
  "desaturationIndex": X.X,
  "calculations": {
    "tst": ${totalSleepTime || 'null'},
    "under90REM": X.X,
    "under90NREM": X.X,
    "under95REM": X.X,
    "under95NREM": X.X
  }
}

Find:
1. Oximetry table <90 and <95 rows (REM, Non-REM minutes)
2. REM Events table "Mean (seconds)" row, Hyp column  
3. "Desat Index (#/hour)" TOTAL column (rightmost number)

Document: ${content}`;

  let aiResult = null;

  try {
    console.log("Sending extraction request to Lovable AI (Gemini)...");
    
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

    if (response.ok) {
      const data = await response.json();
      console.log("AI response data structure:", JSON.stringify(data, null, 2));
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("Unexpected AI response structure:", data);
        aiResult = null;
      } else {
        let result = data.choices[0].message.content.trim();
        
        console.log("Raw AI response:", result);
      
        // Extract JSON from response
        let jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = jsonMatch[0];
        }
        
        // Clean common issues
        result = result.replace(/```json\s*/, '').replace(/```\s*$/, '');
        result = result.replace(/```\s*/, '');
        
        try {
          aiResult = JSON.parse(result);
          console.log("✅ AI extraction successful:", aiResult);
        } catch (parseError) {
          console.error("Failed to parse AI JSON:", parseError);
          console.log("Cleaned result was:", result);
          aiResult = null;
        }
      }
    } else {
      console.error("API request failed:", response.status);
    }
  } catch (error) {
    console.error('AI extraction error:', error);
  }

  // Normalize AI outputs to drop placeholders like "X.X" and extract numeric values
  const normalizeNumber = (v: any): string | null => {
    if (v === null || v === undefined) return null;
    let s = String(v).trim();
    if (!s || /x/i.test(s)) return null;
    const m = s.match(/-?\d+(?:\.\d+)?/);
    return m ? m[0] : null;
  };

  const aiOxy90 = normalizeNumber(aiResult?.oxygenUnder90Percent);
  const aiOxy95 = normalizeNumber(aiResult?.oxygenUnder95Percent);
  const aiHypMean = normalizeNumber(aiResult?.hypopneaMeanDuration);
  const aiDesat = normalizeNumber(aiResult?.desaturationIndex);

  // Use deterministic fallbacks for missing data
  let hypopneaMean = aiHypMean ? parseFloat(aiHypMean) : null;
  let desatIndex = aiDesat ? parseFloat(aiDesat) : null;
  let oxygenData = null;

  // Fallback 1: Hypopnea mean duration
  if (!hypopneaMean) {
    console.log("🔄 Using deterministic hypopnea extraction...");
    hypopneaMean = parseHypopneaMeanDuration(content);
  }

  // Fallback 2: Desaturation index
  if (!desatIndex) {
    console.log("🔄 Using deterministic desaturation extraction...");
    desatIndex = parseDesaturationIndex(content);
  }

  // Fallback 3: Oxygen percentages
  if (!aiOxy90 || !aiOxy95) {
    console.log("🔄 Using deterministic oxygen extraction...");
    if (totalSleepTime) {
      oxygenData = extractOxygenPercentagesWithValidation(content, totalSleepTime);
    }
  }

  const finalMetrics = {
    oxygenUnder90Percent: aiOxy90 || oxygenData?.under90 || "0.0",
    oxygenUnder95Percent: aiOxy95 || oxygenData?.under95 || "0.0",
    hypopneaMeanDuration: hypopneaMean,
    desaturationIndex: desatIndex,
    calculations: aiResult?.calculations || null
  };
  
  console.log("✅ Final comprehensive metrics:", finalMetrics);
  console.log("=== COMPREHENSIVE SLEEP METRICS EXTRACTION END ===");
  return finalMetrics;
}

// New JavaScript regex-based extraction method
const extractOxygenWithRegex = (content, totalSleepTimeMinutes) => {
  try {
    console.log('=== REGEX EXTRACTION START ===');
    
    // Look for table patterns with multiple approaches
    const patterns = [
      // Pattern 1: Standard table format <90 followed by 4 numbers
      /<90[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      // Pattern 2: Different spacing with < 90
      /<\s*90[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      // Pattern 3: With percentage symbol
      /90\s*%[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      // Pattern 4: HTML encoded &lt;90
      /&lt;90[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
    ];

    const patterns95 = [
      /<95[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      /<\s*95[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      /95\s*%[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
      /&lt;95[\s\S]*?(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/i,
    ];

    let under90Data = null;
    let under95Data = null;

    // Try to find <90 data
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        console.log('Found <90 pattern:', match[0]);
        // Assuming format: Wake, REM, Non-REM, Total (or Wake, REM, Non-REM if only 3 values)
        under90Data = {
          rem: parseFloat(match[2]) || 0,
          nonRem: parseFloat(match[3]) || 0
        };
        console.log('Extracted <90 data:', under90Data);
        break;
      }
    }

    // Try to find <95 data
    for (const pattern of patterns95) {
      const match = content.match(pattern);
      if (match) {
        console.log('Found <95 pattern:', match[0]);
        under95Data = {
          rem: parseFloat(match[2]) || 0,
          nonRem: parseFloat(match[3]) || 0
        };
        console.log('Extracted <95 data:', under95Data);
        break;
      }
    }

    if (under90Data && under95Data) {
      // Calculate percentages
      const under90Total = under90Data.rem + under90Data.nonRem;
      const under95Total = under95Data.rem + under95Data.nonRem;
      
      const result90 = Math.min(100, Math.max(0, (under90Total / totalSleepTimeMinutes) * 100));
      const result95 = Math.min(100, Math.max(0, (under95Total / totalSleepTimeMinutes) * 100));
      
      console.log('Regex extraction calculations:');
      console.log('      TST:', totalSleepTimeMinutes, 'minutes');
      console.log('      <90%:', `(${under90Data.rem} + ${under90Data.nonRem}) = ${under90Total} min`);
      console.log('      <95%:', `(${under95Data.rem} + ${under95Data.nonRem}) = ${under95Total} min`);
      console.log('      Percentages:', `<90%=${result90.toFixed(1)}%, <95%=${result95.toFixed(1)}%`);
      
      console.log('Regex extraction successful');
      console.log('=== REGEX EXTRACTION END ===');
      
      return {
        timeBelow90Percent: result90.toFixed(1),
        timeBelow95Percent: result95.toFixed(1),
        extractionMethod: "regex",
        success: true,
        rawData: { under90: under90Data, under95: under95Data }
      };
    }

    console.log('Regex extraction failed - no matching patterns found');
    console.log('=== REGEX EXTRACTION END ===');
    return null;
    
  } catch (error) {
    console.error('Regex extraction error:', error);
    console.log('=== REGEX EXTRACTION END ===');
    return null;
  }
};

// Also update your desaturation index function with better debugging
const extractDesaturationIndex = async (truncatedContent, lovableApiKey) => {
  const desatPrompt = `Extract the Total Desaturation Index from this sleep study report.

LOCATION: Look in the oximetry table section

FIND: The row labeled "Desat Index (#/hour)" (NOT "Desat Index (dur/hour)")

TABLE STRUCTURE EXAMPLE:
                        WK    REM   NREM  TOTAL
Average (%)             XX    XX    XX    XX
Number of desaturations  X     X     X     X
Desat Index (#/hour)    X.X   X.X   X.X   X.X  ← EXTRACT TOTAL
Desat Index (dur/hour)  X.X   X.X   X.X   X.X  ← SKIP THIS

EXTRACT: Only the TOTAL column value (4th number) from "Desat Index (#/hour)" row

EXAMPLES:
- "Desat Index (#/hour)    1.4   8.8   1.9   2.8" → Extract: 2.8
- "Desat Index (#/hour)    0.6   0.0   0.2   1.3" → Extract: 1.3

Return JSON:
{
  "success": true,
  "value": 2.8,
  "debug": "exact text of the row found"
}

If not found:
{
  "success": false,
  "value": null,
  "error": "reason"
}

DOCUMENT: ${truncatedContent}`;

  try {
    console.log('=== DESATURATION INDEX EXTRACTION START ===');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 200,
        messages: [
          { 
            role: 'user', 
            content: `Extract the exact TOTAL value from the "Desat Index (#/hour)" row. Be precise and include debug information.\n\n${desatPrompt}`
          }
        ],
      }),
    });

      if (!response.ok) {
        console.error('Desaturation API request failed:', response.status);
        return null;
      }

      const data = await response.json();
      console.log('Desaturation AI response structure:', JSON.stringify(data, null, 2));
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("Unexpected desaturation AI response:", data);
        return null;
      }
      
      let result = data.choices[0].message.content.trim();
    
    console.log('Raw desaturation response:', result);
    
    // Clean JSON response
    if (result.includes('```json')) {
      result = result.replace(/```json\s*/, '').replace(/```\s*$/, '');
    }
    if (result.includes('```')) {
      result = result.replace(/```\s*/, '').replace(/```\s*$/, '');
    }
    
    const desatData = JSON.parse(result);
    console.log('Parsed desaturation data:', desatData);
    
    if (desatData.debug) {
      console.log('Row found:', desatData.debug);
    }
    
    const finalValue = desatData.success ? desatData.value : null;
    console.log('Final desaturation index:', finalValue);
    console.log('=== DESATURATION INDEX EXTRACTION END ===');
    
    return finalValue;
    
  } catch (error) {
    console.error('Desaturation index extraction error:', error);
    console.log('=== DESATURATION INDEX EXTRACTION FAILED ===');
    return null;
  }
};

// Mask types and sizes for clinical data reference
const maskTypes = [
  { value: 'resmed_airfit_f20', label: 'Resmed AirFit F20 Full Face mask' },
  { value: 'resmed_airfit_n20', label: 'Resmed AirFit N20 Nasal mask' },
  { value: 'resmed_airfit_n30', label: 'Resmed AirFit N30 Nasal Pillows' },
  { value: 'resmed_airfit_f10', label: 'Resmed AirFit F10 Full Face mask' },
  { value: 'nonvented_resmed_full_face', label: 'NONVENTED RESMED FULL FACE MASK' },
  { value: 'amara_gel_full_face', label: 'AMARA GEL FULL FACE MASK' },
  { value: 'amara_full_face', label: 'AMARA FULL FACE MASK' },
  { value: 'amara_view_full_face', label: 'AMARA VIEW FULL FACE MASK' },
  { value: 'comfort_gel_blue_full_face', label: 'COMFORT GEL BLUE FULL FACE' },
  { value: 'comfortgel_nasal', label: 'COMFORTGEL NASAL MASK' },
  { value: 'dreamwear_full_face', label: 'DREAMWEAR FULL FACE MASK' },
  { value: 'dreamwear_gel_nasal_pillow', label: 'DREAMWEAR GEL NASAL PILLOW' },
  { value: 'dreamwear_nasal', label: 'DREAMWEAR NASAL MASK' },
  { value: 'true_blue_nasal', label: 'TRUE BLUE NASAL MASK' },
  { value: 'wisp_minimal_nasal', label: 'WISP MINIMAL CONTACT NASAL MASK' }
];

const maskSizes = [
  { value: 'petite', label: 'PETITE' },
  { value: 'small', label: 'SMALL' },
  { value: 'medium_small', label: 'MEDIUM/SMALL' },
  { value: 'medium', label: 'MEDIUM' },
  { value: 'medium_wide', label: 'MEDIUM/WIDE' },
  { value: 'large', label: 'LARGE' },
  { value: 'x_large', label: 'X LARGE' }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate content type
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Invalid content type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestBody = await req.json();
    const { fileContent, studyType, clinicalData } = requestBody;

    // Input validation
    if (!fileContent || typeof fileContent !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid file content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!studyType || typeof studyType !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid study type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate study type
    const validStudyTypes = ['Diagnostic', 'Titration', 'Split-Night'];
    if (!validStudyTypes.includes(studyType)) {
      return new Response(JSON.stringify({ error: 'Invalid study type. Must be Diagnostic, Titration, or Split-Night' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize file content
    const sanitizedContent = fileContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    console.log('Lovable API key exists:', !!lovableApiKey);
    if (lovableApiKey) {
      console.log('API key length:', lovableApiKey.length);
    }
    
    if (!lovableApiKey) {
      console.warn('Lovable API key not configured; proceeding with deterministic extraction only.');
    }

    // Truncate file content if too long to avoid token limits, but ALWAYS include the Oximetry section
    const maxContentLength = 50000;
    let truncatedContent = sanitizedContent;

    if (sanitizedContent.length > maxContentLength) {
      // Try to extract the Oximetry section to ensure it's included
      const oximetryRegexes = [
        /Oximetry\s*Distribution[\s\S]*?(?=(BODY\s*POSITION|Leg\s*Movements|Snoring|$))/i,
        /OXIMETRY\s*SUMMARY[\s\S]*?(?=(BODY\s*POSITION|Leg\s*Movements|Snoring|$))/i,
        /Oximetry[\s\S]*?(?=(BODY\s*POSITION|PAGE\s*7|$))/i
      ];

      let oximetrySection: string | null = null;
      for (const rx of oximetryRegexes) {
        const m = sanitizedContent.match(rx);
        if (m) { oximetrySection = m[0]; break; }
      }

      // Leave some buffer and include oximetry section if found
      const buffer = 200; // safety buffer for prompt
      const baseLength = oximetrySection ? Math.max(0, maxContentLength - oximetrySection.length - buffer) : maxContentLength;
      const base = sanitizedContent.substring(0, baseLength);

      if (oximetrySection && !base.includes(oximetrySection)) {
        truncatedContent = `${base}\n\n[Included Oximetry Section]\n${oximetrySection}`;
        console.log('Included Oximetry section in truncated content.', { sectionLength: oximetrySection.length, baseLength, finalLength: truncatedContent.length });
      } else {
        truncatedContent = base + (sanitizedContent.length > baseLength ? "\n\n[Content truncated...]" : "");
      }
    }

    console.log('Processing file content length:', sanitizedContent.length);
    console.log('Truncated content preview (last 1000 chars):', truncatedContent.slice(-1000));
    
    // === CONTENT DEBUG - USER REQUESTED ===
    console.log('=== CONTENT DEBUG ===');
    console.log('Content length:', truncatedContent.length);
    console.log('Has TST:', truncatedContent.includes('TST'));
    console.log('Has oximetry:', truncatedContent.toLowerCase().includes('oximetry'));
    console.log('Has Desat Index:', truncatedContent.includes('Desat Index'));
    
    // Also check if content contains oximetry keywords
    const hasOximetryKeywords = sanitizedContent.toLowerCase().includes('oximetry') || 
                                sanitizedContent.toLowerCase().includes('spo2') || 
                                sanitizedContent.toLowerCase().includes('oxygen saturation');
    console.log('Content contains oximetry keywords:', hasOximetryKeywords);

    const MEDICAL_GRADE_PROMPT = `You are a medical-grade AI sleep study assistant. Your task is to extract and summarize **key clinical metrics** from uploaded sleep study files and generate a **clean, modern, and medically accurate** summary based on approved formats and logic.

## 🔍 PRECISE PAGE-BY-PAGE EXTRACTION RULES

### 📄 PAGE 1: Patient Information & Basic Sleep Data

**Patient Information Section (Top-Left):**
- **Patient Name**: Look in "Recording identification" section, line labeled "Patient name", extract value after the colon
- **First Name**: Directly below patient name, line labeled "First name", extract value after the colon  
- **Age**: Line labeled "Patient age", extract value after the colon in patient demographics block

**Sleep Data Section - Times Block (Middle-Left):**
- **Light Off Time**: In "SLEEP DATA 1" section under "Times", row labeled "Light off (LO)", extract from right column
- **Light On Time**: Same "Times" block, row labeled "Light on (LON)", extract from right column (may have "[Recording end]" annotation)

**Durations Section (Middle-Left, below Times):**
- **TIB (Time in Bed)**: In "Durations" block, row labeled "TIB", extract value after colon (explanation: "Light off -> Light on")
- **TST (Total Sleep Time)**: Same "Durations" block, row labeled "TST", extract value after colon (explanation: "REM + NREM + MVT (during SPT)")

**Latencies Section (Bottom of page):**
- **Sleep Onset Latency**: In "Latencies" table at bottom, "Sleep onset" row, under "From Light off (min)" column
- **REM Latency**: Same "Latencies" table, "REM" row, under "From Sleep onset (min)" column

### 📄 PAGE 2: Sleep Architecture & Efficiency

**General Section (Top-Left):**
- **Sleep Efficiency**: In "General" block, row labeled "Sleep efficiency 1", extract value after colon (includes "%" symbol)

**Sleep Stages Distribution Table (Middle Section):**
- **REM Duration**: In "Sleep Stages Distribution" table, "REM" row, under "duration (min)" column
- **REM TST Percentage**: Same "REM" row, under "TST (%)" column (may have handwritten annotation "N24")
- **S1 Episodes**: In "S1" row, under "Episodes (# of)" column
- **S1 TST Percentage**: Same "S1" row, under "TST (%)" column (may have handwritten annotation "N2t")
- **S2 Episodes**: In "S2" row, under "Episodes (# of)" column
- **S3 Episodes**: In "S3" row (may have handwritten note "slow wave sleep"), under "Episodes (# of)" column
- **S3 TST Percentage**: Same "S3" row, under "TST (%)" column (may have handwritten annotation "N3t")

**Sleep Data 3 Section (Bottom):**
- **REM Cycles**: In "SLEEP DATA 3" section, next to "REM Cycles" label as standalone number
- **REM 1**: In REM cycles table, "REM 1" row, under "Tot" column
- **REM 2**: In "REM 2" row, under "Tot" column

### 📄 PAGE 3: No data required

### 📄 PAGE 4: Respiratory Events

**Respiratory Events Summary - Total Sleep Time Section (Bottom Half):**
- **Central Apnea Index (CA)**: In "Index (#/h TST)" row under "CA" column
- **Obstructive Apnea Index (OA)**: Same row, under "OA" column
- **Mixed Apnea Index (MA)**: Same row, under "MA" column
- **Hypopnea Index (HYP)**: Same row, under "HYP" column
- **Mean Hypopnea Duration**: In "Mean (seconds)" row under "HYP" column

**CALCULATION REQUIRED:**
- **Mean Hypopnea Duration**: (CA + OA + MA + HYP) / 4

**Respiratory Disturbance Index Section (Bottom):**
- **AHI REM**: In RDI row, under "REM #/h (REM)" column
- **AHI NREM**: Same RDI row, under "NREM #/h (NREM)" column
- **AHI Overall (TST)**: Same RDI row, under "TST #/h (sleep)" column

### 📄 PAGE 5: Heart Rate Data

**Heart Rate Summary Section (Bottom Half):**
- **REM Duration**: In "HEART RATE SUMMARY" table, "Duration (min)" row under "REM" column
- **REM Mean HR (BPM)**: Same table, "Mean HR (BPM)" row under "REM" column
- **NREM Duration**: In "Duration (min)" row under "NREM" column
- **NREM Mean HR (BPM)**: In "Mean HR (BPM)" row under "NREM" column

### 📄 PAGE 6: Oxygenation & Arousal Data

**Oximetry Distribution Section (Top Half):**
- **<90 SpO2% Wake**: In "Oximetry Distribution" table, "<90" row under "Wake" column
- **<95 SpO2% Wake**: Same table, "<95" row under "Wake" column
- **Non-REM <85**: In "<85" row under "Non-REM" column
- **Non-REM <90**: In "<90" row under "Non-REM" column
- **REM <90**: In "<90" row under "REM" column
- **REM <95**: In "<95" row under "REM" column

**CALCULATIONS REQUIRED FOR OXYGEN SATURATION PERCENTAGES:**
- **Oxygen < 90%**: Extract REM and NREM values from "<90" row, then calculate: ((REM + NREM) * 100) / Total Sleep Time
- **Oxygen < 95%**: Extract REM and NREM values from "<95" row, then calculate: ((REM + NREM) * 100) / Total Sleep Time

**Oximetry Summary Table (Middle Section):**
- **Average SpO2**: In "Average (%)" row under "WK" column
- **Total NREM**: In "NREM" column showing value
- **Number of Desaturations Total**: In "Number of desaturations" row under "TOTAL" column
- **Desaturation Index (#/hour) Total**: In "Desat Index (#/hour)" row under "TOTAL" column - CRITICAL: Extract ONLY the TOTAL column value (last number in row)

**Respiratory Event O2 Min Levels Section:**
- **Mean SpO2 Min Levels**: Extract percentage value (may have handwritten annotations like "significant", "<88", "minimal 74-88")

**Arousal Summary Section (Bottom):**
- **Arousal Index**: Extract value next to "Arousal index" (format: "X.X/h(sleep)")

### 📄 PAGE 7: Movement & Position Data

**Snoring Summary Section (Top):**
- **Snoring Duration**: In "Total duration with snoring" line, extract "X min" value
- **Snoring Percentage**: Same line, extract "X % of sleep" value

**Leg Movements Summary Section (Middle):**
- **Leg Movement Index**: In "Leg movements" row, under "Index" column

**Body Position Summary Section (Bottom):**
- **Left Position Index**: In "L" row, under "Index (#/h)" column
- **Right Position Index**: In "R" row, under "Index (#/h)" column  
- **Supine Position Index**: In "S/SL" combined row, under "Index (#/h)" column

**CALCULATION REQUIRED:**
- **AHI Lateral**: If both L and R position data exist: (Right + Left) / 2

## 💨 CPAP/BPAP PRESSURE & MASK DETAILS

Extract from **titration** or **split therapeutic part**:
- Pressure Type: CPAP or BPAP
- Starting Pressure
- Max Pressure Reached
- Was Pressure Effective? (based on AHI drop, oxygenation improvement)

## 🧮 CALCULATIONS & INTERPRETATIONS

### 🩺 AHI Classification
- AHI < 5 → Normal Study
- 5–15 → Mild OSA
- 15–30 → Moderate OSA
- >30 → Severe OSA

### 💡 Sleep Efficiency
- ≥85% → Normal
- <85% → Reduced

### 🫁 Oxygen Desaturation
- Avg SpO2 90–94% → Mild
- 85–89% → Moderate
- <85% → Severe
- If % time with SpO₂ <90% >5% of TST → "Critical desaturation"

### 📊 Custom Calculations
- **AHI Lateral =** (Right + Left) / 2
- **O2 <90% =** Extract REM and NREM values from Oximetry Distribution table "<90" row, then calculate: ((REM + NREM) * 100) / Total Sleep Time
- **O2 <95% =** Extract REM and NREM values from Oximetry Distribution table "<95" row, then calculate: ((REM + NREM) * 100) / Total Sleep Time
- **Mean Hypopnea Duration =** If values exist → (CA + OA + MA + HYP) / 4

## 📋 CLINICAL SUMMARY GENERATION - STRUCTURED LOGIC

### A. 📅 STUDY TYPE & TIMING (OVERNIGHT vs DAYTIME)
Use AM/PM to determine:
- Start time between 5 PM – 9 AM → "overnight sleep study"
- Start time between 9 AM – 5 PM → "daytime sleep study"

Generate: "This (overnight/daytime) (split-night / therapeutic / repeated) sleep study shows evidence of (diagnosis)."

### B. 🛌 TOTAL SLEEP TIME CONVERSION
Convert minutes to hours/minutes:
- hours = minutes // 60
- remaining minutes = minutes % 60
Example: 262 min → 4 hours and 22 minutes

### C. 😴 AHI CLASSIFICATION (Apnea-Hypopnea Index)
- AHI < 5 → Normal
- 5 ≤ AHI < 15 → Mild OSA
- 15 ≤ AHI < 30 → Moderate OSA
- AHI ≥ 30 → Severe OSA

Add: "…with an AHI of [X] events/hr, consistent with (mild/moderate/severe) Obstructive Sleep Apnea…"

### D. 🫁 CPAP / BPAP INTERVENTION
If CPAP used:
"Conventional CPAP was (applied / attempted / refused). Titration was (acceptable / unacceptable). At CPAP pressure of [X] cmH2O, respiratory events were (eliminated / improved / persisted)."

If CPAP failed and BPAP applied:
"Titration was escalated to BPAP at [IPAP]/[EPAP] cmH2O where respiratory events were eliminated."

### E. 😷 MASK AND ACCESSORIES DETAILS
If CPAP/BPAP applied, and study is therapeutic or split-night:
"CPAP was delivered via [Mask Type – Size], with (headgear / chin strap) used."
Example: "CPAP was delivered via ResMed AirFit F20 Full Face Mask – Medium, with headgear and chin strap."

### F. 🧪 CO2 MONITORING (OPTIONAL)
If values present:
"EtCO2 was monitored and values showed: – mmHg while awake, – mmHg in NREM, and – mmHg in REM."
"TcCO2 values showed: – mmHg while awake, – mmHg in NREM, – mmHg in REM."

### G. 💊 MEDICATION (OPTIONAL)
"Tab. Zolpidem __ mg was given at __ PM per doctor's order. Sleep latency was __ minutes."
"Tab. Sinemet __ mg was given at __ PM."
"Patient refused to take Sinemet." (if applicable)

### H. 🦵 LEG MOVEMENTS AND RLS
PLM Index ≥15/hr (adult) → PLM present
PLM Index <15/hr → PLM not clinically significant

If PLM index ≥ 15/hr:
"Frequent leg movements were noted during sleep meeting PLM criteria, with an index of [XX], suggesting Periodic Limb Movements (PLMs)."

If RLS (leg movement while awake):
"Frequent leg movements were observed while awake, suggesting the possibility of Restless Legs Syndrome (RLS)."

### I. 🔉 SNORING
If snoring present: "Snoring was noted."
(Do not say "routine snoring" and do not mention snoring if absent.)

### J. 🧠 SLEEP ARCHITECTURE
"The patient progressed into (all sleep stages / missed REM / missed N3 / did not reach any stages)."

### K. 🗣 PATIENT COMMENT (OPTIONAL)
Include if provided. Example:
"Patient reported sleeping better in the center and is willing to use CPAP at home."

### L. 🔚 CLOSING STATEMENT LOGIC
Only include "Otherwise, no unusual events were noted during the study." 
IF all of the following are absent: Snoring, PLM, RLS

Combinations:
- ❌ No snoring, no PLMs, no RLS → "Otherwise, no unusual events were noted during the study."
- ✅ Snoring only → "Snoring was noted. Otherwise, no unusual events were noted during the study."
- ✅ PLMs only → "Frequent leg movements were noted during sleep meeting PLM criteria, with an index of [XX], suggesting PLMs. Otherwise, no unusual events were noted during the study."
- ✅ RLS + PLMs → "Frequent leg movements were observed while awake, suggesting RLS. Frequent leg movements were also noted during sleep meeting PLM criteria, with an index of [XX], suggesting PLMs."
- ✅ Snoring + PLMs → "Snoring was noted. Frequent leg movements were also noted during sleep meeting PLM criteria, with an index of [XX], suggesting PLMs."
- ✅ Snoring + RLS + PLMs → "Snoring was noted. Frequent leg movements were observed while awake, suggesting RLS. Frequent leg movements were also noted during sleep meeting PLM criteria, with an index of [XX], suggesting PLMs."

### EXAMPLE OUTPUT:
"This overnight split sleep study shows evidence of Severe Obstructive Sleep Apnea. The patient had a total sleep time of 4 hours and 56 minutes with an AHI of 70.7 events per hour associated with minimal desaturations and repetitive sleep interruptions. Conventional CPAP was applied and titration was done. At CPAP pressure of 10 cmH2O, respiratory events were eliminated on supine REM sleep. He progressed into all sleep stages.

EtCO2 was monitored and values showed: 31–46 mmHg while awake, 30–47 mmHg in NREM, and 30–48 mmHg in REM sleep. TcCO2 values showed: 60–64 mmHg while awake and 60–63 mmHg in NREM sleep.

Otherwise, no unusual events were noted during the study."

CRITICAL: Return ONLY valid JSON. Extract exact values when available. Use null for missing data.

Study Type: ${studyType}

${clinicalData ? `ADDITIONAL CLINICAL DATA PROVIDED BY USER:
Mask Configuration: ${clinicalData.maskType ? maskTypes.find(t => t.value === clinicalData.maskType)?.label : 'Not specified'} - ${clinicalData.maskSize ? maskSizes.find(s => s.value === clinicalData.maskSize)?.label : 'Not specified'}
Accessories: ${[clinicalData.hasHeadgear && 'Headgear', clinicalData.hasChinstrap && 'Chinstrap'].filter(Boolean).join(', ') || 'None'}
${clinicalData.bpapUsed ? `BPAP Pressure: IPAP ${clinicalData.ipapPressure} cmH2O / EPAP ${clinicalData.epapPressure} cmH2O` : 
  clinicalData.cpapPressure ? `CPAP Pressure: ${clinicalData.cpapPressure} cmH2O` : 'Pressure not specified'}
${clinicalData.etco2?.awake || clinicalData.etco2?.nrem || clinicalData.etco2?.rem ? 
  `EtCO2 Values: Awake ${clinicalData.etco2.awake || 'N/A'} mmHg, NREM ${clinicalData.etco2.nrem || 'N/A'} mmHg, REM ${clinicalData.etco2.rem || 'N/A'} mmHg` : ''}
${clinicalData.tcco2?.awake || clinicalData.tcco2?.nrem || clinicalData.tcco2?.rem ? 
  `TcCO2 Values: Awake ${clinicalData.tcco2.awake || 'N/A'} mmHg, NREM ${clinicalData.tcco2.nrem || 'N/A'} mmHg, REM ${clinicalData.tcco2.rem || 'N/A'} mmHg` : ''}
${clinicalData.medication ? `Medication: ${clinicalData.medication}` : ''}
${clinicalData.isRepeatedStudy ? 'NOTE: This is a repeated sleep study.' : ''}
${clinicalData.selectedComments && clinicalData.selectedComments.length > 0 ? 
  `Patient Comments: ${clinicalData.selectedComments.map(comment => {
    const patientCommentLabels = [
      { value: 'sleeping_better_center', label: 'Patient reports sleeping better in the center compared to home.' },
      { value: 'no_difference', label: 'Patient reports no difference in sleep quality between the center and home.' },
      { value: 'sleeping_better_home', label: 'Patient reports sleeping better at home.' },
      { value: 'improved_with_cpap', label: 'Patient reports improved sleep in the center with CPAP and will discuss continuation at home with the physician.' },
      { value: 'willing_cpap_home', label: 'Patient reports improved sleep in the center and expresses willingness to initiate CPAP therapy at home.' },
      { value: 'better_without_cpap', label: 'Patient reports better sleep without CPAP.' },
      { value: 'undecided_cpap', label: 'Patient remains undecided regarding the use of CPAP at home.' },
      { value: 'no_comment', label: 'No comment provided' }
    ];
    const foundComment = patientCommentLabels.find(c => c.value === comment);
    return foundComment ? foundComment.label : comment;
  }).join(' ')}` : ''}

IMPORTANT: Incorporate this user-provided clinical data into your analysis and clinical summary. Use these values for mask details, pressure settings, CO2 monitoring, and medication information in your clinical summary.` : ''}

FILE CONTENT TO ANALYZE:
${truncatedContent}

Expected JSON structure:
{
  "patientInfo": {
    "name": "string or null",
    "firstName": "string or null",
    "age": "number or null",
    "gender": "string or null"
  },
  "studyInfo": {
    "studyType": "diagnostic|titration|split_night",
    "studyDate": "string or null",
    "startTime": "string or null",
    "lightsOff": "string or null",
    "lightsOn": "string or null",
    "timeInBed": "number (minutes) or null",
    "totalSleepTime": "number (minutes) or null",
    "sleepLatency": "number (minutes) or null",
    "remLatency": "number (minutes) or null"
  },
  "sleepArchitecture": {
    "sleepEfficiency": "number (percentage) or null",
    "stage1Percent": "number or null",
    "stage2Percent": "number or null",
    "stage3Percent": "number or null",
    "remPercent": "number or null",
    "remCycles": {
      "count": "number or null",
      "startTimes": "array of strings or null",
      "durations": "array of numbers or null"
    }
  },
  "respiratoryEvents": {
    "ahiOverall": "number or null",
    "ahiSupine": "number or null",
    "ahiLateral": "number or null",
    "ahiLeft": "number or null",
    "ahiRight": "number or null",
    "ahiNrem": "number or null",
    "ahiRem": "number or null",
    "centralApneaIndex": "number or null",
    "obstructiveApneaIndex": "number or null",
    "mixedApneaIndex": "number or null",
    "hypopneaIndex": "number or null",
    "meanHypopneaDuration": "number (seconds) or null"
  },
  "oxygenation": {
    "averageSpO2": "number or null",
    "averageSpO2Nrem": "number or null",
    "averageSpO2Rem": "number or null",
    "lowestSpO2": "number or null",
    "desaturationIndex": "number or null",
    "timeBelow90Percent": "number (percentage) or null",
    "timeBelow95Percent": "number (percentage) or null"
  },
  "cardiacData": {
    "meanHeartRateNrem": "number or null",
    "meanHeartRateRem": "number or null"
  },
  "additionalMetrics": {
    "arousalIndex": "number or null",
    "snoringMinutes": "number or null",
    "snoringPercent": "number or null",
    "legMovementIndex": "number or null",
    "leftPositionIndex": "number or null",
    "rightPositionIndex": "number or null",
    "supinePositionIndex": "number or null"
  },
  "titrationData": {
    "pressureType": "string or null",
    "startingPressure": "number or null",
    "maxPressure": "number or null",
    "effectivePressure": "number or null",
    "pressureEffective": "boolean or null"
  },
  "clinicalSummary": "Auto-generated clinical interpretation following the medical structure above",
  "ahiClassification": "Normal Study|Mild OSA|Moderate OSA|Severe OSA",
  "sleepEfficiencyStatus": "Normal|Reduced",
  "oxygenationSeverity": "Normal|Mild|Moderate|Severe|Critical desaturation",
  "patientComments": "string or null - Combined patient comments and study notes"
}`;

  // Separate focused extraction for desaturation index
  const extractDesaturationIndex = async (truncatedContent, lovableApiKey) => {
    const desatPrompt = `Extract the Total Desaturation Index from this sleep study report.

LOCATION: Look in the oximetry table section

FIND: The row labeled "Desat Index (#/hour)" (NOT "Desat Index (dur/hour)")

TABLE STRUCTURE EXAMPLE:
                        WK    REM   NREM  TOTAL
Average (%)             XX    XX    XX    XX
Number of desaturations  X     X     X     X
Desat Index (#/hour)    X.X   X.X   X.X   X.X  ← EXTRACT TOTAL
Desat Index (dur/hour)  X.X   X.X   X.X   X.X  ← SKIP THIS

EXTRACT: Only the TOTAL column value (4th number) from "Desat Index (#/hour)" row

EXAMPLES:
- "Desat Index (#/hour)    1.4   8.8   1.9   2.8" → Extract: 2.8
- "Desat Index (#/hour)    0.6   0.0   0.2   1.3" → Extract: 1.3

Return JSON:
{
  "success": true,
  "value": 2.8,
  "debug": "exact text of the row found"
}

If not found:
{
  "success": false,
  "value": null,
  "error": "reason"
}

DOCUMENT: ${truncatedContent}`;

    try {
      console.log('=== DESATURATION INDEX EXTRACTION START ===');
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
          max_tokens: 200,
          messages: [
            { 
              role: 'user', 
              content: `Extract the exact TOTAL value from the "Desat Index (#/hour)" row. Be precise and include debug information.\n\n${desatPrompt}`
            }
          ],
        }),
      });

      if (!response.ok) {
        console.error('Desaturation API request failed:', response.status);
        return null;
      }

      const data = await response.json();
      console.log('Nested desaturation AI response structure:', JSON.stringify(data, null, 2));
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("Unexpected nested desaturation AI response:", data);
        return null;
      }
      
      let result = data.choices[0].message.content.trim();
      
      console.log('Raw desaturation response:', result);
      
      // Clean JSON response - handle descriptive responses
      if (result.includes('```json')) {
        result = result.replace(/```json\s*/, '').replace(/```\s*$/, '');
      }
      if (result.includes('```')) {
        result = result.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      // Extract JSON from response - look for actual JSON content
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = jsonMatch[0];
      }
      
      const desatData = JSON.parse(result);
      console.log('Parsed desaturation data:', desatData);
      
      if (desatData.debug) {
        console.log('Row found:', desatData.debug);
      }
      
      const finalValue = desatData.success ? desatData.value : null;
      console.log('Final desaturation index:', finalValue);
      console.log('=== DESATURATION INDEX EXTRACTION END ===');
      
      return finalValue;
      
    } catch (error) {
      console.error('Desaturation index extraction error:', error);
      console.log('=== DESATURATION INDEX EXTRACTION FAILED ===');
      return null;
    }
  };

  console.log('Sending request to Lovable AI (Gemini)...');
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 3000,
        messages: [
          { 
            role: 'user', 
            content: `You are a medical AI expert specializing in sleep study analysis. Your task is to extract exact numerical values from sleep study reports. Search thoroughly through the entire document for each requested metric. Extract ONLY the exact values as they appear in the document - do not estimate or interpolate. Return only valid JSON with actual extracted values.\n\n${MEDICAL_GRADE_PROMPT}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Lovable AI error:', errorData);
      console.error('Model being used:', 'google/gemini-2.5-flash');
      throw new Error(`Lovable AI error: ${response.status} - Model: google/gemini-2.5-flash`);
    }

    const data = await response.json();
    console.log('Main extraction AI response structure:', JSON.stringify(data, null, 2));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected main extraction AI response:", data);
      throw new Error('Invalid AI response structure');
    }
    
    let analysisResult = data.choices[0].message.content;
    
    // === AI RESPONSE DEBUG - USER REQUESTED ===
    console.log('=== AI RESPONSE DEBUG ===');
    console.log('Raw response:', data.choices?.[0]?.message?.content || 'No response content');
    
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
      
      // Post-process to add custom calculations
      if (extractedData) {
        // Use the comprehensive sleep metrics extraction (always run; function has its own fallbacks)
        console.log('=== COMPREHENSIVE SLEEP METRICS EXTRACTION START ===');
        
        const sleepMetrics = await extractSleepMetrics(truncatedContent, lovableApiKey);
        
        // Assign to your data structure (ensure nested objects exist)
        extractedData.oxygenation = extractedData.oxygenation || {};
        extractedData.respiratoryEvents = extractedData.respiratoryEvents || {};

        extractedData.oxygenation.timeBelow90Percent = `${sleepMetrics.oxygenUnder90Percent}%`;
        extractedData.oxygenation.timeBelow95Percent = `${sleepMetrics.oxygenUnder95Percent}%`;
        extractedData.respiratoryEvents.meanHypopneaDuration = sleepMetrics.hypopneaMeanDuration;
        extractedData.oxygenation.desaturationIndex = sleepMetrics.desaturationIndex;

        console.log('Final assigned values:', {
          under90: extractedData.oxygenation.timeBelow90Percent,
          under95: extractedData.oxygenation.timeBelow95Percent,
          hypopneaDuration: extractedData.respiratoryEvents.meanHypopneaDuration,
          desatIndex: extractedData.oxygenation.desaturationIndex
        });
        
        console.log('=== COMPREHENSIVE SLEEP METRICS EXTRACTION END ===');
        
        // Calculate AHI Lateral if we have left and right values
        if (extractedData.respiratoryEvents?.ahiLeft && extractedData.respiratoryEvents?.ahiRight) {
          extractedData.respiratoryEvents.ahiLateral = Math.round(((extractedData.respiratoryEvents.ahiLeft + extractedData.respiratoryEvents.ahiRight) / 2) * 10) / 10;
        }
        
        // Calculate mean hypopnea duration if individual values exist
        const { centralApneaIndex, obstructiveApneaIndex, mixedApneaIndex, hypopneaIndex } = extractedData.respiratoryEvents || {};
        if (centralApneaIndex !== null && obstructiveApneaIndex !== null && mixedApneaIndex !== null && hypopneaIndex !== null) {
          extractedData.respiratoryEvents.meanHypopneaDuration = Math.round(((centralApneaIndex + obstructiveApneaIndex + mixedApneaIndex + hypopneaIndex) / 4) * 100) / 100;
        }
      }
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', parseError);
      console.error('Raw response:', analysisResult);
      // Fallback to structured empty data if parsing fails
      extractedData = {
        patientInfo: {
          name: null,
          firstName: null,
          age: null,
          gender: null
        },
        studyInfo: {
          studyType: studyType.toLowerCase().replace('-', '_'),
          studyDate: null,
          startTime: null,
          lightsOff: null,
          lightsOn: null,
          timeInBed: null,
          totalSleepTime: null,
          sleepLatency: null,
          remLatency: null
        },
        sleepArchitecture: {
          sleepEfficiency: null,
          stage1Percent: null,
          stage2Percent: null,
          stage3Percent: null,
          remPercent: null,
          remCycles: {
            count: null,
            startTimes: null,
            durations: null
          }
        },
        respiratoryEvents: {
          ahiOverall: null,
          ahiSupine: null,
          ahiLateral: null,
          ahiLeft: null,
          ahiRight: null,
          ahiNrem: null,
          ahiRem: null,
          centralApneaIndex: null,
          obstructiveApneaIndex: null,
          mixedApneaIndex: null,
          hypopneaIndex: null,
          meanHypopneaDuration: null
        },
        oxygenation: {
          averageSpO2: null,
          averageSpO2Nrem: null,
          averageSpO2Rem: null,
          lowestSpO2: null,
          desaturationIndex: null,
          timeBelow90Percent: null,
          timeBelow95Percent: null
        },
        cardiacData: {
          meanHeartRateNrem: null,
          meanHeartRateRem: null
        },
        additionalMetrics: {
          arousalIndex: null,
          snoringMinutes: null,
          snoringPercent: null,
          legMovementIndex: null,
          leftPositionIndex: null,
          rightPositionIndex: null,
          supinePositionIndex: null
        },
        titrationData: {
          pressureType: null,
          startingPressure: null,
          maxPressure: null,
          effectivePressure: null,
          pressureEffective: null
        },
        clinicalSummary: "Unable to parse sleep study report. Please check the file format.",
        ahiClassification: "Unable to determine",
        sleepEfficiencyStatus: "Unable to determine",
        oxygenationSeverity: "Unable to determine"
      };
    }

    const processedData = {
      ...extractedData,
      studyType: studyType
    };

    // Process patient comments from clinical data (excluding repeated study note)
    let patientComments = [];
    if (clinicalData && clinicalData.selectedComments && clinicalData.selectedComments.length > 0) {
      const patientCommentLabels = [
        { value: 'sleeping_better_center', label: 'Patient reports sleeping better in the center compared to home.' },
        { value: 'no_difference', label: 'Patient reports no difference in sleep quality between the center and home.' },
        { value: 'sleeping_better_home', label: 'Patient reports sleeping better at home.' },
        { value: 'improved_with_cpap', label: 'Patient reports improved sleep in the center with CPAP and will discuss continuation at home with the physician.' },
        { value: 'willing_cpap_home', label: 'Patient reports improved sleep in the center and expresses willingness to initiate CPAP therapy at home.' },
        { value: 'better_without_cpap', label: 'Patient reports better sleep without CPAP.' },
        { value: 'undecided_cpap', label: 'Patient remains undecided regarding the use of CPAP at home.' },
        { value: 'no_comment', label: 'No comment provided' }
      ];
      
      clinicalData.selectedComments.forEach(commentValue => {
        const comment = patientCommentLabels.find(c => c.value === commentValue);
        if (comment) {
          patientComments.push(comment.label);
        }
      });
    }
    
    // Add patient comments to processed data as array
    if (patientComments.length > 0) {
      processedData.patientComments = patientComments;
    }

    // === FINAL VALUES DEBUG - USER REQUESTED ===
    console.log('=== FINAL VALUES DEBUG ===');
    console.log({
      oxygen90: processedData.oxygenation?.timeBelow90Percent,
      oxygen95: processedData.oxygenation?.timeBelow95Percent,
      hypopnea: processedData.respiratoryEvents?.meanHypopneaDuration,
      desatIndex: processedData.oxygenation?.desaturationIndex
    });

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