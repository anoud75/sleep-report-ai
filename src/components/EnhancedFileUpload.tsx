import { useState, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertCircle, X, Brain, File, FileType } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import mammoth from 'mammoth';
import { ClinicalDataEntry } from './ClinicalDataEntry';

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
  const diagnosticInputRef = useRef<HTMLInputElement>(null);
  const therapeuticInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [clinicalData, setClinicalData] = useState<any>(null);
  const { toast } = useToast();

  const isSplitNight = selectedStudyType === 'Split-Night';
  const needsClinicalDataEntry = selectedStudyType === 'Titration' || 
    (selectedStudyType === 'Split-Night' && files.some(f => f.type === 'therapeutic'));

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

    // Validate clinical data for titration studies
    if ((selectedStudyType === 'Titration' || 
         (selectedStudyType === 'Split-Night' && files.some(f => f.type === 'therapeutic'))) && !clinicalData) {
      setError('Please complete required clinical data entry for this study type.');
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
          clinicalData: (selectedStudyType === 'Titration' || 
                        (selectedStudyType === 'Split-Night' && files.some(f => f.type === 'therapeutic'))) ? clinicalData : null
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

  const handleDrop = useCallback((e: React.DragEvent, fileType?: 'diagnostic' | 'therapeutic') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (fileType && isSplitNight) {
        handleFilesAdded(droppedFiles, fileType);
      } else {
        handleFilesAdded(droppedFiles);
      }
    }
  }, [isSplitNight]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fileType?: 'diagnostic' | 'therapeutic') => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (fileType && isSplitNight) {
        handleFilesAdded(selectedFiles, fileType);
      } else {
        handleFilesAdded(selectedFiles);
      }
    }
  };

  const handleFilesAdded = (newFiles: File[], fileType?: 'diagnostic' | 'therapeutic') => {
    // Validate file count
    if (!isSplitNight && newFiles.length > 1) {
      setError('Please upload only one file for this study type.');
      return;
    }

    if (newFiles.length !== 1) {
      setError('Please upload one file at a time.');
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

    if (isSplitNight && fileType) {
      // Replace existing file of the same type or add new one
      const existingFiles = files.filter(f => f.type !== fileType);
      const newFile: UploadedFile = {
        file: newFiles[0],
        type: fileType
      };
      setFiles([...existingFiles, newFile]);
    } else {
      // Single file upload
      const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
        file,
        type: 'diagnostic'
      }));
      setFiles(uploadedFiles);
    }

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
    setClinicalData(null);
    onFileUploaded?.(false);
  };

  const handleFileButtonClick = (fileType?: 'diagnostic' | 'therapeutic') => {
    if (fileType === 'diagnostic') {
      diagnosticInputRef.current?.click();
    } else if (fileType === 'therapeutic') {
      therapeuticInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
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

      <div className={`medical-card transition-all duration-700 border-2 rounded-2xl bg-black/60 backdrop-blur-xl ${
        dragActive ? 'border-primary bg-primary/10 shadow-[var(--shadow-glow)] scale-[1.02]' : 
        success ? 'border-success bg-success/10 shadow-[var(--shadow-trust)]' :
        'border-white/20 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]'
      }`}>
        {((files.length === 0) || (isSplitNight && files.length <= 2)) && !processing && !success && (
          <div className="p-8">
            {isSplitNight ? (
              // Split Night Protocol - Two Upload Areas
                <div className="space-y-6">
                  <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2 font-jakarta text-white glow-text">Split Night Protocol</h3>
                    <p className="text-white/70 font-inter">Upload both diagnostic and therapeutic files</p>
                  </div>
                  
                  {/* Show uploaded files if any */}
                  {files.length > 0 && (
                    <div className="space-y-4 mb-6">
                      {files.map((uploadedFile, index) => (
                        <div key={index} className="medical-card flex items-center gap-4 p-4 rounded-xl">
                          {getFileIcon(uploadedFile.file.name)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium font-inter">{uploadedFile.file.name}</h4>
                              <Badge variant={uploadedFile.type === 'diagnostic' ? 'default' : 'secondary'}>
                                {uploadedFile.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-white/60">
                              {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="haptic-feedback">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Diagnostic File Upload */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        files.some(f => f.type === 'diagnostic') 
                          ? 'bg-success text-success-foreground' 
                          : 'bg-primary text-primary-foreground'
                      }`}>
                        {files.some(f => f.type === 'diagnostic') ? '✓' : '1'}
                      </div>
                      <h4 className="font-semibold text-white font-inter">Diagnostic Part</h4>
                    </div>
                    {!files.some(f => f.type === 'diagnostic') ? (
                        <div
                          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-500 cursor-pointer haptic-feedback ${
                            dragActive ? 'border-primary bg-primary/10' : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={(e) => handleDrop(e, 'diagnostic')}
                          onClick={() => handleFileButtonClick('diagnostic')}
                        >
                          <Upload className="mx-auto h-8 w-8 mb-2 text-trust protocol-icon" />
                          <p className="text-sm font-medium mb-1 font-inter">Drop diagnostic file here</p>
                          <p className="text-xs text-white/60">or click to select</p>
                        </div>
                    ) : (
                      <div className="p-6 bg-success/10 border border-success/20 rounded-xl text-center">
                        <CheckCircle className="mx-auto h-8 w-8 mb-2 text-success" />
                        <p className="text-sm font-medium text-success">Diagnostic file uploaded</p>
                      </div>
                    )}
                  </div>

                  {/* Therapeutic File Upload */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        files.some(f => f.type === 'therapeutic') 
                          ? 'bg-success text-success-foreground' 
                          : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {files.some(f => f.type === 'therapeutic') ? '✓' : '2'}
                      </div>
                      <h4 className="font-semibold text-white font-inter">Therapeutic Part</h4>
                    </div>
                    {!files.some(f => f.type === 'therapeutic') ? (
                        <div
                          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-500 cursor-pointer haptic-feedback ${
                            dragActive ? 'border-primary bg-primary/10' : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={(e) => handleDrop(e, 'therapeutic')}
                          onClick={() => handleFileButtonClick('therapeutic')}
                        >
                          <Upload className="mx-auto h-8 w-8 mb-2 text-success protocol-icon" />
                          <p className="text-sm font-medium mb-1 font-inter">Drop therapeutic file here</p>
                          <p className="text-xs text-white/60">or click to select</p>
                        </div>
                    ) : (
                      <div className="p-6 bg-success/10 border border-success/20 rounded-xl text-center">
                        <CheckCircle className="mx-auto h-8 w-8 mb-2 text-success" />
                        <p className="text-sm font-medium text-success">Therapeutic file uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Clinical Data Entry for Split Night */}
                {files.some(f => f.type === 'therapeutic') && (
                  <ClinicalDataEntry onDataChange={setClinicalData} studyType={selectedStudyType} />
                )}
                
                {/* Process Button for Split Night */}
                  <Button 
                    onClick={processFiles} 
                    className="luxury-button haptic-feedback w-full text-lg font-inter tracking-wide"
                    disabled={!selectedStudyType || !files.some(f => f.type === 'diagnostic') || !files.some(f => f.type === 'therapeutic') || !clinicalData}
                    size="lg"
                  >
                    <Brain className="h-5 w-5 mr-3 protocol-icon" />
                    Process Studies
                  </Button>
                
                <div className="text-center text-sm text-white/60 font-inter">
                  Supported formats: PDF, DOC, DOCX, RTF (Max 50MB each)
                </div>
              </div>
            ) : (
              // Single File Upload
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-700 overflow-hidden group ${
                  dragActive 
                    ? 'border-primary bg-primary/10 scale-105 shadow-[var(--shadow-glow)] animate-pulse-glow backdrop-blur-xl' 
                    : 'border-white/20 bg-black/40 hover:border-primary/50 hover:bg-black/60 backdrop-blur-sm'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer bg-[length:200%_100%]"></div>
                
                <div className="relative z-10 animate-fade-in-up">
                  <div className="relative mb-6">
                    <Upload className={`mx-auto h-16 w-16 mb-4 transition-all duration-500 protocol-icon ${
                      dragActive ? 'text-primary scale-110 animate-float' : 'text-white/60 group-hover:text-primary group-hover:scale-110'
                    }`} />
                    {dragActive && (
                      <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                    )}
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-3 font-jakarta transition-colors duration-300 ${
                    dragActive ? 'text-primary glow-text' : 'text-white'
                  }`}>
                    Drop your sleep study file here
                  </h3>
                  <p className="text-white/70 mb-6 font-inter">
                    Supported formats: PDF, DOC, DOCX, RTF
                  </p>
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={() => handleFileButtonClick()}
                    className="luxury-button haptic-feedback font-inter tracking-wide"
                  >
                    <FileText className="h-5 w-5 mr-3" />
                    Select File
                  </Button>
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.rtf"
              multiple={false}
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            
            {/* Hidden inputs for split night specific uploads */}
            <input
              ref={diagnosticInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.rtf"
              onChange={(e) => handleFileSelect(e, 'diagnostic')}
              className="hidden"
              id="diagnostic-upload"
            />
            <input
              ref={therapeuticInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.rtf"
              onChange={(e) => handleFileSelect(e, 'therapeutic')}
              className="hidden"
              id="therapeutic-upload"
            />
          </div>
        )}

        {files.length > 0 && !isSplitNight && !processing && !success && (
          <div className="p-8 space-y-6 border-t border-white/10">
            {/* Files List */}
            <div className="space-y-4">
              {files.map((uploadedFile, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border">
                  {getFileIcon(uploadedFile.file.name)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white font-inter">{uploadedFile.file.name}</h4>
                      {isSplitNight && (
                        <Badge variant={uploadedFile.type === 'diagnostic' ? 'default' : 'secondary'}>
                          {uploadedFile.type}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-white/60 font-inter">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Clinical Data Entry for Titration Studies */}
            {needsClinicalDataEntry && (
              <ClinicalDataEntry onDataChange={setClinicalData} studyType={selectedStudyType} />
            )}

            {/* Process Button */}
            <Button 
              onClick={processFiles} 
              className="w-full shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-all duration-300"
              disabled={!selectedStudyType || 
                       (selectedStudyType === 'Titration' && !clinicalData) ||
                       (selectedStudyType === 'Split-Night' && (!files.some(f => f.type === 'diagnostic') || !files.some(f => f.type === 'therapeutic') || !clinicalData))}
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
          </div>
        )}

        {processing && (
          <div className="p-8 border-t border-white/10">
            <div className="flex items-start gap-6">
              <div className="relative p-4 rounded-2xl bg-primary/10 border border-primary/20 flex-shrink-0">
                <Brain className="h-8 w-8 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 rounded-2xl animate-ping"></div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white font-jakarta">Processing Sleep Study</h3>
                  <p className="text-white/70 font-inter">AI is analyzing your sleep study data using medical-grade extraction...</p>
                </div>
                
                <div className="space-y-3">
                  <Progress value={progress} className="h-3 bg-muted" />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <p className="text-sm text-white/70 font-inter">
                      {progress < 25 ? 'Extracting document content...' :
                       progress < 50 ? 'Analyzing clinical parameters...' :
                       progress < 75 ? 'Calculating sleep metrics...' :
                       'Generating medical report...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="p-8 border-t border-white/10">
            <div className="flex items-start gap-6">
              <div className="relative p-4 rounded-2xl bg-success/10 border border-success/20 flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-success" />
                <div className="absolute inset-0 bg-success/20 rounded-2xl animate-ping"></div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white font-jakarta">Medical Analysis Complete!</h3>
                  <p className="text-white/70 font-inter">Your professional sleep study report is ready for review</p>
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
          </div>
        )}
      </div>
    </div>
  );
};