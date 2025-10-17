import { create } from 'zustand';
import { Event, EventLevel, CalendarView } from '../types';
import { format, startOfWeek, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, addYears, subYears } from 'date-fns';

interface CalendarState {
  events: Event[];
  currentView: CalendarView;
  selectedDate: Date;
  
  // Actions
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  assignEventToDay: (eventId: string, date: Date) => void;
  moveEventToBacklog: (eventId: string, level: EventLevel) => void;
  moveEventToBacklogLevel: (eventId: string, newLevel: EventLevel, weekStart?: Date, monthStart?: Date) => void;
  setCurrentView: (view: CalendarView) => void;
  setSelectedDate: (date: Date) => void;
  navigatePrevious: () => void;
  navigateNext: () => void;
  
  // Getters
  getEventsForDay: (date: Date) => Event[];
  getBacklogEvents: (level: EventLevel) => Event[];
  
  // Hierarchical Backlog Functions
  getMonthBacklogEvents: (month: Date) => Event[];
  getMonthBacklogEventsOnly: (month: Date) => Event[];
  getWeekBacklogEvents: (weekStart: Date) => Event[];
  getWeekBacklogEventsOnly: (weekStart: Date) => Event[];
  getDayBacklogEvents: (day: Date) => Event[];
}

export const useCalendarStore = create<CalendarState>()((set, get) => ({
      events: [],
      currentView: { type: 'month', currentDate: new Date() },
      selectedDate: new Date(),

      addEvent: (eventData) => {
        const state = get();
        const now = new Date();
        const selectedDate = state.selectedDate;
        
        // Set the appropriate start dates based on the backlog level and selected date
        let monthStart: Date | undefined;
        let weekStart: Date | undefined;
        
        if (eventData.backlogLevel === 'month') {
          monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        } else if (eventData.backlogLevel === 'week') {
          weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        }
        
        const newEvent: Event = {
          ...eventData,
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
          backlogSource: eventData.backlogLevel, // Set the original backlog source
          monthStart,
          weekStart,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          events: [...state.events, newEvent],
        }));
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id
              ? { ...event, ...updates, updatedAt: new Date() }
              : event
          ),
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }));
      },

      assignEventToDay: (eventId, date) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? { 
                  ...event, 
                  assignedDate: date,
                  backlogLevel: undefined,
                  updatedAt: new Date() 
                }
              : event
          ),
        }));
      },

      moveEventToBacklog: (eventId, level) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? { 
                  ...event, 
                  backlogLevel: level,
                  backlogSource: level, // Update source to the new level
                  assignedDate: undefined,
                  updatedAt: new Date() 
                }
              : event
          ),
        }));
      },

      moveEventToBacklogLevel: (eventId, newLevel, weekStart?: Date, monthStart?: Date) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? { 
                  ...event, 
                  backlogLevel: newLevel,
                  backlogSource: newLevel, // Update source to the new destination
                  weekStart: newLevel === 'week' ? weekStart : undefined,
                  monthStart: newLevel === 'month' ? monthStart : undefined,
                  assignedDate: undefined,
                  updatedAt: new Date() 
                }
              : event
          ),
        }));
      },

      setCurrentView: (view) => {
        set({ currentView: view });
      },

          setSelectedDate: (date) => {
            set({ selectedDate: date });
          },

          navigatePrevious: () => {
            const state = get();
            const { selectedDate, currentView } = state;
            let newDate: Date;

            switch (currentView.type) {
              case 'year':
                newDate = subYears(selectedDate, 1);
                break;
              case 'month':
                newDate = subMonths(selectedDate, 1);
                break;
              case 'week':
                newDate = subWeeks(selectedDate, 1);
                break;
              case 'day':
                newDate = subDays(selectedDate, 1);
                break;
              default:
                newDate = selectedDate;
            }

            set({ selectedDate: newDate });
          },

          navigateNext: () => {
            const state = get();
            const { selectedDate, currentView } = state;
            let newDate: Date;

            switch (currentView.type) {
              case 'year':
                newDate = addYears(selectedDate, 1);
                break;
              case 'month':
                newDate = addMonths(selectedDate, 1);
                break;
              case 'week':
                newDate = addWeeks(selectedDate, 1);
                break;
              case 'day':
                newDate = addDays(selectedDate, 1);
                break;
              default:
                newDate = selectedDate;
            }

            set({ selectedDate: newDate });
          },

      getEventsForDay: (date) => {
        const state = get();
        return state.events.filter((event) => {
          // Events assigned to this specific day
          if (event.assignedDate && format(event.assignedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) {
            return true;
          }
          
          // Events with start time on this day
          if (event.startTime && format(event.startTime, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) {
            return true;
          }
          
          return false;
        });
      },

      getBacklogEvents: (level) => {
        const state = get();
        return state.events.filter((event) => 
          !event.assignedDate && 
          event.backlogLevel === level
        );
      },


      // Hierarchical Backlog Functions

      getMonthBacklogEvents: (month) => {
        const state = get();
        return state.events.filter((event) => {
          if (event.assignedDate) return false;
          
          // Include month-level backlog items for this specific month
          if (event.backlogLevel === 'month') {
            // If the event has a specific monthStart, check if it matches this month
            if (event.monthStart) {
              return format(event.monthStart, 'yyyy-MM') === format(month, 'yyyy-MM');
            }
            // For legacy items without monthStart, use creation date
            return format(event.createdAt, 'yyyy-MM') === format(month, 'yyyy-MM');
          }
          
          // Include year-level backlog items (hierarchical inheritance)
          if (event.backlogLevel === 'year') {
            return format(event.createdAt, 'yyyy') === format(month, 'yyyy');
          }
          
          return false;
        });
      },

      getMonthBacklogEventsOnly: (month) => {
        const state = get();
        return state.events.filter((event) => {
          try {
            if (!event || event.assignedDate) return false;
            
            // Only include month-level backlog items for this specific month
            if (event.backlogLevel !== 'month') return false;
            
            // If the event has a specific monthStart, check if it matches this month
            if (event.monthStart) {
              return format(event.monthStart, 'yyyy-MM') === format(month, 'yyyy-MM');
            }
            
            // For legacy items without monthStart, use creation date
            if (event.createdAt) {
              return format(event.createdAt, 'yyyy-MM') === format(month, 'yyyy-MM');
            }
            
            return false;
          } catch (error) {
            console.error('Error filtering month event:', error, event);
            return false;
          }
        });
      },

      getWeekBacklogEvents: (weekStart) => {
        const state = get();
        return state.events.filter((event) => {
          if (event.assignedDate) return false;
          
          // Include week-level backlog items for this specific week
          if (event.backlogLevel === 'week') {
            // If the event has a specific weekStart, check if it matches this week
            if (event.weekStart) {
              return format(event.weekStart, 'yyyy-MM-dd') === format(weekStart, 'yyyy-MM-dd');
            }
            // For legacy items without weekStart, determine which week they belong to
            const eventWeekStart = startOfWeek(event.createdAt, { weekStartsOn: 1 });
            return format(eventWeekStart, 'yyyy-MM-dd') === format(weekStart, 'yyyy-MM-dd');
          }
          
          // Include month-level backlog items for this month (but only if they're in the same month as the week)
          if (event.backlogLevel === 'month') {
            const weekMonth = format(weekStart, 'yyyy-MM');
            // If the event has a specific monthStart, check if it matches this month
            if (event.monthStart) {
              return format(event.monthStart, 'yyyy-MM') === weekMonth;
            }
            // For legacy items without monthStart, use creation date
            return format(event.createdAt, 'yyyy-MM') === weekMonth;
          }
          
          // Include year-level backlog items (but only if they're in the same year as the week)
          if (event.backlogLevel === 'year') {
            const weekYear = format(weekStart, 'yyyy');
            return format(event.createdAt, 'yyyy') === weekYear;
          }
          
          return false;
        });
      },

      getWeekBacklogEventsOnly: (weekStart) => {
        const state = get();
        return state.events.filter((event) => {
          try {
            if (!event || event.assignedDate) return false;
            
            // Only include week-level backlog items
            if (event.backlogLevel !== 'week') return false;
            
            // If the event has a specific weekStart, check if it matches this week
            if (event.weekStart) {
              return format(event.weekStart, 'yyyy-MM-dd') === format(weekStart, 'yyyy-MM-dd');
            }
            
            // For legacy items without weekStart, we need to determine which week they belong to
            // We'll use the creation date to determine the week
            if (event.createdAt) {
              const eventWeekStart = startOfWeek(event.createdAt, { weekStartsOn: 1 });
              return format(eventWeekStart, 'yyyy-MM-dd') === format(weekStart, 'yyyy-MM-dd');
            }
            
            return false;
          } catch (error) {
            console.error('Error filtering week event:', error, event);
            return false;
          }
        });
      },

      getDayBacklogEvents: (day) => {
        const state = get();
        return state.events.filter((event) => {
          if (event.assignedDate) return false;
          
          // Include day-level backlog items for this day
          if (event.backlogLevel === 'day') {
            return format(event.createdAt, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
          }
          
          // Include week-level backlog items for this week
          if (event.backlogLevel === 'week') {
            // If the event has a specific weekStart, check if it matches this week
            if (event.weekStart) {
              const dayWeekStart = startOfWeek(day, { weekStartsOn: 1 });
              return format(event.weekStart, 'yyyy-MM-dd') === format(dayWeekStart, 'yyyy-MM-dd');
            }
            // For legacy items without weekStart, determine which week they belong to
            const eventWeekStart = startOfWeek(event.createdAt, { weekStartsOn: 1 });
            const dayWeekStart = startOfWeek(day, { weekStartsOn: 1 });
            return format(eventWeekStart, 'yyyy-MM-dd') === format(dayWeekStart, 'yyyy-MM-dd');
          }
          
          // Include month-level backlog items for this month
          if (event.backlogLevel === 'month') {
            // If the event has a specific monthStart, check if it matches this month
            if (event.monthStart) {
              return format(event.monthStart, 'yyyy-MM') === format(day, 'yyyy-MM');
            }
            // For legacy items without monthStart, use creation date
            return format(event.createdAt, 'yyyy-MM') === format(day, 'yyyy-MM');
          }
          
          // Include year-level backlog items for this year
          if (event.backlogLevel === 'year') {
            return format(event.createdAt, 'yyyy') === format(day, 'yyyy');
          }
          
          return false;
        });
      },
}));

