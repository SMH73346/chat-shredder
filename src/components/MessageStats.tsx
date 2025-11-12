import { MessageCircle, Users, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface MessageStatsProps {
  totalMessages: number;
  uniqueSenders: number;
  topSenders: Array<{ sender: string; count: number }>;
}

export function MessageStats({ totalMessages, uniqueSenders, topSenders }: MessageStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-whatsapp-light flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Messages</p>
            <p className="text-3xl font-bold">{totalMessages}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-whatsapp-light flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Unique Senders</p>
            <p className="text-3xl font-bold">{uniqueSenders}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-whatsapp-light flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Top Sender</p>
            <p className="text-lg font-semibold truncate">
              {topSenders[0]?.sender || 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">
              {topSenders[0]?.count || 0} messages
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
