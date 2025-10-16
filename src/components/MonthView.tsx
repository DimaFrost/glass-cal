import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, endOfWeek, eachWeekOfInterval } from 'date-fns';
import { GlassCard } from './GlassCard';
import { useCalendarStore } from '../store/useCalendarStore';

interface MonthViewProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({ currentDate, onDateClick }) => {
  const { getEventsForDay, getWeekBacklogEventsOnly } = useCalendarStore();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const getDayEvents = (date: Date) => {
    return getEventsForDay(date);
  };

  const getWeekBacklog = (weekStart: Date) => {
    return getWeekBacklogEventsOnly(weekStart);
  };

  // Group days by weeks - only include weeks that have days from the current month
  const allWeeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });
  const weeks = allWeeks.filter(weekStart => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    // Only include weeks that have at least one day from the current month
    return weekDays.some(day => isSameMonth(day, currentDate));
  });

  return (
    <div className="space-y-4">
      {weeks.map((weekStart, weekIndex) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
        const weekBacklog = getWeekBacklog(weekStart);
        
        return (
          <div key={weekIndex} className="flex gap-4">
            {/* Week Backlog Section */}
            <div className="w-48 flex-shrink-0">
              <Droppable droppableId={`week-backlog-${format(weekStart, 'yyyy-MM-dd')}`}>
                {(provided, snapshot) => (
                  <GlassCard
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`
                      p-3 min-h-[200px] transition-all duration-200
                      ${snapshot.isDraggingOver ? 'bg-white/20 border-2 border-dashed border-white/40' : ''}
                    `}
                    style={{
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)'
                    }}
                  >
                    <div className="text-center mb-3">
                      <h4 className="text-sm font-semibold text-white">
                        Week {weekIndex + 1}
                      </h4>
                      <p className="text-xs text-white/60">Week Backlog</p>
                    </div>
                    
                    <div className="space-y-1">
                      {weekBacklog.map((event) => (
                        <div
                          key={event.id}
                          className="text-xs p-2 bg-white/20 rounded text-white truncate"
                        >
                          {event.title}
                        </div>
                      ))}
                      
                      {weekBacklog.length === 0 && (
                        <div className="text-xs text-white/40 text-center py-4">
                          Drop month backlog items here
                        </div>
                      )}
                    </div>
                    {provided.placeholder}
                  </GlassCard>
                )}
              </Droppable>
            </div>
            
            {/* Week Days */}
            <div className="flex-1">
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => {
                  const dayEvents = getDayEvents(day);
                  const isCurrentDay = isToday(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  
                  return (
                    <Droppable key={day.toISOString()} droppableId={`day-${format(day, 'yyyy-MM-dd')}`}>
                      {(provided, snapshot) => (
                        <GlassCard
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`
                            h-20 p-2 cursor-pointer transition-all duration-200
                            ${isCurrentDay ? 'bg-blue-500/30 border-blue-400/50' : ''}
                            ${!isCurrentMonth ? 'opacity-50' : ''}
                            ${snapshot.isDraggingOver ? 'bg-white/20 border-2 border-dashed border-white/40' : ''}
                            hover:bg-white/15
                          `}
                          onClick={() => onDateClick(day)}
                        >
                          <div className="flex flex-col h-full">
                            <div className={`
                              text-sm font-medium mb-1
                              ${isCurrentDay ? 'text-blue-200' : 'text-white'}
                            `}>
                              {format(day, 'd')}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              {dayEvents.slice(0, 2).map((event) => (
                                <div
                                  key={event.id}
                                  className="text-xs p-1 bg-white/20 rounded mb-1 truncate"
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-white/60">
                                  +{dayEvents.length - 2}
                                </div>
                              )}
                              {dayEvents.length === 0 && (
                                <div className="text-xs text-white/40 text-center py-2">
                                  Drop events here
                                </div>
                              )}
                            </div>
                          </div>
                          {provided.placeholder}
                        </GlassCard>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
