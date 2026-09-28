export type TaskCategory = "Work" | "Personal" | "Urgent" | "Important";

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  category: TaskCategory;
  completed: boolean;
}

export type TaskFormValues = Omit<Task, "id" | "completed">;
