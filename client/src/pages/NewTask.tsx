import React, { useEffect, useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { BiEdit } from "react-icons/bi";
import { LuTrash2, LuCircleCheck, LuCircle } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import { useTasks } from "../hook/useTasks";
import type { TaskCategory } from "../types/task";

// CHANGE: Import API functions so task actions use the backend.
import { updateTask, deleteTaskFromApi } from "../api/tasks";

const categories: Array<"All" | TaskCategory> = [
  "All",
  "Work",
  "Personal",
  "Urgent",
  "Important",
];

const statuses = ["All", "Active", "Completed"] as const;

type Status = (typeof statuses)[number];

const MyTasks: React.FC = () => {
  const navigate = useNavigate();

  // CHANGE: Get backend-loaded tasks and loading/error state from the hook.
  const { tasks, loading, error, refreshTasks } = useTasks();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | TaskCategory
  >("All");
  const [selectedStatus, setSelectedStatus] = useState<Status>("All");

  // CHANGE: Debounce the search input before requesting matching tasks.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshTasks(searchTerm);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm, refreshTasks]);

  // Keep the selected category valid if the available categories change.
  useEffect(() => {
    if (!categories.includes(selectedCategory)) {
      setSelectedCategory("All");
    }
  }, [selectedCategory]);

  // CHANGE: The backend handles text search; these filters handle category/status.
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesCategory =
        selectedCategory === "All" || task.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Active" && !task.completed) ||
        (selectedStatus === "Completed" && task.completed);

      return matchesCategory && matchesStatus;
    });
  }, [tasks, selectedCategory, selectedStatus]);

  // CHANGE: Save completion changes through the backend.
  const toggleComplete = async (id: string) => {
    const task = tasks.find((item) => item.id === id);

    if (!task) return;

    try {
      await updateTask(
        task.id,
        {
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          category: task.category,
        },
        !task.completed,
      );

      await refreshTasks(searchTerm);
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Unable to update the task. Please try again.",
      );
    }
  };

  // CHANGE: Delete tasks through the backend instead of only local state.
  const deleteTask = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) return;

    try {
      await deleteTaskFromApi(id);
      await refreshTasks(searchTerm);
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Unable to delete the task. Please try again.",
      );
    }
  };

  const editTask = (id: string) => {
    navigate(`/edittask/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Page heading */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="mt-2 text-gray-600">
              Organize your tasks and keep track of your progress.
            </p>
          </div>

          <Link
            to="/newtask"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <FiPlus size={20} />
            Add New Task
          </Link>
        </div>

        {/* Search and filters */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <label
              htmlFor="task-search"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Search tasks
            </label>

            <input
              id="task-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by title or description..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="task-category"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Filter by category
              </label>

              <select
                id="task-category"
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(
                    event.target.value as "All" | TaskCategory,
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "All" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="task-status"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Filter by status
              </label>

              <select
                id="task-status"
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(event.target.value as Status)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "All" ? "All Statuses" : status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* CHANGE: Show loading and backend errors inside the JSX return. */}
        {loading && (
          <p
            role="status"
            className="mb-4 rounded-lg bg-blue-50 p-4 text-blue-700"
          >
            Loading tasks...
          </p>
        )}

        {error && !loading && (
          <div
            role="alert"
            className="mb-4 rounded-lg bg-red-50 p-4 text-red-700"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() => void refreshTasks(searchTerm)}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Task list */}
        <section className="space-y-5">
          {!loading && !error && filteredTasks.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
              <h2 className="text-lg font-semibold text-gray-800">
                No tasks found
              </h2>

              <p className="mt-2 text-gray-500">
                {searchTerm.trim() ||
                selectedCategory !== "All" ||
                selectedStatus !== "All"
                  ? "Try changing your search or filters."
                  : "You haven't added any tasks yet."}
              </p>

              {!searchTerm.trim() &&
                selectedCategory === "All" &&
                selectedStatus === "All" && (
                  <Link
                    to="/newtask"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
                  >
                    <FiPlus size={18} />
                    Create your first task
                  </Link>
                )}
            </div>
          )}

          {filteredTasks.map((task) => (
            <article
              key={task.id}
              className={`rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6 ${
                task.completed ? "border-green-200" : "border-gray-200"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-1 gap-3">
                  {/* CHANGE: Completion state is saved using the API. */}
                  <button
                    type="button"
                    onClick={() => void toggleComplete(task.id)}
                    aria-label={
                      task.completed
                        ? `Mark ${task.title} as active`
                        : `Mark ${task.title} as completed`
                    }
                    title={
                      task.completed ? "Mark as active" : "Mark as completed"
                    }
                    className="mt-1 shrink-0 text-blue-600 transition hover:text-blue-800"
                  >
                    {task.completed ? (
                      <LuCircleCheck size={24} />
                    ) : (
                      <LuCircle size={24} />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <h2
                      className={`wrap-break-word text-lg font-semibold ${
                        task.completed
                          ? "text-gray-400 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {task.title}
                    </h2>

                    <p
                      className={`mt-2 whitespace-pre-wrap wrap-break-word text-sm ${
                        task.completed ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {task.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          task.category === "Urgent"
                            ? "bg-red-100 text-red-700"
                            : task.category === "Important"
                              ? "bg-orange-100 text-orange-700"
                              : task.category === "Work"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {task.category}
                      </span>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        Due: {task.dueDate}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          task.completed
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {task.completed ? "Completed" : "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Task actions */}
                <div className="flex shrink-0 items-center gap-2 sm:ml-4">
                  <button
                    type="button"
                    onClick={() => editTask(task.id)}
                    aria-label={`Edit ${task.title}`}
                    title="Edit task"
                    className="rounded-lg border border-gray-200 p-2 text-blue-600 transition hover:bg-blue-50"
                  >
                    <BiEdit size={20} />
                  </button>

                  {/* CHANGE: Deletion now removes the task from the database. */}
                  <button
                    type="button"
                    onClick={() => void deleteTask(task.id)}
                    aria-label={`Delete ${task.title}`}
                    title="Delete task"
                    className="rounded-lg border border-gray-200 p-2 text-red-600 transition hover:bg-red-50"
                  >
                    <LuTrash2 size={20} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Task count */}
        {!loading && !error && filteredTasks.length > 0 && (
          <p className="mt-6 text-sm text-gray-500">
            Showing {filteredTasks.length}{" "}
            {filteredTasks.length === 1 ? "task" : "tasks"}
          </p>
        )}
      </div>
    </div>
  );
};

export default MyTasks;
