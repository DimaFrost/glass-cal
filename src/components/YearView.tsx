import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { format, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { useCalendarStore } from '../store/useCalendarStore';
import { GlassCard } from './GlassCard';

interface YearViewProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
}

export const YearView: React.FC<YearViewProps> = ({ currentDate, onDateClick }) => {
  const { getMonthBacklogEventsOnly } = useCalendarStore();
  const months = eachMonthOfInterval({
    start: startOfYear(currentDate),
    end: endOfYear(currentDate)
  });

  const getMonthBacklog = (month: Date) => {
    // In Year view, month containers should only show month-level items
    // Year-level items are shown in the main Year Backlog sidebar
    return getMonthBacklogEventsOnly(month);
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {months.map((month, index) => {
        const monthBacklog = getMonthBacklog(month);
        return (
          <Droppable key={index} droppableId={`month-${format(month, 'yyyy-MM')}`}>
            {(provided, snapshot) => (
              <GlassCard
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`
                  p-4 cursor-pointer transition-all duration-300 min-h-[150px]
                  ${snapshot.isDraggingOver ? 'bg-white/20 border-2 border-dashed border-white/40' : ''}
                  hover:bg-white/15
                `}
                onClick={() => onDateClick(month)}
              >
                <div className="text-center mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    {format(month, 'MMM')}
                  </h3>
                  <p className="text-xs text-white/60">Month Backlog</p>
                </div>
                
                {/* Month backlog container */}
                <div className="min-h-[100px] space-y-1">
                  {monthBacklog.map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-2 bg-white/20 rounded text-white truncate"
                    >
                      {event.title}
                    </div>
                  ))}
                  
                  {monthBacklog.length === 0 && (
                    <div className="text-xs text-white/40 text-center py-4">
                      Drop year backlog items here
                    </div>
                  )}
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
