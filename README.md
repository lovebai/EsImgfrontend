# EasyImg Frontend

This is the frontend application for the EasyImg image hosting service, built with Next.js and TailwindCSS.

## Features

- Multi-file image upload
- Image preview after upload
- Copy links in various formats (direct, markdown, BBS, HTML)
- Admin dashboard with authentication
- File management capabilities

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to http://localhost:8002

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── layout.tsx    # Root layout with AuthProvider
│   │   ├── page.tsx      # Home page
│   │   ├── upload/       # Upload page
│   │   ├── login/        # Login page
│   │   └── dashboard/    # Admin dashboard
│   ├── components/       # React components
│   │   └── AuthProvider.tsx  # Authentication context
│   ├── lib/              # Utility functions and API service
│   │   └── api.ts        # API service for backend communication
│   └── styles/           # Global styles
│       └── globals.css   # TailwindCSS imports
├── public/               # Static assets
├── next.config.js        # Next.js configuration with proxy
├── tailwind.config.js    # TailwindCSS configuration
├── postcss.config.js     # PostCSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Configuration

The frontend is configured to:
- Run on port 8002 (set in package.json scripts)
- Communicate with the backend through a proxy at /api (configured in next.config.js)
- Backend API endpoints are proxied to http://127.0.0.1:8001

## Proxy Configuration

To solve CORS issues, we've implemented a proxy in Next.js that forwards API requests from `/api/*` to `http://127.0.0.1:8001/api/*`. This ensures that all API calls are made from the same origin as the frontend.

The proxy configuration is defined in `next.config.js`:

```javascript
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8001/api/:path*',
      },
    ]
  },
}
```

## Development

### Available Scripts

- `npm run dev` - Runs the app in development mode on port 8002
- `npm run build` - Builds the app for production
- `npm start` - Runs the built app in production mode
- `npm run lint` - Runs the linter

## Authentication

The admin section is protected and requires login. Use the credentials provided by your backend service.

## API Integration

All API calls are made through the proxy:
- Upload files: POST `/api/upload`
- Login: POST `/api/login`
- Get files: GET `/api/files`
- Delete file: DELETE `/api/files/{id}`

This approach eliminates CORS issues by ensuring all requests originate from the same domain.