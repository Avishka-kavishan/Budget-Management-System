# 📊 Budget Management System (ESDFP)

A modern, full-stack Budget & Project Management web application built for education departments and organizations with Next.js 16, React 19, Tailwind CSS, Prisma ORM, and SQLite/PostgreSQL.

---

## ✨ Features

- **Multi-Role Authentication & Access Control:**
  - **Admin:** Manage users, projects, voting sessions, and review all budgets.
  - **Accountant:** Review submitted estimates, add accountant remarks, and verify actual expenditures.
  - **User (Staff / Project Lead):** Create and track estimated and actual budgets, download Excel/PDF reports, vote on project proposals.
- **Estimated & Actual Budget Lifecycles:** Complete multi-stage workflow from draft submission to accountant review and admin approval.
- **Project Voting System:** Democratic voting module with secure token-verified ballots.
- **Excel Export:** Automated spreadsheet export for budget submissions and reports.
- **Modern Responsive UI:** Glassmorphism-inspired design with rich dashboards and status trackers.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **UI Library:** [React 19](https://react.dev/) & [Tailwind CSS](https://tailwindcss.com/)
- **Database & ORM:** [Prisma ORM](https://www.prisma.io/) (SQLite default, PostgreSQL compatible)
- **Auth:** JWT authentication with [jose](https://github.com/panva/jose) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Spreadsheets:** [SheetJS (xlsx)](https://sheetjs.com/)

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Avishka-kavishan/Budget-Management-System.git
cd Budget-Management-System
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Initialize Database & Seed
```bash
npx prisma db push
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment

Check out the full [Deployment Guide](DEPLOYMENT.md) for 1-click deploy instructions on:
- **[Vercel](https://vercel.com)** (Recommended)
- **[Render](https://render.com)** (Uses included `render.yaml`)
- **[Railway](https://railway.app)**
- **Docker / Self-Hosted** (Uses included `Dockerfile`)

---

## 📄 License

This project is licensed under the MIT License.
