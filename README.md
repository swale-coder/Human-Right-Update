# Human Rights Protection Council (HRPC) ERP System

A modular, enterprise-grade ERP for NGOs / Trusts / Human Rights Organizations.
**All 15 planned phases are now implemented.**

## Phase Status

| Phase | Scope | Status |
|---|---|---|
| 1 | Project setup, JWT auth, RBAC, dashboard shell, public site routing | ✅ Done |
| 2 | Membership Management — apply/approve/renew, QR, digital ID card, certificate | ✅ Done |
| 3 | Donation Management — Razorpay online + offline, receipts, 80G, recurring | ✅ Done |
| 4 | Complaint & Human Rights Case Management | ✅ Done |
| 5 | Beneficiary Management | ✅ Done |
| 6 | Volunteer Management | ✅ Done |
| 7 | Internship Management | ✅ Done |
| 8 | Event Management (QR attendance) | ✅ Done |
| 9 | Crowdfunding Management | ✅ Done |
| 10 | Certificate Generation Engine (generic, reused by Volunteer/Intern/Event) | ✅ Done |
| 11 | Digital ID Card Management (member ID cards, printable PVC layout) | ✅ Done |
| 12 | Reports & Analytics (dashboard summary + Excel export) | ✅ Done |
| 13 | Super Admin Panel (org hierarchy, roles, settings, activity logs) | ✅ Done |
| 14 | Public content pages (Gallery, News, Leadership, Events, Campaigns) | ✅ Done |
| 15 | Deployment configs (Vercel, Render, Procfile) | ✅ Done |

---

## Tech Stack

**Frontend:** React (Vite), React Router, React Hook Form, Axios, react-hot-toast
**Backend:** Node.js, Express, JWT auth, bcryptjs
**Data:** In-memory mock database, pre-loaded with realistic demo data on every start — no database server or setup required. See `backend/docs/DATA_LAYER.md`.
**Files/Payments:** Cloudinary (with local-disk fallback), Razorpay (with dev-mode fallback)
**Docs:** pdfkit (certificates, ID cards, receipts), qrcode, exceljs (Excel export)

---

## Getting Started

No database to install or configure — just two `npm install`s and you're running.

### 1. Backend

```bash
cd backend
cp .env.example .env       # defaults work out of the box; fill in JWT secrets for anything beyond local use
npm install
npm run dev                 # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

### 3. Try it out

- Log in as Super Admin: `superadmin@hrpc.org` / `Demo@1234` (full list of demo accounts for every role in `backend/docs/DATA_LAYER.md`).
- **Members** → approve a pending application → certificate/ID card auto-generated.
- **Donations** → record an offline donation or use the public `/donate` page (works without Razorpay keys in dev mode).
- **Complaints** → `/register-complaint` to file, then assign/resolve from the admin panel.
- **Volunteers / Internships** → apply from `/volunteer-register` or `/internship-register`, approve from the dashboard.
- **Events** → create an event in the dashboard, register publicly at `/events`, mark attendance via QR.
- **Campaigns** → create at dashboard → Campaigns, view progress at `/campaigns`, donate via `/donate?campaignId=...`.
- **Reports** → dashboard summary + Excel export per module.
- **Super Admin Panel** → manage States/Districts/Talukas/Cities, user roles, system settings, activity logs.

---

## Notes for Production

- This build's data layer is an **in-memory mock database** meant for demos/MVP review — data resets on every server restart. See `backend/docs/DATA_LAYER.md` for what's seeded and how it works, and for guidance on swapping in a real database later (the original Prisma schema is kept at `backend/docs/data-model-reference.prisma` for that purpose).
- Set strong, unique values for `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`.
- Configure Cloudinary and Razorpay env vars before going live — both modules have dev-mode fallbacks (local disk storage / skip-verification) that are **not** suitable for production.
- `forgotPassword` logs the reset link to the server console — wire in a real email provider before launch.
- Deployment: Frontend → Vercel (`vercel.json` included), Backend → Render (`render.yaml` included) or Railway/Heroku (`Procfile` included).
