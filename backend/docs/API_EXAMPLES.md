# RewardHub API Examples

This document provides curl and Postman examples for testing all new backend features.

## Table of Contents

1. [Admin User Registration](#admin-user-registration)
2. [User Login](#user-login)
3. [Wallet Connection Flow](#wallet-connection-flow)
4. [Achievement Management](#achievement-management)
5. [Perk Management](#perk-management)
6. [Faculty Award Achievement](#faculty-award-achievement)
7. [Admin Dashboard Statistics](#admin-dashboard-statistics)

---

## Prerequisites

- Backend server running on `http://localhost:5000`
- MongoDB connected
- Blockchain node (Ganache or Sepolia) running
- Contract deployed and address in `.env`

---

## Admin User Registration

### Create Admin User (First Time Setup)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### Admin Registers a Student (No Wallet Required)

```bash
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "name": "Test Student",
    "email": "student@test.com",
    "password": "student123",
    "role": "student"
  }'
```

### Admin Registers a Faculty Member

```bash
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "name": "Faculty Member",
    "email": "faculty@test.com",
    "password": "faculty123",
    "role": "faculty"
  }'
```

### List All Users (Admin Only)

```bash
curl -X GET "http://localhost:5000/api/admin/users?role=student&page=1&limit=10" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## User Login

### Login as Student

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "student123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test Student",
    "role": "student"
  }
}
```

Save the `token` for subsequent requests.

---

## Wallet Connection Flow

### Step 1: Request Nonce

```bash
curl -X POST http://localhost:5000/api/users/wallet/nonce \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

**Response:**
```json
{
  "nonce": "RewardHub Login: 123e4567-e89b-12d3-a456-426614174000",
  "msg": "Sign this nonce with your MetaMask wallet using personal_sign"
}
```

### Step 2: Sign Nonce with MetaMask

In your frontend JavaScript:

```javascript
const nonce = "RewardHub Login: 123e4567-e89b-12d3-a456-426614174000";
const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
const address = accounts[0];
const signature = await ethereum.request({
  method: 'personal_sign',
  params: [nonce, address]
});
```

### Step 3: Verify Signature

```bash
curl -X POST http://localhost:5000/api/users/wallet/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <STUDENT_TOKEN>" \
  -d '{
    "address": "0x9B252079d6A7021042380e14E3964521142dDca9",
    "signature": "0x..."
  }'
```

**Response:**
```json
{
  "msg": "Wallet connected successfully",
  "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
  "walletConnected": true
}
```

### Check Wallet Status

```bash
curl -X GET http://localhost:5000/api/users/wallet/status \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

### Disconnect Wallet

```bash
curl -X POST http://localhost:5000/api/users/wallet/disconnect \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

---

## Achievement Management

### Create Achievement (Admin Only)

Without blockchain sync:

```bash
curl -X POST http://localhost:5000/api/admin/achievements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "title": "Perfect Attendance",
    "description": "Attended all classes this semester",
    "tokenReward": 100
  }'
```

With blockchain sync:

```bash
curl -X POST http://localhost:5000/api/admin/achievements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "title": "Top Performer",
    "description": "Scored 90+ in all subjects",
    "tokenReward": 200,
    "syncOnChain": true
  }'
```

### List All Achievements

```bash
curl -X GET "http://localhost:5000/api/admin/achievements?page=1&limit=10" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Get Single Achievement

```bash
curl -X GET http://localhost:5000/api/admin/achievements/<ACHIEVEMENT_ID> \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Update Achievement

```bash
curl -X PUT http://localhost:5000/api/admin/achievements/<ACHIEVEMENT_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "description": "Updated description",
    "tokenReward": 150,
    "syncOnChain": true
  }'
```

### Delete Achievement

```bash
curl -X DELETE http://localhost:5000/api/admin/achievements/<ACHIEVEMENT_ID> \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## Perk Management

### Create Perk (Admin Only)

```bash
curl -X POST http://localhost:5000/api/admin/perks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "title": "Free Coffee",
    "description": "One free coffee from campus cafe",
    "tokenCost": 50,
    "syncOnChain": true
  }'
```

### List All Perks

```bash
curl -X GET "http://localhost:5000/api/admin/perks?page=1&limit=10" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Get Single Perk

```bash
curl -X GET http://localhost:5000/api/admin/perks/<PERK_ID> \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Update Perk

```bash
curl -X PUT http://localhost:5000/api/admin/perks/<PERK_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "tokenCost": 75
  }'
```

### Delete Perk

```bash
curl -X DELETE http://localhost:5000/api/admin/perks/<PERK_ID> \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## Faculty Award Achievement

Faculty or admin can award achievements to students who have connected wallets.

```bash
curl -X POST http://localhost:5000/api/student-achievements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <FACULTY_TOKEN>" \
  -d '{
    "studentId": "<STUDENT_ID>",
    "achievementId": "<ACHIEVEMENT_ID>"
  }'
```

**Success Response:**
```json
{
  "msg": "Achievement awarded successfully",
  "achievement": {
    "_id": "...",
    "studentId": "...",
    "achievementId": "...",
    "status": "confirmed",
    "txHash": "0x...",
    "awardedBy": "...",
    "dateAwarded": "2025-12-09T..."
  },
  "txHash": "0x...",
  "tokensAwarded": 100
}
```

**Error if Student Has No Wallet:**
```json
{
  "msg": "Student has not connected their wallet. Achievement cannot be awarded.",
  "studentEmail": "student@test.com",
  "action": "student_must_connect_wallet"
}
```

---

## Admin Dashboard Statistics

Get comprehensive dashboard statistics including DB and blockchain data.

```bash
curl -X GET http://localhost:5000/api/admin/dashboard-stats \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Response:**
```json
{
  "totalAchievements": 5,
  "totalPerks": 3,
  "totalRegisteredStudents": 25,
  "totalRegisteredFaculty": 8,
  "totalTokensRedeemed": 450,
  "totalAchievementsCreated": 5,
  "totalRewardsCreated": 3,
  "studentsWithNoWallet": 10,
  "totalTokensAvailableInBlockchain": 5000,
  "totalTokensDistributedToStudents": 3200,
  "topHolders": [
    {
      "studentId": "...",
      "name": "John Doe",
      "email": "john@test.com",
      "walletAddress": "0x...",
      "balance": 450
    },
    {
      "studentId": "...",
      "name": "Jane Smith",
      "email": "jane@test.com",
      "walletAddress": "0x...",
      "balance": 380
    }
  ],
  "timestamp": "2025-12-09T16:30:00.000Z"
}
```

---

## Token Balance

Get token balance for a wallet address.

```bash
curl -X GET http://localhost:5000/api/blockchain/balance/0x9B252079d6A7021042380e14E3964521142dDca9
```

**Response:**
```json
{
  "wallet": "0x9B252079d6A7021042380e14E3964521142dDca9",
  "raw": "100000000000000000000",
  "human": 100
}
```

---

## Testing Scripts

### Generate Admin Token

```bash
cd backend
node scripts/generateAdminToken.js admin@test.com
```

### Verify Dashboard

```bash
cd backend
node scripts/verify-dashboard.js <ADMIN_TOKEN>
```

Or with environment variable:

```bash
ADMIN_TOKEN=<token> node scripts/verify-dashboard.js
```

---

## Postman Collection

Import these examples into Postman:

1. Create a new collection called "RewardHub API"
2. Add environment variables:
   - `BASE_URL`: `http://localhost:5000`
   - `ADMIN_TOKEN`: (set after login)
   - `STUDENT_TOKEN`: (set after login)
   - `FACULTY_TOKEN`: (set after login)
3. Use `{{BASE_URL}}` and `{{ADMIN_TOKEN}}` in your requests

---

## Notes

- All admin endpoints require `Authorization: Bearer <ADMIN_TOKEN>` header
- Wallet connection is required before students can receive achievements or redeem perks
- On-chain sync is optional and will gracefully fail if blockchain is unavailable
- Token decimals are assumed to be 18 (standard ERC20)
