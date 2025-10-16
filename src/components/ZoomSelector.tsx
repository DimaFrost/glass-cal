import React from 'react';
import { CalendarView } from '../types';
import { Calendar, Clock, CalendarDays, CalendarRange } from 'lucide-react';

interface ZoomSelectorProps {
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

export const ZoomSelector: React.FC<ZoomSelectorProps> = ({ currentView, onViewChange }) => {
  const zoomLevels = [
    { type: 'year' as const, label: 'Year', icon: CalendarRange },
    { type: 'month' as const, label: 'Month', icon: Calendar },
    { type: 'week' as const, label: 'Week', icon: CalendarDays },
    { type: 'day' as const, label: 'Day', icon: Clock },
  ];

  return (
    <div className="flex items-center gap-2 p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
      {zoomLevels.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          onClick={() => onViewChange({ type, currentDate: currentView.currentDate })}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
            ${currentView.type === type
              ? 'bg-white/20 text-white shadow-lg'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
            }
          `}
        >
          <Icon className="w-4 h-4" />
          <span className="font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
};
