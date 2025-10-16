export type EventLevel = 'year' | 'month' | 'week' | 'day' | 'timed';

export interface Event {
  id: string;
  title: string;
  description?: string;
  
  // CORE ASSIGNMENT - Primary field for day assignment
  assignedDate?: Date;        // If set, event is scheduled to this day
  
  // HIERARCHICAL BACKLOG SYSTEM
  backlogLevel?: EventLevel;  // Which backlog level this belongs to
  backlogSource?: EventLevel; // Which backlog it was originally created in
  weekStart?: Date;          // For week-level items, which week they belong to
  monthStart?: Date;        // For month-level items, which month they belong to
  
  // TIMING (for scheduled events)
  startTime?: Date;
  endTime?: Date;
  isAllDay?: boolean;
  
  // METADATA
  isSynced?: boolean;
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Backlog {
  level: EventLevel;
  period: Date;
  events: Event[];
}

export interface CalendarView {
  type: 'year' | 'month' | 'week' | 'day';
  currentDate: Date;
}

export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  };
}
