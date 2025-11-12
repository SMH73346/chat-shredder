export interface ParsedMessage {
  date: string;
  time: string;
  sender: string;
  message: string;
  timestamp: number;
}

const MESSAGE_REGEX = /^(\d{1,2}\/\d{1,2}\/\d{4}),\s*(\d{1,2}:\d{2}\s*(?:am|pm)?)\s*-\s*([^:]+?):\s*(.+)$/im;
const SYSTEM_MESSAGE_REGEX = /^(\d{1,2}\/\d{1,2}\/\d{4}),\s*(\d{1,2}:\d{2}\s*(?:am|pm)?)\s*-\s*(.+)$/im;

export function parseWhatsAppChat(content: string): ParsedMessage[] {
  const messages: ParsedMessage[] = [];
  const lines = content.split('\n');
  
  let currentMessage: ParsedMessage | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Try to match user message
    const userMatch = trimmedLine.match(MESSAGE_REGEX);
    if (userMatch) {
      // Save previous message if exists
      if (currentMessage) {
        messages.push(currentMessage);
      }
      
      const [, date, time, sender, message] = userMatch;
      currentMessage = {
        date: date.trim(),
        time: time.trim(),
        sender: sender.trim(),
        message: message.trim(),
        timestamp: Date.now() + messages.length
      };
      continue;
    }
    
    // Try to match system message
    const systemMatch = trimmedLine.match(SYSTEM_MESSAGE_REGEX);
    if (systemMatch) {
      // Save previous message if exists
      if (currentMessage) {
        messages.push(currentMessage);
      }
      
      const [, date, time, message] = systemMatch;
      currentMessage = {
        date: date.trim(),
        time: time.trim(),
        sender: 'System',
        message: message.trim(),
        timestamp: Date.now() + messages.length
      };
      continue;
    }
    
    // If no match, append to current message (multi-line message)
    if (currentMessage) {
      currentMessage.message += '\n' + trimmedLine;
    }
  }
  
  // Don't forget the last message
  if (currentMessage) {
    messages.push(currentMessage);
  }
  
  return messages;
}

export function sanitizeFilename(text: string, maxLength: number = 15): string {
  // Take first maxLength characters, remove special characters, replace spaces with hyphens
  const sanitized = text
    .slice(0, maxLength)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return sanitized || 'message';
}

export function getMessageStats(messages: ParsedMessage[]) {
  const senderCounts: Record<string, number> = {};
  
  messages.forEach(msg => {
    senderCounts[msg.sender] = (senderCounts[msg.sender] || 0) + 1;
  });
  
  const topSenders = Object.entries(senderCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([sender, count]) => ({ sender, count }));
  
  return {
    totalMessages: messages.length,
    uniqueSenders: Object.keys(senderCounts).length,
    topSenders
  };
}
