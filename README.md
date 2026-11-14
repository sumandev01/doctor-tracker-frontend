# 🩺 Doctor Tracker — Frontend Web Client
> **Care Guide BD — Full Stack Web Developer Candidate Technical Assessment**  
> **Author:** Suman Dev (`sumondav444@gmail.com`)  
> **Tech Stack:** Next.js 16.4 (App Router, Turbopack), React 19, Tailwind CSS v4, Lucide React  

---

## 🌟 Overview
Doctor Tracker Web Client is an intuitive, responsive hospital management portal designed for **Care Guide BD**. It provides seamless tracking of specialist doctors, patient admissions, and dynamic workload distributions, all integrated with a live cloud-backed REST API.

---

## ✨ Key Features
- **2-Tier RBAC & Strict Edge Route Guard:**
  - Next.js Edge Middleware (`src/middleware.js`) intercepts all server requests.
  - Non-logged-in users attempting to access protected routes are bounced directly to `/login`.
  - Clinical Staff users are strictly prohibited from viewing or accessing the `/users` directory (sidebar item is completely removed, and direct URL navigation triggers immediate redirection).
- **Dual-Key Cryptographic Integration:**
  - Automatically manages dynamic `sessionSecret` and cryptographic JWT tokens seamlessly across all asynchronous requests.
- **Doctor Management:**
  - Real-time search, specialization filtering, pagination, and assigned patient drawer.
  - Real-time assign/reassign patient modal.
- **Patient Registry:**
  - Comprehensive patient registry with status indicators (`Critical`, `Stable`, `Follow-up`, `Recovered`).
  - Doctor assignment and patient profile updating.
- **Dynamic Executive Dashboard:**
  - 4 Key Performance Indicator (KPI) cards calculated in real-time from cloud MongoDB database.
  - Doctor workload distribution visualization.
- **Reviewer-Friendly QuickFill:**
  - Login page includes 1-click **[QuickFill: Admin]** and **[QuickFill: Staff]** buttons to enable instantaneous assessment review.

---

## 🛠️ Project Structure
```
frontend/
├── src/
│   ├── app/                # Next.js App Router (Dashboard, Doctors, Patients, Users, Login)
│   ├── components/
│   │   ├── layout/         # AppLayout, Sidebar, Header, MobileNav
│   │   └── ui/             # Reusable Atomic UI Components (Button, Card, Badge, Modal, Input, Pagination)
│   ├── lib/                # Shared utilities & class merging (clsx, tailwind-merge)
│   ├── services/           # Decoupled Data Service communicating with Backend REST API
│   └── middleware.js       # Next.js Edge Route & Role Guard
├── .env.local.example      # Environment configuration template
└── package.json
```

---

## 🚀 Quick Setup & Installation

### 1. Prerequisites
- Node.js v18+ (tested on Node v22.13.0)
- Running Backend REST API instance (default: `http://localhost:5000/api`)

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/<your-username>/doctor-tracker-frontend.git
cd doctor-tracker-frontend
npm install
```

### 3. Configure Environment Variables
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```
Configure your backend API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🔑 Assessment Test Credentials
| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Administrator** | `admin@careguide.bd` | `Admin@123` | Full access (Dashboard, Doctors, Patients, Staff Directory) |
| **Clinical Staff** | `staff@careguide.bd` | `Staff@123` | Restricted access (Dashboard, Doctors, Patients; blocked from `/users`) |

---

## 📄 License
This project was developed for the **Care Guide BD Technical Assessment**.
