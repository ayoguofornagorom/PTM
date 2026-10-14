import React, { useEffect, useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { BiEdit } from "react-icons/bi";
import { LuTrash2, LuCircleCheck, LuCircle } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import { useTasks } from "../hook/useTasks";
import type { TaskCategory } from "../types/task";

// CHANGE: Import only the API functions used by this page.
import { updateTask, deleteTaskFromApi } from "../api/tasks";

// List of categories users can choose from when filtering tasks.
const categories: Array<"All" | TaskCategory> = [
  "All",
  "Work",
  "Personal",
  "Urgent",
  "Important",
];

// List of completion statuses users can choose from.
const statuses = ["All", "Active", "Completed"] as const;

const MyTasks: React.FC = () => {
  const navigate = useNavigate();

  // CHANGE: Read tasks and loading/error state from the shared hook.
  const { tasks, loading, error, refreshTasks } = useTasks();

  // Store the search text entered by the user.
  const [searchTerm, setSearchTerm] = useState("");

  // Store the selected category and completion filters.
  const [categoryFilter, setCategoryFilter] =
    useState<(typeof categories)[number]>("All");

  const [statusFilter, setStatusFilter] =
    useState<(typeof statuses)[number]>("All");

  // CHANGE: Search MongoDB whenever the search text changes.
  // A short delay prevents sending a request for every keystroke.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshTasks(searchTerm);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchTerm, refreshTasks]);

  // CHANGE: Keep the category filter valid when tasks change.
  useEffect(() => {
    if (categoryFilter !== "All" && !categories.includes(categoryFilter)) {
      setCategoryFilter("All");
    }
  }, [tasks, categoryFilter]);

  // CHANGE: Category and status filtering remain on the frontend.
  // The text search itself is now handled by the backend.
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesCategory =
        categoryFilter === "All" || task.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Completed" ? task.completed : !task.completed);

      return matchesCategory && matchesStatus;
    });
  }, [tasks, categoryFilter, statusFilter]);

  // CHANGE: Save completion changes to MongoDB.
  const toggleComplete = async (id: string) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    try {
      await updateTask(
        id,
        {
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          category: task.category,
        },
        !task.completed,
      );

      // Reload the list after the backend confirms the update.
      await refreshTasks(searchTerm);
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Unable to update task.",
      );
    }
  };

  // CHANGE: Delete from MongoDB before refreshing the displayed list.
  const deleteTask = async (id: string) => {
    try {
      await deleteTaskFromApi(id);
      await refreshTasks(searchTerm);
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Unable to delete task.",
      );
    }
  };

  // Keep the existing edit-page navigation.
  const editTask = (id: string) => navigate(`/edittask/${id}`);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10">
      {/* Page heading, number of matching tasks, and Add Task link. */}{" "}
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        {" "}
        <div>
          {" "}
          <h1 className="text-4xl font-medium text-[#292929] md:text-[50px]">
            My Tasks{" "}
          </h1>
          {/* Show how many tasks match the search and filters. */}
          <p className="mt-1 text-[#737171]">
            {filteredTasks.length} task
            {filteredTasks.length === 1 ? "" : "s"} shown
          </p>
        </div>
        <Link
          to="/newtask"
          className="flex w-fit items-center gap-3 text-lg font-medium text-[#974FD0] hover:text-[#6B3399]"
        >
          <FiPlus className="h-6 w-6" />
          Add New Task
        </Link>
      </div>
      {/* Search and filter controls. */}
      <section className="mb-8 grid gap-4 rounded-xl border border-[#E1DFE2] bg-white p-5 md:grid-cols-3">
        {/* Search input: users can search by title or description. */}
        <div>
          <label
            htmlFor="taskSearch"
            className="mb-2 block text-sm font-medium text-[#555]"
          >
            Search tasks
          </label>

          <input
            id="taskSearch"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full rounded-md border border-[#B8B6B6] px-4 py-3 outline-none focus:border-[#974FD0]"
          />
        </div>

        {/* Category filter: show tasks from the selected category. */}
        <div>
          <label
            htmlFor="categoryFilter"
            className="mb-2 block text-sm font-medium text-[#555]"
          >
            Filter by category
          </label>

          <select
            id="categoryFilter"
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as typeof categoryFilter)
            }
            className="w-full rounded-md border border-[#B8B6B6] px-4 py-3 outline-none focus:border-[#974FD0]"
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Completion filter: show active or completed tasks. */}
        <div>
          <label
            htmlFor="statusFilter"
            className="mb-2 block text-sm font-medium text-[#555]"
          >
            Filter by completion
          </label>

          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            className="w-full rounded-md border border-[#B8B6B6] px-4 py-3 outline-none focus:border-[#974FD0]"
          >
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
      </section>
      {/* Display matching tasks, or a message if nothing matches. */}
      <section className="space-y-5">
        {error ? (
          <p role="alert" className="rounded-md bg-red-50 p-3 text-red-700">
            {error}
          </p>
        ) : loading ? (
          <p role="status" className="text-center text-[#737171]">
            Loading tasks...
          </p>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#B8B6B6] p-12 text-center text-[#737171]">
            No tasks match your search or selected filters.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <article
              key={task.id}
              className={`rounded-xl border p-5 shadow-sm transition ${
                task.completed
                  ? "border-green-200 bg-green-50/40"
                  : "border-[#E1DFE2] bg-white"
              }`}
            >
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    {/* Click the circle to change the task's completion status. */}
                    <button
                      type="button"
                      onClick={() => toggleComplete(task.id)}
                      aria-label={
                        task.completed
                          ? "Mark task incomplete"
                          : "Mark task complete"
                      }
                      title={
                        task.completed ? "Mark incomplete" : "Mark complete"
                      }
                      className="mt-1 shrink-0 rounded-full text-3xl text-[#974FD0] hover:scale-105"
                    >
                      {task.completed ? <LuCircleCheck /> : <LuCircle />}
                    </button>

                    <div className="text-left">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        {/* Use different badge colors for task categories. */}
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            task.category === "Urgent"
                              ? "bg-red-100 text-red-700"
                              : task.category === "Important"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-purple-100 text-[#6B3399]"
                          }`}
                        >
                          {task.category}
                        </span>

                        <span className="text-sm text-[#737171]">
                          Due {task.dueDate}
                        </span>
                      </div>

                      {/* Show the task title and description. */}
                      <h2
                        className={`text-2xl font-medium text-[#292929] ${
                          task.completed ? "line-through opacity-60" : ""
                        }`}
                      >
                        {task.title}
                      </h2>

                      <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-[#737171]">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  {/* Buttons for editing and deleting a task. */}
                  <div className="flex shrink-0 gap-3 md:pt-1">
                    <button
                      type="button"
                      onClick={() => editTask(task.id)}
                      className="flex items-center gap-2 rounded-lg bg-[#974FD0] px-4 py-2 text-white hover:bg-[#6B3399]"
                    >
                      <BiEdit /> Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="flex items-center gap-2 rounded-lg border border-[#974FD0] px-4 py-2 text-[#974FD0] hover:bg-purple-50"
                    >
                      <LuTrash2 /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
};

export default MyTasks;
