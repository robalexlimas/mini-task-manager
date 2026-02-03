import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { register } from "../features/auth/authSlice";

export default function RegisterPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { status, error } = useAppSelector((s) => s.auth);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const result = await dispatch(register({ email, password }));
        if (register.fulfilled.match(result)) navigate("/tasks");
    }

    return (
        <AuthLayout>
            <h2 className="text-lg font-medium text-slate-900">Create account</h2>

            <form onSubmit={onSubmit} className="mt-4 space-y-3">
                <div>
                    <label className="text-sm text-slate-700">Email</label>
                    <input
                        className="mt-1 w-full rounded-lg border border-slate-200 p-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        required
                    />
                </div>

                <div>
                    <label className="text-sm text-slate-700">Password</label>
                    <input
                        className="mt-1 w-full rounded-lg border border-slate-200 p-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        minLength={6}
                        required
                    />
                </div>

                {error && <div className="text-sm text-red-600">{error}</div>}

                <button
                    disabled={status === "loading"}
                    className="w-full rounded-lg bg-slate-900 text-white py-2 font-medium disabled:opacity-50"
                >
                    {status === "loading" ? "Creating..." : "Register"}
                </button>
            </form>

            <p className="mt-4 text-sm text-slate-600">
                Already have an account?{" "}
                <Link className="text-slate-900 font-medium" to="/login">
                    Login
                </Link>
            </p>
        </AuthLayout>
    );
}
