import React, { useState } from "react";
import { FaChevronLeft } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import type { TaskCategory, TaskFormValues } from "../types/task";
import { useTasks } from "../hook/useTasks";

const categories: TaskCategory[] = ["Work", "Personal", "Urgent", "Important"];

const NewTask: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, setTasks } = useTasks();
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState<TaskFormValues>({
    title: "",
    description: "",
    dueDate: "",
    category: "Work",
  });
  const [error, setError] = useState("");

 
  const updateField = (field: keyof TaskFormValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim() || !form.dueDate || !form.category) {
      setError("Please complete every field before continuing.");
      return;
    }

    if (form.dueDate < today) {
      setError("Due date cannot be in the past.");
      return;
    }

    setTasks([
      ...tasks,
      {
        ...form,
        id: crypto.randomUUID(),
        title: form.title.trim(),
        description: form.description.trim(),
        completed: false,
      },
    ]);
    navigate("/mytasks");
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 md:px-10">
      <div className="mb-10 flex items-center gap-5">
        <Link to="/mytasks" aria-label="Back to tasks" className="rounded-full p-2 hover:bg-purple-50">
          <FaChevronLeft className="text-2xl text-[#292929]" />
        </Link>
        <h1 className="text-4xl font-medium text-[#292929] md:text-[50px]">New Task</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        <div>
          <label htmlFor="taskTitle" className="mb-2 block text-lg font-medium text-[#555]">Task Title *</label>
          <input
            id="taskTitle"
            required
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="E.g. Project Defense, Assignment..."
            className="w-full rounded-md border border-[#B8B6B6] px-5 py-4 text-lg outline-none focus:border-[#974FD0] focus:ring-2 focus:ring-purple-100"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block text-lg font-medium text-[#555]">Description *</label>
          <textarea
            id="description"
            required
            rows={7}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Briefly describe your task..."
            className="w-full resize-none rounded-md border border-[#B8B6B6] px-5 py-4 text-lg outline-none focus:border-[#974FD0] focus:ring-2 focus:ring-purple-100"
          />
        </div>

        <div>
          <label htmlFor="dueDate" className="mb-2 block text-lg font-medium text-[#555]">Due Date *</label>
          <input
            id="dueDate"
            type="date"
            required
            min={today}
            value={form.dueDate}
            onChange={(e) => updateField("dueDate", e.target.value)}
            className="w-full rounded-md border border-[#B8B6B6] px-5 py-4 text-lg outline-none focus:border-[#974FD0] focus:ring-2 focus:ring-purple-100"
          />
        </div>

        <fieldset>
          <legend className="mb-3 text-lg font-medium text-[#555]">Category *</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <label
                key={category}
                className={`flex cursor-pointer items-center gap-3 rounded-md border p-4 text-lg transition ${
                  form.category === category ? "border-[#974FD0] bg-purple-50 text-[#6B3399]" : "border-[#B8B6B6]"
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  required
                  value={category}
                  checked={form.category === category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="h-5 w-5 accent-purple-600"
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm text-[#737171]">Selected: <strong>{form.category}</strong></p>
        </fieldset>

        {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-red-700">{error}</p>}

        <button type="submit" className="w-full rounded-lg bg-[#974FD0] py-4 text-xl font-semibold text-white hover:bg-[#6B3399]">
          Create Task
        </button>
      </form>
    </main>
  );
};

export default NewTask;
