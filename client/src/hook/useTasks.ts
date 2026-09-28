import { useEffect, useState } from "react";
import type { Task } from "../types/task";

const STORAGE_KEY = "taskduty.tasks";


export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  return { tasks, setTasks };
};
