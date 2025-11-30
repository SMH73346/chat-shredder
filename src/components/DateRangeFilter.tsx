import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  disabled?: boolean;
}

type PresetOption = {
  label: string;
  getValue: () => { start: Date; end: Date };
};

const DATE_PRESETS: PresetOption[] = [
  {
    label: 'Last 7 days',
    getValue: () => ({
      start: startOfDay(subDays(new Date(), 7)),
      end: endOfDay(new Date()),
    }),
  },
  {
    label: 'Last 30 days',
    getValue: () => ({
      start: startOfDay(subDays(new Date(), 30)),
      end: endOfDay(new Date()),
    }),
  },
  {
    label: 'Last 3 months',
    getValue: () => ({
      start: startOfDay(subMonths(new Date(), 3)),
      end: endOfDay(new Date()),
    }),
  },
  {
    label: 'Last 6 months',
    getValue: () => ({
      start: startOfDay(subMonths(new Date(), 6)),
      end: endOfDay(new Date()),
    }),
  },
];

export function DateRangeFilter({ onDateRangeChange, disabled }: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const handlePresetClick = (preset: PresetOption) => {
    const { start, end } = preset.getValue();
    setStartDate(start);
    setEndDate(end);
    onDateRangeChange(start, end);
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    setStartOpen(false);
    if (date && endDate) {
      onDateRangeChange(startOfDay(date), endOfDay(endDate));
    } else if (date) {
      onDateRangeChange(startOfDay(date), endDate || null);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    setEndOpen(false);
    if (startDate && date) {
      onDateRangeChange(startOfDay(startDate), endOfDay(date));
    } else if (date) {
      onDateRangeChange(startDate || null, endOfDay(date));
    }
  };

  const handleClear = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    onDateRangeChange(null, null);
  };

  const hasDateRange = startDate || endDate;

  return (
    <Card className="p-4 mb-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Filter by Date Range</h3>
          {hasDateRange && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2">
          {DATE_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick(preset)}
              disabled={disabled}
              className="h-8"
            >
              {preset.label}
            </Button>
          ))}
        </div>

        {/* Custom date range */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-2">From Date</label>
            <Popover open={startOpen} onOpenChange={setStartOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={disabled}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick start date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateSelect}
                  initialFocus
                  disabled={(date) => (endDate ? date > endDate : false)}
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-medium mb-2">To Date</label>
            <Popover open={endOpen} onOpenChange={setEndOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={disabled}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : <span>Pick end date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateSelect}
                  initialFocus
                  disabled={(date) => (startDate ? date < startDate : date > new Date())}
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {hasDateRange && (
          <p className="text-xs text-muted-foreground">
            {startDate && endDate && (
              <>
                Showing messages from{' '}
                <strong>{format(startDate, 'MMM dd, yyyy')}</strong> to{' '}
                <strong>{format(endDate, 'MMM dd, yyyy')}</strong>
              </>
            )}
            {startDate && !endDate && (
              <>
                Showing messages from{' '}
                <strong>{format(startDate, 'MMM dd, yyyy')}</strong> onwards
              </>
            )}
            {!startDate && endDate && (
              <>
                Showing messages up to{' '}
                <strong>{format(endDate, 'MMM dd, yyyy')}</strong>
              </>
            )}
          </p>
        )}
      </div>
    </Card>
  );
}