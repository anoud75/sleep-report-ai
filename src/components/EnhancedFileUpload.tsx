import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertCircle, X, Brain, File, FileType } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import mammoth from 'mammoth';
import { MaskSelector } from './MaskSelector';

interface EnhancedFileUploadProps {
  onFileProcessed: (data: any) => void;
  selectedStudyType: string;
  onFileUploaded?: (hasFile: boolean) => void;
}

interface UploadedFile {
  file: File;
  type: 'diagnostic' | 'therapeutic';
  content?: string;
}

export const EnhancedFileUpload = ({ onFileProcessed, selectedStudyType, onFileUploaded }: EnhancedFileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [maskData, setMaskData] = useState<any>(null);
  const { toast } = useToast();

  const isSplitNight = selectedStudyType === 'Split-Night';
  const needsMaskSelection = selectedStudyType === 'Titration' || selectedStudyType === 'Split-Night';

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
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'application/pdf', // .pdf
      'application/rtf', // .rtf
      'text/rtf' // .rtf alternative
    ];

    const allowedExtensions = ['.docx', '.doc', '.pdf', '.rtf'];
    const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      return 'Please upload a .pdf, .doc, .docx, or .rtf file only.';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 50MB.';
    }

    return null;
  };

  const extractFileContent = async (file: File): Promise<string> => {
    const fileExtension = file.name.toLowerCase().split('.').pop();
    
    switch (fileExtension) {
      case 'docx':
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      
      case 'pdf':
        // For PDF files, we'll pass the file directly and let the backend handle extraction
        return `[PDF FILE: ${file.name}]`;
      
      case 'doc':
        // For .doc files, attempt basic extraction (limited support)
        const text = await file.text();
        return text;
      
      case 'rtf':
        // For RTF files, extract plain text
        const rtfText = await file.text();
        return rtfText.replace(/\\[a-z]+\d*\s?/gi, '').replace(/[{}]/g, '');
      
      default:
        throw new Error('Unsupported file format');
    }
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    
    // Validate split-night requirements
    if (isSplitNight && files.length !== 2) {
      setError('Split-night study requires both diagnostic and therapeutic files.');
      return;
    }

    // Validate mask selection for titration studies
    if (needsMaskSelection && !maskData) {
      setError('Please select mask type and size for titration study.');
      return;
    }

    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      let fileContent = '';
      
      if (isSplitNight) {
        // For split-night, combine both files
        const diagnosticFile = files.find(f => f.type === 'diagnostic');
        const therapeuticFile = files.find(f => f.type === 'therapeutic');
        
        if (!diagnosticFile || !therapeuticFile) {
          throw new Error('Both diagnostic and therapeutic files are required for split-night study.');
        }

        const diagnosticContent = await extractFileContent(diagnosticFile.file);
        const therapeuticContent = await extractFileContent(therapeuticFile.file);
        
        fileContent = `DIAGNOSTIC PORTION:\n${diagnosticContent}\n\nTHERAPEUTIC PORTION:\n${therapeuticContent}`;
      } else {
        // Single file processing
        fileContent = await extractFileContent(files[0].file);
      }
      
      setProgress(30);

      // Call the Supabase edge function
      const response = await fetch('https://rotdapktuwxwvylhnfry.functions.supabase.co/process-sleep-study', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileContent,
          studyType: selectedStudyType,
          maskData: needsMaskSelection ? maskData : null
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

    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFilesAdded(droppedFiles);
    }
  }, [isSplitNight]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFilesAdded(selectedFiles);
    }
  };

  const handleFilesAdded = (newFiles: File[]) => {
    // Validate file count
    if (!isSplitNight && newFiles.length > 1) {
      setError('Please upload only one file for this study type.');
      return;
    }

    if (isSplitNight && newFiles.length > 2) {
      setError('Split-night study accepts maximum 2 files.');
      return;
    }

    // Validate each file
    for (const file of newFiles) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // Add files with appropriate types
    const uploadedFiles: UploadedFile[] = newFiles.map((file, index) => ({
      file,
      type: isSplitNight ? (index === 0 ? 'diagnostic' : 'therapeutic') : 'diagnostic'
    }));

    setFiles(uploadedFiles);
    setError(null);
    onFileUploaded?.(true);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFileUploaded?.(newFiles.length > 0);
  };

  const resetUpload = () => {
    setFiles([]);
    setProcessing(false);
    setProgress(0);
    setError(null);
    setSuccess(false);
    setMaskData(null);
    onFileUploaded?.(false);
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return <File className="h-6 w-6 text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'rtf':
        return <FileType className="h-6 w-6 text-green-500" />;
      default:
        return <FileText className="h-6 w-6 text-muted-foreground" />;
    }
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
        {files.length === 0 && !processing && !success && (
          <CardContent className="p-8">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-500 overflow-hidden group ${
                dragActive 
                  ? 'border-primary bg-primary/5 scale-105 shadow-[var(--shadow-glow)] animate-pulse-glow' 
                  : 'border-border hover:border-primary/50 hover:bg-primary/2'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
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
                  {isSplitNight ? 'Drop your diagnostic and therapeutic files here' : 'Drop your sleep study file here'}
                </h3>
                <p className="text-muted-foreground mb-2">
                  Supported formats: PDF, DOC, DOCX, RTF
                </p>
                {isSplitNight && (
                  <p className="text-sm text-muted-foreground/80 mb-6">
                    Upload 2 files: diagnostic portion first, then therapeutic portion
                  </p>
                )}
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={handleFileButtonClick}
                  className="shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-button-hover)] transition-all duration-300 hover:scale-105"
                >
                  <FileText className="h-5 w-5 mr-3" />
                  Select {isSplitNight ? 'Files' : 'File'}
                </Button>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.rtf"
              multiple={isSplitNight}
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
          </CardContent>
        )}

        {files.length > 0 && !processing && !success && (
          <CardContent className="p-8 space-y-6">
            {/* Files List */}
            <div className="space-y-4">
              {files.map((uploadedFile, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border">
                  {getFileIcon(uploadedFile.file.name)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{uploadedFile.file.name}</h4>
                      {isSplitNight && (
                        <Badge variant={uploadedFile.type === 'diagnostic' ? 'default' : 'secondary'}>
                          {uploadedFile.type}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Mask Selection for Titration Studies */}
            {needsMaskSelection && (
              <MaskSelector onMaskDataChange={setMaskData} />
            )}

            {/* Process Button */}
            <Button 
              onClick={processFiles} 
              className="w-full shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-all duration-300"
              disabled={!selectedStudyType || (needsMaskSelection && !maskData)}
              size="lg"
            >
              <Brain className="h-5 w-5 mr-3" />
              Process {isSplitNight ? 'Studies' : 'Study'}
            </Button>

            {!selectedStudyType && (
              <Alert className="border-warning/50 bg-warning/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-warning">
                  Please select a study type first to enable processing
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}

        {processing && (
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="relative p-4 rounded-2xl bg-primary/10 border border-primary/20 flex-shrink-0">
                <Brain className="h-8 w-8 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 rounded-2xl animate-ping"></div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">Processing Sleep Study</h3>
                  <p className="text-muted-foreground">AI is analyzing your sleep study data using medical-grade extraction...</p>
                </div>
                
                <div className="space-y-3">
                  <Progress value={progress} className="h-3 bg-muted" />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <p className="text-sm text-muted-foreground">
                      {progress < 25 ? 'Extracting document content...' :
                       progress < 50 ? 'Analyzing clinical parameters...' :
                       progress < 75 ? 'Calculating sleep metrics...' :
                       'Generating medical report...'}
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
              <div className="relative p-4 rounded-2xl bg-success/10 border border-success/20 flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-success" />
                <div className="absolute inset-0 bg-success/20 rounded-2xl animate-ping"></div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">Medical Analysis Complete!</h3>
                  <p className="text-muted-foreground">Your professional sleep study report is ready for review</p>
                </div>
                
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