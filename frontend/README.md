# RewardHub Frontend

A modern Vue 3 + Vite frontend for the RewardHub blockchain-based student reward system.

## Tech Stack

- **Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite
- **State Management:** Pinia
- **Routing:** Vue Router
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Blockchain:** Ethers.js (MetaMask integration)

## Features

### Authentication
- JWT-based authentication
- Login and registration
- Token persistence in localStorage
- Auto-redirect on authentication state changes

### Role-Based Dashboards
- **Student Dashboard:** View achievements, token balance, and available perks
- **Admin Dashboard:** System statistics, user management, achievement/perk management
- **Faculty Dashboard:** Award achievements to students

### Blockchain Integration
- MetaMask wallet connection
- View token balance from smart contract
- Blockchain verification status for achievements
- Signature-based wallet verification

### Core Functionality
- **Students:**
  - View earned achievements
  - Check token balance
  - Redeem perks with tokens
  - View redemption history

- **Faculty:**
  - Award achievements to students
  - View available achievements
  - Track recent awards

- **Admin:**
  - Create and manage users
  - CRUD operations for achievements
  - CRUD operations for perks
  - View system statistics

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/
│   │   └── styles/        # Global styles
│   ├── components/
│   │   ├── common/        # Reusable components
│   │   ├── layout/        # Layout components
│   │   └── wallet/        # Wallet-related components
│   ├── composables/       # Vue composables
│   ├── layouts/           # Page layouts
│   ├── router/            # Vue Router configuration
│   ├── services/          # API and blockchain services
│   ├── stores/            # Pinia stores
│   ├── views/             # Page components
│   │   ├── auth/          # Authentication pages
│   │   ├── dashboard/     # Dashboard pages
│   │   ├── student/       # Student-specific pages
│   │   ├── admin/         # Admin-specific pages
│   │   └── faculty/       # Faculty-specific pages
│   ├── App.vue            # Root component
│   └── main.js            # Application entry point
├── index.html             # HTML entry point
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
└── postcss.config.js      # PostCSS configuration
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:5000`
- MetaMask browser extension (for blockchain features)

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
VITE_API_URL=http://localhost:5000
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
VITE_CHAIN_ID=1337
```

5. Copy the contract ABI:
The blockchain service expects the ABI at `../backend/abi/RewardHub.json`. Ensure your backend has the deployed contract ABI in this location.

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |
| `VITE_CONTRACT_ADDRESS` | Deployed smart contract address | - |
| `VITE_CHAIN_ID` | Blockchain network chain ID | `1337` |

## Usage

### Login Credentials

Use the credentials created via the backend API or register a new student account.

**Default roles:**
- `admin` - Full system access
- `faculty` - Can award achievements
- `student` - Can view achievements and redeem perks

### Wallet Connection

1. Install MetaMask browser extension
2. Click "Connect Wallet" in the navbar
3. Approve the connection request
4. Your wallet address and token balance will be displayed

### Student Workflow

1. Login with student credentials
2. View dashboard to see achievements and token balance
3. Navigate to "My Achievements" to see earned achievements
4. Navigate to "Redeem Perks" to spend tokens
5. Select a perk and click "Redeem Now"

### Faculty Workflow

1. Login with faculty credentials
2. Navigate to "Award Achievements"
3. Select a student from the list
4. Choose an achievement
5. Optionally enable blockchain sync (requires student wallet)
6. Click "Award Achievement"

### Admin Workflow

1. Login with admin credentials
2. Access admin dashboard for system overview
3. Manage users via "Manage Users"
4. Create/edit achievements via "Manage Achievements"
5. Create/edit perks via "Manage Perks"

## API Integration

The frontend communicates with the backend API through the `api.js` service. All requests automatically include the JWT token from localStorage.

**Key endpoints:**
- `/auth/login` - User authentication
- `/auth/register` - Student registration
- `/achievements` - Achievement CRUD
- `/perks` - Perk CRUD
- `/users` - User management (admin only)
- `/wallet/connect` - Wallet connection

## State Management

Pinia stores manage application state:

- **authStore** - Authentication state and user data
- **userStore** - User management
- **walletStore** - Wallet connection and token balance
- **achievementStore** - Achievements data
- **rewardStore** - Perks and redemptions

## Routing

Protected routes require authentication. Role-based guards ensure users can only access authorized pages.

**Route structure:**
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/dashboard` - Student dashboard
- `/dashboard/admin` - Admin dashboard
- `/dashboard/faculty` - Faculty dashboard
- `/dashboard/*` - Role-specific pages

## Styling

The application uses Tailwind CSS for styling with a custom color palette. The design is:
- Clean and minimal
- Fully responsive
- Professional MVP aesthetic
- Consistent across all pages

## Troubleshooting

### MetaMask Connection Issues
- Ensure MetaMask is installed and unlocked
- Check that you're on the correct network (chain ID matches)
- Try refreshing the page

### API Connection Issues
- Verify backend is running on the configured URL
- Check browser console for CORS errors
- Ensure JWT token is valid

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## License

ISC

## Support

For issues or questions, please refer to the backend API documentation or contact the development team.
