# CricProAce - Installation Guide

## Backup Date: February 2026

---

## Prerequisites

- **Node.js** v20 or higher
- **npm** v9 or higher
- **PostgreSQL** database (v14+)

---

## Step 1: Extract the Backup

Unzip the backup file:

```bash
unzip CricProAce-Backup-YYYY-MM-DD.zip -d cricproace
cd cricproace
```

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Set Up the Database

### Option A: Using Neon Database (Recommended for Production)

1. Create an account at https://neon.tech
2. Create a new project and database
3. Copy the connection string

### Option B: Using Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:

```bash
createdb cricproace
```

3. Your connection string will be:
```
postgresql://username:password@localhost:5432/cricproace
```

---

## Step 4: Environment Variables

Create a `.env` file in the root directory with the following:

```env
# Database (Required)
DATABASE_URL=postgresql://username:password@host:5432/database_name

# Session Secret (Required - generate a random string)
SESSION_SECRET=your-random-secret-string-here

# Server Port (Optional, defaults to 5000)
PORT=5000

# Node Environment
NODE_ENV=production

# Allowed Iframe Parents (Optional - for WordPress embedding)
ALLOWED_IFRAME_PARENTS=https://your-wordpress-domain.com

# Object Storage (Optional - for Replit App Storage)
# If not using Replit, images will need an alternative storage solution
```

### Generate a Session Secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Step 5: Push Database Schema

```bash
npm run db:push
```

This will create all the necessary database tables.

---

## Step 6: Build the Application

```bash
npm run build
```

This compiles:
- Frontend (React/Vite) into `dist/public/`
- Backend (TypeScript) into `dist/index.js`

---

## Step 7: Start the Application

### Production:
```bash
npm start
```

### Development:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

---

## Step 8: Create Admin Account

1. Open the app in your browser
2. Register a new account
3. To make it an admin, run this SQL on your database:

```sql
UPDATE users SET role = 'admin' WHERE username = 'your-username';
```

---

## Project Structure

```
cricproace/
  client/               # Frontend (React + TypeScript)
    src/
      components/       # Reusable UI components
      hooks/            # Custom React hooks
      lib/              # Utility functions
      pages/            # Page components
        admin/          # Admin panel pages
        embeds/         # WordPress embed pages
  server/               # Backend (Express + TypeScript)
    index.ts            # Server entry point
    routes.ts           # API routes
    auth.ts             # Authentication logic
    storage.ts          # Database operations
  shared/               # Shared code (client + server)
    schema.ts           # Database schema + types
  dist/                 # Built output (after npm run build)
  drizzle.config.ts     # Database migration config
  vite.config.ts        # Vite build config
  tailwind.config.ts    # Tailwind CSS config
  package.json          # Dependencies
```

---

## Key Features

- **User Authentication**: Register, login, password reset with security codes
- **Match Predictions**: Predict toss and match winners
- **Tournaments**: Organize matches into tournaments
- **Leaderboard**: Points-based ranking system
- **Admin Panel**: Full match/team/tournament management
- **WordPress Embedding**: Embeddable match cards and leaderboards
- **File Manager**: Admin file management with cleanup tools
- **Backup & Restore**: JSON-based backup system

---

## Embed URLs (for WordPress)

| Embed Type | URL Path |
|-----------|----------|
| Full Match Page | `/embed/matches/MATCH_ID` |
| Match Widget | `/embed/widget/match/MATCH_ID` |
| Leaderboard Widget | `/embed/widget/leaderboard` |
| Full Leaderboard | `/embed/leaderboard` |
| Tournaments | `/embed/tournaments` |

---

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check that the database exists

### Build Errors
- Run `npm install` again to ensure all dependencies are installed
- Make sure Node.js v20+ is installed: `node --version`

### Port Already in Use
- Change the PORT in your .env file
- Or kill the process using port 5000: `lsof -i :5000`

---

## Important Notes

- **Images**: If migrating from Replit, uploaded images are stored in Replit's Object Storage. You'll need to re-upload images if hosting elsewhere.
- **Sessions**: Uses PostgreSQL-backed sessions via `connect-pg-simple`
- **Security**: Rate limiting, CSRF protection, and input validation are built-in
- **Password Requirements**: Minimum 12 characters with uppercase, lowercase, number, and special character
