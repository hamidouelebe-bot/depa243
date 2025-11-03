# Neon Database Setup Guide

This guide will help you set up Neon Postgres database for your Handy Pro Connect application.

## Prerequisites

1. A Neon account (sign up at https://neon.tech)
2. Node.js and npm installed

## Step-by-Step Setup

### 1. Create a Neon Project

1. Go to https://neon.tech and sign in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: Handy Pro Connect (or any name you prefer)
   - **Region**: Select the closest region to your users
   - **Postgres version**: Use the default (latest)
4. Click "Create Project"

### 2. Get Your Database Connection String

1. In your Neon project dashboard, go to the **Connection Details** section
2. Copy the **Connection string** (it should look like):
   ```
   postgresql://username:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require
   ```
3. Make sure to select the connection string format for **Node.js** or **General**

### 3. Configure Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder value with your actual connection string:

```env
VITE_DATABASE_URL=postgresql://user:password@your-neon-hostname.neon.tech/dbname?sslmode=require
```

### 4. Run the Database Schema

1. In your Neon dashboard, go to the **SQL Editor** tab
2. Open the `supabase-schema.sql` file (or `neon-schema.sql`) in this project
3. Copy all the SQL code and paste it into the Neon SQL Editor
4. Click "Run" to execute the schema

This will create:
- **technicians** table - stores technician profiles
- **reviews** table - stores customer reviews
- **users** table - stores admin/editor accounts
- **site_settings** table - stores application configuration
- Necessary indexes and Row Level Security (RLS) policies
- Sample data for testing

### 5. Verify the Setup

1. In Neon, go to **Tables** tab
2. You should see all four tables created:
   - `technicians`
   - `reviews`
   - `users`
   - `site_settings`
3. Check that sample data was inserted:
   - Click on **technicians** table
   - You should see sample technicians like "Jean Kabila" and "Marie Ilunga"

### 6. Update Your Code

The database service (`services/database.ts`) has been updated to use Neon Postgres instead of localStorage. All methods are now asynchronous, so you'll need to update any code that calls them:

**Before (localStorage):**
```typescript
const technicians = db.getTechnicians();
```

**After (Neon):**
```typescript
const technicians = await db.getTechnicians();
```

### 7. Start Your Application

```bash
npm run dev
```

Your application should now be connected to Neon Database!

## Important Notes

### Row Level Security (RLS)

The schema includes basic RLS policies for security:
- **Public users** can:
  - View approved technicians
  - View approved reviews
  - Submit new reviews (pending approval)
  - Register as technicians (pending approval)
  - View site settings

- **For admin operations**, you have several options:
  - Temporarily disable RLS on tables during development (not recommended for production)
  - Implement application-level authentication and use a service connection string
  - Set up custom authentication and modify RLS policies accordingly

### Authentication (Optional)

For production, consider implementing proper authentication:
1. Implement JWT-based authentication or use a service like Auth0, Clerk, or NextAuth
2. Update RLS policies to check authenticated users
3. Store user sessions securely
4. Create separate connection strings for admin operations (keep them server-side only)

### Data Migration

If you have existing data in localStorage:
1. Export your localStorage data
2. Format it to match the PostgreSQL schema
3. Use the Neon SQL Editor or a migration script to import it

## Troubleshooting

### "Missing VITE_DATABASE_URL environment variable" error
- Make sure your `.env` file exists and has the correct connection string
- Ensure the connection string includes `?sslmode=require` at the end
- Restart your dev server after changing `.env`

### "relation does not exist" error
- Run the `supabase-schema.sql` (or `neon-schema.sql`) in your Neon SQL Editor
- Make sure the query completed without errors
- Verify you're connected to the correct database

### "Row Level Security policy violation" error
- You're trying to perform an operation not allowed by RLS
- Either update the RLS policies or temporarily disable RLS for testing
- To disable RLS on a table: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`

### Data not showing up
- Check the RLS policies - they might be filtering your data
- Verify the data exists in the Neon Tables view
- Check the browser console for errors
- Test your connection string by running a simple query in Neon SQL Editor

## Next Steps

1. **Update your components** to handle async data fetching
2. **Implement proper authentication** for admin users
3. **Add error handling** for network failures
4. **Consider adding loading states** for better UX
5. **Optimize queries** with proper indexing and caching

## Resources

- [Neon Documentation](https://neon.tech/docs/introduction)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Neon Connection String](https://neon.tech/docs/connect/connect-from-any-app)
