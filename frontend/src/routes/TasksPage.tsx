import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../features/auth/authSlice";

export default function TasksPage() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((s) => s.auth.user);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">Tasks</h1>
                    <p className="text-sm text-slate-500">
                        Logged in as: {user?.email || "unknown"}
                    </p>
                </div>

                <button
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                    onClick={() => dispatch(logout())}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
