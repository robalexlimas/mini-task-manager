import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../features/auth/authSlice";
import {
    createTask,
    fetchTasks,
    setFilterStatus,
    updateTask,
} from "../features/tasks/tasksSlice";
import type { Task, TaskStatus } from "../features/tasks/tasksApi";
import StatusPill from "../components/StatusPill";
import TaskForm, { type TaskFormValues } from "../components/TaskForm";

function toTaskFormValues(t?: Task): TaskFormValues {
    return {
        title: t?.title ?? "",
        description: t?.description ?? "",
        status: (t?.status ?? "pending") as TaskStatus,
    };
}

export default function TasksPage() {
    const dispatch = useAppDispatch();
    const { list, status, error, filterStatus } = useAppSelector((s) => s.tasks);
    const auth = useAppSelector((s) => s.auth);

    const [showCreate, setShowCreate] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        const s = filterStatus === "all" ? undefined : (filterStatus as TaskStatus);
        dispatch(fetchTasks({ status: s }));
    }, [dispatch, filterStatus]);

    const filtered = useMemo(() => list, [list]);

    async function handleCreate(v: TaskFormValues) {
        const payload = {
            title: v.title,
            description: v.description,
            status: v.status,
        };
        const r = await dispatch(createTask(payload));
        if (createTask.fulfilled.match(r)) setShowCreate(false);
    }

    async function handleUpdate(id: number, v: TaskFormValues) {
        const payload = {
            title: v.title,
            description: v.description,
            status: v.status,
        };
        const r = await dispatch(updateTask({ id, input: payload }));
        if (updateTask.fulfilled.match(r)) setEditingId(null);
    }

    async function quickStatus(id: number, status: TaskStatus) {
        await dispatch(updateTask({ id, input: { status } }));
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-4xl mx-auto space-y-4">
                <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900">Tasks</h1>
                        <p className="text-sm text-slate-500">
                            Logged in as: {auth.user?.email || "unknown"}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium"
                            onClick={() => setShowCreate((v) => !v)}
                        >
                            {showCreate ? "Close" : "New task"}
                        </button>
                        <button
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
                            onClick={() => dispatch(logout())}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Create */}
                {showCreate && (
                    <div className="bg-white rounded-2xl shadow p-6">
                        <h2 className="font-medium text-slate-900">Create task</h2>
                        <div className="mt-4">
                            <TaskForm
                                initial={toTaskFormValues()}
                                submitLabel="Create"
                                onSubmit={handleCreate}
                            />
                        </div>
                    </div>
                )}

                {/* Filter */}
                <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-700">Filter:</span>
                        <select
                            className="rounded-lg border border-slate-200 p-2 bg-white text-sm"
                            value={filterStatus}
                            onChange={(e) =>
                                dispatch(setFilterStatus(e.target.value as any))
                            }
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In progress</option>
                            <option value="done">Done</option>
                        </select>
                    </div>

                    <div className="text-sm text-slate-500">
                        {status === "loading" ? "Loading..." : `${filtered.length} task(s)`}
                    </div>
                </div>

                {/* Errors */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">
                        {error}
                    </div>
                )}

                {/* List */}
                <div className="space-y-3">
                    {filtered.map((t) => (
                        <div key={t.id} className="bg-white rounded-2xl shadow p-6">
                            {editingId === t.id ? (
                                <>
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium text-slate-900">Edit task #{t.id}</h3>
                                        <button
                                            className="text-sm text-slate-600 hover:text-slate-900"
                                            onClick={() => setEditingId(null)}
                                        >
                                            Close
                                        </button>
                                    </div>
                                    <div className="mt-4">
                                        <TaskForm
                                            initial={toTaskFormValues(t)}
                                            submitLabel="Save"
                                            onSubmit={(v) => handleUpdate(t.id, v)}
                                            onCancel={() => setEditingId(null)}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium text-slate-900 truncate">
                                                    {t.title}
                                                </h3>
                                                <StatusPill status={t.status} />
                                            </div>
                                            {t.description && (
                                                <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">
                                                    {t.description}
                                                </p>
                                            )}
                                            <p className="text-xs text-slate-400 mt-3">
                                                Updated: {t.updated_at}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <button
                                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                                                onClick={() => setEditingId(t.id)}
                                            >
                                                Edit
                                            </button>

                                            <div className="flex gap-2">
                                                <button
                                                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-slate-50"
                                                    onClick={() => quickStatus(t.id, "pending")}
                                                >
                                                    Pending
                                                </button>
                                                <button
                                                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-slate-50"
                                                    onClick={() => quickStatus(t.id, "in_progress")}
                                                >
                                                    In progress
                                                </button>
                                                <button
                                                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-slate-50"
                                                    onClick={() => quickStatus(t.id, "done")}
                                                >
                                                    Done
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}

                    {filtered.length === 0 && status !== "loading" && (
                        <div className="bg-white rounded-2xl shadow p-10 text-center text-slate-500">
                            No tasks yet. Create your first one.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
