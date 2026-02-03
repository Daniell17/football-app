# Football App Implementation

This repository contains the source code for the Football App, consisting of a **Web Application** and a **CRM System**, built with NestJS.

## Prerequisites

- **Node.js** (v18 or later)
- **PostgreSQL** (Database)
- **Redis** (For Rate Limiting)
- **npm** (Package Manager)

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Variables**
    Create a `.env` file in the root directory (based on `.env.example` if available) and configure your database and security secrets:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/football_db"
    REDIS_HOST="localhost"
    REDIS_PORT=6379
    JWT_SECRET="your-secure-secret"
    JWT_REFRESH_SECRET="your-secure-refresh-secret"
    ```

3.  **Database Setup**
    Apply the Prisma schema to your database:
    ```bash
    npx prisma migrate dev --name init
    npx prisma generate
    ```

## Running the Applications

**Start the Web App:**
```bash
npm run start:dev
# OR specific target
nest start web --watch
```

**Start the CRM App:**
```bash
nest start crm --watch
```

## Security Features

This project implements robust security measures:
-   **Authentication**: Argon2 hashing, Session-based Refresh Token Rotation, HIBP Breach Check.
-   **Account Recovery**: Secure Password Reset flow via Email (Mocked).
-   **Rate Limiting**: Redis-backed protection for login endpoints.
-   **Protection**: Helmet (Headers), CORS, and Global Validation.
