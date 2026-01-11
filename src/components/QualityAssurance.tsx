import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, AlertCircle, Info, ChevronDown, ChevronUp, XCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Types for QA System
export interface ValidationIssue {
  field: string;
  value: any;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ConfidenceScore {
  level: 'high' | 'medium' | 'low';
  score: number;
  reason: string;
}

export interface MissingDataReport {
  critical: string[];
  important: string[];
  completenessPercent: number;
}

export interface CrossValidationResult {
  check: string;
  expected: string;
  actual: string;
  status: 'passed' | 'warning' | 'error';
  message?: string;
}

export interface QualityAssuranceData {
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

// ========== Confidence Badge Component ==========
interface ConfidenceBadgeProps {
  level: 'high' | 'medium' | 'low';
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const ConfidenceBadge = ({ level, showLabel = false, size = 'sm' }: ConfidenceBadgeProps) => {
  const config = {
    high: {
      color: 'bg-emerald-500',
      label: 'High',
      textColor: 'text-emerald-700 dark:text-emerald-400'
    },
    medium: {
      color: 'bg-amber-500',
      label: 'Medium',
      textColor: 'text-amber-700 dark:text-amber-400'
    },
    low: {
      color: 'bg-red-500',
      label: 'Low',
      textColor: 'text-red-700 dark:text-red-400'
    }
  };

  const { color, label, textColor } = config[level];
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';

  return (
    <span className="inline-flex items-center gap-1 ml-1">
      <span className={cn(dotSize, 'rounded-full inline-block', color)} />
      {showLabel && <span className={cn('text-xs font-medium', textColor)}>{label}</span>}
    </span>
  );
};

// ========== Validation Alert Banner Component ==========
interface ValidationAlertBannerProps {
  issues: ValidationIssue[];
  onDismiss?: () => void;
}

export const ValidationAlertBanner = ({ issues, onDismiss }: ValidationAlertBannerProps) => {
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  if (issues.length === 0) return null;

  return (
    <div className={cn(
      "rounded-lg border p-4 mb-4",
      errors.length > 0 
        ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800" 
        : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
    )}>
      <div className="flex items-start gap-3">
        {errors.length > 0 ? (
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <h4 className={cn(
            "font-semibold text-sm",
            errors.length > 0 ? "text-red-800 dark:text-red-200" : "text-amber-800 dark:text-amber-200"
          )}>
            {errors.length > 0 
              ? `${errors.length} Critical Validation Issue${errors.length > 1 ? 's' : ''} Found`
              : `${warnings.length} Warning${warnings.length > 1 ? 's' : ''} Detected`
            }
          </h4>
          <ul className="mt-2 space-y-1 text-sm">
            {issues.slice(0, 3).map((issue, idx) => (
              <li key={idx} className={cn(
                issue.severity === 'error' 
                  ? "text-red-700 dark:text-red-300" 
                  : "text-amber-700 dark:text-amber-300"
              )}>
                <span className="font-medium">{issue.field}:</span> {issue.message}
              </li>
            ))}
            {issues.length > 3 && (
              <li className="text-muted-foreground">...and {issues.length - 3} more issues</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

// ========== Missing Data Panel Component ==========
interface MissingDataPanelProps {
  missingData: MissingDataReport;
}

export const MissingDataPanel = ({ missingData }: MissingDataPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const hasMissing = missingData.critical.length > 0 || missingData.important.length > 0;
  
  if (!hasMissing) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className={cn(
        "w-full flex items-center justify-between p-3 rounded-lg border transition-colors",
        missingData.critical.length > 0 
          ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/30"
          : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-950/30"
      )}>
        <div className="flex items-center gap-2">
          <HelpCircle className={cn(
            "h-4 w-4",
            missingData.critical.length > 0 ? "text-red-500" : "text-amber-500"
          )} />
          <span className="text-sm font-medium">
            {missingData.critical.length > 0 
              ? `${missingData.critical.length} Critical Field${missingData.critical.length > 1 ? 's' : ''} Missing`
              : `${missingData.important.length} Important Field${missingData.important.length > 1 ? 's' : ''} Missing`
            }
          </span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="p-3 bg-muted/50 rounded-lg space-y-3">
          {missingData.critical.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">Critical</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {missingData.critical.map((field, idx) => (
                  <Badge key={idx} variant="destructive" className="text-xs">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {missingData.important.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Important</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {missingData.important.map((field, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// ========== Cross Validation Report Component ==========
interface CrossValidationReportProps {
  crossValidation: {
    passed: number;
    failed: number;
    checks: CrossValidationResult[];
  };
}

export const CrossValidationReport = ({ crossValidation }: CrossValidationReportProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <CheckCircle className={cn(
            "h-4 w-4",
            crossValidation.failed > 0 ? "text-amber-500" : "text-emerald-500"
          )} />
          <span className="text-sm font-medium">
            Cross-Validation: {crossValidation.passed}/{crossValidation.passed + crossValidation.failed} Checks Passed
          </span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="space-y-2">
          {crossValidation.checks.map((check, idx) => (
            <div 
              key={idx} 
              className={cn(
                "p-3 rounded-lg border flex items-start gap-3",
                check.status === 'passed' && "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800",
                check.status === 'warning' && "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
                check.status === 'error' && "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
              )}
            >
              {check.status === 'passed' && <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />}
              {check.status === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />}
              {check.status === 'error' && <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{check.check}</span>
                  <span className="text-xs text-muted-foreground">{check.actual}</span>
                </div>
                {check.message && (
                  <p className="text-xs text-muted-foreground mt-1">{check.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// ========== Main Quality Assurance Card Component ==========
interface QualityAssuranceCardProps {
  qa: QualityAssuranceData;
  showDetails?: boolean;
}

export const QualityAssuranceCard = ({ qa, showDetails = true }: QualityAssuranceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 70) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (passed: boolean, hasWarnings: boolean = false) => {
    if (passed && !hasWarnings) return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    if (hasWarnings) return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            AI Extraction Quality
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className={cn("text-2xl font-bold", getScoreColor(qa.overallScore))}>
              {qa.overallScore}%
            </span>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
          <div 
            className={cn("h-full transition-all duration-500", getScoreBackground(qa.overallScore))}
            style={{ width: `${qa.overallScore}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            {getStatusIcon(qa.dataValidation.failed === 0, qa.dataValidation.issues.some(i => i.severity === 'warning'))}
            <div className="text-xs">
              <div className="font-medium">Validation</div>
              <div className="text-muted-foreground">{qa.dataValidation.passed}/{qa.dataValidation.passed + qa.dataValidation.failed}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            {getStatusIcon(qa.missingData.critical.length === 0, qa.missingData.important.length > 0)}
            <div className="text-xs">
              <div className="font-medium">Completeness</div>
              <div className="text-muted-foreground">{qa.missingData.completenessPercent}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            {getStatusIcon(qa.crossValidation.failed === 0)}
            <div className="text-xs">
              <div className="font-medium">Consistency</div>
              <div className="text-muted-foreground">{qa.crossValidation.passed}/{qa.crossValidation.passed + qa.crossValidation.failed}</div>
            </div>
          </div>
        </div>

        {showDetails && (
          <>
            {/* Validation Issues Banner */}
            {qa.dataValidation.issues.length > 0 && (
              <ValidationAlertBanner issues={qa.dataValidation.issues} />
            )}

            {/* Missing Data Panel */}
            <MissingDataPanel missingData={qa.missingData} />

            {/* Cross Validation Report */}
            <CrossValidationReport crossValidation={qa.crossValidation} />
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Import icon used in QualityAssuranceCard
import { Activity } from "lucide-react";
