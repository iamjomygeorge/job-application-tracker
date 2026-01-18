# Job Application Tracker

<div align="justify">

## 🚀 Tech Stack

- **Frontend:** Next.js (React)
- **Backend:** Node.js (Express.js)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Email + Password)
- **Styling:** Tailwind CSS

## 🔒 Security & JWT Implementation

Authentication is handled via **Supabase Auth**.

1.  **Token Exchange:** The frontend sends the Supabase JWT in the `Authorization` header (`Bearer <token>`).
2.  **Verification:** The backend (`authMiddleware.js`) extracts this token and verifies it directly with Supabase's `auth.getUser(token)` method.
3.  **User Scoping:** The decoded `user.id` is attached to `req.user` and used in all SQL queries to ensure users can only access their own data (preventing IDOR).

## 🗄️ Database Schema

**Table:** `job_applications`

| Column         | Type        | Constraints | Description                            |
| :------------- | :---------- | :---------- | :------------------------------------- |
| `id`           | `uuid`      | Primary Key | Unique ID                              |
| `user_id`      | `uuid`      | Foreign Key | References Auth User (RLS)             |
| `company`      | `text`      | Not Null    | Company Name                           |
| `role`         | `text`      | Not Null    | Job Position                           |
| `status`       | `text`      | Enum        | Applied / Interview / Offer / Rejected |
| `applied_date` | `date`      | Nullable    | Date of application                    |
| `notes`        | `text`      | Nullable    | User notes                             |
| `job_link`     | `text`      | Nullable    | URL to job post                        |
| `created_at`   | `timestamp` | Default Now | Creation time                          |

## 🧪 Testing with Postman

You can easily test the API endpoints using Postman.

### Prerequisites

1. **Login first:** You need a valid JWT token.
   - Sign up/Login on the frontend (`http://localhost:3000`).
   - Open your browser's Developer Tools (F12) -> Application -> Local Storage.
   - Copy the value of `sb-[project-id]-auth-token` (specifically the `access_token` string inside the JSON).

### 1. Get All Applications (GET)

- **Method:** `GET`
- **URL:** `http://localhost:8080/api/applications`
- **Headers:**
  - Key: `Authorization`, Value: `Bearer <PASTE_YOUR_TOKEN_HERE>`

### 2. Add a New Application (POST)

- **Method:** `POST`
- **URL:** `http://localhost:8080/api/applications`
- **Headers:**
  - Key: `Authorization`, Value: `Bearer <PASTE_YOUR_TOKEN_HERE>`
  - Key: `Content-Type`, Value: `application/json`
- **Body:** Select **raw** and **JSON**, then paste:
  ```json
  {
    "company": "Google",
    "role": "Software Engineer",
    "status": "Applied",
    "job_link": "https://example.com"
  }
  ```

You can easily test the API endpoints using Postman.

### Prerequisites

1. **Login first:** You need a valid JWT token.
   - Sign up/Login on the frontend (`http://localhost:3000`).
   - Open your browser's Developer Tools (F12) -> Application -> Local Storage.
   - Copy the `sb-[project-id]-auth-token` (specifically the `access_token` string inside the JSON).

### 1. Get All Applications (GET)

- **Method:** `GET`
- **URL:** `http://localhost:8080/api/applications`
- **Headers:**
  - Key: `Authorization`, Value: `Bearer <PASTE_YOUR_TOKEN_HERE>`

### 2. Add a New Application (POST)

- **Method:** `POST`
- **URL:** `http://localhost:8080/api/applications`
- **Headers:**
  - Key: `Authorization`, Value: `Bearer <PASTE_YOUR_TOKEN_HERE>`
  - Key: `Content-Type`, Value: `application/json`
- **Body:** Select **raw** and **JSON**, then paste:
  ```json
  {
    "company": "Google",
    "role": "Software Engineer",
    "status": "Applied",
    "job_link": "[https://google.com/careers](https://google.com/careers)"
  }
  ```

## 🛠️ Setup & Installation

Follow these steps to run the mini web app.

### 1. Prerequisites

- Node.js installed
- A Supabase project created

### 2. Installation

Install dependencies for both client and server from the root directory:

```bash
npm install
```

### 3. Configuration

#### Backend (`server/.env`)

Create a `.env` file in the `server` directory and add your configurations and Supabase credentials (see .env.example).

#### Frontend (`client/.env`)

Create a `.env` file in the `client` directory and add your configurations and Supabase credentials (see .env.example).

### 4. Database Setup

Run database migrations to create the table:

```bash
npm run migrate:up --workspace=server
```

### 5. Running the Application

Start both the client and server concurrently from the root:

```bash
npm run dev
```

- **Frontend:** `http://localhost:3000`
- **Backend :** `http://localhost:8080`

### 6. Production Build

To run the application in production mode:

1.  Build the frontend:

    ```bash
    npm run build
    ```

2.  Start the application (Client & Server):
    ```bash
    npm run start
    ```
    - **Frontend:** `http://localhost:3000`
    - **Backend :** `http://localhost:8080`

---

## 🔑 Environment Variables

### Client (`client/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-SUPABASE-ANON-KEY]
```

### Server (`server/.env`)

```env
PORT=8080
CLIENT_URL=http://localhost:3000
DATABASE_URL=postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=[YOUR-SUPABASE-ANON-KEY]
```

</div>
