import React from 'react';
import { Event } from '../types';
import { GlassCard } from './GlassCard';
import { Clock, Calendar, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  isDragging?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onEdit, 
  isDragging = false 
}) => {
  const getEventIcon = () => {
    if (event.startTime) {
      return <Clock className="w-4 h-4" />;
    }
    return <Calendar className="w-4 h-4" />;
  };

  const getEventTime = () => {
    if (event.startTime) {
      if (event.isAllDay) {
        return 'All day';
      }
      return format(event.startTime, 'HH:mm');
    }
    return 'Backlog';
  };

  const getBacklogSource = () => {
    if (event.assignedDate) return 'Scheduled';
    return event.backlogSource || event.backlogLevel || 'Unknown';
  };

  const getLevelColor = () => {
    const source = getBacklogSource();
    switch (source) {
      case 'year': return 'border-blue-400/50 bg-blue-500/10';
      case 'month': return 'border-green-400/50 bg-green-500/10';
      case 'week': return 'border-yellow-400/50 bg-yellow-500/10';
      case 'day': return 'border-purple-400/50 bg-purple-500/10';
      case 'timed': return 'border-pink-400/50 bg-pink-500/10';
      case 'Scheduled': return 'border-emerald-400/50 bg-emerald-500/10';
      default: return 'border-gray-400/50 bg-gray-500/10';
    }
  };

  return (
    <GlassCard 
      className={`p-3 mb-2 border-l-4 ${getLevelColor()} ${isDragging ? 'opacity-50' : ''}`}
      isDragging={isDragging}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getEventIcon()}
            <h3 className="font-medium text-white text-sm truncate">
              {event.title}
            </h3>
          </div>
          
          {event.description && (
            <p className="text-white/70 text-xs mb-2 line-clamp-2">
              {event.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span className="px-2 py-1 bg-white/10 rounded-full">
              {getBacklogSource()}
            </span>
            <span>{getEventTime()}</span>
            {event.assignedDate && (
              <span className="text-emerald-400">
                {format(event.assignedDate, 'MMM d')}
              </span>
            )}
            {event.backlogSource && event.backlogSource !== event.backlogLevel && (
              <span className="text-xs text-white/40">
                (from {event.backlogSource})
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(event);
              }}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <MoreHorizontal className="w-3 h-3 text-white/60" />
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
