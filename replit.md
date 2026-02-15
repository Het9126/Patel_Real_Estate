# HomeVista - Real Estate Web Application

## Overview
A production-level full-stack real estate web application similar to MagicBricks/99acres. Built with React.js frontend (JSX-style in .tsx files) and Node.js + Express.js backend with PostgreSQL database.

## Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion, Shadcn UI, Wouter (routing), TanStack React Query
- **Backend**: Node.js, Express.js, JWT Authentication, Multer (file uploads)
- **Database**: PostgreSQL with Drizzle ORM
- **Architecture**: REST API with MVC Pattern

## Project Structure
```
client/
  src/
    components/       # Reusable components (Navbar, Footer, PropertyCard, AdminLayout)
    pages/            # Public pages (home, properties, property-details, agents, contact)
      admin/          # Admin pages (login, dashboard, properties-manage, agents-manage, inquiries-manage)
    lib/              # Utilities (queryClient, auth context, utils)
    hooks/            # Custom hooks
    components/ui/    # Shadcn UI components

server/
  index.ts            # Express server entry point
  routes.ts           # API routes (auth, properties, agents, inquiries, admin stats)
  storage.ts          # Database storage layer (DatabaseStorage implements IStorage)
  db.ts               # Database connection
  seed.ts             # Seed data for initial setup

shared/
  schema.ts           # Drizzle ORM schemas (adminUsers, properties, agents, inquiries)
```

## Database Models
- **adminUsers**: Admin authentication (username, password, name, role)
- **properties**: Real estate listings (title, price, type, status, bedrooms, amenities, images, etc.)
- **agents**: Real estate agents (name, email, phone, specialization, experience, social links)
- **inquiries**: Customer inquiries (name, email, message, contacted status)

## API Endpoints
- `POST /api/auth/login` - Admin login (JWT)
- `GET/POST/PUT/DELETE /api/properties` - Property CRUD
- `PATCH /api/properties/:id/featured` - Toggle featured
- `GET/POST/PUT/DELETE /api/agents` - Agent CRUD
- `GET/POST /api/inquiries` - Inquiry management
- `PATCH /api/inquiries/:id/contacted` - Mark contacted
- `GET /api/admin/stats` - Dashboard statistics

## Default Admin Credentials
- Username: admin
- Password: admin123

## Design Theme
- Real estate blue theme (primary: HSL 211 90% 50%)
- Clean white + blue accents
- Dark mode support
- Inter font family

## Recent Changes
- Feb 15, 2026: Initial MVP with all core features
  - Home page with hero, search filters, featured carousel, agents preview, stats
  - Properties listing with grid/list view, filters, pagination, sorting
  - Property details with image gallery, amenities, agent contact, inquiry form
  - Agents page with profile cards
  - Contact page with inquiry form
  - Admin dashboard with stats, charts (Recharts)
  - Admin property/agent/inquiry management with full CRUD
  - JWT authentication for admin routes
  - Multer file uploads for images
  - Seed data with 8 properties, 3 agents, 4 inquiries

## User Preferences
- JSX-style code (using .tsx files but with JavaScript patterns)
- Production-ready, scalable architecture
- Modern UI/UX with animations
