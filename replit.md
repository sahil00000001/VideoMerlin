# Video Management Interface for Beauty Salon Consultation Tool

## Overview
A complete React-based video consultation analysis tool designed for beauty salons. Features video playback with interactive timeline, auto-scrolling transcript, AI-generated summaries and reports, and file upload with processing progress.

## Purpose
Enable beauty salon professionals to review consultation videos with color-coded timeline segments, click-to-seek transcript navigation, speaker analysis, and export capabilities.

## Current State
✅ Fully implemented and working with backend integration
✅ All frontend components complete with terracotta theme
✅ Backend API with file upload, storage, and CRUD operations
✅ React Query integration for data fetching
✅ Architect approved (PASS verdict)

## Recent Changes (October 29, 2025)
- Fixed backend integration to fetch real data from /api/videos
- Implemented video upload flow with backend persistence
- Added loading and error states with beautiful UI
- Fixed VideoPlayer ref to properly expose ReactPlayer instance
- Added null checks for seek functionality to prevent errors
- Configured server to serve uploaded files from /uploads directory
- All interactive features (timeline, transcript, player controls) working correctly

## Project Architecture

### Frontend (React + TypeScript + Vite)
- **VideoManager.tsx** - Main page orchestrating all components, data fetching with React Query
- **VideoUpload.tsx** - Drag-and-drop upload with file validation and progress animation
- **VideoPlayer.tsx** - ReactPlayer integration with custom controls, playback speed, volume, fullscreen
- **Timeline.tsx** - Interactive color-coded segments with tooltips and click-to-seek
- **TranscriptPanel.tsx** - Scrollable transcript with speaker badges, search, auto-scroll, click-to-seek
- **SummaryCard.tsx** - AI-generated summary with key highlights
- **ReportTabs.tsx** - Tabbed analysis showing topics, speakers with pie chart, decisions/actions

### Backend (Express + MemStorage)
- **server/routes.ts** - REST API endpoints:
  - GET /api/videos - Fetch all videos with metadata
  - POST /api/videos/upload - Upload video with multer, validate, store metadata
- **server/storage.ts** - In-memory storage interface for video data persistence
- **server/index.ts** - Express server with multer configuration, file serving from /uploads

### Shared
- **shared/schema.ts** - TypeScript types and Zod schemas for VideoData, TimelineSegment, TranscriptLine, Analysis, etc.

## Design System (Terracotta Theme)
- Primary: #AF4C0F (warm terracotta)
- Secondary: #582308 (deep brown)
- Design guidelines in design_guidelines.md
- All components follow universal_design_guidelines for consistency

## Key Features
1. **Video Player**
   - ReactPlayer with custom controls
   - Playback speed (0.5x - 2x)
   - Volume control with mute
   - Fullscreen mode
   - Progress bar with seek
   - Keyboard shortcuts (Space, Arrow keys)

2. **Interactive Timeline**
   - Color-coded segments (consultation, treatment, followup, general)
   - Tooltips showing topic and time
   - Click to seek to segment
   - Current segment highlighting

3. **Transcript Panel**
   - Auto-scroll to current line
   - Speaker identification with badges
   - Search functionality
   - Click any line to seek to that timestamp
   - Current line highlighting

4. **Analysis Reports**
   - AI-generated summary with highlights
   - Topics discussed with timestamps
   - Partial topics identified
   - Speaker analysis with pie chart (recharts)
   - Decisions and action items

5. **Video Upload**
   - Drag-and-drop interface
   - File validation (video files only)
   - Processing progress animation
   - Integration with backend API

6. **Export & Share**
   - Export transcript as .txt file
   - Share link via clipboard
   - Upload additional videos

## Technical Stack
- React 18 with TypeScript
- Wouter for routing
- TanStack React Query for data fetching
- react-player for video playback
- shadcn/ui components with Radix UI
- Tailwind CSS for styling
- Recharts for data visualization
- Express backend with multer for file uploads
- Zod for validation
- MemStorage for persistence

## API Endpoints
- `GET /api/videos` - Fetch all videos (returns VideoData[])
- `POST /api/videos/upload` - Upload video file (accepts multipart/form-data)
- `GET /uploads/:filename` - Serve uploaded video files

## Sample Data
Sample video data is available in shared/schema.ts for development/testing purposes. Production flow uses uploaded videos.

## Running the Application
```bash
npm run dev
```
Server runs on port 5000 with Vite frontend and Express backend on same port.

## User Preferences
- Beauty salon aesthetic with terracotta color scheme
- Emphasis on visual quality and smooth interactions
- Professional, elegant design with attention to detail
- Responsive design for various screen sizes

## Next Steps (from Architect)
1. Run end-to-end regression tests (upload, seek, transcript export)
2. Add automated tests around upload/refetch flow
3. Monitor storage requirements if moving beyond in-memory persistence
4. Consider database integration for production use
