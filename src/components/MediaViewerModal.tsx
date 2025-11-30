import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface MediaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaFiles: Map<string, Blob>;
  initialFilename: string;
}

export function MediaViewerModal({ isOpen, onClose, mediaFiles, initialFilename }: MediaViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [objectUrls, setObjectUrls] = useState<Map<string, string>>(new Map());
  
  const mediaEntries = Array.from(mediaFiles.entries());
  const currentMedia = mediaEntries[currentIndex];

  useEffect(() => {
    // Find initial index
    const index = mediaEntries.findIndex(([filename]) => filename === initialFilename);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [initialFilename]);

  useEffect(() => {
    // Create object URLs for all media files
    const urls = new Map<string, string>();
    mediaEntries.forEach(([filename, blob]) => {
      urls.set(filename, URL.createObjectURL(blob));
    });
    setObjectUrls(urls);

    return () => {
      // Cleanup all URLs
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [mediaFiles]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaEntries.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < mediaEntries.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  if (!currentMedia) return null;

  const [filename, blob] = currentMedia;
  const objectUrl = objectUrls.get(filename);
  const fileType = blob.type.split('/')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-background/95 backdrop-blur-sm">
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex-1">
              <p className="text-sm font-medium truncate">{filename}</p>
              <p className="text-xs text-muted-foreground">
                {currentIndex + 1} of {mediaEntries.length}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="ml-4"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Media Content */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            {fileType === 'image' && objectUrl && (
              <img
                src={objectUrl}
                alt={filename}
                className="max-w-full max-h-full object-contain"
              />
            )}
            {fileType === 'video' && objectUrl && (
              <video
                src={objectUrl}
                controls
                autoPlay
                className="max-w-full max-h-full"
              />
            )}
            {fileType === 'audio' && objectUrl && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-4xl">🎵</span>
                </div>
                <audio src={objectUrl} controls className="w-full max-w-md" />
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          {mediaEntries.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/80 hover:bg-background"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/80 hover:bg-background"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Keyboard Hints */}
          <div className="p-2 text-center text-xs text-muted-foreground border-t border-border">
            Use arrow keys to navigate • ESC to close
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}