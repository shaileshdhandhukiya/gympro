# 🧠 AI Agent Skills – Code Generation

## 🎯 Objective
Generate clean, scalable, production-ready code following best practices, avoiding duplication, and maintaining consistency across the project.

---

## 🧱 Core Principles

- Write **modular, reusable, and maintainable code**
- Follow **DRY (Don't Repeat Yourself)** principle
- Prefer **composition over duplication**
- Maintain **consistent naming conventions**
- Keep **files small and focused**
- Use **clear separation of concerns (SOC)**

---

## ⚙️ Tech Stack Awareness

### Frontend
- React.js (Functional Components + Hooks)
- Tailwind CSS / ShadCN UI
- State Management (Context / Redux if needed)
- API Integration using Axios / Fetch

### Backend
- Laravel (API + MVC structure)
- Node.js (Express.js for APIs)
- RESTful API design

### Database
- MySQL / MongoDB
- Proper schema design
- Avoid redundant tables

---

## 🧩 Code Generation Rules

### 1. Structure First
- Always define folder structure before writing code
- Follow feature-based structure:

```
/modules
/attendance
/users
/workouts
```


---

### 2. Avoid Duplication
- If similar logic exists:
- Extract into helper / service / hook
- Reuse existing components

---

### 3. Component Guidelines (React)
- Use **functional components only**
- Use **custom hooks for logic reuse**
- Keep UI and logic separate
- Use **ShadCN UI components** for consistency

---

### 4. API Design
- Follow REST conventions:
- GET → fetch
- POST → create
- PUT/PATCH → update
- DELETE → remove
- Always include:
- Validation
- Error handling
- Standard response format

---

### 5. Naming Conventions
- Variables: `camelCase`
- Components: `PascalCase`
- Files: `kebab-case` or `PascalCase`
- Constants: `UPPER_CASE`

---

### 6. Clean Code Rules
- Remove unused imports, variables, and functions
- Avoid deeply nested logic
- Use early returns
- Add meaningful comments only where needed

---

### 7. Performance Optimization
- Avoid unnecessary re-renders
- Use lazy loading where possible
- Optimize queries (no redundant DB calls)

---

### 8. Security Practices
- Validate all inputs
- Sanitize data
- Protect APIs with authentication (JWT / Laravel Passport)

---

### 9. UI/UX Consistency
- Follow consistent design system (ShadCN / Tailwind)
- Reuse UI components
- Maintain spacing, typography, and colors

---

### 10. Code Review Checklist
Before final output:
- ✅ No duplicate logic
- ✅ No dead code
- ✅ Proper folder structure
- ✅ Scalable approach used
- ✅ Readable and clean

---

## 🧠 Smart Refactoring Behavior

When reviewing existing code:
- Merge duplicate components
- Combine similar database tables if possible
- Convert repeated logic into reusable modules
- Suggest better architecture if needed

---

## 🚀 Special Instructions

- Always think like a **Senior Developer (10+ years experience)**
- Prioritize **long-term scalability over quick hacks**
- If multiple approaches exist → suggest the best one with reason
- Keep output **production-ready**, not demo-level

---

## 🧩 Example Behavior

Instead of:
❌ Writing duplicate attendance logic in multiple places

Do:
✅ Create a reusable `useAttendance` hook or `AttendanceService`

---

## 📌 Output Format

- Step 1: Folder Structure
- Step 2: Code Implementation
- Step 3: Explanation (short and clear)

---

## 🧬 Project Awareness (Optional)

- Gym Management System
- Role-Based Access (Admin, Trainer, Member)
- Attendance Tracking
- Workout Plans
- Notifications

---

