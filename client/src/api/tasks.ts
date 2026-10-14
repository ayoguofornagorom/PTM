import type { Task, TaskFormValues } from "../types/task";

// Keep the backend API address in one place.
const API_BASE_URL = "http://localhost:3000/api";

// CHANGE: Describe the task format returned by MongoDB.
interface BackendTask {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  category: Task["category"];
  completed: boolean;
}

// CHANGE: Convert MongoDB's _id into the id expected by the frontend.
export function mapBackendTask(task: BackendTask): Task {
  return {
    id: task._id,
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    category: task.category,
    completed: task.completed,
  };
}

// CHANGE: Reuse the same authenticated request logic for API calls.
async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("ptm_token");

  if (!token) {
    throw new Error(
      "Authentication token not found. Please log in through Postman and set ptm_token for local testing.",
    );
  }
  console.log({ token });

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options?.headers || {}), //spreading allows Authorization to override it safely
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  // CHANGE: Show the backend's error message when a request fails.
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || "The request failed.");
  }

  return response.json() as Promise<T>;
}

// CHANGE: Create a task in MongoDB.
export async function createTask(values: TaskFormValues): Promise<Task> {
  const result = await apiRequest<{ task: BackendTask }>("/tasks", {
    method: "POST",
    body: JSON.stringify({
      ...values,
      completed: false,
    }),
  });

  return mapBackendTask(result.task);
}

// CHANGE: Update an existing MongoDB task.
// Send all required fields because the backend validates the full task.
export async function updateTask(
  id: string,
  values: TaskFormValues,
  completed: boolean,
): Promise<Task> {
  const result = await apiRequest<{ task: BackendTask }>(
    `/tasks/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        ...values,
        completed,
      }),
    },
  );

  return mapBackendTask(result.task);
}

// CHANGE: Fetch tasks, optionally filtering them on the backend.
export async function fetchTasks(search = ""): Promise<Task[]> {
  const query = new URLSearchParams();

  if (search.trim()) {
    query.set("search", search.trim());
  }

  const suffix = query.toString();
  const result = await apiRequest<BackendTask[]>(
    `/tasks${suffix ? `?${suffix}` : ""}`,
  );

  return result.map(mapBackendTask);
}

// CHANGE: Delete a task from MongoDB.
export async function deleteTaskFromApi(id: string): Promise<void> {
  await apiRequest<{ message: string }>(`/tasks/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
