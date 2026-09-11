# Deployment Guide: Budget Management System

This Next.js full-stack application includes Prisma ORM, Server Actions, JWT authentication, and dynamic routes. Here are the simplest ways to deploy it for free:

---

## 🚀 Option 1: Deploy on Vercel (Fastest & Free)

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** > **"Project"**.
3. Select your repository: `Avishka-kavishan/Budget-Management-System`.
4. Configure Environment Variables:
   - `JWT_SECRET`: Any secure random string (e.g. `super-secret-key-32-chars-long!`)
   - `NEXT_PUBLIC_APP_NAME`: `Budget Management System`
   - `DATABASE_URL`: `file:./dev.db` *(or your remote PostgreSQL/Turso URL for persistent database)*
5. Click **Deploy**.

---

## 🌐 Option 2: Deploy on Render (Free Web Service)

1. Go to [render.com](https://render.com) and sign in.
2. Click **"New"** > **"Web Service"** (or **"Blueprint"** using `render.yaml`).
3. Connect repository: `Avishka-kavishan/Budget-Management-System`.
4. Set configurations:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push && npm run build`
   - **Start Command**: `npm run start`
5. Add Environment Variables:
   - `JWT_SECRET`: (Random secure string)
   - `DATABASE_URL`: `file:./dev.db`
   - `NEXT_PUBLIC_APP_NAME`: `Budget Management System`
6. Click **Create Web Service**.

---

## 🚂 Option 3: Deploy on Railway (1-Click Docker / Node)

1. Go to [railway.app](https://railway.app) and sign in.
2. Click **"New Project"** > **"Deploy from GitHub repo"**.
3. Select `Budget-Management-System`.
4. Railway will automatically detect the `Dockerfile` or `package.json` and build the application.
5. In **Variables**, add:
   - `JWT_SECRET`: (Random secure string)
   - `DATABASE_URL`: `file:./dev.db`
6. Click **Deploy**.

---

## 🐳 Option 4: Deploy with Docker (Self-Hosted / VPS)

Build and run using Docker:

```bash
docker build -t budget-management-system .
docker run -p 3000:3000 -e JWT_SECRET="your-secret-key" -e DATABASE_URL="file:./dev.db" budget-management-system
```
