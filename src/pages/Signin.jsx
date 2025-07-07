import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthButton } from "../components/ui/AuthButton";
export function Signin() {
    const wcaRef = useRef(null);
    const passwordRef = useRef(null);
    const navigate = useNavigate();
    const [error, setError] = useState("");

    async function handleSignIn() {
        const wcaIdOrEmail = wcaRef.current?.value?.trim();
        const password = passwordRef.current?.value;

        if(!wcaIdOrEmail || !password) {
            setError("All fields are required."); return;
        }

        try {
            const res = await fetch("https://api-cubey.onrender.com/auth/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wcaIdOrEmail, password }),
            });

            const data = await res.json();
            if(!res.ok) {
                setError(data.message || "Invalid credentials"); return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("shareLink", data.shareLink);
            localStorage.setItem("user", wcaIdOrEmail);
            navigate("/dashboard");
        } catch (err) {
            setError("Network error. Try again.");
        }
    }

    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Enter") handleSignIn();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-gray-900 text-white px-4">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSignIn();
                }}
                className="bg-slate-800 p-6 md:p-8 w-full max-w-md rounded-2xl shadow-xl border border-slate-600 backdrop-blur-sm flex flex-col gap-5" >
                <h2 className="text-3xl font-bold text-center font-quick text-blue-400 animate-pulse mb-2">
                    Welcome Back to Cubey
                </h2>

                <div className="flex flex-col gap-1">
                    <label htmlFor="email" className="text-sm font-mont font-medium text-slate-200">WCA ID or Email</label>
                    <div className="flex items-center border border-slate-600 rounded-lg h-12 pl-3 focus-within:border-blue-500 transition-all">
                        <input ref={wcaRef} type="text" placeholder="Enter your WCA ID or Email" className="bg-transparent font-mont border-none outline-none text-white px-2 flex-1 h-full"/>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="password" className="text-sm font-mont font-medium text-slate-200">Password</label>
                    <div className="flex items-center border border-slate-600 rounded-lg h-12 pl-3 focus-within:border-blue-500 transition-all">
                        <input ref={passwordRef} type="password" placeholder="Enter your password" className="bg-transparent font-mont border-none outline-none text-white px-2 flex-1 h-full"/>
                    </div>
                </div>

                {error && <div className="text-red-400 text-sm mt-1">{error}</div>}

                <AuthButton onClick={handleSignIn} text="Sign In" />
                
                <p className="text-sm text-center text-slate-300">
                    Don't have an account?{" "}
                    <span onClick={() => navigate("/signup")} className="text-blue-400 cursor-pointer hover:underline">
                        Sign up
                    </span>
                </p>
            </form>
        </div>
    );
}
