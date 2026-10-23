# Expense Report Pagination

A working starter project with:
- React + Vite frontend
- Node.js + Express backend
- Sequelize + SQLite database
- Server-side pagination (10 expenses per page)
- Current page, total pages, and total expense count
- Add and delete expense functionality
- 25 demo expenses created automatically on the first run

## Requirements
- Node.js 18 or newer
- npm

## Run the project

Open a terminal in the project root and run:

```bash
npm install
npm install --prefix client
npm run dev
```

This starts:
- Backend API: http://localhost:3000
- React frontend: http://localhost:5173

Open the frontend URL in your browser.

## API endpoints

- `GET /expenses?page=1` — get one page of expenses
- `POST /expenses` — add an expense, JSON body: `{ "description": "Groceries", "amount": 500 }`
- `DELETE /expenses/:id` — delete an expense

The GET response contains `expenses`, `currentPage`, `totalExpenses`, and `totalPages`.

## Database

SQLite is used for a simple local setup. The `expenses.sqlite` file is created automatically. On the first run, 25 demo expenses are inserted so you can test pagination immediately.

## If the app does not start

1. Check that Node.js is installed with `node -v`.
2. Run `npm install` in the root folder.
3. Run `npm install --prefix client`.
4. Start with `npm run dev`.
5. If port 3000 is already in use, stop the other process or change `PORT` in `server.js`.

This is a standalone demo starter. If you already have an expense app/database, adapt the pagination route and frontend to your existing model and field names rather than replacing your existing project blindly.
