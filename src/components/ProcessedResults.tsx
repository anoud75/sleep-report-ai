import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, User, Calendar, Activity, Stethoscope, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProcessedResultsProps {
  data: any;
  onNewReport: () => void;
}

export const ProcessedResults = ({ data, onNewReport }: ProcessedResultsProps) => {
  const { toast } = useToast();

  const handleDownloadPDF = () => {
    toast({
      title: "PDF Generated",
      description: "Your sleep study report has been downloaded.",
    });
    // In a real implementation, this would generate and download the actual PDF
  };

  const handlePreviewReport = () => {
    toast({
      title: "Preview Opened",
      description: "Report preview will open in a new window.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Sleep Study Analysis Complete</span>
              </CardTitle>
              <CardDescription>
                Report generated for {data.patientInfo.name} • {data.patientInfo.studyDate}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Activity className="h-3 w-3 mr-1" />
              {data.studyType}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3">
            <Button onClick={handleDownloadPDF} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download PDF Report
            </Button>
            <Button variant="outline" onClick={handlePreviewReport}>
              Preview
            </Button>
            <Button variant="outline" onClick={onNewReport}>
              New Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Patient Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Patient Name</span>
              <span className="font-medium">{data.patientInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Date of Birth</span>
              <span className="font-medium">{data.patientInfo.dob}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Study Date</span>
              <span className="font-medium">{data.patientInfo.studyDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Study Type</span>
              <Badge variant="outline">{data.studyType}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Sleep Parameters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Sleep Architecture</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Sleep Time</span>
              <span className="font-medium">{data.sleepParameters.totalSleepTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sleep Efficiency</span>
              <span className="font-medium">{data.sleepParameters.sleepEfficiency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">REM Sleep</span>
              <span className="font-medium">{data.sleepParameters.rem}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Arousal Index</span>
              <span className="font-medium">{data.sleepParameters.arousalIndex}</span>
            </div>
          </CardContent>
        </Card>

        {/* Respiratory Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="h-4 w-4" />
              <span>Respiratory Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">AHI (Apnea-Hypopnea Index)</span>
              <div className="text-right">
                <span className="font-medium">{data.respiratoryEvents.ahi}</span>
                <div className={`text-xs mt-1 ${
                  parseFloat(data.respiratoryEvents.ahi) > 15 ? 'text-red-600' : 
                  parseFloat(data.respiratoryEvents.ahi) > 5 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {parseFloat(data.respiratoryEvents.ahi) > 15 ? 'Severe' : 
                   parseFloat(data.respiratoryEvents.ahi) > 5 ? 'Moderate' : 'Mild'}
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Oxygen Saturation (Nadir)</span>
              <span className="font-medium">{data.respiratoryEvents.oxygenSaturation}</span>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Clinical Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Report Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The sleep study analysis has been completed for <strong>{data.patientInfo.name}</strong>. 
            The {data.studyType.toLowerCase()} study shows{' '}
            {parseFloat(data.respiratoryEvents.ahi) > 15 ? 'severe sleep apnea' : 
             parseFloat(data.respiratoryEvents.ahi) > 5 ? 'moderate sleep apnea' : 'mild sleep disturbance'}
            {' '}with an AHI of {data.respiratoryEvents.ahi}. 
            {data.studyType === 'Titration' || data.studyType === 'Split-Night' 
              ? ' CPAP therapy appears effective in reducing respiratory events.' 
              : ' CPAP therapy is recommended for treatment.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};