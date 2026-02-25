import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper functions for mask label and size conversions
function getMaskLabel(maskValue: string | null | undefined): string {
  if (!maskValue) return '---';
  const maskTypes: { [key: string]: string } = {
    'resmed_airfit_f20': 'RESMED AIRFIT F20 FULL FACE MASK',
    'resmed_airfit_n20': 'RESMED AIRFIT N20 NASAL MASK',
    'resmed_airfit_n30': 'RESMED AIRFIT N30 NASAL PILLOWS',
    'resmed_airfit_f10': 'RESMED AIRFIT F10 FULL FACE MASK',
    'nonvented_resmed_full_face': 'NONVENTED RESMED FULL FACE MASK',
    'dreamwear_full_face': 'DREAMWEAR FULL FACE MASK',
    'dreamwear_nasal': 'DREAMWEAR NASAL MASK',
    'dreamwear_gel_nasal_pillow': 'DREAMWEAR GEL NASAL PILLOW',
    'amara_gel_full_face': 'AMARA GEL FULL FACE MASK',
    'amara_view_full_face': 'AMARA VIEW FULL FACE MASK',
    'amara_full_face': 'AMARA FULL FACE MASK',
    'comfort_gel_blue_full_face': 'COMFORT GEL BLUE FULL FACE MASK',
    'comfortgel_nasal': 'COMFORTGEL NASAL MASK',
    'true_blue_nasal': 'TRUE BLUE NASAL MASK',
    'wisp_minimal_nasal': 'WISP MINIMAL CONTACT NASAL MASK'
  };
  return maskTypes[maskValue] || maskValue.toUpperCase();
}

function getMaskSizeLabel(sizeValue: string | null | undefined): string {
  if (!sizeValue) return '---';
  const sizes: { [key: string]: string } = {
    'petite': 'PETITE',
    'small': 'SMALL',
    'medium_small': 'MEDIUM/SMALL',
    'medium': 'MEDIUM',
    'medium_wide': 'MEDIUM/WIDE',
    'large': 'LARGE',
    'x_large': 'X LARGE'
  };
  return sizes[sizeValue] || sizeValue.toUpperCase();
}

// AASM Clinical Guidelines Constants
const AASM_GUIDELINES = {
  OSA_SEVERITY: {
    NORMAL: { max: 5 },
    MILD: { min: 5, max: 15 },
    MODERATE: { min: 15, max: 30 },
    SEVERE: { min: 30 }
  },
  POSITIONAL_RATIO: 2, // AHI supine > 2x lateral
  REM_RATIO: 2, // AHI REM > 2x NREM
  SIGNIFICANT_DESAT: 5, // >5% time below 90%
  ELEVATED_PLM: 15, // PLM index > 15
  SIGNIFICANT_CAI: 5 // Central Apnea Index > 5
};

// ========== QUALITY ASSURANCE SYSTEM ==========

// Clinical range validation rules
const VALIDATION_RANGES = {
  ahiOverall: { min: 0, max: 150, label: 'AHI Overall' },
  ahiSupine: { min: 0, max: 200, label: 'AHI Supine' },
  ahiLateral: { min: 0, max: 200, label: 'AHI Lateral' },
  ahiNrem: { min: 0, max: 200, label: 'AHI NREM' },
  ahiRem: { min: 0, max: 200, label: 'AHI REM' },
  centralApneaIndex: { min: 0, max: 100, label: 'Central Apnea Index' },
  obstructiveApneaIndex: { min: 0, max: 150, label: 'Obstructive Apnea Index' },
  mixedApneaIndex: { min: 0, max: 100, label: 'Mixed Apnea Index' },
  hypopneaIndex: { min: 0, max: 150, label: 'Hypopnea Index' },
  desaturationIndex: { min: 0, max: 200, label: 'Desaturation Index' },
  lowestSpO2: { min: 0, max: 100, label: 'Lowest SpO2' },
  averageSpO2: { min: 0, max: 100, label: 'Average SpO2' },
  timeBelow90Percent: { min: 0, max: 100, label: 'Time Below 90%' },
  timeBelow95Percent: { min: 0, max: 100, label: 'Time Below 95%' },
  sleepEfficiency: { min: 0, max: 100, label: 'Sleep Efficiency' },
  stage1Percent: { min: 0, max: 100, label: 'Stage 1%' },
  stage2Percent: { min: 0, max: 100, label: 'Stage 2%' },
  stage3Percent: { min: 0, max: 100, label: 'Stage 3%' },
  slowWaveSleepPercent: { min: 0, max: 100, label: 'Slow Wave Sleep%' },
  remPercent: { min: 0, max: 100, label: 'REM%' },
  arousalIndex: { min: 0, max: 150, label: 'Arousal Index' },
  legMovementIndex: { min: 0, max: 200, label: 'Leg Movement Index' },
  snoringPercent: { min: 0, max: 100, label: 'Snoring%' },
  totalSleepTime: { min: 0, max: 600, label: 'Total Sleep Time' },
  timeInBed: { min: 0, max: 720, label: 'Time in Bed' },
  meanHeartRateNrem: { min: 30, max: 200, label: 'Heart Rate NREM', isHeartField: true },
  meanHeartRateRem: { min: 30, max: 200, label: 'Heart Rate REM', isHeartField: true },
  remCycles: { min: 0, max: 10, label: 'REM Cycles' }
};

// Critical fields that must be present
const CRITICAL_FIELDS = ['ahiOverall', 'totalSleepTime', 'lowestSpO2', 'sleepEfficiency'];
const IMPORTANT_FIELDS = ['ahiSupine', 'ahiLateral', 'desaturationIndex', 'stage1Percent', 'stage2Percent', 'remPercent', 'meanHeartRateNrem'];

interface ValidationIssue {
  field: string;
  value: any;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface ConfidenceScore {
  level: 'high' | 'medium' | 'low';
  score: number;
  reason: string;
}

interface MissingDataReport {
  critical: string[];
  important: string[];
  completenessPercent: number;
}

interface CrossValidationResult {
  check: string;
  expected: string;
  actual: string;
  status: 'passed' | 'warning' | 'error';
  message?: string;
}

interface QualityAssuranceData {
  overallScore: number;
  dataValidation: {
    passed: number;
    failed: number;
    issues: ValidationIssue[];
  };
  confidenceScores: Record<string, ConfidenceScore>;
  missingData: MissingDataReport;
  crossValidation: {
    passed: number;
    failed: number;
    checks: CrossValidationResult[];
  };
}

// Helper to get nested value from data object
function getNestedValue(data: any, path: string): any {
  const parts = path.split('.');
  let value = data;
  for (const part of parts) {
    if (value === null || value === undefined) return null;
    value = value[part];
  }
  return value;
}

// Data Validation Function
function validateExtractedData(data: any, isSplitNight: boolean = false): { passed: number; failed: number; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  let passed = 0;
  let failed = 0;

  const validateField = (value: any, fieldKey: string, range: typeof VALIDATION_RANGES[keyof typeof VALIDATION_RANGES]) => {
    if (value === null || value === undefined || value === '') {
      return; // Missing values handled by missing data check
    }
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      issues.push({
        field: range.label,
        value,
        message: `Invalid non-numeric value`,
        severity: 'error'
      });
      failed++;
      return;
    }

    // Heart field special case: 0 is invalid
    if ((range as any).isHeartField && numValue === 0) {
      issues.push({
        field: range.label,
        value: 0,
        message: `Heart rate cannot be 0 - extraction likely failed`,
        severity: 'warning'
      });
      failed++;
      return;
    }

    if (numValue < range.min || numValue > range.max) {
      issues.push({
        field: range.label,
        value: numValue,
        message: `Value ${numValue} is outside valid range (${range.min}-${range.max})`,
        severity: numValue < 0 ? 'error' : 'warning'
      });
      failed++;
      return;
    }

    passed++;
  };

  // Map field paths based on data structure
  const fieldMappings: Record<string, string> = {
    ahiOverall: 'respiratoryEvents.ahiOverall',
    ahiSupine: 'respiratoryEvents.ahiSupine',
    ahiLateral: 'respiratoryEvents.ahiLateral',
    ahiNrem: 'respiratoryEvents.ahiNrem',
    ahiRem: 'respiratoryEvents.ahiRem',
    centralApneaIndex: 'respiratoryEvents.centralApneaIndex',
    obstructiveApneaIndex: 'respiratoryEvents.obstructiveApneaIndex',
    mixedApneaIndex: 'respiratoryEvents.mixedApneaIndex',
    hypopneaIndex: 'respiratoryEvents.hypopneaIndex',
    desaturationIndex: 'oxygenation.desaturationIndex',
    lowestSpO2: 'oxygenation.lowestSpO2',
    averageSpO2: 'oxygenation.averageSpO2',
    timeBelow90Percent: 'oxygenation.timeBelow90Percent',
    timeBelow95Percent: 'oxygenation.timeBelow95Percent',
    sleepEfficiency: 'sleepArchitecture.sleepEfficiency',
    stage1Percent: 'sleepArchitecture.stage1Percent',
    stage2Percent: 'sleepArchitecture.stage2Percent',
    stage3Percent: 'sleepArchitecture.stage3Percent',
    slowWaveSleepPercent: 'sleepArchitecture.slowWaveSleepPercent',
    remPercent: 'sleepArchitecture.remPercent',
    arousalIndex: 'additionalMetrics.arousalIndex',
    legMovementIndex: 'additionalMetrics.legMovementIndex',
    snoringPercent: 'additionalMetrics.snoringPercent',
    totalSleepTime: 'studyInfo.totalSleepTime',
    timeInBed: 'studyInfo.timeInBed',
    meanHeartRateNrem: 'cardiacData.meanHeartRateNrem',
    meanHeartRateRem: 'cardiacData.meanHeartRateRem'
  };

  for (const [fieldKey, range] of Object.entries(VALIDATION_RANGES)) {
    const path = fieldMappings[fieldKey];
    if (path) {
      const value = getNestedValue(data, path);
      validateField(value, fieldKey, range);
    }
  }

  return { passed, failed, issues };
}

