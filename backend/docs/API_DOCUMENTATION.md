# RewardHub Backend API Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Authentication & Authorization](#authentication--authorization)
3. [Roles and Permissions Matrix](#roles-and-permissions-matrix)
4. [Global Response Format](#global-response-format)
5. [API Endpoints](#api-endpoints)
   - [Auth & Wallet Connection](#auth--wallet-connection)
   - [Admin: User Management](#admin-user-management)
   - [Admin: Achievement Management](#admin-achievement-management)
   - [Admin: Perk/Reward Management](#admin-perkreward-management)
   - [Admin: Dashboard & Statistics](#admin-dashboard--statistics)
   - [Faculty: Award Achievements](#faculty-award-achievements)
   - [Student: View Achievements & Balance](#student-view-achievements--balance)
   - [Student: Redeem Perks](#student-redeem-perks)
   - [Blockchain Utilities](#blockchain-utilities)
   - [Legacy/Public Routes](#legacypublic-routes)
6. [Models / Data Structures](#models--data-structures)
7. [Blockchain Integration](#blockchain-integration)
8. [Error Codes & Messages](#error-codes--messages)
9. [Testing & Examples](#testing--examples)
10. [Security Considerations](#security-considerations)

---

## Introduction

### Project Overview
**RewardHub** is a blockchain-integrated student reward system that enables educational institutions to award achievements and manage perks using ERC20 tokens on Ethereum. The system combines traditional database management with blockchain transparency, ensuring token balances are verifiable on-chain while maintaining flexible off-chain data management.

### Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Blockchain**: Ethereum (Sepolia testnet / Ganache local), ERC20 token contract
- **Authentication**: JWT (JSON Web Tokens)
- **Wallet Integration**: MetaMask signature-based verification (ethers.js v6)

### Key Concepts

#### Roles
The system supports three user roles:
- **`admin`**: Full system access - manage users, achievements, perks, view dashboard statistics
- **`faculty`**: Can award achievements to students
- **`student`**: Can view their achievements, check balance, and redeem perks

#### Wallet Connection Flow
1. User authenticates with email/password → receives JWT
2. User requests nonce via `POST /api/users/wallet/nonce`
3. User signs nonce with MetaMask using `personal_sign`
4. User submits signature via `POST /api/users/wallet/verify`
5. Backend verifies signature and links wallet address to user account
6. User can now receive tokens and redeem perks

#### On-Chain vs Off-Chain Data
- **Off-Chain (MongoDB)**: User profiles, achievement/perk metadata, redemption records
- **On-Chain (Blockchain)**: Token balances, achievement/perk definitions (optional), transaction history
- **Source of Truth**: Blockchain for token balances; database for user management and metadata

#### Tokenomics
- **Token Standard**: ERC20 (RewardHubToken)
- **Decimals**: 18
- **Minting**: Tokens are minted when faculty awards achievements to students
- **Burning**: Tokens are burned when students redeem perks
- **Contract Functions**: `addAchievement`, `addPerk`, `grantAchievement`, `redeemPerk`

### Base URL
```
http://localhost:5000/api
```
*(Production URL should be configured via environment variables)*

### Authentication Method
Most endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication & Authorization

### How to Obtain JWT

#### 1. Register (Public or Admin-Created)
Users can self-register via `POST /api/auth/register` or be created by admins via `POST /api/admin/users`.

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "role": "student"
  }
}
```

### Using the JWT
Include the token in all protected requests:
```http
GET /api/users/wallet/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Role-Based Access Control
Routes are protected using middleware:
- **`verifyToken`**: Validates JWT and attaches `req.user` (decoded token) and `req.userDoc` (full User document)
- **`requireRole(...roles)`**: Restricts access to specific roles
- **`requireWallet`**: Ensures user has connected their MetaMask wallet

### Wallet Connection Flow (Detailed)

**Step 1: Generate Nonce**
```http
POST /api/users/wallet/nonce
Authorization: Bearer <token>
```
Response: `{ "nonce": "RewardHub Login: <uuid>" }`

**Step 2: Sign Nonce with MetaMask**
```javascript
const signature = await ethereum.request({
  method: 'personal_sign',
  params: [nonce, userWalletAddress]
});
```

**Step 3: Verify Signature**
```http
POST /api/users/wallet/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0x..."
}
```

Response: `{ "msg": "Wallet connected successfully", "walletAddress": "0x...", "walletConnected": true }`

---

## Roles and Permissions Matrix

| Endpoint Group | Admin | Faculty | Student | Public |
|---|---|---|---|---|
| **Auth** (register, login) | ✅ | ✅ | ✅ | ✅ |
| **Wallet Connection** | ✅ | ✅ | ✅ | ❌ |
| **Admin: User Management** | ✅ | ❌ | ❌ | ❌ |
| **Admin: Achievement CRUD** | ✅ | ❌ | ❌ | ❌ |
| **Admin: Perk CRUD** | ✅ | ❌ | ❌ | ❌ |
| **Admin: Dashboard Stats** | ✅ | ❌ | ❌ | ❌ |
| **Award Achievements** | ✅ | ✅ | ❌ | ❌ |
| **View Achievements** | ✅ | ✅ | ✅ (own) | ❌ |
| **Redeem Perks** | ✅ | ❌ | ✅ | ❌ |
| **View Redemptions** | ✅ | ❌ | ✅ (own) | ❌ |
| **Blockchain Balance Check** | ✅ | ✅ | ✅ | ✅ |
| **Legacy Achievement/Reward Routes** | ✅ | ✅ | ✅ | ✅ |

---

## Global Response Format

### Success Response
```json
{
  "msg": "Operation successful",
  "data": { /* response data */ }
}
```
or
```json
{
  "achievement": { /* object */ },
  "pagination": { /* pagination info */ }
}
```

### Error Response
```json
{
  "msg": "Error message",
  "error": "Detailed error description"
}
```

Common HTTP Status Codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error, missing fields)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

---

## API Endpoints

### Auth & Wallet Connection

#### `POST /api/auth/register`
**Description**: Register a new user (public self-registration)

**Required Role**: Public

**Requires Wallet**: No

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "student",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" // optional
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| name | String | Yes | User's full name |
| email | String | Yes | Unique email address |
| password | String | Yes | Password (will be hashed) |
| role | String | No | One of: student, faculty, admin (default: student) |
| walletAddress | String | No | Ethereum wallet address |

**Success Response** (201):
```json
{
  "user": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "walletAddress": null,
    "walletConnected": false,
    "createdAt": "2025-12-10T10:30:00.000Z"
  }
}
```

**Error Responses**:
- **400**: `{ "msg": "User already exists" }`
- **500**: `{ "msg": "Server error" }`

---

#### `POST /api/auth/login`
**Description**: Authenticate user and receive JWT token

**Required Role**: Public

**Requires Wallet**: No

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Success Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "role": "student"
  }
}
```

**Error Responses**:
- **404**: `{ "msg": "User not found" }`
- **401**: `{ "msg": "Invalid credentials" }`

**Notes**: Token expires in 7 days

---

#### `POST /api/users/wallet/nonce`
**Description**: Generate a unique nonce for wallet signature verification

**Required Role**: Authenticated (any role)

**Requires Wallet**: No

**Request Body**: None

**Success Response** (200):
```json
{
  "nonce": "RewardHub Login: 123e4567-e89b-12d3-a456-426614174000",
  "msg": "Sign this nonce with your MetaMask wallet using personal_sign"
}
```

**Notes**: Nonce is stored in user document and must be signed within a reasonable timeframe

---

#### `POST /api/users/wallet/verify`
**Description**: Verify wallet signature and connect wallet to user account

**Required Role**: Authenticated (any role)

**Requires Wallet**: No

**Request Body**:
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0x1234567890abcdef..."
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| address | String | Yes | Ethereum wallet address |
| signature | String | Yes | Signature from MetaMask personal_sign |

**Success Response** (200):
```json
{
  "msg": "Wallet connected successfully",
  "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
  "walletConnected": true
}
```

**Error Responses**:
- **400**: `{ "msg": "Missing required fields: address, signature" }`
- **400**: `{ "msg": "Invalid wallet address format" }`
- **400**: `{ "msg": "No nonce found. Please request a nonce first..." }`
- **400**: `{ "msg": "Signature verification failed: address mismatch" }`

**Notes**: 
- Wallet address is stored in lowercase
- Nonce is cleared after successful verification
- User must request new nonce for each connection attempt

---

#### `POST /api/users/wallet/disconnect`
**Description**: Disconnect wallet from user account

**Required Role**: Authenticated (any role)

**Requires Wallet**: No

**Request Body**: None

**Success Response** (200):
```json
{
  "msg": "Wallet disconnected successfully",
  "walletConnected": false
}
```

**Notes**: Clears `walletAddress`, `walletConnected`, and `walletNonce` fields

---

#### `GET /api/users/wallet/status`
**Description**: Get current wallet connection status

**Required Role**: Authenticated (any role)

**Requires Wallet**: No

**Success Response** (200):
```json
{
  "walletConnected": true,
  "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb"
}
```

---

### Admin: User Management

#### `POST /api/admin/users`
**Description**: Register a new user (admin-only, bypasses self-registration)

**Required Role**: `admin`

**Requires Wallet**: No

**Request Body**:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "initialpassword",
  "role": "faculty",
  "walletAddress": "0x..." // optional
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| name | String | Yes | User's full name |
| email | String | Yes | Unique email address |
| password | String | Yes | Initial password (will be hashed) |
| role | String | Yes | One of: student, faculty, admin |
| walletAddress | String | No | Ethereum wallet address |

**Success Response** (201):
```json
{
  "msg": "User registered successfully",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "faculty",
    "walletAddress": null,
    "walletConnected": false,
    "createdAt": "2025-12-10T10:30:00.000Z"
  }
}
```

**Error Responses**:
- **400**: `{ "msg": "Missing required fields: name, email, password, role" }`
- **400**: `{ "msg": "Invalid role. Must be one of: student, faculty, admin" }`
- **400**: `{ "msg": "User with this email already exists" }`
- **400**: `{ "msg": "Invalid wallet address format" }`

---

#### `GET /api/admin/users`
**Description**: List all users with optional filters and pagination

**Required Role**: `admin`

**Requires Wallet**: No

**Query Parameters**:
| Parameter | Type | Description |
|---|---|---|
| role | String | Filter by role (student, faculty, admin) |
| walletConnected | Boolean | Filter by wallet connection status (true/false) |
| page | Number | Page number (default: 1) |
| limit | Number | Results per page (default: 50) |

**Example Request**:
```http
GET /api/admin/users?role=student&walletConnected=true&page=1&limit=20
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "users": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
      "walletConnected": true,
      "createdAt": "2025-12-01T10:00:00.000Z",
      "updatedAt": "2025-12-05T14:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

**Notes**: Password and walletNonce fields are excluded from response

---

### Admin: Achievement Management

#### `POST /api/admin/achievements`
**Description**: Create a new achievement with optional blockchain sync

**Required Role**: `admin`

**Requires Wallet**: No

**Request Body**:
```json
{
  "title": "Perfect Attendance",
  "description": "Attended all classes in a semester",
  "tokenReward": 50,
  "syncOnChain": true
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| title | String | Yes | Unique achievement title |
| description | String | No | Achievement description |
| tokenReward | Number | Yes | Token reward amount (integer) |
| syncOnChain | Boolean | No | If true, creates achievement on blockchain |

**Success Response** (201):
```json
{
  "msg": "Achievement created successfully",
  "achievement": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Perfect Attendance",
    "description": "Attended all classes in a semester",
    "tokenReward": 50,
    "createdBy": "64a1b2c3d4e5f6g7h8i9j0k2",
    "onChainCreated": true,
    "onChainTx": "0xabc123...",
    "createdAt": "2025-12-10T10:30:00.000Z"
  }
}
```

**Success with Warning** (201):
```json
{
  "msg": "Achievement created successfully",
  "achievement": { /* ... */ },
  "warning": "Achievement created in database but blockchain sync failed: insufficient gas"
}
```

**Error Responses**:
- **400**: `{ "msg": "Missing required fields: title, tokenReward" }`
- **400**: `{ "msg": "Achievement with this title already exists" }`

**Notes**:
- If `syncOnChain` is true but blockchain sync fails, achievement is still created in database with `onChainCreated: false`
- Graceful fallback ensures database consistency even if blockchain is unavailable

---

#### `GET /api/admin/achievements`
**Description**: List all achievements with pagination and filters

**Required Role**: `admin`

**Requires Wallet**: No

**Query Parameters**:
| Parameter | Type | Description |
|---|---|---|
| page | Number | Page number (default: 1) |
| limit | Number | Results per page (default: 50) |
| onChainCreated | Boolean | Filter by blockchain sync status |

**Success Response** (200):
```json
{
  "achievements": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "title": "Perfect Attendance",
      "description": "Attended all classes in a semester",
      "tokenReward": 50,
      "createdBy": {
        "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "onChainCreated": true,
      "onChainTx": "0xabc123...",
      "createdAt": "2025-12-10T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 50,
    "pages": 1
  }
}
```

---

#### `GET /api/admin/achievements/:id`
**Description**: Get single achievement by ID

**Required Role**: `admin`

**Requires Wallet**: No

**Success Response** (200):
```json
{
  "achievement": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Perfect Attendance",
    "description": "Attended all classes in a semester",
    "tokenReward": 50,
    "createdBy": {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "onChainCreated": true,
    "onChainTx": "0xabc123...",
    "createdAt": "2025-12-10T10:30:00.000Z"
  }
}
```

**Error Responses**:
- **404**: `{ "msg": "Achievement not found" }`

---

#### `PUT /api/admin/achievements/:id`
**Description**: Update an existing achievement

**Required Role**: `admin`

**Requires Wallet**: No

**Request Body**:
```json
{
  "title": "Perfect Attendance Award",
  "description": "Updated description",
  "tokenReward": 75,
  "syncOnChain": true
}
```

**Success Response** (200):
```json
{
  "msg": "Achievement updated successfully",
  "achievement": { /* updated achievement */ }
}
```

**Notes**:
- If `syncOnChain: true` and achievement was not previously on-chain, it will be added to blockchain
- Partial updates supported (only include fields to update)

---

#### `DELETE /api/admin/achievements/:id`
**Description**: Delete an achievement from database

**Required Role**: `admin`

**Requires Wallet**: No

**Success Response** (200):
```json
{
  "msg": "Achievement deleted successfully",
  "achievement": { /* deleted achievement */ }
}
```

**Error Responses**:
- **404**: `{ "msg": "Achievement not found" }`

**Notes**: Does NOT remove achievement from blockchain if it was synced

---

### Admin: Perk/Reward Management

#### `POST /api/admin/perks`
**Description**: Create a new perk/reward with optional blockchain sync

**Required Role**: `admin`

**Requires Wallet**: No

**Request Body**:
```json
{
  "title": "Free Coffee",
  "description": "Redeem for a free coffee at campus cafe",
  "tokenCost": 10,
  "syncOnChain": true
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| title | String | Yes | Unique perk title |
| description | String | No | Perk description |
| tokenCost | Number | Yes | Token cost to redeem (integer) |
| syncOnChain | Boolean | No | If true, creates perk on blockchain |

**Success Response** (201):
```json
{
  "msg": "Perk created successfully",
  "perk": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Free Coffee",
    "description": "Redeem for a free coffee at campus cafe",
    "tokenCost": 10,
    "createdBy": "64a1b2c3d4e5f6g7h8i9j0k2",
    "onChainCreated": true,
    "onChainTx": "0xdef456...",
    "createdAt": "2025-12-10T10:30:00.000Z"
  }
}
```

**Error Responses**:
- **400**: `{ "msg": "Missing required fields: title, tokenCost" }`
- **400**: `{ "msg": "Perk with this title already exists" }`

---

#### `GET /api/admin/perks`
**Description**: List all perks with pagination and filters

**Required Role**: `admin`

**Requires Wallet**: No

**Query Parameters**: Same as achievements (page, limit, onChainCreated)

**Success Response** (200):
```json
{
  "perks": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "title": "Free Coffee",
      "description": "Redeem for a free coffee at campus cafe",
      "tokenCost": 10,
      "createdBy": {
        "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "onChainCreated": true,
      "onChainTx": "0xdef456...",
      "createdAt": "2025-12-10T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 50,
    "pages": 1
  }
}
```

---

#### `GET /api/admin/perks/:id`
**Description**: Get single perk by ID

**Required Role**: `admin`

**Requires Wallet**: No

**Success Response** (200):
```json
{
  "perk": { /* perk object */ }
}
```

**Error Responses**:
- **404**: `{ "msg": "Perk not found" }`

---

#### `PUT /api/admin/perks/:id`
**Description**: Update an existing perk

**Required Role**: `admin`

**Requires Wallet**: No

**Request Body**: Same structure as create (all fields optional)

**Success Response** (200):
```json
{
  "msg": "Perk updated successfully",
  "perk": { /* updated perk */ }
}
```

---

#### `DELETE /api/admin/perks/:id`
**Description**: Delete a perk from database

**Required Role**: `admin`

**Requires Wallet**: No

**Success Response** (200):
```json
{
  "msg": "Perk deleted successfully",
  "perk": { /* deleted perk */ }
}
```

---

### Admin: Dashboard & Statistics

#### `GET /api/admin/dashboard-stats`
**Description**: Get comprehensive dashboard statistics from database and blockchain

**Required Role**: `admin`

**Requires Wallet**: No

**Success Response** (200):
```json
{
  "totalAchievements": 15,
  "totalPerks": 8,
  "totalRegisteredStudents": 120,
  "totalRegisteredFaculty": 12,
  "totalTokensRedeemed": 450,
  "totalAchievementsCreated": 15,
  "totalRewardsCreated": 8,
  "studentsWithNoWallet": 35,
  "totalTokensAvailableInBlockchain": 10000,
  "totalTokensDistributedToStudents": 2500,
  "topHolders": [
    {
      "studentId": "64a1b2c3d4e5f6g7h8i9j0k1",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
      "balance": 150
    },
    {
      "studentId": "64a1b2c3d4e5f6g7h8i9j0k2",
      "name": "Bob Smith",
      "email": "bob@example.com",
      "walletAddress": "0x123abc...",
      "balance": 125
    }
  ],
  "timestamp": "2025-12-10T10:30:00.000Z"
}
```

**Notes**:
- Fetches real-time data from both MongoDB and blockchain
- `totalTokensRedeemed` calculated from approved redemptions in database
- `totalTokensDistributedToStudents` is sum of all student wallet balances from blockchain
- `topHolders` limited to top 10 students by balance
- Gracefully handles blockchain errors (returns 0 values if blockchain unavailable)

---

### Faculty: Award Achievements

#### `POST /api/student-achievements`
**Description**: Award an achievement to a student (mints tokens on blockchain)

**Required Role**: `faculty` or `admin`

**Requires Wallet**: No (but student must have wallet connected)

**Request Body**:
```json
{
  "studentId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "achievementId": "64a1b2c3d4e5f6g7h8i9j0k2"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| studentId | String | Yes | MongoDB ObjectId of student |
| achievementId | String | Yes | MongoDB ObjectId of achievement |

**Success Response** (201):
```json
{
  "msg": "Achievement awarded successfully and tokens minted on blockchain",
  "achievement": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k3",
    "studentId": {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "name": "John Doe",
      "email": "john@example.com",
      "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb"
    },
    "achievementId": {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
      "title": "Perfect Attendance",
      "description": "Attended all classes in a semester",
      "tokenReward": 50
    },
    "awardedBy": {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k4",
      "name": "Prof. Smith",
      "email": "smith@example.com",
      "role": "faculty"
    },
    "dateAwarded": "2025-12-10T10:30:00.000Z",
    "txHash": "0xabc123def456...",
    "status": "confirmed"
  },
  "txHash": "0xabc123def456...",
  "tokensAwarded": 50,
  "studentWallet": "0x742d35cc6634c0532925a3b844bc9e7595f0beb"
}
```

**Error Responses**:
- **404**: `{ "msg": "Achievement not found" }`
- **404**: `{ "msg": "Student not found" }`
- **400**: `{ "msg": "User is not a student. Only students can receive achievements." }`
- **400**: `{ "msg": "Student has not connected their wallet...", "action": "student_must_connect_wallet" }`
- **400**: `{ "msg": "This achievement has already been awarded to this student" }`
- **500**: `{ "msg": "Achievement logged in database but blockchain transaction failed", "possibleReasons": [...] }`

**Notes**:
- **CRITICAL**: Student MUST have connected wallet before receiving achievements
- If achievement doesn't exist on blockchain, backend automatically adds it first
- Calls `blockchain.grantAchievement(studentAddress, achievementTitle)` which mints tokens
- Achievement record created with `status: "pending_onchain"`, updated to `"confirmed"` on success or `"failed"` on blockchain error
- Prevents duplicate awards (checks for existing confirmed/pending awards)

---

#### `GET /api/student-achievements/student/:studentId`
**Description**: Get all achievements for a specific student

**Required Role**: `faculty`, `admin`, or `student` (students can only view their own)

**Requires Wallet**: No

**Success Response** (200):
```json
{
  "count": 3,
  "totalTokensEarned": 150,
  "achievements": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k3",
      "achievementId": {
        "title": "Perfect Attendance",
        "description": "Attended all classes in a semester",
        "tokenReward": 50
      },
      "awardedBy": {
        "name": "Prof. Smith",
        "email": "smith@example.com",
        "role": "faculty"
      },
      "dateAwarded": "2025-12-10T10:30:00.000Z",
      "txHash": "0xabc123...",
      "status": "confirmed"
    }
  ]
}
```

**Error Responses**:
- **403**: `{ "msg": "Access denied. You can only view your own achievements." }` (if student tries to view another student's achievements)

**Notes**: `totalTokensEarned` only counts achievements with `status: "confirmed"`

---

### Student: View Achievements & Balance

Students use the same endpoint as faculty to view achievements:
- `GET /api/student-achievements/student/:studentId` (with their own ID)

#### `GET /api/blockchain/balance/:wallet`
**Description**: Get token balance for a wallet address from blockchain

**Required Role**: Public (no authentication required)

**Requires Wallet**: No

**Success Response** (200):
```json
{
  "wallet": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
  "raw": "150000000000000000000",
  "human": 150
}
```

| Field | Description |
|---|---|
| wallet | Wallet address queried |
| raw | Raw balance in wei (with 18 decimals) |
| human | Human-readable balance (tokens) |

**Error Responses**:
- **500**: `{ "error": "Blockchain error message" }`

---

### Student: Redeem Perks

#### `POST /api/redemptions`
**Description**: Redeem a perk (burns tokens on blockchain)

**Required Role**: `student` or `admin`

**Requires Wallet**: **Yes** (enforced by `requireWallet` middleware)

**Request Body**:
```json
{
  "studentId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "rewardId": "64a1b2c3d4e5f6g7h8i9j0k2",
  "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| studentId | String | Yes | MongoDB ObjectId of student |
| rewardId | String | Yes | MongoDB ObjectId of perk/reward |
| walletAddress | String | Yes | Student's wallet address |

**Success Response** (201):
```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k3",
  "studentId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "rewardId": "64a1b2c3d4e5f6g7h8i9j0k2",
  "date": "2025-12-10T10:30:00.000Z",
  "status": "approved",
  "txHash": "0xdef456..."
}
```

**Error Responses**:
- **404**: `{ "msg": "Reward not found" }`
- **400**: `{ "msg": "Not enough tokens" }`
- **400**: `{ "msg": "Wallet not connected. Please connect your MetaMask wallet first." }`
- **500**: `{ "error": "Blockchain error message" }`

**Notes**:
- Checks student's balance by calculating: (total earned from achievements) - (total redeemed)
- Calls `blockchain.redeemPerk(rewardTitle)` which burns tokens
- Redemption status set to `"approved"` immediately (no approval workflow currently)

---

#### `GET /api/redemptions/student/:studentId`
**Description**: Get all redemptions for a specific student

**Required Role**: Any authenticated user

**Requires Wallet**: No

**Success Response** (200):
```json
[
  {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k3",
    "studentId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "rewardId": {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
      "title": "Free Coffee",
      "description": "Redeem for a free coffee",
      "tokenCost": 10
    },
    "date": "2025-12-10T10:30:00.000Z",
    "status": "approved",
    "txHash": "0xdef456..."
  }
]
```

---

#### `GET /api/redemptions`
**Description**: Get all redemptions (admin view)

**Required Role**: Any authenticated user (intended for admin)

**Requires Wallet**: No

**Success Response** (200):
```json
[
  {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k3",
    "studentId": {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "rewardId": {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
      "title": "Free Coffee",
      "tokenCost": 10
    },
    "date": "2025-12-10T10:30:00.000Z",
    "status": "approved",
    "txHash": "0xdef456..."
  }
]
```

---

### Blockchain Utilities

#### `GET /api/blockchain/balance/:wallet`
**Description**: Get token balance for any wallet address

**Required Role**: Public

**Requires Wallet**: No

**Path Parameters**:
| Parameter | Description |
|---|---|
| wallet | Ethereum wallet address |

**Success Response** (200):
```json
{
  "wallet": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
  "raw": "150000000000000000000",
  "human": 150
}
```

---

### Legacy/Public Routes

These routes exist for backward compatibility or public access:

#### `POST /api/achievements`
**Description**: Legacy achievement creation (no auth)

**Required Role**: Public

**Notes**: Consider deprecating in favor of admin routes

---

#### `GET /api/achievements`
**Description**: Get all achievements (public)

**Required Role**: Public

**Success Response** (200):
```json
[
  {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Perfect Attendance",
    "description": "Attended all classes",
    "tokenReward": 50,
    "createdAt": "2025-12-10T10:30:00.000Z"
  }
]
```

---

#### `POST /api/rewards`
**Description**: Legacy reward creation (no auth)

**Required Role**: Public

**Notes**: Consider deprecating in favor of admin routes

---

#### `GET /api/rewards`
**Description**: Get all rewards/perks (public)

**Required Role**: Public

**Success Response** (200):
```json
[
  {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Free Coffee",
    "description": "Redeem for coffee",
    "tokenCost": 10,
    "createdAt": "2025-12-10T10:30:00.000Z"
  }
]
```

---

#### `POST /api/students/register`
**Description**: Register student on blockchain

**Required Role**: Public

**Notes**: Legacy route, may not be actively used

---

## Models / Data Structures

### User Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed with bcrypt),
  role: String (enum: ["student", "faculty", "admin"], default: "student"),
  walletAddress: String (default: null, lowercase),
  walletConnected: Boolean (default: false),
  walletNonce: String (default: null),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Validation**:
- `walletAddress` validated with `ethers.isAddress()` before save
- `walletAddress` automatically converted to lowercase

---

### Achievement Model
```javascript
{
  _id: ObjectId,
  title: String (required, unique),
  description: String,
  tokenReward: Number (required),
  createdBy: ObjectId (ref: "User", default: null),
  onChainCreated: Boolean (default: false),
  onChainTx: String (default: null),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

### Reward Model (Perk)
```javascript
{
  _id: ObjectId,
  title: String (required, unique),
  description: String,
  tokenCost: Number (required),
  createdBy: ObjectId (ref: "User", default: null),
  onChainCreated: Boolean (default: false),
  onChainTx: String (default: null),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

### StudentAchievement Model
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: "User", required),
  achievementId: ObjectId (ref: "Achievement", required),
  dateAwarded: Date (default: Date.now),
  txHash: String,
  status: String (enum: ["pending_onchain", "confirmed", "failed"], default: "pending_onchain"),
  awardedBy: ObjectId (ref: "User", default: null)
}
```

**Status Values**:
- `pending_onchain`: Achievement logged, blockchain transaction in progress
- `confirmed`: Blockchain transaction successful, tokens minted
- `failed`: Blockchain transaction failed

---

### Redemption Model
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: "User", required),
  rewardId: ObjectId (ref: "Reward", required),
  date: Date (default: Date.now),
  status: String (enum: ["pending", "approved", "rejected"], default: "pending"),
  txHash: String
}
```

**Status Values**:
- `pending`: Redemption requested (not currently used)
- `approved`: Redemption completed, tokens burned
- `rejected`: Redemption rejected (not currently used)

---

## Blockchain Integration

### Smart Contract
**Contract Name**: RewardHubToken  
**Type**: ERC20 Token with custom achievement/perk management  
**Network**: Ethereum Sepolia Testnet (or Ganache for local development)  
**Decimals**: 18

### Contract Address
Configured via environment variable:
```
CONTRACT_ADDRESS=0x...
```

### On-Chain Actions Performed by Backend

| Action | Contract Function | Trigger | Description |
|---|---|---|---|
| Add Achievement | `addAchievement(title, rewardAmount)` | Admin creates achievement with `syncOnChain: true` | Registers achievement on-chain |
| Add Perk | `addPerk(title, cost)` | Admin creates perk with `syncOnChain: true` | Registers perk on-chain |
| Grant Achievement | `grantAchievement(studentAddress, achievementTitle)` | Faculty awards achievement to student | Mints tokens to student wallet |
| Redeem Perk | `redeemPerk(studentAddress, perkTitle)` | Student redeems perk | Burns tokens from student wallet |
| Register Student | `registerStudent(studentAddress)` | Legacy/optional | Registers student on-chain (if contract supports) |

### Source of Truth
- **Token Balances**: Blockchain (via `balanceOf(address)`)
- **User Profiles**: MongoDB
- **Achievement/Perk Metadata**: MongoDB (blockchain stores minimal data)
- **Transaction History**: Both (MongoDB for records, blockchain for verification)

### Optional On-Chain Sync
Achievements and perks can be created **without** blockchain sync:
- Set `syncOnChain: false` or omit the field when creating
- Achievement/perk exists only in database
- When awarding, backend checks if achievement exists on-chain
- If not, backend automatically adds it before granting

### Graceful Fallback
If blockchain operations fail:
- Database records are still created/updated
- Response includes `warning` field with error details
- System remains functional for database operations
- Dashboard stats show 0 for blockchain data if unavailable

### Token Decimals
All token amounts use **18 decimals** (standard ERC20):
- Backend stores integer values (e.g., 50 tokens)
- Blockchain stores wei values (e.g., 50 * 10^18)
- `ethers.formatUnits()` and `ethers.parseUnits()` handle conversion

---

## Error Codes & Messages

### Authentication Errors

| Status | Message | Cause |
|---|---|---|
| 401 | "Access denied. No token provided or invalid format..." | Missing or malformed Authorization header |
| 401 | "Invalid token" | JWT signature verification failed |
| 401 | "Token expired" | JWT has expired (> 7 days old) |
| 401 | "User not found. Token may be invalid." | User ID in token doesn't exist in database |

### Authorization Errors

| Status | Message | Cause |
|---|---|---|
| 403 | "Access denied. Required role(s): admin. Your role: student" | User role insufficient for endpoint |
| 403 | "Access denied. You can only view your own achievements." | Student trying to access another student's data |

### Wallet Errors

| Status | Message | Cause |
|---|---|---|
| 400 | "Wallet not connected. Please connect your MetaMask wallet first." | Endpoint requires wallet but user hasn't connected |
| 400 | "Invalid wallet address format" | Wallet address fails ethers.isAddress() validation |
| 400 | "No nonce found. Please request a nonce first..." | Attempting to verify signature without generating nonce |
| 400 | "Signature verification failed: address mismatch" | Signature not signed by claimed wallet address |

### Validation Errors

| Status | Message | Cause |
|---|---|---|
| 400 | "Missing required fields: ..." | Required request body fields missing |
| 400 | "Invalid role. Must be one of: student, faculty, admin" | Invalid role value |
| 400 | "User already exists" / "User with this email already exists" | Email already registered |
| 400 | "Achievement with this title already exists" | Duplicate achievement title |
| 400 | "Perk with this title already exists" | Duplicate perk title |
| 400 | "Not enough tokens" | Student balance insufficient for redemption |

### Resource Not Found

| Status | Message | Cause |
|---|---|---|
| 404 | "User not found" | User ID doesn't exist |
| 404 | "Achievement not found" | Achievement ID doesn't exist |
| 404 | "Perk not found" | Perk ID doesn't exist |
| 404 | "Reward not found" | Reward ID doesn't exist |
| 404 | "Student not found" | Student ID doesn't exist |

### Blockchain Errors

| Status | Message | Cause |
|---|---|---|
| 500 | "Achievement logged in database but blockchain transaction failed" | Achievement awarded in DB but on-chain mint failed |
| 500 | "Blockchain addAchievement failed: ..." | Contract call to add achievement failed |
| 500 | "Blockchain grantAchievement failed: ..." | Contract call to grant achievement failed |
| 500 | "Blockchain redeemPerk failed: ..." | Contract call to redeem perk failed |

**Common Blockchain Failure Reasons**:
- Achievement/perk not added to blockchain
- Insufficient gas
- Network connectivity issues
- Invalid wallet address
- Contract owner permissions not set correctly

### Server Errors

| Status | Message | Cause |
|---|---|---|
| 500 | "Server error" | Generic internal server error |
| 500 | "Server configuration error: requireRole must be used after verifyToken middleware" | Middleware ordering issue |

---

## Testing & Examples

### Recommended Testing Flow

1. **Create Admin User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

2. **Login as Admin**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```
Save the returned `token` for subsequent requests.

3. **Create Achievement (with blockchain sync)**
```bash
curl -X POST http://localhost:5000/api/admin/achievements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "title": "Perfect Attendance",
    "description": "Attended all classes",
    "tokenReward": 50,
    "syncOnChain": true
  }'
```

4. **Create Perk (with blockchain sync)**
```bash
curl -X POST http://localhost:5000/api/admin/perks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "title": "Free Coffee",
    "description": "Redeem for coffee",
    "tokenCost": 10,
    "syncOnChain": true
  }'
```

5. **Register Student**
```bash
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "student123",
    "role": "student"
  }'
```

6. **Login as Student**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "student123"
  }'
```

7. **Connect Wallet (Student)**

Step 1: Get nonce
```bash
curl -X POST http://localhost:5000/api/users/wallet/nonce \
  -H "Authorization: Bearer <student_token>"
```

Step 2: Sign nonce with MetaMask (frontend)
```javascript
const signature = await ethereum.request({
  method: 'personal_sign',
  params: [nonce, walletAddress]
});
```

Step 3: Verify signature
```bash
curl -X POST http://localhost:5000/api/users/wallet/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <student_token>" \
  -d '{
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "signature": "0x..."
  }'
```

8. **Award Achievement (Faculty/Admin)**
```bash
curl -X POST http://localhost:5000/api/student-achievements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <faculty_or_admin_token>" \
  -d '{
    "studentId": "<student_mongodb_id>",
    "achievementId": "<achievement_mongodb_id>"
  }'
```

9. **Check Student Balance**
```bash
curl http://localhost:5000/api/blockchain/balance/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

10. **Redeem Perk (Student)**
```bash
curl -X POST http://localhost:5000/api/redemptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <student_token>" \
  -d '{
    "studentId": "<student_mongodb_id>",
    "rewardId": "<perk_mongodb_id>",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

11. **View Dashboard Stats (Admin)**
```bash
curl http://localhost:5000/api/admin/dashboard-stats \
  -H "Authorization: Bearer <admin_token>"
```

### Postman Collection
Consider creating a Postman collection with:
- Environment variables for `baseUrl`, `adminToken`, `facultyToken`, `studentToken`
- Pre-request scripts to automatically set tokens
- Example requests for all endpoints

### Testing Scripts
The project includes verification scripts in `/scripts`:
- `verify-dashboard.js`: Tests dashboard statistics endpoint
- Other scripts for blockchain interaction testing

Run with:
```bash
node scripts/verify-dashboard.js
```

---

## Security Considerations

### JWT Security
- **Secret Key**: Store `JWT_SECRET` in environment variables, never commit to version control
- **Token Expiration**: Tokens expire after 7 days
- **Token Storage**: Frontend should store tokens securely (httpOnly cookies recommended for production)

### Wallet Signature Verification
- **Nonce**: Unique nonce generated for each wallet connection attempt
- **Signature Verification**: Backend uses `ethers.verifyMessage()` to cryptographically verify signature
- **Address Validation**: All wallet addresses validated with `ethers.isAddress()`
- **No Private Keys**: Backend never stores or requests private keys

### Password Security
- **Hashing**: All passwords hashed with bcrypt (salt rounds: 10)
- **Password Field**: Excluded from all API responses (`.select("-password")`)

### Input Validation
- **Required Fields**: Validated in controllers before processing
- **Email Uniqueness**: Enforced at database level (unique index)
- **Role Validation**: Restricted to predefined enum values
- **MongoDB Injection**: Mongoose provides protection against NoSQL injection

### Blockchain Security
- **Private Key**: Backend uses single private key (contract owner) stored in `.env`
- **Gas Management**: Consider implementing gas price limits for production
- **Transaction Verification**: All transactions wait for confirmation before updating database
- **Fallback Handling**: Graceful degradation if blockchain unavailable

### CORS
- Currently configured to allow all origins (`app.use(cors())`)
- **Production**: Restrict to specific frontend domains:
```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

### Rate Limiting
- **Recommendation**: Implement rate limiting for production (e.g., `express-rate-limit`)
- Especially important for:
  - Login endpoint (prevent brute force)
  - Wallet nonce generation (prevent spam)
  - Blockchain operations (prevent gas exhaustion)

### Environment Variables
Required `.env` configuration:
```
MONGO_URI=mongodb://localhost:27017/rewardhub
JWT_SECRET=your_secure_random_secret_here
PRIVATE_KEY=0x...
CONTRACT_ADDRESS=0x...
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PORT=5000
```

**Never commit `.env` to version control!**

---

## Appendix: Quick Reference

### All Endpoints Summary

| Method | Path | Auth | Role | Wallet Required |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | Public | No |
| POST | `/api/auth/login` | No | Public | No |
| POST | `/api/users/wallet/nonce` | Yes | Any | No |
| POST | `/api/users/wallet/verify` | Yes | Any | No |
| POST | `/api/users/wallet/disconnect` | Yes | Any | No |
| GET | `/api/users/wallet/status` | Yes | Any | No |
| POST | `/api/admin/users` | Yes | Admin | No |
| GET | `/api/admin/users` | Yes | Admin | No |
| POST | `/api/admin/achievements` | Yes | Admin | No |
| GET | `/api/admin/achievements` | Yes | Admin | No |
| GET | `/api/admin/achievements/:id` | Yes | Admin | No |
| PUT | `/api/admin/achievements/:id` | Yes | Admin | No |
| DELETE | `/api/admin/achievements/:id` | Yes | Admin | No |
| POST | `/api/admin/perks` | Yes | Admin | No |
| GET | `/api/admin/perks` | Yes | Admin | No |
| GET | `/api/admin/perks/:id` | Yes | Admin | No |
| PUT | `/api/admin/perks/:id` | Yes | Admin | No |
| DELETE | `/api/admin/perks/:id` | Yes | Admin | No |
| GET | `/api/admin/dashboard-stats` | Yes | Admin | No |
| POST | `/api/student-achievements` | Yes | Faculty/Admin | No* |
| GET | `/api/student-achievements/student/:studentId` | Yes | Any | No |
| POST | `/api/redemptions` | Yes | Student/Admin | Yes |
| GET | `/api/redemptions/student/:studentId` | Yes | Any | No |
| GET | `/api/redemptions` | Yes | Any | No |
| GET | `/api/blockchain/balance/:wallet` | No | Public | No |
| POST | `/api/achievements` | No | Public | No |
| GET | `/api/achievements` | No | Public | No |
| POST | `/api/rewards` | No | Public | No |
| GET | `/api/rewards` | No | Public | No |
| POST | `/api/students/register` | No | Public | No |

*Student receiving achievement must have wallet connected

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-10  
**Maintained By**: RewardHub Development Team

For questions or issues, please contact the development team or open an issue in the project repository.
