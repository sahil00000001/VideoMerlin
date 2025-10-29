# Video Management Interface - Design Guidelines

## Design Approach
**Utility-Focused Application**: This is a professional tool for beauty salon consultations requiring efficiency, clarity, and seamless interaction. The design prioritizes usability and information accessibility while maintaining a modern, polished aesthetic aligned with the beauty/wellness industry.

## Color Palette
- **Primary**: #AF4C0F (Terracotta)
- **Secondary**: #582308 (Dark Brown)
- **Background**: #FAFAFA (Light Gray)
- **Card Background**: White (#FFFFFF)
- **Timeline Segment Colors**: #E8F4F8 (Blue), #FFE5E5 (Pink), #FFF4E5 (Yellow), #E8F8E8 (Green)

## Typography
- **Headers**: Inter or Poppins (sans-serif, clean, modern)
- **Body Text**: 14-16px, readable sans-serif
- **Timestamps**: Monospace font for precision
- **Speaker Labels**: Bold, colored badges

## Layout System

**Desktop Layout (≥1024px)**:
- Two-column grid: 70% video/timeline, 30% transcript
- Video player: Full-width within its column
- Timeline bar: Directly below video, full-width
- Transcript: Fixed-width sidebar, scrollable
- Summary/Report: Below video column or full-width section

**Mobile Layout (<1024px)**:
- Single column, vertical stack
- Video player: Full-width
- Timeline: Full-width below video
- Transcript: Full-width, collapsible
- Summary/Report: Full-width, collapsible

**Spacing**:
- Use Tailwind spacing units: 2, 4, 6, 8 for consistency
- Card padding: p-6
- Section spacing: gap-4 to gap-8
- Component margins: my-4 to my-8

## Component Specifications

**Video Player**:
- Full-width responsive container
- Aspect ratio 16:9
- Custom controls overlay with terracotta accents
- Sticky positioning on scroll (desktop)
- Rounded corners (8px)
- Subtle shadow for depth

**Timeline Bar**:
- Horizontal segments with proportional widths based on duration
- Height: 60-80px
- Each segment shows: Topic name (truncated), time range
- Segment borders: 2px white separator
- Rounded corners on outer edges (8px)
- Hover state: Slight scale (1.02), shadow elevation
- Active segment: Darker shade, subtle pulsing indicator

**Transcript Panel**:
- White card background
- Rounded corners (8px)
- Subtle shadow (shadow-md)
- Each transcript line:
  - Timestamp badge: Monospace, gray background, rounded
  - Speaker badge: Colored (different color per speaker), rounded pill
  - Text: 14-16px, line-height 1.6
- Current line highlight: Terracotta background (light tint), left border accent
- Hover state: Light gray background
- Auto-scroll behavior: Smooth scroll to keep current line in view

**Upload Section**:
- Large drag-drop zone (min-height: 400px)
- Dashed border (3px), rounded (12px)
- Centered icon and text
- Hover state: Terracotta border, background tint
- Processing modal: Centered overlay with progress steps, checkmarks for completed steps

**Summary & Report Cards**:
- White background, rounded (8px), shadow-md
- Collapsible headers with icons (chevron)
- Tab navigation: Underline active tab with terracotta accent
- Content padding: p-6
- Bullet points with custom terracotta markers
- Pie chart: Recharts with terracotta color scheme

## Interactions & Animations

- Smooth transitions (200-300ms ease-in-out)
- Hover effects: Subtle scale (1.01-1.02) or shadow elevation
- Loading skeletons: Shimmer effect during processing
- Tooltip animations: Fade in (150ms), slide up (5px)
- Scroll behavior: Smooth auto-scroll for transcript
- Keyboard shortcuts visual feedback: Brief highlight on action

## Accessibility
- High contrast text (WCAG AA minimum)
- Focus states: 2px terracotta outline with offset
- Keyboard navigation support for all interactive elements
- ARIA labels for video controls and timeline segments
- Clickable areas: Minimum 44x44px touch targets

## Icons
Use Lucide React icons exclusively:
- Play/Pause, Volume, Fullscreen for video controls
- Upload, File, Check for upload section
- Clock, User, MessageSquare for transcript
- BarChart, Users, FileText for report tabs
- ChevronDown/Up for collapsible sections

## Component Library

**Buttons**:
- Primary: Terracotta background, white text, rounded (6px)
- Secondary: Outlined terracotta border, terracotta text
- Icon buttons: Circular, 40x40px, hover background tint
- Padding: px-6 py-3 for standard buttons

**Cards**:
- White background, rounded (8px)
- Shadow: shadow-md (elevation 2)
- Hover: shadow-lg (elevation 3)

**Badges**:
- Rounded pill shape (9999px)
- Padding: px-3 py-1
- Small text (12-14px)

**Form Elements** (if needed):
- Border: 1px solid gray-300
- Rounded: 6px
- Focus: 2px terracotta ring

This design creates a professional, efficient video analysis tool with a warm, approachable aesthetic suitable for the beauty salon industry while maintaining clarity and usability for data-intensive interactions.