// Confidence Scoring Function
function calculateConfidenceScores(data: any, rawText: string): Record<string, ConfidenceScore> {
  const scores: Record<string, ConfidenceScore> = {};
  
  const calculateFieldConfidence = (value: any, fieldKey: string, range: typeof VALIDATION_RANGES[keyof typeof VALIDATION_RANGES]): ConfidenceScore => {
    if (value === null || value === undefined || value === '') {
      return { level: 'low', score: 0, reason: 'Value not found in document' };
    }
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      return { level: 'low', score: 10, reason: 'Invalid non-numeric value' };
    }

    // Check if value appears in raw text (exact match indicator)
    const valueStr = String(numValue);
    const exactMatch = rawText.includes(valueStr);
    
    // Check if value is within expected range
    const inRange = numValue >= range.min && numValue <= range.max;

    if (exactMatch && inRange) {
      return { level: 'high', score: 95, reason: 'Exact match found in document, within clinical range' };
    } else if (inRange) {
      return { level: 'medium', score: 70, reason: 'Value within clinical range but no exact match verified' };
    } else if (exactMatch) {
      return { level: 'medium', score: 60, reason: 'Exact match found but outside expected clinical range' };
    } else {
      return { level: 'low', score: 30, reason: 'Value outside expected range and no match verified' };
    }
  };

  const fieldMappings: Record<string, string> = {
    ahiOverall: 'respiratoryEvents.ahiOverall',
    lowestSpO2: 'oxygenation.lowestSpO2',
    sleepEfficiency: 'sleepArchitecture.sleepEfficiency',
    totalSleepTime: 'studyInfo.totalSleepTime',
    desaturationIndex: 'oxygenation.desaturationIndex',
    meanHeartRateNrem: 'cardiacData.meanHeartRateNrem'
  };

  for (const [fieldKey, path] of Object.entries(fieldMappings)) {
    const value = getNestedValue(data, path);
    const range = VALIDATION_RANGES[fieldKey as keyof typeof VALIDATION_RANGES];
    if (range) {
      scores[fieldKey] = calculateFieldConfidence(value, fieldKey, range);
    }
  }

  return scores;
}

// Missing Data Check Function
function checkMissingData(data: any): MissingDataReport {
  const critical: string[] = [];
  const important: string[] = [];
  let totalFields = 0;
  let foundFields = 0;

  const fieldMappings: Record<string, string> = {
    ahiOverall: 'respiratoryEvents.ahiOverall',
    totalSleepTime: 'studyInfo.totalSleepTime',
    lowestSpO2: 'oxygenation.lowestSpO2',
    sleepEfficiency: 'sleepArchitecture.sleepEfficiency',
    ahiSupine: 'respiratoryEvents.ahiSupine',
    ahiLateral: 'respiratoryEvents.ahiLateral',
    desaturationIndex: 'oxygenation.desaturationIndex',
    stage1Percent: 'sleepArchitecture.stage1Percent',
    stage2Percent: 'sleepArchitecture.stage2Percent',
    remPercent: 'sleepArchitecture.remPercent',
    meanHeartRateNrem: 'cardiacData.meanHeartRateNrem'
  };

  const fieldLabels: Record<string, string> = {
    ahiOverall: 'AHI Overall',
    totalSleepTime: 'Total Sleep Time',
    lowestSpO2: 'Lowest SpO2',
    sleepEfficiency: 'Sleep Efficiency',
    ahiSupine: 'AHI Supine',
    ahiLateral: 'AHI Lateral',
    desaturationIndex: 'Desaturation Index',
    stage1Percent: 'Stage 1%',
    stage2Percent: 'Stage 2%',
    remPercent: 'REM%',
    meanHeartRateNrem: 'Heart Rate NREM'
  };

  // Check critical fields
  for (const field of CRITICAL_FIELDS) {
    totalFields++;
    const path = fieldMappings[field];
    const value = getNestedValue(data, path);
    if (value === null || value === undefined || value === '') {
      critical.push(fieldLabels[field] || field);
    } else {
      foundFields++;
    }
  }

  // Check important fields
  for (const field of IMPORTANT_FIELDS) {
    totalFields++;
    const path = fieldMappings[field];
    const value = getNestedValue(data, path);
    if (value === null || value === undefined || value === '') {
      important.push(fieldLabels[field] || field);
    } else {
      foundFields++;
    }
  }

  const completenessPercent = totalFields > 0 ? Math.round((foundFields / totalFields) * 100) : 0;

  return { critical, important, completenessPercent };
}

// Cross-Validation Function
function crossValidateData(data: any): { passed: number; failed: number; checks: CrossValidationResult[] } {
  const checks: CrossValidationResult[] = [];
  let passed = 0;
  let failed = 0;

  // 1. Sleep Stage Sum Check (~100%)
  const stage1 = parseFloat(getNestedValue(data, 'sleepArchitecture.stage1Percent')) || 0;
  const stage2 = parseFloat(getNestedValue(data, 'sleepArchitecture.stage2Percent')) || 0;
  const stage3 = parseFloat(getNestedValue(data, 'sleepArchitecture.stage3Percent')) || 
                 parseFloat(getNestedValue(data, 'sleepArchitecture.slowWaveSleepPercent')) || 0;
  const rem = parseFloat(getNestedValue(data, 'sleepArchitecture.remPercent')) || 0;
  const stageSum = stage1 + stage2 + stage3 + rem;

  if (stageSum > 0) {
    if (stageSum >= 95 && stageSum <= 105) {
      checks.push({
        check: 'Sleep Stage Sum',
        expected: '95-105%',
        actual: `${stageSum.toFixed(1)}%`,
        status: 'passed',
        message: 'Sleep stage percentages sum correctly'
      });
      passed++;
    } else {
      checks.push({
        check: 'Sleep Stage Sum',
        expected: '95-105%',
        actual: `${stageSum.toFixed(1)}%`,
        status: 'warning',
        message: 'Sleep stage percentages do not sum to ~100%'
      });
      failed++;
    }
  }

  // 2. Oxygen Logic Check (Lowest <= Average)
  const lowestO2 = parseFloat(getNestedValue(data, 'oxygenation.lowestSpO2'));
  const avgO2 = parseFloat(getNestedValue(data, 'oxygenation.averageSpO2'));

  if (!isNaN(lowestO2) && !isNaN(avgO2)) {
    if (lowestO2 <= avgO2) {
      checks.push({
        check: 'Oxygen Logic',
        expected: 'Lowest ≤ Average',
        actual: `${lowestO2}% ≤ ${avgO2}%`,
        status: 'passed',
        message: 'Oxygen saturation values are logically consistent'
      });
      passed++;
    } else {
      checks.push({
        check: 'Oxygen Logic',
        expected: 'Lowest ≤ Average',
        actual: `${lowestO2}% > ${avgO2}%`,
        status: 'error',
        message: 'Lowest O2 cannot be higher than Average O2'
      });
      failed++;
    }
  }

  // 3. TST vs TIB Check (TST should be <= TIB)
  const tst = parseFloat(getNestedValue(data, 'studyInfo.totalSleepTime'));
  const tib = parseFloat(getNestedValue(data, 'studyInfo.timeInBed'));

  if (!isNaN(tst) && !isNaN(tib)) {
    if (tst <= tib) {
      checks.push({
        check: 'Sleep Time Logic',
        expected: 'TST ≤ TIB',
        actual: `${tst} ≤ ${tib} min`,
        status: 'passed',
        message: 'Total sleep time is within time in bed'
      });
      passed++;
    } else {
      checks.push({
        check: 'Sleep Time Logic',
        expected: 'TST ≤ TIB',
        actual: `${tst} > ${tib} min`,
        status: 'error',
        message: 'Total sleep time cannot exceed time in bed'
      });
      failed++;
    }
  }

  // 4. AHI Positional Consistency
  const ahiOverall = parseFloat(getNestedValue(data, 'respiratoryEvents.ahiOverall'));
  const ahiSupine = parseFloat(getNestedValue(data, 'respiratoryEvents.ahiSupine'));
  const ahiLateral = parseFloat(getNestedValue(data, 'respiratoryEvents.ahiLateral'));

  if (!isNaN(ahiOverall) && !isNaN(ahiSupine) && !isNaN(ahiLateral)) {
    // Neither positional AHI should dramatically exceed overall (allow 20% tolerance)
    const maxPositional = Math.max(ahiSupine, ahiLateral);
    if (maxPositional <= ahiOverall * 1.5) {
      checks.push({
        check: 'AHI Positional Consistency',
        expected: 'Positional ≤ 1.5x Overall',
        actual: `Max: ${maxPositional.toFixed(1)}, Overall: ${ahiOverall.toFixed(1)}`,
        status: 'passed',
        message: 'Positional AHI values are consistent with overall'
      });
      passed++;
    } else {
      checks.push({
        check: 'AHI Positional Consistency',
        expected: 'Positional ≤ 1.5x Overall',
        actual: `Max: ${maxPositional.toFixed(1)}, Overall: ${ahiOverall.toFixed(1)}`,
        status: 'warning',
        message: 'Positional AHI significantly exceeds overall AHI - verify data'
      });
      failed++;
    }
  }

  // 5. Sleep Efficiency Consistency
  const sleepEff = parseFloat(getNestedValue(data, 'sleepArchitecture.sleepEfficiency'));

  if (!isNaN(tst) && !isNaN(tib) && !isNaN(sleepEff)) {
    const calculatedEff = (tst / tib) * 100;
    const diff = Math.abs(calculatedEff - sleepEff);
    
    if (diff <= 5) {
      checks.push({
        check: 'Sleep Efficiency Calculation',
        expected: `~${calculatedEff.toFixed(1)}%`,
        actual: `${sleepEff}%`,
        status: 'passed',
        message: 'Sleep efficiency matches TST/TIB calculation'
      });
      passed++;
    } else {
      checks.push({
        check: 'Sleep Efficiency Calculation',
        expected: `~${calculatedEff.toFixed(1)}%`,
        actual: `${sleepEff}%`,
        status: 'warning',
        message: `Sleep efficiency differs from calculated value by ${diff.toFixed(1)}%`
      });
      failed++;
    }
  }

  return { passed, failed, checks };
}

