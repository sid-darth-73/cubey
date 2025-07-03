import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Signup() {
    const wcaRef = useRef(null);
    const passwordRef = useRef(null);
    const navigate = useNavigate();
    const [error, setError] = useState("");

    async function handleSignUp() {
        const wcaIdOrEmail = wcaRef.current?.value?.trim();
        const password = passwordRef.current?.value;

        if(!wcaIdOrEmail || !password) {
            setError("All fields are required."); return;
        }

        try {
            const res = await fetch("http://localhost:3002/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wcaIdOrEmail, password }),
            });

            const data = await res.json();
            if(!res.ok) {
                setError(data.message || "Signup failed"); return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("shareLink", data.shareLink);
            localStorage.setItem("user", wcaIdOrEmail);
            navigate("/dashboard");
        } catch(err) {
            setError("Network error. Try again.");
        }
    }

    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Enter") handleSignUp();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSignUp();
                }}
                className="bg-slate-800 p-8 w-full max-w-md rounded-2xl shadow-lg flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-center mb-4">Sign Up</h2>

                <div className="flex flex-col gap-1">
                    <label htmlFor="email" className="text-sm font-medium text-slate-200">WCA ID or Email</label>
                    <div className="flex items-center border border-slate-600 rounded-lg h-12 pl-3 focus-within:border-blue-500 transition">
                        <input
                            ref={wcaRef}
                            type="text"
                            placeholder="Enter your WCA ID or Email"
                            className="bg-transparent border-none outline-none text-white px-2 flex-1 h-full"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="password" className="text-sm font-medium text-slate-200">Password</label>
                    <div className="flex items-center border border-slate-600 rounded-lg h-12 pl-3 focus-within:border-blue-500 transition">
                        <input
                            ref={passwordRef}
                            type="password"
                            placeholder="Enter your password"
                            className="bg-transparent border-none outline-none text-white px-2 flex-1 h-full"
                        />
                    </div>
                </div>

                {error && <div className="text-red-400 text-sm mt-1">{error}</div>}

                <button
                    type="submit"
                    className="mt-4 bg-slate-700 hover:bg-slate-600 transition text-white font-medium rounded-lg h-12 w-full cursor-pointer"
                >
                    Sign Up
                </button>

                <p className="text-sm text-center text-slate-300">
                    Already have an account?{" "}
                    <span
                        onClick={() => navigate("/signin")}
                        className="text-blue-400 cursor-pointer hover:underline">
                        Sign in
                    </span>
                </p>
            </form>
        </div>
    );
}
