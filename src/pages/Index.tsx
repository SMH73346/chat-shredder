import { useState } from 'react';
import { MessageSquare, Info } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { MessagePreview } from '@/components/MessagePreview';
import { MessageStats } from '@/components/MessageStats';
import { StatisticsDashboard } from '@/components/StatisticsDashboard';
import { ExportControls } from '@/components/ExportControls';
import { processUploadedFile, exportMessages } from '@/lib/fileProcessor';
import { parseWhatsAppChat, getMessageStats, ParsedMessage } from '@/lib/whatsappParser';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const Index = () => {
  const [messages, setMessages] = useState<ParsedMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [excludedSenders, setExcludedSenders] = useState('');
  const [excludedTexts, setExcludedTexts] = useState('');
  const [totalParsed, setTotalParsed] = useState(0);
  const [mediaFiles, setMediaFiles] = useState<Map<string, Blob>>(new Map());
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setMessages([]);
    
    try {
      toast({
        title: 'Processing file...',
        description: 'Parsing your WhatsApp chat export',
      });

      const { chatContent, mediaFiles: extractedMedia } = await processUploadedFile(file);
      
      // Parse exclusion lists
      const sendersList = excludedSenders
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      const textsList = excludedTexts
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      // First parse without filters to get total count
      const allMessages = parseWhatsAppChat(chatContent);
      setTotalParsed(allMessages.length);
      
      // Then parse with filters
      const parsedMessages = parseWhatsAppChat(chatContent, sendersList, textsList);

      if (parsedMessages.length === 0) {
        toast({
          title: 'No messages found',
          description: 'The file appears to be empty or in an unsupported format',
          variant: 'destructive',
        });
        return;
      }

      setMessages(parsedMessages);
      setMediaFiles(extractedMedia);
      
      const mediaCount = parsedMessages.reduce((acc, msg) => acc + (msg.mediaFiles?.length || 0), 0);
      
      toast({
        title: 'Success!',
        description: `Parsed ${parsedMessages.length} messages with ${mediaCount} media files`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process file',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async (format: 'txt' | 'json') => {
    try {
      toast({
        title: 'Exporting...',
        description: 'Creating your download package with media files',
      });

      await exportMessages(messages, format, mediaFiles);

      toast({
        title: 'Export complete!',
        description: 'Your messages and media have been downloaded',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export messages',
        variant: 'destructive',
      });
    }
  };

  const stats = messages.length > 0 ? getMessageStats(messages, totalParsed) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-whatsapp-light mb-4">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <h1 className="text-4xl font-bold">WhatsApp Chat Parser</h1>
            <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Info className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>How to Use WhatsApp Chat Parser</DialogTitle>
                  <DialogDescription>
                    Follow these steps to parse and export your WhatsApp chats with media files
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 text-sm">
                  <div>
                    <h3 className="font-semibold text-base mb-2">Step 1: Export WhatsApp Chat</h3>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Open WhatsApp and go to the chat you want to export</li>
                      <li>Tap the three dots (⋮) menu → More → Export chat</li>
                      <li><strong>Important:</strong> Select "Include Media" to export images, videos, and audio</li>
                      <li>Save the .zip file to your device</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-base mb-2">Step 2: Configure Filters (Optional)</h3>
                    <p className="text-muted-foreground mb-2">Before uploading, you can exclude specific messages:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Exclude senders:</strong> Enter names/numbers separated by commas (e.g., "System, +1 234 5678")</li>
                      <li><strong>Exclude text:</strong> Filter out messages containing specific phrases (e.g., "joined using a group link")</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-base mb-2">Step 3: Upload and Process</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Click the upload area or drag & drop your .zip or .txt file</li>
                      <li>The app will automatically parse messages and extract media files</li>
                      <li>View message statistics, sender breakdown, and media previews</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-base mb-2">Step 4: Preview and Export</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Preview all messages with thumbnail previews of images and videos</li>
                      <li>Click "Export as TXT" or "Export as JSON" to download</li>
                      <li>Each message will be saved in its own folder with associated media files</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold text-base mb-2">🔒 Privacy & Security</h3>
                    <p className="text-muted-foreground">
                      All processing happens locally in your browser. Your chats and media files never leave your device or get uploaded to any server.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your WhatsApp chat export and split messages into individual files. 
            Fast, secure, and completely private - all processing happens in your browser.
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="excludedSenders" className="block text-sm font-medium mb-2">
                Exclude messages from senders (comma-separated)
              </label>
              <input
                id="excludedSenders"
                type="text"
                value={excludedSenders}
                onChange={(e) => setExcludedSenders(e.target.value)}
                placeholder="e.g., +92 325 9011765, System"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isProcessing}
              />
            </div>
            <div>
              <label htmlFor="excludedTexts" className="block text-sm font-medium mb-2">
                Exclude messages containing (comma-separated)
              </label>
              <input
                id="excludedTexts"
                type="text"
                value={excludedTexts}
                onChange={(e) => setExcludedTexts(e.target.value)}
                placeholder="e.g., joined using a group link, media omitted"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>

        <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />

        {stats && (
          <MessageStats
            totalMessages={stats.totalMessages}
            uniqueSenders={stats.uniqueSenders}
            topSenders={stats.topSenders}
            excludedCount={stats.excludedCount}
          />
        )}

        {messages.length > 0 && (
          <>
            <StatisticsDashboard messages={messages} />
            <MessagePreview messages={messages} mediaFiles={mediaFiles} />
            <ExportControls onExport={handleExport} disabled={messages.length === 0} />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
