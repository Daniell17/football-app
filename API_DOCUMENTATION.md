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

### Web App Specific
| Feature | Endpoint | Description |
| :--- | :--- | :--- |
| **Register** | `POST /auth/register` | Create new regular user account. |
| **MFA** | `GET /auth/mfa/setup` | Setup 2-Factor Auth (Optional). |

### CRM App Specific
| Feature | Endpoint | Description |
| :--- | :--- | :--- |
| **User Mgmt** | `GET /users` | List all users in system. |
| **User Mgmt** | `DELETE /users/:id` | Ban/Remove a user. |
| **Register Admin** | `POST /auth/register` | Create new Admin (Restricted). |
