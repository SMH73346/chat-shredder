import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ParsedMessage } from '@/lib/whatsappParser';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO, startOfDay } from 'date-fns';

interface StatisticsDashboardProps {
  messages: ParsedMessage[];
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(142, 76%, 50%)',
  'hsl(200, 70%, 50%)',
  'hsl(280, 70%, 60%)',
  'hsl(30, 80%, 55%)',
];

export function StatisticsDashboard({ messages }: StatisticsDashboardProps) {
  // Calculate message frequency over time (grouped by day)
  const getMessageFrequency = () => {
    const frequencyMap = new Map<string, number>();
    
    messages.forEach((msg) => {
      const date = new Date(msg.timestamp);
      const day = format(startOfDay(date), 'MMM dd');
      frequencyMap.set(day, (frequencyMap.get(day) || 0) + 1);
    });
    
    return Array.from(frequencyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Calculate most active hours (0-23)
  const getMostActiveHours = () => {
    const hoursMap = new Map<number, number>();
    
    messages.forEach((msg) => {
      const date = new Date(msg.timestamp);
      const hour = date.getHours();
      hoursMap.set(hour, (hoursMap.get(hour) || 0) + 1);
    });
    
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      count: hoursMap.get(i) || 0,
    }));
  };

  // Calculate media type breakdown
  const getMediaTypeBreakdown = () => {
    const mediaTypes = new Map<string, number>();
    
    messages.forEach((msg) => {
      if (msg.mediaFiles && msg.mediaFiles.length > 0) {
        msg.mediaFiles.forEach((file) => {
          const ext = file.toLowerCase().split('.').pop() || 'unknown';
          let type = 'Other';
          
          if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
            type = 'Images';
          } else if (['mp4', 'avi', 'mov', 'webm'].includes(ext)) {
            type = 'Videos';
          } else if (['mp3', 'wav', 'ogg', 'opus'].includes(ext)) {
            type = 'Audio';
          } else if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) {
            type = 'Documents';
          } else if (['webp'].includes(ext)) {
            type = 'Stickers';
          }
          
          mediaTypes.set(type, (mediaTypes.get(type) || 0) + 1);
        });
      }
    });
    
    return Array.from(mediaTypes.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const frequencyData = getMessageFrequency();
  const hoursData = getMostActiveHours();
  const mediaData = getMediaTypeBreakdown();

  return (
    <div className="space-y-6 mb-8">
      <h2 className="text-2xl font-bold">Statistics Dashboard</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Frequency Over Time */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Message Frequency Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={frequencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                  name="Messages"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Most Active Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Most Active Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="hour" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  interval={2}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))"
                  name="Messages"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Media Type Breakdown */}
        {mediaData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Media Type Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mediaData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {mediaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: 'hsl(var(--foreground))' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}