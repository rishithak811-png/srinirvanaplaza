# Sri Nirvana Plaza - Room Service Order Management System

Welcome to the **Room Service Order Management System** for **SRI NIRVANA PLAZA**. This application is a fully integrated, full-stack working prototype designed as part of the internship curriculum requirements.

The system allows hotel guests to place service and dining requests from their rooms, hotel staff to assign and manage requests, and managers/admin to monitor analytics, view system logs, and download reports.

---

## 🛠️ Technology Stack

- **Frontend**: React + Vite + Tailwind CSS (v3) + Lucide Icons
- **Backend**: Node.js + Express
- **Database**: Dual Driver Engine
  - **MySQL**: Standard target production database (configured via `.env`)
  - **SQLite**: Automatic local fallback file (`database.sqlite`) to enable instant setup and execution without manual database configuration.
- **Testing**: Built-in Node.js Assert unit testing suite

---

## 📁 Folder Structure

```
/Room Service Managememt
  ├── database/
  │     ├── schema.sql           # MySQL Table definitions
  │     └── seed.sql             # SQL Demo seed data
  ├── backend/
  │     ├── config/
  │     │     └── db.js          # DB connector & SQLite Migrator/Seeder
  │     ├── routes/
  │     │     ├── orders.js      # CRUD, assignment, status workflow rules
  │     │     └── dashboard.js   # Analytics stats & export reports
  │     ├── utils/
  │     │     └── validators.js  # Reusable inputs & workflow validations
  │     ├── tests/
  │     │     └── api.test.js    # Node.js Unit Validation tests
  │     ├── server.js            # Express server entry point
  │     └── .env                 # Configurations (Port, DB credentials)
  ├── frontend/
  │     ├── src/
  │     │     ├── components/
  │     │     │     ├── RoleSelector.jsx   # Role Switching Header bar
  │     │     │     ├── GuestForm.jsx      # Guest Order Request form
  │     │     │     ├── OrderTimeline.jsx  # Order Tracking Progress timeline
  │     │     │     ├── StaffDashboard.jsx # Staff assignments & status updates
  │     │     │     └── AdminDashboard.jsx # Analytics metrics, SVGs, CSV export
  │     │     ├── App.jsx          # Root view state coordinator
  │     │     ├── main.jsx
  │     │     ├── index.css        # Fonts, Tailwind directives & glass utilities
  │     │     └── App.css
  │     ├── tailwind.config.js
  │     ├── postcss.config.js
  │     └── vite.config.js
  ├── docs/
  │     └── api_documentation.md   # API route details, payloads, and codes
  └── README.md                    # Setup and run guide (this file)
```

---

## ⚙️ Setup and Installation

### 1. Prerequisites
- **Node.js**: Version 18.x or above (Includes built-in test runners)
- **NPM**: Standard package manager (Installed with Node.js)

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment file `.env` (it has been created automatically with defaults):
   ```env
   PORT=5001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=room_service
   ```
4. **Database Mode Info**:
   - If MySQL is running on `localhost:3306` with matching `.env` credentials, the backend will automatically create the `room_service` database, compile the tables (`database/schema.sql`), and seed them (`database/seed.sql`).
   - If MySQL is not running or not configured, the backend will **automatically fallback to SQLite**, creating a `database.sqlite` file in the backend folder, setting up the tables, and seeding them. No manual database setup is required!
5. Start the backend server:
   ```bash
   npm start
   ```
   *The API will start listening at: `http://localhost:5001`*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The website will open locally at: `http://localhost:5173`*

---

## 🧪 Running Validation Tests

We have created a validation test suite checking input schemas, room formats, and legal status transitions.
To execute tests:
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Run the test command:
   ```bash
   node tests/api.test.js
   ```

---

## 👑 Features and Simulated Role Workflows

The header contains a **Role Switcher** dropdown to toggle views inside the prototype:

1. **Guest Portal**:
   - Submit service requests (pre-defined items or custom inputs) with category icons (Food, Housekeeping, Laundry, Maintenance, Other).
   - Enter Room Number (digits only) and Mobile.
   - Click "Submit" to immediately see the request linked in the **Order Timeline** tracker on the right side.
   - Track order progress through `Pending` $\rightarrow$ `Accepted` $\rightarrow$ `Preparing` $\rightarrow$ `Out for Delivery` $\rightarrow$ `Delivered` $\rightarrow$ `Closed` in real-time.

2. **Staff Panel**:
   - Filter request items by room number, status, search string, or date.
   - Assign active staff members (Jane Smith, John Doe, etc.) to orders.
   - Update statuses progressively (e.g. Accept order, Start preparing, Delivery dispatch).
   - Reject illegal status jumps (e.g. cannot transition directly from `Pending` to `Delivered`).
   - View order history logs and notification logs on selecting details.

3. **Manager Board**:
   - Monitor aggregate cards showing total orders, pending counts, active preparation, and completions.
   - View average fulfillment durations in minutes calculated automatically.
   - Explore interactive SVG charts: Bar Chart (Category distribution) and Area Graph (Daily load trends).
   - Read system activity audit logs.
   - Click **Export CSV Report** to download the clean data log as a spreadsheet file directly in your browser.

---

## 📖 Operational Scenarios & Examples

To see how the React UI views, REST APIs, and database drivers operate end-to-end under real hotel service scenarios, check the [Operational Scenarios & Examples Guide](file:///c:/Users/RISHITHA.K/OneDrive/Desktop/Room%20Service%20Managememt/docs/operational_examples.md). It outlines step-by-step payloads, database transitions, and workflows for dining orders, out-of-stock cancellations, SLA alerts/pacifications, housekeeping tasks, and shift handovers.

