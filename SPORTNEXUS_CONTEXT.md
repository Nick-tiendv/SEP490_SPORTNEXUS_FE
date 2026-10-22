# SPORTNEXUS CONTEXT

## 1. Project Overview

**Project name:** SportNexus

SportNexus is a sports court discovery, booking, payment, and player connection system. The project is developed by a student Software Engineering team as a graduation project.

The system includes Web and App experiences and supports the following main roles:
- Player / User
- Court Owner
- Admin
- AI Assistant

The project is being developed over approximately 15 weeks.

---

## 2. Main Flows

### Flow 1: Booking & Payment
Player searches for a sports facility → selects an available court → selects date/time → provides booking information → pays for the booking.

### Flow 2: LFG (Looking for Group)
Players can create or join sports activities and find additional participants. Participants can claim available player slots and receive updates/notifications.

### Flow 3: Wallet
Users have a SportNexus wallet for:
- Top up
- Withdraw
- Transfer
- Pay for bookings
- Split court fees among participants when supported

### Flow 4: AI Assistant
An AI-powered conversational assistant can help users:
- Search for courts
- Recommend courts
- Complete bookings
- Create LFG activities
- Interact using natural language

### Flow 5: Court Owner
Court Owners can:
- Manage their account
- Manage sports facilities
- Manage courts
- Manage booking time grids
- Manage pricing
- Manage court maintenance schedules
- Manage bookings

---

## 3. Functional Requirements

### FE-01
Search for sports facilities and view available courts based on sport type, location, date, and time.

### FE-02
Create individual or group court bookings and split court fees among multiple participants through the SportNexus wallet.

### FE-03
Create and join Looking for Group (LFG) activities, claim available player slots, and receive real-time updates and notifications.

### FE-04
Use an AI-powered conversational assistant to search for courts, receive recommendations, complete bookings, and create LFG activities using natural language.

### FE-05
Register and manage court owner accounts, sports facilities, courts, booking time grids, pricing, and court maintenance schedules.

---

## 4. Technology Stack

### Frontend
- React.js
- Vite
- Axios
- JWT Decode
- Tailwind CSS
- Ant Design
- Swiper

### Backend
- Java
- Spring Boot
- MySQL
- Swagger

### Development tools
- Visual Studio Code for Frontend
- IntelliJ IDEA for Backend
- Git / GitHub for source control
- Figma for UI design

### Frontend repository
`https://github.com/Nick-tienvd/SEP490_SPORTNEXUS_FE.git`

### Frontend folder
`SEP490_SPORTNEXUS_FE`

---

## 5. Frontend Development Rules

The frontend uses React + Vite.

Prefer a clear component structure such as:

```text
src/
├── components/
├── pages/
├── layouts/
├── services/
├── hooks/
├── utils/
└── assets/
```

Use:
- Axios for API communication
- JWT Decode for JWT-related client-side information when required
- Tailwind CSS for styling
- Ant Design where appropriate
- Swiper where appropriate

Do not put the entire application into one large component.

Prefer reusable components.

---

## 6. UI / Figma Rules

The team designs the UI in Figma.

When converting Figma designs into React:
- Keep the layout close to the Figma design.
- Keep colors, spacing, typography, cards, inputs, buttons, and border radius consistent.
- Preserve the intended user flow.
- Make components reusable.
- Keep the UI responsive where required.
- Do not redesign a screen unless explicitly requested.

The UI includes both Player/User and Court Owner experiences.

---

## 7. Authentication UI

Current authentication direction:

### Login
Users normally log in using:
- Username
- Password

Email is not the normal login identifier.

### Registration
Registration may include:
- Full name
- Username
- Email
- Password
- Confirm password

### Forgot Password
Typical flow:
Email → reset link → set a new password.

Always follow the latest UI/requirements supplied by the team if they differ from this context.

---

## 8. Backend Architecture

The backend uses Spring Boot and MySQL.

Prefer a clear architecture:

```text
Controller
    ↓
Service
    ↓
Repository / DAO
    ↓
Database
```

Use DTOs and Entities where appropriate.

Swagger is used for API documentation/testing.

APIs should be designed clearly so the React frontend can consume them through Axios.

---

## 9. Reports and Documentation

The project also requires graduation reports and technical documentation.

When helping with reports:
- Use a natural student writing style.
- Avoid unnecessarily complicated academic language.
- Do not invent functionality that does not exist.
- Keep terminology consistent with SportNexus.
- Explain technical terms simply when needed.

Potential documentation topics:
- Functional Requirements
- Business Requirements
- Use Case
- Main Flows
- Context Diagram
- System Architecture
- Database
- UI descriptions
- Testing
- Project reports
- Presentation

---

## 10. How AI Assistance Should Work

When helping this project:

### For coding questions
1. Identify the problem.
2. Explain the cause briefly.
3. Tell which file should be changed.
4. Give the exact code or command.
5. Explain where to put it.
6. Mention possible effects on other parts when relevant.

### For screenshots/errors
1. Read the screenshot carefully.
2. Identify the error.
3. Explain why it happens.
4. Give step-by-step fixes.

### For Figma/UI
1. Analyze the screen first.
2. Identify reusable components.
3. Then provide React/Tailwind implementation.

### Important
- Prefer simple, maintainable code.
- Do not make unnecessary architectural changes.
- Do not invent APIs, database fields, or features.
- When new requirements conflict with this document, follow the latest explicit team requirement.
