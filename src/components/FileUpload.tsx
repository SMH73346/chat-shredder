import { useCallback, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(f => f.name.endsWith('.txt') || f.name.endsWith('.zip'));
    
    if (validFile) {
      onFileSelect(validFile);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        isDragging && 'border-primary ring-2 ring-primary/20'
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="p-12 text-center">
        <div className={cn(
          'mx-auto w-16 h-16 rounded-full bg-whatsapp-light flex items-center justify-center mb-4 transition-transform',
          isDragging && 'scale-110'
        )}>
          {isDragging ? (
            <FileText className="w-8 h-8 text-primary" />
          ) : (
            <Upload className="w-8 h-8 text-primary" />
          )}
        </div>
        
        <h3 className="text-xl font-semibold mb-2">
          {isDragging ? 'Drop your file here' : 'Upload WhatsApp Chat'}
        </h3>
        
        <p className="text-muted-foreground mb-6">
          Drag and drop or click to select a .txt or .zip file
        </p>
        
        <label className="inline-block">
          <input
            type="file"
            accept=".txt,.zip"
            onChange={handleFileInput}
            disabled={isProcessing}
            className="hidden"
          />
          <span className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Upload className="w-4 h-4" />
            Select File
          </span>
        </label>
      </div>
    </Card>
  );
}
