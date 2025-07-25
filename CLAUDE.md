# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development Server
- `npm start` - Start development server at http://localhost:3000
- `npm test` - Run tests in watch mode  
- `npm run build` - Build production bundle
- `npm run eject` - Eject from Create React App (one-way operation)

### Testing
- `npm test` - Run all tests with Jest and React Testing Library
- Tests are located in `src/` with `.test.js` suffix

## Project Architecture

This is a React-based project dashboard application for visualizing and managing project tasks. The codebase follows Create React App conventions with additional Tailwind CSS styling.

### Key Components

**Main Application Flow:**
- `src/App.js` - Simple root component that renders ProjectDashboard
- `src/ProjectDashboard.jsx` - Core dashboard component handling all functionality

**ProjectDashboard Component Architecture:**
- **Data Loading**: Supports two input methods:
  1. JSON paste input for direct data entry
  2. File-based project loading from predefined projects in `/public/projects/`
- **Data Structure**: Expects task data in specific JSON format with either `master.tasks` or `tasks` array
- **State Management**: Uses React hooks for local state (tasks, filters, view modes, selected task)
- **Task Display**: Supports card view and list view modes with filtering by status and priority
- **Task Management**: Interactive status updates, detailed task modals with subtasks support

### Data Structure Requirements

The application expects JSON data in one of these formats:
```json
{
  "master": {
    "tasks": [...]
  }
}
```
or
```json
{
  "tasks": [...]
}
```

Each task should have: `id`, `title`, `description`, `status`, `priority`, optional `subtasks`, `dependencies`, `details`, `testStrategy`

### Project File System

- **Static Projects**: Located in `/public/projects/` with `tasks.json` files
- **Predefined Projects**: Hardcoded list in component includes CPUE prediction and test projects
- **Sample Data**: Example task structures available in `/projects/sample-project/tasks.json`

### Styling and UI

- **Framework**: Tailwind CSS for styling
- **Icons**: Lucide React icon library
- **Responsive Design**: Grid layouts adapt to screen sizes
- **Color System**: Status-based color coding (green=done, blue=in-progress, etc.)

### Task Status Workflow

Supported statuses: pending, in-progress, review, done, completed, deferred, blocked, cancelled

Priority levels: critical, high, medium, low

## Development Patterns

### Component Organization
- Single large component approach (ProjectDashboard handles all logic)
- Inline styling with Tailwind classes
- Event handlers defined as arrow functions within component

### State Management
- Local React state with useState hooks
- Derived state using useMemo for filtered data and statistics
- No external state management library

### Data Processing
- Client-side filtering and search
- Real-time statistics calculation
- Task status updates modify state directly

This is a self-contained dashboard application focused on task visualization and management, designed to work with various project task data formats.