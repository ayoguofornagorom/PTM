import { Router } from "express";
import { Task } from "../models/Task.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const categories = ["Work", "Personal", "Urgent", "Important"];

const isValidDueDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !Number.isNaN(date.getTime()) && date >= today;
};

const validateTask = ({ title, description, dueDate, category }) => {
  if (!title?.trim() || !description?.trim() || !dueDate || !category) {
    return "Title, description, due date and category are required.";
  }

  if (!categories.includes(category)) {
    return "Category must be Work, Personal, Urgent or Important.";
  }

  if (!isValidDueDate(dueDate)) {
    return "Due date must be today or a future date in YYYY-MM-DD format.";
  }

  return null;
};




router.use(requireAuth);



/*
  Get tasks belonging to the logged-in user.
  If a search word is provided, search task titles and descriptions.
*/
router.get("/", async (req, res, next) => {
  try {
    // Only search tasks owned by the logged-in user.
    const filter = { user: req.user.id };

    // Read the search word from the URL.
    const search = String(req.query.search || "").trim();

    if (search) {
      // Treat special characters as normal text in the search.
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      // Search in the title or description, ignoring letter case.
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
      ];
    }

    // Get matching tasks, ordered by due date.
    const tasks = await Task.find(filter).sort({
      dueDate: 1,
      createdAt: -1,
    });

    // Return the matching tasks.
    return res.json(tasks);
  } catch (error) {
    next(error);
  }
});



router.post("/", async (req, res) => {
  try {
    const validationError = validateTask(req.body);
    if (validationError) return res.status(400).json({ message: validationError });

    const task = await Task.create({
      user: req.user.id,
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      dueDate: req.body.dueDate,
      category: req.body.category,
      completed: Boolean(req.body.completed),
    });

    return res.status(201).json({ task });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to create task." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });

    if (!task) return res.status(404).json({ message: "Task not found." });

    return res.json({ task });
  } catch {
    return res.status(400).json({ message: "Invalid task id." });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const validationError = validateTask(req.body);
    if (validationError) return res.status(400).json({ message: validationError });

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      {
        title: req.body.title.trim(),
        description: req.body.description.trim(),
        dueDate: req.body.dueDate,
        category: req.body.category,
        completed: Boolean(req.body.completed),
      },
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ message: "Task not found." });

    return res.json({ task });
  } catch {
    return res.status(400).json({ message: "Invalid task id or task data." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!task) return res.status(404).json({ message: "Task not found." });

    return res.json({ message: "Task deleted successfully." });
  } catch {
    return res.status(400).json({ message: "Invalid task id." });
  }
});

export default router;
