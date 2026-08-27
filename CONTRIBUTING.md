# Contributing to DevMomentum

Thank you for your interest in contributing to DevMomentum!

DevMomentum is an open-source, data-driven placement-preparation planner built with HTML, CSS, and vanilla JavaScript.

Contributions are welcome across UI/UX, JavaScript functionality, accessibility, performance, documentation, roadmap management, testing, and new productivity features.

---

## 🌱 Ways to Contribute

You can contribute by:

- Fixing bugs
- Improving UI/UX
- Adding productivity features
- Improving responsive behavior
- Improving accessibility
- Optimizing JavaScript
- Improving scheduling logic
- Improving progress calculations
- Improving the XP and level system
- Improving backup and restore
- Improving documentation
- Adding tests
- Improving performance
- Reporting reproducible bugs
- Reviewing pull requests

---

## 🛠️ Technology Stack

DevMomentum intentionally uses a lightweight technology stack:

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- JSON
- Browser Local Storage

The project does not require a frontend framework, build system, or bundler.

---

## 🚀 Getting Started

### 1. Get the Repository

Clone or download the repository using your preferred Git workflow.

### 2. Open the Project

DevMomentum is a static web application.

You can run it using a local development server.

For example, a static-server extension in VS Code can be used to serve the application locally.

### 3. Test the Existing Application

Before making changes, verify that the current application works correctly.

Check the major areas of the application, including:

- Dashboard
- Daily view
- Weekly view
- Monthly view
- Statistics
- Task completion
- Task editing
- Task deletion
- Task rescheduling
- Theme switching
- Command Palette
- Backup and restore
- Printable planner
- Responsive layouts

---

## 📂 Project Structure

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

---

## 🔀 Contribution Workflow

A typical contribution should follow this process:

    Find an Issue
         ↓
    Understand the Requirement
         ↓
    Discuss When Necessary
         ↓
    Implement the Change
         ↓
    Test Locally
         ↓
    Review Your Changes
         ↓
    Submit Pull Request
         ↓
    Address Review Feedback

---

## 🐛 Reporting Bugs

Before reporting a bug:

1. Check whether the issue has already been reported.
2. Confirm that the problem is reproducible.
3. Identify the affected feature.
4. Provide clear reproduction steps.
5. Mention the browser and device when relevant.
6. Include screenshots or console errors when useful.

A useful bug report should answer:

- What happened?
- What was expected?
- How can the issue be reproduced?
- Which feature is affected?
- Does the issue occur consistently?

---

## 💡 Feature Requests

Feature proposals are welcome.

Before implementing a significant feature, consider:

- Does it improve the planner?
- Does it fit DevMomentum's purpose?
- Does it work with the existing architecture?
- Does it introduce unnecessary complexity?
- Can it remain compatible with the data-driven roadmap system?
- Does it work across different screen sizes?

Large architectural changes should be discussed before implementation.

---

## 🧑‍💻 Coding Guidelines

### JavaScript

- Use modern ES6+ JavaScript.
- Keep functions focused and readable.
- Use descriptive variable and function names.
- Avoid unnecessary global variables.
- Reuse the existing application state where possible.
- Avoid duplicating business logic.
- Keep DOM manipulation organized.
- Preserve existing functionality when modifying shared logic.

### HTML

- Use semantic HTML elements.
- Maintain a logical document structure.
- Add accessible labels to interactive controls.
- Preserve keyboard navigation.
- Avoid unnecessary markup duplication.

### CSS

- Use the existing design system.
- Reuse CSS variables where applicable.
- Maintain responsive layouts.
- Test both light and dark themes.
- Avoid unnecessary one-off styles.
- Preserve existing accessibility and contrast.

### JSON

Keep `roadmap.json` valid and consistently structured.

Do not introduce malformed JSON.

Avoid changing the existing data structure unless the change is necessary and all dependent application logic is updated accordingly.

---

## ♿ Accessibility Guidelines

Contributions should preserve and improve accessibility.

Please consider:

- Keyboard navigation
- Focus management
- Semantic HTML
- ARIA attributes where appropriate
- Color contrast
- Screen-reader usability
- Reduced-motion preferences
- Touch-friendly controls
- Visible focus states
- Logical tab order

Accessibility improvements are especially welcome.

---

## 📱 Responsive Design

Changes should be tested across:

- Mobile
- Tablet
- Desktop
- Large screens

Avoid introducing layouts that work only at one viewport size.

When modifying UI components, verify that text, controls, cards, charts, and navigation remain usable at smaller screen sizes.

---

## 🧪 Testing Checklist

Before submitting a pull request, verify the affected functionality.

### Core Functionality

