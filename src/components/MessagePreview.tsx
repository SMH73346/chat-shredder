import { ParsedMessage } from '@/lib/whatsappParser';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useState } from 'react';
import { FileImage, FileVideo, FileAudio, FileText } from 'lucide-react';
import { MediaViewerModal } from './MediaViewerModal';

interface MessagePreviewProps {
  messages: ParsedMessage[];
  mediaFiles: Map<string, Blob>;
}

interface MediaPreviewProps {
  filename: string;
  blob: Blob;
  onClick: () => void;
}

function MediaPreview({ filename, blob, onClick }: MediaPreviewProps) {
  const [objectUrl, setObjectUrl] = useState<string>('');
  const fileType = blob.type.split('/')[0];

  useEffect(() => {
    const url = URL.createObjectURL(blob);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  if (fileType === 'image') {
    return (
      <img 
        src={objectUrl} 
        alt={filename}
        className="w-16 h-16 object-cover rounded border border-border cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onClick}
      />
    );
  }

  if (fileType === 'video') {
    return (
      <video 
        src={objectUrl}
        className="w-16 h-16 object-cover rounded border border-border cursor-pointer hover:opacity-80 transition-opacity"
        muted
        preload="metadata"
        onClick={onClick}
      />
    );
  }

  if (fileType === 'audio') {
    return (
      <div 
        className="w-16 h-16 flex items-center justify-center rounded border border-border bg-muted cursor-pointer hover:bg-muted/80 transition-colors"
        onClick={onClick}
      >
        <FileAudio className="w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-16 h-16 flex items-center justify-center rounded border border-border bg-muted">
      <FileText className="w-6 h-6 text-muted-foreground" />
    </div>
  );
}

export function MessagePreview({ messages, mediaFiles }: MessagePreviewProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string>('');

  if (messages.length === 0) return null;

  const handleMediaClick = (filename: string) => {
    setSelectedMedia(filename);
    setViewerOpen(true);
  };

  return (
    <>
      <Card className="mt-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Message Preview</h2>
          <p className="text-muted-foreground mb-6">
            Found {messages.length} messages
          </p>
          
          <ScrollArea className="h-[400px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead className="w-[100px]">Time</TableHead>
                  <TableHead className="w-[200px]">Sender</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((msg, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{msg.date}</TableCell>
                    <TableCell>{msg.time}</TableCell>
                    <TableCell className="font-semibold">{msg.sender}</TableCell>
                    <TableCell>
                      <div className="truncate max-w-md">{msg.message}</div>
                      {msg.mediaFiles && msg.mediaFiles.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {msg.mediaFiles.map((filename, idx) => {
                            const blob = mediaFiles.get(filename);
                            return blob ? (
                              <MediaPreview 
                                key={idx} 
                                filename={filename} 
                                blob={blob}
                                onClick={() => handleMediaClick(filename)}
                              />
                            ) : (
                              <div key={idx} className="w-16 h-16 flex items-center justify-center rounded border border-border bg-muted">
                                <FileImage className="w-6 h-6 text-muted-foreground" />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </Card>

      <MediaViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        mediaFiles={mediaFiles}
        initialFilename={selectedMedia}
      />
    </>
  );
}
