# Job Application Tracker

## 🚀 Tech Stack

- **Frontend:** Next.js (React)
- **Backend:** Node.js (Express.js)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Email + Password)
- **Styling:** Tailwind CSS

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
