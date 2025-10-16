import React from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useCalendarStore } from '../store/useCalendarStore';
import { ZoomSelector } from './ZoomSelector';
import { YearView } from './YearView';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { BacklogSidebar } from './BacklogSidebar';
import { Event, EventLevel } from '../types';
import { format, startOfWeek, endOfWeek } from 'date-fns';

export const CalendarView: React.FC = () => {
  const {
    currentView,
    selectedDate,
    getBacklogEvents,
    getMonthBacklogEventsOnly,
    getWeekBacklogEventsOnly,
    assignEventToDay,
    moveEventToBacklog,
    moveEventToBacklogLevel,
    addEvent,
    updateEvent,
    setCurrentView,
    setSelectedDate,
    navigatePrevious,
    navigateNext
  } = useCalendarStore();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const destinationId = destination.droppableId;

    // Handle different drop targets
    if (destinationId.startsWith('day-')) {
      // Dropped on a specific day - assign event to that day
      const dayString = destinationId.replace('day-', '');
      const targetDate = new Date(dayString);
      assignEventToDay(draggableId, targetDate);
    } else if (destinationId.startsWith('month-')) {
      // Dropped on month container in Year view - move to month backlog
      const monthString = destinationId.replace('month-', '');
      const monthStart = new Date(monthString + '-01'); // Convert YYYY-MM to Date
      moveEventToBacklogLevel(draggableId, 'month', undefined, monthStart);
    } else if (destinationId.startsWith('week-backlog-')) {
      // Dropped on week backlog - move to week backlog
      const weekStartString = destinationId.replace('week-backlog-', '');
      const weekStart = new Date(weekStartString);
      
      // Check if the event is already in the correct week backlog
      const event = useCalendarStore.getState().events.find(e => e.id === draggableId);
      if (event && event.backlogLevel === 'week' && event.weekStart && 
          format(event.weekStart, 'yyyy-MM-dd') === format(weekStart, 'yyyy-MM-dd')) {
        // Event is already in the correct week backlog, no need to update
        return;
      }
      
      moveEventToBacklogLevel(draggableId, 'week', weekStart);
    } else if (destinationId.startsWith('day-backlog-')) {
      // Dropped on day backlog - move to day backlog
      
      // Check if the event is already in the day backlog
      const event = useCalendarStore.getState().events.find(e => e.id === draggableId);
      if (event && event.backlogLevel === 'day' && !event.assignedDate) {
        // Event is already in the day backlog, no need to update
        return;
      }
      
      moveEventToBacklogLevel(draggableId, 'day');
    } else if (destinationId.endsWith('-backlog')) {
      // Dropped on main backlog sidebar - move to current level backlog
      const level = destinationId.replace('-backlog', '') as EventLevel;
      
      // For month level, we need to preserve or set the monthStart
      if (level === 'month') {
        moveEventToBacklogLevel(draggableId, 'month', undefined, selectedDate);
      } else {
        moveEventToBacklog(draggableId, level);
      }
    }
  };

  const handleAddEvent = (level: EventLevel) => {
    const title = prompt('Event title:');
    if (!title) return;

    const description = prompt('Event description (optional):');

    addEvent({
      title,
      description: description || undefined,
      backlogLevel: level
    });
  };

  const handleEditEvent = (event: Event) => {
    const newTitle = prompt('Event title:', event.title);
    if (newTitle === null) return;

    const newDescription = prompt('Event description:', event.description || '');

    updateEvent(event.id, {
      title: newTitle,
      description: newDescription || undefined
    });
  };

  const getCurrentLevelEvents = () => {
    const level = currentView.type;
    
    try {
      switch (level) {
        case 'year':
          // For year view, show ALL year-level items regardless of when they were created
          return getBacklogEvents('year') || [];
        case 'month':
          // For month view, show only native month-level events
          return getMonthBacklogEventsOnly(selectedDate) || [];
        case 'week':
          // For week view, show only native week-level events
          const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
          return getWeekBacklogEventsOnly(weekStart) || [];
        case 'day':
          // For day view, show only native day-level events for this specific day
          const dayLevelEvents = getBacklogEvents('day') || [];
          return dayLevelEvents.filter(event => 
            format(event.createdAt, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
          );
        default:
          return [];
      }
    } catch (error) {
      console.error('Error in getCurrentLevelEvents:', error);
      return [];
    }
  };


  const getCurrentLevelTitle = () => {
    switch (currentView.type) {
      case 'year':
        return 'Year Backlog';
      case 'month':
        return 'Month Backlog';
      case 'week':
        return 'Week Backlog';
      case 'day':
        return 'Day Backlog';
      default:
        return 'Backlog';
    }
  };

  const renderCalendarView = () => {
    switch (currentView.type) {
      case 'year':
        return (
          <YearView
            currentDate={selectedDate}
            onDateClick={setSelectedDate}
          />
        );
      case 'month':
        return (
          <MonthView
            currentDate={selectedDate}
            onDateClick={setSelectedDate}
          />
        );
      case 'week':
        return (
          <WeekView
            currentDate={selectedDate}
            onDateClick={setSelectedDate}
          />
        );
      case 'day':
        return (
          <DayView
            currentDate={selectedDate}
          />
        );
      default:
        return null;
    }
  };

  const getViewTitle = () => {
    try {
      if (!selectedDate || !(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
        return 'Invalid Date';
      }
      
      switch (currentView.type) {
        case 'year':
          return format(selectedDate, 'yyyy');
        case 'month':
          return format(selectedDate, 'MMMM yyyy');
        case 'week':
          const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
          const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
          return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
        case 'day':
          return format(selectedDate, 'EEEE, MMMM d, yyyy');
        default:
          return '';
      }
    } catch (error) {
      console.error('Error in getViewTitle:', error);
      return 'Error';
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Sticky Navigation Header */}
        <div className="sticky top-0 z-50 bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-md border-b border-white/10 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              {/* Left: View Title and Navigation */}
              <div className="flex items-center gap-6">
                <h1 className="text-2xl font-bold text-white">
                  {getViewTitle()}
                </h1>
                <div className="flex items-center gap-2">
                  <button
                    onClick={navigatePrevious}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                    title="Previous"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                  >
                    Today
                  </button>
                  <button
                    onClick={navigateNext}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                    title="Next"
                  >
                    →
                  </button>
                </div>
              </div>
              
              {/* Right: Zoom Selector */}
              <ZoomSelector
                currentView={currentView}
                onViewChange={setCurrentView}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-6">
              {/* Calendar View */}
              <div className="flex-1">
                {renderCalendarView()}
              </div>

              {/* Sticky Backlog Sidebar */}
              <div className="flex-shrink-0">
                <div className="sticky top-20">
                  <BacklogSidebar
                    level={currentView.type}
                    title={getCurrentLevelTitle()}
                    events={getCurrentLevelEvents()}
                    onAddEvent={handleAddEvent}
                    onEditEvent={handleEditEvent}
                  />
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-12 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">How to Use</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80">
                <div>
                  <h4 className="font-medium mb-2">Hierarchical Planning</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Start with broad year-level goals</li>
                    <li>• Break down into monthly objectives</li>
                    <li>• Plan weekly priorities</li>
                    <li>• Schedule daily tasks</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Calendar Views</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Switch between zoom levels at the top</li>
                    <li>• Click dates to navigate</li>
                    <li>• Backlog sidebar shows current level</li>
                    <li>• Drag events between levels</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};