// Main QA Function - Combines all checks
function runQualityAssurance(data: any, rawText: string, isSplitNight: boolean = false): QualityAssuranceData {
  const dataToValidate = isSplitNight ? data.offCpap : data;
  
  const dataValidation = validateExtractedData(dataToValidate, isSplitNight);
  const confidenceScores = calculateConfidenceScores(dataToValidate, rawText);
  const missingData = checkMissingData(dataToValidate);
  const crossValidation = crossValidateData(dataToValidate);

  // Calculate overall score
  const validationScore = dataValidation.passed / (dataValidation.passed + dataValidation.failed + 1) * 30;
  const completenessScore = missingData.completenessPercent * 0.4;
  const crossValScore = crossValidation.passed / (crossValidation.passed + crossValidation.failed + 1) * 30;
  
  const overallScore = Math.round(validationScore + completenessScore + crossValScore);

  return {
    overallScore,
    dataValidation,
    confidenceScores,
    missingData,
    crossValidation
  };
}

// ========== END QUALITY ASSURANCE SYSTEM ==========

// Generate Clinical Summary with comprehensive clinical data integration
function generateClinicalSummary(data: any, studyType: string, clinicalData: any): string {
  const summaryParts: string[] = [];
  
  const ahi = data.respiratoryEvents?.ahiOverall || 0;
  const tst = data.studyInfo?.totalSleepTime || 0;
  
  // For Split-Night: calculate combined TST from both portions
  let totalStudyTst = tst;
  let offCpapTst = tst;
  let onCpapTst = 0;
  
  // If we have onCpap data, add its TST
  if (data.onCpapData?.studyInfo?.totalSleepTime) {
    onCpapTst = data.onCpapData.studyInfo.totalSleepTime;
    totalStudyTst = offCpapTst + onCpapTst;
  }
  
  const totalHours = Math.floor(totalStudyTst / 60);
  const totalMinutes = Math.round(totalStudyTst % 60);
  const offHours = Math.floor(offCpapTst / 60);
  const offMinutes = Math.round(offCpapTst % 60);
  const onHours = Math.floor(onCpapTst / 60);
  const onMinutes = Math.round(onCpapTst % 60);
  
  const hours = Math.floor(tst / 60);
  const minutes = Math.round(tst % 60);
  const lowestO2 = data.oxygenation?.lowestSpO2;
  
  // Determine severity
  let severity = '';
  if (ahi >= 30) severity = 'Severe';
  else if (ahi >= 15) severity = 'Moderate';
  else if (ahi >= 5) severity = 'Mild';
  else severity = 'Normal';
  
  // Determine desaturation level
  const timeBelow90 = parseFloat(data.oxygenation?.timeBelow90Percent) || 0;
  const desatLevel = timeBelow90 > 5 ? 'significant' : 'minimal';
  
  // Check sleep stage progression
  const remPercent = data.sleepArchitecture?.remPercent;
  const swsPercent = data.sleepArchitecture?.slowWaveSleepPercent;
  const hasAllStages = typeof remPercent === 'number' && remPercent > 0 && 
                       typeof swsPercent === 'number' && swsPercent > 0;
  const stageProgression = hasAllStages 
    ? 'progressed into all sleep stages' 
    : (typeof swsPercent === 'number' && swsPercent === 0)
      ? 'did not progress into slow wave sleep'
      : 'progressed through recorded sleep stages';
  
  // Check if repeated study
  const isRepeated = clinicalData?.isRepeatedStudy === true;
  const repeatedPrefix = isRepeated ? 'Repeated ' : '';
  
  // === PART 1: Equipment Line (for Split-Night/Titration) ===
  if (studyType === 'Split-Night' || studyType === 'Titration') {
    const maskLabel = getMaskLabel(clinicalData?.maskType);
    const maskSize = getMaskSizeLabel(clinicalData?.maskSize);
    
    let pressureText = '';
    if (clinicalData?.bpapUsed) {
      pressureText = `BPAP (IPAP ${clinicalData?.ipapPressure} / EPAP ${clinicalData?.epapPressure} cmH2O)`;
    } else {
      pressureText = `Conventional CPAP pressure of ${clinicalData?.cpapPressure || '---'} cmH2O`;
    }
    
    let equipmentLine = '';
    if (studyType === 'Split-Night') {
      equipmentLine = `${repeatedPrefix}Split night sleep study was done. 1st part was off CPAP and 2nd part was on ${pressureText} via ${maskLabel} (${maskSize}) size`;
    } else {
      equipmentLine = `${repeatedPrefix}Therapeutic sleep study was done on ${pressureText} from start via ${maskLabel} (${maskSize}) size`;
    }
    
    // Add accessories
    const accessories = [];
    if (clinicalData?.hasChinstrap) accessories.push('chinstrap');
    if (clinicalData?.hasHeatedHumidifier) accessories.push('heated humidifier');
    
    if (accessories.length > 0) {
      equipmentLine += ' with ' + accessories.join(' and ');
    }
    
    // Add O2 if used
    if (clinicalData?.oxygenUsed && clinicalData?.oxygenLiters) {
      equipmentLine += ` with supplemental O2 at ${clinicalData.oxygenLiters} L/min`;
    }
    
    equipmentLine += '.';
    summaryParts.push(equipmentLine);
  }
  
  // === PART 2: Main Clinical Interpretation ===
  if (severity === 'Normal') {
    summaryParts.push(`In summary based on the performed study, there was no evidence of sleep disordered breathing or any other significant respiratory disturbances during sleep. The patient ${stageProgression}. Otherwise, no unusual events were noted.`);
  } else {
    let mainSummary = '';
    
    if (studyType === 'Split-Night') {
      const onCpapAhi = data.onCpapData?.respiratoryEvents?.ahiOverall || 0;
      
      let pressureText = '';
      if (clinicalData?.bpapUsed) {
        pressureText = `BPAP (IPAP ${clinicalData?.ipapPressure} / EPAP ${clinicalData?.epapPressure} cmH2O)`;
      } else {
        pressureText = `CPAP pressure of ${clinicalData?.cpapPressure || '---'} cmH2O`;
      }
      
      mainSummary = `This split night sleep study shows evidence of "${severity} Obstructive Sleep Apnea". The patient had a total sleep time of ${totalHours} hours and ${totalMinutes} minutes (${offHours}h ${offMinutes}min OFF CPAP + ${onHours}h ${onMinutes}min ON CPAP). During the pre-PAP diagnostic period, AHI was ${ahi.toFixed(1)} events/hr associated with ${desatLevel} oxygen desaturations. At ${pressureText}, respiratory events were effectively controlled with AHI reduced to ${onCpapAhi.toFixed(1)}/hr. The patient ${stageProgression}. Otherwise, no unusual events were noted.`;
    } else if (studyType === 'Titration') {
      const residualAhi = data.respiratoryEvents?.ahiOverall || 0;
      mainSummary = `This ${isRepeated ? 'repeated ' : ''}therapeutic overnight sleep study was done on Conventional CPAP from start. The patient slept for a total sleep time of ${hours} hours and ${minutes} minutes. At CPAP pressure of ${clinicalData?.cpapPressure || '---'} cmH2O, respiratory events were ${residualAhi < 5 ? 'effectively controlled' : 'reduced'} with a residual AHI of ${residualAhi.toFixed(1)}/hr. The patient ${stageProgression}. Otherwise, no unusual events were noted.`;
    } else {
      // Diagnostic
      mainSummary = `This ${repeatedPrefix.toLowerCase()}overnight sleep study shows evidence of "${severity} Obstructive Sleep Apnea". The patient slept for a total sleep time of ${hours} hours and ${minutes} minutes with an AHI of ${ahi.toFixed(1)} events per hour associated with ${desatLevel} oxygen desaturations and repetitive sleep interruptions. The patient ${stageProgression}. Otherwise, no unusual events were noted.`;
    }
    
    summaryParts.push(mainSummary);
  }
  
  // === PART 2.5: OSA Subtype Clinical Interpretation (ALL STUDY TYPES) ===
  const ahiSupine = data.respiratoryEvents?.ahiSupine || 0;
  const ahiLateral = data.respiratoryEvents?.ahiLateral || 0;
  const ahiRem = data.respiratoryEvents?.ahiRem || 0;
  const ahiNrem = data.respiratoryEvents?.ahiNrem || 0;
  const cai = data.respiratoryEvents?.centralApneaIndex || 0;
  const plmIndex = data.additionalMetrics?.legMovementIndex || 0;
  
  const isPositionalOSA = ahiSupine > 0 && ahiLateral > 0 && ahiSupine > ahiLateral * AASM_GUIDELINES.POSITIONAL_RATIO;
  const isREMRelatedOSA = ahiRem > 0 && ahiNrem > 0 && ahiRem > ahiNrem * AASM_GUIDELINES.REM_RATIO;
  
  // Positional OSA interpretation
  if (isPositionalOSA) {
    const ratio = (ahiSupine / ahiLateral).toFixed(1);
    summaryParts.push(`Position-dependent OSA was observed with AHI supine (${ahiSupine.toFixed(1)}/hr) significantly higher than AHI lateral (${ahiLateral.toFixed(1)}/hr) with a ratio of ${ratio}:1. Positional therapy may be beneficial as adjunctive treatment.`);
  }
  
  // REM-related OSA interpretation
  if (isREMRelatedOSA) {
    const ratio = (ahiRem / ahiNrem).toFixed(1);
    summaryParts.push(`REM-related OSA pattern was identified with AHI during REM (${ahiRem.toFixed(1)}/hr) significantly higher than AHI during NREM (${ahiNrem.toFixed(1)}/hr) with a ratio of ${ratio}:1. This suggests respiratory events are predominantly occurring during REM sleep.`);
  }
  
  // Central Apnea component
  if (cai > AASM_GUIDELINES.SIGNIFICANT_CAI) {
    summaryParts.push(`Central apnea events were noted (CAI: ${cai.toFixed(1)}/hr), warranting evaluation for central sleep apnea syndromes.`);
  }
  
  // PLM interpretation
  if (plmIndex > AASM_GUIDELINES.ELEVATED_PLM) {
    summaryParts.push(`Periodic limb movement index was elevated (${plmIndex.toFixed(1)}/hr), suggestive of periodic limb movement disorder. Consider evaluation for restless legs syndrome.`);
  }
  
  // === PART 3: EtCO2 Monitoring ===
  if (clinicalData?.etco2?.awake || clinicalData?.etco2?.nrem || clinicalData?.etco2?.rem) {
    const parts = [];
    if (clinicalData.etco2.awake) parts.push(`${clinicalData.etco2.awake} mmHg while awake`);
    if (clinicalData.etco2.nrem) parts.push(`${clinicalData.etco2.nrem} mmHg during NREM sleep`);
    if (clinicalData.etco2.rem) parts.push(`${clinicalData.etco2.rem} mmHg during REM sleep`);
    
    if (parts.length > 0) {
      summaryParts.push(`EtCO2 was monitored and the values show: ${parts.join(', ')}.`);
    }
  }
  
  // === PART 4: TcCO2 Monitoring ===
  if (clinicalData?.tcco2?.awake || clinicalData?.tcco2?.nrem || clinicalData?.tcco2?.rem) {
    const parts = [];
    if (clinicalData.tcco2.awake) parts.push(`${clinicalData.tcco2.awake} mmHg while awake`);
    if (clinicalData.tcco2.nrem) parts.push(`${clinicalData.tcco2.nrem} mmHg in NREM sleep`);
    if (clinicalData.tcco2.rem) parts.push(`${clinicalData.tcco2.rem} mmHg in REM sleep`);
    
    if (parts.length > 0) {
      summaryParts.push(`TcCO2 was monitored and value showed: ${parts.join(' and ')}.`);
    }
  }
  
  // === PART 5: Medication ===
  if (clinicalData?.medication) {
    summaryParts.push(clinicalData.medication);
  }
  
  return summaryParts.join('\n\n');
}

