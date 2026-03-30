# 🧠 AI Coding Guidelines (Universal for Amazon Q + Copilot)

## 🎯 Goal
Generate scalable, clean, and production-ready code with minimal duplication and strong architecture.

---

## 🏗️ Architecture Rules

- Use **feature-based structure**, not type-based
- Keep modules isolated and reusable

Example:
/modules
/attendance
attendance.controller.js
attendance.service.js
attendance.model.js
attendance.routes.js


---

## 🔁 Reusability First

- NEVER duplicate logic
- ALWAYS:
  - Extract into services
  - Use hooks (React)
  - Create shared utilities

Bad:
❌ Same logic repeated in multiple files

Good:
✅ Shared `attendanceService` or `useAttendance`

---

## ⚛️ Frontend Rules (React)

- Use only **functional components**
- Keep logic in **custom hooks**
- UI must use **consistent component library (ShadCN UI)**
- Avoid large components (>200 lines)

Structure:

/components
/hooks
/services
/pages


---

## 🔌 API & Backend Rules

- Follow REST standards strictly:
  - GET → fetch
  - POST → create
  - PUT/PATCH → update
  - DELETE → remove

- Always include:
  - Validation layer
  - Error handling
  - Consistent response format

Example response:
```json
{
  "success": true,
  "data": {},
  "message": "Success"
}

🛢️ Database Rules
Avoid duplicate tables
Normalize schema properly
Use indexes for performance
Combine similar entities smartly
🧹 Clean Code Rules
Remove:
unused imports
dead code
commented junk
Prefer:
early returns
small functions
meaningful naming
🧠 Smart Refactoring Behavior

When AI reads existing code:

Detect duplicate components → merge them
Detect repeated logic → extract services
Suggest better folder structure
Optimize large files
🔐 Security Rules
Validate all inputs
Sanitize user data
Use authentication (JWT / Laravel Passport)
Never expose sensitive data
⚡ Performance Rules
Avoid unnecessary API calls
Use lazy loading (React)
Optimize DB queries
🎨 UI/UX Rules
Follow consistent spacing, colors, typography
Use reusable UI components
Maintain design system
🧪 Code Review Checklist

Before generating code, ensure:

✅ No duplication
✅ Modular structure
✅ Clean and readable
✅ Scalable approach
✅ Proper naming conventions
🧩 Naming Conventions
Variables → camelCase
Components → PascalCase
Files → kebab-case or PascalCase
Constants → UPPER_CASE
🚀 Output Style (IMPORTANT)

When generating code, ALWAYS:

Step 1: Folder Structure
Step 2: Implementation Code
Step 3: Short Explanation
🧬 Project Context
Gym Management System
Role-Based Access (Admin, Trainer, Member)
Attendance Tracking (Check-in / Check-out logic)
Workout Plans
Notifications System
🧠 AI Behavior Mode

Act like:
👉 Senior Software Engineer (10+ years experience)

Focus on:

Scalability
Maintainability
Clean architecture

Avoid:

Quick hacks
Duplicate code
Over-engineering