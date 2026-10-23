import { useCallback, useEffect, useState } from "react";
import "./App.css";
const API_URL = "http://localhost:3000/expenses";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadExpenses = useCallback(async (page = currentPage) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}?page=${page}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load expenses.");
      setExpenses(data.expenses);
      setCurrentPage(data.currentPage);
      setTotalPages(Math.max(1, data.totalPages));
      setTotalExpenses(data.totalExpenses);
    } catch (err) {
      setError(`${err.message} Make sure the backend is running on port 3000.`);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadExpenses(currentPage);
  }, [currentPage, loadExpenses]);

  async function addExpense(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, amount }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to add expense.");
      setDescription("");
      setAmount("");
      const newTotalPages = Math.max(1, Math.ceil((totalExpenses + 1) / 10));
      setNotice("Expense added successfully.");
      setCurrentPage(newTotalPages);
      if (newTotalPages === currentPage) await loadExpenses(newTotalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteExpense(id) {
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to delete expense.");
      setNotice("Expense deleted.");
      const nextTotal = Math.max(0, totalExpenses - 1);
      const nextPage = Math.min(currentPage, Math.max(1, Math.ceil(nextTotal / 10)));
      if (nextPage === currentPage) await loadExpenses(nextPage);
      else setCurrentPage(nextPage);
    } catch (err) {
      setError(err.message);
    }
  }

  const firstItem = totalExpenses === 0 ? 0 : (currentPage - 1) * 10 + 1;
  const lastItem = Math.min(currentPage * 10, totalExpenses);

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">PERSONAL FINANCE</p>
          <h1>Expense Report</h1>
          <p className="subtitle">Keep track of your spending, one page at a time.</p>
        </div>
        <div className="total-pill">
          <span className="total-number">{totalExpenses}</span>
          <span>Total expenses</span>
        </div>
      </header>

      <section className="add-panel">
        <h2>Add an expense</h2>
        <form className="expense-form" onSubmit={addExpense}>
          <label>
            Description
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="e.g. Groceries"
              required
              maxLength={120}
            />
          </label>
          <label>
            Amount (₹)
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              type="number"
              min="0.01"
              step="0.01"
              placeholder="500"
              required
            />
          </label>
          <button className="primary-button add-button" type="submit" disabled={saving}>
            {saving ? "Adding..." : "Add expense"}
          </button>
        </form>
      </section>

      <section className="list-panel">
        <div className="list-heading">
          <div>
            <h2>All expenses</h2>
            <p className="muted">
              {totalExpenses ? `Showing ${firstItem}–${lastItem} of ${totalExpenses}` : "No expenses yet"}
            </p>
          </div>
          <span className="page-indicator">Page {currentPage} of {totalPages}</span>
        </div>

        {error && <div className="message error-message" role="alert">{error}</div>}
        {notice && !error && <div className="message success-message" role="status">{notice}</div>}

        {loading ? (
          <div className="empty-state">Loading expenses…</div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">No expenses found. Add your first expense above.</div>
        ) : (
          <div className="expense-list">
            {expenses.map((expense) => (
              <article className="expense-row" key={expense.id}>
                <div className="expense-icon" aria-hidden="true">₹</div>
                <div className="expense-description">
                  <strong>{expense.description}</strong>
                  <span>Expense #{expense.id}</span>
                </div>
                <strong className="expense-amount">
                  {Number(expense.amount).toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 2,
                  })}
                </strong>
                <button
                  className="delete-button"
                  onClick={() => deleteExpense(expense.id)}
                  type="button"
                  aria-label={`Delete ${expense.description}`}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}

        <nav className="pagination" aria-label="Expense pages">
          <button
            className="secondary-button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1 || loading}
          >
            ← Previous
          </button>
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .reduce((result, page, index, pages) => {
                if (index > 0 && page - pages[index - 1] > 1) result.push("ellipsis-" + page);
                result.push(page);
                return result;
              }, [])
              .map((item) =>
                typeof item === "string" ? (
                  <span className="ellipsis" key={item}>…</span>
                ) : (
                  <button
                    key={item}
                    className={`page-button ${item === currentPage ? "active" : ""}`}
                    onClick={() => setCurrentPage(item)}
                    disabled={loading}
                    aria-current={item === currentPage ? "page" : undefined}
                  >
                    {item}
                  </button>
                ))}
          </div>
          <button
            className="primary-button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage >= totalPages || loading}
          >
            Next →
          </button>
        </nav>
        <p className="pagination-note">10 expenses per page · Last page: {totalPages}</p>
      </section>
      <footer>Expense Report Demo · React + Node.js + Sequelize</footer>
    </main>
  );
}