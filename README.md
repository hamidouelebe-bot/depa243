# Handy Pro Connect - Lubumbashi

A modern web application for connecting skilled technicians with customers in Lubumbashi, Democratic Republic of Congo. Find plumbers, electricians, painters, carpenters, and more!

## 🌟 Features

- **Technician Directory** - Browse and search for skilled professionals by service type and location
- **Reviews & Ratings** - Customer reviews and ratings for each technician
- **Admin Dashboard** - Manage technicians, reviews, and site settings
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Database-Backed** - Powered by Neon Postgres database for reliable data storage

## 🚀 Quick Start

**Prerequisites:** Node.js 16+ and npm

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Neon Database

1. Create a free account at [Neon](https://neon.tech)
2. Create a new project
3. Copy your connection string
4. Create a `.env` file in the project root:

```bash
VITE_DATABASE_URL=postgresql://user:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require
```

5. Run the database schema:
   - Open Neon SQL Editor
   - Copy contents from `neon-schema.sql`
   - Paste and execute

📖 **Detailed setup instructions:** See [QUICKSTART.md](QUICKSTART.md) or [NEON_SETUP.md](NEON_SETUP.md)

### 3. Run the app
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## 📁 Project Structure

```
├── components/          # React components
├── services/           
│   ├── database.ts     # Database service layer
│   └── neon.ts         # Neon database client
├── types.ts            # TypeScript type definitions
├── constants.ts        # App constants and defaults
├── neon-schema.sql     # Database schema
└── App.tsx             # Main application component
```

## 🗄️ Database

This project uses **Neon Postgres** - a serverless Postgres database.

### Tables:
- `technicians` - Professional service providers
- `reviews` - Customer reviews and ratings
- `users` - Admin/editor users
- `site_settings` - Application configuration

### Key Methods:
```typescript
import { db } from './services/database';

// Get technicians
const technicians = await db.getTechnicians();

// Add review
const review = await db.addReview({ ... });

// Get settings
const settings = await db.getSettings();
```

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite
- **Database:** Neon Postgres
- **Styling:** Tailwind CSS (implied by modern design)

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_DATABASE_URL` | Neon database connection string | Yes |

## 🚢 Deployment

1. Set environment variables in your hosting platform
2. Build the app: `npm run build`
3. Deploy the `dist/` folder

**Recommended platforms:**
- Vercel
- Netlify
- Railway
- Render

## 📚 Documentation

- [Quick Start Guide](QUICKSTART.md) - Get up and running fast
- [Neon Setup Guide](NEON_SETUP.md) - Detailed database setup
- [Database Schema](neon-schema.sql) - SQL schema file

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your own purposes.
