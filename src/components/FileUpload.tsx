import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
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
    <Card className={`border-2 transition-colors ${
      dragActive ? 'border-primary bg-primary/5' : 
      success ? 'border-green-500 bg-green-50' :
      'border-dashed border-primary/20 hover:border-primary/40'
    }`}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          {success ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Processing Complete</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span>Upload Sleep Study Report</span>
            </>
          )}
        </CardTitle>
        <CardDescription>
          Upload your G3 sleep study report (.docx format) to generate a professional PDF summary
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!file && !processing && !success && (
          <div
            className={`flex flex-col items-center justify-center py-12 space-y-4 rounded-lg transition-colors ${
              dragActive ? 'bg-primary/10' : 'hover:bg-muted/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="bg-primary/10 p-4 rounded-full">
              <FileText className="h-12 w-12 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">Drop your .docx file here</p>
              <p className="text-sm text-muted-foreground">or click to browse files</p>
            </div>
            <input
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button size="lg" className="mt-4" asChild>
                <span>Select File</span>
              </Button>
            </label>
          </div>
        )}

        {file && !processing && !success && (
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={resetUpload}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleProcessFile} className="flex-1">
                Process Report
              </Button>
            </div>
          </div>
        )}

        {processing && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="font-medium">Processing {file?.name}</p>
              <p className="text-sm text-muted-foreground">
                Analyzing sleep study data...
              </p>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              {progress < 25 ? 'Reading document...' :
               progress < 50 ? 'Extracting clinical data...' :
               progress < 75 ? 'Analyzing sleep parameters...' :
               'Generating report...'}
            </p>
          </div>
        )}

        {success && (
          <div className="text-center space-y-4">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">Report Generated Successfully</p>
              <p className="text-sm text-green-600">Your sleep study analysis is ready</p>
            </div>
            <Button onClick={resetUpload} variant="outline">
              Process Another Report
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};