- [ ] Application loads without errors
- [ ] Existing tasks render correctly
- [ ] Task completion works
- [ ] Task editing works
- [ ] Task deletion works
- [ ] Task duplication works
- [ ] Task rescheduling works
- [ ] Drag-and-drop ordering works

### Progress

- [ ] Daily progress updates correctly
- [ ] Weekly progress updates correctly
- [ ] Monthly progress updates correctly
- [ ] Overall progress updates correctly
- [ ] Streak calculations remain correct
- [ ] XP calculations remain correct
- [ ] Level calculations remain correct

### UI

- [ ] Light theme works
- [ ] Dark theme works
- [ ] Responsive layout works
- [ ] Keyboard navigation works
- [ ] Command Palette works
- [ ] Dialogs open and close correctly
- [ ] No major console errors are introduced

### Data

- [ ] `roadmap.json` remains valid
- [ ] Local Storage remains functional
- [ ] Backup export works
- [ ] Backup import works
- [ ] Existing saved progress is not unnecessarily lost

### Printable Planner

- [ ] Printable planner opens correctly
- [ ] Today's scope works
- [ ] Weekly scope works
- [ ] Full roadmap scope works
- [ ] Browser PDF export works

---

## 📦 Pull Requests

Keep pull requests focused.

A pull request should ideally address one issue or one closely related group of changes.

### Good Example

    Add keyboard navigation to task list

### Avoid

    Fix keyboard navigation + redesign dashboard + change roadmap schema + rewrite scheduling

Small, focused pull requests are easier to review, test, and maintain.

---

## 📝 Pull Request Description

A useful pull request description should include:

    ## What changed?

    Describe the implementation.

    ## What was tested?

    List the relevant tests or manual checks.

    ## Related Issue

    Reference the related issue when applicable.

Keep the description clear and concise.

---

## 🔍 Review Expectations

Pull requests may be reviewed for:

- Correctness
- Maintainability
- Accessibility
- Responsiveness
- Performance
- Code clarity
- Compatibility with existing features
- Data-model consistency
- Unnecessary dependencies
- Potential regressions

Review feedback is intended to improve the project and contribution quality.

Contributors are encouraged to discuss questions respectfully and address review comments constructively.

---

## 🚫 Avoid Unnecessary Changes

Please avoid unrelated modifications such as:

- Large formatting-only changes
- Rewriting unrelated files
- Removing existing functionality without discussion
- Adding unnecessary dependencies
- Changing the roadmap schema without a clear reason
- Modifying unrelated UI components
- Mixing multiple unrelated features into one pull request

Keeping changes focused makes collaboration easier.

---

## 🔐 Data & Privacy

DevMomentum primarily stores planner data locally in the browser.

Contributors should avoid introducing functionality that unnecessarily collects, transmits, or exposes user data.

If a proposed feature requires an external service or data collection, clearly explain the requirement in the issue or pull request.

---

## 📖 Documentation

Documentation improvements are always welcome.

If a feature changes:

- User behavior
- Configuration
- Data structure
- Contribution workflow
- Widget behavior
- Keyboard shortcuts

update the relevant documentation when appropriate.

Relevant documentation includes:

- `README.md`
- `WIDGET.md`
- `CONTRIBUTING.md`

---

## 🧩 Widget Contributions

When adding or modifying a widget:

1. Keep the widget focused on one responsibility.
2. Reuse the existing application state.
3. Avoid duplicating business logic.
4. Use data from `roadmap.json` where applicable.
5. Maintain responsive behavior.
6. Preserve keyboard accessibility.
7. Test light and dark themes.
8. Avoid unnecessary dependencies.
9. Update `WIDGET.md` when introducing a significant widget.

---

## ⚡ Performance Guidelines

DevMomentum is designed to remain lightweight.

When contributing:

- Avoid unnecessary DOM operations.
- Avoid repeated expensive calculations.
- Prefer efficient event handling.
- Avoid unnecessary external libraries.
- Keep animations smooth.
- Be careful when adding listeners to frequently updated elements.
- Avoid storing unnecessarily large objects in Local Storage.

---

## 🌐 Browser Compatibility

Changes should be tested in modern browsers where practical.

At minimum, contributors should consider:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari where available

---

## 🤝 Code of Conduct

All contributors are expected to maintain a respectful and welcoming environment.

Please:

- Be respectful.
- Be constructive.
- Avoid personal attacks.
- Explain technical disagreements professionally.
- Help new contributors understand the project.
- Keep discussions focused on improving the project.

---

## ⭐ Final Note

DevMomentum aims to make placement preparation more structured, measurable, and sustainable.

Whether you're fixing a small UI issue, improving accessibility, optimizing the scheduling engine, improving documentation, or adding a new productivity feature, every meaningful contribution helps make the project better.

**Thank you for contributing to DevMomentum!**
