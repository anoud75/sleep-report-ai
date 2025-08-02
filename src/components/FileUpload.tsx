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
    <div className="space-y-4">
      {/* Error alert */}
      {error && (
        <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      <Card className={`border transition-all duration-200 ${
        dragActive ? 'border-blue-500/50 bg-blue-500/5 shadow-lg' : 
        success ? 'border-green-500/50 bg-green-500/5 shadow-lg' :
        'border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:shadow-md'
      }`}>
        {!file && !processing && !success && (
          <CardContent className="p-6">
            <div
              className={`flex flex-col items-center justify-center py-8 space-y-4 rounded-lg border-2 border-dashed transition-all duration-200 ${
                dragActive 
                  ? 'border-blue-500/50 bg-blue-500/5' 
                  : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/30'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {/* Icon */}
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Upload className="h-6 w-6 text-blue-400" />
              </div>
              
              {/* Content */}
              <div className="text-center space-y-2">
                <h4 className="font-semibold text-lg text-white">Upload Sleep Study Report</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Upload your G3 sleep study report (.docx format) to generate a professional PDF summary
                </p>
              </div>
              
              {/* Drop instruction */}
              <div className="text-center space-y-2">
                <p className="text-gray-300 text-sm">Drop your .docx file here</p>
                <p className="text-xs text-gray-500">or click to browse files</p>
              </div>
              
              {/* File input and button */}
              <input
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  asChild
                >
                  <span>Select File</span>
                </Button>
              </label>
            </div>
          </CardContent>
        )}

        {file && !processing && !success && (
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* File info */}
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{file.name}</p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to process
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetUpload}
                  className="text-gray-400 hover:text-white hover:bg-gray-700 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Process button */}
              <Button 
                onClick={handleProcessFile} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 font-medium"
                disabled={!selectedStudyType}
              >
                Process Report
              </Button>
              
              {!selectedStudyType && (
                <p className="text-xs text-yellow-400 text-center">
                  Please select a study type first
                </p>
              )}
            </div>
          </CardContent>
        )}

        {processing && (
          <CardContent className="p-6">
            <div className="space-y-4 text-center">
              {/* Processing icon */}
              <div className="p-3 rounded-lg bg-blue-500/10 w-fit mx-auto">
                <Upload className="h-6 w-6 text-blue-400 animate-pulse" />
              </div>
              
              {/* Processing info */}
              <div className="space-y-1">
                <h4 className="font-medium text-white">Processing {file?.name}</h4>
                <p className="text-sm text-gray-400">Analyzing sleep study data...</p>
              </div>
              
              {/* Progress bar */}
              <div className="space-y-2">
                <Progress value={progress} className="h-2 bg-gray-800" />
                <p className="text-xs text-gray-400">
                  {progress < 25 ? 'Reading document...' :
                   progress < 50 ? 'Extracting clinical data...' :
                   progress < 75 ? 'Analyzing sleep parameters...' :
                   'Generating report...'}
                </p>
              </div>
            </div>
          </CardContent>
        )}

        {success && (
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              {/* Success icon */}
              <div className="p-3 rounded-lg bg-green-500/10 w-fit mx-auto">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              
              {/* Success message */}
              <div className="space-y-1">
                <h4 className="font-medium text-white">Report Generated Successfully</h4>
                <p className="text-sm text-gray-400">Your sleep study analysis is ready</p>
              </div>
              
              {/* Action button */}
              <Button 
                onClick={resetUpload} 
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Process Another Report
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};