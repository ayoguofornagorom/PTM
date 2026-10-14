import { useCallback, useEffect, useState } from "react";
import type { Task } from "../types/task";
import { fetchTasks } from "../api/tasks";

// CHANGE: Stop using localStorage as the main source of task data.
// MongoDB, accessed through the backend API, will now be the source.
export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // CHANGE: Load tasks from MongoDB through the backend API.
  const refreshTasks = useCallback(async (search = "") => {
    try {
      setLoading(true);
      setError("");

      const backendTasks = await fetchTasks(search);

      // CHANGE: Store the backend results in React state.
      setTasks(backendTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  // CHANGE: Load tasks when the component using this hook first appears.
  useEffect(() => {
    void refreshTasks();
  }, [refreshTasks]);

  // CHANGE: Expose refreshTasks so pages can reload tasks after changes.
  return {
    tasks,
    setTasks,
    loading,
    error,
    refreshTasks,
  };
};
