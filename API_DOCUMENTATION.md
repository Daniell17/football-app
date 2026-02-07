# Football App API Guide

This document explains how to connect the frontend applications to the backend APIs.

There are two separate applications:
1.  **Web App (Public)**: For fans/users to buy tickets, view matches, etc.
2.  **CRM App (Admin)**: For staff to manage users, matches, and content.

---

## � Connection Details

### 1. Web App (Public)
*   **Base URL**: `http://localhost:8080/api`
*   **Audience**: General Users (Fans)
*   **Key Features**: Login/Register, View Matches, Buy Tickets, View Profile.

### 2. CRM App (Admin)
*   **Base URL**: `http://localhost:9090/api`
*   **Audience**: Admins, Staff
*   **Key Features**: User Management, Match Scheduling, Content Management (News), System Config.

---

## � Authentication (How to Login)

Both apps use the same secure login flow.

### Step 1: Login
Send a `POST` request to `/auth/login` with email and password.
**Response:**
```json
{
  "accessToken": "ey...",       // Short-lived key (15 mins). Use this for requests.
  "refreshToken": "uuid...",    // Long-lived key. Use this to get a new accessToken.
  "user": { ... }               // User details
}
```

### Step 2: Make Authenticated Requests
Add the `accessToken` to the **Authorization header** of every request:
`Authorization: Bearer <your_access_token>`

### Step 3: Handle Token Expiration
If you get a **401 Unauthorized** error, your access token has expired.
1.  Call `POST /auth/refresh` sending the saved `{ refreshToken: "..." }`.
2.  You will get a **new** `accessToken` and a **new** `refreshToken`.
3.  Save both new values and retry your failed request.
4.  *If the refresh call also fails*, log the user out.

---

## �️ Frontend Integration (Simple Example)

Use this logic in your HTTP client (like Axios) to handle the tokens automatically.

```javascript
/* Standard Axios Setup for Auth */

// 1. Attach Token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 2. Handle Expiration (401)
api.interceptors.response.use(
  (response) => response, // Return success
  async (error) => {
    // Check if error is 401 (Unauthorized) and we haven't retried yet
    if (error.response.status === 401 && !error.config._retry) {
      error.config._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post('/auth/refresh', { refreshToken });
        
        // Success! Save new tokens
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        
        // Retry the original request with new token
        error.config.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(error.config);
        
      } catch (refreshErr) {
        // Refresh failed? User session is dead. Logout.
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

## Available Endpoints

### Common (Both Apps)
| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Login** | POST | `/auth/login` | Get tokens. |
| **Refresh** | POST | `/auth/refresh` | Get new tokens. |
| **Logout** | POST | `/auth/logout` | Kill session. |
| **Reset Password** | POST | `/auth/forgot-password` | Request email link. |
| **Set Password** | POST | `/auth/reset-password` | Set new password. |
| **Profile** | GET | `/auth/profile` | Get my details. |
| **Global Search** | GET | `/search` | Search across the system. (Query: `?q=...`) |

### Standardized Pagination & Filters
All "List" endpoints (Users, Matches, News) now support standardized query parameters.

**Pagination Parameters:**
*   `page`: (Number) Page to retrieve (default: `1`).
*   `limit`: (Number) Items per page (default: `10`, max: `100`).
*   `search`: (String) Partial text search across relevant fields.
*   `sortBy`: (String) Field name to sort by (e.g., `createdAt`, `matchDate`).
*   `sortOrder`: (Enum: `asc` | `desc`) Sort direction (default: `desc`).

**Response Format:**
```json
{
  "data": [...], 
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

**Entity-Specific Filters (Pass as Query Params):**
*   **Users**: `role` (ADMIN/USER), `isActive` (boolean).
*   **Matches**: `status` (SCHEDULED/FINISHED/CANCELLED), `competition`, `fromDate`, `toDate`.
*   **News**: `isFeatured` (boolean).

### Web App Specific
| Feature | Endpoint | Description |
| :--- | :--- | :--- |
| **Register** | `POST /auth/register` | Create new regular user account. |
| **MFA** | `GET /auth/mfa/setup` | Setup 2-Factor Auth (Optional). |
| **News List** | `GET /news` | Paginated news with `isFeatured` filter. |
| **Matches List** | `GET /matches` | Paginated matches with status/date filters. |
| **Purchase Ticket**| `POST /tickets/purchase` | Initialize Paysera payment for tickets. |
| **My Tickets** | `GET /tickets/my-tickets` | List current user's purchased tickets. |
| **Payment Status**| `GET /tickets/payment/:id/status`| Check if a payment was successful. |
| **Global Search**| `GET /search` | Public search for matches and news. |

### CRM App Specific
| Feature | Endpoint | Description |
| :--- | :--- | :--- |
| **User Mgmt** | `GET /users` | Paginated users with role/status filters. |
| **User Mgmt** | `DELETE /users/:id` | Ban/Remove a user. |
| **Matches List** | `GET /matches` | Paginated matches with full filtering. |
| **Create Match** | `POST /matches` | Schedule a new match and optionally create news. |
| **Global Search**| `GET /search` | Search across Matches, Players, News, and Users. |
| **Register Admin** | `POST /auth/register` | Create new Admin (Restricted). |
| **Sales Overview**| `GET /analytics/overview` | Overall revenue and ticket stats. |
| **Revenue/Match** | `GET /analytics/revenue/by-match`| Breakdown of income per match. |
| **Trends** | `GET /analytics/trends` | Sales growth over time. |
| **Recent Trx** | `GET /analytics/transactions/recent`| Latest 10-50 payments. |
