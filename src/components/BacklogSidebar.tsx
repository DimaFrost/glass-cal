import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Event, EventLevel } from '../types';
import { EventCard } from './EventCard';
import { Plus, Calendar } from 'lucide-react';

interface BacklogSidebarProps {
  level: EventLevel;
  title: string;
  events: Event[];
  onAddEvent: (level: EventLevel) => void;
  onEditEvent: (event: Event) => void;
}

export const BacklogSidebar: React.FC<BacklogSidebarProps> = ({
  level,
  title,
  events,
  onAddEvent,
  onEditEvent
}) => {
  return (
    <div 
      className="w-80 bg-white/5 rounded-xl border border-white/20 p-4"
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <button
          onClick={() => onAddEvent(level)}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>

      <Droppable droppableId={`${level}-backlog`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              min-h-[300px] p-3 rounded-lg transition-colors
              ${snapshot.isDraggingOver 
                ? 'bg-white/20 border-2 border-dashed border-white/40' 
                : 'bg-white/5'
              }
            `}
          >
            {events.length === 0 ? (
              <div className="text-center text-white/50 py-8">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No events yet</p>
                <p className="text-xs">Drag events here or click + to add</p>
              </div>
            ) : (
              events.map((event, index) => (
                <Draggable key={event.id} draggableId={event.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <EventCard
                        event={event}
                        onEdit={onEditEvent}
                        isDragging={snapshot.isDragging}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
