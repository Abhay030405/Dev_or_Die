# SentinelOps Nexus Frontend - Phase 1 & 2

Complete frontend integration for admin and ranger login systems with Phase 1 (Doc-Sage & Knowledge Crystal) support.

## 📋 Features Implemented

### Phase 2 - Ranger Login System

#### ✅ Authentication
- **Admin Login**: Email + Password authentication
- **Ranger Login**: Email + Password authentication  
- **QR Code Login**: Scan QR code to login (token-based)
- **Token Management**: Automatic token storage and validation
- **Session Handling**: Persistent authentication with localStorage

#### ✅ Admin Dashboard
- Create new ranger users
- Generate QR codes automatically
- Download QR code images
- View all users and their status
- Suspend/Activate user accounts
- Monitor identity logs with IP & device info
- Real-time user management

#### ✅ Ranger Dashboard
- View profile information
- Access assigned documents
- Upload field reports
- Track activity and login history
- Personal dashboard with stats

#### ✅ Security Features
- Protected routes with role-based access
- JWT token-based authentication
- Automatic token expiration handling
- Secure token storage
- CORS-enabled API calls

### Phase 1 - Doc-Sage Integration
- Document upload and management
- Knowledge Crystal integration
- Embedded Doc-Sage component

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── DocSage.jsx              # Phase 1 component
│   │   └── ProtectedRoute.jsx       # Route protection wrapper
│   ├── context/
│   │   └── AuthContext.jsx          # Global auth state management
│   ├── hooks/
│   │   └── useAuth.js               # Auth hook
│   ├── pages/
│   │   ├── AdminLoginPage.jsx       # Admin login form
│   │   ├── RangerLoginPage.jsx      # Ranger login form (password + QR)
│   │   ├── AdminDashboard.jsx       # Admin management dashboard
│   │   └── RangerDashboard.jsx      # Ranger operations dashboard
│   ├── services/
│   │   └── api.js                   # API client & services
│   ├── styles/
│   │   ├── auth.css                 # Authentication page styles
│   │   └── dashboard.css            # Dashboard styles
│   ├── App.jsx                      # Main app with routing
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Global styles
├── .env.example                     # Environment variables
├── package.json                     # Dependencies
└── vite.config.js                   # Vite configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Backend API running on `http://127.0.0.1:8000`

### Installation

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Server will run on `http://localhost:5173`

## 🔑 API Integration

### Services Layer (`src/services/api.js`)

**Authentication Services:**
```javascript
authService.adminLogin(email, password)    // Admin login
authService.rangerLogin(email, password)   // Ranger login
authService.qrLogin(qrToken)               // QR code login
authService.validateQRToken(qrToken)       // Check QR validity
authService.getCurrentUser()               // Get user profile
authService.logout()                       // Logout
```

**Admin Services:**
```javascript
adminService.createRangerUser(email, password, fullName, role)
adminService.getAllUsers()
adminService.getUser(userId)
adminService.getIdentityLogs(limit, skip)
adminService.suspendUser(userId)
adminService.activateUser(userId)
```

**Doc-Sage Services:**
```javascript
docSageService.uploadDocument(file, metadata)
docSageService.extractText(documentId)
docSageService.getDocuments()
```

## 🔐 Authentication Flow

### Admin Login Flow
```
1. User enters email + password on /admin/login
2. Frontend calls authService.adminLogin(email, password)
3. Backend validates and returns JWT token
4. Token stored in localStorage
5. User redirected to /admin/dashboard
6. Protected route checks auth status
```

### Ranger Login Flow
```
Option A: Email + Password
1. User enters credentials on /ranger/login
2. Frontend calls authService.rangerLogin(email, password)
3. Backend validates and returns JWT token
4. Redirected to /ranger/dashboard

Option B: QR Code
1. User scans or pastes QR token
2. Frontend calls authService.qrLogin(qrToken)
3. Backend validates QR token expiration
4. Returns JWT token on success
5. Redirected to /ranger/dashboard
```

## 🛡️ Protected Routes

Use `<ProtectedRoute>` wrapper to protect pages:

