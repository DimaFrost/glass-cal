# Glass Calendar - Architecture & Design

## Core Concept

Glass Calendar introduces a **hierarchical backlog system** for time management that bridges the gap between high-level planning and detailed scheduling. Unlike traditional calendars that require specific times, this system allows events to exist at different levels of granularity.

### Key Innovation: Hierarchical Event Planning

- **Year Backlog**: Broad annual goals and themes
- **Month Backlog**: Monthly objectives and major events
- **Week Backlog**: Weekly priorities and tasks
- **Day Backlog**: Daily tasks and activities
- **Timed Events**: Specific time assignments

### Event Inheritance System

Events cascade down through the hierarchy:
- Year-level events appear in all months of that year
- Month-level events appear in all weeks of that month
- Week-level events appear in all days of that week
- Day-level events appear in the specific day's timeline

## Technical Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **State Management**: Zustand for lightweight state management
- **Styling**: Tailwind CSS with custom glass-morphism components
- **Calendar Views**: Custom React components for each zoom level
- **Drag & Drop**: React Beautiful DnD for seamless event movement
- **Build Tool**: Vite for fast development and building

### Backend Stack (Future Phases)
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL for relational data
- **Authentication**: OAuth 2.0 for Gmail/Outlook integration
- **APIs**: 
  - Google Calendar API for Gmail integration
  - Microsoft Graph API for Outlook integration

### Data Model

```typescript
interface Event {
  id: string;
  title: string;
  description?: string;
  level: 'year' | 'month' | 'week' | 'day' | 'timed';
  parentLevel?: 'year' | 'month' | 'week' | 'day';
  startTime?: Date;
  endTime?: Date;
  isAllDay?: boolean;
  isSynced?: boolean;
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Backlog {
  level: 'year' | 'month' | 'week' | 'day';
  period: Date;
  events: Event[];
}
```

## Implementation Phases

### Phase 1: Core Web App Prototype
**Goal**: Demonstrate the hierarchical backlog concept with a fully functional web application.

**Deliverables**:
- ✅ Basic calendar views (day, week, month, year)
- ✅ Backlog system for each zoom level
- ✅ Drag & drop between backlogs
- ✅ Glass-morphism UI design
- ✅ Local data persistence
- ✅ Event creation and editing
- ✅ Responsive design

**Technical Stack**:
- React + TypeScript + Vite
- Tailwind CSS + custom glass components
- React Beautiful DnD
- LocalStorage for data persistence
- Zustand for state management

### Phase 2: Calendar Integration
**Goal**: Connect with existing calendar systems (Gmail/Outlook).

**Deliverables**:
- OAuth integration with Gmail and Outlook
- Import existing calendar events
- Sync timed events back to external calendars
- Handle calendar conflicts and merging
- Real-time sync capabilities

### Phase 3: Mobile Applications
**Goal**: Native mobile apps for iOS and macOS.

**Deliverables**:
- React Native app for iOS
- Native macOS app using SwiftUI
- Offline-first architecture
- Push notifications for reminders
- Sync with web app

### Phase 4: Advanced Features
**Goal**: Enterprise features and intelligent scheduling.

**Deliverables**:
- Team collaboration and sharing
- Recurring event patterns
- Smart scheduling suggestions
- Analytics and insights
- API for third-party integrations

## User Experience Flow

### 1. High-Level Planning
- Start with year-level goals and themes
- Break down into monthly objectives
- Plan weekly priorities
- Schedule daily tasks

### 2. Progressive Refinement
- Move events down the hierarchy as they become more concrete
- Add specific times when ready
- Maintain flexibility until commitment is needed

### 3. Calendar Integration
- Import existing scheduled events
- Sync new timed events to external calendars
- Keep backlog items separate from scheduled events

## Key Features

### Hierarchical Backlog System
- Each zoom level has its own backlog
- Events can be moved between levels
- Inheritance ensures visibility at appropriate levels
- No time constraints until final scheduling

### Drag & Drop Interface
- Intuitive movement between backlogs
- Visual feedback for valid drop zones
- Smooth animations and transitions
- Touch-friendly for mobile

### Glass-Morphism Design
- Modern, translucent UI elements
- Beautiful depth and layering
- Responsive and accessible
- Consistent across all views

### Calendar Synchronization
- Import from Gmail/Outlook
- Export timed events
- Handle conflicts gracefully
- Maintain separation between planned and scheduled

## Database Schema (Future)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR NOT NULL,
  description TEXT,
  level VARCHAR NOT NULL,
  parent_level VARCHAR,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  is_all_day BOOLEAN DEFAULT FALSE,
  is_synced BOOLEAN DEFAULT FALSE,
  external_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Calendar integrations
CREATE TABLE calendar_integrations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  provider VARCHAR NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Success Metrics

### Phase 1 Success Criteria
- Users can create and manage events at all hierarchy levels
- Drag & drop works smoothly between all backlogs
- UI is visually appealing and responsive
- Local data persists correctly
- Performance is smooth on modern devices

### Long-term Success Metrics
- User adoption and retention
- Calendar integration usage
- Mobile app downloads
- Team collaboration features usage
- User satisfaction scores

## Risk Mitigation

### Technical Risks
- **Complex State Management**: Use proven patterns with Zustand
- **Performance**: Implement virtualization for large datasets
- **Browser Compatibility**: Use modern web standards with fallbacks

### Product Risks
- **User Adoption**: Focus on intuitive UX and clear value proposition
- **Calendar Integration**: Start with simple sync, add complexity gradually
- **Mobile Performance**: Use React Native for code sharing and performance

## Next Steps

1. Complete Phase 1 prototype with all core features
2. User testing and feedback collection
3. Iterate on UX based on feedback
4. Begin Phase 2 calendar integration planning
5. Prepare for mobile app development
