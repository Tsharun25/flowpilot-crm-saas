# FlowPilot CRM SaaS

FlowPilot CRM SaaS is a premium full-stack SaaS CRM and project management application built with Next.js, TypeScript, Tailwind CSS, MongoDB, Prisma, NextAuth.js, Recharts, Sonner, and Lucide React.

It includes authentication, protected dashboard routes, workspace-based SaaS architecture, projects CRUD, Kanban task management, CRM pipeline, analytics dashboard, profile/workspace settings, toast notifications, loading skeletons, demo data seeding, and a responsive premium UI.

---

## Live Demo

[https://flowpilot-crm-saas.vercel.app](https://flowpilot-crm-saas.vercel.app)

---

## Demo Login

```txt
Email: demo@flowpilot.com
Password: 123456
```

---

## Features

- User registration and login
- Password hashing with bcryptjs
- Protected dashboard routes
- Workspace-based SaaS structure
- Projects CRUD
- Tasks CRUD
- Kanban task board
- CRM client pipeline
- Live dashboard stats
- Analytics chart
- Profile and workspace settings
- Toast notifications
- Loading skeletons
- Responsive dashboard UI
- Demo data seeding
- Premium SaaS landing page
- Mobile responsive sidebar
- Vercel deployment ready

---

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- MongoDB
- Prisma ORM
- NextAuth.js
- bcryptjs
- Recharts
- Sonner
- Lucide React

---

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/flowpilot?retryWrites=true&w=majority"

AUTH_SECRET="your-secret-key"
NEXTAUTH_SECRET="your-secret-key"

NEXTAUTH_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"
```

For production:

```env
DATABASE_URL="your-production-mongodb-url"

AUTH_SECRET="your-production-secret"
NEXTAUTH_SECRET="your-production-secret"

NEXTAUTH_URL="https://flowpilot-crm-saas.vercel.app"
AUTH_URL="https://flowpilot-crm-saas.vercel.app"
```

---

## Installation

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open the local app:

```txt
http://localhost:3000
```

---

## Seed Demo Data

First register this account:

```txt
Email: demo@flowpilot.com
Password: 123456
Name: Demo User
```

Then run:

```bash
npm run seed
```

This will create demo projects, tasks, clients, CRM pipeline data, and dashboard content.

---

## Build

```bash
npm run build
```

---

## Deployment

This project is deployed on Vercel.

Live URL:

```txt
https://flowpilot-crm-saas.vercel.app
```

Required Vercel environment variables:

```env
DATABASE_URL
AUTH_SECRET
NEXTAUTH_SECRET
NEXTAUTH_URL
AUTH_URL
```

After changing environment variables in Vercel, redeploy the project.

---

## Project Highlights

FlowPilot CRM SaaS demonstrates:

- Full-stack SaaS architecture
- Real authentication system
- Protected dashboard experience
- MongoDB database integration
- Workspace-based data structure
- Server Actions
- CRUD functionality
- Kanban workflow
- CRM pipeline management
- Analytics dashboard
- Production deployment
- Responsive premium UI/UX

---

## Author

Built by Harun as a premium SaaS portfolio project.

---

## License

This project is built for educational and portfolio purposes.