import { ParsedMessage } from '@/lib/whatsappParser';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessagePreviewProps {
  messages: ParsedMessage[];
}

export function MessagePreview({ messages }: MessagePreviewProps) {
  if (messages.length === 0) return null;

  return (
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
                  <TableCell className="max-w-md">
                    <div className="truncate">{msg.message}</div>
                    {msg.mediaFiles && msg.mediaFiles.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        📎 {msg.mediaFiles.length} media file{msg.mediaFiles.length > 1 ? 's' : ''}
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
  );
}
