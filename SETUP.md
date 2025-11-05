# Setup Guide

This guide will help you set up and run the Excel Analytics Platform.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- An e2b API key (get one at https://e2b.dev)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd experiment
```

### 2. Install Dependencies

Install all dependencies for both frontend and backend:

```bash
npm install
```

This will install dependencies for the root, backend, and frontend workspaces.

### 3. Configure Environment Variables

#### Backend Configuration

Copy the example environment file:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your e2b API key:

```env
PORT=3001
E2B_API_KEY=your_actual_e2b_api_key_here
NODE_ENV=development
```

To get an e2b API key:
1. Visit https://e2b.dev
2. Sign up for a free account
3. Go to your dashboard
4. Create a new API key
5. Copy and paste it into your `.env` file

#### Frontend Configuration

Copy the example environment file:

```bash
cp frontend/.env.local.example frontend/.env.local
```

The default configuration should work:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Run the Application

Start both backend and frontend servers:

```bash
npm run dev
```

This will start:
- **Backend API** on http://localhost:3001
- **Frontend** on http://localhost:3000

Alternatively, you can run them separately:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### 5. Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

## Testing the Application

### Sample Excel File

Create a sample Excel file with the following structure:

| Product | Sales | Revenue | Profit |
|---------|-------|---------|--------|
| A | 100 | 5000 | 1000 |
| B | 150 | 7500 | 1500 |
| C | 200 | 10000 | 2000 |
| D | 120 | 6000 | 1200 |
| E | 180 | 9000 | 1800 |

Save it as `sample_data.xlsx` and upload it to the platform.

### What to Expect

After uploading, you should see:

1. **File Information**: Filename, sheet name, row/column counts
2. **Statistics Cards**: Mean, median, min, max for numeric columns
3. **Charts**:
   - Bar Chart
   - Line Chart
   - Area Chart
   - Pie Chart
4. **Data Preview**: First 10 rows of your data

## Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- Check if port 3001 is available
- Verify Node.js version (should be 18+)
- Check if dependencies are installed: `npm install`

**Problem**: "E2B_API_KEY not set" warning
- Make sure you've created `backend/.env` file
- Verify your e2b API key is correct
- The app will work with limited features without e2b

### Frontend Issues

**Problem**: Frontend shows connection error
- Verify backend is running on port 3001
- Check `frontend/.env.local` has correct API URL
- Check browser console for CORS errors

**Problem**: Charts not displaying
- Verify your Excel file has numeric columns
- Check browser console for JavaScript errors
- Try a different Excel file format (.xlsx, .xls, or .csv)

### File Upload Issues

**Problem**: "Failed to analyze file"
- Check file size (must be under 10MB)
- Verify file format (.xlsx, .xls, or .csv)
- Check backend logs for detailed error messages

## Building for Production

Build both applications:

```bash
npm run build
```

Start production servers:

```bash
npm run start
```

## Development Tips

### Backend Development

- Backend code is in `backend/src/`
- API routes are in `backend/src/routes/`
- To add new endpoints, create a new route file and import it in `index.js`

### Frontend Development

- Frontend code is in `frontend/src/`
- Components are in `frontend/src/components/`
- Pages use Next.js App Router (`frontend/src/app/`)

### Adding New Chart Types

To add a new chart type, edit `frontend/src/components/Analytics.tsx` and add a new chart component using Recharts.

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express Documentation](https://expressjs.com/)
- [Recharts Documentation](https://recharts.org/)
- [e2b Documentation](https://e2b.dev/docs)

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review backend logs in the terminal
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