```javascript
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

### Route Guards
- ✅ Checks JWT token validity
- ✅ Verifies user is authenticated
- ✅ Enforces role-based access (optional)
- ✅ Redirects unauthenticated users to login

## 🎨 UI/UX Features

### Login Pages
- Clean, modern design with gradient backgrounds
- Toggle between login methods
- Password visibility toggle
- Real-time form validation
- Error messages with visual feedback
- Responsive mobile design

### Dashboards
- Tabbed interface for organization
- Real-time stats and metrics
- User management tables
- Activity logs with filtering
- Modal dialogs for QR display
- Responsive grid layouts

### Visual Feedback
- Loading spinners
- Success/error alerts
- Disabled states during loading
- Hover effects and transitions
- Progress bars for uploads

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Tablet support (768px+)
- ✅ Desktop optimized (1024px+)
- ✅ Touch-friendly controls
- ✅ Flexible grid layouts

## 🔧 Configuration

### Environment Variables (`.env.local`)

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_APP_NAME=SentinelOps Nexus
VITE_DEBUG=false
```

### API Endpoints Used

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/login` | POST | No | Admin login |
| `/auth/ranger/login` | POST | No | Ranger login |
| `/auth/scan` | POST | No | QR code login |
| `/auth/qr/validate` | POST | No | Validate QR token |
| `/auth/me` | GET | Yes | Get current user |
| `/auth/validate` | GET | Yes | Validate token |
| `/admin/create-user` | POST | Yes | Create ranger user |
| `/admin/users` | GET | Yes | List all users |
| `/admin/users/{id}` | GET | Yes | Get specific user |
| `/admin/identity-logs` | GET | Yes | Get activity logs |
| `/admin/suspend-user/{id}` | POST | Yes | Suspend user |
| `/admin/activate-user/{id}` | POST | Yes | Activate user |

## 🧪 Testing Credentials

### Admin Account
```
Email: admin@sentinelops.com
Password: AdminPassword123!
Role: admin
```

### Test Ranger Account
```
Email: test_ranger@sentinelops.com
Password: TestPass123!
Role: technician
```

## 🚀 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Build Output
- Output folder: `dist/`
- Optimized bundle with code splitting
- Tree-shaking enabled
- CSS/JS minification

## 🐛 Troubleshooting

### Common Issues

**"Not authenticated" error**
- Check if token exists in localStorage
- Verify backend is running on correct URL
- Try logout and login again

**"CORS error"**
- Ensure backend has CORS enabled
- Check `VITE_API_URL` matches backend URL

**"QR login fails"**
- Verify QR token hasn't expired (30 days)
- Check token format is correct
- Ensure user isn't suspended

**Blank page after login**
- Check browser console for errors
- Verify API endpoints return correct format
- Check network requests in DevTools

## 📊 Performance Optimizations

- ✅ Code splitting by route
- ✅ Lazy loading components
- ✅ Optimized bundle size
- ✅ CSS-in-JS minification
- ✅ Image optimization
- ✅ Caching strategies

## 🔄 State Management

**Global State** (Auth Context):
- User information
- Authentication status
- Loading states
- Error messages

**Local State**:
- Form inputs
- Tab selections
- Modal visibility
- Pagination

## 📦 Dependencies

Key frontend libraries:
- `react`: UI framework
- `react-router-dom`: Routing
- `fetch`: HTTP client (native)

## 🎯 Next Steps

1. ✅ Frontend authentication complete
2. ✅ Admin dashboard functional
3. ✅ Ranger dashboard with QR support
4. ⏳ End-to-end integration testing
5. ⏳ Production deployment
6. ⏳ Phase 3 features (advanced analytics, 2FA)

## 📞 Support

For issues or questions:
1. Check error messages in browser console
2. Review API responses in Network tab
3. Verify backend is running
4. Check authentication token validity

## 📝 Version Info

- **Phase**: Phase 2 (Phase 1 integrated)
- **Frontend Framework**: React + Vite
- **Styling**: CSS3 with responsive design
- **Status**: Production Ready
- **Last Updated**: December 6, 2024

---

**Built for SentinelOps Nexus** 🛡️
