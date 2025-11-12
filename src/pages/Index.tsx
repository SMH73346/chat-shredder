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
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setMessages([]);
    
    try {
      toast({
        title: 'Processing file...',
        description: 'Parsing your WhatsApp chat export',
      });

      const content = await processUploadedFile(file);
      const parsedMessages = parseWhatsAppChat(content);

      if (parsedMessages.length === 0) {
        toast({
          title: 'No messages found',
          description: 'The file appears to be empty or in an unsupported format',
          variant: 'destructive',
        });
        return;
      }

      setMessages(parsedMessages);
      toast({
        title: 'Success!',
        description: `Parsed ${parsedMessages.length} messages successfully`,
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
        description: 'Creating your download package',
      });

      await exportMessages(messages, format);

      toast({
        title: 'Export complete!',
        description: 'Your messages have been downloaded',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export messages',
        variant: 'destructive',
      });
    }
  };

  const stats = messages.length > 0 ? getMessageStats(messages) : null;

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

        <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />

        {stats && (
          <MessageStats
            totalMessages={stats.totalMessages}
            uniqueSenders={stats.uniqueSenders}
            topSenders={stats.topSenders}
          />
        )}

        {messages.length > 0 && (
          <>
            <MessagePreview messages={messages} />
            <ExportControls onExport={handleExport} disabled={messages.length === 0} />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