// Generate Recommendations based on AASM Clinical Guidelines with PATIENT-SPECIFIC VALUES
function generateRecommendations(data: any, studyType: string, clinicalData: any): string[] {
  const recommendations: string[] = [];
  const ahi = data.respiratoryEvents?.ahiOverall || 0;
  const ahiSupine = data.respiratoryEvents?.ahiSupine || 0;
  const ahiLateral = data.respiratoryEvents?.ahiLateral || 0;
  const ahiRem = data.respiratoryEvents?.ahiRem || 0;
  const ahiNrem = data.respiratoryEvents?.ahiNrem || 0;
  const cai = data.respiratoryEvents?.centralApneaIndex || 0;
  const timeBelow90 = parseFloat(data.oxygenation?.timeBelow90Percent) || 0;
  const lowestO2 = data.oxygenation?.lowestSpO2 || 100;
  const plmIndex = data.additionalMetrics?.legMovementIndex || 0;
  const bmi = clinicalData?.bmi || 0;
  const cpapPressure = clinicalData?.cpapPressure;
  const bpapUsed = clinicalData?.bpapUsed;
  const ipapPressure = clinicalData?.ipapPressure;
  const epapPressure = clinicalData?.epapPressure;
  
  // === 1. Primary Treatment - PATIENT-SPECIFIC ===
  if (ahi >= 30) {
    recommendations.push(`PAP therapy is STRONGLY recommended based on severe OSA with AHI of ${ahi.toFixed(1)}/hr (AASM Strong Recommendation).`);
  } else if (ahi >= 15) {
    recommendations.push(`PAP therapy is recommended based on moderate OSA with AHI of ${ahi.toFixed(1)}/hr (AASM Strong Recommendation).`);
  } else if (ahi >= 5) {
    recommendations.push(`For this patient with mild OSA (AHI ${ahi.toFixed(1)}/hr): PAP therapy or oral appliance therapy may be considered if symptomatic (AASM Standard).`);
  } else {
    recommendations.push(`AHI of ${ahi.toFixed(1)}/hr is within normal limits. No specific treatment for sleep-disordered breathing required.`);
  }
  
  // === 2. Positional Therapy - PATIENT-SPECIFIC VALUES ===
  const isPositionalOSA = ahiSupine > 0 && ahiLateral > 0 && ahiSupine > ahiLateral * AASM_GUIDELINES.POSITIONAL_RATIO;
  if (isPositionalOSA) {
    const ratio = (ahiSupine / ahiLateral).toFixed(1);
    if (ahiLateral < 5) {
      recommendations.push(`Significant positional OSA identified: AHI supine ${ahiSupine.toFixed(1)}/hr vs lateral ${ahiLateral.toFixed(1)}/hr (ratio ${ratio}:1). AHI normalizes in lateral position - positional therapy alone may be effective (AASM Option).`);
    } else {
      recommendations.push(`Positional component detected: AHI supine ${ahiSupine.toFixed(1)}/hr vs lateral ${ahiLateral.toFixed(1)}/hr (ratio ${ratio}:1). Positional therapy recommended as adjunct to PAP (AASM Option).`);
    }
  }
  
  // === 3. REM-related OSA - PATIENT-SPECIFIC VALUES ===
  const isREMRelatedOSA = ahiRem > 0 && ahiNrem > 0 && ahiRem > ahiNrem * AASM_GUIDELINES.REM_RATIO;
  if (isREMRelatedOSA) {
    const ratio = (ahiRem / ahiNrem).toFixed(1);
    recommendations.push(`REM-related OSA pattern identified: AHI REM ${ahiRem.toFixed(1)}/hr vs NREM ${ahiNrem.toFixed(1)}/hr (ratio ${ratio}:1). Ensure adequate REM sleep capture during PAP titration (AASM Guideline).`);
  }
  
  // === 4. Central Apnea - PATIENT-SPECIFIC ===
  if (cai > AASM_GUIDELINES.SIGNIFICANT_CAI) {
    recommendations.push(`Central apnea index of ${cai.toFixed(1)}/hr detected. Evaluate for central sleep apnea etiologies. Consider ASV or CPAP with backup rate (AASM Conditional Recommendation).`);
  }
  
  // === 5. Oxygen Desaturation - PATIENT-SPECIFIC VALUES ===
  if (timeBelow90 > AASM_GUIDELINES.SIGNIFICANT_DESAT || lowestO2 < 80) {
    recommendations.push(`Significant desaturation noted: ${timeBelow90.toFixed(1)}% of sleep time with SpO2 <90%, lowest SpO2 ${lowestO2}%. Consider supplemental oxygen as adjunctive therapy (AASM Option).`);
  }
  
  // === 6. Weight Management - PATIENT-SPECIFIC BMI ===
  if (bmi >= 40) {
    recommendations.push(`BMI of ${bmi} kg/m² indicates morbid obesity. Consider bariatric surgery referral as adjunct to primary OSA therapy (AASM Option).`);
  } else if (bmi >= 30) {
    recommendations.push(`BMI of ${bmi} kg/m² indicates obesity. Weight loss through dietary modification recommended as adjunctive therapy (AASM Guideline).`);
  }
  
  // === 7. PLM/RLS - PATIENT-SPECIFIC ===
  if (plmIndex > AASM_GUIDELINES.ELEVATED_PLM) {
    recommendations.push(`Elevated periodic limb movement index of ${plmIndex.toFixed(1)}/hr. Consider evaluation for restless legs syndrome and iron deficiency.`);
  }
  
  // === 8. Oral Appliance Alternative ===
  if (ahi >= 5 && ahi < 30) {
    recommendations.push(`Oral appliance therapy is an alternative for patients with AHI ${ahi.toFixed(1)}/hr who are intolerant of CPAP (AASM Standard).`);
  }
  
  // === 9. PAP Continuation - PATIENT-SPECIFIC PRESSURE ===
  if (studyType === 'Titration' || studyType === 'Split-Night') {
    // Get ON CPAP AHI if available (for Split-Night)
    const onCpapAhi = data.onCpapData?.respiratoryEvents?.ahiOverall;
    const baselineAhi = ahi; // This is OFF CPAP AHI (passed as main data)
    
    if (bpapUsed && ipapPressure && epapPressure) {
      const diff = parseFloat(ipapPressure) - parseFloat(epapPressure);
      let pressureRec = `Continue BPAP therapy at IPAP ${ipapPressure} cmH2O / EPAP ${epapPressure} cmH2O (pressure support: ${diff} cmH2O)`;
      if (typeof onCpapAhi === 'number') {
        pressureRec += ` which reduced AHI from ${baselineAhi.toFixed(1)}/hr to ${onCpapAhi.toFixed(1)}/hr.`;
      } else {
        pressureRec += ' as established during titration.';
      }
      recommendations.push(pressureRec);
    } else if (cpapPressure) {
      let pressureRec = `Continue CPAP therapy at ${cpapPressure} cmH2O`;
      if (typeof onCpapAhi === 'number') {
        pressureRec += ` which reduced AHI from ${baselineAhi.toFixed(1)}/hr to ${onCpapAhi.toFixed(1)}/hr (effective therapy).`;
      } else {
        pressureRec += ' as established during this titration study.';
      }
      recommendations.push(pressureRec);
    }
  }
  
  // === 10. Titration Quality Assessment ===
  if (studyType === 'Split-Night' || studyType === 'Titration') {
    const onCpapAhi = data.onCpapData?.respiratoryEvents?.ahiOverall;
    
    if (typeof onCpapAhi === 'number') {
      if (onCpapAhi < 5) {
        recommendations.push(`Optimal titration achieved with residual AHI of ${onCpapAhi.toFixed(1)}/hr (<5) meeting AASM optimal titration criteria.`);
      } else if (onCpapAhi <= 10) {
        recommendations.push(`Good titration achieved with residual AHI of ${onCpapAhi.toFixed(1)}/hr (≤10) meeting AASM acceptable titration criteria.`);
      } else {
        recommendations.push(`Suboptimal titration noted with residual AHI of ${onCpapAhi.toFixed(1)}/hr (>10). Consider repeat titration study per AASM guidelines.`);
      }
    }
  }
  
  // === 11. Follow-up - STUDY-TYPE SPECIFIC ===
  if (studyType === 'Diagnostic' && ahi >= 5) {
    recommendations.push(`PAP titration study recommended to determine optimal therapeutic pressure for this patient with baseline AHI of ${ahi.toFixed(1)}/hr (AASM Good Practice Statement).`);
  } else if (studyType === 'Titration' || studyType === 'Split-Night') {
    const onCpapAhi = data.onCpapData?.respiratoryEvents?.ahiOverall;
    if (typeof onCpapAhi === 'number' && onCpapAhi < 5) {
      recommendations.push(`Follow-up assessment in 1-3 months recommended to confirm PAP adherence and sustained treatment efficacy with AHI maintained <5/hr (AASM Good Practice Statement).`);
    } else {
      recommendations.push(`Follow-up assessment and possible repeat titration recommended to optimize therapy (AASM Good Practice Statement).`);
    }
  }
  
  return recommendations;
}

