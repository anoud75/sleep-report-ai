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

      <Card className={`transition-all duration-200 ${
        dragActive ? 'ring-2 ring-blue-500 border-blue-500/30 bg-blue-500/5' : 
        success ? 'ring-2 ring-green-500 border-green-500/30 bg-green-500/5' :
        'border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-800/30'
      }`}>
        {!file && !processing && !success && (
          <CardContent className="p-4">
            <div
              className={`flex flex-col items-center justify-center py-8 space-y-4 rounded-lg border-2 border-dashed transition-all duration-200 ${
                dragActive 
                  ? 'border-blue-500/50 bg-blue-500/5' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {/* Icon */}
              <div className="p-2.5 rounded-lg bg-blue-500/10">
                <Upload className="h-5 w-5 text-blue-400" />
              </div>
              
              {/* Content */}
              <div className="text-center space-y-2">
                <h4 className="font-semibold text-white">Upload Sleep Study Report</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Upload your G3 sleep study report (.docx format)
                </p>
              </div>
              
              {/* Features list */}
              <div className="space-y-1 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                  <span className="text-xs text-gray-500">Professional PDF summary</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                  <span className="text-xs text-gray-500">AI-powered analysis</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                  <span className="text-xs text-gray-500">Instant processing</span>
                </div>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition-colors"
                  asChild
                >
                  <span>Select File</span>
                </Button>
              </label>
            </div>
          </CardContent>
        )}

        {file && !processing && !success && (
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className="p-2.5 rounded-lg bg-blue-500/10 flex-shrink-0">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              
              {/* Content */}
              <div className="flex-1 space-y-2">
                {/* Title and remove button */}
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">{file.name}</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetUpload}
                    className="text-gray-400 hover:text-white hover:bg-gray-700 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* File info */}
                <p className="text-gray-400 text-sm">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to process
                </p>
                
                {/* Process button */}
                <Button 
                  onClick={handleProcessFile} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm font-medium mt-3"
                  disabled={!selectedStudyType}
                >
                  Process Report
                </Button>
                
                {!selectedStudyType && (
                  <p className="text-xs text-yellow-400 text-center mt-2">
                    Please select a study type first
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        )}

        {processing && (
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className="p-2.5 rounded-lg bg-blue-500/10 flex-shrink-0">
                <Upload className="h-5 w-5 text-blue-400 animate-pulse" />
              </div>
              
              {/* Content */}
              <div className="flex-1 space-y-2">
                {/* Title */}
                <h4 className="font-semibold text-white">Processing {file?.name}</h4>
                
                {/* Description */}
                <p className="text-gray-400 text-sm">Analyzing sleep study data...</p>
                
                {/* Progress */}
                <div className="space-y-2 mt-3">
                  <Progress value={progress} className="h-2 bg-gray-800" />
                  <p className="text-xs text-gray-500">
                    {progress < 25 ? 'Reading document...' :
                     progress < 50 ? 'Extracting clinical data...' :
                     progress < 75 ? 'Analyzing sleep parameters...' :
                     'Generating report...'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}

        {success && (
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className="p-2.5 rounded-lg bg-green-500/10 flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              
              {/* Content */}
              <div className="flex-1 space-y-2">
                {/* Title */}
                <h4 className="font-semibold text-white">Report Generated Successfully</h4>
                
                {/* Description */}
                <p className="text-gray-400 text-sm">Your sleep study analysis is ready</p>
                
                {/* Action button */}
                <Button 
                  onClick={resetUpload} 
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white py-2 text-sm mt-3"
                >
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