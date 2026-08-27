# DevMomentum

**Turn daily effort into placement-ready progress.**

A premium, fully interactive placement-preparation planner built with pure HTML, CSS, and vanilla JavaScript — designed to feel like a modern productivity SaaS product rather than a static checklist or PDF.

---

## ✨ Project Description

DevMomentum turns a static study roadmap into a living, data-driven web app.

Every task, date, category, tip, warning, and timeline milestone is loaded dynamically from a single `roadmap.json` file. Nothing is hardcoded into the HTML or JavaScript.

Replace the contents of `roadmap.json` with a different roadmap and the entire application — dashboard, daily view, weekly view, monthly view, statistics, timeline, warnings, and printable planner — automatically reflects the new plan.

The application tracks DSA, Development, DSA-Sheet, and Revision tasks while automatically calculating daily, weekly, monthly, and overall progress.

DevMomentum also includes an automatic scheduling system. Tasks can be rescheduled, reordered, completed, edited, duplicated, or deleted while keeping the rest of the roadmap synchronized.

---

## 🎨 Design System

DevMomentum uses a professional blue-based SaaS design system focused on clarity, consistency, and productivity.

| Token | Hex | Use |
|---|---|---|
| Background | `#FFFFFF` | Page background |
| Surface | `#F4F7FB` | Cards and panels |
| Border | `#E1E8F1` | Borders and dividers |
| Primary | `#123A66` | Headings and primary buttons |
| Primary Light | `#1F5691` | Hover states |
| Accent | `#2E75D6` | Interactive highlights and links |
| Text | `#1C2B3A` | Main content |
| Text Muted | `#63758A` | Secondary content |
| Success | `#2E9E6B` | Completed states |
| Warning | `#D98324` | Warning cards |
| Danger | `#D1495B` | Overdue and destructive actions |

A matching dark theme uses lighter blue tones against a near-navy background.

The selected theme is persisted using Local Storage.

---

## 🚀 Features

### 📅 Core Planning

- **Dynamic data model** — tasks, dates, categories, difficulty, priority, tips, warnings, scheduling information, and timeline milestones are loaded from `roadmap.json`
- **Daily / Weekly / Monthly / Statistics views** — all views remain synchronized with task completion
- **Missed-task auto-rollover** — incomplete tasks automatically appear in the current workload
- **Overdue tracking** — missed tasks display the number of days they are overdue
- **Accountability messages** — rotating messages encourage users to complete overdue work
- **Automatic scheduling engine** — reschedule tasks to tomorrow, next week, or a custom date
- **Automatic task shifting** — subsequent tasks can shift according to scheduling rules
- **Drag-and-drop reordering** — reorder tasks within a day
- **Task management** — add, edit, duplicate, reschedule, and delete tasks
- **Smart warning cards** — demanding topics can automatically display additional preparation guidance
- **Smart Time Management** — recommended weekday and weekend study-hour allocation is loaded from JSON

---

### 📊 Dashboard & Insights

- Today's task count
- Weekly completion percentage
- Monthly completion percentage
- Overall roadmap completion
- Completed task count
- Pending task count
- Current streak
- Longest streak
- XP and current level
- Daily tips
- Coding tips
- Interview tips
- Placement tips
- Category completion chart
- Overall completion ring chart
- Interactive roadmap timeline
- Clickable timeline milestones

All progress values are calculated from the application's actual task state.

---

### 🎯 Productivity Features

#### Theme Toggle

Switch between:

- Light theme
- Dark theme

The selected theme persists between sessions.

The application can also respect the user's system preference on the first visit.

#### Command Palette

Quickly search the roadmap using:

`Ctrl + K`

on Windows/Linux or:

`Cmd + K`

on macOS.

#### Floating Action Button

Provides quick access to common actions such as:

- Add Task
- Open Command Palette
- Scroll to Top

#### Scroll to Top

A smooth scroll-to-top control improves navigation on long roadmap pages.

#### Confetti Interaction

A lightweight confetti interaction appears when all tasks for a day are completed.

#### Completion Certificate

A certificate modal appears when the complete roadmap has been finished.

#### XP & Level System

Completed tasks award XP according to task difficulty.

The level system progresses from:

**Level 1 → Level 100**

---

### 🖨️ Printable Planner

DevMomentum includes a dedicated printable planner rather than simply printing the existing application interface.

Users can choose:

- Today's Tasks
- This Week
- Full Roadmap

The generated planner includes:

- DevMomentum branding
- Progress summary
- Task information
- Dates
- Checkbox-style task tracking
- Tasks grouped by day

The browser's print dialog can be used to save the planner as a PDF.

#### How to Use

1. Open **Settings**.
2. Select **Printable Planner**.
3. Select the required scope.
4. Click **Print / Export PDF**.
5. Select **Save as PDF** in the browser print dialog.

