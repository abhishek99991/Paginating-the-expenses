const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./expenses.sqlite",
  logging: false,
});

const Expense = sequelize.define("Expense", {
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

app.get("/expenses", async (req, res) => {
  try {
    const parsedPage = Number.parseInt(req.query.page, 10);
    const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Expense.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));
    res.json({
      expenses: rows,
      currentPage: page,
      totalExpenses: count,
      totalPages,
    });
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
});

app.post("/expenses", async (req, res) => {
  try {
    const description =
      typeof req.body.description === "string" ? req.body.description.trim() : "";
    const amount = Number(req.body.amount);

    if (!description || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Please provide a description and an amount greater than zero.",
      });
    }

    const expense = await Expense.create({ description, amount });
    res.status(201).json(expense);
  } catch (error) {
    console.error("Failed to create expense:", error);
    res.status(500).json({ message: "Failed to create expense" });
  }
});

app.delete("/expenses/:id", async (req, res) => {
  try {
    const deleted = await Expense.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Failed to delete expense:", error);
    res.status(500).json({ message: "Failed to delete expense" });
  }
});

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const existingCount = await Expense.count();

    // Add demo data on first run so pagination can be tested immediately.
    if (existingCount === 0) {
      const demoExpenses = Array.from({ length: 25 }, (_, index) => ({
        description: [
          "Groceries", "Fuel", "Lunch", "Internet bill", "Office supplies",
          "Taxi", "Electricity bill", "Coffee", "Train ticket", "Medicine"
        ][index % 10] + ` #${index + 1}`,
        amount: Number((150 + index * 37.5).toFixed(2)),
      }));
      await Expense.bulkCreate(demoExpenses);
      console.log("Added 25 demo expenses.");
    }

    app.listen(PORT, () => {
      console.log(`Expense API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
}

start();
app.get("/", (req, res) => {
  res.send("Expense API is running!");
});