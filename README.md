<div align="center">

# 🏢 SYNDIX

### Smart Building Management Platform for Algeria

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://syndix-gules.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

**[🌐 Live Demo](https://syndix-gules.vercel.app)** · **[📋 Report Bug](https://github.com/ikramikram2020/Syndix/issues)** · **[✨ Request Feature](https://github.com/ikramikram2020/Syndix/issues)**

</div>

---

## 📖 About

**SYNDIX** is a full-stack SaaS platform that modernizes residential building management in Algeria. It bridges the gap between informal syndic practices and professional digital tools — giving property managers a powerful dashboard and residents a seamless mobile experience.

Built as a graduation project under **Ministerial Decree No. 1275 — "Un diplôme, une startup"** at Zain Achour University, Djelfa, Algeria.

### The Problem

Algerian residential buildings rely on paper-based or WhatsApp-based coordination between syndics and residents — leading to lost fee records, untracked maintenance requests, and zero financial transparency.

### The Solution

SYNDIX provides a centralized, secure platform with two portals:

- **Syndic Dashboard** — Full management control: residents, fees, maintenance, finances, and reports.
- **Resident PWA** — Mobile-first experience for fee payment, maintenance requests, and announcements.

---

## ✨ Features

### 🏠 Syndic Dashboard
- **Resident Management** — Add, edit, and manage all residents and apartment assignments
- **Fee Tracking** — Issue, track, and export monthly/annual fee records per apartment
- **Maintenance Requests** — Receive, assign, and update maintenance tickets in real time
- **Financial Reports** — Generate PDF reports with charts for income, expenses, and balance
- **Announcements** — Broadcast building-wide notifications to all residents
- **Setup & Configuration** — Customize building profile, floor plan, and fee structure

### 📱 Resident PWA
- **QR Code Login** — Passwordless authentication via scannable QR code
- **Fee History** — View payment history and pending charges
- **Maintenance Requests** — Submit and track repair requests with status updates
- **Announcements** — Receive building-wide notifications
- **Offline Support** — Progressive Web App with offline-capable service worker

### 🔒 Security & Infrastructure
- **Row Level Security (RLS)** — Supabase policies ensuring data isolation per building
- **Email Notifications** — Automated emails via Resend for key events
- **CI/CD** — Automatic deployments to Vercel on every push to `main`
- **Client-side PDF Generation** — jsPDF + AutoTable for downloadable reports

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5 |
| **Database** | Supabase (PostgreSQL + RLS) |
| **Styling** | Tailwind CSS 3.4 |
| **Animations** | Framer Motion |
| **Charts** | Chart.js / Recharts |
| **PDF Generation** | jsPDF + jsPDF-AutoTable |
| **QR Codes** | qrcode |
| **Email** | Resend + Nodemailer |
| **Icons** | Lucide React + React Icons |
| **PWA** | next-pwa |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `18+`
- npm / yarn / pnpm
- A [Supabase](https://supabase.com) project
- A [Resend](https://resend.com) API key (for email notifications)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ikramikram2020/Syndix.git
cd Syndix

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file at the root with the following:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
Syndix/
├── public/                  # Static assets (icons, images, manifest)
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── dashboard/       # Syndic dashboard routes
│   │   ├── resident/        # Resident PWA routes
│   │   ├── login/           # Authentication pages
│   │   └── api/             # API route handlers
│   ├── components/          # Reusable UI components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── resident/        # Resident-facing components
│   │   └── ui/              # Shared UI primitives
│   ├── lib/                 # Utilities, Supabase client, helpers
│   └── types/               # TypeScript type definitions
├── next.config.ts           # Next.js configuration + PWA setup
├── tailwind.config.js       # Tailwind CSS theme tokens
└── tsconfig.json            # TypeScript configuration
```

---

## 🗄️ Database Schema (Overview)

```
buildings        → Building profile and settings
apartments       → Unit details linked to buildings
residents        → Resident accounts with apartment assignments
fees             → Monthly/annual fee records per apartment
maintenance      → Maintenance requests with status tracking
announcements    → Building-wide broadcast messages
payments         → Payment history per resident
```

All tables are protected with **Row Level Security** policies scoped per building.

---

## 📦 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🌍 Deployment

SYNDIX is deployed on **Vercel** with automatic CI/CD.

Every push to the `main` branch triggers a new production deployment.

**Live:** [https://syndix-gules.vercel.app](https://syndix-gules.vercel.app)

To deploy your own instance:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ikramikram2020/Syndix)

---



## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">


</div>
