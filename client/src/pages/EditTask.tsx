import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { TaskCategory, TaskFormValues } from "../types/task";
import { useTasks } from "../hook/useTasks";

// CHANGE: Import the backend API function for saving task edits.
import { updateTask } from "../api/tasks";

const categories: TaskCategory[] = [
  "Work",
  "Personal",
  "Urgent",
  "Important",
];

const EditTask: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // CHANGE: Get tasks and loading/error information from the backend hook.
  const { tasks, loading, error: tasksError, refreshTasks } = useTasks();

  const task = tasks.find((item) => item.id === id);

  const [form, setForm] = useState<TaskFormValues>({
    title: "",
    description: "",
    dueDate: "",
    category: "Personal",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // CHANGE: Populate the form when the requested task has loaded.
  useEffect(() => {
    if (!task) return;

    setForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.slice(0, 10),
      category: task.category,
    });
  }, [task]);

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // CHANGE: Submit edits asynchronously to the backend instead of local state.
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!task) {
      setError("The task could not be found.");
      return;
    }

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.dueDate ||
      !form.category
    ) {
      setError("Please complete every field before saving.");
      return;
    }

    if (form.dueDate < todayString) {
      setError("Due date cannot be in the past.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateTask(
        task.id,
        {
          ...form,
          title: form.title.trim(),
          description: form.description.trim(),
        },
        task.completed
      );

      // CHANGE: Refresh the backend task list after a successful update.
      await refreshTasks();

      navigate("/mytasks");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the task. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // CHANGE: Show loading while the backend task list is being fetched.
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm">
          <p role="status" className="text-gray-600">
            Loading task...
          </p>
        </div>
      </div>
    );
  }

  // CHANGE: Distinguish a loading failure from a task that does not exist.
  if (tasksError) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm">
          <p role="alert" className="text-red-600">
            {tasksError}
          </p>

          <button
            type="button"
            onClick={() => void refreshTasks()}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Try again
          </button>

          <div className="mt-4">
            <Link
              to="/mytasks"
              className="text-blue-600 hover:underline"
            >
              Back to My Tasks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">
            Task not found
          </h1>

          <p className="mt-2 text-gray-600">
            This task may have been deleted or may not exist.
          </p>

          <Link
            to="/mytasks"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Back to My Tasks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link
            to="/mytasks"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to My Tasks
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Edit Task
          </h1>

          <p className="mt-2 text-gray-600">
            Update your task details below.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Task title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your task"
              rows={4}
              required
              className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label
              htmlFor="dueDate"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Due date
            </label>

            <input
              id="dueDate"
              name="dueDate"
              type="date"
              value={form.dueDate}
              min={todayString}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Category
            </label>

            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Link
              to="/mytasks"
              className="rounded-lg border border-gray-300 px-5 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTask;
