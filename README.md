# SmartPesa

SmartPesa is a personal finance and M-Pesa spending tracker built with React and Vite. The application helps users monitor daily expenses, set monthly budgets by category, review spending trends, and manage a simple profile and account flow. It is designed for a demo environment and is paired with a backend API for authentication, budgets, transactions, and user profile data.

## Overview

SmartPesa is built to help people keep their money in check by combining a clean dashboard, category-based budgeting, spending analysis, and transaction history. It focuses on the Kenyan mobile money context, where M-Pesa is a daily payment tool, and offers a polished way to track how money moves in and out of a user's account.

The frontend is the presentation layer. It communicates with a backend service for persistent user data and business logic, while retaining lightweight browser-based preferences such as categories and display currency for a smoother experience.

## Key Features

- User authentication and registration
  - Login and register flows using `/api/auth/login` and `/api/auth/register`
  - Protected routes with a guarded application layout
- Dashboard summary cards
  - Total monthly budget
  - Total spent so far
  - Remaining balance
  - Progress indicator showing how much of the month’s budget has been consumed
- Transaction management
  - Add transactions with title, amount, type, and optional category assignment
  - Supported transaction types include Paybill, Till Number, Send Money, Airtime, Withdrawal, and Other
  - Search and filter by title, payment code, and category
  - Delete existing transactions from the history list
- Budget planning
  - Create monthly budgets by category
  - Set a limit in KES and monitor usage vs. limit
  - Warning states for near-limit and over-budget categories
  - Delete budgets without losing historical transaction records
- Spending analysis
  - View total expenses across all records
  - Review category breakdown and biggest spending areas
  - See current month totals and budget usage
- Settings and customization
  - Manage profile details (name, email, phone number)
  - Add and remove transaction categories
  - Change the default display currency
  - Reset application preference data to defaults
- M-Pesa demo flow
  - “Pay with M-Pesa” modal for demo transactions
  - Demo messaging clarifies that the app runs in a sandbox-style setup and does not send real money

## Tech Stack

- React 19
- Vite 8
- React Router 7
- JavaScript (ES modules)
- CSS for responsive UI design
- Backend API integration via Fetch

## Project Structure

```text
.
├── README.md
├── LICENSE
├── index.html
├── package.json
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── main.jsx
│   ├── components/
│   │   ├── Loading.jsx
│   │   ├── MpesaModal.jsx
│   │   ├── Navbar.jsx
│   │   ├── RequireAuth.jsx
│   │   └── Toast.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── AnalysisPage.jsx
│   │   ├── BudgetPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── TransactionsPage.jsx
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   └── money.js
│   ├── config.js
│   └── assets/
│       └── images and icons
└── vite.config.js
```

## Requirements

Before running the app, make sure you have:

- Node.js 18+
- npm or another package manager compatible with the project
- A working backend service exposing the SmartPesa API endpoints

## Environment Variables

The frontend expects the backend base URL via the `VITE_API_URL` environment variable.

Example:

```bash
VITE_API_URL=http://localhost:5000
```

The backend should expose routes such as:

- `/api/auth/login`
- `/api/auth/register`
- `/api/users/profile`
- `/api/transactions`
- `/api/budgets`
- `/api/dashboard`

If the variable is not set, the app will not be able to talk to the backend.

## Installation

1. Clone the repository
2. Navigate to the project folder
3. Install dependencies:

```bash
npm install
```

## Running the Application

Start the Vite development server:

```bash
npm run dev
```

Then open the local URL displayed in the terminal, usually:

```text
http://localhost:5173
```

## Production Build

Create a production bundle:

```bash
npm run build
```

Preview the built app locally:

```bash
npm run preview
```

## Application Workflow

### 1. Sign in or create an account
Users land on the login screen and can either sign in or register a new account. Protected routes redirect unauthenticated users back to the login page.

### 2. Review the dashboard
The home screen provides a summary of monthly spend, remaining budget, and a quick look at recent transactions.

### 3. Record transactions
Users can log each transaction by entering a description, amount, transaction type, and budget category when relevant.

### 4. Set budgets
The budget page allows users to add monthly spending limits for different categories. Budgets are compared against actual spend so users can quickly see which categories are over or near their limit.

### 5. Analyze trends
The analysis page groups expenditures by category and highlights the month’s overall budget performance. This helps users identify the areas where they spend the most.

### 6. Adjust settings
The settings page supports profile updates, category management, default currency selection, and resetting the app defaults.

## Backend Integration Notes

SmartPesa is designed to work with a backend service rather than relying only on browser storage. The frontend uses Fetch calls through `src/services/api.js` and expects JSON responses from the API layer.

This architecture supports:

- secure backend-side user management
- persistent transaction and budget records
- profile updates and user-specific account data
- future integration with a real M-Pesa or Daraja backend flow

## M-Pesa and Demo Safety

This project is a financial tracking interface and a demonstration client. The “Pay with M-Pesa” flow is not a production payment integration and does not trigger real-money transactions. It is intended for sandbox-style testing and UI demonstration.

A real production M-Pesa integration should be implemented on a secure backend and must:

- keep credentials and access tokens on the server
- validate callbacks on the backend
- use secure HTTPS endpoints
- enforce user authentication and authorization
- follow Safaricom Daraja requirements for OAuth and callback URLs

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the build and verify they work as expected
5. Submit a pull request with a clear summary

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for the full text.
