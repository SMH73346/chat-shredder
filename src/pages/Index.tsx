import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { MessagePreview } from '@/components/MessagePreview';
import { MessageStats } from '@/components/MessageStats';
import { ExportControls } from '@/components/ExportControls';
import { processUploadedFile, exportMessages } from '@/lib/fileProcessor';
import { parseWhatsAppChat, getMessageStats, ParsedMessage } from '@/lib/whatsappParser';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [messages, setMessages] = useState<ParsedMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [excludedSenders, setExcludedSenders] = useState('');
  const [excludedTexts, setExcludedTexts] = useState('');
  const [totalParsed, setTotalParsed] = useState(0);
  const [mediaFiles, setMediaFiles] = useState<Map<string, Blob>>(new Map());
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
          <h1 className="text-4xl font-bold mb-3">WhatsApp Chat Parser</h1>
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
            <MessagePreview messages={messages} mediaFiles={mediaFiles} />
            <ExportControls onExport={handleExport} disabled={messages.length === 0} />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
