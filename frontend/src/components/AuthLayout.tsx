import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
                <h1 className="text-xl font-semibold text-slate-900">Mini Task Manager</h1>
                <p className="text-sm text-slate-500 mt-1">Authentication</p>
                <div className="mt-6">{children}</div>
            </div>
        </div>
    );
}