---

### 💾 Backup & Restore

DevMomentum allows users to export their local application data as JSON.

Backup information can include:

- Task completion
- Notes
- Streaks
- Rescheduled tasks
- Progress
- Preferences

The exported JSON can later be imported to restore the saved state.

---

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + K` | Open Command Palette |
| `T` | Toggle theme |
| `1–5` | Navigate between major sections |
| `Esc` | Close dialogs |

---

## 🧠 Technical Architecture

DevMomentum intentionally uses a lightweight architecture without frontend frameworks or build tools.

The roadmap content is separated from the application logic.

The basic data flow is:

    roadmap.json
         ↓
    Data Loading
         ↓
    Application State
         ↓
    Rendering Engine
         ↓
    Dashboard / Daily / Weekly / Monthly / Statistics
         ↓
    User Interaction
         ↓
    Updated State

This architecture allows the same application to support different preparation roadmaps without rewriting the core interface.

---

## 🛠️ Technologies Used

| Layer | Technology |
|---|---|
| Structure | Semantic HTML5 |
| Styling | CSS3 |
| Layout | CSS Grid, Flexbox |
| Behavior | Vanilla JavaScript (ES6+) |
| Data | JSON |
| Persistence | Browser Local Storage |
| Charts | Custom CSS and JavaScript |
| Fonts | Google Fonts — Poppins and Inter |

### No Framework Dependency

DevMomentum does not require:

- React
- Vue
- Angular
- jQuery
- Tailwind CSS
- Bootstrap
- Firebase

No build system or bundler is required.

---

## 📁 Folder Structure

    devmomentum/
    ├── index.html
    ├── style.css
    ├── script.js
    ├── roadmap.json
    ├── assets/
    │   └── icons/
    ├── README.md
    ├── WIDGET.md
    └── CONTRIBUTING.md

### File Responsibilities

| File | Purpose |
|---|---|
| `index.html` | Application shell and semantic markup |
| `style.css` | Design system, themes, responsive styles, and animations |
| `script.js` | Application logic, rendering, state management, and interactions |
| `roadmap.json` | Tasks, tips, warnings, timeline, and scheduling data |
| `WIDGET.md` | Documentation for application widgets |
| `CONTRIBUTING.md` | Contribution guidelines |

---

## 🔄 Reusing DevMomentum for Another Roadmap

DevMomentum is designed to be reusable.

Replace the contents of:

`roadmap.json`

with your own roadmap while maintaining the supported data structure.

The roadmap can contain sections such as:

- `meta`
- `quotes`
- `tips`
- `warnings`
- `smartSchedule`
- `timeline`
- `tasks`
- `notes`

Once the new roadmap is loaded, the application can automatically update:

- Dashboard
- Daily view
- Weekly view
- Monthly view
- Statistics
- Progress calculations
- Warning cards
- Timeline
- Scheduling information
- Printable planner

This data-driven approach allows the application logic to remain separate from the roadmap content.

---

## 🌱 Open Source Contribution Areas

DevMomentum provides multiple areas where contributors can contribute.

### Frontend

- UI/UX improvements
- Responsive design
- Accessibility improvements
- Animations
- Interaction improvements
- Theme improvements

### Application Logic

- Scheduling engine
- Progress calculations
- Streak calculations
- XP and level system
- Task management
- Search functionality

### Data

- Roadmap validation
- JSON schema improvements
- Import/export improvements
- Data consistency

### Performance

- Rendering optimization
- DOM optimization
- Local Storage optimization
- Reduced unnecessary calculations

### Documentation

- README improvements
- Widget documentation
- Contribution documentation
- Developer documentation
- User guides

### Quality

- Bug fixes
- Testing
- Cross-browser improvements
- Accessibility testing

---

## 🔭 Future Improvements

Potential future enhancements include:

- Cloud synchronization
- Cross-device persistence
- Firebase or Supabase integration
- Native PDF generation
- Recurring task templates
- Multiple roadmap support
- Roadmap switching
- Browser notifications
- Upcoming-task reminders
- Collaborative roadmaps
- Study-group functionality
- Advanced analytics
- Optional chart-library integration
- User accounts and authentication
- Automated testing

---

## 🤝 Contributing

Contributions are welcome.

Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before submitting changes.

---

## 📜 License

This project is intended to be developed as an open-source project.

License details can be added according to the open-source license selected for the repository.

---

## ⭐ Project Philosophy

DevMomentum is built around a simple idea:

**Consistent daily effort creates measurable progress.**

The goal is to make placement preparation more structured, trackable, and sustainable while providing an enjoyable productivity experience.

---

**DevMomentum — Plan consistently. Track progress. Build momentum.**
