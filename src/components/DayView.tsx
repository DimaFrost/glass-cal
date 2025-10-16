import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { format, isToday } from 'date-fns';
import { GlassCard } from './GlassCard';
import { useCalendarStore } from '../store/useCalendarStore';

interface DayViewProps {
  currentDate: Date;
}

export const DayView: React.FC<DayViewProps> = ({ currentDate }) => {
  const { getEventsForDay } = useCalendarStore();

  const getDayEvents = (date: Date) => {
    return getEventsForDay(date);
  };

  const dayEvents = getDayEvents(currentDate);
  const isCurrentDay = isToday(currentDate);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Main Day Container */}
      <Droppable droppableId={`day-${format(currentDate, 'yyyy-MM-dd')}`}>
        {(provided, snapshot) => (
          <GlassCard
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              p-6 cursor-pointer transition-all duration-200 min-h-[400px]
              ${isCurrentDay ? 'bg-blue-500/30 border-blue-400/50' : ''}
              ${snapshot.isDraggingOver ? 'bg-white/20 border-2 border-dashed border-white/40' : ''}
              hover:bg-white/15
            `}
          >
            <div className="flex flex-col h-full">
              <div className={`
                text-center mb-6
                ${isCurrentDay ? 'text-blue-200' : 'text-white'}
              `}>
                <h2 className="text-2xl font-bold">
                  {format(currentDate, 'EEEE, MMMM d, yyyy')}
                </h2>
                {isCurrentDay && (
                  <span className="px-3 py-1 bg-blue-500/30 text-blue-200 text-sm rounded-full mt-2 inline-block">
                    Today
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-2">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 bg-white/20 rounded-lg text-white"
                  >
                    <div className="font-medium">{event.title}</div>
                    {event.description && (
                      <div className="text-sm text-white/70 mt-1">{event.description}</div>
                    )}
                    {event.startTime && (
                      <div className="text-xs text-white/60 mt-1">
                        {format(event.startTime, 'HH:mm')}
                        {event.endTime && ` - ${format(event.endTime, 'HH:mm')}`}
                      </div>
                    )}
                  </div>
                ))}

                {dayEvents.length === 0 && (
                  <div className="text-center text-white/40 py-8">
                    <div className="text-lg mb-2">No events scheduled</div>
                    <div className="text-sm">Drop events here to schedule them for this day</div>
                  </div>
                )}
              </div>
            </div>
            {provided.placeholder}
          </GlassCard>
        )}
      </Droppable>
    </div>
  );
};
