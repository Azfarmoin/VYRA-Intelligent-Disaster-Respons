# ResQNet Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account (free tier works)

## Step 1: Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14
- React 18
- Supabase client libraries
- TypeScript
- Tailwind CSS
- Leaflet (for maps)
- Other required dependencies

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is ready, go to Settings > API
3. Copy your project URL and anon key
4. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and run the SQL from `supabase/schema.sql`
4. This will create all necessary tables and relationships

## Step 4: Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Step 5: Test the Application

### Test Pages

1. **Home Page** (`/`)
   - View the landing page with feature overview
   - Navigate to different sections

2. **Authentication** (`/auth/login`, `/auth/register`)
   - Test login and registration forms
   - Note: Actual Supabase auth integration needs to be implemented

3. **Emergency Report** (`/report`)
   - Submit a test emergency report
   - Test GPS location button
   - Verify form validation

4. **Responder Dashboard** (`/dashboard`)
   - View sample emergency reports
   - Filter by status
   - Click "View Details" to see report information
   - Test status update buttons

5. **Disaster Map** (`/map`)
   - View the map with sample markers
   - Filter by reports, shelters, or teams
   - Click markers to see details
   - Note: Leaflet integration needs to be completed

6. **Resource Management** (`/resources`)
   - View rescue teams, resources, and shelters
   - Switch between tabs
   - Test the "Add" modal (placeholder)

### Test API Endpoints

You can test the API endpoints using tools like Postman or curl:

```bash
# Get all reports
curl http://localhost:3000/api/reports

# Create a new report
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "location_address": "123 Test St",
    "people_count": 5,
    "immediate_danger": true,
    "injury_details": "Minor injuries",
    "medical_needs": "First aid",
    "contact_info": "555-0100"
  }'

# Get all teams
curl http://localhost:3000/api/teams

# Get all resources
curl http://localhost:3000/api/resources

# Get all shelters
curl http://localhost:3000/api/shelters
```

## Next Steps for Full Implementation

### Stage 4: Complete Emergency Reporting
- Integrate Supabase auth in login/register pages
- Connect report form to API
- Implement actual GPS location capture
- Add form validation and error handling

### Stage 5: Complete Disaster Map
- Integrate React Leaflet for actual map rendering
- Connect to real data from Supabase
- Add map controls and layers
- Implement clustering for multiple markers

### Stage 6: Implement Triage Engine
- Create priority scoring algorithm
- Add explanation generation
- Integrate with report creation
- Display triage results in dashboard

### Stage 7: Resource Dispatch
- Implement team assignment functionality
- Create dispatch API endpoints
- Add route optimization (optional)
- Track dispatch status

### Stage 8: Offline Support
- Implement IndexedDB storage
- Add offline queue system
- Create sync mechanism
- Add conflict resolution

### Stage 9: Real-time Updates
- Integrate Supabase Realtime
- Add Socket.IO if needed
- Implement live dashboard updates
- Add notification system

### Stage 10: Deployment
- Set up environment variables for production
- Deploy to Vercel (frontend)
- Configure Supabase for production
- Test end-to-end functionality
- Prepare demo scenario

## Troubleshooting

### Dependencies not found
- Run `npm install` to install all dependencies
- Delete `node_modules` and `package-lock.json` if issues persist, then run `npm install` again

### Supabase connection errors
- Verify your `.env.local` file has correct values
- Check that your Supabase project is active
- Ensure the database schema has been applied

### Map not displaying
- Leaflet integration is a placeholder - needs to be completed in Stage 5
- For now, the map shows sample markers on a gray background

### TypeScript errors
- These are expected until dependencies are installed
- Run `npm install` to resolve
- Some errors may persist until Supabase types are generated

## Project Structure

```
ResQNet/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Responder dashboard
│   │   ├── map/               # Disaster map
│   │   ├── report/            # Emergency report form
│   │   ├── resources/         # Resource management
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   └── lib/
│       └── supabase.ts        # Supabase client
├── supabase/
│   └── schema.sql             # Database schema
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts        # Tailwind config
├── next.config.js            # Next.js config
└── .env.local                # Environment variables (create this)
```

## Development Notes

- The application uses Next.js 14 with the App Router
- TypeScript is enabled for type safety
- Tailwind CSS is used for styling
- Supabase is used for database and authentication
- The code is structured to be modular and extensible
- Sample data is used in UI components for demonstration
- API routes are ready for Supabase integration

## Clean Code Practices

- Components are organized by feature
- TypeScript interfaces should be added for type safety
- API routes follow REST conventions
- Error handling is implemented in API routes
- The codebase is ready for future enhancements
