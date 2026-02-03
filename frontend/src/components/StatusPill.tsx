import type { TaskStatus } from "../features/tasks/tasksApi";

const map: Record<TaskStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  in_progress: { label: "In progress", className: "bg-blue-50 text-blue-700 border-blue-200" },
  done: { label: "Done", className: "bg-green-50 text-green-700 border-green-200" },
};

export default function StatusPill({ status }: { status: TaskStatus }) {
  const s = map[status];
  console.log({ status, s });
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${s.className}`}>
      {s.label}
    </span>
  );
}
