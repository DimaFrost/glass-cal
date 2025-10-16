import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import { useCalendarStore } from '../store/useCalendarStore';
import { GlassCard } from './GlassCard';

interface WeekViewProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({ currentDate, onDateClick }) => {
  const { getEventsForDay } = useCalendarStore();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getDayEvents = (date: Date) => {
    return getEventsForDay(date);
  };

  return (
    <div className="grid grid-cols-7 gap-4">
      {days.map((day) => {
        const dayEvents = getDayEvents(day);
        const isCurrentDay = isToday(day);
        
        return (
          <Droppable key={day.toISOString()} droppableId={`day-${format(day, 'yyyy-MM-dd')}`}>
            {(provided, snapshot) => (
              <GlassCard
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`
                  p-4 cursor-pointer transition-all duration-200 min-h-[200px]
                  ${isCurrentDay ? 'bg-blue-500/30 border-blue-400/50' : ''}
                  ${snapshot.isDraggingOver ? 'bg-white/20 border-2 border-dashed border-white/40' : ''}
                  hover:bg-white/15
                `}
                onClick={() => onDateClick(day)}
              >
                <div className="flex flex-col h-full">
                  <div className={`
                    text-center mb-3
                    ${isCurrentDay ? 'text-blue-200' : 'text-white'}
                  `}>
                    <div className="text-sm font-medium">
                      {format(day, 'EEE')}
                    </div>
                    <div className="text-lg font-bold">
                      {format(day, 'd')}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    {dayEvents.slice(0, 4).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-2 bg-white/20 rounded text-white truncate"
                      >
                        {event.title}
                      </div>
                    ))}
                    
                    {dayEvents.length > 4 && (
                      <div className="text-xs text-white/60 text-center">
                        +{dayEvents.length - 4} more
                      </div>
                    )}
                    
                    {dayEvents.length === 0 && (
                      <div className="text-xs text-white/40 text-center py-4">
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
  );
};
