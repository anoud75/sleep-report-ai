import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertCircle, X, Sparkles, Brain, FileSpreadsheet, Zap, Shield, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import mammoth from 'mammoth';

interface FileUploadProps {
  onFileProcessed: (data: any) => void;
  selectedStudyType: string;
  onFileUploaded?: (hasFile: boolean) => void;
}

export const FileUpload = ({ onFileProcessed, selectedStudyType, onFileUploaded }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.docx')) {
      return 'Please upload a .docx file only.';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 50MB.';
    }

    return null;
  };

  const processFile = async (file: File) => {
    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Extract text from .docx file using mammoth
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const fileContent = result.value;
      
      console.log('Extracted text length:', fileContent.length);
      console.log('First 500 chars:', fileContent.substring(0, 500));
      
      // Update progress
      setProgress(30);

      // Call the Supabase edge function to process with OpenAI
      const response = await fetch('https://rotdapktuwxwvylhnfry.functions.supabase.co/process-sleep-study', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileContent: fileContent,
          studyType: selectedStudyType
        }),
      });

      setProgress(70);

      if (!response.ok) {
        throw new Error(`Processing failed: ${response.statusText}`);
      }

      const processedData = await response.json();
      setProgress(100);

      setTimeout(() => {
        setSuccess(true);
        onFileProcessed(processedData);
        toast({
          title: "Processing Complete",
          description: "Sleep study report has been successfully analyzed.",
        });
      }, 500);

    } catch (err) {
      setError('Failed to process file. Please try again.');
      toast({
        title: "Processing Error",
        description: "There was an error processing your file.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validationError = validateFile(droppedFile);
      
      if (validationError) {
        setError(validationError);
        return;
      }

      setFile(droppedFile);
      setError(null);
      onFileUploaded?.(true);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validationError = validateFile(selectedFile);
      
      if (validationError) {
        setError(validationError);
        return;
      }

      setFile(selectedFile);
      setError(null);
      onFileUploaded?.(true);
    }
  };

  const handleProcessFile = () => {
    if (!selectedStudyType) {
      setError('Please select a study type first.');
      return;
    }
    if (file) {
      processFile(file);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setProcessing(false);
    setProgress(0);
    setError(null);
    setSuccess(false);
    onFileUploaded?.(false);
  };

  return (
    <div className="space-y-6">

      {/* Error alert */}
      {error && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      <Card className={`transition-all duration-500 border-2 ${
        dragActive ? 'border-primary bg-primary/5 shadow-[var(--shadow-glow)] scale-[1.02]' : 
        success ? 'border-success bg-success-light shadow-[var(--shadow-trust)]' :
        'border-border bg-card hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]'
      }`}>
        {!file && !processing && !success && (
          <CardContent className="p-8">

            {/* Advanced Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-500 cursor-pointer overflow-hidden group ${
                dragActive 
                  ? 'border-primary bg-primary/5 scale-105 shadow-[var(--shadow-glow)] animate-pulse-glow' 
                  : 'border-border hover:border-primary/50 hover:bg-primary/2'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {/* Background Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer bg-[length:200%_100%]"></div>
              
              <div className="relative z-10 animate-fade-in-up">
                <div className="relative mb-6">
                  <Upload className={`mx-auto h-16 w-16 mb-4 transition-all duration-500 ${
                    dragActive ? 'text-primary scale-110 animate-float' : 'text-muted-foreground group-hover:text-primary group-hover:scale-110'
                  }`} />
                  {dragActive && (
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                  )}
                </div>
                
                <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                  dragActive ? 'text-primary' : 'text-foreground'
                }`}>
                  Drop your .docx file here
                </h3>
                <p className="text-muted-foreground mb-6">
                  or click to browse files
                </p>
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="pointer-events-none shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-button-hover)] transition-all duration-300 hover:scale-105"
                >
                  <FileText className="h-5 w-5 mr-3" />
                  Select File
                </Button>
              </div>
            </div>
            
            {/* File input */}
            <input
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              id="file-upload"
            />
          </CardContent>
        )}

        {file && !processing && !success && (
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              {/* Icon */}
              <div className="relative p-4 rounded-2xl bg-primary/10 border border-primary/20 flex-shrink-0">
                <FileText className="h-8 w-8 text-primary" />
                <div className="absolute -top-1 -right-1">
                  <CheckCircle className="h-5 w-5 text-primary bg-background rounded-full" />
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 space-y-4">
                {/* Title and remove button */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-foreground">{file.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetUpload}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Process button */}
                <Button 
                  onClick={handleProcessFile} 
                  className="w-full shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-all duration-300"
                  disabled={!selectedStudyType}
                  size="lg"
                >
                  <Brain className="h-5 w-5 mr-3" />
                  Process Report
                </Button>
                
                {!selectedStudyType && (
                  <Alert className="border-warning/50 bg-warning/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-warning">
                      Please select a study type first to enable processing
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </CardContent>
        )}

        {processing && (
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              {/* Icon */}
              <div className="relative p-4 rounded-2xl bg-primary/10 border border-primary/20 flex-shrink-0">
                <Brain className="h-8 w-8 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 rounded-2xl animate-ping"></div>
              </div>
              
              {/* Content */}
              <div className="flex-1 space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">Processing {file?.name}</h3>
                  <p className="text-muted-foreground">AI is analyzing your sleep study data...</p>
                </div>
                
                {/* Progress */}
                <div className="space-y-3">
                  <Progress value={progress} className="h-3 bg-muted" />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <p className="text-sm text-muted-foreground">
                      {progress < 25 ? 'Reading document structure...' :
                       progress < 50 ? 'Extracting clinical data...' :
                       progress < 75 ? 'Analyzing sleep parameters...' :
                       'Generating professional report...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}

        {success && (
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              {/* Icon */}
              <div className="relative p-4 rounded-2xl bg-success/10 border border-success/20 flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-success" />
                <div className="absolute inset-0 bg-success/20 rounded-2xl animate-ping"></div>
              </div>
              
              {/* Content */}
              <div className="flex-1 space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">Analysis Complete!</h3>
                  <p className="text-muted-foreground">Your professional sleep study report is ready for review</p>
                </div>
                
                {/* Action button */}
                <Button 
                  onClick={resetUpload} 
                  variant="outline"
                  size="lg"
                  className="w-full border-success/30 text-success hover:bg-success/10"
                >
                  <FileText className="h-5 w-5 mr-3" />
                  Process Another Report
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};