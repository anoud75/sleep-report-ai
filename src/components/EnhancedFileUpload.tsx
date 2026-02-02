import { useState, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertCircle, X, Brain, File, FileType, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import mammoth from 'mammoth';
import { ClinicalDataEntry } from './ClinicalDataEntry';
import { PatientCommentsSelector } from './PatientCommentsSelector';
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
export const EnhancedFileUpload = ({
  onFileProcessed,
  selectedStudyType,
  onFileUploaded
}: EnhancedFileUploadProps) => {
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
  const [selectedPatientComments, setSelectedPatientComments] = useState<string[]>([]);
  const {
    toast
  } = useToast();
  const isSplitNight = selectedStudyType === 'Split-Night';
  const needsClinicalDataEntry = selectedStudyType === 'Titration' || selectedStudyType === 'Split-Night' && files.some(f => f.type === 'therapeutic');
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
    const allowedTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // .docx
    'application/msword',
    // .doc
    'application/pdf',
    // .pdf
    'application/rtf',
    // .rtf
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
  const smartTruncate = (content: string, maxLength: number): string => {
    if (content.length <= maxLength) return content;

    // Try to preserve important sections by finding them first
    const importantSections = [{
      name: 'Oximetry',
      pattern: /(Oximetry|Oxygen|SpO2|Desaturation)[\s\S]{0,5000}/gi
    }, {
      name: 'Sleep Architecture',
      pattern: /(Sleep\s+Architecture|Stage\s+distribution)[\s\S]{0,3000}/gi
    }, {
      name: 'Respiratory Events',
      pattern: /(Respiratory\s+Events|AHI|Apnea)[\s\S]{0,3000}/gi
    }, {
      name: 'Heart Rate',
      pattern: /(Heart\s+Rate|HR|BPM)[\s\S]{0,2000}/gi
    }];
    let preservedContent = '';
    let remainingContent = content;

    // Extract important sections
    for (const section of importantSections) {
      const matches = remainingContent.match(section.pattern);
      if (matches && matches[0]) {
        preservedContent += matches[0] + '\n\n';
        remainingContent = remainingContent.replace(matches[0], '');
      }
    }

    // Fill the rest with content from the beginning
    const remainingSpace = maxLength - preservedContent.length;
    if (remainingSpace > 0) {
      preservedContent = content.substring(0, remainingSpace) + '\n\n' + preservedContent;
    }
    return preservedContent.substring(0, maxLength);
  };
  const extractRtfText = (rtfContent: string): string => {
    // Enhanced RTF to plain text converter
    let text = rtfContent;
    
    // Remove RTF header/font tables/color tables (enclosed in groups at start)
    text = text.replace(/^\{\\rtf1[\s\S]*?(?=\\pard|\\par\s)/i, '');
    
    // Handle special characters first (hex codes like \'xx)
    text = text.replace(/\\'([0-9a-fA-F]{2})/g, (match, hex) => {
      const code = parseInt(hex, 16);
      return String.fromCharCode(code);
    });
    
    // Handle Unicode characters \uN?
    text = text.replace(/\\u([0-9]+)\??/g, (match, code) => {
      return String.fromCharCode(parseInt(code));
    });
    
    // Handle common RTF escape sequences
    text = text.replace(/\\par\b/g, '\n');
    text = text.replace(/\\line\b/g, '\n');
    text = text.replace(/\\tab\b/g, '\t');
    text = text.replace(/\\\n/g, '\n');
    text = text.replace(/\\~/g, ' '); // Non-breaking space
    text = text.replace(/\\_/g, '-'); // Non-breaking hyphen
    text = text.replace(/\\-/g, ''); // Optional hyphen
    text = text.replace(/\\\\/g, '\\');
    text = text.replace(/\\{/g, '{');
    text = text.replace(/\\}/g, '}');
    
    // Remove font/style commands but preserve text
    text = text.replace(/\\f\d+\s?/g, '');
    text = text.replace(/\\fs\d+\s?/g, '');
    text = text.replace(/\\cf\d+\s?/g, '');
    text = text.replace(/\\cb\d+\s?/g, '');
    text = text.replace(/\\b\d?\s?/g, '');
    text = text.replace(/\\i\d?\s?/g, '');
    text = text.replace(/\\ul\d?\s?/g, '');
    text = text.replace(/\\strike\d?\s?/g, '');
    
    // Remove other common RTF commands
    text = text.replace(/\\[a-z]+\d*\s?/gi, '');
    
    // Remove remaining control groups but try to preserve content
    let depth = 0;
    let result = '';
    let inGroup = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '{') {
        depth++;
        inGroup = true;
      } else if (char === '}') {
        depth--;
        if (depth === 0) inGroup = false;
      } else if (depth <= 1) {
        // Only include text from the main body (depth 0 or 1)
        result += char;
      }
    }
    
    // If our parsing failed to extract much, fallback to simpler approach
    if (result.trim().length < 100 && rtfContent.length > 500) {
      result = rtfContent
        .replace(/\{[^{}]*\}/g, '') // Remove simple groups
        .replace(/\\[a-z]+\d*\s?/gi, '') // Remove commands
        .replace(/[{}]/g, ''); // Remove remaining braces
    }
    
    // Clean up whitespace
    result = result
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
    
    return result;
  };

  const extractFileContent = async (file: File): Promise<string> => {
    const fileExtension = file.name.toLowerCase().split('.').pop();
    
    try {
      switch (fileExtension) {
        case 'docx':
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({
            arrayBuffer
          });
          if (!result.value || result.value.trim().length === 0) {
            throw new Error('No text content could be extracted from DOCX file');
          }
          return result.value;
        case 'pdf':
          // For PDF files, we'll pass the file directly and let the backend handle extraction
          return `[PDF FILE: ${file.name}]`;
        case 'doc':
          // For .doc files, attempt basic extraction (limited support)
          const docText = await file.text();
          if (!docText || docText.trim().length === 0) {
            throw new Error('No text content could be extracted from DOC file');
          }
          return docText;
        case 'rtf':
          // For RTF files, use enhanced extraction
          const rtfContent = await file.text();
          const extractedText = extractRtfText(rtfContent);
          if (!extractedText || extractedText.trim().length < 50) {
            throw new Error('RTF file appears to be empty or could not be parsed. Please try converting to DOCX format.');
          }
          console.log('RTF extraction result:', {
            originalLength: rtfContent.length,
            extractedLength: extractedText.length,
            preview: extractedText.substring(0, 200)
          });
          return extractedText;
        default:
          throw new Error(`Unsupported file format: .${fileExtension}`);
      }
    } catch (err) {
      console.error('File extraction error:', err);
      throw err;
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
    if ((selectedStudyType === 'Titration' || selectedStudyType === 'Split-Night' && files.some(f => f.type === 'therapeutic')) && !clinicalData) {
      setError('Please complete required clinical data entry for this study type.');
      return;
    }
    setProcessing(true);
    setProgress(0);
    setError(null);
    try {
      let fileContent = '';
      if (isSplitNight) {
        // For split-night, truncate each file separately to ensure both portions reach the AI
        const diagnosticFile = files.find(f => f.type === 'diagnostic');
        const therapeuticFile = files.find(f => f.type === 'therapeutic');
        if (!diagnosticFile || !therapeuticFile) {
          throw new Error('Both diagnostic and therapeutic files are required for split-night study.');
        }
        const diagnosticContent = await extractFileContent(diagnosticFile.file);
        const therapeuticContent = await extractFileContent(therapeuticFile.file);

        // Truncate each file to 40,000 characters to preserve important sections
        const truncatedDiagnostic = smartTruncate(diagnosticContent, 40000);
        const truncatedTherapeutic = smartTruncate(therapeuticContent, 40000);

        // Combine with clear markers for the edge function to parse
        fileContent = `=== OFF CPAP (DIAGNOSTIC PORTION) ===\n${truncatedDiagnostic}\n\n=== ON CPAP (THERAPEUTIC PORTION) ===\n${truncatedTherapeutic}`;
        console.log('Split-Night file processing:', {
          diagnosticOriginalLength: diagnosticContent.length,
          therapeuticOriginalLength: therapeuticContent.length,
          diagnosticTruncatedLength: truncatedDiagnostic.length,
          therapeuticTruncatedLength: truncatedTherapeutic.length,
          combinedLength: fileContent.length
        });
      } else {
        // Single file processing
        fileContent = await extractFileContent(files[0].file);
      }
      setProgress(30);

      // Call the Supabase edge function with raw text
      const response = await fetch('https://rotdapktuwxwvylhnfry.functions.supabase.co/process-sleep-study', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rawText: fileContent,
          studyType: selectedStudyType,
          clinicalData: clinicalData,
          patientComments: selectedPatientComments
        })
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
          description: "Sleep study report has been successfully analyzed."
        });
      }, 500);
    } catch (err) {
      console.error('Processing error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Processing Error",
        description: errorMessage,
        variant: "destructive"
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
      const uploadedFiles: UploadedFile[] = newFiles.map(file => ({
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
    setSelectedPatientComments([]);
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
  return <div className="space-y-6">
      {/* Error alert */}
      {error && <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>}

      <div className={`bg-background border-2 rounded-2xl transition-all duration-700 ${dragActive ? 'border-primary bg-primary/10 shadow-[var(--shadow-glow)] scale-[1.02]' : success ? 'border-success bg-success/10 shadow-[var(--shadow-trust)]' : 'border-border hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]'}`}>
        {(files.length === 0 || isSplitNight && files.length <= 2) && !processing && !success && <div className="p-8">
            {isSplitNight ?
        // Split Night Protocol - Two Upload Areas
        <div className="space-y-6">
                  <div className="text-center mb-6">
                   <h3 className="text-xl font-bold mb-2 font-jakarta text-foreground">Split Night Protocol</h3>
                     <p className="text-muted-foreground font-inter">Upload both diagnostic and therapeutic files</p>
                  </div>
                  
                  {/* Show uploaded files if any */}
                  {files.length > 0 && <div className="space-y-4 mb-6">
                      {files.map((uploadedFile, index) => <div key={index} className="medical-card flex items-center gap-4 p-4 rounded-xl">
                          {getFileIcon(uploadedFile.file.name)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium font-inter">{uploadedFile.file.name}</h4>
                              <Badge variant={uploadedFile.type === 'diagnostic' ? 'default' : 'secondary'}>
                                {uploadedFile.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="haptic-feedback">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>)}
                    </div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Diagnostic File Upload */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${files.some(f => f.type === 'diagnostic') ? 'bg-success text-success-foreground' : 'bg-primary text-primary-foreground'}`}>
                        {files.some(f => f.type === 'diagnostic') ? '✓' : '1'}
                      </div>
                      <h4 className="font-semibold text-foreground font-inter">Diagnostic Part</h4>
                    </div>
                    {!files.some(f => f.type === 'diagnostic') ? <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-500 cursor-pointer haptic-feedback ${dragActive ? 'border-primary bg-primary/10' : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={e => handleDrop(e, 'diagnostic')} onClick={() => handleFileButtonClick('diagnostic')}>
                          <Upload className="mx-auto h-8 w-8 mb-2 text-trust protocol-icon" />
                          <p className="text-sm font-medium mb-1 font-inter">Drop diagnostic file here</p>
                           <p className="text-xs text-muted-foreground">or click to select</p>
                        </div> : <div className="p-6 bg-success/10 border border-success/20 rounded-xl text-center">
                        <CheckCircle className="mx-auto h-8 w-8 mb-2 text-success" />
                        <p className="text-sm font-medium text-success">Diagnostic file uploaded</p>
                      </div>}
                  </div>

                  {/* Therapeutic File Upload */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${files.some(f => f.type === 'therapeutic') ? 'bg-success text-success-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                        {files.some(f => f.type === 'therapeutic') ? '✓' : '2'}
                      </div>
                      <h4 className="font-semibold text-foreground font-inter">Therapeutic Part</h4>
                    </div>
                    {!files.some(f => f.type === 'therapeutic') ? <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-500 cursor-pointer haptic-feedback ${dragActive ? 'border-primary bg-primary/10' : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={e => handleDrop(e, 'therapeutic')} onClick={() => handleFileButtonClick('therapeutic')}>
                          <Upload className="mx-auto h-8 w-8 mb-2 text-success protocol-icon" />
                          <p className="text-sm font-medium mb-1 font-inter">Drop therapeutic file here</p>
                          <p className="text-xs text-muted-foreground">or click to select</p>
                        </div> : <div className="p-6 bg-success/10 border border-success/20 rounded-xl text-center">
                        <CheckCircle className="mx-auto h-8 w-8 mb-2 text-success" />
                        <p className="text-sm font-medium text-success">Therapeutic file uploaded</p>
                      </div>}
                  </div>
                </div>
                
                {/* Clinical Data Entry for Split Night */}
                {files.some(f => f.type === 'therapeutic') && <ClinicalDataEntry onDataChange={setClinicalData} studyType={selectedStudyType} />}
                
                {/* Process Button for Split Night */}
                <Button onClick={processFiles} disabled={!selectedStudyType || !files.some(f => f.type === 'diagnostic') || !files.some(f => f.type === 'therapeutic') || !clinicalData} size="lg" className="w-full flex items-center justify-center gap-3">
                  <Brain className="h-5 w-5" />
                  Process Studies
                </Button>
                
                <div className="text-center text-sm text-muted-foreground font-inter">
                  Supported formats: PDF, DOC, DOCX, RTF (Max 50MB each)
                </div>
              </div> :
        // Single File Upload
        <div className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${dragActive ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                <div className="animate-fade-in-up">
                  <div className="mb-6">
                    <Upload className={`mx-auto h-16 w-16 mb-4 transition-all duration-300 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-3 font-jakarta transition-colors duration-300 ${dragActive ? 'text-primary' : 'text-foreground'}`}>
                    Drop your sleep study file here
                  </h3>
                  <p className="text-muted-foreground mb-6 font-inter">
                    Supported formats: PDF, DOC, DOCX, RTF
                  </p>
                  <div className="flex justify-center">
                    <Button variant="secondary" size="lg" onClick={() => handleFileButtonClick()} className="flex items-center justify-center gap-3">
                      <FileText className="h-5 w-5" />
                      Select File
                    </Button>
                  </div>
                </div>
              </div>}
            
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.rtf" multiple={false} onChange={handleFileSelect} className="hidden" id="file-upload" />
            
            {/* Hidden inputs for split night specific uploads */}
            <input ref={diagnosticInputRef} type="file" accept=".pdf,.doc,.docx,.rtf" onChange={e => handleFileSelect(e, 'diagnostic')} className="hidden" id="diagnostic-upload" />
            <input ref={therapeuticInputRef} type="file" accept=".pdf,.doc,.docx,.rtf" onChange={e => handleFileSelect(e, 'therapeutic')} className="hidden" id="therapeutic-upload" />
          </div>}

        {files.length > 0 && !isSplitNight && !processing && !success && <div className="p-8 space-y-6 border-t border-border">
            {/* Files List */}
            <div className="space-y-4">
              {files.map((uploadedFile, index) => <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border">
                  {getFileIcon(uploadedFile.file.name)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground font-inter">{uploadedFile.file.name}</h4>
                      {isSplitNight && <Badge variant={uploadedFile.type === 'diagnostic' ? 'default' : 'secondary'}>
                          {uploadedFile.type}
                        </Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground font-inter">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>)}
            </div>

            {/* Patient Comments - Available for ALL study types */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-foreground font-inter">Patient Comments</h4>
                <span className="text-xs text-muted-foreground">(Optional)</span>
              </div>
              <p className="text-sm text-muted-foreground font-inter">Select comments that apply to this patient before running analysis</p>
              <PatientCommentsSelector onCommentsChange={setSelectedPatientComments} />
              {selectedPatientComments.length > 0 && (
                <p className="text-sm text-success font-inter">{selectedPatientComments.length} comment{selectedPatientComments.length > 1 ? 's' : ''} selected</p>
              )}
            </div>

            {/* Clinical Data Entry for Titration Studies */}
            {needsClinicalDataEntry && <ClinicalDataEntry onDataChange={setClinicalData} studyType={selectedStudyType} />}

            {/* Process Button */}
            <Button onClick={processFiles} className="w-full shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-all duration-300" disabled={!selectedStudyType || selectedStudyType === 'Titration' && !clinicalData || selectedStudyType === 'Split-Night' && (!files.some(f => f.type === 'diagnostic') || !files.some(f => f.type === 'therapeutic') || !clinicalData)} size="lg">
              <Brain className="h-5 w-5 mr-3" />
              Process {isSplitNight ? 'Studies' : 'Study'}
            </Button>

            {!selectedStudyType && <Alert className="border-warning/50 bg-warning/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-warning">
                  Please select a study type first to enable processing
                </AlertDescription>
              </Alert>}
          </div>}

        {processing && <div className="p-8 border-t border-border">
            <div className="flex items-start gap-6">
              <div className="relative p-4 rounded-2xl bg-primary/10 border border-primary/20 flex-shrink-0">
                <Brain className="h-8 w-8 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 rounded-2xl animate-ping"></div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground font-jakarta">Processing Sleep Study</h3>
                  <p className="text-muted-foreground font-inter">AI is analyzing your sleep study data using medical-grade extraction...</p>
                </div>
                
                <div className="space-y-3">
                  <Progress value={progress} className="h-3 bg-muted" />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <p className="text-sm text-muted-foreground font-inter">
                      {progress < 25 ? 'Extracting document content...' : progress < 50 ? 'Analyzing clinical parameters...' : progress < 75 ? 'Calculating sleep metrics...' : 'Generating medical report...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>}

        {success && <div className="p-8 border-t border-border">
            <div className="flex items-start gap-6">
              <div className="relative p-4 rounded-2xl bg-success/10 border border-success/20 flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-success" />
                <div className="absolute inset-0 bg-success/20 rounded-2xl animate-ping"></div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground font-jakarta">Medical Analysis Complete!</h3>
                  <p className="text-muted-foreground font-inter">Your professional sleep study report is ready for review</p>
                </div>
                
                <Button onClick={resetUpload} variant="outline" size="lg" className="w-full border-success/30 text-success hover:bg-success/10">
                  <FileText className="h-5 w-5 mr-3" />
                  Process Another Report
                </Button>
              </div>
            </div>
          </div>}
      </div>
    </div>;
};