# Excel Analytics Platform

A full-stack application that transforms Excel files into beautiful infographics, charts, and analytics using e2b sandboxed processing.

## Features

- 📊 Upload Excel files with drag-and-drop interface
- 📈 Automatic chart generation (bar, line, pie, area charts)
- 🎨 Beautiful infographics and data visualizations
- 📉 Statistical analytics and insights
- 🔒 Secure processing using e2b sandboxed environment
- ⚡ Real-time data processing and visualization

## Tech Stack

### Backend
- Node.js + Express
- e2b SDK for sandboxed Excel processing
- Multer for file uploads
- CORS enabled

### Frontend
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Recharts for data visualization
- React Dropzone for file uploads

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- e2b API key (get one at https://e2b.dev)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd experiment
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create `backend/.env`:
```
PORT=3001
E2B_API_KEY=your_e2b_api_key_here
```

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Run the development servers:
```bash
npm run dev
```

This will start:
- Backend API on http://localhost:3001
- Frontend on http://localhost:3000

### Building for Production

```bash
npm run build
npm run start
```

## Usage

1. Open http://localhost:3000 in your browser
2. Drag and drop an Excel file or click to upload
3. Wait for processing (files are analyzed in a secure e2b sandbox)
4. View generated charts, infographics, and analytics

## API Endpoints

- `POST /api/upload` - Upload Excel file
- `POST /api/analyze` - Analyze Excel data and generate insights
- `GET /api/health` - Health check

## License

MIT
