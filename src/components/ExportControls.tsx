import { useState } from 'react';
import { Download, FileText, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ExportControlsProps {
  onExport: (format: 'txt' | 'json') => void;
  disabled: boolean;
}

export function ExportControls({ onExport, disabled }: ExportControlsProps) {
  const [selectedFormat, setSelectedFormat] = useState<'txt' | 'json'>('txt');

  return (
    <Card className="p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4">Export Options</h2>
      <p className="text-muted-foreground mb-6">
        Choose your preferred export format
      </p>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setSelectedFormat('txt')}
          className={cn(
            'flex-1 p-4 rounded-lg border-2 transition-all',
            selectedFormat === 'txt'
              ? 'border-primary bg-whatsapp-light'
              : 'border-border hover:border-primary/50'
          )}
        >
          <FileText className={cn(
            'w-8 h-8 mx-auto mb-2',
            selectedFormat === 'txt' ? 'text-primary' : 'text-muted-foreground'
          )} />
          <p className="font-semibold">Text Format</p>
          <p className="text-sm text-muted-foreground mt-1">
            Plain text files with metadata
          </p>
        </button>

        <button
          onClick={() => setSelectedFormat('json')}
          className={cn(
            'flex-1 p-4 rounded-lg border-2 transition-all',
            selectedFormat === 'json'
              ? 'border-primary bg-whatsapp-light'
              : 'border-border hover:border-primary/50'
          )}
        >
          <FileJson className={cn(
            'w-8 h-8 mx-auto mb-2',
            selectedFormat === 'json' ? 'text-primary' : 'text-muted-foreground'
          )} />
          <p className="font-semibold">JSON Format</p>
          <p className="text-sm text-muted-foreground mt-1">
            Structured data format
          </p>
        </button>
      </div>

      <Button
        onClick={() => onExport(selectedFormat)}
        disabled={disabled}
        size="lg"
        className="w-full"
      >
        <Download className="w-4 h-4 mr-2" />
        Download All as ZIP
      </Button>
    </Card>
  );
}
