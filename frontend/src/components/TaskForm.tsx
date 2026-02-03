import { useState } from "react";
import type { TaskStatus } from "../features/tasks/tasksApi";

export type TaskFormValues = {
  title: string;
  description: string;
  status: TaskStatus;
};

export default function TaskForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  disabled,
}: {
  initial: TaskFormValues;
  submitLabel: string;
  onSubmit: (v: TaskFormValues) => void;
  onCancel?: () => void;
  disabled?: boolean;
}) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [status, setStatus] = useState<TaskStatus>(initial.status);

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title, description, status });
      }}
    >
      <div>
        <label className="text-sm text-slate-700">Title</label>
        <input
          className="mt-1 w-full rounded-lg border border-slate-200 p-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={1}
          disabled={disabled}
        />
      </div>

      <div>
        <label className="text-sm text-slate-700">Description</label>
        <textarea
          className="mt-1 w-full rounded-lg border border-slate-200 p-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          disabled={disabled}
        />
      </div>

      <div>
        <label className="text-sm text-slate-700">Status</label>
        <select
          className="mt-1 w-full rounded-lg border border-slate-200 p-2 bg-white"
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
          disabled={disabled}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button
          disabled={disabled}
          className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
            onClick={onCancel}
            disabled={disabled}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
