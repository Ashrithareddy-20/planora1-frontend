# Planora – Frontend Web Application

Modern React 18 and Vite frontend application for **Planora – AI-Powered Event Planning & Vendor Recommendation System**.

---

## 🏗️ Tech Stack

- **Framework:** React 18, Vite 5
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios (with automatic JWT authentication interceptors)
- **Visualizations & Charts:** Recharts (Interactive category breakdowns & budget charts)
- **Icons:** Lucide React
- **Styling:** Custom Responsive CSS Design System (Glassmorphic cards, vibrant gradients, micro-interactions)

---

## 🚀 Quick Start (Local)

### Pre-requisites:
- Node.js 18+ & npm

### Running locally:
```bash
# In frontend root
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`.

---

## ⚡ Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and click **"Add New..."** -> **"Project"**.
2. Import this frontend repository.
3. Configuration:
   - **Framework Preset:** `Vite` (auto-detected)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. In **Environment Variables**, set:
   - `VITE_API_BASE_URL`: `https://YOUR_RAILWAY_BACKEND_URL` (e.g. `https://planora-production.up.railway.app`)
5. Click **"Deploy"**.

SPA client-side routing is automatically configured with [`vercel.json`](./vercel.json).
