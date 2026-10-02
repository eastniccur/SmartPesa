# SmartPesa

## Overview

SmartPesa is a modern, dark-themed React application for recording and reviewing everyday expenses. It presents spending summaries, category budgets, transaction history, and basic spending analysis in a responsive interface.

The app currently runs entirely in the browser and stores transactions, budgets, categories, and currency preferences in `localStorage`. It is a client-side demonstration, not a live connection to an M-Pesa account.

## Key Features

- **Manual expense logging:** Add a transaction with a title, positive amount, transaction type, and category. Amounts are validated as positive KES values with up to two decimal places.
- **Transaction types:** Paybill, Till Number, Send Money, and Airtime.
- **Dynamic categories:** Create and remove categories in Settings; the available categories are used by the transaction form.
- **Live search and filtering:** Search transaction titles, receipt numbers, and categories while optionally filtering by a selected category.
- **Idempotent demo sync:** Merge sample statement records without duplicating entries by `id` or `receiptNo`, including duplicates within an incoming batch.
- **Spending dashboard and analysis:** Review budget and spending totals, recent activity, monthly expenses, and category-level totals.
- **Persistent browser data:** Transactions, budgets, categories, and currency preferences are saved in browser storage.
- **Responsive and accessible interface:** CSS Grid layouts adapt to smaller screens. Forms, tables, status messages, screen-reader text, ARIA roles, and visible keyboard focus styles support accessible use.

## Tech Stack

| Area | Technology |
| --- | --- |
| UI | React 19 |
| Development server and build | Vite 8 |
| Routing | React Router 7 |
| Styling | CSS with shared design tokens and responsive layouts |
| Tests | Node.js native test runner (`node:test`) |

## Folder Structure

```text
.
├── index.html
├── package.json
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── App.jsx                  # Routes and shared app state
    ├── App.css                  # App-level styles
    ├── index.css                # Global styles and design tokens
    ├── main.jsx                 # React entry point
    ├── assets/                  # Images and static assets
    ├── components/
    │   └── Navbar.jsx           # Primary navigation
    ├── data/
    │   └── mockData.js          # Initial transactions and budgets
    ├── lib/
    │   ├── transactions.js      # Validation, filtering, and demo sync helpers
    │   └── transactions.test.js # Native Node.js unit tests
    └── pages/
        ├── HomePage.jsx
        ├── TransactionsPage.jsx
        ├── TransactionsPage.css
        ├── BudgetPage.jsx
        ├── AnalysisPage.jsx
        └── SettingsPage.jsx
```

## Getting Started

### Requirements

- Node.js with npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite in your browser. The server supports hot module replacement while you edit the app.

### Run the tests

Run the transaction unit tests directly with Node's built-in test runner:

```bash
node --test src/lib/transactions.test.js
```

Or use the project's npm script, which runs the same test file:

```bash
npm test
```

### Build for production

```bash
npm run build
```

The production bundle is written to `dist/`. To preview the built app locally:

```bash
npm run preview
```

## Architecture and M-Pesa Integration

Transaction behavior is organized in the client-side service module `src/lib/transactions.js`. It contains helpers for validating manual entries, filtering transactions, and merging incoming records. The `mockSyncTransactions` export supplies fixed sample transactions for the **Sync M-Pesa Statement** UI action; it is deliberately a demonstration and does not contact Safaricom or retrieve a user's statement. Repeating the sync is idempotent because existing transaction IDs and receipt numbers are checked before records are added.

The application state is managed in React and persisted to `localStorage`. This is convenient for a local demonstration, but it is not a secure or multi-user persistence layer.

### What a live Daraja integration requires

A production M-Pesa Daraja integration must use a secure, publicly reachable backend proxy rather than calling Daraja directly from the browser. The backend should:

1. Keep OAuth client credentials and access-token handling on the server, never in frontend code or browser storage.
2. Make authenticated Daraja API requests on behalf of the application and return only the necessary data to the client.
3. Expose a secure, publicly reachable callback endpoint and configure its URL as the Daraja `CallBackURL` for relevant requests.
4. Validate and process Safaricom webhook callbacks server-side, with appropriate verification, error handling, and persistence.
5. Apply authorization, input validation, and operational logging before exposing transaction data to users.

Using a backend avoids browser CORS restrictions and prevents secret exposure. The current mock service can serve as the UI-facing boundary to replace or connect to a real backend, but it does not implement OAuth, callback handling, or live statement retrieval.