// Convert patient comment keys to readable text
function convertPatientComments(selectedComments: string[]): string[] {
  const commentMap: { [key: string]: string } = {
    'sleeping_better_center': 'Patient reports sleeping better in the center compared to home.',
    'no_difference': 'Patient reports no difference in sleep quality between the center and home.',
    'sleeping_better_home': 'Patient reports sleeping better at home.',
    'improved_with_cpap': 'Patient reports improved sleep in the center with CPAP and will discuss continuation at home with the physician.',
    'willing_cpap_home': 'Patient reports improved sleep in the center and expresses willingness to initiate CPAP therapy at home.',
    'better_without_cpap': 'Patient reports better sleep without CPAP.',
    'undecided_cpap': 'Patient remains undecided regarding the use of CPAP at home.',
    'no_comment': 'No comment provided'
  };
  
  return selectedComments.map(key => commentMap[key] || key);
}

// Universal extraction for ALL sleep study metrics
async function extractSleepMetrics(rawText: string, apiKey: string, studyType: string) {
  console.log("=== COMPREHENSIVE EXTRACTION PIPELINE START ===");
  console.log("Raw text length:", rawText.length);
  console.log("Study Type:", studyType);
  
  // DEBUG: Show raw text sample
  console.log("=== DEBUG: Raw text sample (first 2000 chars) ===");
  console.log(rawText.substring(0, 2000));

  // For Split-Night studies, extract two separate datasets
  if (studyType === 'Split-Night') {
    console.log("=== SPLIT-NIGHT DATA SEPARATION ===");
    
    // Parse the incoming text to find both sections
    const diagnosticMarker = '=== OFF CPAP (DIAGNOSTIC PORTION) ===';
    const therapeuticMarker = '=== ON CPAP (THERAPEUTIC PORTION) ===';
    
    const diagnosticStart = rawText.indexOf(diagnosticMarker);
    const therapeuticStart = rawText.indexOf(therapeuticMarker);
    
    let diagnosticText = '';
    let therapeuticText = '';
    
    if (diagnosticStart !== -1 && therapeuticStart !== -1) {
      // Both markers found - extract each section
      diagnosticText = rawText.substring(diagnosticStart + diagnosticMarker.length, therapeuticStart).trim();
      therapeuticText = rawText.substring(therapeuticStart + therapeuticMarker.length).trim();
      
      console.log("✅ Both portions found with markers");
      console.log("Diagnostic text length:", diagnosticText.length);
      console.log("Therapeutic text length:", therapeuticText.length);
    } else {
      // Fallback: try to split by old markers
      console.log("⚠️ New markers not found, trying old markers");
      const oldDiagMarker = 'DIAGNOSTIC PORTION:';
      const oldTherapMarker = 'THERAPEUTIC PORTION:';
      
      const oldDiagStart = rawText.indexOf(oldDiagMarker);
      const oldTherapStart = rawText.indexOf(oldTherapMarker);
      
      if (oldDiagStart !== -1 && oldTherapStart !== -1) {
        diagnosticText = rawText.substring(oldDiagStart + oldDiagMarker.length, oldTherapStart).trim();
        therapeuticText = rawText.substring(oldTherapStart + oldTherapMarker.length).trim();
        console.log("✅ Found old format markers");
      } else {
        // Last resort: split in half
        console.log("⚠️ No markers found, splitting in half");
        const midPoint = Math.floor(rawText.length / 2);
        diagnosticText = rawText.substring(0, midPoint);
        therapeuticText = rawText.substring(midPoint);
      }
      
      console.log("Diagnostic text length:", diagnosticText.length);
      console.log("Therapeutic text length:", therapeuticText.length);
    }
    
    // Show samples for debugging
    console.log("=== DIAGNOSTIC SAMPLE (first 500 chars) ===");
    console.log(diagnosticText.substring(0, 500));
    console.log("=== THERAPEUTIC SAMPLE (first 500 chars) ===");
    console.log(therapeuticText.substring(0, 500));
    
    const prompt = `You are a medical-grade AI assistant extracting comprehensive sleep study data from a Split-Night study report.

## 🔍 SPLIT-NIGHT EXTRACTION RULES

**CRITICAL**: This is a Split-Night study with TWO distinct periods:
1. **OFF CPAP (Diagnostic)** - First part of the night (NO THERAPY)
2. **ON CPAP (Therapeutic)** - Second part of the night (WITH CPAP THERAPY)

You must extract TWO complete sets of data, one for each period.

### Extract for BOTH periods:
- Light Off/On times
- Time in Bed (minutes)
- Total Sleep Time (minutes)
- Sleep Latency & REM Latency
- Sleep Efficiency (%)
- Sleep Architecture: S1%, S2%, S3%, REM% (from TST% column), REM Cycles (from "REM" row → "Episodes (# of)" column - count of times patient entered REM stage)
- AHI Overall, AHI NREM/REM, AHI Supine/Lateral
- Central/Obstructive/Mixed Apnea Index
- Hypopnea Index
- Mean Duration for each event type (CA, OA, MA, HYP) from "Mean (seconds)" row
- Heart Rate NREM/REM
- Desaturation Index
- O2 < 90%, O2 < 95%
- Lowest O2, Average O2
- Arousal Index
- Snoring %
- Leg Movement Index

### Additional for ON CPAP period:
- CPAP Pressure (e.g., "8 cmH2O")

## 📤 REQUIRED JSON OUTPUT

{
  "isSplitNight": true,
  "offCpap": {
    "studyInfo": {
      "lightsOff": "string or null",
      "lightsOn": "string or null",
      "timeInBed": "number or null",
      "totalSleepTime": "number or null",
      "sleepLatency": "number or null",
      "remLatency": "number or null"
    },
    "sleepArchitecture": {
      "sleepEfficiency": "number or null",
      "stage1Percent": "number or null",
      "stage2Percent": "number or null",
      "stage3Percent": "number or null",
      "remPercent": "number or null",
      "remCycles": "number or null"
    },
    "respiratoryEvents": {
      "ahiOverall": "number or null",
      "ahiNrem": "number or null",
      "ahiRem": "number or null",
      "ahiSupine": "number or null",
      "ahiLateral": "number or null",
      "centralApneaIndex": "number or null",
      "obstructiveApneaIndex": "number or null",
      "mixedApneaIndex": "number or null",
      "hypopneaIndex": "number or null",
      "caMeanDuration": "number (seconds from Mean row CA column) or null",
      "oaMeanDuration": "number (seconds from Mean row OA column) or null",
      "maMeanDuration": "number (seconds from Mean row MA column) or null",
      "hypMeanDuration": "number (seconds from Mean row HYP column) or null"
    },
    "oxygenation": {
      "lowestSpO2": "number or null",
      "averageSpO2": "number or null",
      "desaturationIndex": "number or null",
      "timeBelow90Percent": "number or null",
      "timeBelow95Percent": "number or null",
      "calculations": {
        "tst": "number or null",
        "under90REM": "number or null",
        "under90NREM": "number or null",
        "under95REM": "number or null",
        "under95NREM": "number or null"
      }
    },
    "cardiacData": {
      "meanHeartRateNrem": "number or null",
      "meanHeartRateRem": "number or null"
    },
    "additionalMetrics": {
      "arousalIndex": "number or null",
      "snoringPercent": "number or null",
      "legMovementIndex": "number or null"
    }
  },
  "onCpap": {
    "cpapPressure": "string or null (e.g., '8 cmH2O')",
    "studyInfo": {
      "lightsOff": "string or null",
      "lightsOn": "string or null",
      "timeInBed": "number or null",
      "totalSleepTime": "number or null",
      "sleepLatency": "number or null",
      "remLatency": "number or null"
    },
    "sleepArchitecture": {
      "sleepEfficiency": "number or null",
      "stage1Percent": "number or null",
      "stage2Percent": "number or null",
      "stage3Percent": "number or null",
      "remPercent": "number or null",
      "remCycles": "number or null"
    },
    "respiratoryEvents": {
      "ahiOverall": "number or null",
      "ahiNrem": "number or null",
      "ahiRem": "number or null",
      "ahiSupine": "number or null",
      "ahiLateral": "number or null",
      "centralApneaIndex": "number or null",
      "obstructiveApneaIndex": "number or null",
      "mixedApneaIndex": "number or null",
      "hypopneaIndex": "number or null",
      "caMeanDuration": "number (seconds from Mean row CA column) or null",
      "oaMeanDuration": "number (seconds from Mean row OA column) or null",
      "maMeanDuration": "number (seconds from Mean row MA column) or null",
      "hypMeanDuration": "number (seconds from Mean row HYP column) or null"
    },
    "oxygenation": {
      "lowestSpO2": "number or null",
      "averageSpO2": "number or null",
      "desaturationIndex": "number or null",
      "timeBelow90Percent": "number or null",
      "timeBelow95Percent": "number or null",
      "calculations": {
        "tst": "number or null",
        "under90REM": "number or null",
        "under90NREM": "number or null",
        "under95REM": "number or null",
        "under95NREM": "number or null"
      }
    },
    "cardiacData": {
      "meanHeartRateNrem": "number or null",
      "meanHeartRateRem": "number or null"
    },
    "additionalMetrics": {
      "arousalIndex": "number or null",
      "snoringPercent": "number or null",
      "legMovementIndex": "number or null"
    }
  }
}

### 📄 OFF CPAP (DIAGNOSTIC) DATA:
${diagnosticText.substring(0, 25000)}

### 📄 ON CPAP (THERAPEUTIC) DATA:
${therapeuticText.substring(0, 25000)}`;

    try {
      console.log("=== Sending Split-Night request to AI ===");
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          max_tokens: 4000,
          messages: [{ 
            role: 'user', 
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`AI API failed: ${response.status}`);
      }

      const data = await response.json();
      let result = data.choices[0].message.content.trim();
      
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = jsonMatch[0];
      }
      result = result.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      const parsed = JSON.parse(result);
      
      // Calculate Mean Hypopnea Duration for both OFF CPAP and ON CPAP phases
      // Formula: Average of non-zero values from (OA + CA + MA + HYP Mean Durations)
      const calculateMeanHypopneaDuration = (respiratoryEvents: any) => {
        if (!respiratoryEvents) return null;
        const durations: number[] = [];
        const durationFields = ['oaMeanDuration', 'caMeanDuration', 'maMeanDuration', 'hypMeanDuration'];
        
        for (const field of durationFields) {
          const val = respiratoryEvents[field];
          if (typeof val === 'number' && val > 0) {
            durations.push(val);
          }
        }
        
        if (durations.length > 0) {
          const sum = durations.reduce((a, b) => a + b, 0);
          return parseFloat((sum / durations.length).toFixed(1));
        }
        return null;
      };
      
      if (parsed.offCpap?.respiratoryEvents) {
        parsed.offCpap.respiratoryEvents.meanHypopneaDuration = calculateMeanHypopneaDuration(parsed.offCpap.respiratoryEvents);
        console.log(`✅ OFF CPAP Mean Hypopnea Duration: ${parsed.offCpap.respiratoryEvents.meanHypopneaDuration} sec`);
      }
      
      if (parsed.onCpap?.respiratoryEvents) {
        parsed.onCpap.respiratoryEvents.meanHypopneaDuration = calculateMeanHypopneaDuration(parsed.onCpap.respiratoryEvents);
        console.log(`✅ ON CPAP Mean Hypopnea Duration: ${parsed.onCpap.respiratoryEvents.meanHypopneaDuration} sec`);
      }
      // Split-Night post-extraction calculations for BOTH phases
      const calculatePhasePostExtraction = (phase: any, label: string) => {
        if (!phase) return;
        
        // SWS = S3 + S4
        if (typeof phase.sleepArchitecture?.stage3Percent === 'number') {
          const s4 = phase.sleepArchitecture?.stage4Percent || 0;
          phase.sleepArchitecture.slowWaveSleepPercent = parseFloat((phase.sleepArchitecture.stage3Percent + s4).toFixed(1));
          console.log(`✅ ${label} SWS: ${phase.sleepArchitecture.stage3Percent} + ${s4} = ${phase.sleepArchitecture.slowWaveSleepPercent}%`);
        }
        
        // AHI Lateral with single-side fallback
        if (!phase.respiratoryEvents?.ahiLateral) {
          const ahiLeft = phase.respiratoryEvents?.ahiLeft;
          const ahiRight = phase.respiratoryEvents?.ahiRight;
          const leftIsNum = typeof ahiLeft === 'number';
          const rightIsNum = typeof ahiRight === 'number';

          if (leftIsNum && rightIsNum) {
            phase.respiratoryEvents.ahiLateral = parseFloat(((ahiLeft + ahiRight) / 2).toFixed(2));
            console.log(`✅ ${label} AHI Lateral: (${ahiLeft} + ${ahiRight}) / 2 = ${phase.respiratoryEvents.ahiLateral}`);
          } else if (leftIsNum) {
            phase.respiratoryEvents.ahiLateral = ahiLeft;
            console.log(`✅ ${label} AHI Lateral (left only): ${ahiLeft}`);
          } else if (rightIsNum) {
            phase.respiratoryEvents.ahiLateral = ahiRight;
            console.log(`✅ ${label} AHI Lateral (right only): ${ahiRight}`);
          }
        }
        
        // O2 <90% fallback - only if AI didn't extract it
        if (phase.oxygenation?.timeBelow90Percent === null || phase.oxygenation?.timeBelow90Percent === undefined) {
          if (typeof phase.oxygenation?.calculations?.under90REM === 'number' && 
              typeof phase.oxygenation?.calculations?.under90NREM === 'number' && 
              typeof phase.oxygenation?.calculations?.tst === 'number' &&
              phase.oxygenation.calculations.tst > 0) {
            const tst = phase.oxygenation.calculations.tst;
            const sum90 = phase.oxygenation.calculations.under90REM + phase.oxygenation.calculations.under90NREM;
            phase.oxygenation.timeBelow90Percent = parseFloat(((sum90 / tst) * 100).toFixed(2));
            console.log(`✅ ${label} O2 <90% (fallback): ${phase.oxygenation.timeBelow90Percent}%`);
          }
        }
        
        // O2 <95% fallback - only if AI didn't extract it
        if (phase.oxygenation?.timeBelow95Percent === null || phase.oxygenation?.timeBelow95Percent === undefined) {
          if (typeof phase.oxygenation?.calculations?.under95REM === 'number' && 
              typeof phase.oxygenation?.calculations?.under95NREM === 'number' && 
              typeof phase.oxygenation?.calculations?.tst === 'number' &&
              phase.oxygenation.calculations.tst > 0) {
            const tst = phase.oxygenation.calculations.tst;
            const sum95 = phase.oxygenation.calculations.under95REM + phase.oxygenation.calculations.under95NREM;
            phase.oxygenation.timeBelow95Percent = parseFloat(((sum95 / tst) * 100).toFixed(2));
            console.log(`✅ ${label} O2 <95% (fallback): ${phase.oxygenation.timeBelow95Percent}%`);
          }
        }
      };
      
      calculatePhasePostExtraction(parsed.offCpap, 'OFF CPAP');
      calculatePhasePostExtraction(parsed.onCpap, 'ON CPAP');
      
      console.log("✅ Split-Night extraction successful");
      
      return parsed;
      
    } catch (error) {
      console.error("❌ Split-Night AI Extraction error:", error);
      return {
        isSplitNight: true,
        offCpap: getEmptyDataStructure(),
        onCpap: { cpapPressure: null, ...getEmptyDataStructure() }
      };
    }
  }

  // COMPREHENSIVE MEDICAL-GRADE AI PROMPT for regular studies
  const prompt = `You are a medical-grade AI assistant extracting comprehensive sleep study data from a medical report.

## 🔍 EXTRACTION RULES (Extract ALL available data)

### PAGE 1: Patient & Basic Sleep Data
- **Patient Name**: "Recording identification" → "Patient name" line
- **First Name**: Line below patient name  
- **Age**: "Patient age" line
- **Gender**: "Sex" field
- **Light Off Time**: "Times" section → "Light off (LO)" row
- **Light On Time**: "Times" section → "Light on (LON)" row
- **TIB**: "Durations" → "TIB" row (minutes)
- **TST**: "Durations" → "TST" row (minutes)
- **Sleep Onset Latency**: "Latencies" table → "Sleep onset" row, "From Light off (min)" column
- **REM Latency**: "Latencies" table → "REM" row, "From Sleep onset (min)" column

### PAGE 2: Sleep Architecture (USE TST (%) COLUMN - 5th COLUMN)
**CRITICAL TABLE STRUCTURE**:
              Episodes  Duration  TIB%   SPT%   TST%
              (# of)    (min)     (%)    (%)    (%) ← USE THIS COLUMN ONLY
S1            15        9.0       2.3    2.5    3.0 ← Extract 3.0
S2            31        229.5     59.8   64.6   76.2 ← Extract 76.2
S3            4         42.0      10.9   11.8   14.0 ← Extract 14.0
REM           2         20.5      5.3    5.8    6.8 ← Extract 6.8

- **Sleep Efficiency**: "General" block → "Sleep efficiency 1" (%)
- **Stage 1 %**: "S1" row → **TST (%)** column (5th column, NOT TIB or SPT)
- **Stage 2 %**: "S2" row → **TST (%)** column (5th column)
- **Stage 3 %**: "S3" row → **TST (%)** column (5th column)
- **REM %**: "REM" row → **TST (%)** column (5th column)
- **REM Cycles**: "REM" row → "Episodes (# of)" column (1st column) - This is the number of times the patient entered REM sleep stage during the study

### PAGE 4: Respiratory Events
- **CA Index**: "Index (#/h TST)" row → "CA" column
- **OA Index**: Same row → "OA" column
- **MA Index**: Same row → "MA" column
- **HYP Index**: Same row → "HYP" column
- **CA Mean Duration**: "Mean (seconds)" row → "CA" column
- **OA Mean Duration**: "Mean (seconds)" row → "OA" column
- **MA Mean Duration**: "Mean (seconds)" row → "MA" column
- **HYP Mean Duration**: "Mean (seconds)" row → "HYP" column
- **AHI REM**: RDI row → "REM #/h (REM)" column
- **AHI NREM**: RDI row → "NREM #/h (NREM)" column
- **AHI Overall**: RDI row → "TST #/h (sleep)" column

### PAGE 5: Heart Rate
- **REM Mean HR**: "HEART RATE SUMMARY" → "Mean HR (BPM)" row → "REM" column
- **NREM Mean HR**: Same row → "NREM" column

### PAGE 6: Oxygenation & Arousal
- **Oxygen <90%**: Oximetry Distribution "<90" row → percentage of total sleep time with SpO2 below 90%
- **Oxygen <95%**: Oximetry Distribution "<95" row → percentage of total sleep time with SpO2 below 95%
- **Lowest SpO2**: Oximetry Summary → "Minimum (%)" or "Lowest" value
- **Average SpO2**: "Average (%)" row → Main value
- **Desaturation Index**: "Desat Index (#/hour)" row → TOTAL column (rightmost number ONLY)
- **Arousal Index**: Extract from "Arousal index" line

### PAGE 7: Body Position - AHI by Position
**CRITICAL**: Extract AHI values from Body Position table → "Index (#/h)" or "AHI" column
- **AHI Supine**: "S" or "S/SL" row → "Index (#/h)" column
- **AHI Left**: "L" row → "Index (#/h)" column  
- **AHI Right**: "R" row → "Index (#/h)" column
- **Supine Position Index**: "S/SL" row → "Index (#/h)" column (positional index)
- **Left Position Index**: "L" row → "Index (#/h)" column (positional index)
- **Right Position Index**: "R" row → "Index (#/h)" column (positional index)
- **Snoring Duration & %**: "Total duration with snoring"
- **Leg Movement Index**: "Leg movements" → "Index" column

## 📤 REQUIRED JSON OUTPUT

{
  "patientInfo": {
    "name": "string or null",
    "firstName": "string or null",
    "age": "number or null",
    "gender": "string or null"
  },
  "studyInfo": {
    "studyType": "${studyType}",
    "lightsOff": "string or null",
    "lightsOn": "string or null",
    "timeInBed": "number (minutes) or null",
    "totalSleepTime": "number (minutes) or null",
    "sleepLatency": "number (minutes) or null",
    "remLatency": "number (minutes) or null"
  },
  "sleepArchitecture": {
    "sleepEfficiency": "number (percentage) or null",
    "stage1Percent": "number or null (from TST % column)",
    "stage2Percent": "number or null (from TST % column)",
    "stage3Percent": "number or null (from TST % column)",
    "stage4Percent": "number or null (from TST % column, usually 0)",
    "remPercent": "number or null (from TST % column)",
    "remCycles": "number or null"
  },
  "respiratoryEvents": {
    "ahiOverall": "number or null",
    "ahiNrem": "number or null",
    "ahiRem": "number or null",
    "ahiSupine": "number or null (from Body Position table S/SL row)",
    "ahiLeft": "number or null (from Body Position table L row)",
    "ahiRight": "number or null (from Body Position table R row)",
    "centralApneaIndex": "number or null",
    "obstructiveApneaIndex": "number or null",
    "mixedApneaIndex": "number or null",
    "hypopneaIndex": "number or null",
    "caMeanDuration": "number (seconds from Mean row CA column) or null",
    "oaMeanDuration": "number (seconds from Mean row OA column) or null",
    "maMeanDuration": "number (seconds from Mean row MA column) or null",
    "hypMeanDuration": "number (seconds from Mean row HYP column) or null",
    "meanHypopneaDuration": "CALCULATED - do not extract"
  },
  "oxygenation": {
    "lowestSpO2": "number or null (from Oximetry Minimum %)",
    "averageSpO2": "number or null",
    "desaturationIndex": "number or null",
    "timeBelow90Percent": "number or null",
    "timeBelow95Percent": "number or null",
    "calculations": {
      "tst": "number or null",
      "under90REM": "number or null",
      "under90NREM": "number or null",
      "under95REM": "number or null",
      "under95NREM": "number or null"
    }
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
    "supinePositionIndex": "number or null",
  }
}

**CRITICAL**: 
- Extract ACTUAL values from document
- Use null for missing data
- DO NOT use example values
- Perform calculations as specified

### 📄 DOCUMENT TEXT:
${rawText.substring(0, 50000)}`;

  try {
    console.log("=== Sending to Lovable AI (Comprehensive Extraction) ===");
    console.log("Prompt length:", prompt.length);
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 4000,
        messages: [{ 
          role: 'user', 
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ AI API Error:", response.status, errorText);
      throw new Error(`AI API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("=== AI Response (Full Extraction) ===");
    console.log(JSON.stringify(data, null, 2));
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid AI response structure");
    }

    let result = data.choices[0].message.content.trim();
    
    // Extract JSON from markdown
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = jsonMatch[0];
    }
    result = result.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    const parsed = JSON.parse(result);
    console.log("=== Parsed Comprehensive Result ===", JSON.stringify(parsed, null, 2));
    
    // Calculate Slow Wave Sleep (SWS) = S3 + S4
    if (typeof parsed.sleepArchitecture?.stage3Percent === 'number') {
      const s4 = parsed.sleepArchitecture?.stage4Percent || 0;
      parsed.sleepArchitecture.slowWaveSleepPercent = parseFloat((parsed.sleepArchitecture.stage3Percent + s4).toFixed(1));
      console.log(`✅ Calculated SWS: ${parsed.sleepArchitecture.stage3Percent} + ${s4} = ${parsed.sleepArchitecture.slowWaveSleepPercent}%`);
    }
    
    // Calculate AHI Lateral = (AHI Left + AHI Right) / 2, with single-side fallback
    if (!parsed.respiratoryEvents?.ahiLateral) {
      const ahiLeft = parsed.respiratoryEvents?.ahiLeft;
      const ahiRight = parsed.respiratoryEvents?.ahiRight;
      const leftIsNum = typeof ahiLeft === 'number';
      const rightIsNum = typeof ahiRight === 'number';

      if (leftIsNum && rightIsNum) {
        parsed.respiratoryEvents.ahiLateral = parseFloat(((ahiLeft + ahiRight) / 2).toFixed(2));
        console.log(`✅ Calculated AHI Lateral: (${ahiLeft} + ${ahiRight}) / 2 = ${parsed.respiratoryEvents.ahiLateral}`);
      } else if (leftIsNum) {
        parsed.respiratoryEvents.ahiLateral = ahiLeft;
        console.log(`✅ AHI Lateral (left only): ${ahiLeft}`);
      } else if (rightIsNum) {
        parsed.respiratoryEvents.ahiLateral = ahiRight;
        console.log(`✅ AHI Lateral (right only): ${ahiRight}`);
      }
    }
    
    // O2 <90% fallback - only if AI didn't extract it
    if (parsed.oxygenation?.timeBelow90Percent === null || parsed.oxygenation?.timeBelow90Percent === undefined) {
      if (typeof parsed.oxygenation?.calculations?.under90REM === 'number' && 
          typeof parsed.oxygenation?.calculations?.under90NREM === 'number' && 
          typeof parsed.oxygenation?.calculations?.tst === 'number' &&
          parsed.oxygenation.calculations.tst > 0) {
        const tst = parsed.oxygenation.calculations.tst;
        const sum90 = parsed.oxygenation.calculations.under90REM + parsed.oxygenation.calculations.under90NREM;
        parsed.oxygenation.timeBelow90Percent = parseFloat(((sum90 / tst) * 100).toFixed(2));
        console.log(`✅ O2 <90% (fallback): (${parsed.oxygenation.calculations.under90REM} + ${parsed.oxygenation.calculations.under90NREM}) / ${tst} * 100 = ${parsed.oxygenation.timeBelow90Percent}%`);
      }
    }
    
    // O2 <95% fallback - only if AI didn't extract it
    if (parsed.oxygenation?.timeBelow95Percent === null || parsed.oxygenation?.timeBelow95Percent === undefined) {
      if (typeof parsed.oxygenation?.calculations?.under95REM === 'number' && 
          typeof parsed.oxygenation?.calculations?.under95NREM === 'number' && 
          typeof parsed.oxygenation?.calculations?.tst === 'number' &&
          parsed.oxygenation.calculations.tst > 0) {
        const tst = parsed.oxygenation.calculations.tst;
        const sum95 = parsed.oxygenation.calculations.under95REM + parsed.oxygenation.calculations.under95NREM;
        parsed.oxygenation.timeBelow95Percent = parseFloat(((sum95 / tst) * 100).toFixed(2));
        console.log(`✅ O2 <95% (fallback): (${parsed.oxygenation.calculations.under95REM} + ${parsed.oxygenation.calculations.under95NREM}) / ${tst} * 100 = ${parsed.oxygenation.timeBelow95Percent}%`);
      }
    }
    
    // Calculate Mean Hypopnea Duration = Average of non-zero durations (OA + CA + MA + HYP)
    if (parsed.respiratoryEvents) {
      const durations: number[] = [];
      const durationFields = ['oaMeanDuration', 'caMeanDuration', 'maMeanDuration', 'hypMeanDuration'];
      
      for (const field of durationFields) {
        const val = parsed.respiratoryEvents[field];
        if (typeof val === 'number' && val > 0) {
          durations.push(val);
        }
      }
      
      if (durations.length > 0) {
        const sum = durations.reduce((a, b) => a + b, 0);
        parsed.respiratoryEvents.meanHypopneaDuration = parseFloat((sum / durations.length).toFixed(1));
        console.log(`✅ Calculated Mean Hypopnea Duration: (${durations.join(' + ')}) / ${durations.length} = ${parsed.respiratoryEvents.meanHypopneaDuration} sec`);
      } else {
        parsed.respiratoryEvents.meanHypopneaDuration = null;
        console.log(`⚠️ No non-zero duration values found for Mean Hypopnea Duration calculation`);
      }
    }
    
    console.log("✅ Comprehensive extraction successful");
    console.log("=== COMPREHENSIVE EXTRACTION PIPELINE END ===");
    
    return parsed;
    
  } catch (error) {
    console.error("❌ Comprehensive AI Extraction error:", error);
    console.log("=== COMPREHENSIVE EXTRACTION PIPELINE END ===");
    
    // Return minimal structure on error
    return {
      patientInfo: { name: null, firstName: null, age: null, gender: null },
      studyInfo: {
        studyType,
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
        stage4Percent: null,
        slowWaveSleepPercent: null,
        remPercent: null,
        remCycles: null
      },
      respiratoryEvents: {
        ahiOverall: null,
        ahiNrem: null,
        ahiRem: null,
        ahiSupine: null,
        ahiLeft: null,
        ahiRight: null,
        ahiLateral: null,
        centralApneaIndex: null,
        obstructiveApneaIndex: null,
        mixedApneaIndex: null,
        hypopneaIndex: null,
        meanHypopneaDuration: null
      },
      oxygenation: {
        lowestSpO2: null,
        averageSpO2: null,
        desaturationIndex: null,
        timeBelow90Percent: null,
        timeBelow95Percent: null,
        calculations: {
          tst: null,
          under90REM: null,
          under90NREM: null,
          under95REM: null,
          under95NREM: null
        }
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
      }
    };
  }
}

// Helper function to get empty data structure
function getEmptyDataStructure() {
  return {
    studyInfo: {
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
      slowWaveSleepPercent: null,
      remPercent: null,
      remCycles: null
    },
    respiratoryEvents: {
      ahiOverall: null,
      ahiNrem: null,
      ahiRem: null,
      ahiSupine: null,
      ahiLateral: null,
      centralApneaIndex: null,
      obstructiveApneaIndex: null,
      mixedApneaIndex: null,
      hypopneaIndex: null,
      meanHypopneaDuration: null
    },
    oxygenation: {
      lowestSpO2: null,
      averageSpO2: null,
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
      snoringPercent: null,
      legMovementIndex: null
    }
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rawText, studyType, clinicalData, patientComments } = await req.json();
    
    // === INPUT VALIDATION ===
    // Validate rawText
    if (!rawText || typeof rawText !== 'string') {
      return new Response(
        JSON.stringify({ error: 'rawText is required and must be a string' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Limit payload size to 10MB to handle large medical documents
    if (rawText.length > 10000000) {
      return new Response(
        JSON.stringify({ error: 'rawText exceeds maximum allowed size (10MB)' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate studyType against allowed values
    const validStudyTypes = ['Diagnostic', 'Titration', 'Split-Night'];
    if (!studyType || !validStudyTypes.includes(studyType)) {
      return new Response(
        JSON.stringify({ error: `Invalid studyType. Must be one of: ${validStudyTypes.join(', ')}` }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate clinicalData is an object if provided
    if (clinicalData !== undefined && clinicalData !== null && typeof clinicalData !== 'object') {
      return new Response(
        JSON.stringify({ error: 'clinicalData must be an object' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate patientComments is an array if provided
    if (patientComments !== undefined && patientComments !== null && !Array.isArray(patientComments)) {
      return new Response(
        JSON.stringify({ error: 'patientComments must be an array' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("=== REQUEST RECEIVED ===");
    console.log("Study Type:", studyType);
    console.log("Raw text length:", rawText.length);
    console.log("Clinical Data received:", !!clinicalData);
    console.log("Patient Comments received:", patientComments?.length || 0);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Extract ALL metrics using comprehensive pipeline
    const extractedData = await extractSleepMetrics(rawText || '', lovableApiKey, studyType);

    // Handle Split-Night response differently
    if (extractedData.isSplitNight) {
      // Pass both offCpap and onCpap data to clinical summary for combined TST
      const offCpapWithOnData = {
        ...extractedData.offCpap,
        onCpapData: extractedData.onCpap
      };
      const clinicalSummary = generateClinicalSummary(offCpapWithOnData, studyType, clinicalData);
      // Create combined data object with baseline (offCpap) for severity classification
      // but include onCpap reference for therapeutic outcome
      const combinedDataForRecommendations = {
        ...extractedData.offCpap,  // Use OFF CPAP for baseline severity
        onCpapData: extractedData.onCpap  // Include ON CPAP for therapy reference
      };
      const recommendations = generateRecommendations(combinedDataForRecommendations, studyType, clinicalData);
      
      // Convert patient comment keys to readable text
      const convertedComments = clinicalData?.selectedComments 
        ? convertPatientComments(clinicalData.selectedComments) 
        : [];
      
      // Calculate clinical interpretation
      const offAhi = extractedData.offCpap?.respiratoryEvents?.ahiOverall || 0;
      const ahiSupine = extractedData.offCpap?.respiratoryEvents?.ahiSupine || 0;
      const ahiLateral = extractedData.offCpap?.respiratoryEvents?.ahiLateral || 0;
      const ahiRem = extractedData.offCpap?.respiratoryEvents?.ahiRem || 0;
      const ahiNrem = extractedData.offCpap?.respiratoryEvents?.ahiNrem || 0;
      const cai = extractedData.offCpap?.respiratoryEvents?.centralApneaIndex || 0;
      const timeBelow90 = parseFloat(extractedData.offCpap?.oxygenation?.timeBelow90Percent) || 0;
      const plmIndex = extractedData.offCpap?.additionalMetrics?.legMovementIndex || 0;
      
      let severity = 'Normal';
      if (offAhi >= 30) severity = 'Severe';
      else if (offAhi >= 15) severity = 'Moderate';
      else if (offAhi >= 5) severity = 'Mild';
      
      // Run Quality Assurance
      const qualityAssurance = runQualityAssurance(extractedData, rawText, true);
      console.log("=== QA RESULTS (Split-Night) ===");
      console.log("Overall Score:", qualityAssurance.overallScore);
      console.log("Validation Issues:", qualityAssurance.dataValidation.issues.length);
      console.log("Missing Critical:", qualityAssurance.missingData.critical.length);

      const response = {
        isSplitNight: true,
        studyType,
        offCpap: extractedData.offCpap,
        onCpap: extractedData.onCpap,
        clinicalSummary,
        recommendations,
        patientComments: (patientComments && patientComments.length > 0) ? patientComments : convertedComments,
        clinicalData: clinicalData || {},
        clinicalInterpretation: {
          osaSeverity: severity,
          isPositionalOSA: ahiSupine > 0 && ahiLateral > 0 && ahiSupine > ahiLateral * AASM_GUIDELINES.POSITIONAL_RATIO,
          isREMRelatedOSA: ahiRem > 0 && ahiNrem > 0 && ahiRem > ahiNrem * AASM_GUIDELINES.REM_RATIO,
          hasCentralComponent: cai > AASM_GUIDELINES.SIGNIFICANT_CAI,
          hasSignificantDesaturation: timeBelow90 > AASM_GUIDELINES.SIGNIFICANT_DESAT,
          hasPLM: plmIndex > AASM_GUIDELINES.ELEVATED_PLM,
          positionalRatio: ahiLateral > 0 ? (ahiSupine / ahiLateral).toFixed(1) : null,
          remRatio: ahiNrem > 0 ? (ahiRem / ahiNrem).toFixed(1) : null
        },
        qualityAssurance,
        extractionMethod: "split-night-comprehensive",
        timestamp: new Date().toISOString()
      };

      console.log("=== SPLIT-NIGHT RESPONSE ===");
      console.log(JSON.stringify(response, null, 2));

      return new Response(
        JSON.stringify(response),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Generate Clinical Summary and Recommendations for regular studies
    const clinicalSummary = generateClinicalSummary(extractedData, studyType, clinicalData);
    const recommendations = generateRecommendations(extractedData, studyType, clinicalData);

    // Extract values for clinicalInterpretation
    const ahi = extractedData.respiratoryEvents?.ahiOverall || 0;
    const ahiSupine = extractedData.respiratoryEvents?.ahiSupine || 0;
    const ahiLateral = extractedData.respiratoryEvents?.ahiLateral || 0;
    const ahiRem = extractedData.respiratoryEvents?.ahiRem || 0;
    const ahiNrem = extractedData.respiratoryEvents?.ahiNrem || 0;
    const cai = extractedData.respiratoryEvents?.centralApneaIndex || 0;
    const timeBelow90 = parseFloat(extractedData.oxygenation?.timeBelow90Percent) || 0;
    const plmIndex = extractedData.additionalMetrics?.legMovementIndex || 0;

    // Run Quality Assurance
    const qualityAssurance = runQualityAssurance(extractedData, rawText, false);
    console.log("=== QA RESULTS ===");
    console.log("Overall Score:", qualityAssurance.overallScore);
    console.log("Validation Issues:", qualityAssurance.dataValidation.issues.length);
    console.log("Missing Critical:", qualityAssurance.missingData.critical.length);

    // Format comprehensive response with ALL extracted data
    const response = {
      patientInfo: extractedData.patientInfo || {
        name: null,
        firstName: null,
        age: null,
        gender: null
      },
      studyInfo: extractedData.studyInfo || {
        studyType,
        lightsOff: null,
        lightsOn: null,
        timeInBed: null,
        totalSleepTime: null,
        sleepLatency: null,
        remLatency: null
      },
      sleepArchitecture: extractedData.sleepArchitecture || {
        sleepEfficiency: null,
        stage1Percent: null,
        stage2Percent: null,
        stage3Percent: null,
        stage4Percent: null,
        slowWaveSleepPercent: null,
        remPercent: null,
        remCycles: null
      },
      respiratoryEvents: extractedData.respiratoryEvents || {
        ahiOverall: null,
        ahiNrem: null,
        ahiRem: null,
        ahiSupine: null,
        ahiLeft: null,
        ahiRight: null,
        ahiLateral: null,
        centralApneaIndex: null,
        obstructiveApneaIndex: null,
        mixedApneaIndex: null,
        hypopneaIndex: null,
        meanHypopneaDuration: null
      },
      oxygenation: extractedData.oxygenation || {
        lowestSpO2: null,
        averageSpO2: null,
        desaturationIndex: null,
        timeBelow90Percent: null,
        timeBelow95Percent: null,
        calculations: {
          tst: null,
          under90REM: null,
          under90NREM: null,
          under95REM: null,
          under95NREM: null
        }
      },
      cardiacData: extractedData.cardiacData || {
        meanHeartRateNrem: null,
        meanHeartRateRem: null
      },
      additionalMetrics: extractedData.additionalMetrics || {
        arousalIndex: null,
        snoringMinutes: null,
        snoringPercent: null,
        legMovementIndex: null,
        leftPositionIndex: null,
        rightPositionIndex: null,
        supinePositionIndex: null
      },
      clinicalSummary,
      recommendations,
      patientComments: (patientComments && patientComments.length > 0) 
        ? patientComments 
        : (clinicalData?.selectedComments && clinicalData.selectedComments.length > 0 
            ? convertPatientComments(clinicalData.selectedComments) 
            : []),
      clinicalInterpretation: {
        osaSeverity: ahi >= 30 ? 'Severe' : ahi >= 15 ? 'Moderate' : ahi >= 5 ? 'Mild' : 'Normal',
        isPositionalOSA: ahiSupine > 0 && ahiLateral > 0 && ahiSupine > ahiLateral * AASM_GUIDELINES.POSITIONAL_RATIO,
        isREMRelatedOSA: ahiRem > 0 && ahiNrem > 0 && ahiRem > ahiNrem * AASM_GUIDELINES.REM_RATIO,
        hasCentralComponent: cai > AASM_GUIDELINES.SIGNIFICANT_CAI,
        hasSignificantDesaturation: timeBelow90 > AASM_GUIDELINES.SIGNIFICANT_DESAT,
        hasPLM: plmIndex > AASM_GUIDELINES.ELEVATED_PLM,
        positionalRatio: ahiLateral > 0 ? (ahiSupine / ahiLateral).toFixed(1) : null,
        remRatio: ahiNrem > 0 ? (ahiRem / ahiNrem).toFixed(1) : null
      },
      qualityAssurance,
      extractionMethod: "comprehensive-medical-grade",
      timestamp: new Date().toISOString()
    };

    console.log("=== FINAL COMPREHENSIVE RESPONSE ===");
    console.log(JSON.stringify(response, null, 2));

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    
    // Map internal errors to generic client-safe messages
    let userMessage = 'An error occurred processing your request. Please try again.';
    
    if (error instanceof Error) {
      if (error.message.includes('API_KEY') || error.message.includes('not configured')) {
        userMessage = 'Service configuration error. Please contact support.';
      } else if (error.message.includes('rawText') || error.message.includes('studyType')) {
        userMessage = 'Invalid file data. Please check your upload and try again.';
      } else if (error.message.includes('too large') || error.message.includes('size')) {
        userMessage = 'File is too large. Please upload a smaller file.';
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: userMessage,
        extractedData: null 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});