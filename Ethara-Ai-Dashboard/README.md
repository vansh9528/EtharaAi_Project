# Ethara AI Dashboard

A modern React + TypeScript web application for managing AI projects and tasks.

**Live:** https://etharaaidashboard.netlify.app  
**Backend API:** https://etharaai-project.onrender.com

## Features

- ✅ User authentication (register, login, logout)
- ✅ Dashboard with project & task summaries
- ✅ Project management interface
- ✅ Task tracking and management
- ✅ User profile management
- ✅ Protected routes with JWT authentication
- ✅ Responsive design
- ✅ Modern UI with Vite + React

## Tech Stack

- **Frontend Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **HTTP Client:** Axios
- **Styling:** CSS + Tailwind (optional)
- **State Management:** React Context API
- **Authentication:** JWT tokens

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vansh9528/EtharaAi_Project.git
cd Ethara-Ai-Dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## Project Structure

```
Ethara-Ai-Dashboard/
├── src/
│   ├── main.tsx             # Entry point
│   ├── App.tsx              # Main app component
│   ├── App.css
│   ├── index.css
│   ├── components/
│   │   └── ProtectedRoute.tsx  # Route guard for auth
│   ├── layouts/
│   │   └── MainLayout.tsx    # Main layout wrapper
│   ├── pages/
│   │   ├── Login.tsx         # Login page
│   │   ├── Register.tsx      # Registration page
│   │   ├── Dashboard.tsx     # Dashboard page
│   │   ├── Project.tsx       # Projects page
│   │   └── Tasks.tsx         # Tasks page
│   ├── services/             # API services
│   ├── lib/
│   │   └── api.ts            # Axios API client
│   ├── utils/                # Utility functions
│   └── style/
│       └── Login.css         # Component styles
├── public/                   # Static assets
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript config
├── package.json
└── README.md
```

## Pages

### Authentication Pages
- **Login** (`/login`) - User login with email/password
- **Register** (`/register`) - New user registration

### Protected Pages
- **Dashboard** (`/dashboard`) - Overview of projects, tasks, users
- **Projects** (`/projects`) - View and manage projects
- **Tasks** (`/tasks`) - View and manage tasks

## Available Scripts

```bash
# Development
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Run ESLint

# Type checking
npm run type-check    # TypeScript check
```

## Environment Configuration

The API base URL is configured in [src/lib/api.ts](src/lib/api.ts):

```typescript
export const API_BASE_URL = "https://etharaai-project.onrender.com";
```

Change this to your backend URL if needed.

## API Integration

### Authentication Flow

1. User registers → `/api/auth/register`
2. User logs in → `/api/auth/login`
3. Backend returns JWT token
4. Store token in localStorage
5. Include token in Authorization header for protected routes

### Example API Call

```typescript
import { api } from '@/lib/api';

// Login
const response = await api.post('/api/auth/login', {
  username: 'user',
  password: 'password'
});

// Access protected endpoint
const dashboard = await api.get('/api/dashboard');
```

## Deployment

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy to Netlify:
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repo
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Deploy!

The frontend is currently deployed on Netlify.

### Environment Variables (if needed)

Create a `.env` file in the root:
```env
VITE_API_BASE_URL=https://etharaai-project.onrender.com
```

Then use in code:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

## Features Implementation Status

- [x] User Authentication (Login/Register)
- [x] Protected Routes
- [x] Dashboard
- [x] Projects Management
- [x] Tasks Management
- [x] User Profile
- [ ] Real-time notifications
- [ ] File uploads
- [ ] Advanced filtering

## Troubleshooting

### CORS Errors
If you see CORS errors, make sure:
1. Backend has your frontend URL in `ALLOWED_ORIGINS`
2. Backend is running and accessible
3. API_BASE_URL is correct

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run build
```

### TypeScript Errors
```bash
npm run type-check
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open a GitHub issue.

## Related Projects

- **Backend:** https://github.com/vansh9528/EtharaAi_Project (Ethara-Ai-Backend)
- **API Documentation:** https://etharaai-project.onrender.com/docs
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
