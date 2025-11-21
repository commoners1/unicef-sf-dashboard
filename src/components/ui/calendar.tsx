import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
  addMonths,
  subMonths,
} from 'date-fns';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export interface CalendarProps {
  mode?: 'single' | 'range' | 'multiple';
  selected?: Date | Date[] | { from?: Date; to?: Date };
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
  showOutsideDays?: boolean;
  className?: string;
  month?: Date;
  onMonthChange?: (date: Date) => void;
}

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function Calendar({
  mode = 'single',
  selected,
  onSelect,
  disabled,
  initialFocus = false,
  showOutsideDays = true,
  className,
  month: controlledMonth,
  onMonthChange,
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState<Date>(
    controlledMonth || new Date()
  );

  const month = controlledMonth || internalMonth;
  const setMonth = onMonthChange || setInternalMonth;

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  // Group days into weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  const handleDateClick = (date: Date) => {
    if (disabled?.(date)) return;
    if (mode === 'single' && onSelect) {
      // If clicking the same date, deselect it
      if (selected instanceof Date && isSameDay(date, selected)) {
        onSelect(undefined);
      } else {
        onSelect(date);
      }
    }
  };

  const handlePrevMonth = () => {
    setMonth(subMonths(month, 1));
  };

  const handleNextMonth = () => {
    setMonth(addMonths(month, 1));
  };

  const isSelected = (date: Date): boolean => {
    if (!selected) return false;
    if (mode === 'single') {
      return selected instanceof Date && isSameDay(date, selected);
    }
    if (Array.isArray(selected)) {
      return selected.some((d) => isSameDay(date, d));
    }
    if (typeof selected === 'object' && 'from' in selected) {
      return !!(
        (selected.from && isSameDay(date, selected.from)) ||
        (selected.to && isSameDay(date, selected.to))
      );
    }
    return false;
  };

  const isInRange = (date: Date): boolean => {
    if (mode !== 'range' || !selected || typeof selected !== 'object' || !('from' in selected))
      return false;
    if (!selected.from || !selected.to) return false;
    const fromTime = selected.from.getTime();
    const toTime = selected.to.getTime();
    const dateTime = date.getTime();
    return dateTime >= fromTime && dateTime <= toTime;
  };

  const calendarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (initialFocus && calendarRef.current) {
      calendarRef.current.focus();
    }
  }, [initialFocus]);

  return (
    <div
      ref={calendarRef}
      className={cn('p-3', className)}
      tabIndex={initialFocus ? 0 : -1}
    >
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevMonth}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </button>
          <div className="text-sm font-medium">
            {format(month, 'MMMM yyyy')}
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
            )}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Day headers */}
          <div className="flex">
            {WEEK_DAYS.map((day) => (
              <div
                key={day}
                className="text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex items-center justify-center"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="w-full border-collapse space-y-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex w-full mt-2">
                {week.map((date) => {
                  const isCurrentMonth = isSameMonth(date, month);
                  const isSelectedDate = isSelected(date);
                  const isTodayDate = isToday(date);
                  const isOutsideDay = !isCurrentMonth;
                  const isDisabledDate = disabled?.(date) || false;
                  const isInDateRange = isInRange(date);

                  if (!showOutsideDays && isOutsideDay) {
                    return (
                      <div key={date.toISOString()} className="h-9 w-9" />
                    );
                  }

                  return (
                    <div
                      key={date.toISOString()}
                      className={cn(
                        'h-9 w-9 text-center text-sm p-0 relative',
                        isInDateRange && 'bg-accent',
                        isSelectedDate && !isInDateRange && 'bg-accent'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => handleDateClick(date)}
                        disabled={isDisabledDate}
                        className={cn(
                          buttonVariants({ variant: 'ghost' }),
                          'h-9 w-9 p-0 font-normal',
                          !isCurrentMonth && showOutsideDays && 'text-muted-foreground opacity-50',
                          isSelectedDate &&
                            'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-semibold',
                          !isSelectedDate &&
                            isTodayDate &&
                            'bg-accent text-accent-foreground font-semibold',
                          isDisabledDate && 'text-muted-foreground opacity-50 cursor-not-allowed',
                          !isDisabledDate &&
                            !isSelectedDate &&
                            !isTodayDate &&
                            'hover:bg-accent hover:text-accent-foreground',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                        )}
                      >
                        {format(date, 'd')}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
